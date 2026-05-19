const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Document = require('../models/Document');
const AuditLog = require('../models/AuditLog');
const { verifyDocument } = require('../services/verificationService');
const { generateErrorResponse } = require('../utils/generateVerificationResponse');

/**
 * @desc    Get document metadata by Seal ID
 * @route   GET /api/document/:sealId
 * @access  Public
 */
exports.getDocumentMetadata = asyncHandler(async (req, res) => {
  const { sealId } = req.params;

  if (!sealId) {
    return res.status(400).json(generateErrorResponse("Seal ID is required"));
  }

  const document = await Document.findOne({ sealId });

  if (!document) {
    return res.status(404).json(generateErrorResponse("Document not found"));
  }

  res.status(200).json({
    issuedTo: document.issuedTo,
    issuedBy: document.issuedBy ? document.issuedBy.name || document.issuedBy : "System",
    issueDate: document.issueDate || document.createdAt,
    sealId: document.sealId,
    documentType: document.documentType || "Document",
    hashAlgorithm: document.hashAlgorithm || "SHA-256"
  });
});

/**
 * @desc    Compare uploaded payload against stored document
 * @route   POST /api/verify/compare
 * @access  Public
 */
exports.verifyDocumentCompare = asyncHandler(async (req, res) => {
  const { sealId, documentHash, ocrText, fields, pHash } = req.body;

  if (!sealId) {
    return res.status(400).json(generateErrorResponse("Seal ID is required"));
  }

  if (!documentHash && !pHash) {
    return res.status(400).json(generateErrorResponse("Malformed payload: Missing cryptographic hash"));
  }

  // ocrText is optional — digital PDFs are verified via SHA-256 hash directly,
  // OCR is only supplementary for scanned/image documents.
  // We allow empty ocrText as long as a hash is present.

  const document = await Document.findOne({ sealId });

  if (!document) {
    return res.status(404).json(generateErrorResponse("Document not found"));
  }

  // Use the verification service to perform the comparison
  const payload = { documentHash, ocrText, fields, pHash };
  const verificationResult = verifyDocument(document, payload);

  // Log the verification attempt in AuditLog
  await AuditLog.create({
    action: 'VERIFY',
    sealId: document.sealId,
    result: verificationResult.result, // Must match schema enum: GREEN, YELLOW, RED
    ipAddress: req.ip || req.connection.remoteAddress
  });

  // Return formatted response with sealId and timestamp
  res.status(200).json({
    ...verificationResult,
    sealId: document.sealId,
    timestamp: new Date().toISOString()
  });
});
