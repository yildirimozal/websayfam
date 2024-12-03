import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Message, OnlineUser } from '../types';
import { usePathname } from 'next/navigation';

export const useChatPanel = () => {
  const { data: session } = useSession();
  const pathname = usePathname();
  const isBoard = pathname === '/board';
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [quotedMessage, setQuotedMessage] = useState<Message | null>(null);
  const [emojiPickerAnchor, setEmojiPickerAnchor] = useState<null | HTMLElement>(null);
  const [reactionMessage, setReactionMessage] = useState<Message | null>(null);
  const [onlineCount, setOnlineCount] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [showOnlineUsers, setShowOnlineUsers] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMessagesLength = useRef(messages.length);

  const scrollToBottom = () => {
    if (isBoard) return;
    const container = messagesEndRef.current?.parentElement;
    if (container) {
      container.scrollTop = 0;
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/messages');
      const data = await response.json();
      setMessages([...data].sort((a: Message, b: Message) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    } catch (error) {
      console.error('Mesajlar yüklenirken hata:', error);
    }
  };

  const updateOnlineStatus = async () => {
    try {
      const response = await fetch('/api/online', {
        method: session ? 'POST' : 'GET'
      });
      if (response.ok) {
        const data = await response.json();
        setOnlineCount(data.count);
        setOnlineUsers(data.users);
      }
    } catch (error) {
      console.error('Online durum güncellenirken hata:', error);
    }
  };

  useEffect(() => {
    fetchMessages();
    const messageInterval = setInterval(fetchMessages, 5000);

    updateOnlineStatus();
    const onlineInterval = setInterval(updateOnlineStatus, 30000);

    return () => {
      clearInterval(messageInterval);
      clearInterval(onlineInterval);
    };
  }, [session]);

  useEffect(() => {
    if (!isBoard && messages.length > prevMessagesLength.current) {
      scrollToBottom();
    }
    prevMessagesLength.current = messages.length;
  }, [messages, isBoard]);

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
        if (!isBoard) {
          scrollToBottom();
        }
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

  const isQuotedMessageDeleted = (quotedMessage: Message['quotedMessage']) => {
    if (!quotedMessage) return true;
    const originalMessage = messages.find(m => m._id === quotedMessage._id);
    return !originalMessage;
  };

  return {
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
  };
};
