# Indian Constitution Chatbot

A MERN stack application that provides a chatbot interface for answering questions about the Indian Constitution using OpenAI's GPT model.

## Features

- Chat interface for asking questions about the Indian Constitution
- Real-time responses with relevant constitutional articles
- Modern and responsive UI using Material-UI
- MongoDB database for storing constitutional articles
- OpenAI integration for intelligent responses

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- OpenAI API key

## Setup

1. Clone the repository
2. Install backend dependencies:
   ```bash
   npm install
   ```
3. Install frontend dependencies:
   ```bash
   cd client
   npm install
   cd ..
   ```
4. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/constitutional-chatbot
   OPENAI_API_KEY=your_openai_api_key_here
   NODE_ENV=development
   ```
5. Start MongoDB server
6. Run the application:
   ```bash
   npm run dev
   ```

## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Type your question about the Indian Constitution in the input field
3. Press Enter or click the Send button
4. The chatbot will respond with relevant information and cite the constitutional articles used

## Project Structure

```
constitutional-chatbot/
├── client/                 # React frontend
│   ├── public/
│   └── src/
│       ├── App.js         # Main React component
│       └── index.js       # React entry point
├── models/                 # MongoDB models
│   └── Constitution.js    # Constitution schema
├── routes/                 # API routes
│   ├── chatRoutes.js      # Chat endpoints
│   └── constitutionRoutes.js # Constitution endpoints
├── server.js              # Express server
├── package.json           # Backend dependencies
└── README.md              # Project documentation
```

## Contributing

Feel free to submit issues and enhancement requests.

## License

This project is licensed under the MIT License. 