'use client';

import React from 'react';
import { Box, useTheme } from '@mui/material';
import MessageList from './components/MessageList';
import MessageInput from './components/MessageInput';
import OnlineUsers from './components/OnlineUsers';
import { useChatPanel } from './hooks/useChatPanel';
import { usePathname } from 'next/navigation';
import EmojiPicker from 'emoji-picker-react';

const ChatPanel: React.FC = () => {
  const theme = useTheme();
  const pathname = usePathname();
  const isBoard = pathname === '/board';
  const {
    messages,
    newMessage,
    setNewMessage,
    loading,
    quotedMessage,
    setQuotedMessage,
    emojiPickerAnchor,
    setEmojiPickerAnchor,
    reactionMessage,
    setReactionMessage,
    onlineCount,
    onlineUsers,
    showOnlineUsers,
    setShowOnlineUsers,
    messagesEndRef,
    session,
    handleSendMessage,
    handleReaction,
    handleDeleteMessage,
    isQuotedMessageDeleted,
  } = useChatPanel();

  return (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      bgcolor: theme.palette.mode === 'dark' ? '#1a1a1a' : '#f5f5f5',
      position: 'relative',
    }}>
      <Box sx={{ 
        p: 2, 
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
        backgroundColor: theme.palette.mode === 'dark' ? '#2d2d2d' : '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1,
        flexShrink: 0,
      }}>
        <Box sx={{ fontWeight: 600, color: 'text.primary' }}>Mesajlar</Box>
        <OnlineUsers
          open={showOnlineUsers}
          onClose={() => setShowOnlineUsers(false)}
          users={onlineUsers}
          onlineCount={onlineCount}
          onToggleDialog={() => setShowOnlineUsers(true)}
        />
      </Box>

      <Box sx={{ 
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        <MessageList
          messages={messages}
          session={session}
          onReaction={(messageId, message) => {
            setReactionMessage(message);
            setEmojiPickerAnchor(document.activeElement as HTMLElement);
          }}
          onQuote={setQuotedMessage}
          onDelete={handleDeleteMessage}
          messagesEndRef={messagesEndRef}
          isQuotedMessageDeleted={isQuotedMessageDeleted}
        />
      </Box>

      <Box sx={{ flexShrink: 0 }}>
        <MessageInput
          newMessage={newMessage}
          onMessageChange={setNewMessage}
          onSend={handleSendMessage}
          loading={loading}
          session={session}
          quotedMessage={quotedMessage}
          onClearQuote={() => setQuotedMessage(null)}
        />
      </Box>

      {emojiPickerAnchor && (
        <Box
          sx={{
            position: 'absolute',
            right: '50px',
            bottom: '80px',
            zIndex: 1000,
            backgroundColor: theme.palette.background.paper,
            borderRadius: 1,
            boxShadow: theme.shadows[10],
          }}
        >
          <EmojiPicker
            onEmojiClick={(emojiData) => {
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
      )}
    </Box>
  );
};

export default ChatPanel;
