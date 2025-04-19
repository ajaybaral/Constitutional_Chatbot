const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/constitutional-chatbot', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('MongoDB Connected');
  
  // Load constitution automatically
  try {
    if (process.env.CONSTITUTION_DRIVE_URL) {
      console.log('Loading constitution from Google Drive...');
      console.log('Drive URL:', process.env.CONSTITUTION_DRIVE_URL);
      
      // Wait for the server to start before making the request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const response = await axios.get('http://localhost:5000/api/document/load');
      console.log('Constitution loaded successfully!');
      console.log('Statistics:', response.data.stats);
    } else {
      console.log('No constitution source specified in environment variables');
      console.log('Please set either CONSTITUTION_DRIVE_URL or CONSTITUTION_FILE_PATH in .env');
    }
  } catch (error) {
    console.error('Error loading constitution:', error.response?.data || error.message);
    console.log('The server will continue running, but the constitution may not be loaded properly.');
  }
})
.catch(err => console.log('MongoDB Connection Error:', err));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Routes
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/constitution', require('./routes/constitutionRoutes'));
app.use('/api/document', require('./routes/documentRoutes'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    mongo: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    constitution: process.env.CONSTITUTION_DRIVE_URL ? 'configured' : 'not configured'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check available at: http://localhost:${PORT}/health`);
}); 