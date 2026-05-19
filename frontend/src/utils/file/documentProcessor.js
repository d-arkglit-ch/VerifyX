/**
 * documentProcessor
 *
 * Main orchestration pipeline for browser-side document processing.
 * Routes PDF and IMAGE files through different pipelines,
 * then returns a unified semantic verification payload.
 *
 * PDF flow:   extract text → normalize → SHA-256 → OCR fallback → extract fields
 * IMAGE flow: OCR → normalize OCR text → SHA-256 → extract fields
 *
 * @param {File}     file         — the uploaded File object
 * @param {Function} onProgress   — (stage, percent) callback for UI updates
 * @returns {Promise<Object>}       semantic verification payload
 */
import { detectFileType } from './detectFileType';
import { extractPdfContent } from './extractPdfContent';
import { normalizeContent } from './normalizeContent';
import { generateSHA256 } from './generateSHA256';
import { runOCR } from './runOCR';
import { extractFields, getFieldCompleteness } from './extractFields';

// ─── Processing stages ─────────────────────────────────────────────────────────
export const STAGES = {
  DETECTING:    'Detecting file type...',
  EXTRACTING:   'Extracting semantic content...',
  NORMALIZING:  'Normalizing content...',
  HASHING:      'Generating SHA-256 hash...',
  OCR:          'Running OCR extraction...',
  FIELDS:       'Extracting structured fields...',
  COMPLETE:     'Processing complete',
  ERROR:        'Processing failed',
};

export const processDocument = async (file, onProgress = () => {}) => {
  if (!file) throw new Error('No file provided');

  const startTime = Date.now();

  // ── Step 1: Detect file type ────────────────────────────────────────────────
  onProgress(STAGES.DETECTING, 5);
  const { type: fileType, mime } = detectFileType(file);

  if (fileType === 'UNSUPPORTED') {
    throw new Error(`Unsupported file type: ${mime || 'unknown'}. Use PDF, JPG, or PNG.`);
  }

  let rawText = '';
  let normalizedText = '';
  let documentHash = '';
  let ocrText = '';
  let ocrConfidence = 0;
  let fields = {};
  let pageCount = 0;

  // ── Step 2: Extract content based on type ───────────────────────────────────
  if (fileType === 'PDF') {
    // ── PDF Pipeline ──────────────────────────────────────────────────────────
    onProgress(STAGES.EXTRACTING, 15);
    try {
      const pdfResult = await extractPdfContent(file);
      rawText = pdfResult.text;
      pageCount = pdfResult.pageCount;
    } catch (err) {
      throw new Error(`PDF extraction failed: ${err.message}`);
    }

    // Normalize
    onProgress(STAGES.NORMALIZING, 30);
    normalizedText = normalizeContent(rawText);

    // Hash the normalized semantic content
    onProgress(STAGES.HASHING, 40);
    if (normalizedText) {
      documentHash = await generateSHA256(normalizedText);
    }

    // OCR — only run as fallback for scanned PDFs with no extractable text
    // Tesseract.js cannot read raw PDF bytes — skip if text was already extracted
    onProgress(STAGES.OCR, 50);
    if (!normalizedText) {
      try {
        const ocrResult = await runOCR(file, (pct) => {
          // Map OCR progress (0-100) into the 50-80 range of overall progress
          onProgress(STAGES.OCR, 50 + Math.round(pct * 0.3));
        });
        ocrText = ocrResult.text;
        ocrConfidence = ocrResult.confidence;

        // Use OCR text for hashing since pdfjs found nothing
        normalizedText = normalizeContent(ocrText);
        if (normalizedText) {
          documentHash = await generateSHA256(normalizedText);
        }
      } catch {
        // OCR failure is non-critical — log and continue
        console.warn('OCR fallback failed — continuing with extracted text');
      }
    }

  } else if (fileType === 'IMAGE') {
    // ── IMAGE Pipeline ────────────────────────────────────────────────────────
    onProgress(STAGES.OCR, 15);
    try {
      const ocrResult = await runOCR(file, (pct) => {
        onProgress(STAGES.OCR, 15 + Math.round(pct * 0.5));
      });
      ocrText = ocrResult.text;
      ocrConfidence = ocrResult.confidence;
      rawText = ocrText;
    } catch (err) {
      throw new Error(`OCR extraction failed: ${err.message}`);
    }

    // Normalize the OCR text
    onProgress(STAGES.NORMALIZING, 70);
    normalizedText = normalizeContent(ocrText);

    // Hash
    onProgress(STAGES.HASHING, 80);
    if (normalizedText) {
      documentHash = await generateSHA256(normalizedText);
    }
  }

  // ── Step 3: Extract structured fields ───────────────────────────────────────
  onProgress(STAGES.FIELDS, 90);
  // Use whichever text source is richer
  const fieldSource = ocrText && ocrText.length > rawText.length ? ocrText : rawText;
  fields = extractFields(fieldSource);
  const fieldCompleteness = getFieldCompleteness(fields);

  // ── Step 4: Build final payload ─────────────────────────────────────────────
  onProgress(STAGES.COMPLETE, 100);

  const processingTimeMs = Date.now() - startTime;

  return {
    // Core verification data
    documentHash,
    hashAlgorithm: 'SHA-256',
    normalizedContent: normalizedText,

    // OCR data
    ocrText,
    ocrConfidence,

    // Structured fields
    fields,
    fieldCompleteness,

    // Metadata
    fileType,
    fileName: file.name,
    fileSize: file.size,
    pageCount,
    processingTimeMs,
  };
};
