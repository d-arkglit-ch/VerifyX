const { Document, AuditLog } = require('../models');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const generateSealId = require('../utils/generateSealId');
const generateQRCode = require('../utils/generateQRCode');

/**
 * sealDocument
 * Saves the document hash, OCR text, and fields to MongoDB.
 */
const sealDocument = asyncHandler(async (req, res) => {
  const { documentHash, hashAlgorithm, issuedTo, documentType, ocrText, fields } = req.body;

  if (!documentHash || !hashAlgorithm || !issuedTo || !documentType) {
    throw new ApiError(400, 'Missing required fields for sealing');
  }

  const doc = await Document.create({
    sealId: '',
    documentHash,
    hashAlgorithm,
    issuedTo,
    issuedBy: req.user.organization || req.user.name || 'DocuTrust Issuer',
    documentType,
    ocrText: ocrText || '',
    fields: fields || {},
    createdBy: req.user.id
  });

  // Log in AuditLog
  await AuditLog.create({
    action: 'ISSUE',
    sealId: '',
    userId: req.user.id,
    result: 'SUCCESS',
    ipAddress: req.ip || req.headers['x-forwarded-for'] || '',
    userAgent: req.headers['user-agent'] || ''
  });

  res.status(201).json({
    success: true,
    message: 'Document hash and extracted fields successfully sealed in database',
    data: {
      sealId: doc.sealId,
      documentHash: doc.documentHash,
      hashAlgorithm: doc.hashAlgorithm,
      issuedTo: doc.issuedTo,
      issuedBy: doc.issuedBy,
      documentType: doc.documentType,
      ocrText: doc.ocrText,
      fields: doc.fields,
      createdAt: doc.createdAt
    }
  });
});

/**
 * verifyDocument
 * Checks the submitted document's hash against the database seal.
 */
const verifyDocument = asyncHandler(async (req, res) => {
  const { sealId, documentHash } = req.body;

  if (!documentHash) {
    throw new ApiError(400, 'Missing documentHash for verification');
  }

  // Find document by sealId if provided, otherwise find by hash
  const query = (sealId && sealId.trim()) ? { sealId } : { documentHash };
  const doc = await Document.findOne(query);

  if (!doc) {
    // Audit failed verification
    await AuditLog.create({
      action: 'VERIFY',
      sealId: sealId || '',
      userId: req.user ? req.user.id : null,
      result: 'RED',
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '',
      userAgent: req.headers['user-agent'] || ''
    });

    return res.status(200).json({
      success: true,
      status: 'RED',
      message: 'No document found matching this lookup query. Invalid or counterfeit document.',
      confidence: 0
    });
  }

  // Compare hashes
  let isMatch = false;
  let confidence = 0;

  if (doc.hashAlgorithm === 'SHA-256') {
    // Strict match
    isMatch = doc.documentHash.toLowerCase() === documentHash.toLowerCase();
    confidence = isMatch ? 100 : 0;
  } else if (doc.hashAlgorithm === 'pHash') {
    // Perceptual similarity comparison (Hamming distance)
    // pHash is hex-encoded 64-bit string (16 hex chars)
    const h1 = doc.documentHash;
    const h2 = documentHash;

    if (h1.length === h2.length) {
      let distance = 0;
      for (let i = 0; i < h1.length; i++) {
        const val1 = parseInt(h1[i], 16);
        const val2 = parseInt(h2[i], 16);
        // XOR them and count set bits
        let xor = val1 ^ val2;
        while (xor > 0) {
          if (xor & 1) distance++;
          xor >>= 1;
        }
      }
      // Max bits is 64
      const similarity = (64 - distance) / 64;
      confidence = Math.round(similarity * 100);
      isMatch = confidence >= 85; // 85% similarity threshold for pHash
    } else {
      isMatch = h1 === h2;
      confidence = isMatch ? 100 : 0;
    }
  }

  const status = isMatch ? 'GREEN' : 'RED';

  // Increment verification count
  doc.verificationCount += 1;
  await doc.save();

  // Log verification event
  await AuditLog.create({
    action: 'VERIFY',
    sealId,
    userId: req.user ? req.user.id : null,
    result: status,
    ipAddress: req.ip || req.headers['x-forwarded-for'] || '',
    userAgent: req.headers['user-agent'] || ''
  });

  res.status(200).json({
    success: true,
    status,
    message: isMatch
      ? 'Verification successful. Document is authentic and unmodified.'
      : 'Document content mismatch detected. Document has been modified or tampered.',
    confidence,
    data: {
      sealId: doc.sealId,
      issuedTo: doc.issuedTo,
      issuedBy: doc.issuedBy,
      issueDate: doc.issueDate,
      documentType: doc.documentType,
      verificationCount: doc.verificationCount,
      ocrText: doc.ocrText,
      fields: doc.fields
    }
  });
});

/**
 * issueDocument
 * Accepts frontend-processed verification proofs (hash, OCR, fields) and
 * generates a Seal ID + QR code. Does NOT receive or process raw files.
 */
const issueDocument = asyncHandler(async (req, res) => {
  const {
    documentHash,
    hashAlgorithm,
    issuedTo,
    issuedBy,
    issueDate,
    documentType,
    ocrText,
    fields
  } = req.body;

  // 1. Validate required proof fields
  if (!documentHash || !hashAlgorithm || !issuedTo || !issuedBy || !issueDate) {
    throw new ApiError(400, 'Missing required fields: documentHash, hashAlgorithm, issuedTo, issuedBy, issueDate');
  }

  // 2. Check for duplicate by semantic hash
  const existingDocument = await Document.findOne({ documentHash });

  if (existingDocument) {
    return res.status(200).json({
      success: true,
      alreadyExists: true,
      message: 'Document already sealed with this hash',
      sealId: existingDocument.sealId,
      qrCode: existingDocument.qrCode
    });
  }

  // 3. Generate unique Seal ID
  const sealId = await generateSealId();

  // 4. Generate QR code pointing to frontend verification page
  const qrUrl = `http://localhost:5173/verify/${sealId}`;
  const qrCode = await generateQRCode(qrUrl);

  // 5. Store verification proofs — NOT the raw file
  const doc = await Document.create({
    sealId,
    documentHash,
    hashAlgorithm,
    issuedTo,
    issuedBy,
    issueDate,
    documentType: documentType || 'Certificate',
    ocrText: ocrText || '',
    fields: fields || {},
    qrCode,
    createdBy: req.user.id
  });

  // 6. Audit log
  await AuditLog.create({
    action: 'ISSUE',
    sealId: doc.sealId,
    userId: req.user.id,
    result: 'SUCCESS',
    ipAddress: req.ip || req.headers['x-forwarded-for'] || ''
  });

  res.status(201).json({
    success: true,
    sealId: doc.sealId,
    qrCode: doc.qrCode,
    metadata: {
      sealId: doc.sealId,
      issuedTo: doc.issuedTo,
      issuedBy: doc.issuedBy,
      issueDate: doc.issueDate,
      documentType: doc.documentType,
      hashAlgorithm: doc.hashAlgorithm,
      createdAt: doc.createdAt
    }
  });
});

/**
 * getHistory
 * Retrieves recent document issuance history for the logged-in user.
 */
const getHistory = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 10;
  const docs = await Document.find({ createdBy: req.user.id })
    .sort({ createdAt: -1 })
    .limit(limit);

  res.status(200).json({
    success: true,
    data: docs
  });
});

module.exports = {
  sealDocument,
  verifyDocument,
  issueDocument,
  getHistory
};
