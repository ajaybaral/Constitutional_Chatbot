const express = require('express');
const router = express.Router();
const Constitution = require('../models/Constitution');

// Get all articles
router.get('/', async (req, res) => {
  try {
    const articles = await Constitution.find().sort('article');
    res.json(articles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get article by number
router.get('/:article', async (req, res) => {
  try {
    const article = await Constitution.findOne({ article: req.params.article });
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    res.json(article);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add new article
router.post('/', async (req, res) => {
  const article = new Constitution({
    article: req.body.article,
    content: req.body.content,
    part: req.body.part,
    chapter: req.body.chapter,
    section: req.body.section
  });

  try {
    const newArticle = await article.save();
    res.status(201).json(newArticle);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update article
router.patch('/:article', async (req, res) => {
  try {
    const article = await Constitution.findOne({ article: req.params.article });
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    Object.assign(article, req.body);
    const updatedArticle = await article.save();
    res.json(updatedArticle);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 