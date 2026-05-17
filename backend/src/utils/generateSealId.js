/**
 * generateSealId
 * Generates a unique Seal ID in the format VRX-XXXXXX
 * @returns {string} The generated Seal ID
 */
const generateSealId = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomPart = '';
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomPart += characters[randomIndex];
  }
  return `VRX-${randomPart}`;
};

module.exports = generateSealId;
