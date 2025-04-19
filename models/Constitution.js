const mongoose = require('mongoose');

const constitutionSchema = new mongoose.Schema({
  article: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  part: {
    type: String,
    required: true
  },
  chapter: {
    type: String
  },
  section: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

constitutionSchema.index({ article: 1, content: 1 }, { unique: true });

constitutionSchema.index({ content: 'text', article: 'text' });

module.exports = mongoose.model('Constitution', constitutionSchema); 