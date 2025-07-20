# Constitutional AI Chatbot

A modern, intelligent chatbot for Indian Constitutional queries with Google Authentication and beautiful UI.

## Features

- 🤖 **AI-Powered Responses**: Uses Mistral-7B-Instruct model for intelligent responses
- 🔐 **Google Authentication**: Secure login with Google OAuth
- 📚 **Constitutional Knowledge**: Comprehensive database of Indian Constitution articles
- 💬 **Modern Chat Interface**: Beautiful, responsive chat UI with animations
- 📱 **Mobile Responsive**: Works perfectly on all devices
- 🎨 **Beautiful Design**: Modern UI with Material-UI components
- 📊 **Markdown Support**: Rich text formatting in responses
- 🔍 **Smart Search**: MongoDB text search for relevant articles

## Tech Stack

### Frontend
- React 18
- Material-UI (MUI)
- Framer Motion (animations)
- React Markdown
- Firebase Authentication
- Axios

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- OpenRouter API

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- Google OAuth credentials

### 1. Clone the Repository
```bash
git clone <repository-url>
cd constitutional-chatbot
```

### 2. Install Dependencies

#### Backend Dependencies
```bash
npm install
```

#### Frontend Dependencies
```bash
cd client
npm install
```

### 3. Environment Variables

Create a `.env` file in the root directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/constitutional-chatbot

# OpenRouter API Key
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Optional: Constitution Data Source
CONSTITUTION_DRIVE_URL=your_google_drive_url_here
```

Create a `.env` file in the client directory:

```env
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=AIzaSyBJ__EY3-WNZCC1ZGwKXFq5vwMvcr7t2rw
REACT_APP_FIREBASE_AUTH_DOMAIN=chatbot-61524.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=chatbot-61524
REACT_APP_FIREBASE_STORAGE_BUCKET=chatbot-61524.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=731277517175
REACT_APP_FIREBASE_APP_ID=1:731277517175:web:924d8ca46acb4029f94172
REACT_APP_FIREBASE_MEASUREMENT_ID=G-YTK2QWF2TE
```

### 4. Firebase Setup

The application is already configured with Firebase Authentication. The Firebase configuration is included in the codebase and will work out of the box.

If you want to use your own Firebase project:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Enable Authentication → Sign-in method → Google
4. Add your web app to the project
5. Copy the configuration and update the environment variables

### 6. Start the Application

#### Start Backend Server
```bash
# From root directory
npm start
```

#### Start Frontend Development Server
```bash
# From client directory
cd client
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/google` - Firebase authentication
- `GET /api/auth/profile/:userId` - Get user profile
- `PUT /api/auth/profile/:userId` - Update user profile
- `POST /api/auth/logout/:userId` - Logout user

### Chat
- `POST /api/chat` - Send chat message
- `GET /api/chat/history/:userId` - Get chat history

### Constitution
- `GET /api/constitution/search` - Search constitution articles
- `GET /api/constitution/article/:id` - Get specific article

## Features in Detail

### 🔐 Authentication
- Secure Firebase Authentication integration
- User profile management
- Session persistence
- Automatic user creation

### 💬 Chat Interface
- Real-time message display
- Typing indicators
- Message timestamps
- Rich text formatting
- Code syntax highlighting
- Responsive design

### 🤖 AI Responses
- Context-aware responses
- Constitutional article citations
- Structured formatting
- Markdown support
- Error handling

### 📱 Responsive Design
- Mobile-first approach
- Touch-friendly interface
- Adaptive layouts
- Smooth animations

## Project Structure

```
constitutional-chatbot/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── App.js         # Main application component
│   │   ├── index.js       # Entry point
│   │   └── index.css      # Global styles
│   └── package.json
├── models/                 # MongoDB models
│   ├── Constitution.js     # Constitution article model
│   └── User.js            # User model
├── routes/                 # API routes
│   ├── authRoutes.js      # Authentication routes
│   ├── chatRoutes.js      # Chat routes
│   ├── constitutionRoutes.js
│   └── documentRoutes.js
├── data/                   # Constitution data
│   └── indian_constitution.json
├── scripts/                # Utility scripts
│   └── importConstitution.js
├── server.js              # Express server
└── package.json
```

## Customization

### Styling
- Modify `client/src/index.css` for global styles
- Update theme in `client/src/App.js`
- Customize Material-UI theme

### AI Model
- Change model in `routes/chatRoutes.js`
- Adjust temperature and max_tokens
- Modify system prompts

### Database
- Add new fields to models
- Create new collections
- Implement data validation

## Troubleshooting

### Common Issues

1. **Firebase Authentication not working**
   - Check Firebase configuration in firebase.js
   - Verify Firebase project settings
   - Ensure Google sign-in is enabled in Firebase Console

2. **MongoDB connection failed**
   - Check MongoDB is running
   - Verify connection string
   - Check network connectivity

3. **OpenRouter API errors**
   - Verify API key
   - Check rate limits
   - Ensure proper headers

4. **Frontend not loading**
   - Check all dependencies installed
   - Verify port 3000 is available
   - Check console for errors

### Development Tips

- Use browser dev tools for debugging
- Check server logs for backend issues
- Test API endpoints with Postman
- Monitor MongoDB connections

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue on GitHub
- Check the troubleshooting section
- Review the documentation

---

**Note**: Remember to replace placeholder values (like `YOUR_GOOGLE_CLIENT_ID`) with your actual credentials before running the application. 