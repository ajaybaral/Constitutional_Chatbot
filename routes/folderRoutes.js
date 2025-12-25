const express = require('express');
const router = express.Router();
const Folder = require('../models/Folder');
const Chat = require('../models/Chat');

// Create a new folder
router.post('/', async (req, res) => {
  try {
    const { userId, name, color, icon } = req.body;
    if (!userId || !name) return res.status(400).json({ error: 'userId and name required' });
    
    const folder = new Folder({ userId, name, color, icon });
    await folder.save();
    res.json({ folder });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// List all folders for a user
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId required' });
    
    const folders = await Folder.find({ userId }).sort({ name: 1 });
    res.json({ folders });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a folder
router.put('/:folderId', async (req, res) => {
  try {
    const { folderId } = req.params;
    const { name, color, icon } = req.body;
    
    const folder = await Folder.findByIdAndUpdate(
      folderId,
      { $set: { name, color, icon } },
      { new: true } // Return updated document
    );
    
    if (!folder) return res.status(404).json({ error: 'Folder not found' });
    res.json({ folder });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a folder
router.delete('/:folderId', async (req, res) => {
  try {
    const { folderId } = req.params;
    
    // First, verify the folder exists
    const folder = await Folder.findById(folderId);
    if (!folder) return res.status(404).json({ error: 'Folder not found' });
    
    // Update all chats in this folder to have no folder (null)
    await Chat.updateMany(
      { folderId: folderId },
      { $set: { folderId: null } }
    );
    
    // Delete the folder
    await Folder.findByIdAndDelete(folderId);
    
    res.json({ success: true, message: 'Folder deleted and chats moved to unorganized' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
