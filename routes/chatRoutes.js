const express = require('express');
const router = express.Router();
const axios = require('axios');
const Constitution = require('../models/Constitution');

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

// Chat endpoint
router.post('/', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
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
        response: `I'm happy to explain how I work! I'm a specialized chatbot focused on the Indian Constitution. 

${response.choices[0].message.content}

I use the Mistral-7B-Instruct model through OpenRouter API to understand and respond to your questions, combined with MongoDB text search to find relevant constitutional articles. My primary purpose is to help you understand the Indian Constitution better.`
      });
    }

    if (queryType === 'other') {
      return res.json({
        response: "I'm sorry, I couldn't find any relevant constitutional information for your query. Could you please rephrase your question to be more specific about the Indian Constitution?"
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
        response: "I couldn't find any specific articles related to your query. Could you please rephrase your question or be more specific about which aspect of the Indian Constitution you'd like to learn about?"
      });
    }

    const context = relevantArticles.map(article => {
      const content = article.content
        .replace(/\s+/g, ' ')
        .trim();
      return `Article ${article.article} (${article.part || 'Part Not Specified'}${article.chapter ? ', ' + article.chapter : ''}):
${content}`;
    }).join('\n\n');

    console.log('Getting chat completion from OpenRouter');
    response = await callOpenRouter({
      model: "mistralai/mistral-7b-instruct",
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant specializing in the Indian Constitution. 
          Provide clear, concise, and accurate answers based on the constitutional articles provided.
          Always cite specific articles when explaining rights or procedures.
          Format your response in a structured way with bullet points or numbered lists where appropriate.
          Focus on explaining the practical implications and significance of the constitutional provisions.
          Keep your responses focused and to the point.
          Do not include any disclaimers about being designed for constitutional questions.
          If the question is about a specific article, start your response with "Article [number]:" followed by a clear explanation.
          Use proper formatting and ensure all spellings are correct.`
        },
        {
          role: "user",
          content: `Based on these excerpts from the Indian Constitution:

${context}

Question: ${message}

Please provide a clear and structured answer, explaining the key points and citing specific articles. Use bullet points where appropriate.`
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
      }))
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

module.exports = router; 