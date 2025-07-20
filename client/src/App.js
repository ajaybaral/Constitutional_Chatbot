import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  AppBar,
  Toolbar,
  Avatar,
  IconButton,
  Drawer,
  ListItemIcon,
  Card,
  CardContent,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Fab,
  Zoom,
  useScrollTrigger,
  Slide,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Send as SendIcon,
  Logout,
  Menu as MenuIcon,
  Add as AddIcon,
  LightMode,
  DarkMode,
  SmartToy,
  Google,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import axios from 'axios';
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from './firebase';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

function HideOnScroll(props) {
  const { children } = props;
  const trigger = useScrollTrigger();
  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

function App() {
  const [message, setMessage] = useState('');
  const [chats, setChats] = useState([]); // List of all chats
  const [selectedChatId, setSelectedChatId] = useState(null); // Current chat id
  const [messages, setMessages] = useState([]); // Messages for selected chat
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [sidebarLoading, setSidebarLoading] = useState(false);
  const [editingChatId, setEditingChatId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  // Firebase Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const userInfo = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName,
          email: firebaseUser.email,
          picture: firebaseUser.photoURL,
          sub: firebaseUser.uid
        };
        setUser(userInfo);
        localStorage.setItem('user', JSON.stringify(userInfo));
      } else {
        setUser(null);
        localStorage.removeItem('user');
        setChats([]);
        setMessages([]);
        setSelectedChatId(null);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch all chats for the user
  useEffect(() => {
    if (user) {
      fetchChats();
    }
  }, [user]);

  // Fetch messages for selected chat
  useEffect(() => {
    if (selectedChatId) {
      fetchMessages(selectedChatId);
    } else {
      setMessages([]);
    }
  }, [selectedChatId]);

  const fetchChats = async () => {
    setSidebarLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/chat/chats', {
        params: { userId: user.uid }
      });
      setChats(res.data.chats);
      // Auto-select the most recent chat if none selected
      if (res.data.chats.length > 0 && !selectedChatId) {
        setSelectedChatId(res.data.chats[0]._id);
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to load chats', severity: 'error' });
    } finally {
      setSidebarLoading(false);
    }
  };

  const fetchMessages = async (chatId) => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/chat/chats/${chatId}`);
      setMessages(res.data.chat.messages);
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to load messages', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      const result = await signInWithPopup(auth, provider);
      const userInfo = {
        uid: result.user.uid,
        name: result.user.displayName,
        email: result.user.email,
        picture: result.user.photoURL,
        sub: result.user.uid
      };
      setUser(userInfo);
      localStorage.setItem('user', JSON.stringify(userInfo));
      try {
        await axios.post('http://localhost:5000/api/auth/google', {
          credential: await result.user.getIdToken()
        });
      } catch (error) {
        console.error('Backend auth error:', error);
      }
      setSnackbar({ open: true, message: 'Successfully signed in!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Sign in failed. Please try again.', severity: 'error' });
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setSnackbar({ open: true, message: 'Successfully signed out!', severity: 'info' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Sign out failed.', severity: 'error' });
    }
  };

  const handleSend = async () => {
    if (!message.trim() || !user || !selectedChatId) return;
    setLoading(true);
    const userMessage = message;
    setMessage('');
    try {
      // Add user message and get AI response
      const res = await axios.post(`http://localhost:5000/api/chat/chats/${selectedChatId}/message`, {
        userId: user.uid,
        message: userMessage
      });
      setMessages(res.data.chat.messages);
      // Update chat list order (move this chat to top)
      fetchChats();
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to send message', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/chat/chats', {
        userId: user.uid,
        title: 'New Chat'
      });
      setChats([res.data.chat, ...chats]);
      setSelectedChatId(res.data.chat._id);
      setMessages([]);
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to create new chat', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleRenameChat = async (chatId) => {
    if (!editTitle.trim()) return;
    try {
      const res = await axios.put(`http://localhost:5000/api/chat/chats/${chatId}`, { title: editTitle });
      setChats(chats.map(c => c._id === chatId ? { ...c, title: res.data.chat.title } : c));
      setEditingChatId(null);
      setEditTitle('');
      setSnackbar({ open: true, message: 'Chat renamed', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to rename chat', severity: 'error' });
    }
  };

  const handleDeleteChat = async (chatId) => {
    try {
      await axios.delete(`http://localhost:5000/api/chat/chats/${chatId}`);
      const updatedChats = chats.filter(c => c._id !== chatId);
      setChats(updatedChats);
      if (selectedChatId === chatId) {
        setSelectedChatId(updatedChats.length > 0 ? updatedChats[0]._id : null);
      }
      setSnackbar({ open: true, message: 'Chat deleted', severity: 'info' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to delete chat', severity: 'error' });
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderMessage = (content) => (
    <ReactMarkdown
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          return !inline && match ? (
            <SyntaxHighlighter
              style={tomorrow}
              language={match[1]}
              PreTag="div"
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );

  if (authLoading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
            <Card sx={{ maxWidth: 400, width: '100%', textAlign: 'center', p: 4, borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
              <CircularProgress size={60} sx={{ mb: 2 }} />
              <Typography variant="h6" gutterBottom>Loading Constitutional AI</Typography>
              <Typography variant="body2" color="text.secondary">Initializing...</Typography>
            </Card>
          </motion.div>
        </Box>
      </ThemeProvider>
    );
  }

  if (!user) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Card sx={{ maxWidth: 400, width: '100%', textAlign: 'center', p: 4, borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
              <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ duration: 0.5 }}>
                <SmartToy sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              </motion.div>
              <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>Constitutional AI</Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>Your intelligent assistant for Indian Constitutional queries</Typography>
              <Button variant="contained" size="large" onClick={handleGoogleSignIn} startIcon={<Google />} sx={{ mb: 2, px: 4, py: 1.5, borderRadius: 3, textTransform: 'none', fontSize: '1.1rem', fontWeight: 500 }}>Sign in with Google</Button>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Secure authentication with Firebase</Typography>
            </Card>
          </motion.div>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh' }}>
        {/* App Bar */}
        <HideOnScroll>
          <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <Toolbar>
              <IconButton color="inherit" edge="start" onClick={() => setDrawerOpen(true)} sx={{ mr: 2 }}>
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>Constitutional AI</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton color="inherit" onClick={() => setDarkMode(!darkMode)}>{darkMode ? <LightMode /> : <DarkMode />}</IconButton>
                <Avatar src={user.picture} alt={user.name} sx={{ width: 32, height: 32, cursor: 'pointer' }} onClick={() => setDrawerOpen(true)} />
              </Box>
            </Toolbar>
          </AppBar>
        </HideOnScroll>
        {/* Sidebar Drawer */}
        <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)} sx={{ '& .MuiDrawer-paper': { width: 320, boxSizing: 'border-box' } }}>
          <Box sx={{ p: 2, mt: 8, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar src={user.picture} alt={user.name} sx={{ width: 48, height: 48, mr: 2 }} />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{user.name}</Typography>
                <Typography variant="body2" color="text.secondary">{user.email}</Typography>
              </Box>
            </Box>
            <Button variant="outlined" startIcon={<AddIcon />} fullWidth sx={{ mb: 2, borderRadius: 2 }} onClick={handleNewChat} disabled={sidebarLoading || loading}>New Chat</Button>
            <Divider sx={{ mb: 1 }} />
            <Box sx={{ flex: 1, overflowY: 'auto' }}>
              <List>
                {sidebarLoading ? (
                  <ListItem>
                    <CircularProgress size={20} />
                  </ListItem>
                ) : (
                  chats.map((chat) => (
                    <ListItem
                      button
                      key={chat._id}
                      selected={selectedChatId === chat._id}
                      onClick={() => setSelectedChatId(chat._id)}
                      sx={{ borderRadius: 2, mb: 1, alignItems: 'center' }}
                      secondaryAction={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          {editingChatId === chat._id ? (
                            <>
                              <IconButton edge="end" size="small" color="primary" onClick={(e) => { e.stopPropagation(); handleRenameChat(chat._id); }}><CheckIcon /></IconButton>
                              <IconButton edge="end" size="small" color="error" onClick={(e) => { e.stopPropagation(); setEditingChatId(null); setEditTitle(''); }}><CloseIcon /></IconButton>
                            </>
                          ) : (
                            <>
                              <IconButton edge="end" size="small" onClick={(e) => { e.stopPropagation(); setEditingChatId(chat._id); setEditTitle(chat.title); }}><EditIcon fontSize="small" /></IconButton>
                              <IconButton edge="end" size="small" onClick={(e) => { e.stopPropagation(); handleDeleteChat(chat._id); }}><DeleteIcon fontSize="small" /></IconButton>
                            </>
                          )}
                        </Box>
                      }
                    >
                      {editingChatId === chat._id ? (
                        <TextField
                          value={editTitle}
                          onChange={e => setEditTitle(e.target.value)}
                          size="small"
                          autoFocus
                          onClick={e => e.stopPropagation()}
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleRenameChat(chat._id);
                            if (e.key === 'Escape') { setEditingChatId(null); setEditTitle(''); }
                          }}
                          sx={{ minWidth: 100, maxWidth: 140, mr: 1 }}
                        />
                      ) : (
                        <ListItemText
                          primary={chat.title || 'New Chat'}
                          secondary={new Date(chat.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                          primaryTypographyProps={{ fontWeight: selectedChatId === chat._id ? 600 : 400 }}
                        />
                      )}
                    </ListItem>
                  ))
                )}
              </List>
            </Box>
            <Divider sx={{ my: 2 }} />
            <List>
              <ListItem button onClick={handleLogout}>
                <ListItemIcon><Logout /></ListItemIcon>
                <ListItemText primary="Sign Out" />
              </ListItem>
            </List>
          </Box>
        </Drawer>
        {/* Main Content */}
        <Box component="main" sx={{ flexGrow: 1, height: '100vh', display: 'flex', flexDirection: 'column', pt: 8 }}>
          {/* Chat Container */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2, gap: 2 }}>
            {/* Welcome Message */}
            {messages.length === 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <Card sx={{ mb: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Welcome, {user.name}! 👋</Typography>
                    <Typography variant="body2">I'm your Constitutional AI assistant. Start a new chat or select a previous chat to continue your conversation about the Indian Constitution.</Typography>
                  </CardContent>
                </Card>
              </motion.div>
            )}
            {/* Chat Messages */}
            <Paper elevation={0} sx={{ flex: 1, overflow: 'auto', borderRadius: 3, border: '1px solid', borderColor: 'divider', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <AnimatePresence>
                {messages.map((chat, index) => (
                  <motion.div key={index} initial={{ opacity: 0, x: chat.role === 'user' ? 20 : -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
                    <Box sx={{ display: 'flex', justifyContent: chat.role === 'user' ? 'flex-end' : 'flex-start', mb: 2 }}>
                      <Box sx={{ maxWidth: '70%', display: 'flex', flexDirection: 'column', alignItems: chat.role === 'user' ? 'flex-end' : 'flex-start' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          {chat.role === 'bot' && (
                            <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.main' }}><SmartToy sx={{ fontSize: 16 }} /></Avatar>
                          )}
                          <Typography variant="caption" color="text.secondary">{chat.role === 'user' ? user.name : 'Constitutional AI'}</Typography>
                          <Typography variant="caption" color="text.secondary">{formatTime(chat.timestamp)}</Typography>
                        </Box>
                        <Paper elevation={1} sx={{ p: 2, backgroundColor: chat.role === 'user' ? 'primary.main' : 'background.paper', color: chat.role === 'user' ? 'white' : 'text.primary', borderRadius: 2, '& pre': { backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 1, p: 1, overflow: 'auto' }, '& code': { backgroundColor: 'rgba(0,0,0,0.05)', px: 0.5, py: 0.25, borderRadius: 0.5, fontSize: '0.875em' } }}>{renderMessage(chat.content)}</Paper>
                      </Box>
                    </Box>
                  </motion.div>
                ))}
              </AnimatePresence>
              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2 }}>
                    <CircularProgress size={20} />
                    <Typography variant="body2" color="text.secondary">AI is thinking...</Typography>
                  </Box>
                </motion.div>
              )}
            </Paper>
            {/* Input Area */}
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
              <TextField fullWidth multiline maxRows={4} variant="outlined" placeholder="Ask about the Indian Constitution..." value={message} onChange={(e) => setMessage(e.target.value)} onKeyPress={handleKeyPress} disabled={loading || !selectedChatId} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
              <Zoom in={message.trim().length > 0 && !!selectedChatId}>
                <Fab color="primary" onClick={handleSend} disabled={loading || !message.trim() || !selectedChatId} sx={{ minWidth: 56, height: 56 }}>
                  <SendIcon />
                </Fab>
              </Zoom>
            </Box>
          </Box>
        </Box>
      </Box>
      {/* Snackbar for notifications */}
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </ThemeProvider>
  );
}

export default App; 