/**
 * Determines the final RED/YELLOW/GREEN state of the verification.
 */
const determineVerificationState = ({
  isExactHashMatch,
  overallConfidence,
  ocrSimilarity,
  hashAlgorithm,
  hashSimilarity,
  pHashSimilarity
}) => {
  let result = 'RED';
  let message = 'Document verification failed. Significant discrepancies found.';
  let reasons = [];

  if (isExactHashMatch) {
    result = 'GREEN';
    message = 'Document verified successfully. Cryptographic hash match confirmed.';
    return { result, message, reasons };
  }

  if (overallConfidence >= 85) {
    result = 'GREEN';
    message = 'Document verified successfully via high semantic correlation.';
  } else if (overallConfidence >= 65 || ocrSimilarity >= 70) {
    result = 'YELLOW';
    message = 'Document partially verified. Minor discrepancies or layout changes detected.';
    if (hashAlgorithm === 'SHA-256' && !isExactHashMatch) {
      reasons.push('Cryptographic hash mismatch. Document content is not bit-for-bit identical.');
    }
    if (hashAlgorithm === 'pHash' && pHashSimilarity < 100) {
      reasons.push('Minor visual layout or image structure differences detected.');
    }
    if (ocrSimilarity !== undefined && ocrSimilarity < 100) {
      reasons.push('Minor textual discrepancies detected. Some words or formatting may differ.');
    }
    if (reasons.length === 0) {
       reasons.push('Overall confidence is slightly reduced due to minor differences.');
    }
  } else {
    if (hashAlgorithm === 'SHA-256' && !isExactHashMatch) {
      reasons.push('Cryptographic hash mismatch. Document content has been altered.');
    }
    if (hashAlgorithm === 'pHash' && pHashSimilarity < 85) {
      reasons.push('Visual layout or image structure altered (perceptual hash mismatch).');
    }
    if (ocrSimilarity !== undefined && ocrSimilarity < 70) {
      reasons.push('Significant textual discrepancies detected. Content may have been rewritten or edited.');
    }
    if (reasons.length === 0) {
       reasons.push('Overall confidence score is below the acceptable threshold for verification.');
    }
  }

  return { result, message, reasons };
};

module.exports = {
  determineVerificationState
};
