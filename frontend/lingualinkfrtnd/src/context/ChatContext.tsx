import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Room, Message, chatApi } from '@/lib/api';
import { wsManager, WebSocketMessage } from '@/lib/websocket';
import { useAuth } from './AuthContext';
import { UserRoomsResponse } from '@/lib/api';

interface ChatContextType {
  rooms: Room[];
  currentRoomId: string | null;
  messages: Message[];
  typingUsers: Set<string>;
  isConnected: boolean;
  isLoadingRooms: boolean;
  isLoadingMessages: boolean;
  setCurrentRoom: (roomId: string | null) => void;
  sendMessage: (text: string) => void;
  sendTyping: () => void;
  sendStopTyping: () => void;
  refreshRooms: () => Promise<void>;
  createRoom: (userIds: string[]) => Promise<Room>;
}

const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { token, isAuthenticated, user } = useAuth();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [isConnected, setIsConnected] = useState(false);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  
  // Use ref to avoid stale closures in WebSocket handlers
  const currentRoomIdRef = useRef<string | null>(null);
  
  useEffect(() => {
    currentRoomIdRef.current = currentRoomId;
  }, [currentRoomId]);

  // Connect to WebSocket when authenticated
  useEffect(() => {
    if (!isAuthenticated || !token) {
      wsManager.disconnect();
      setIsConnected(false);
      return;
    }

    wsManager.connect(token).then(() => setIsConnected(true)).catch(console.error);

    const handleConnected = () => setIsConnected(true);
    const handleDisconnected = () => setIsConnected(false);

    const handleNewMessage = (data: WebSocketMessage) => {
      const message = data.message as Message;
      if (!message || typeof message !== 'object' || !message.roomId) {
        console.warn('[ChatContext] Invalid message received:', data);
        return;
      }

      // Use ref to get current room ID (avoids stale closure)
      const roomId = currentRoomIdRef.current;
      console.log('[ChatContext] New message received:', { 
        messageId: message.id, 
        messageRoomId: message.roomId, 
        currentRoomId: roomId,
        text: message.text?.substring(0, 20)
      });

      // Only add message if it's for the current room
      setMessages(prev => {
        // Check if message already exists to prevent duplicates
        const exists = prev.some(m => m.id === message.id);
        if (exists) {
          console.log('[ChatContext] Message already exists, skipping');
          return prev;
        }
        
        // Only add if it's for the current room
        if (roomId === message.roomId) {
          console.log('[ChatContext] Adding message to current room');
          return [...prev, message];
        } else {
          console.log('[ChatContext] Message not for current room, ignoring');
        }
        return prev;
      });

      // Update room's last message
      setRooms(prev =>
        prev.map(room =>
          room.id === message.roomId
            ? {
                ...room,
                messages: [...(room.messages || []), message],
                lastMessage: {
                  text: message.translatedText || message.text,
                  createdAt: message.createdAt,
                  senderId: message.senderId,
                },
                updatedAt: message.createdAt,
              }
            : room
        )
      );
    };

    const handleMessageSent = (data: WebSocketMessage) => {
      const message = data.message as Message;
      if (!message || typeof message !== 'object' || !message.roomId) {
        console.warn('[ChatContext] Invalid message-sent received:', data);
        return;
      }
      
      // Use ref to get current room ID (avoids stale closure)
      const roomId = currentRoomIdRef.current;
      console.log('[ChatContext] Message sent received:', { 
        messageId: message.id, 
        messageRoomId: message.roomId, 
        currentRoomId: roomId,
        text: message.text?.substring(0, 20)
      });
      
      // Add message immediately for sender
      setMessages(prev => {
        const exists = prev.some(m => m.id === message.id);
        if (exists) {
          console.log('[ChatContext] Message already exists, skipping');
          return prev;
        }
        
        if (roomId === message.roomId) {
          console.log('[ChatContext] Adding sent message to current room');
          return [...prev, message];
        } else {
          console.log('[ChatContext] Sent message not for current room, ignoring');
        }
        return prev;
      });

      // Update room's last message
      setRooms(prev =>
        prev.map(room =>
          room.id === message.roomId
            ? {
                ...room,
                messages: [...(room.messages || []), message],
                lastMessage: {
                  text: message.translatedText || message.text,
                  createdAt: message.createdAt,
                  senderId: message.senderId,
                },
                updatedAt: message.createdAt,
              }
            : room
        )
      );
    };

    const handleUserTyping = (data: WebSocketMessage) => {
      const userId = data.userId as string;
      setTypingUsers(prev => new Set([...prev, userId]));
    };

    const handleUserStopTyping = (data: WebSocketMessage) => {
      const userId = data.userId as string;
      setTypingUsers(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    };

    const handleError = (data: WebSocketMessage) => {
      console.error('[ChatContext] WebSocket error:', data);
    };

    wsManager.on('connected', handleConnected);
    wsManager.on('disconnected', handleDisconnected);
    wsManager.on('new-message', handleNewMessage);
    wsManager.on('message-sent', handleMessageSent);
    wsManager.on('user-typing', handleUserTyping);
    wsManager.on('user-stop-typing', handleUserStopTyping);
    wsManager.on('error', handleError);

    return () => {
      wsManager.off('connected', handleConnected);
      wsManager.off('disconnected', handleDisconnected);
      wsManager.off('new-message', handleNewMessage);
      wsManager.off('message-sent', handleMessageSent);
      wsManager.off('user-typing', handleUserTyping);
      wsManager.off('user-stop-typing', handleUserStopTyping);
      wsManager.off('error', handleError);
    };
  }, [isAuthenticated, token]);

  // Fetch rooms for dashboard
 const refreshRooms = useCallback(async () => {
  if (!isAuthenticated || !user?.id) return;
  setIsLoadingRooms(true);

  try {
    const res = await chatApi.getUserRooms(user.id) as unknown as UserRoomsResponse;

    console.log("Fetched rooms:", res);
    setRooms(res.data?.rooms ?? []);

  } catch (err) {
    console.error("Failed to load rooms:", err);
    setRooms([]);
  } finally {
    setIsLoadingRooms(false);
  }
}, [isAuthenticated, user?.id]);


  // Load rooms on dashboard mount
  useEffect(() => {
    refreshRooms();
  }, [refreshRooms]);

  // Load messages when room changes
  const setCurrentRoom = useCallback(async (roomId: string | null) => {
    console.log('[ChatContext] Setting current room:', roomId);
    setCurrentRoomId(roomId);
    // Update ref immediately
    currentRoomIdRef.current = roomId;
    setMessages([]);
    setTypingUsers(new Set());

    if (!roomId) {
      currentRoomIdRef.current = null;
      return;
    }

    // Try to join room via WebSocket
    try {
      wsManager.send({ type: 'join-room', roomId });
    } catch (err) {
      console.error('Failed to send join-room:', err);
    }

    setIsLoadingMessages(true);
    try {
      const response = await chatApi.getRoomMessages(roomId);
      console.log('[ChatContext] Loaded messages:', response.data?.length || 0);
      setMessages(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Failed to load messages:', err);
      setMessages([]);
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  const sendMessage = useCallback(
    (text: string) => {
      if (!currentRoomId || !text.trim()) return;
      wsManager.send({
        type: 'send-message',
        roomId: currentRoomId,
        text: text.trim(),
      });
    },
    [currentRoomId]
  );

  const sendTyping = useCallback(() => {
    if (!currentRoomId) return;
    wsManager.send({ type: 'typing', roomId: currentRoomId });
  }, [currentRoomId]);

  const sendStopTyping = useCallback(() => {
    if (!currentRoomId) return;
    wsManager.send({ type: 'stop-typing', roomId: currentRoomId });
  }, [currentRoomId]);

  const createRoom = useCallback(async (userIds: string[]) => {
    const response = await chatApi.createRoom({userIds});
    const room = response.data;
    
    // Check if room already exists in the list to prevent duplicates
    setRooms(prev => {
      const roomExists = prev.some(r => r.id === room.id);
      if (roomExists) {
        // Room already exists, just return the existing list
        return prev;
      }
      // Add new room to the beginning
      return [room, ...prev];
    });
    
    return room;
  }, []);

  return (
    <ChatContext.Provider
      value={{
        rooms,
        currentRoomId,
        messages,
        typingUsers,
        isConnected,
        isLoadingRooms,
        isLoadingMessages,
        setCurrentRoom,
        sendMessage,
        sendTyping,
        sendStopTyping,
        refreshRooms,
        createRoom,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
