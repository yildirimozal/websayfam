'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  Avatar,
  Box,
  Typography,
  Tooltip,
} from '@mui/material';
import {
  Close as CloseIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material';
import { OnlineUser } from '../types';

interface OnlineUsersProps {
  open: boolean;
  onClose: () => void;
  users: OnlineUser[];
  onlineCount: number;
  onToggleDialog: () => void;
}

const OnlineUsers: React.FC<OnlineUsersProps> = ({
  open,
  onClose,
  users,
  onlineCount,
  onToggleDialog,
}) => {
  const theme = useTheme();

  // Misafir olmayan kullanıcıları filtrele
  const loggedInUsers = users.filter(user => user.name !== 'Misafir');
  const loggedInCount = loggedInUsers.length;

  return (
    <>
      <Tooltip title="Çevrimiçi kullanıcıları göster">
        <Box 
          onClick={onToggleDialog}
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
            padding: '4px 12px',
            borderRadius: 16,
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            },
          }}
        >
          <PersonIcon sx={{ fontSize: '1rem', color: theme.palette.success.main }} />
          <Typography variant="body2" color="text.secondary">
            {loggedInCount} çevrimiçi
          </Typography>
        </Box>
      </Tooltip>

      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          Çevrimiçi Kullanıcılar ({loggedInCount})
          <IconButton
            size="small"
            onClick={onClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <List>
            {loggedInUsers.length > 0 ? (
              loggedInUsers.map((user) => (
                <ListItem key={user.email}>
                  <ListItemAvatar>
                    <Avatar src={user.image} alt={user.name}>
                      {user.name?.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={user.name}
                    secondary={`Son görülme: ${new Date(user.lastSeen).toLocaleTimeString('tr-TR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}`}
                  />
                </ListItem>
              ))
            ) : (
              <ListItem>
                <ListItemText
                  primary="Henüz çevrimiçi kullanıcı yok"
                />
              </ListItem>
            )}
          </List>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default OnlineUsers;
