const mongoose = require('mongoose');
const Constitution = require('../models/Constitution');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/constitutional-chatbot', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Function to parse constitutional data
async function importConstitution() {
  try {
    // Clear existing data
    await Constitution.deleteMany({});
    console.log('Cleared existing constitutional data');

    // Read the constitution file
    const constitutionData = fs.readFileSync(
      path.join(__dirname, '../data/indian_constitution.json'),
      'utf8'
    );
    const articles = JSON.parse(constitutionData);

    // Insert articles into MongoDB
    for (const article of articles) {
      const newArticle = new Constitution({
        article: article.article,
        content: article.content,
        part: article.part,
        chapter: article.chapter,
        section: article.section
      });
      await newArticle.save();
      console.log(`Imported Article ${article.article}`);
    }

    console.log('Constitution import completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error importing constitution:', error);
    process.exit(1);
  }
}

importConstitution(); 