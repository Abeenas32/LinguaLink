import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Wifi, WifiOff, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { useChat } from '@/context/ChatContext';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 p-3">
      <div className="typing-dot" />
      <div className="typing-dot" />
      <div className="typing-dot" />
    </div>
  );
}

function MessageBubble({
  text,
  isSender,
  timestamp,
  translatedText
}: {
  text: string;
  isSender: boolean;
  timestamp: string;
  translatedText?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 5, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.15 }}
      className={`flex items-end gap-2 mb-1.5 ${isSender ? 'justify-end' : 'justify-start'}`}
    >
      <p className="text-[10px] text-muted-foreground/60 mb-0.5 whitespace-nowrap">
        {format(new Date(timestamp), 'HH:mm')}
      </p>
      <div
        className={`max-w-[75%] sm:max-w-[70%] rounded-sm px-3 py-1.5 ${isSender
          ? 'bg-primary text-primary-foreground'
          : 'bg-secondary text-foreground'
          }`}
      >
        <p className="text-sm leading-snug">{translatedText || text}</p>
        {translatedText && translatedText !== text && (
          <p className="text-[10px] mt-0.5 opacity-60 italic leading-tight">Original: {text}</p>
        )}
      </div>
    </motion.div>
  );
}

export default function ChatRoom() {
  const { roomId } = useParams<{ roomId: string }>();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const {
    rooms,
    messages,
    typingUsers,
    isConnected,
    isLoadingMessages,
    setCurrentRoom,
    sendMessage,
    sendTyping,
    sendStopTyping
  } = useChat();

  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const navigate = useNavigate();

  const currentRoom = rooms.find(r => r.id === roomId);
  const otherUser = currentRoom?.users.find(u => u.id !== user?.id);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }

    if (roomId) {
      setCurrentRoom(roomId);
    }

    return () => {
      setCurrentRoom(null);
    };
  }, [roomId, isAuthenticated, authLoading, navigate, setCurrentRoom]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);

    if (!isTyping) {
      setIsTyping(true);
      sendTyping();
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      sendStopTyping();
    }, 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Optimistic update
    sendMessage(inputValue);
    setInputValue('');
    setIsTyping(false);
    sendStopTyping();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="h-14 sm:h-16 border-b border-border flex items-center gap-2 sm:gap-4 px-2 sm:px-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="shrink-0">
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>

        {otherUser && (
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20 shrink-0">
              <span className="text-xs sm:text-sm font-semibold text-primary">
                {otherUser.firstName[0]}{otherUser.lastName[0]}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-medium text-sm sm:text-base truncate">{otherUser.firstName} {otherUser.lastName}</h2>
              <div className="flex items-center gap-1 sm:gap-2">
                <Languages className="w-3 h-3 text-muted-foreground shrink-0" />
                <span className="text-xs text-muted-foreground truncate">{otherUser.language}</span>
              </div>
            </div>
          </div>
        )}

        <div className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-medium shrink-0 ${isConnected
          ? 'bg-success/10 text-success'
          : 'bg-destructive/10 text-destructive'
          }`}>
          {isConnected ? <Wifi className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : <WifiOff className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
          <span className="hidden sm:inline">{isConnected ? 'Live' : 'Offline'}</span>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto scrollbar-thin p-2 sm:p-3">
        {isLoadingMessages ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 mx-auto mb-4">
                <Languages className="w-8 h-8 text-primary" />
              </div>
              <p className="text-muted-foreground">No messages yet</p>
              <p className="text-muted-foreground/70 text-sm mt-1">Say hello to start the conversation!</p>
            </div>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map(msg => (
              <MessageBubble
                key={msg.id}
                text={msg.text}
                translatedText={msg.translatedText}
                isSender={msg.senderId === user?.id}
                timestamp={msg.createdAt}
              />
            ))}
          </AnimatePresence>
        )}

        {/* Typing Indicator */}
        {typingUsers.size > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
              <span className="text-xs">{otherUser?.firstName?.[0]}</span>
            </div>
            <div className="bg-secondary rounded-2xl rounded-bl-md">
              <TypingIndicator />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* Input */}
      <footer className="p-2 sm:p-4 border-t border-border">
        <form onSubmit={handleSubmit} className="flex items-center gap-2 sm:gap-3">
          <Input
            placeholder="Type a message..."
            value={inputValue}
            onChange={handleInputChange}
            className="flex-1 text-sm sm:text-base"
            disabled={!isConnected}
          />
          <Button
            type="submit"
            variant="glow"
            size="icon"
            disabled={!inputValue.trim() || !isConnected}
            className="shrink-0"
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        </form>
      </footer>
    </div>
  );
}
