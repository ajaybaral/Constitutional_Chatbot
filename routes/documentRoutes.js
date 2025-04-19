const express = require('express');
const router = express.Router();
const axios = require('axios');
const pdf = require('pdf-parse');
const fs = require('fs');
const path = require('path');
const Constitution = require('../models/Constitution');

// Helper function to extract file ID from Google Drive URL
function extractDriveFileId(url) {
  const match = url.match(/\/d\/([^\/]+)/);
  return match ? match[1] : null;
}

// Helper function to clean and process article text
function processArticleText(text) {
  // Remove multiple spaces and newlines
  text = text.replace(/\s+/g, ' ').trim();
  
  // Remove common PDF artifacts
  text = text.replace(/-\n/g, '');
  text = text.replace(/\n/g, ' ');
  
  return text;
}

// Helper function to extract article number
function extractArticleNumber(text) {
  const match = text.match(/Article\s+(\d+[A-Za-z]?)/i);
  return match ? match[1] : null;
}

// Helper function to extract part and chapter
function extractPartAndChapter(text) {
  const partMatch = text.match(/PART\s+([A-Z]+)/i);
  const chapterMatch = text.match(/CHAPTER\s+([A-Z]+)/i);
  
  return {
    part: partMatch ? partMatch[1] : 'UNKNOWN',
    chapter: chapterMatch ? chapterMatch[1] : null
  };
}

// Load constitution from Google Drive
router.get('/load', async (req, res) => {
  try {
    const driveUrl = process.env.CONSTITUTION_DRIVE_URL;
    if (!driveUrl) {
      return res.status(400).json({ message: 'Google Drive URL not configured' });
    }

    const fileId = extractDriveFileId(driveUrl);
    if (!fileId) {
      return res.status(400).json({ message: 'Invalid Google Drive URL' });
    }

    console.log('Downloading constitution from Google Drive...');
    const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
    const response = await axios({
      method: 'GET',
      url: downloadUrl,
      responseType: 'arraybuffer',
      onDownloadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log(`Download progress: ${percentCompleted}%`);
      }
    });

    console.log('PDF downloaded successfully, processing...');
    const dataBuffer = response.data;
    const data = await pdf(dataBuffer);
    console.log('PDF parsed successfully, processing text...');

    // Clear existing data
    await Constitution.deleteMany({});
    console.log('Cleared existing constitutional data');

    const text = data.text;
    const articles = [];
    let currentArticle = null;
    let currentContent = [];

    // Split text into lines and process
    const lines = text.split('\n');
    for (const line of lines) {
      const articleNumber = extractArticleNumber(line);
      if (articleNumber) {
        // Save previous article if exists
        if (currentArticle) {
          const { part, chapter } = extractPartAndChapter(currentContent.join(' '));
          articles.push({
            article: currentArticle,
            content: processArticleText(currentContent.join(' ')),
            part,
            chapter
          });
        }
        // Start new article
        currentArticle = articleNumber;
        currentContent = [line];
      } else if (currentArticle) {
        currentContent.push(line);
      }
    }

    // Save the last article
    if (currentArticle) {
      const { part, chapter } = extractPartAndChapter(currentContent.join(' '));
      articles.push({
        article: currentArticle,
        content: processArticleText(currentContent.join(' ')),
        part,
        chapter
      });
    }

    console.log(`Found ${articles.length} articles`);

    // Insert articles with error handling for duplicates
    let successCount = 0;
    let duplicateCount = 0;
    let errorCount = 0;

    for (const article of articles) {
      try {
        await Constitution.create(article);
        successCount++;
      } catch (error) {
        if (error.code === 11000) {
          duplicateCount++;
        } else {
          errorCount++;
          console.error(`Error saving article ${article.article}:`, error);
        }
      }
    }

    console.log(`Articles processed: ${successCount} saved, ${duplicateCount} duplicates, ${errorCount} errors`);

    res.json({
      message: 'Constitution loaded successfully',
      stats: {
        total: articles.length,
        saved: successCount,
        duplicates: duplicateCount,
        errors: errorCount
      }
    });
  } catch (error) {
    console.error('Error loading from Google Drive:', error);
    res.status(500).json({ 
      message: 'Error loading the constitution file',
      error: error.message
    });
  }
});

module.exports = router; 