import React, { useRef, useEffect } from 'react';
import { Box, Typography, IconButton, Avatar, Paper } from '@mui/material';
import { Send, MoreVertical, Bot, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const ChatArea = ({ 
  chat, messages, loading, onSend, message, setMessage
}) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  if (!chat) {
    return (
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#0F172A', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}>
          <Bot size={48} color="#4F96B1" />
        </Box>
        <Typography variant="h5" color="#E2E8F0">Constitutional AI</Typography>
        <Typography color="#94A3B8">Select a conversation to start chatting</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: '#0F172A', height: '100vh', position: 'relative' }}>
      
      {/* Header */}
      <Box sx={{ 
        p: 2, 
        borderBottom: '1px solid #1E293B',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        bgcolor: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(10px)',
        zIndex: 10
      }}>
        <Box>
          <Typography variant="subtitle1" fontWeight={600} color="#F8FAFC">
            {chat.title}
          </Typography>
          <Typography variant="caption" color="#94A3B8">
            {messages.length} messages
          </Typography>
        </Box>
        <IconButton sx={{ color: '#94A3B8' }}>
          <MoreVertical size={20} />
        </IconButton>
      </Box>

      {/* Messages Area */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
        {messages.map((msg, idx) => (
          <MessageBubble key={idx} message={msg} />
        ))}
        {loading && (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Avatar sx={{ bgcolor: '#4F96B1', width: 32, height: 32 }}>
               <Bot size={18} />
            </Avatar>
            <Box sx={{ p: 2, bgcolor: '#1E293B', borderRadius: '4px 16px 16px 16px' }}>
              <div className="flex gap-1">
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} style={{ width: 6, height: 6, background: '#94A3B8', borderRadius: '50%' }} />
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} style={{ width: 6, height: 6, background: '#94A3B8', borderRadius: '50%' }} />
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} style={{ width: 6, height: 6, background: '#94A3B8', borderRadius: '50%' }} />
              </div>
            </Box>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input Area */}
      <Box sx={{ p: 3, pt: 2 }}>
        <Box sx={{ 
          position: 'relative',
          maxWidth: '800px',
          margin: '0 auto',
          bgcolor: '#1E293B',
          borderRadius: '16px',
          border: '1px solid #334155',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask anything about the Indian Constitution..."
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              padding: '16px 50px 16px 16px',
              color: '#F8FAFC',
              fontSize: '1rem',
              outline: 'none',
              resize: 'none',
              minHeight: '60px',
              maxHeight: '200px',
              fontFamily: 'Inter, sans-serif'
            }}
          />
          <IconButton 
            onClick={onSend}
            disabled={!message.trim() || loading}
            sx={{ 
              position: 'absolute', 
              right: 8, 
              bottom: 8,
              bgcolor: message.trim() ? '#4F96B1' : 'transparent',
              color: message.trim() ? 'white' : '#64748B',
              '&:hover': { bgcolor: message.trim() ? '#3d7a91' : 'transparent' }
            }}
          >
            <Send size={18} />
          </IconButton>
        </Box>
        <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 1, color: '#64748B' }}>
          AI can make mistakes. Please verify important constitutional information.
        </Typography>
      </Box>
    </Box>
  );
};

const MessageBubble = ({ message }) => {
  const isUser = message.role === 'user';
  
  return (
    <Box sx={{ 
      display: 'flex', 
      gap: 2, 
      flexDirection: isUser ? 'row-reverse' : 'row',
      maxWidth: '800px',
      mx: 'auto',
      width: '100%'
    }}>
      <Avatar sx={{ 
        bgcolor: isUser ? '#F5A660' : '#4F96B1', 
        width: 32, height: 32 
      }}>
        {isUser ? <User size={18} /> : <Bot size={18} />}
      </Avatar>

      <Paper elevation={0} sx={{ 
        p: 2, 
        maxWidth: '80%',
        bgcolor: isUser ? 'transparent' : 'rgba(30, 41, 59, 0.5)',
        color: '#E2E8F0',
        borderRadius: isUser ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
        border: isUser ? '1px solid #334155' : 'none'
      }}>
        {isUser ? (
          <Typography variant="body1">{message.content}</Typography>
        ) : (
          <div className="markdown">
            <ReactMarkdown
              components={{
                code({node, inline, className, children, ...props}) {
                  const match = /language-(\w+)/.exec(className || '')
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={vscDarkPlus}
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
                  )
                }
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </Paper>
    </Box>
  );
};

export default ChatArea;
