/**
 * Utility to normalize text for comparison.
 * Removes extra whitespace, converts to lowercase, and strips non-alphanumeric characters.
 */
const normalizeText = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^\w\s]/gi, '') // Remove non-alphanumeric
    .replace(/\s+/g, ' ')     // Compress whitespace
    .trim();
};

module.exports = {
  normalizeText
};
