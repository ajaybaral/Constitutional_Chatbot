import React, { useState } from 'react';
import { 
  Box, Typography, List, ListItem, Collapse, Avatar, Menu, MenuItem, 
  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  IconButton, Divider, Chip
} from '@mui/material';
import { 
  Plus, MessageSquare, Folder as FolderIcon, Search, ChevronDown, 
  ChevronRight, Pin, LogOut, MoreVertical, Edit2, Trash2, FolderPlus,
  Palette, MoveRight, Check
} from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = ({ 
  user, chats, folders, activeChatId, onNewChat, onSelectChat, onLogout, 
  onCreateFolder, onRenameChat, onDeleteChat, onMoveChat, onPinChat,
  onRenameFolder, onDeleteFolder, onUpdateFolderColor
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFolders, setExpandedFolders] = useState({});
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  
  // Dialog states
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [renameChatDialog, setRenameChatDialog] = useState({ open: false, chat: null });
  const [renameFolderDialog, setRenameFolderDialog] = useState({ open: false, folder: null });
  const [moveChatDialog, setMoveChatDialog] = useState({ open: false, chat: null });
  
  // Context menu states
  const [chatMenuAnchor, setChatMenuAnchor] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [folderMenuAnchor, setFolderMenuAnchor] = useState(null);
  const [selectedFolder, setSelectedFolder] = useState(null);

  // Form states
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('#4F96B1');
  const [renameValue, setRenameValue] = useState('');
  const [selectedMoveFolder, setSelectedMoveFolder] = useState(null);

  const toggleFolder = (folderId) => {
    setExpandedFolders(prev => ({ ...prev, [folderId]: !prev[folderId] }));
  };

  const unorganizedChats = chats.filter(c => !c.folderId && !c.isPinned);
  const pinnedChats = chats.filter(c => c.isPinned);

  const filteredChats = chats.filter(chat => 
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const colorOptions = ['#4F96B1', '#F4CD63', '#F5A660', '#F06669', '#9b59b6', '#2ecc71'];

  // Chat menu handlers
  const handleChatMenuOpen = (event, chat) => {
    event.stopPropagation();
    setSelectedChat(chat);
    setChatMenuAnchor(event.currentTarget);
  };

  const handleChatMenuClose = () => {
    setChatMenuAnchor(null);
    setSelectedChat(null);
  };

  const handleRenameChat = () => {
    setRenameValue(selectedChat.title);
    setRenameChatDialog({ open: true, chat: selectedChat });
    handleChatMenuClose();
  };

  const handleDeleteChat = async () => {
    if (window.confirm(`Delete "${selectedChat.title}" chat?`)) {
      await onDeleteChat(selectedChat._id);
    }
    handleChatMenuClose();
  };

  const handleMoveChat = () => {
    setMoveChatDialog({ open: true, chat: selectedChat });
    handleChatMenuClose();
  };

  const handleTogglePin = async () => {
    await onPinChat(selectedChat._id);
    handleChatMenuClose();
  };

  // Folder menu handlers
  const handleFolderMenuOpen = (event, folder) => {
    event.stopPropagation();
    setSelectedFolder(folder);
    setFolderMenuAnchor(event.currentTarget);
  };

  const handleFolderMenuClose = () => {
    setFolderMenuAnchor(null);
    setSelectedFolder(null);
  };

  const handleRenameFolder = () => {
    setRenameValue(selectedFolder.name);
    setRenameFolderDialog({ open: true, folder: selectedFolder });
    handleFolderMenuClose();
  };

  const handleDeleteFolder = async () => {
    if (window.confirm(`Delete folder "${selectedFolder.name}"? (Chats will be moved to unorganized)`)) {
      await onDeleteFolder(selectedFolder._id);
    }
    handleFolderMenuClose();
  };

  // Dialog handlers
  const handleCreateFolder = async () => {
    if (newFolderName.trim()) {
      await onCreateFolder(newFolderName, newFolderColor);
      setNewFolderName('');
      setNewFolderColor('#4F96B1');
      setCreateFolderOpen(false);
    }
  };

  const handleSaveRenameChat = async () => {
    if (renameValue.trim()) {
      await onRenameChat(renameChatDialog.chat._id, renameValue);
      setRenameChatDialog({ open: false, chat: null });
      setRenameValue('');
    }
  };

  const handleSaveRenameFolder = async () => {
    if (renameValue.trim()) {
      await onRenameFolder(renameFolderDialog.folder._id, renameValue);
      setRenameFolderDialog({ open: false, folder: null });
      setRenameValue('');
    }
  };

  const handleSaveMoveChat = async () => {
    await onMoveChat(moveChatDialog.chat._id, selectedMoveFolder);
    setMoveChatDialog({ open: false, chat: null });
    setSelectedMoveFolder(null);
  };

  return (
    <Box sx={{ 
      width: 280, height: '100vh', bgcolor: '#0F172A', 
      borderRight: '1px solid #1E293B', display: 'flex',
      flexDirection: 'column', color: '#94A3B8', position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorations */}
      <svg width="80" height="80" viewBox="0 0 80 80" style={{ position: 'absolute', top: 0, right: 0, opacity: 0.1 }}>
        <circle cx="60" cy="20" r="15" fill="#F4CD63" />
        <circle cx="70" cy="10" r="8" fill="#F5A660" />
      </svg>

      {/* Header */}
      <Box sx={{ p: 2 }}>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button fullWidth variant="contained" onClick={onNewChat} startIcon={<Plus size={20} />}
            sx={{
              bgcolor: '#4F96B1', color: 'white', textTransform: 'none',
              borderRadius: '16px', py: 1.5, fontSize: '0.95rem', fontWeight: 600,
              boxShadow: '0 4px 12px rgba(79,150,177,0.3)',
              '&:hover': { bgcolor: '#3d7a91', boxShadow: '0 6px 16px rgba(79,150,177,0.4)' }
            }}
          >
            New Chat ✨
          </Button>
        </motion.div>
        
        <Button fullWidth onClick={() => setCreateFolderOpen(true)} startIcon={<FolderPlus size={18} />}
          sx={{
            mt: 1, color: '#94A3B8', textTransform: 'none',
            borderRadius: '12px', py: 1, fontSize: '0.85rem',
            '&:hover': { bgcolor: '#1E293B', color: '#4F96B1' }
          }}
        >
          New Folder 📁
        </Button>
      </Box>

      {/* Search */}
      <Box sx={{ px: 2, mb: 2 }}>
        <Box sx={{ 
          position: 'relative', bgcolor: '#1E293B', borderRadius: '12px',
          display: 'flex', alignItems: 'center', border: '1px solid #334155',
          transition: 'all 0.2s',
          '&:focus-within': { borderColor: '#4F96B1', boxShadow: '0 0 0 3px rgba(79,150,177,0.1)' }
        }}>
          <Search size={16} style={{ marginLeft: 12, opacity: 0.5 }} />
          <input type="text" placeholder="Search chats..." value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%', background: 'transparent', border: 'none',
              padding: '10px 12px', color: '#F8FAFC', outline: 'none', fontSize: '0.9rem'
            }}
          />
        </Box>
      </Box>

      {/* Chat List */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 2 }}>
        <List disablePadding>
          {/* Pinned */}
          {pinnedChats.length > 0 && !searchQuery && (
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, pl: 1.5, mb: 1 }}>
                <Pin size={14} />
                <Typography variant="caption" sx={{ color: '#4F96B1', fontWeight: 600 }}>PINNED</Typography>
              </Box>
              {pinnedChats.map(chat => (
                <ChatListItem key={chat._id} chat={chat} isActive={activeChatId === chat._id} 
                  onClick={() => onSelectChat(chat._id)} onMenuClick={handleChatMenuOpen} />
              ))}
            </Box>
          )}

          {/* Folders */}
          {!searchQuery && folders?.map(folder => (
            <Box key={folder._id} sx={{ mb: 1 }}>
              <Box sx={{ 
                display: 'flex', alignItems: 'center', cursor: 'pointer',
                p: 1, borderRadius: '12px', transition: 'all 0.2s',
                '&:hover': { bgcolor: '#1E293B' }
              }}>
                <Box onClick={() => toggleFolder(folder._id)} sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  {expandedFolders[folder._id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  <FolderIcon size={16} style={{ margin: '0 8px', color: folder.color || '#4F96B1' }} />
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#E2E8F0', flex: 1 }}>{folder.name}</Typography>
                </Box>
                <IconButton size="small" onClick={(e) => handleFolderMenuOpen(e, folder)}
                  sx={{ color: '#64748B', '&:hover': { color: '#4F96B1' } }}>
                  <MoreVertical size={16} />
                </IconButton>
              </Box>
              <Collapse in={expandedFolders[folder._id]}>
                <Box sx={{ pl: 2 }}>
                  {chats.filter(c => c.folderId === folder._id).map(chat => (
                    <ChatListItem key={chat._id} chat={chat} isActive={activeChatId === chat._id} 
                      onClick={() => onSelectChat(chat._id)} onMenuClick={handleChatMenuOpen} />
                  ))}
                </Box>
              </Collapse>
            </Box>
          ))}

          {/* Unorganized */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" sx={{ pl: 1.5, mb: 1, display: 'block', opacity: 0.5 }}>
              RECENT CHATS 💬
            </Typography>
            {(searchQuery ? filteredChats : unorganizedChats).map(chat => (
              <ChatListItem key={chat._id} chat={chat} isActive={activeChatId === chat._id} 
                onClick={() => onSelectChat(chat._id)} onMenuClick={handleChatMenuOpen} />
            ))}
          </Box>
        </List>
      </Box>

      <svg width="280" height="40" viewBox="0 0 280 40" style={{ position: 'absolute', bottom: 60, left: 0, opacity: 0.05 }}>
        <path d="M0 20 Q70 10 140 20 T280 20" fill="none" stroke="#4F96B1" strokeWidth="2" />
      </svg>

      {/* User Footer */}
      <Box sx={{ p: 2, borderTop: '1px solid #1E293B', display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'rgba(30, 41, 59, 0.5)' }}>
        <Box onClick={(e) => setUserMenuAnchor(e.currentTarget)}
          sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer', p: 1, borderRadius: '12px', width: '100%',
            transition: 'all 0.2s', '&:hover': { bgcolor: '#1E293B', transform: 'translateY(-2px)' } }}>
          <Avatar src={user?.picture} alt={user?.name} sx={{ width: 36, height: 36, border: '2px solid #4F96B1' }} />
          <Box sx={{ overflow: 'hidden' }}>
            <Typography variant="body2" noWrap sx={{ color: '#F8FAFC', fontWeight: 600 }}>{user?.name} 👋</Typography>
            <Typography variant="caption" noWrap sx={{ color: '#64748B', fontSize: '0.7rem' }}>Online</Typography>
          </Box>
        </Box>
        <Menu anchorEl={userMenuAnchor} open={Boolean(userMenuAnchor)} onClose={() => setUserMenuAnchor(null)}
          PaperProps={{ sx: { bgcolor: '#1E293B', color: '#F8FAFC', border: '1px solid #334155', borderRadius: '12px', mt: -1 } }}>
          <MenuItem onClick={onLogout} sx={{ gap: 1, borderRadius: '8px', m: 0.5 }}>
            <LogOut size={16} /> Sign out
          </MenuItem>
        </Menu>
      </Box>

      {/* Chat Context Menu */}
      <Menu anchorEl={chatMenuAnchor} open={Boolean(chatMenuAnchor)} onClose={handleChatMenuClose}
        PaperProps={{ sx: { bgcolor: '#1E293B', color: '#F8FAFC', border: '1px solid #334155', borderRadius: '12px' } }}>
        <MenuItem onClick={handleTogglePin} sx={{ gap: 1.5, fontSize: '0.9rem' }}>
          <Pin size={16} /> {selectedChat?.isPinned ? 'Unpin' : 'Pin'} Chat
        </MenuItem>
        <MenuItem onClick={handleRenameChat} sx={{ gap: 1.5, fontSize: '0.9rem' }}>
          <Edit2 size={16} /> Rename Chat
        </MenuItem>
        <MenuItem onClick={handleMoveChat} sx={{ gap: 1.5, fontSize: '0.9rem' }}>
          <MoveRight size={16} /> Move to Folder
        </MenuItem>
        <Divider sx={{ bgcolor: '#334155', my: 0.5 }} />
        <MenuItem onClick={handleDeleteChat} sx={{ gap: 1.5, fontSize: '0.9rem', color: '#F06669' }}>
          <Trash2 size={16} /> Delete Chat
        </MenuItem>
      </Menu>

      {/* Folder Context Menu */}
      <Menu anchorEl={folderMenuAnchor} open={Boolean(folderMenuAnchor)} onClose={handleFolderMenuClose}
        PaperProps={{ sx: { bgcolor: '#1E293B', color: '#F8FAFC', border: '1px solid #334155', borderRadius: '12px' } }}>
        <MenuItem onClick={handleRenameFolder} sx={{ gap: 1.5, fontSize: '0.9rem' }}>
          <Edit2 size={16} /> Rename Folder
        </MenuItem>
        <MenuItem onClick={() => { /* Color picker in dialog */ }} sx={{ gap: 1.5, fontSize: '0.9rem' }}>
          <Palette size={16} /> Change Color
        </MenuItem>
        <Divider sx={{ bgcolor: '#334155', my: 0.5 }} />
        <MenuItem onClick={handleDeleteFolder} sx={{ gap: 1.5, fontSize: '0.9rem', color: '#F06669' }}>
          <Trash2 size={16} /> Delete Folder
        </MenuItem>
      </Menu>

      {/* Create Folder Dialog */}
      <Dialog open={createFolderOpen} onClose={() => setCreateFolderOpen(false)} PaperProps={{ sx: { bgcolor: '#1E293B', color: '#F8FAFC', borderRadius: '16px', minWidth: 400 } }}>
        <DialogTitle sx={{ fontWeight: 600 }}>Create New Folder 📁</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Folder Name" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)}
            autoFocus margin="dense" sx={{ mt: 1, '& .MuiInputBase-root': { color: '#F8FAFC' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#334155' } } }} />
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>Choose Color</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {colorOptions.map(color => (
                <Box key={color} onClick={() => setNewFolderColor(color)}
                  sx={{ width: 40, height: 40, borderRadius: '8px', bgcolor: color, cursor: 'pointer',
                    border: newFolderColor === color ? '3px solid #F8FAFC' : '2px solid transparent',
                    transition: 'all 0.2s', '&:hover': { transform: 'scale(1.1)' } }} />
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setCreateFolderOpen(false)} sx={{ color: '#94A3B8' }}>Cancel</Button>
          <Button onClick={handleCreateFolder} variant="contained" sx={{ bgcolor: '#4F96B1', '&:hover': { bgcolor: '#3d7a91' } }}>Create</Button>
        </DialogActions>
      </Dialog>

      {/* Rename Chat Dialog */}
      <Dialog open={renameChatDialog.open} onClose={() => setRenameChatDialog({ open: false, chat: null })} PaperProps={{ sx: { bgcolor: '#1E293B', color: '#F8FAFC', borderRadius: '16px', minWidth: 400 } }}>
        <DialogTitle>Rename Chat ✏️</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Chat Name" value={renameValue} onChange={(e) => setRenameValue(e.target.value)}
            autoFocus margin="dense" sx={{ mt: 1, '& .MuiInputBase-root': { color: '#F8FAFC' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#334155' } } }} />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setRenameChatDialog({ open: false, chat: null })} sx={{ color: '#94A3B8' }}>Cancel</Button>
          <Button onClick={handleSaveRenameChat} variant="contained" sx={{ bgcolor: '#4F96B1', '&:hover': { bgcolor: '#3d7a91' } }}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Rename Folder Dialog */}
      <Dialog open={renameFolderDialog.open} onClose={() => setRenameFolderDialog({ open: false, folder: null })} PaperProps={{ sx: { bgcolor: '#1E293B', color: '#F8FAFC', borderRadius: '16px', minWidth: 400 } }}>
        <DialogTitle>Rename Folder ✏️</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Folder Name" value={renameValue} onChange={(e) => setRenameValue(e.target.value)}
            autoFocus margin="dense" sx={{ mt: 1, '& .MuiInputBase-root': { color: '#F8FAFC' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#334155' } } }} />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setRenameFolderDialog({ open: false, folder: null })} sx={{ color: '#94A3B8' }}>Cancel</Button>
          <Button onClick={handleSaveRenameFolder} variant="contained" sx={{ bgcolor: '#4F96B1', '&:hover': { bgcolor: '#3d7a91' } }}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Move Chat Dialog */}
      <Dialog open={moveChatDialog.open} onClose={() => setMoveChatDialog({ open: false, chat: null })} PaperProps={{ sx: { bgcolor: '#1E293B', color: '#F8FAFC', borderRadius: '16px', minWidth: 400 } }}>
        <DialogTitle>Move Chat to Folder 📂</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, color: '#94A3B8' }}>
            Select a folder for "{moveChatDialog.chat?.title}"
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Chip label="❌ Remove from folder" onClick={() => setSelectedMoveFolder(null)}
              sx={{ bgcolor: selectedMoveFolder === null ? '#4F96B1' : '#334155', color: '#F8FAFC', justifyContent: 'flex-start' }} />
            {folders?.map(folder => (
              <Chip key={folder._id} label={`📁 ${folder.name}`} onClick={() => setSelectedMoveFolder(folder._id)}
                sx={{ bgcolor: selectedMoveFolder === folder._id ? '#4F96B1' : '#334155', color: '#F8FAFC', justifyContent: 'flex-start' }} />
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setMoveChatDialog({ open: false, chat: null })} sx={{ color: '#94A3B8' }}>Cancel</Button>
          <Button onClick={handleSaveMoveChat} variant="contained" sx={{ bgcolor: '#4F96B1', '&:hover': { bgcolor: '#3d7a91' } }}>Move</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const ChatListItem = ({ chat, isActive, onClick, onMenuClick }) => (
  <motion.div whileHover={{ x: 4 }} transition={{ duration: 0.2 }}>
    <ListItem onClick={onClick}
      sx={{
        borderRadius: '12px', mb: 0.5, cursor: 'pointer', display: 'flex', alignItems: 'center',
        bgcolor: isActive ? 'rgba(79, 150, 177, 0.15)' : 'transparent',
        color: isActive ? '#4F96B1' : '#94A3B8',
        border: isActive ? '1px solid rgba(79, 150, 177, 0.3)' : '1px solid transparent',
        transition: 'all 0.2s',
        '&:hover': { bgcolor: isActive ? 'rgba(79, 150, 177, 0.2)' : '#1E293B', borderColor: isActive ? 'rgba(79, 150, 177, 0.4)' : '#334155' }
      }}
    >
      <MessageSquare size={16} style={{ marginRight: 12, flexShrink: 0 }} />
      <Typography variant="body2" noWrap sx={{ flex: 1, color: isActive ? '#4F96B1' : '#E2E8F0', fontWeight: isActive ? 600 : 400 }}>
        {chat.title}
      </Typography>
      <IconButton size="small" onClick={(e) => onMenuClick(e, chat)}
        sx={{ ml: 1, opacity: 0, '.MuiListItem-root:hover &': { opacity: 1 }, color: '#64748B', '&:hover': { color: '#4F96B1', bgcolor: 'rgba(79,150,177,0.1)' } }}>
        <MoreVertical size={14} />
      </IconButton>
    </ListItem>
  </motion.div>
);

export default Sidebar;
