const express = require('express');
const router = express.Router();
const axios = require('axios');
const Constitution = require('../models/Constitution');
const Chat = require('../models/Chat');

// Helper function to make OpenRouter API calls
async function callOpenRouter(payload) {
  const baseURL = 'https://openrouter.ai/api/v1/chat/completions';
  console.log('Making request to OpenRouter');
  console.log('Request payload:', JSON.stringify(payload, null, 2));
  
  try {
    const response = await axios.post(baseURL, payload, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'http://localhost:5000',
        'X-Title': 'Constitution Chatbot'
      }
    });
    console.log('Response status:', response.status);
    return response.data;
  } catch (error) {
    console.error('OpenRouter API Error:');
    console.error('Status:', error.response?.status);
    console.error('Headers:', error.response?.headers);
    console.error('Data:', error.response?.data);
    throw error;
  }
}

// Function to classify the type of query
function classifyQuery(message) {
  const message_lower = message.toLowerCase();
  
  // Check if it's about the chatbot itself
  if (message_lower.includes('how do you work') || 
      message_lower.includes('how does this chatbot work') ||
      message_lower.includes('what is your backend') ||
      message_lower.includes('how are you built') ||
      message_lower.includes('tell me about yourself') ||
      message_lower.includes('which ai model') ||
      message_lower.includes('what model do you use') ||
      message_lower.includes('do you use llama') ||
      message_lower.includes('do you use gemini') ||
      message_lower.includes('what ai do you use') ||
      message_lower.includes('what language model') ||
      message_lower.includes('what llm') ||
      message_lower.includes('what technology') ||
      message_lower.includes('Give Brief Description How You Work') ||
      message_lower.includes('what system')) {
    return 'chatbot_info';
  }

  // Keywords that suggest constitutional questions
  const constitutionalKeywords = [
    'constitution', 'article', 'fundamental', 'rights', 'duties',
    'amendment', 'parliament', 'president', 'supreme court',
    'high court', 'directive principles', 'preamble', 'citizenship',
    'emergency', 'governor', 'minister', 'lok sabha', 'rajya sabha',
    'bill', 'law', 'legislative', 'executive', 'judicial',
    'police', 'crime', 'rob', 'steal', 'theft', 'file', 'complaint',
    'legal', 'procedure', 'court', 'justice', 'lawyer', 'advocate',
    'criminal', 'civil', 'case', 'fir', 'first information report',
    'right', 'protection', 'security', 'safety', 'crime', 'punishment'
  ];

  // Check if any constitutional keywords are present
  const isConstitutional = constitutionalKeywords.some(keyword => 
    message_lower.includes(keyword)
  );

  return isConstitutional ? 'constitutional' : 'other';
}

// --- Multi-Chat Endpoints ---

