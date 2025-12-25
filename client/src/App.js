import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged 
} from 'firebase/auth';
import { auth } from './firebase';
import { ThemeProvider, createTheme, CssBaseline, Box, CircularProgress, Snackbar, Alert } from '@mui/material';

// Components
import LoginPage from './components/LoginPage';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#4F96B1' },
    secondary: { main: '#F4CD63' },
    background: { default: '#0F172A', paper: '#1E293B' }
  },
  typography: { fontFamily: 'Inter, sans-serif' }
});

function App() {
  // Auth State
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // App State
  const [chats, setChats] = useState([]);
  const [folders, setFolders] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  
  // UI State
  const [loading, setLoading] = useState(false); // AI generating response
  const [message, setMessage] = useState(''); // Current input
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // Init Data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userInfo = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName,
          email: firebaseUser.email,
          picture: firebaseUser.photoURL
        };
        setUser(userInfo);
        await Promise.all([
          fetchChats(userInfo.uid),
          fetchFolders(userInfo.uid)
        ]);
      } else {
        setUser(null);
        setChats([]);
        setFolders([]);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetching Data
  const fetchChats = async (uid) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/chat/chats?userId=${uid}`);
      setChats(res.data.chats);
      if (res.data.chats.length > 0 && !selectedChatId) {
        setSelectedChatId(res.data.chats[0]._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFolders = async (uid) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/folders?userId=${uid}`);
      setFolders(res.data.folders);
    } catch (err) {
      console.log('Folders API not ready yet');
    }
  };

  const fetchMessages = async (chatId) => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/chat/chats/${chatId}`);
      setMessages(res.data.chat.messages);
    } catch (err) {
      showSnackbar('Failed to load messages', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedChatId) fetchMessages(selectedChatId);
    else setMessages([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChatId]);

  // Actions
  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      showSnackbar('Sign in failed', 'error');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const handleNewChat = async () => {
    if (!user) return;
    try {
      const res = await axios.post('http://localhost:5000/api/chat/chats', {
        userId: user.uid,
        title: 'New Chat'
      });
      setChats([res.data.chat, ...chats]);
      setSelectedChatId(res.data.chat._id);
      showSnackbar('New chat created! ✨', 'success');
    } catch (err) {
      showSnackbar('Failed to create chat', 'error');
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedChatId) return;
    const currentMsg = message;
    setMessage('');
    
    // Optimistic update
    setMessages(prev => [...prev, { role: 'user', content: currentMsg, timestamp: new Date() }]);
    setLoading(true);

    try {
      const res = await axios.post(`http://localhost:5000/api/chat/chats/${selectedChatId}/message`, {
        userId: user.uid,
        message: currentMsg
      });
      setMessages(res.data.chat.messages);
      fetchChats(user.uid); // Refresh list for sorting/titles
    } catch (err) {
      showSnackbar('Failed to send message', 'error');
      // Revert optimistic update if needed or plain reload
      if (selectedChatId) fetchMessages(selectedChatId);
    } finally {
      setLoading(false);
    }
  };

  // Chat Management
  const handleRenameChat = async (chatId, newTitle) => {
    try {
      await axios.put(`http://localhost:5000/api/chat/chats/${chatId}`, { title: newTitle });
      setChats(chats.map(c => c._id === chatId ? { ...c, title: newTitle } : c));
      showSnackbar('Chat renamed! ✏️', 'success');
    } catch (err) {
      showSnackbar('Failed to rename chat', 'error');
    }
  };

  const handleDeleteChat = async (chatId) => {
    try {
      await axios.delete(`http://localhost:5000/api/chat/chats/${chatId}`);
      setChats(chats.filter(c => c._id !== chatId));
      if (selectedChatId === chatId) setSelectedChatId(null);
      showSnackbar('Chat deleted! 🗑️', 'success');
    } catch (err) {
      showSnackbar('Failed to delete chat', 'error');
    }
  };

  const handleMoveChat = async (chatId, folderId) => {
    try {
      await axios.put(`http://localhost:5000/api/chat/chats/${chatId}/move`, { folderId });
      setChats(chats.map(c => c._id === chatId ? { ...c, folderId } : c));
      showSnackbar(`Chat moved! 📂`, 'success');
    } catch (err) {
      showSnackbar('Failed to move chat', 'error');
    }
  };

  const handlePinChat = async (chatId) => {
    try {
      await axios.put(`http://localhost:5000/api/chat/chats/${chatId}/pin`);
      const updatedChat = chats.find(c => c._id === chatId);
      setChats(chats.map(c => c._id === chatId ? { ...c, isPinned: !c.isPinned } : c));
      showSnackbar(`Chat ${updatedChat.isPinned ? 'unpinned' : 'pinned'}! 📌`, 'success');
    } catch (err) {
      showSnackbar('Failed to pin/unpin chat', 'error');
    }
  };

  // Folder Management
  const handleCreateFolder = async (name, color) => {
    try {
      const res = await axios.post('http://localhost:5000/api/folders', {
        userId: user.uid, name, color
      });
      setFolders([...folders, res.data.folder]);
      showSnackbar('Folder created! 📁', 'success');
    } catch(err) {
      showSnackbar('Failed to create folder', 'error');
    }
  };

  const handleRenameFolder = async (folderId, newName) => {
    try {
      await axios.put(`http://localhost:5000/api/folders/${folderId}`, { name: newName });
      setFolders(folders.map(f => f._id === folderId ? { ...f, name: newName } : f));
      showSnackbar('Folder renamed! ✏️', 'success');
    } catch (err) {
      showSnackbar('Failed to rename folder', 'error');
    }
  };

  const handleDeleteFolder = async (folderId) => {
    try {
      await axios.delete(`http://localhost:5000/api/folders/${folderId}`);
      setFolders(folders.filter(f => f._id !== folderId));
      // Move chats to unorganized
      setChats(chats.map(c => c.folderId === folderId ? { ...c, folderId: null } : c));
      showSnackbar('Folder deleted! 🗑️', 'success');
    } catch (err) {
      showSnackbar('Failed to delete folder', 'error');
    }
  };

  const handleUpdateFolderColor = async (folderId, color) => {
    try {
      await axios.put(`http://localhost:5000/api/folders/${folderId}`, { color });
      setFolders(folders.map(f => f._id === folderId ? { ...f, color } : f));
      showSnackbar('Folder color updated! 🎨', 'success');
    } catch (err) {
      showSnackbar('Failed to update folder color', 'error');
    }
  };

  const showSnackbar = (msg, severity) => {
    setSnackbar({ open: true, message: msg, severity });
  };

  // Rendering
  if (authLoading) {
    return (
      <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#0F172A' }}>
        <CircularProgress sx={{ color: '#4F96B1' }} />
      </Box>
    );
  }

  if (!user) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LoginPage onLogin={handleLogin} />
      </ThemeProvider>
    );
  }

  const activeChat = chats.find(c => c._id === selectedChatId);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#0F172A', overflow: 'hidden' }}>
        <Sidebar 
          user={user}
          chats={chats}
          folders={folders}
          activeChatId={selectedChatId}
          onNewChat={handleNewChat}
          onSelectChat={setSelectedChatId}
          onLogout={handleLogout}
          onCreateFolder={handleCreateFolder}
          onRenameChat={handleRenameChat}
          onDeleteChat={handleDeleteChat}
          onMoveChat={handleMoveChat}
          onPinChat={handlePinChat}
          onRenameFolder={handleRenameFolder}
          onDeleteFolder={handleDeleteFolder}
          onUpdateFolderColor={handleUpdateFolderColor}
        />
        <ChatArea 
          chat={activeChat}
          messages={messages}
          loading={loading}
          onSend={handleSendMessage}
          message={message}
          setMessage={setMessage}
        />
      </Box>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ borderRadius: 4 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}

export default App;