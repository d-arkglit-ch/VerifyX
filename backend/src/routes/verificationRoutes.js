const express = require('express');
const { getDocumentMetadata, verifyDocumentCompare } = require('../controllers/verificationController');

const router = express.Router();

/**
 * @desc    Fetch document metadata using Seal ID
 * @route   GET /api/document/:sealId
 * @access  Public
 */
router.get('/document/:sealId', getDocumentMetadata);

/**
 * @desc    Compare uploaded verification payload with stored document
 * @route   POST /api/verify/compare
 * @access  Public
 */
router.post('/verify/compare', verifyDocumentCompare);

module.exports = router;
