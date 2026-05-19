const express = require('express');
const { sealDocument, verifyDocument, issueDocument, getHistory } = require('../controllers/documentController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * ─── Document Routes ─────────────────────────────────────────────────────────
 */

// POST /api/documents/seal — Seal a new document hash (Authenticated Issuers only)
//SOMYA
router.post('/seal', protect, sealDocument);

// POST /api/documents/verify — Verify a document's hash against its seal (Public)
//ME
router.post('/verify', verifyDocument);

// POST /api/documents/issue — Issue a document (accepts JSON proof payload from frontend)
//SHOURYA
router.post('/issue', protect, issueDocument);

// GET /api/documents/history — Get user's issuance history
//SUHANA
router.get('/history', protect, getHistory);

module.exports = router;
