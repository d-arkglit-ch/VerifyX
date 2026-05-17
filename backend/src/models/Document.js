const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  sealId: {
    type: String,
    index: true,
    default: ''
  },
  hash: {
    type: String,
    select: false
  },
  fileName: {
    type: String,
    default: 'Document'
  },
  qrCode: {
    type: String
  },
  documentHash: {
    type: String,
    required: true
  },
  hashAlgorithm: {
    type: String,
    enum: ["SHA-256", "pHash"],
    required: true
  },
  ocrText: {
    type: String,
    default: ''
  },
  fields: {
    name: { type: String, default: '' },
    certificateId: { type: String, default: '' },
    issueDate: { type: String, default: '' },
    issuer: { type: String, default: '' },
    registrationNumber: { type: String, default: '' }
  },
  issuedTo: {
    type: String,
    required: true
  },
  issuedBy: {
    type: String,
    required: true
  },
  issueDate: {
    type: Date,
    default: Date.now
  },
  documentType: {
    type: String,
    enum: [
      "Academic Degree",
      "Medical Report",
      "Offer Letter",
      "Legal Document",
      "Identity Document",
      "Other"
    ],
    required: true
  },
  identifierHash: {
    type: String,
    index: true
  },
  verificationCount: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Document', documentSchema);
