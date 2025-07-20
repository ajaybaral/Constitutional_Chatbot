const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Google OAuth login endpoint (updated for Firebase)
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    
    if (!credential) {
      return res.status(400).json({ error: 'Firebase token is required' });
    }

    // In a production environment, you should verify the Firebase token
    // using Firebase Admin SDK. For now, we'll accept the token and
    // extract user info from the client-side decoded token
    
    // For development, we'll create a mock user object
    // In production, verify the token with Firebase Admin
    const mockUser = {
      sub: 'firebase_uid_' + Date.now(), // This should come from verified token
      name: 'Firebase User',
      email: 'user@example.com',
      picture: 'https://via.placeholder.com/150'
    };

    // Find or create user
    const user = await User.findOrCreate(mockUser);
    
    // Update last login
    await user.updateLastLogin();

    res.json({
      success: true,
      user: {
        id: user._id,
        googleId: user.googleId,
        name: user.name,
        email: user.email,
        picture: user.picture,
        role: user.role
      },
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Firebase auth error:', error);
    res.status(500).json({ 
      error: 'Authentication failed',
      details: error.message 
    });
  }
});

// Get user profile
router.get('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        googleId: user.googleId,
        name: user.name,
        email: user.email,
        picture: user.picture,
        role: user.role,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ 
      error: 'Failed to fetch user profile',
      details: error.message 
    });
  }
});

// Update user profile
router.put('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email } = req.body;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update allowed fields
    if (name) user.name = name;
    if (email) user.email = email;
    
    await user.save();

    res.json({
      success: true,
      user: {
        id: user._id,
        googleId: user.googleId,
        name: user.name,
        email: user.email,
        picture: user.picture,
        role: user.role
      },
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ 
      error: 'Failed to update user profile',
      details: error.message 
    });
  }
});

// Logout endpoint (client-side logout, but we can track it)
router.post('/logout/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // In a real application, you might want to invalidate tokens here
    // For now, we'll just acknowledge the logout
    
    res.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({ 
      error: 'Logout failed',
      details: error.message 
    });
  }
});

// Health check for auth service
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'authentication',
    timestamp: new Date().toISOString()
  });
});

module.exports = router; 