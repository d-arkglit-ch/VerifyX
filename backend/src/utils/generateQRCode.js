const QRCode = require('qrcode');

/**
 * generateQRCode
 * Generates a Data URI containing a QR Code for a given URL or text
 * @param {string} text - The text or URL to encode in the QR code
 * @returns {Promise<string>} The QR Code data URI
 */
const generateQRCode = async (text) => {
  try {
    const qrCodeDataUri = await QRCode.toDataURL(text);
    return qrCodeDataUri;
  } catch (err) {
    console.error('Error generating QR code', err);
    throw new Error('Failed to generate QR code');
  }
};

module.exports = generateQRCode;
