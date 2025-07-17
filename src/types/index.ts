export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: 'male' | 'female';
  birthDate: string;
  country: string;
  city: string;
  bio: string;
  interests: string[];
  profession: string;
  languages: string[];
  photos: string[];
  verified: boolean;
  premium: boolean;
  coins: number;
  role: 'user' | 'admin' | 'super_admin';
  createdAt: string;
  chatSubscription?: {
    type: string;
    expiresAt: string;
    purchasedAt: string;
  };
}

export interface Profile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  gender: string;
  birthDate: string;
  country: string;
  city: string;
  bio: string;
  interests: string[];
  profession: string;
  languages: string[];
  photos: string[];
  verified: boolean;
  createdAt: string;
  height?: number;
  weight?: number;
  eyeColor?: string;
  hairColor?: string;
  appearanceType?: string;
  alcohol?: string;
  smoking?: string;
  children?: string;
  religion?: string;
  zodiacSign?: string;
  englishLevel?: string;
  hasIntroVideo?: boolean;
  isOnline?: boolean;
  hasVideo?: boolean;
  hasCameraOn?: boolean;
  birthdaySoon?: boolean;
  newProfile?: boolean;
  top1000?: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  read: boolean;
  createdAt: string;
}

export interface Gift {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

export interface Match {
  id: string;
  user1Id: string;
  user2Id: string;
  createdAt: string;
}

export interface Like {
  id: string;
  fromUserId: string;
  toUserId: string;
  createdAt: string;
  status: 'pending' | 'accepted' | 'declined';
  profile: {
    id: string;
    userId: string;
    firstName: string;
    lastName: string;
    age: number;
    city: string;
    country: string;
    photo: string;
    verified: boolean;
  };
}

export interface LocalStorageData {
  likedProfiles: {
    [key: string]: {
      likedAt: string;
      status: 'sent' | 'received' | 'matched';
      profile: Profile;
    }
  };
}

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'super_admin';
  firstName: string;
  lastName: string;
  createdAt: string;
}

export interface ChatModel {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'google';
  model: string;
  active: boolean;
  maxTokens: number;
  temperature: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
}

export interface ChatConversation {
  id: string;
  userId: string;
  profileId: string;
  messages: ChatMessage[];
  lastMessage: string;
  lastMessageAt: string;
  status: 'active' | 'archived' | 'flagged';
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    photo?: string;
  };
  profile: {
    id: string;
    firstName: string;
    lastName: string;
    photo?: string;
    city?: string;
    country?: string;
    profession?: string;
  };
}

export interface UserChatSummary {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    photo?: string;
  };
  conversations: {
    profileId: string;
    profileName: string;
    profilePhoto?: string;
    lastMessage: string;
    lastMessageAt: string;
    unreadCount: number;
    status: 'active' | 'archived' | 'flagged';
  }[];
  totalConversations: number;
  lastActivity: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  content: string;
  role: 'user' | 'assistant' | 'admin';
  timestamp: string;
  isAdminResponse?: boolean;
  type?: 'text' | 'gift' | 'image' | 'voice' | 'emoji';
  imageUrl?: string;
  voiceUrl?: string;
  duration?: number;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  giftData?: {
    name: string;
    cost: number;
    category?: string;
    giftType: 'real' | 'virtual';
    image?: string;
    quantity?: number;
  };
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalMessages: number;
  flaggedConversations: number;
  modelUsage: {
    [modelId: string]: {
      name: string;
      requests: number;
      tokens: number;
    };
  };
}
