const express = require('express');
const { sealDocument, verifyDocument, issueDocument, getHistory } = require('../controllers/documentController');
const { protect } = require('../middlewares/authMiddleware');
const multer = require('multer');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * ─── Document Routes ─────────────────────────────────────────────────────────
 */

// POST /api/documents/seal — Seal a new document hash (Authenticated Issuers only)
router.post('/seal', protect, sealDocument);

// POST /api/documents/verify — Verify a document's hash against its seal (Public)
router.post('/verify', verifyDocument);

// POST /api/documents/issue — Issue a document (Backend Only flow)
router.post('/issue', protect, upload.single('document'), issueDocument);

// GET /api/documents/history — Get user's issuance history
router.get('/history', protect, getHistory);

module.exports = router;
