const Document = require('../models/Document');

/**
 * generateSealId
 * Generates a unique Seal ID in the format:
 * VRX-XXXXXX or DOC-XXXXXX
 */

const generateSealId = async () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  let sealId;
  let exists = true;

  // Keep generating until unique ID is found
  while (exists) {

    let randomPart = '';

    for (let i = 0; i < 6; i++) {

      const randomIndex = Math.floor(
        Math.random() * characters.length
      );

      randomPart += characters[randomIndex];
    }

    sealId = `DOC-${randomPart}`;

    // Check MongoDB for duplicate Seal ID
    const existingDocument = await Document.findOne({ sealId });

    exists = !!existingDocument;
  }

  return sealId;
};

module.exports = generateSealId;
