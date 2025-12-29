const API_BASE = 'http://localhost:3000';

interface ApiOptions {
  method?: string;
  body?: unknown;
  auth?: boolean;
}

async function api<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true } = options;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (auth) {
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    console.error('API Error:', {
      endpoint,
      status: response.status,
      error,
      body: options.body
    });
    throw new Error(error.message || `Request failed with status ${response.status}`);
  }

  return response.json();
}

// Auth endpoints
export interface SignupData {
  username ?: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  language: string;
}

export interface LoginData {
  email: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}


export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  language: string;
  avatar?: string;
}

export interface Language {
  code: string;
  name: string;
}

export interface Room {
  id: string;
  users: User[];
  lastMessage?: {
    text: string;
    createdAt: string;
    senderId: string;
  };
  createdAt: string;
  updatedAt: string;
  messages?: Message[];

}

export interface Message {
  id: string;
  roomId: string;
  senderId: string;
  text: string;
  translatedText?: string;
  createdAt: string;
}
interface UserSearchResponse {
  success: boolean;
  message: string;
  data: User[];
}

export const authApi = {
  signup: (data: SignupData) => 
    api<AuthResponse>('/users/register', { method: 'POST', body: data, auth: false }),
  
  login: (data: LoginData) => 
    api<AuthResponse>('/auth/login', { method: 'POST', body: data, auth: false }),
};

export const userApi = {
  getProfile: () => api<User>('/users/me'),
  
  updateLanguage: (language: string) => 
    api<User>('/users/language', { method: 'PATCH', body: { language } }),
  
  getLanguages: () => 
    api<Language[]>('/users/languages', { auth: false }),
  
  searchUsers: (query: string) =>
    api<UserSearchResponse>(`/users/search?q=${encodeURIComponent(query)}`),
};
 export type UserRoomsResponse = {
  success: boolean;
  message: string;
  data: { rooms: Room[] };
};

interface CreateRoomResponse {
  success: boolean;
  message: string;
  data: Room;
}

interface MessagesResponse {
  success: boolean;
  message: string;
  data: Message[];
}

export const chatApi = {
 getUserRooms: (userId: string) => api<UserRoomsResponse>(`/chat/users/${userId}/rooms`),

  
  createRoom: (data: { userIds: string[] }) => 
    api<CreateRoomResponse>('/chat/rooms', { method: 'POST', body: data }),
  
  getRoomMessages: (roomId: string) => 
    api<MessagesResponse>(`/chat/rooms/${roomId}/messages`),
};