// Create a new chat
router.post('/chats', async (req, res) => {
  try {
    const { userId, title, folderId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId required' });
    const chat = new Chat({ 
      userId, 
      title: title || 'New Chat', 
      folderId: folderId || null,
      messages: [] 
    });
    await chat.save();
    res.json({ chat });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// List all chats for a user
router.get('/chats', async (req, res) => {
  try {
    const { userId, folderId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId required' });
    
    let query = { userId };
    if (folderId !== undefined) {
      // If folderId is 'null', look for chats with null folderId
      // If provided, look for that specific folder
      query.folderId = folderId === 'null' ? null : folderId;
    }
    
    const chats = await Chat.find(query).sort({ isPinned: -1, updatedAt: -1 });
    res.json({ chats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single chat and its messages
router.get('/chats/:chatId', async (req, res) => {
  try {
    const { chatId } = req.params;
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ error: 'Chat not found' });
    res.json({ chat });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a message to a chat and get AI response
router.post('/chats/:chatId/message', async (req, res) => {
  try {
    const { chatId } = req.params;
    const { userId, message } = req.body;
    if (!userId || !message) return res.status(400).json({ error: 'userId and message required' });
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ error: 'Chat not found' });
    // Add user message
    chat.messages.push({ role: 'user', content: message, timestamp: new Date() });
    // Get AI response
    // (You can add context from previous messages if needed)
    // For now, use the same logic as before
    const queryType = classifyQuery(message);
    let aiResponse = '';
    if (queryType === 'chatbot_info') {
      const response = await callOpenRouter({
        model: "mistralai/mistral-7b-instruct",
        messages: [
          {
            role: "system",
            content: "You are an AI assistant that explains how the Indian Constitution chatbot works. Be concise and clear in your explanations. Mention that the chatbot uses the Mistral-7B-Instruct model through OpenRouter API, and it combines this with MongoDB text search to find relevant constitutional articles."
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 400
      });
      aiResponse = `I'm happy to explain how I work! I'm a specialized chatbot focused on the Indian Constitution. \n\n${response.choices[0].message.content}\n\nI use the Mistral-7B-Instruct model through OpenRouter API to understand and respond to your questions, combined with MongoDB text search to find relevant constitutional articles. My primary purpose is to help you understand the Indian Constitution better.`;
    } else if (queryType === 'other') {
      aiResponse = "I'm sorry, I couldn't find any relevant constitutional information for your query. Could you please rephrase your question to be more specific about the Indian Constitution?";
    } else {
      const searchQuery = message.toLowerCase().includes('rights') 
        ? { $text: { $search: message }, part: 'III' }
        : { $text: { $search: message } };
      const relevantArticles = await Constitution.find(
        searchQuery,
        { score: { $meta: 'textScore' } }
      )
      .sort({ score: { $meta: 'textScore' } })
      .limit(5);
      if (relevantArticles.length === 0) {
        aiResponse = "I couldn't find any specific articles related to your query. Could you please rephrase your question or be more specific about which aspect of the Indian Constitution you'd like to learn about?";
      } else {
        const context = relevantArticles.map(article => {
          const content = article.content.replace(/\s+/g, ' ').trim();
          return `Article ${article.article} (${article.part || 'Part Not Specified'}${article.chapter ? ', ' + article.chapter : ''}):\n${content}`;
        }).join('\n\n');
        const response = await callOpenRouter({
          model: "mistralai/mistral-7b-instruct",
          messages: [
            {
              role: "system",
              content: `You are a helpful assistant specializing in the Indian Constitution. \nProvide clear, concise, and accurate answers based on the constitutional articles provided.\nAlways cite specific articles when explaining rights or procedures.\nFormat your response in a structured way with bullet points or numbered lists where appropriate.\nFocus on explaining the practical implications and significance of the constitutional provisions.\nKeep your responses focused and to the point.\nDo not include any disclaimers about being designed for constitutional questions.\nIf the question is about a specific article, start your response with \"Article [number]:\" followed by a clear explanation.\nUse proper formatting and ensure all spellings are correct.\nUse markdown formatting for better readability.`
            },
            {
              role: "user",
              content: `Based on these excerpts from the Indian Constitution:\n\n${context}\n\nQuestion: ${message}\n\nPlease provide a clear and structured answer, explaining the key points and citing specific articles. Use bullet points where appropriate and format with markdown.`
            }
          ],
          temperature: 0.7,
          max_tokens: 800
        });
        aiResponse = response.choices[0].message.content;
      }
    }
    // Add bot message
    chat.messages.push({ role: 'bot', content: aiResponse, timestamp: new Date() });
    chat.updatedAt = new Date();
    await chat.save();
    res.json({ message: aiResponse, chat });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rename a chat (update title)
router.put('/chats/:chatId', async (req, res) => {
  try {
    const { chatId } = req.params;
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: 'title required' });
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ error: 'Chat not found' });
    chat.title = title;
    chat.updatedAt = new Date();
    await chat.save();
    res.json({ chat });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a chat
router.delete('/chats/:chatId', async (req, res) => {
  try {
    const { chatId } = req.params;
    const chat = await Chat.findByIdAndDelete(chatId);
    if (!chat) return res.status(404).json({ error: 'Chat not found' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Move a chat to a folder
router.put('/chats/:chatId/move', async (req, res) => {
  try {
    const { chatId } = req.params;
    const { folderId } = req.body; // Can be null to remove from folder
    
    // Validate folderId if provided
    
    const chat = await Chat.findByIdAndUpdate(
      chatId,
      { $set: { folderId } },
      { new: true }
    );
    
    if (!chat) return res.status(404).json({ error: 'Chat not found' });
    res.json({ chat });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle pinned status
router.put('/chats/:chatId/pin', async (req, res) => {
  try {
    const { chatId } = req.params;
    const { isPinned } = req.body;
    
    const chat = await Chat.findByIdAndUpdate(
      chatId,
      { $set: { isPinned } },
      { new: true }
    );
    
    if (!chat) return res.status(404).json({ error: 'Chat not found' });
    res.json({ chat });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- End Multi-Chat Endpoints ---

// (Keep the old endpoint for backward compatibility)
// Chat endpoint with user authentication
router.post('/', async (req, res) => {
  try {
    const { message, userId } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!userId) {
      return res.status(401).json({ error: 'User authentication required' });
    }

    const queryType = classifyQuery(message);
    let response;

    if (queryType === 'chatbot_info') {
      // Respond with information about the chatbot
      response = await callOpenRouter({
        model: "mistralai/mistral-7b-instruct",
        messages: [
          {
            role: "system",
            content: "You are an AI assistant that explains how the Indian Constitution chatbot works. Be concise and clear in your explanations. Mention that the chatbot uses the Mistral-7B-Instruct model through OpenRouter API, and it combines this with MongoDB text search to find relevant constitutional articles."
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 400
      });

      return res.json({
        response: `I'm happy to explain how I work! I'm a specialized chatbot focused on the Indian Constitution. \n\n${response.choices[0].message.content}\n\nI use the Mistral-7B-Instruct model through OpenRouter API to understand and respond to your questions, combined with MongoDB text search to find relevant constitutional articles. My primary purpose is to help you understand the Indian Constitution better.`,
        userId: userId,
        timestamp: new Date().toISOString()
      });
    }

    if (queryType === 'other') {
      return res.json({
        response: "I'm sorry, I couldn't find any relevant constitutional information for your query. Could you please rephrase your question to be more specific about the Indian Constitution?",
        userId: userId,
        timestamp: new Date().toISOString()
      });
    }

    // For constitutional questions, proceed with the existing logic
    const searchQuery = message.toLowerCase().includes('rights') 
      ? { $text: { $search: message }, part: 'III' }
      : { $text: { $search: message } };

    const relevantArticles = await Constitution.find(
      searchQuery,
      { score: { $meta: 'textScore' } }
    )
    .sort({ score: { $meta: 'textScore' } })
    .limit(5);

    if (relevantArticles.length === 0) {
      return res.json({
        response: "I couldn't find any specific articles related to your query. Could you please rephrase your question or be more specific about which aspect of the Indian Constitution you'd like to learn about?",
        userId: userId,
        timestamp: new Date().toISOString()
      });
    }

    const context = relevantArticles.map(article => {
      const content = article.content
        .replace(/\s+/g, ' ')
        .trim();
      return `Article ${article.article} (${article.part || 'Part Not Specified'}${article.chapter ? ', ' + article.chapter : ''}):\n${content}`;
    }).join('\n\n');

    response = await callOpenRouter({
      model: "mistralai/mistral-7b-instruct",
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant specializing in the Indian Constitution. \n          Provide clear, concise, and accurate answers based on the constitutional articles provided.\n          Always cite specific articles when explaining rights or procedures.\n          Format your response in a structured way with bullet points or numbered lists where appropriate.\n          Focus on explaining the practical implications and significance of the constitutional provisions.\n          Keep your responses focused and to the point.\n          Do not include any disclaimers about being designed for constitutional questions.\n          If the question is about a specific article, start your response with \"Article [number]:\" followed by a clear explanation.\n          Use proper formatting and ensure all spellings are correct.\n          Use markdown formatting for better readability.`
        },
        {
          role: "user",
          content: `Based on these excerpts from the Indian Constitution:\n\n${context}\n\nQuestion: ${message}\n\nPlease provide a clear and structured answer, explaining the key points and citing specific articles. Use bullet points where appropriate and format with markdown.`
        }
      ],
      temperature: 0.7,
      max_tokens: 800
    });

    if (!response?.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from OpenRouter API');
    }

    res.json({
      response: response.choices[0].message.content,
      context: relevantArticles.map(a => ({
        article: a.article,
        content: a.content,
        part: a.part,
        chapter: a.chapter
      })),
      userId: userId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat error:', error.response?.data || error);
    res.status(500).json({ 
      error: 'An error occurred while processing your request',
      details: error.message || 'Unknown error',
      fullError: error.response?.data || error.message
    });
  }
});

// Get chat history for a user (legacy, not used in new multi-chat)
router.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // For now, we'll return an empty array since we haven't implemented chat history storage yet
    // In a real implementation, you would query a database for chat history
    res.json({
      history: [],
      userId: userId
    });

  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ 
      error: 'An error occurred while fetching chat history',
      details: error.message
    });
  }
});

module.exports = router; 