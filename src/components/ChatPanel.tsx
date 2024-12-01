'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  TextField, 
  IconButton, 
  Typography, 
  Avatar,
  Tooltip,
  Menu,
  useTheme,
  CircularProgress,
  Button,
  Badge,
} from '@mui/material';
import { 
  Send as SendIcon,
  FormatQuote as QuoteIcon,
  Delete as DeleteIcon,
  EmojiEmotions as EmojiIcon,
  Close as CloseIcon,
  Reply as ReplyIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { useSession } from 'next-auth/react';

interface Message {
  _id: string;
  content: string;
  author: {
    name: string;
    email: string;
    image?: string;
  };
  quotedMessage?: {
    _id: string;
    content: string;
    author: {
      name: string;
      email: string;
      image?: string;
    };
  };
  createdAt: string;
  reactions: Array<{
    emoji: string;
    users: string[];
  }>;
}

const ChatPanel: React.FC = () => {
  const theme = useTheme();
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [quotedMessage, setQuotedMessage] = useState<Message | null>(null);
  const [emojiPickerAnchor, setEmojiPickerAnchor] = useState<null | HTMLElement>(null);
  const [reactionMessage, setReactionMessage] = useState<Message | null>(null);
  const [onlineCount, setOnlineCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    fetchMessages();
    const messageInterval = setInterval(fetchMessages, 5000);

    // Online durumunu güncelle ve sayıyı al
    const updateOnlineStatus = async () => {
      try {
        const response = await fetch('/api/online', {
          method: session ? 'POST' : 'GET'
        });
        if (response.ok) {
          const data = await response.json();
          setOnlineCount(data.count);
        }
      } catch (error) {
        console.error('Online durum güncellenirken hata:', error);
      }
    };

    updateOnlineStatus();
    const onlineInterval = setInterval(updateOnlineStatus, 30000); // Her 30 saniyede bir güncelle

    return () => {
      clearInterval(messageInterval);
      clearInterval(onlineInterval);
    };
  }, [session]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/messages');
      const data = await response.json();
      // En son mesajlar altta olacak şekilde sırala
      setMessages([...data].sort((a: Message, b: Message) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      ));
    } catch (error) {
      console.error('Mesajlar yüklenirken hata:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !session?.user) return;

    setLoading(true);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newMessage,
          quotedMessage: quotedMessage?._id,
        }),
      });

      if (response.ok) {
        setNewMessage('');
        setQuotedMessage(null);
        await fetchMessages();
      }
    } catch (error) {
      console.error('Mesaj gönderilirken hata:', error);
    }
    setLoading(false);
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    if (!session?.user?.email) return;

    try {
      const message = messages.find(m => m._id === messageId);
      if (!message) return;

      const reaction = message.reactions.find(r => r.emoji === emoji);
      const hasReacted = reaction?.users.includes(session.user.email!);
      
      const response = await fetch('/api/messages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId,
          emoji,
          action: hasReacted ? 'remove' : 'add',
        }),
      });

      if (response.ok) {
        await fetchMessages();
      }
    } catch (error) {
      console.error('Emoji eklenirken/kaldırılırken hata:', error);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      const response = await fetch(`/api/messages?id=${messageId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchMessages();
      }
    } catch (error) {
      console.error('Mesaj silinirken hata:', error);
    }
  };

  return (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      bgcolor: theme.palette.mode === 'dark' ? '#1a1a1a' : '#f5f5f5',
    }}>
      <Box sx={{ 
        p: 2, 
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
        backgroundColor: theme.palette.mode === 'dark' ? '#2d2d2d' : '#ffffff',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
      }}>
        <Typography variant="h6" sx={{ flex: 1, fontWeight: 600 }}>Mesajlar</Typography>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
          padding: '4px 12px',
          borderRadius: 16,
        }}>
          <PersonIcon sx={{ fontSize: '1rem', color: theme.palette.success.main }} />
          <Typography variant="body2" color="text.secondary">
            {onlineCount} çevrimiçi
          </Typography>
        </Box>
        {!session && (
          <Button 
            variant="contained" 
            size="small"
            onClick={() => window.location.href = '/api/auth/signin'}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              boxShadow: 'none',
            }}
          >
            Giriş Yap
          </Button>
        )}
      </Box>

      <Box sx={{ 
        flex: 1, 
        overflowY: 'auto',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
      }}>
        {messages.map((message) => (
          <Box
            key={message._id}
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1,
              width: '100%',
            }}
          >
            <Avatar 
              src={message.author.image} 
              alt={message.author.name}
              sx={{ 
                width: 32, 
                height: 32,
                flexShrink: 0,
              }}
            />
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              gap: 0.5,
              flex: 1,
              minWidth: 0,
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle2" sx={{ 
                  fontWeight: 600, 
                  color: theme.palette.primary.main,
                }}>
                  @{message.author.name}
                </Typography>
                <Box sx={{ 
                  opacity: 0,
                  transition: 'opacity 0.2s',
                  display: 'flex',
                  gap: 0.5,
                  '&:hover': {
                    opacity: 1,
                  },
                }}>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      setReactionMessage(message);
                      setEmojiPickerAnchor(e.currentTarget);
                    }}
                  >
                    <EmojiIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => setQuotedMessage(message)}
                  >
                    <ReplyIcon fontSize="small" />
                  </IconButton>
                  {(session?.user?.email === message.author.email || session?.user?.isAdmin) && (
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteMessage(message._id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              </Box>

              {message.quotedMessage && (
                <Box sx={{ 
                  pl: 2,
                  borderLeft: `2px solid ${theme.palette.primary.main}`,
                  opacity: 0.7,
                  mb: 0.5,
                }}>
                  <Typography variant="caption" color="primary" sx={{ fontWeight: 600 }}>
                    @{message.quotedMessage.author?.name || 'Silinmiş Mesaj'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {message.quotedMessage.content || 'Bu mesaj silinmiş'}
                  </Typography>
                </Box>
              )}

              <Typography variant="body1" sx={{ 
                color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
                wordBreak: 'break-word',
              }}>
                {message.content}
              </Typography>

              {message.reactions.length > 0 && (
                <Box sx={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: 0.5,
                  mt: 0.5,
                }}>
                  {message.reactions.map((reaction) => (
                    <Tooltip
                      key={reaction.emoji}
                      title={reaction.users.map(email => {
                        const user = messages.find(m => m.author.email === email)?.author;
                        return user ? `@${user.name}` : email;
                      }).join(', ')}
                    >
                      <Box
                        onClick={() => handleReaction(message._id, reaction.emoji)}
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 0.5,
                          color: reaction.users.includes(session?.user?.email || '')
                            ? theme.palette.primary.main
                            : 'inherit',
                          cursor: 'pointer',
                          '&:hover': {
                            color: theme.palette.primary.main,
                          },
                        }}
                      >
                        {reaction.emoji} {reaction.users.length}
                      </Box>
                    </Tooltip>
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Box>

      {quotedMessage && (
        <Box sx={{ 
          p: 2, 
          borderTop: '1px solid rgba(0, 0, 0, 0.1)',
          bgcolor: theme.palette.mode === 'dark' ? '#2d2d2d' : '#ffffff',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}>
          <QuoteIcon color="primary" />
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" color="primary" sx={{ fontWeight: 600 }}>
              @{quotedMessage.author.name}
            </Typography>
            <Typography variant="body2">
              {quotedMessage.content}
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => setQuotedMessage(null)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      )}

      <Box sx={{ 
        p: 2, 
        borderTop: '1px solid rgba(0, 0, 0, 0.1)',
        backgroundColor: theme.palette.mode === 'dark' ? '#2d2d2d' : '#ffffff',
        display: 'flex',
        gap: 1,
      }}>
        <TextField
          fullWidth
          placeholder={session ? "Mesajınızı yazın..." : "Mesaj göndermek için giriş yapın"}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
          disabled={!session || loading}
          multiline
          maxRows={4}
          size="small"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              backgroundColor: theme.palette.mode === 'dark' ? '#1a1a1a' : '#f5f5f5',
            },
          }}
        />
        <IconButton
          color="primary"
          onClick={handleSendMessage}
          disabled={!session || loading || !newMessage.trim()}
          sx={{
            bgcolor: theme.palette.primary.main,
            color: '#ffffff',
            borderRadius: 3,
            width: 48,
            height: 48,
            '&:hover': {
              bgcolor: theme.palette.primary.dark,
            },
            '&.Mui-disabled': {
              bgcolor: theme.palette.action.disabledBackground,
              color: theme.palette.action.disabled,
            },
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
        </IconButton>
      </Box>

      <Menu
        anchorEl={emojiPickerAnchor}
        open={Boolean(emojiPickerAnchor)}
        onClose={() => {
          setEmojiPickerAnchor(null);
          setReactionMessage(null);
        }}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        <Box sx={{ p: 1 }}>
          <EmojiPicker
            onEmojiClick={(emojiData: EmojiClickData) => {
              if (reactionMessage) {
                handleReaction(reactionMessage._id, emojiData.emoji);
              }
              setEmojiPickerAnchor(null);
              setReactionMessage(null);
            }}
            width={300}
            height={400}
          />
        </Box>
      </Menu>
    </Box>
  );
};

export default ChatPanel;
