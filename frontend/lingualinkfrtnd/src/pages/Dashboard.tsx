import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Languages, MessageSquare, Plus, Search, LogOut, Settings, Wifi, WifiOff, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { useChat } from '@/context/ChatContext';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Room, User as UserType, userApi } from '@/lib/api';

// types for API users 
type ApiUser = {
  username: string;
};

function RoomItem({ room, isActive, onClick, currentUserId }: {
  room?: Room;
  isActive: boolean;
  onClick: () => void;
  currentUserId?: string;
}) {
  const otherUser = room?.users?.find(u => u.id !== currentUserId);
  if (!room || !otherUser) return null;
  const displayName = otherUser
    ? `${otherUser.firstName} ${otherUser.lastName}`
    : 'Unknown User';
  const initials = otherUser
    ? `${otherUser.firstName[0]}${otherUser.lastName[0]}`
    : '??';

  return (
    <motion.button
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={`w-full p-3 sm:p-4 rounded-xl text-left transition-all duration-200 ${isActive
        ? 'bg-primary/10 border border-primary/30'
        : 'hover:bg-secondary border border-transparent'
        }`}
    >
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20 shrink-0">
          <span className="text-xs sm:text-sm font-semibold text-primary">{initials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-medium truncate text-sm sm:text-base">{displayName}</h3>
            {room.lastMessage && (
              <span className="text-[10px] sm:text-xs text-muted-foreground shrink-0">
                {formatDistanceToNow(new Date(room.lastMessage.createdAt), { addSuffix: false })}
              </span>
            )}
          </div>
          {room.lastMessage && (
            <p className="text-xs sm:text-sm text-muted-foreground truncate mt-0.5">
              {room.lastMessage.text}
            </p>
          )}
        </div>
      </div>
    </motion.button>
  );
}

function NewChatModal({ isOpen, onClose, onSelectUser }: {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (user: UserType) => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<UserType[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setUsers([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await userApi.searchUsers(searchQuery);
        setUsers(Array.isArray(results.data) ? results.data : []);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  return (
    <motion.div
      layout={false}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
      onClick={onClose}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md glass-panel p-4 sm:p-6 mx-2 sm:mx-0"
      >
        <h2 className="text-lg sm:text-xl font-display font-semibold mb-3 sm:mb-4">New Chat</h2>

        <div className="relative mb-3 sm:mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 sm:pl-10 text-sm sm:text-base"
            autoFocus
          />
        </div>

        <div className="max-h-64 overflow-y-auto scrollbar-thin space-y-2">
          {isSearching && (
            <div className="flex items-center justify-center py-4">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {users.map((user) => (
            <button
              key={user.id}
              onClick={() => onSelectUser(user)}
              className="w-full p-3 rounded-lg flex items-center gap-3 hover:bg-secondary transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{user.firstName} {user.lastName}</p>
                <p className="text-sm text-muted-foreground">@{user.username}</p>
              </div>
            </button>
          ))}

          {!isSearching && searchQuery && users.length === 0 && (
            <p className="text-center text-muted-foreground py-4">
              No users found
            </p>
          )}
        </div>

        <div className="flex justify-end mt-4">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Dashboard() {
  const { user, logout, isAuthenticated, isLoading: authLoading } = useAuth();
  const { rooms, currentRoomId, setCurrentRoom, isConnected, isLoadingRooms, createRoom } = useChat();
  const [showNewChat, setShowNewChat] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Rooms from context:', rooms);
  }, [rooms]);


  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleSelectUser = async (selectedUser: UserType) => {
    if (!user?.id) {
      console.error('No authenticated user found.');
      return;
    }
    if (!selectedUser?.id) return;
    console.log('Creating room with user:', selectedUser.id);
    console.log('Current user ID:', user.id);
    try {
      // Only send the other user's ID - backend will add current user automatically
      const room = await createRoom([selectedUser.id]);
      console.log('Created room:', room);
      if (room?.id) {
        setCurrentRoom(room.id);
        setShowNewChat(false);
        navigate(`/chat/${room.id}`);
      } else {
        console.error('Room created but missing ID:', room);
      }
    } catch (err) {
      console.error('Failed to create room:', err);
    }
  };

  const handleRoomClick = (roomId: string) => {
    setCurrentRoom(roomId);
    navigate(`/chat/${roomId}`);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="h-14 sm:h-16 border-b border-border flex items-center justify-between px-3 sm:px-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
            <Languages className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </div>
          <h1 className="text-lg sm:text-xl font-display font-bold">LinguaLink</h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Connection Status */}
          <div className={`hidden sm:flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-medium ${isConnected
            ? 'bg-success/10 text-success'
            : 'bg-destructive/10 text-destructive'
            }`}>
            {isConnected ? <Wifi className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : <WifiOff className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
            <span className="hidden md:inline">{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>

          {/* User Info */}
          <div className="hidden sm:flex items-center gap-2 text-sm">
            <span className="text-muted-foreground hidden md:inline">{user?.firstName}</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-secondary flex items-center justify-center">
              <span className="text-xs font-medium">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </span>
            </div>
          </div>

          <Button variant="ghost" size="icon" onClick={() => navigate('/settings')} className="shrink-0">
            <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>

          <Button variant="ghost" size="icon" onClick={logout} className="shrink-0">
            <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col sm:flex-row">
        {/* Sidebar - Room List */}
        <aside className="w-full sm:w-80 border-r border-border flex flex-col">
          <div className="p-3 sm:p-4">
            <Button
              variant="glow"
              className="w-full text-sm sm:text-base"
              onClick={() => setShowNewChat(true)}
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="ml-2">New Chat</span>
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin p-2 space-y-1">
            {isLoadingRooms ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : rooms.length === 0 ? (
              <div className="text-center py-8 sm:py-12 px-4">
                <MessageSquare className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">No conversations yet</p>
                <p className="text-muted-foreground/70 text-xs mt-1">Start a new chat to begin</p>
              </div>
            ) : (
              <AnimatePresence>
                {Array.isArray(rooms) && rooms.map((room, index) => (
                  <RoomItem
                    key={room.id || `room-${index}`}
                    room={room}
                    isActive={room.id === currentRoomId}
                    onClick={() => handleRoomClick(room.id)}
                    currentUserId={user?.id || ''}
                  />
                ))}
              </AnimatePresence>
            )}
          </div>
        </aside>

        {/* Main Area */}
        <main className="hidden sm:flex flex-1 items-center justify-center">
          <div className="text-center px-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 mx-auto mb-4 sm:mb-6">
                <MessageSquare className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
              </div>
              <h2 className="text-xl sm:text-2xl font-display font-semibold mb-2">Select a conversation</h2>
              <p className="text-muted-foreground text-sm sm:text-base">Choose a chat from the sidebar or start a new one</p>
            </motion.div>
          </div>
        </main>
      </div>

      {/* New Chat Modal */}
      <AnimatePresence initial={false} mode="wait">
        {showNewChat && (
          <NewChatModal
            isOpen={showNewChat}
            onClose={() => setShowNewChat(false)}
            onSelectUser={handleSelectUser}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
