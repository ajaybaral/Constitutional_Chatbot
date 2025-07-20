const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  picture: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
userSchema.index({ googleId: 1 });
userSchema.index({ email: 1 });

// Method to update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

// Static method to find or create user
userSchema.statics.findOrCreate = async function(googleUser) {
  let user = await this.findOne({ googleId: googleUser.sub });
  
  if (!user) {
    user = new this({
      googleId: googleUser.sub,
      name: googleUser.name,
      email: googleUser.email,
      picture: googleUser.picture
    });
    await user.save();
  } else {
    // Update user info if it has changed
    user.name = googleUser.name;
    user.email = googleUser.email;
    user.picture = googleUser.picture;
    user.lastLogin = new Date();
    await user.save();
  }
  
  return user;
};

module.exports = mongoose.model('User', userSchema); 