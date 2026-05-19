const { generateVerificationResponse } = require('../utils/generateVerificationResponse');
const { compareOCR } = require('../utils/compareOCR');
const { compareFields } = require('../utils/compareFields');
const { calculateConfidence } = require('../utils/calculateConfidence');
const { determineVerificationState } = require('../utils/determineVerificationState');

// Hamming distance for pHash (64-bit hex strings)
const calculatePHashSimilarity = (hash1, hash2) => {
  if (!hash1 || !hash2 || hash1.length !== hash2.length) return 0;
  
  let distance = 0;
  for (let i = 0; i < hash1.length; i++) {
    const b1 = parseInt(hash1[i], 16);
    const b2 = parseInt(hash2[i], 16);
    let diff = b1 ^ b2;
    while (diff > 0) {
      distance += diff & 1;
      diff >>= 1;
    }
  }
  
  const similarity = ((64 - distance) / 64) * 100;
  return Math.round(similarity);
};

const verifyDocument = (storedDoc, payload) => {
  let isExactHashMatch = false;
  let hashSimilarity = 0;
  let pHashSimilarity = 0;
  
  if (storedDoc.hashAlgorithm === 'SHA-256' && payload.documentHash) {
    isExactHashMatch = storedDoc.documentHash.toLowerCase() === payload.documentHash.toLowerCase();
    hashSimilarity = isExactHashMatch ? 100 : 0;
  } else if (storedDoc.hashAlgorithm === 'pHash' && payload.pHash) {
    pHashSimilarity = calculatePHashSimilarity(storedDoc.documentHash, payload.pHash);
    hashSimilarity = pHashSimilarity;
    isExactHashMatch = pHashSimilarity >= 90; 
  }

  // 1. OCR Similarity
  const { similarity: ocrSimilarity } = compareOCR(storedDoc.ocrText, payload.ocrText);
  
  // 2. Field Comparison
  const fieldResult = compareFields(storedDoc.fields, payload.fields);

  // 3. Confidence Calculation
  const { overallConfidence } = calculateConfidence({
    hashSimilarity,
    ocrSimilarity,
    fieldSimilarity: fieldResult.fieldSimilarity,
    pHashSimilarity,
    isExactHashMatch
  });

  // 4. Verification State Engine
  const { result, message } = determineVerificationState({
    isExactHashMatch,
    overallConfidence,
    criticalMismatch: fieldResult.criticalMismatch,
    ocrSimilarity,
    fieldSimilarity: fieldResult.fieldSimilarity
  });

  // 5. Final output format
  return {
    result,
    message,
    confidence: {
      overall: overallConfidence,
      ocr: ocrSimilarity,
      field: fieldResult.fieldSimilarity
    },
    fieldComparison: fieldResult,
    ocrComparison: { similarity: ocrSimilarity }
  };
};

module.exports = {
  verifyDocument,
  calculatePHashSimilarity
};
