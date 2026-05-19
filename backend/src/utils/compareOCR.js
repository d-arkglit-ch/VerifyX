const { normalizeText } = require('./normalizeText');

/**
 * Compares two OCR text blocks and returns a fuzzy similarity score.
 */
const compareOCR = (storedText, uploadedText) => {
  if (!storedText || !uploadedText) return { similarity: 0 };
  
  const s1 = normalizeText(storedText);
  const s2 = normalizeText(uploadedText);
  
  if (s1 === s2) return { similarity: 100 };
  
  const words1 = new Set(s1.split(' ').filter(w => w.length > 0));
  const words2 = new Set(s2.split(' ').filter(w => w.length > 0));
  
  if (words1.size === 0 && words2.size === 0) return { similarity: 100 };
  if (words1.size === 0 || words2.size === 0) return { similarity: 0 };

  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  const similarity = Math.round((intersection.size / union.size) * 100);
  
  return { similarity };
};

module.exports = {
  compareOCR
};
