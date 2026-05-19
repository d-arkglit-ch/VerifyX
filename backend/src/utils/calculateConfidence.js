/**
 * Calculates overall confidence score based on various weighted signals.
 */
const calculateConfidence = ({
  hashSimilarity = 0,
  ocrSimilarity = 0,
  fieldSimilarity = 0,
  pHashSimilarity = 0,
  isExactHashMatch = false
}) => {
  if (isExactHashMatch) {
    return { overallConfidence: 100 };
  }

  // Weight distributions
  const WEIGHTS = {
    hash: 0.40,      // Semantic Hash / pHash (Highest)
    field: 0.35,     // Field Similarity (High)
    ocr: 0.25        // OCR Similarity (Medium)
  };

  // Determine the primary hash score to use
  const primaryHashScore = Math.max(hashSimilarity, pHashSimilarity);

  const overallConfidence = Math.round(
    (primaryHashScore * WEIGHTS.hash) +
    (fieldSimilarity * WEIGHTS.field) +
    (ocrSimilarity * WEIGHTS.ocr)
  );

  return { overallConfidence };
};

module.exports = {
  calculateConfidence
};
