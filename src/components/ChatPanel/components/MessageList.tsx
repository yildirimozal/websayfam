'use client';

import React from 'react';
import { 
  Box, 
  Typography, 
  Avatar,
  IconButton,
  Tooltip,
} from '@mui/material';
import { 
  EmojiEmotions as EmojiIcon,
  Reply as ReplyIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material';
import { Message } from '../types';
import { Session } from 'next-auth';
import { usePathname } from 'next/navigation';

interface MessageListProps {
  messages: Message[];
  session: Session | null;
  onReaction: (messageId: string, message: Message) => void;
  onQuote: (message: Message) => void;
  onDelete: (messageId: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  isQuotedMessageDeleted: (quotedMessage: Message['quotedMessage']) => boolean;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  session,
  onReaction,
  onQuote,
  onDelete,
  messagesEndRef,
  isQuotedMessageDeleted,
}) => {
  const theme = useTheme();
  const pathname = usePathname();
  const isBoard = pathname === '/board';

  return (
    <Box sx={{ 
      flex: 1,
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column-reverse',
      minHeight: 0,
      p: 2,
      gap: 1,
    }}>
      <div ref={messagesEndRef} />
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
                  onClick={() => onReaction(message._id, message)}
                >
                  <EmojiIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => onQuote(message)}
                >
                  <ReplyIcon fontSize="small" />
                </IconButton>
                {(session?.user?.email === message.author.email || session?.user?.isAdmin) && (
                  <IconButton
                    size="small"
                    onClick={() => onDelete(message._id)}
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
                {isQuotedMessageDeleted(message.quotedMessage) ? (
                  <Typography variant="body2" color="textSecondary">
                    Bu mesaj silinmiş
                  </Typography>
                ) : (
                  <>
                    <Typography variant="caption" color="primary" sx={{ fontWeight: 600 }}>
                      @{message.quotedMessage.author.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {message.quotedMessage.content}
                    </Typography>
                  </>
                )}
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
                      onClick={() => onReaction(message._id, message)}
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
    </Box>
  );
};

export default MessageList;
