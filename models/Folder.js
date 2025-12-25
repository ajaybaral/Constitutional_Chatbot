const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  color: { type: String, default: '#4F96B1' }, // Default to primary teal
  icon: { type: String, default: 'folder' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Folder', folderSchema);
