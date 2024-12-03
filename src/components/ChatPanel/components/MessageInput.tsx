'use client';

import React from 'react';
import { 
  Box, 
  TextField, 
  IconButton,
  CircularProgress,
  Typography,
} from '@mui/material';
import { 
  Send as SendIcon,
  Close as CloseIcon,
  FormatQuote as QuoteIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material';
import { Message } from '../types';

interface MessageInputProps {
  newMessage: string;
  onMessageChange: (value: string) => void;
  onSend: () => void;
  loading: boolean;
  session: any;
  quotedMessage: Message | null;
  onClearQuote: () => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
  newMessage,
  onMessageChange,
  onSend,
  loading,
  session,
  quotedMessage,
  onClearQuote,
}) => {
  const theme = useTheme();

  return (
    <>
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
          <IconButton size="small" onClick={onClearQuote}>
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
          onChange={(e) => onMessageChange(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && onSend()}
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
          onClick={onSend}
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
    </>
  );
};

export default MessageInput;
