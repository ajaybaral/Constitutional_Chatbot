import React, { useState } from 'react';
import { 
  Box, Typography, List, ListItem,
  Collapse, Avatar, Menu, MenuItem, Button
} from '@mui/material';
import { 
  Plus, MessageSquare, Folder as FolderIcon,
  Search, ChevronDown, ChevronRight, Pin, LogOut
} from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = ({ 
  user, chats, folders, activeChatId, onNewChat, 
  onSelectChat, onLogout, onCreateFolder, onMoveChat
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFolders, setExpandedFolders] = useState({});
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);

  const toggleFolder = (folderId) => {
    setExpandedFolders(prev => ({ ...prev, [folderId]: !prev[folderId] }));
  };

  // Group chats by folder
  const unorganizedChats = chats.filter(c => !c.folderId);
  const pinnedChats = chats.filter(c => c.isPinned);

  const filteredChats = chats.filter(chat => 
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={{ 
      width: 280, 
      height: '100vh', 
      bgcolor: '#0F172A', 
      borderRight: '1px solid #1E293B',
      display: 'flex',
      flexDirection: 'column',
      color: '#94A3B8',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Playful corner decoration */}
      <svg width="80" height="80" viewBox="0 0 80 80" style={{ position: 'absolute', top: 0, right: 0, opacity: 0.1 }}>
        <circle cx="60" cy="20" r="15" fill="#F4CD63" />
        <circle cx="70" cy="10" r="8" fill="#F5A660" />
      </svg>

      {/* Header */}
      <Box sx={{ p: 2, position: 'relative' }}>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={onNewChat}
            startIcon={<Plus size={20} />}
            sx={{
              bgcolor: '#4F96B1',
              color: 'white',
              textTransform: 'none',
              borderRadius: '16px',
              py: 1.5,
              fontSize: '0.95rem',
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(79,150,177,0.3)',
              '&:hover': { 
                bgcolor: '#3d7a91',
                boxShadow: '0 6px 16px rgba(79,150,177,0.4)',
              }
            }}
          >
            New Chat 
          </Button>
        </motion.div>
      </Box>

      {/* Search */}
      <Box sx={{ px: 2, mb: 2 }}>
        <Box sx={{ 
          position: 'relative', 
          bgcolor: '#1E293B', 
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          border: '1px solid #334155',
          transition: 'all 0.2s',
          '&:focus-within': {
            borderColor: '#4F96B1',
            boxShadow: '0 0 0 3px rgba(79,150,177,0.1)'
          }
        }}>
          <Search size={16} style={{ marginLeft: 12, opacity: 0.5 }} />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              padding: '10px 12px',
              color: '#F8FAFC',
              outline: 'none',
              fontSize: '0.9rem'
            }}
          />
        </Box>
      </Box>

      {/* Chat List */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 2 }}>
        <List disablePadding>
          {pinnedChats.length > 0 && !searchQuery && (
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, pl: 1.5, mb: 1 }}>
                <Pin size={14} />
                <Typography variant="caption" sx={{ color: '#4F96B1', fontWeight: 600, letterSpacing: '0.05em' }}>
                  PINNED
                </Typography>
              </Box>
              {pinnedChats.map(chat => (
                <ChatListItem 
                  key={chat._id} 
                  chat={chat} 
                  isActive={activeChatId === chat._id} 
                  onClick={() => onSelectChat(chat._id)}
                />
              ))}
            </Box>
          )}

          {/* Folders */}
          {folders?.map(folder => (
            <Box key={folder._id} sx={{ mb: 1 }}>
              <Box 
                onClick={() => toggleFolder(folder._id)}
                sx={{ 
                  display: 'flex', alignItems: 'center', cursor: 'pointer',
                  p: 1, borderRadius: '12px',
                  transition: 'all 0.2s',
                  '&:hover': { bgcolor: '#1E293B', transform: 'translateX(2px)' }
                }}
              >
                {expandedFolders[folder._id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                <FolderIcon size={16} style={{ margin: '0 8px', color: folder.color }} />
                <Typography variant="body2" sx={{ fontWeight: 500, color: '#E2E8F0' }}>{folder.name}</Typography>
              </Box>
              <Collapse in={expandedFolders[folder._id]}>
                <Box sx={{ pl: 2 }}>
                  {chats.filter(c => c.folderId === folder._id).map(chat => (
                    <ChatListItem 
                      key={chat._id} 
                      chat={chat} 
                      isActive={activeChatId === chat._id} 
                      onClick={() => onSelectChat(chat._id)}
                    />
                  ))}
                  {chats.filter(c => c.folderId === folder._id).length === 0 && (
                    <Typography variant="caption" sx={{ pl: 4, py: 1, display: 'block', opacity: 0.5, fontStyle: 'italic' }}>
                      No chats here yet 📭
                    </Typography>
                  )}
                </Box>
              </Collapse>
            </Box>
          ))}

          {/* Unorganized Chats */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" sx={{ pl: 1.5, mb: 1, display: 'block', opacity: 0.5 }}>
              RECENT CHATS 💬
            </Typography>
            {searchQuery 
              ? filteredChats.map(chat => (
                  <ChatListItem 
                    key={chat._id} 
                    chat={chat} 
                    isActive={activeChatId === chat._id} 
                    onClick={() => onSelectChat(chat._id)}
                  />
                ))
              : unorganizedChats.map(chat => (
                  <ChatListItem 
                    key={chat._id} 
                    chat={chat} 
                    isActive={activeChatId === chat._id} 
                    onClick={() => onSelectChat(chat._id)}
                  />
                ))
            }
          </Box>
        </List>
      </Box>

      {/* Playful bottom decoration */}
      <svg width="280" height="40" viewBox="0 0 280 40" style={{ position: 'absolute', bottom: 60, left: 0, opacity: 0.05 }}>
        <path d="M0 20 Q70 10 140 20 T280 20" fill="none" stroke="#4F96B1" strokeWidth="2" />
      </svg>

      {/* User Footer */}
      <Box sx={{ 
        p: 2, 
        borderTop: '1px solid #1E293B',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        bgcolor: 'rgba(30, 41, 59, 0.5)'
      }}>
        <Box 
          onClick={(e) => setUserMenuAnchor(e.currentTarget)}
          sx={{ 
            display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer',
            p: 1, borderRadius: '12px', width: '100%',
            transition: 'all 0.2s',
            '&:hover': { bgcolor: '#1E293B', transform: 'translateY(-2px)' }
          }}
        >
          <Avatar 
            src={user?.picture} 
            alt={user?.name} 
            sx={{ 
              width: 36, 
              height: 36,
              border: '2px solid #4F96B1'
            }} 
          />
          <Box sx={{ overflow: 'hidden' }}>
            <Typography variant="body2" noWrap sx={{ color: '#F8FAFC', fontWeight: 600 }}>
              {user?.name} 👋
            </Typography>
            <Typography variant="caption" noWrap sx={{ color: '#64748B', fontSize: '0.7rem' }}>
              Online
            </Typography>
          </Box>
        </Box>
        
        <Menu
          anchorEl={userMenuAnchor}
          open={Boolean(userMenuAnchor)}
          onClose={() => setUserMenuAnchor(null)}
          PaperProps={{
            sx: {
              bgcolor: '#1E293B',
              color: '#F8FAFC',
              border: '1px solid #334155',
              borderRadius: '12px',
              mt: -1
            }
          }}
        >
          <MenuItem onClick={onLogout} sx={{ gap: 1, borderRadius: '8px', m: 0.5 }}>
            <LogOut size={16} /> Sign out
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

const ChatListItem = ({ chat, isActive, onClick }) => (
  <motion.div whileHover={{ x: 4 }} transition={{ duration: 0.2 }}>
    <ListItem
      onClick={onClick}
      sx={{
        borderRadius: '12px',
        mb: 0.5,
        cursor: 'pointer',
        bgcolor: isActive ? 'rgba(79, 150, 177, 0.15)' : 'transparent',
        color: isActive ? '#4F96B1' : '#94A3B8',
        border: isActive ? '1px solid rgba(79, 150, 177, 0.3)' : '1px solid transparent',
        transition: 'all 0.2s',
        '&:hover': {
          bgcolor: isActive ? 'rgba(79, 150, 177, 0.2)' : '#1E293B',
          borderColor: isActive ? 'rgba(79, 150, 177, 0.4)' : '#334155'
        }
      }}
    >
      <MessageSquare size={16} style={{ marginRight: 12, flexShrink: 0 }} />
      <Typography 
        variant="body2" 
        noWrap 
        sx={{ 
          flex: 1,
          color: isActive ? '#4F96B1' : '#E2E8F0',
          fontWeight: isActive ? 600 : 400
        }}
      >
        {chat.title}
      </Typography>
    </ListItem>
  </motion.div>
);

export default Sidebar;
