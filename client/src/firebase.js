// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyBJ__EY3-WNZCC1ZGwKXFq5vwMvcr7t2rw",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "chatbot-61524.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "chatbot-61524",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "chatbot-61524.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "731277517175",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:731277517175:web:924d8ca46acb4029f94172",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-YTK2QWF2TE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Analytics (optional - only in production)
let analytics = null;
if (process.env.NODE_ENV === 'production') {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.log('Analytics not available:', error);
  }
}

export { analytics };
export default app; 