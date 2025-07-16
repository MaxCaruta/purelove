import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ChatConversation, ChatMessage, UserChatSummary } from '@/types';
import { AdminService } from '@/lib/admin';
import { AdminConversationUtils } from '@/lib/adminUtils';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { loadGifts, getGiftCategories, type Gift as DatabaseGift, type RealGift } from '@/lib/utils';
import { X, Send, Search, Settings, Archive, User, Phone, Video, MessageCircle, ChevronLeft, RefreshCw, Gift, Image, Smile, Mic, Plus, Edit2, Trash2, Eye, EyeOff, Package, Paperclip, UserCog, Shield, Ban, Home, Sparkles, SquareUser, DollarSign, TrendingUp, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useToast, ToastContainer } from '@/components/ui/toast';
import emailjs from '@emailjs/browser';

// Define interfaces for analytics data
interface Transaction {
  id: string;
  created_at: string;
  user_id: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  description: string;
  type: string;
  subscription_id?: string;
  subscription_plan?: string;
  gift_id?: string;
  profile_id?: string;
  coins_spent?: number;
}

interface SubscriptionPurchase {
  id: string;
  created_at: string;
  user_id: string;
  subscription_id: string;
  status: string;
  start_date: string;
  end_date: string;
  auto_renew: boolean;
  payment_method: string;
  amount: number;
  currency: string;
  is_active: boolean;
  expires_at: string;
}

const AdminPage = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  
  // Tab system state
  const [activeTab, setActiveTab] = useState<'conversations' | 'gifts' | 'users' | 'models' | 'analytics'>('conversations');
  
  // User management state
  const [users, setUsers] = useState<any[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userModalMode, setUserModalMode] = useState<'view' | 'edit' | 'add'>('view');
  const [userFormData, setUserFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'user',
    photos: [''],
    coins: 0,
    gender: 'female',
    birthDate: '',
    country: '',
    city: '',
    profession: '',
    languages: [] as string[],
    bio: '',
    interests: [] as string[],
    eyeColor: '',
    hairColor: '',
    appearanceType: '',
    alcohol: '',
    smoking: '',
    children: '',
    religion: '',
    zodiacSign: '',
    englishLevel: '',
    verified: false,
    premium: false,
    hasIntroVideo: false,
    isOnline: false,
    hasVideo: false,
    hasCameraOn: false,
    birthdaySoon: false,
    newProfile: false,
    top1000: false
  });
  
  // Add error state for form validation
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Existing conversation state
  const [userChats, setUserChats] = useState<UserChatSummary[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [isConversationModalOpen, setIsConversationModalOpen] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [sendingResponse, setSendingResponse] = useState(false);
  const [debugResults, setDebugResults] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  // Gift management state
  const [gifts, setGifts] = useState<DatabaseGift[]>([]);
  const [giftCategories, setGiftCategories] = useState<string[]>([]);
  const [selectedGiftCategory, setSelectedGiftCategory] = useState<string>('all');
  const [giftSearchQuery, setGiftSearchQuery] = useState('');
  const [showAddGiftModal, setShowAddGiftModal] = useState(false);
  const [editingGift, setEditingGift] = useState<DatabaseGift | null>(null);
  const [giftFormData, setGiftFormData] = useState({
    name: '',
    description: '',
    price: 0,
    image_url: '',
    category: 'flowers'
  });
  
  // Existing refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedConversationRef = useRef<ChatConversation | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const [newMessage, setNewMessage] = useState('');

  // Add state for user type filter
  const [userTypeFilter, setUserTypeFilter] = useState<'models' | 'real'>('real');

  // Add state for model generator
  const [showModelGenerator, setShowModelGenerator] = useState(false);
  const [generatorSettings, setGeneratorSettings] = useState({
    count: 10,
    countries: ['Ukraine', 'Russia', 'Belarus', 'Kazakhstan', 'Georgia', 'Poland', 'Czech Republic', 'Slovakia', 'Hungary', 'Romania', 'Bulgaria', 'Serbia', 'Croatia', 'Slovenia', 'Latvia', 'Lithuania', 'Estonia', 'Moldova', 'Armenia', 'Azerbaijan'],
    ageRange: { min: 18, max: 35 },
    includeVerified: true,
    includePremium: false
  });
  const [generatingModels, setGeneratingModels] = useState(false);
  
  // Add state for photo upload after generation
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [generatedModels, setGeneratedModels] = useState<any[]>([]);
  const [photoUploads, setPhotoUploads] = useState<Record<string, string[]>>({});
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  // Model generator data
  const modelData = {
    firstNames: [
      'Anastasia', 'Elena', 'Maria', 'Sofia', 'Anna', 'Victoria', 'Natalia', 'Irina', 'Katerina', 'Olga',
      'Tatiana', 'Yulia', 'Ekaterina', 'Alina', 'Daria', 'Polina', 'Kristina', 'Veronika', 'Angelina', 'Valentina',
      'Margarita', 'Evgenia', 'Larisa', 'Galina', 'Raisa', 'Tamara', 'Ludmila', 'Nina', 'Zinaida', 'Rosa'
    ],
    lastNames: [
      'Kovalenko', 'Melnyk', 'Shevchenko', 'Bondarenko', 'Tkachenko', 'Kravchenko', 'Kovalchuk', 'Oliynyk',
      'Shevchuk', 'Mazur', 'Marchenko', 'Rudenko', 'Savchenko', 'Petrenko', 'Moroz', 'Lysenko', 'Romanenko',
      'Vasylenko', 'Pavlenko', 'Kharchenko', 'Tarasenko', 'Bondar', 'Melnik', 'Kravets', 'Koval', 'Shevchuk',
      'Marchenko', 'Savchuk', 'Petruk', 'Morozov'
    ],
    professions: [
      'Model', 'Student', 'Teacher', 'Nurse', 'Designer', 'Artist', 'Photographer', 'Dancer', 'Singer',
      'Actress', 'Journalist', 'Translator', 'Tour Guide', 'Chef', 'Fitness Trainer', 'Yoga Instructor',
      'Makeup Artist', 'Hair Stylist', 'Fashion Designer', 'Interior Designer', 'Graphic Designer',
      'Web Designer', 'Marketing Specialist', 'Sales Representative', 'Customer Service', 'Receptionist',
      'Administrative Assistant', 'Event Planner', 'Travel Agent', 'Real Estate Agent'
    ],
    bios: [
      'Passionate about life and looking for meaningful connections. Love traveling and meeting new people.',
      'Creative soul who enjoys art, music, and good conversations. Looking for someone special to share life with.',
      'Adventurous spirit who loves exploring new places and cultures. Ready for exciting experiences.',
      'Romantic at heart, believe in true love and lasting relationships. Looking for my soulmate.',
      'Independent woman with a zest for life. Love cooking, reading, and spending time outdoors.',
      'Professional and ambitious, but also know how to have fun. Looking for someone who shares my values.',
      'Sweet and caring person who loves animals and nature. Looking for someone kind and understanding.',
      'Active lifestyle enthusiast who enjoys sports and outdoor activities. Looking for an active partner.',
      'Intellectual and curious, love learning new things and having deep conversations.',
      'Family-oriented person who values traditions and close relationships. Looking for serious commitment.',
      'Free-spirited and artistic, love expressing myself through various forms of art.',
      'Practical and organized, but also know how to enjoy life. Looking for someone reliable and caring.',
      'Optimistic and positive person who believes in the good in people. Love making others smile.',
      'Ambitious and driven, but also romantic. Looking for someone who can be both my partner and best friend.',
      'Spiritual person who believes in destiny and meaningful connections. Looking for my other half.'
    ],
    interests: [
      ['Travel', 'Photography', 'Cooking'],
      ['Music', 'Dancing', 'Art'],
      ['Reading', 'Writing', 'Poetry'],
      ['Yoga', 'Meditation', 'Wellness'],
      ['Fashion', 'Beauty', 'Style'],
      ['Sports', 'Fitness', 'Outdoor Activities'],
      ['Movies', 'Theater', 'Culture'],
      ['Cooking', 'Baking', 'Food'],
      ['Photography', 'Nature', 'Adventure'],
      ['Music', 'Singing', 'Instruments'],
      ['Dancing', 'Parties', 'Social Events'],
      ['Reading', 'Books', 'Literature'],
      ['Art', 'Painting', 'Creativity'],
      ['Travel', 'Languages', 'Cultures'],
      ['Fitness', 'Health', 'Lifestyle']
    ],
    languages: [
      ['Ukrainian', 'English', 'Russian'],
      ['Russian', 'English', 'French'],
      ['Belarusian', 'Russian', 'English'],
      ['Kazakh', 'Russian', 'English'],
      ['Georgian', 'Russian', 'English'],
      ['Ukrainian', 'English'],
      ['Russian', 'English'],
      ['Ukrainian', 'Russian', 'English'],
      ['Belarusian', 'English'],
      ['Kazakh', 'English']
    ],
    photos: [
      'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=774&q=80',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=774&q=80',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=776&q=80',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=776&q=80',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=774&q=80',
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=774&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=774&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=774&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=774&q=80',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=774&q=80'
    ]
  };

  // Analytics state
  const [analyticsData, setAnalyticsData] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalOrders: 0,
    monthlyOrders: 0,
    subscriptionRevenue: 0,
    monthlySubscriptionRevenue: 0,
    coinsRevenue: 0,
    monthlyCoinsRevenue: 0,
    popularPlans: [] as any[],
    recentTransactions: [] as any[],
    revenueTrend: [] as any[],
    orderTrend: [] as any[],
    activeSubscriptions: 0,
    totalCoinsSpent: 0,
    monthlyCoinsSpent: 0,
    totalGiftsSent: 0,
    monthlyGiftsSent: 0,
    popularGifts: [] as any[]
  });
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'week' | 'month'>('month');

  useEffect(() => {
    if (isAdmin) {
      if (activeTab === 'conversations') {
        loadAdminData();
      } else if (activeTab === 'gifts') {
        loadGiftsData();
      } else if (activeTab === 'users') {
        loadUsers();
      } else if (activeTab === 'analytics') {
        loadAnalyticsData();
      }
    }
  }, [isAdmin, activeTab, dateRange]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      await loadUserChats();
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserChats = async () => {
    console.log('🔄 Loading user chats...');
    try {
      const chats = await AdminService.getUserChats();
      console.log('🔄 Loaded chats - Total users:', chats.length);
      
      // Process unread counts and update UI
      const processedChats = chats.map(chat => ({
        ...chat,
        conversations: chat.conversations.map(conv => ({
          ...conv,
          // Ensure unreadCount is properly set from the database
          unreadCount: typeof conv.unreadCount === 'number' ? conv.unreadCount : 0,
          // Add hasUnread flag for easy UI rendering
          hasUnread: (typeof conv.unreadCount === 'number' && conv.unreadCount > 0)
        }))
      }));
      
      setUserChats(processedChats);
    } catch (error) {
      console.error('Failed to load user chats:', error);
    }
  };

  const updateConversationStatus = async (conversationId: string, status: 'active' | 'archived' | 'flagged') => {
    try {
      await AdminService.updateConversationStatus(conversationId, status);
      
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(prev => prev ? { ...prev, status } : null);
      }

      // Update the user chats data
      setUserChats(prev => prev.map(userChat => ({
        ...userChat,
        conversations: userChat.conversations.map(conv => 
          conv.profileId === selectedConversation?.profileId ? { ...conv, status } : conv
        )
      })));

      if (user) {
        await AdminService.logAdminAction(user.id, 'update_conversation_status', {
          conversationId,
          status
        });
      }
      toast.success('Conversation status updated!');
    } catch (error) {
      console.error('Failed to update conversation status:', error);
      toast.error('Failed to update conversation status.');
    }
  };

  // Developer tools functions
  const createSampleData = async () => {
    setLoading(true);
    try {
      const result = await AdminConversationUtils.createSampleConversations();
      if (result.success) {
        console.log('Sample data created successfully');
        await loadUserChats(); // Refresh the data
      } else {
        console.error('Failed to create sample data:', result.error);
      }
    } catch (error) {
      console.error('Error creating sample data:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearSampleData = async () => {
    setLoading(true);
    try {
      const result = await AdminConversationUtils.clearSampleData();
      if (result.success) {
        console.log('Sample data cleared successfully');
        await loadUserChats(); // Refresh the data
      } else {
        console.error('Failed to clear sample data:', result.error);
      }
    } catch (error) {
      console.error('Error clearing sample data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDemoProfiles = async () => {
    setLoading(true);
    try {
      const result = await AdminConversationUtils.createDemoAIProfiles();
      if (result.success) {
        console.log('Demo AI profiles created successfully');
        await loadUserChats(); // Refresh the data
      } else {
        console.error('Failed to create demo profiles:', result.error);
      }
    } catch (error) {
      console.error('Error creating demo profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setLoading(true);
    try {
      await loadUserChats();
      console.log('Data refreshed successfully');
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const runDebugTest = async () => {
    try {
      console.log('🔍 Running admin debug test...');
      const results = await AdminService.testDatabaseAccess();
      console.log('🔍 Debug results:', results);
      setDebugResults(results);
    } catch (error) {
      console.error('🔍 Debug test failed:', error);
      setDebugResults({ error: (error as Error).message });
    }
  };

  // Effect to load admin data
  useEffect(() => {
    if (isAdmin && user) {
      loadAdminData();
      
      // Request notification permission for admin
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          console.log('🔔 [ADMIN] Notification permission:', permission);
        });
      }
    }
  }, [isAdmin, user]);

  // Real-time subscriptions for admin panel
  useEffect(() => {
    if (!isAdmin || !user) {
      return;
    }

    // Check if we're online before setting up subscriptions
    if (!navigator.onLine) {
      console.log('📴 [ADMIN] Device is offline, skipping real-time setup');
      return;
    }

    console.log('🔔 [ADMIN] Setting up real-time subscriptions...');
    console.log('🔔 [ADMIN] Admin user ID:', user.id);

    let messageSubscription: any = null;
    let conversationSubscription: any = null;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 3;

    const setupSubscriptions = () => {
      try {
        // Subscribe to new messages for live chat monitoring - using admin client to bypass RLS
        messageSubscription = supabaseAdmin
          .channel(`admin_messages_${user.id}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'messages'
            },
            (payload) => {
              console.log('🔔 [ADMIN] ===== NEW MESSAGE DETECTED =====');
              console.log('🔔 [ADMIN] Raw payload:', payload);
              console.log('🔔 [ADMIN] Event type:', payload.eventType);
              console.log('🔔 [ADMIN] Table:', payload.table);
              const newMessage = payload.new as any;
              console.log('🔔 [ADMIN] Parsed message:', {
                id: newMessage.id,
                sender_id: newMessage.sender_id,
                receiver_id: newMessage.receiver_id,
                content: newMessage.content,
                type: newMessage.type,
                created_at: newMessage.created_at
              });
              
              // Enhanced debugging for new messages
              console.log('🔔 [ADMIN] Message details:', {
                id: newMessage.id,
                sender: newMessage.sender_id?.substring(0, 8),
                receiver: newMessage.receiver_id?.substring(0, 8),
                content: newMessage.content?.substring(0, 30),
                type: newMessage.type,
                created_at: newMessage.created_at
              });
              
              console.log('🔔 [ADMIN] Message details:', {
                id: newMessage.id,
                sender_id: newMessage.sender_id?.substring(0, 8),
                receiver_id: newMessage.receiver_id?.substring(0, 8),
                content: newMessage.content?.substring(0, 50),
                created_at: newMessage.created_at
              });
              
              // Show a visual notification in the browser console for debugging
              console.log('%c🔔 NEW MESSAGE IN ADMIN PANEL', 'background: #ff0000; color: white; padding: 2px 5px; border-radius: 3px; font-weight: bold;');
              console.log(`From: ${newMessage.sender_id?.substring(0, 8)} → To: ${newMessage.receiver_id?.substring(0, 8)}`);
              console.log(`Content: "${newMessage.content}"`);
              console.log('---');
              
              // Update the conversation in userChats if it's currently visible
              setUserChats(prevChats => {
                console.log('🔔 [ADMIN] Updating user chats with new message...');
                console.log('🔔 [ADMIN] Message details for processing:', {
                  sender_id: newMessage.sender_id?.substring(0, 8),
                  receiver_id: newMessage.receiver_id?.substring(0, 8),
                  content: newMessage.content?.substring(0, 50)
                });
                
                let wasUpdated = false;
                const updatedChats = prevChats.map(userChat => {
                  // Check if this message involves this user (either as sender or receiver)
                  const userIsInvolved = userChat.user.id === newMessage.sender_id || userChat.user.id === newMessage.receiver_id;
                  
                  if (!userIsInvolved) {
                    return userChat;
                  }
                  
                  console.log('🔔 [ADMIN] User involved in message:', userChat.user.firstName);
                  
                  // For admin panel: we want to show unread counts when USERS send messages to MODELS
                  // So we increment unread count when userChat.user.id === newMessage.sender_id (user sent message)
                  const isUserSendingMessage = userChat.user.id === newMessage.sender_id;
                  const otherPartyId = isUserSendingMessage ? newMessage.receiver_id : newMessage.sender_id;
                  
                  console.log('🔔 [ADMIN] Message direction:', {
                    isUserSendingMessage,
                    otherPartyId: otherPartyId?.substring(0, 8),
                    userChatUserId: userChat.user.id?.substring(0, 8),
                    sender: newMessage.sender_id?.substring(0, 8),
                    receiver: newMessage.receiver_id?.substring(0, 8)
                  });
                  
                  // Find existing conversation with the other party
                  const existingConvIndex = userChat.conversations.findIndex(conv => conv.profileId === otherPartyId);
                  
                  if (existingConvIndex !== -1) {
                    // Update existing conversation
                    console.log('🔔 [ADMIN] Updating existing conversation:', userChat.conversations[existingConvIndex].profileName);
                    
                    const conv = userChat.conversations[existingConvIndex];
                    
                    // Check if this conversation is currently selected (being viewed)
                    const isCurrentlyViewing = selectedConversation && 
                      selectedConversation.userId === userChat.user.id && 
                      selectedConversation.profileId === conv.profileId;
                    
                    console.log('🔔 [ADMIN] Checking if currently viewing:', {
                      conversation: `${userChat.user.firstName} ↔ ${conv.profileName}`,
                      hasSelectedConversation: !!selectedConversation,
                      selectedUserId: selectedConversation?.userId?.substring(0, 8),
                      selectedProfileId: selectedConversation?.profileId?.substring(0, 8),
                      currentUserId: userChat.user.id?.substring(0, 8),
                      currentProfileId: conv.profileId?.substring(0, 8),
                      isCurrentlyViewing
                    });
                    
                    // Calculate new unread count - FOR ADMIN PANEL LOGIC
                    let newUnreadCount = conv.unreadCount;
                    if (isUserSendingMessage && !isCurrentlyViewing) {
                      // User sent a message and admin is not currently viewing this conversation
                      newUnreadCount = conv.unreadCount + 1;
                      console.log('🔔 [ADMIN] ✅ INCREMENTING unread count:', {
                        conversation: `${userChat.user.firstName} ↔ ${conv.profileName}`,
                        from: conv.unreadCount,
                        to: newUnreadCount,
                        reason: 'user sent message, admin not currently viewing conversation'
                      });
                      wasUpdated = true;
                    } else if (isCurrentlyViewing) {
                      // Admin is currently viewing this conversation, clear unread count
                      newUnreadCount = 0;
                      console.log('🔔 [ADMIN] Clearing unread count (admin currently viewing)');
                    } else {
                      // Either admin sent message (as model) or conversation is active, don't increment
                      console.log('🔔 [ADMIN] Not incrementing unread count:', {
                        conversation: `${userChat.user.firstName} ↔ ${conv.profileName}`,
                        isUserSendingMessage,
                        isCurrentlyViewing,
                        reason: isUserSendingMessage ? 'admin is currently viewing conversation' : 'admin sent message as model'
                      });
                    }
                    
                    // Format last message based on type
                    let lastMessageText = newMessage.content;
                    if (newMessage.type === 'gift') {
                      lastMessageText = `🎁 ${newMessage.content}`;
                    } else if (newMessage.type === 'image') {
                      lastMessageText = '📷 Photo';
                    } else if (newMessage.type === 'voice') {
                      lastMessageText = '🎵 Voice message';
                    }
                    
                    const updatedConversations = [...userChat.conversations];
                    updatedConversations[existingConvIndex] = {
                      ...conv,
                      lastMessage: lastMessageText,
                      lastMessageAt: newMessage.created_at,
                      unreadCount: newUnreadCount
                    };
                    
                    return {
                      ...userChat,
                      conversations: updatedConversations,
                      lastActivity: newMessage.created_at
                    };
                  } else if (isUserSendingMessage) {
                    // This is a new conversation - need to fetch profile info for the sender
                    console.log('🔔 [ADMIN] New conversation detected, but not refreshing to preserve unread counts');
                    
                    // Don't refresh immediately as it resets unread counts
                    // The conversation will be created by the database trigger
                    return userChat;
                  }
                  
                  return userChat;
                });
                
                console.log('🔔 [ADMIN] Message processing complete, wasUpdated:', wasUpdated);
                
                // Debug: Show updated state
                if (wasUpdated) {
                  console.log('🔔 [ADMIN] Updated conversations after message:');
                  updatedChats.forEach(userChat => {
                    userChat.conversations.forEach(conv => {
                      if (conv.unreadCount > 0) {
                        console.log(`  🔴 ${userChat.user.firstName} ↔ ${conv.profileName}: ${conv.unreadCount} unread`);
                      }
                    });
                  });
                }
                
                // Show browser notification for admin when new messages arrive
                if (wasUpdated && 'Notification' in window && Notification.permission === 'granted') {
                  // Find the user who received the message
                  const receivingUser = prevChats.find(chat => chat.user.id === newMessage.receiver_id);
                  if (receivingUser) {
                    new Notification('New message in admin panel', {
                      body: `${receivingUser.user.firstName} received: "${newMessage.content.substring(0, 50)}${newMessage.content.length > 50 ? '...' : ''}"`,
                      icon: '/notification-icon.png'
                    });
                  }
                }
                
                // Play notification sound for admin when unread count is incremented
                if (wasUpdated) {
                  try {
                    const audio = new Audio('/notification.mp3');
                    audio.play().catch(e => console.log('Sound play failed:', e));
                  } catch (e) {
                    console.log('Could not play notification sound:', e);
                  }
                }
                
                return updatedChats;
              });

              // Update selected conversation if it's the active one
              const currentSelectedConversation = selectedConversationRef.current;
              if (currentSelectedConversation) {
                console.log('🔔 [ADMIN] Checking if message belongs to selected conversation...');
                console.log('🔔 [ADMIN] Selected conversation:', {
                  userId: currentSelectedConversation.userId,
                  profileId: currentSelectedConversation.profileId
                });
                
                const isSelectedConversation = 
                  (currentSelectedConversation.userId === newMessage.sender_id && currentSelectedConversation.profileId === newMessage.receiver_id) ||
                  (currentSelectedConversation.userId === newMessage.receiver_id && currentSelectedConversation.profileId === newMessage.sender_id);
                
                if (isSelectedConversation) {
                  console.log('🔔 [ADMIN] Adding message to selected conversation');
                  
                  const newChatMessage: ChatMessage = {
                    id: newMessage.id,
                    conversationId: currentSelectedConversation.id,
                    content: newMessage.content,
                    role: newMessage.sender_id === currentSelectedConversation.userId ? 'user' : 'assistant',
                    timestamp: newMessage.created_at,
                    isAdminResponse: false,
                    type: newMessage.type || 'text',
                    imageUrl: newMessage.type === 'image' ? newMessage.image_url : undefined,
                    voiceUrl: newMessage.type === 'voice' ? newMessage.voice_url : undefined,
                    duration: newMessage.duration || undefined,
                    status: 'delivered'
                  };

                  // Format last message based on type
                  let lastMessageText = newMessage.content;
                  if (newMessage.type === 'gift') {
                    lastMessageText = `🎁 ${newMessage.content}`;
                  } else if (newMessage.type === 'image') {
                    lastMessageText = '📷 Photo';
                  } else if (newMessage.type === 'voice') {
                    lastMessageText = '🎵 Voice message';
                  }

                  setSelectedConversation(prev => prev ? {
                    ...prev,
                    messages: [...prev.messages, newChatMessage],
                    lastMessage: lastMessageText,
                    lastMessageAt: newMessage.created_at
                  } : null);
                } else {
                  console.log('🔔 [ADMIN] Message does not belong to selected conversation');
                }
              }
            }
          )
          .subscribe((status) => {
            console.log('🔔 [ADMIN] Message subscription status:', status);
            
            if (status === 'SUBSCRIBED') {
              console.log('✅ [ADMIN] Successfully subscribed to messages');
              reconnectAttempts = 0;
            } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
              console.warn('⚠️ [ADMIN] Message subscription error, attempting to reconnect...');
              if (reconnectAttempts < maxReconnectAttempts && navigator.onLine) {
                reconnectAttempts++;
                setTimeout(() => setupSubscriptions(), 1000 * reconnectAttempts);
              }
            }
          });

        // Subscribe to conversation updates
        conversationSubscription = supabaseAdmin
          .channel(`admin_conversations_${user.id}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'conversations'
            },
            (payload) => {
              console.log('🔔 [ADMIN] Conversation updated:', payload);
              const eventType = payload.eventType;
              const conversationData = payload.new || payload.old;
              
              if (eventType === 'INSERT' && conversationData) {
                console.log('🔔 [ADMIN] New conversation created:', {
                  id: (conversationData as any)?.id?.substring(0, 8),
                  user1_id: (conversationData as any)?.user1_id?.substring(0, 8),
                  user2_id: (conversationData as any)?.user2_id?.substring(0, 8)
                });
              }
              
              // Don't automatically refresh as it resets unread counts
              // The real-time message subscription handles updates properly
              console.log('🔔 [ADMIN] Conversation change detected, but not auto-refreshing to preserve unread counts');
            }
          )
          .subscribe((status) => {
            console.log('🔔 [ADMIN] Conversation subscription status:', status);
          });
          
      } catch (error) {
        console.error('❌ [ADMIN] Error setting up subscriptions:', error);
      }
    };

    // Initial setup
    setupSubscriptions();

    // Handle online/offline events
    const handleOnline = () => {
      console.log('🌐 [ADMIN] Back online, reconnecting subscriptions...');
      reconnectAttempts = 0;
      if (messageSubscription) supabaseAdmin.removeChannel(messageSubscription);
      if (conversationSubscription) supabaseAdmin.removeChannel(conversationSubscription);
      setupSubscriptions();
    };

    const handleOffline = () => {
      console.log('📴 [ADMIN] Gone offline, pausing real-time subscriptions');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup subscriptions
    return () => {
      console.log('🔔 [ADMIN] Cleaning up real-time subscriptions...');
      if (messageSubscription) supabaseAdmin.removeChannel(messageSubscription);
      if (conversationSubscription) supabaseAdmin.removeChannel(conversationSubscription);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isAdmin, user]);

  // Filter user chats based on search query
  const filteredUserChats = userChats.filter(userChat => 
    userChat.user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    userChat.user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    userChat.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    userChat.conversations.some(conv => 
      conv.profileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  // Format time helper
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatLastMessageTime = (date: Date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h`;
    if (diffInHours < 48) return 'yesterday';
    return messageDate.toLocaleDateString();
  };

  // Helper function to parse gift content
  const parseGiftContent = (content: string) => {
    if (!content) return { emoji: '🎁', name: 'Gift' };
    
    // For real gifts, content is just the gift name (e.g., "iPhone 15 Pro" or "2x Red Roses")
    // We'll use a generic gift emoji and the content as the name
    return { emoji: '🎁', name: content };
  };

  // Photo upload functions
  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedConversation || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.error('Image size must be less than 5MB');
      return;
    }

    setUploadingImage(true);
    try {
      // Compress and upload image
      const compressedFile = await compressImage(file, 1200, 0.8);
      const messageId = `admin-img-${Date.now()}`;
      const imageUrl = await uploadImageToSupabase(compressedFile, messageId);
      
      // Send image message
      await AdminService.sendImageMessage(
        selectedConversation.id,
        imageUrl,
        responseText.trim() || '',
        selectedConversation.profile.id,
        user.id
      );

      // Clear input and refresh conversation
      setResponseText('');
      const updatedConversation = await AdminService.getConversation(
        selectedConversation.userId,
        selectedConversation.profileId
      );
      setSelectedConversation(updatedConversation);
      
    } catch (error) {
      console.error('Failed to upload image:', error);
    } finally {
      setUploadingImage(false);
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const compressImage = (file: File, maxWidth: number, quality: number): Promise<File> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }
      
      const img = document.createElement('img');
      
      img.onload = () => {
        // Calculate new dimensions
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        const newWidth = img.width * ratio;
        const newHeight = img.height * ratio;
        
        canvas.width = newWidth;
        canvas.height = newHeight;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            reject(new Error('Failed to compress image'));
          }
        }, 'image/jpeg', quality);
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const uploadImageToSupabase = async (file: File, messageId: string): Promise<string> => {
    const fileName = `admin-chat/${messageId}-${Date.now()}.jpg`;
    
    const { data, error } = await supabase.storage
      .from('chat-images')
      .upload(fileName, file);

    if (error) {
      console.error('Upload error:', error);
      throw new Error('Failed to upload image');
    }

    const { data: { publicUrl } } = supabase.storage
      .from('chat-images')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  // Emoji handling
  const emojis = ['😊', '😍', '🥰', '😘', '💕', '❤️', '🔥', '😂', '👍', '🙌', '💯', '🎉'];
  
  const handleEmojiClick = (emoji: string) => {
    setResponseText(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  // Update ref when selectedConversation changes
  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (selectedConversation && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedConversation?.messages]);

  // Gift management functions
  const loadGiftsData = async () => {
    try {
      const [giftsData, categoriesData] = await Promise.all([
        loadGifts(),
        getGiftCategories()
      ]);
      setGifts(giftsData);
      setGiftCategories(['all', ...categoriesData]);
    } catch (error) {
      console.error('Error loading gifts data:', error);
    }
  };

  const handleAddGift = async () => {
    try {
      const { error } = await supabase
        .from('gifts')
        .insert([{
          name: giftFormData.name,
          description: giftFormData.description,
          price: giftFormData.price,
          image_url: giftFormData.image_url,
          category: giftFormData.category
        }]);

      if (error) throw error;

      await loadGiftsData();
      setShowAddGiftModal(false);
      resetGiftForm();
      toast.success('Gift added successfully!');
    } catch (error) {
      console.error('Error adding gift:', error);
      toast.error('Failed to add gift.');
    }
  };

  const handleUpdateGift = async () => {
    if (!editingGift) return;

    try {
      const { error } = await supabase
        .from('gifts')
        .update({
          name: giftFormData.name,
          description: giftFormData.description,
          price: giftFormData.price,
          image_url: giftFormData.image_url,
          category: giftFormData.category
        })
        .eq('id', editingGift.id);

      if (error) throw error;

      await loadGiftsData();
      setEditingGift(null);
      resetGiftForm();
      toast.success('Gift updated successfully!');
    } catch (error) {
      console.error('Error updating gift:', error);
      toast.error('Failed to update gift.');
    }
  };

  const handleDeleteGift = async (giftId: string) => {
    if (!confirm('Are you sure you want to delete this gift?')) return;

    try {
      const { error } = await supabase
        .from('gifts')
        .delete()
        .eq('id', giftId);

      if (error) throw error;

      await loadGiftsData();
      toast.success('Gift deleted successfully!');
    } catch (error) {
      console.error('Error deleting gift:', error);
      toast.error('Failed to delete gift.');
    }
  };

  const handleToggleGiftStatus = async (gift: DatabaseGift) => {
    try {
      const { error } = await supabase
        .from('gifts')
        .update({ is_active: !gift.is_active })
        .eq('id', gift.id);

      if (error) throw error;

      await loadGiftsData();
    } catch (error) {
      console.error('Error toggling gift status:', error);
    }
  };

  const resetGiftForm = () => {
    setGiftFormData({
      name: '',
      description: '',
      price: 0,
      image_url: '',
      category: 'flowers'
    });
  };

  const openEditGift = (gift: DatabaseGift) => {
    setEditingGift(gift);
    setGiftFormData({
      name: gift.name,
      description: gift.description,
      price: gift.price,
      image_url: gift.image_url,
      category: gift.category
    });
  };

  // Filter gifts based on category and search
  const filteredGifts = gifts.filter(gift => {
    const matchesCategory = selectedGiftCategory === 'all' || gift.category === selectedGiftCategory;
    const matchesSearch = gift.name.toLowerCase().includes(giftSearchQuery.toLowerCase()) ||
                         gift.description.toLowerCase().includes(giftSearchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // User management functions
  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data: users, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(users || []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId: string, action: 'activate' | 'deactivate' | 'delete') => {
    try {
      // For delete action, show confirmation first
      if (action === 'delete') {
        const userToDelete = users.find(user => user.id === userId);
        const userName = userToDelete ? `${userToDelete.first_name} ${userToDelete.last_name}` : 'this user';
        const userRole = userToDelete?.role || 'user';
        
        const isConfirmed = window.confirm(
          `Are you sure you want to delete ${userName}?\n\n`
        );
        
        if (!isConfirmed) {
          return;
        }
        

      }

      let result;
      switch (action) {
        case 'activate':
          result = await supabase
            .from('profiles')
            .update({ is_active: true })
            .eq('id', userId);
          break;
        case 'deactivate':
          result = await supabase
            .from('profiles')
            .update({ is_active: false })
            .eq('id', userId);
          break;
        case 'delete':
          result = await supabase
            .from('profiles')
            .delete()
            .eq('id', userId);
          break;
      }

      if (result?.error) throw result.error;
      await loadUsers(); // Refresh the user list
      toast.success(`User ${action}d successfully!`);
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
      toast.error(`Failed to ${action} user.`);
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    // Basic validation
    if (!userFormData.firstName?.trim()) {
      toast.error('First name is required');
      return;
    }
    if (!userFormData.lastName?.trim()) {
      toast.error('Last name is required');
      return;
    }

    // Create update data with only fields that have values and exist in schema
    const updateData: any = {};
    
    // Required fields
    if (userFormData.firstName) updateData.first_name = userFormData.firstName;
    if (userFormData.lastName) updateData.last_name = userFormData.lastName;
    if (userFormData.role) updateData.role = userFormData.role;
    
    // Optional fields - only include if they have values
    if (userFormData.photos && userFormData.photos.length > 0) updateData.photos = userFormData.photos;
    if (typeof userFormData.coins === 'number') updateData.coins = userFormData.coins;
    if (userFormData.gender) updateData.gender = userFormData.gender;
    if (userFormData.birthDate) updateData.birth_date = new Date(userFormData.birthDate).toISOString().split('T')[0];
    if (userFormData.country) updateData.country = userFormData.country;
    if (userFormData.city) updateData.city = userFormData.city;
    if (userFormData.profession) updateData.profession = userFormData.profession;
    if (userFormData.languages && userFormData.languages.length > 0) updateData.languages = userFormData.languages;
    if (userFormData.bio) updateData.bio = userFormData.bio;
    if (userFormData.interests && userFormData.interests.length > 0) updateData.interests = userFormData.interests;
    if (userFormData.eyeColor && userFormData.eyeColor.trim()) updateData.eye_color = userFormData.eyeColor;
    if (userFormData.hairColor && userFormData.hairColor.trim()) updateData.hair_color = userFormData.hairColor;
    if (userFormData.appearanceType && userFormData.appearanceType.trim()) updateData.appearance_type = userFormData.appearanceType;
    if (userFormData.alcohol && userFormData.alcohol.trim()) updateData.alcohol = userFormData.alcohol;
    if (userFormData.smoking && userFormData.smoking.trim()) updateData.smoking = userFormData.smoking;
    if (userFormData.children && userFormData.children.trim()) updateData.children = userFormData.children;
    if (userFormData.religion && userFormData.religion.trim()) updateData.religion = userFormData.religion;
    if (userFormData.zodiacSign && userFormData.zodiacSign.trim()) updateData.zodiac_sign = userFormData.zodiacSign;
    if (userFormData.englishLevel && userFormData.englishLevel.trim()) updateData.english_level = userFormData.englishLevel;
    
    // Boolean fields
    updateData.verified = userFormData.verified;
    updateData.premium = userFormData.premium;
    updateData.has_intro_video = userFormData.hasIntroVideo;
    updateData.is_online = userFormData.isOnline;
    updateData.has_video = userFormData.hasVideo;
    updateData.has_camera_on = userFormData.hasCameraOn;
    updateData.birthday_soon = userFormData.birthdaySoon;
    updateData.new_profile = userFormData.newProfile;

    // Check if we have any data to update
    if (Object.keys(updateData).length === 0) {
      toast.error('No data to update');
      return;
    }

    console.log('Updating user with data:', updateData);
    console.log('User ID:', selectedUser.id);

    try {
      // Use admin client to bypass RLS policies
      console.log('Using admin client for update...');
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .update(updateData)
        .eq('id', selectedUser.id)
        .select();
      
      console.log('Update result:', { data, error });

      if (error) {
        console.error('Supabase error updating user:', error);
        throw error;
      }
      setShowUserModal(false);
      setSelectedUser(null);
      await loadUsers(); // Refresh the user list
      toast.success('User updated successfully!');
    } catch (error: any) {
      console.error('Error updating user:', error);
      console.error('Error details:', {
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
        code: error?.code
      });
      toast.error(`Failed to update user: ${error?.message || 'Unknown error'}`);
    }
  };

  const openUserModal = (user: any, mode: 'view' | 'edit' = 'view') => {
    setSelectedUser(user);
    setUserFormData({
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      role: user.role || 'user',
      photos: user.photos && user.photos.length > 0 ? user.photos : [''],
      coins: user.coins || 0,
      gender: user.gender || 'female',
      birthDate: user.birth_date || '',
      country: user.country || '',
      city: user.city || '',
      profession: user.profession || '',
      languages: user.languages || [],
      bio: user.bio || '',
      interests: user.interests || [],
      eyeColor: user.eye_color || '',
      hairColor: user.hair_color || '',
      appearanceType: user.appearance_type || '',
      alcohol: user.alcohol || '',
      smoking: user.smoking || '',
      children: user.children || '',
      religion: user.religion || '',
      zodiacSign: user.zodiac_sign || '',
      englishLevel: user.english_level || '',
      verified: user.verified || false,
      premium: user.premium || false,
      hasIntroVideo: user.has_intro_video || false,
      isOnline: user.is_online || false,
      hasVideo: user.has_video || false,
      hasCameraOn: user.has_camera_on || false,
      birthdaySoon: user.birthday_soon || false,
      newProfile: user.new_profile || false,
      top1000: user.top1000 || false
    });
    setUserModalMode(mode);
    setShowUserModal(true);
    setFormErrors({}); // Clear errors when opening modal
  };

  // Load users when the users tab is active
  useEffect(() => {
    if (isAdmin && activeTab === 'users') {
      loadUsers();
    }
  }, [isAdmin, activeTab]);

  // Filter users based on search query
  const filteredUsers = users.filter(user => {
    const searchLower = userSearchQuery.toLowerCase();
    const matchesType = userTypeFilter === 'models' ? user.role === 'model' : user.role !== 'model';
    return (
      matchesType &&
      (
        user.first_name?.toLowerCase().includes(searchLower) ||
        user.last_name?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower)
      )
    );
  });

  const handleAddUser = async () => {
    try {
      // Validate form data first
      if (!validateModelForm()) {
        return;
      }

      const { user, error } = await AdminService.createUser({
        email: userFormData.email,
        firstName: userFormData.firstName,
        lastName: userFormData.lastName,
        role: userFormData.role,
        photos: Array.isArray(userFormData.photos) ? userFormData.photos : [],
        coins: userFormData.coins,
        gender: userFormData.gender,
        birthDate: userFormData.birthDate ? new Date(userFormData.birthDate).toISOString().split('T')[0] : null,
        country: userFormData.country,
        city: userFormData.city,
        profession: userFormData.profession,
        languages: Array.isArray(userFormData.languages) ? userFormData.languages : [],
        bio: userFormData.bio
      });

      if (error) throw error;

      setShowUserModal(false);
      await loadUsers();
      toast.success('User added successfully! They will receive an email to set their password.');
    } catch (error) {
      console.error('Error adding user/model:', error);
      toast.error('Failed to add user.');
    }
  };

  // Add validation function
  const validateModelForm = () => {
    const errors: Record<string, string> = {};
    
    if (!userFormData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    
    if (!userFormData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }
    
    if (userFormData.role === 'model') {
      if (!userFormData.birthDate) {
        errors.birthDate = 'Birth date is required';
      }
      
      if (!userFormData.country.trim()) {
        errors.country = 'Country is required';
      }
      
      if (!userFormData.city.trim()) {
        errors.city = 'City is required';
      }
      
      if (!userFormData.profession.trim()) {
        errors.profession = 'Profession is required';
      }
      
      if (!userFormData.bio.trim()) {
        errors.bio = 'Bio is required';
      }
      
      if (!userFormData.photos || userFormData.photos.length === 0 || !userFormData.photos[0].trim()) {
        errors.photos = 'At least one photo URL is required';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Function to generate random models
  const generateRandomModels = async () => {
    setGeneratingModels(true);
    try {
      const models = [];
      
      for (let i = 0; i < generatorSettings.count; i++) {
        const firstName = modelData.firstNames[Math.floor(Math.random() * modelData.firstNames.length)];
        const lastName = modelData.lastNames[Math.floor(Math.random() * modelData.lastNames.length)];
        const country = generatorSettings.countries[Math.floor(Math.random() * generatorSettings.countries.length)];
        const age = Math.floor(Math.random() * (generatorSettings.ageRange.max - generatorSettings.ageRange.min + 1)) + generatorSettings.ageRange.min;
        const birthDate = new Date();
        birthDate.setFullYear(birthDate.getFullYear() - age);
        birthDate.setMonth(Math.floor(Math.random() * 12));
        birthDate.setDate(Math.floor(Math.random() * 28) + 1);
        
        const model = {
          id: crypto.randomUUID(),
          firstName,
          lastName,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 1000)}@example.com`,
          role: 'model',
          gender: 'female',
          birthDate: birthDate.toISOString().split('T')[0],
          country,
          city: getRandomCity(country),
          profession: modelData.professions[Math.floor(Math.random() * modelData.professions.length)],
          bio: modelData.bios[Math.floor(Math.random() * modelData.bios.length)],
          interests: modelData.interests[Math.floor(Math.random() * modelData.interests.length)],
          languages: modelData.languages[Math.floor(Math.random() * modelData.languages.length)],
          photos: [], // No default photos - keep empty
          verified: generatorSettings.includeVerified ? Math.random() > 0.3 : false,
          premium: generatorSettings.includePremium ? Math.random() > 0.7 : false,
          coins: Math.floor(Math.random() * 1000) + 100,
          // Add filter-related fields
          eyeColor: ['blue', 'brown', 'green', 'hazel'][Math.floor(Math.random() * 4)],
          hairColor: ['blonde', 'brunette', 'black', 'red'][Math.floor(Math.random() * 4)],
          appearanceType: ['slim', 'athletic', 'average', 'curvy'][Math.floor(Math.random() * 4)],
          alcohol: ['never', 'rarely', 'socially', 'regularly'][Math.floor(Math.random() * 4)],
          smoking: ['never', 'rarely', 'regularly', 'trying to quit'][Math.floor(Math.random() * 4)],
          children: ['have', 'want', 'maybe', 'no'][Math.floor(Math.random() * 4)],
          religion: ['christian', 'orthodox', 'catholic', 'muslim', 'none'][Math.floor(Math.random() * 4)],
          zodiacSign: ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'][Math.floor(Math.random() * 12)],
          englishLevel: ['basic', 'intermediate', 'advanced', 'fluent'][Math.floor(Math.random() * 4)],
          hasIntroVideo: Math.random() > 0.5,
          isOnline: Math.random() > 0.3,
          hasVideo: Math.random() > 0.4,
          hasCameraOn: Math.random() > 0.6,
          birthdaySoon: Math.random() > 0.8,
          newProfile: Math.random() > 0.7,
          top1000: Math.random() > 0.9
        };
        
        models.push(model);
      }
      
      // Store generated models and show photo upload interface
      setGeneratedModels(models);
      // Initialize photo uploads with empty arrays for each model
      const initialPhotoUploads: { [key: string]: string[] } = {};
      models.forEach(model => {
        initialPhotoUploads[model.id] = [''];
      });
      setPhotoUploads(initialPhotoUploads);
      setShowModelGenerator(false);
      setShowPhotoUpload(true);
      
    } catch (error) {
      console.error('Error generating models:', error);
      toast.error('Failed to generate models. Please try again.');
    } finally {
      setGeneratingModels(false);
    }
  };

  // Function to handle photo URL input for a model
  const handlePhotoInput = (modelId: string, photoUrls: string) => {
    const urls = photoUrls.split(',').map(url => url.trim()).filter(url => url.length > 0);
    setPhotoUploads(prev => ({
      ...prev,
      [modelId]: urls
    }));
  };

  // Function to add a new photo URL for a model
  const addPhotoUrl = (modelId: string) => {
    setPhotoUploads(prev => ({
      ...prev,
      [modelId]: [...(prev[modelId] || []), '']
    }));
  };

  // Function to remove a photo URL for a model
  const removePhotoUrl = (modelId: string, index: number) => {
    setPhotoUploads(prev => ({
      ...prev,
      [modelId]: prev[modelId]?.filter((_, i) => i !== index) || []
    }));
  };

  // Function to update a specific photo URL
  const updatePhotoUrl = (modelId: string, index: number, url: string) => {
    setPhotoUploads(prev => ({
      ...prev,
      [modelId]: prev[modelId]?.map((photoUrl, i) => i === index ? url : photoUrl) || []
    }));
  };

  // Function to save models with photos to database
  const saveModelsWithPhotos = async () => {
    setUploadingPhotos(true);
    try {
      let successCount = 0;
      let errorCount = 0;
      
      for (const model of generatedModels) {
        try {
          // Use custom photos if provided, otherwise keep empty
          let photos: string[];
          if (photoUploads[model.id] && photoUploads[model.id].length > 0) {
            // Filter out empty URLs and use custom photos
            photos = photoUploads[model.id].filter(url => url.trim().length > 0);
          } else {
            photos = []; // Keep empty if no custom photos provided
          }

          // Use the create_model_profile RPC function
          const { data, error } = await supabase.rpc('create_model_profile', {
            model_first_name: model.firstName,
            model_last_name: model.lastName,
            model_gender: model.gender,
            model_birth_date: model.birthDate,
            model_country: model.country,
            model_city: model.city,
            model_profession: model.profession,
            model_languages: model.languages,
            model_bio: model.bio,
            model_photos: photos,
            model_coins: model.coins || 1000
          });
          
          if (error) {
            console.error('Error creating model profile:', error);
            // If RPC function doesn't exist, try direct insert
            if (error.message?.includes('function') || error.message?.includes('not found')) {
              console.log('RPC function not found, trying direct insert...');
              const { error: directError } = await supabase
                .from('profiles')
                .insert([{
                  first_name: model.firstName,
                  last_name: model.lastName,
                  gender: model.gender,
                  birth_date: model.birthDate,
                  country: model.country,
                  city: model.city,
                  bio: model.bio,
                  interests: model.interests,
                  profession: model.profession,
                  languages: model.languages,
                  photos: photos,
                  verified: model.verified,
                  premium: model.premium,
                  coins: model.coins || 1000,
                  role: 'model',
                  eye_color: model.eyeColor,
                  hair_color: model.hairColor,
                  appearance_type: model.appearanceType,
                  alcohol: model.alcohol,
                  smoking: model.smoking,
                  children: model.children,
                  religion: model.religion,
                  zodiac_sign: model.zodiacSign,
                  english_level: model.englishLevel,
                  has_intro_video: model.hasIntroVideo,
                  is_online: model.isOnline,
                  has_video: model.hasVideo,
                  has_camera_on: model.hasCameraOn,
                  birthday_soon: model.birthdaySoon,
                  new_profile: model.newProfile,
                  top1000: model.top1000
                }]);
              
              if (directError) {
                console.error('Direct insert also failed:', directError);
                errorCount++;
              } else {
                successCount++;
              }
            } else {
              errorCount++;
            }
          } else {
            successCount++;
            console.log('Created model:', data);
          }
        } catch (error) {
          console.error('Error creating model:', error);
          errorCount++;
        }
      }
      
      if (successCount > 0) {
        toast.success(`Successfully created ${successCount} out of ${generatedModels.length} models!`);
      }
      if (errorCount > 0) {
        toast.error(`Failed to create ${errorCount} models. Check console for details.`);
      }
      
      setShowPhotoUpload(false);
      setGeneratedModels([]);
      setPhotoUploads({});
      await loadUsers(); // Refresh the users list
      
    } catch (error) {
      console.error('Error saving models:', error);
      toast.error('Failed to save models. Please try again.');
    } finally {
      setUploadingPhotos(false);
    }
  };

  // Helper function to get random cities
  const getRandomCity = (country: string) => {
    const cities = {
      'Ukraine': ['Kyiv', 'Lviv', 'Kharkiv', 'Odesa', 'Dnipro', 'Zaporizhzhia', 'Vinnytsia', 'Poltava', 'Sumy', 'Chernihiv', 'Cherkasy', 'Kropyvnytskyi', 'Mykolaiv', 'Kherson', 'Mariupol', 'Donetsk', 'Luhansk', 'Ivano-Frankivsk', 'Ternopil', 'Rivne'],
      'Russia': ['Moscow', 'Saint Petersburg', 'Novosibirsk', 'Yekaterinburg', 'Kazan', 'Nizhny Novgorod', 'Chelyabinsk', 'Samara', 'Omsk', 'Rostov-on-Don', 'Ufa', 'Krasnoyarsk', 'Perm', 'Voronezh', 'Volgograd', 'Krasnodar', 'Saratov', 'Tyumen', 'Tolyatti', 'Izhevsk'],
      'Belarus': ['Minsk', 'Gomel', 'Mogilev', 'Vitebsk', 'Grodno', 'Brest', 'Baranovichi', 'Borisov', 'Pinsk', 'Orsha', 'Mozyr', 'Soligorsk', 'Novopolotsk', 'Lida', 'Molodechno', 'Polotsk', 'Slutsk', 'Kobrin', 'Slonim', 'Volkovysk'],
      'Kazakhstan': ['Almaty', 'Nur-Sultan', 'Shymkent', 'Aktobe', 'Karaganda', 'Taraz', 'Pavlodar', 'Semey', 'Oskemen', 'Atyrau', 'Kyzylorda', 'Kostanay', 'Petropavl', 'Taldykorgan', 'Kokshetau', 'Ekibastuz', 'Rudny', 'Temirtau', 'Zhezkazgan', 'Baikonur'],
      'Georgia': ['Tbilisi', 'Batumi', 'Kutaisi', 'Rustavi', 'Gori', 'Zugdidi', 'Poti', 'Khashuri', 'Samtredia', 'Senaki', 'Zestafoni', 'Marneuli', 'Telavi', 'Akhaltsikhe', 'Ozurgeti', 'Kaspi', 'Chiatura', 'Tsqaltubo', 'Sagarejo', 'Gurjaani'],
      'Poland': ['Warsaw', 'Krakow', 'Lodz', 'Wroclaw', 'Poznan', 'Gdansk', 'Szczecin', 'Bydgoszcz', 'Lublin', 'Katowice', 'Bialystok', 'Gdynia', 'Czestochowa', 'Radom', 'Torun', 'Kielce', 'Gliwice', 'Zabrze', 'Bytom', 'Bielsko-Biala'],
      'Czech Republic': ['Prague', 'Brno', 'Ostrava', 'Plzen', 'Liberec', 'Olomouc', 'Usti nad Labem', 'Ceske Budejovice', 'Hradec Kralove', 'Pardubice', 'Zlin', 'Havirov', 'Kladno', 'Most', 'Opava', 'Frydek-Mistek', 'Karvina', 'Jihlava', 'Teplice', 'Decin'],
      'Slovakia': ['Bratislava', 'Kosice', 'Presov', 'Nitra', 'Zilina', 'Banska Bystrica', 'Trnava', 'Martin', 'Trencin', 'Poprad', 'Prievidza', 'Zvolen', 'Povazska Bystrica', 'Michalovce', 'Spisska Nova Ves', 'Komarno', 'Levice', 'Humenne', 'Bardejov', 'Liptovsky Mikulas'],
      'Hungary': ['Budapest', 'Debrecen', 'Szeged', 'Miskolc', 'Pecs', 'Gyor', 'Nyiregyhaza', 'Kecskemet', 'Szekesfehervar', 'Szombathely', 'Szolnok', 'Tatabanya', 'Kaposvar', 'Bekescsaba', 'Erd', 'Veszprem', 'Zalaegerszeg', 'Sopron', 'Eger', 'Nagykanizsa'],
      'Romania': ['Bucharest', 'Cluj-Napoca', 'Timisoara', 'Iasi', 'Constanta', 'Craiova', 'Galati', 'Brasov', 'Ploiesti', 'Braila', 'Oradea', 'Bacau', 'Arad', 'Pitesti', 'Sibiu', 'Targu Mures', 'Baia Mare', 'Buzau', 'Botosani', 'Satu Mare'],
      'Bulgaria': ['Sofia', 'Plovdiv', 'Varna', 'Burgas', 'Ruse', 'Stara Zagora', 'Pleven', 'Sliven', 'Dobrich', 'Shumen', 'Pernik', 'Haskovo', 'Yambol', 'Pazardzhik', 'Blagoevgrad', 'Veliko Tarnovo', 'Vratsa', 'Gabrovo', 'Asenovgrad', 'Kazanlak'],
      'Serbia': ['Belgrade', 'Novi Sad', 'Nis', 'Kragujevac', 'Subotica', 'Zrenjanin', 'Pancevo', 'Cacak', 'Leskovac', 'Novi Pazar', 'Kraljevo', 'Uzice', 'Smederevo', 'Vranje', 'Sabac', 'Sombor', 'Pozarevac', 'Pirot', 'Zajecar', 'Kikinda'],
      'Croatia': ['Zagreb', 'Split', 'Rijeka', 'Osijek', 'Zadar', 'Slavonski Brod', 'Pula', 'Sesvete', 'Karlovac', 'Varazdin', 'Sibenik', 'Sisak', 'Velika Gorica', 'Vinkovci', 'Vukovar', 'Dubrovnik', 'Bjelovar', 'Koprivnica', 'Krapina', 'Pozega'],
      'Slovenia': ['Ljubljana', 'Maribor', 'Celje', 'Kranj', 'Velenje', 'Koper', 'Novo Mesto', 'Ptuj', 'Trbovlje', 'Kamnik', 'Jesenice', 'Nova Gorica', 'Domzale', 'Skofja Loka', 'Murska Sobota', 'Izola', 'Postojna', 'Logatec', 'Slovenj Gradec', 'Kocevje'],
      'Latvia': ['Riga', 'Daugavpils', 'Liepaja', 'Jelgava', 'Jurmala', 'Ventspils', 'Rezekne', 'Valmiera', 'Jekabpils', 'Ogre', 'Tukums', 'Cesis', 'Salaspils', 'Kuldiga', 'Olaine', 'Sigulda', 'Bauska', 'Ludza', 'Gulbene', 'Madona'],
      'Lithuania': ['Vilnius', 'Kaunas', 'Klaipeda', 'Siauliai', 'Panevezys', 'Alytus', 'Marijampole', 'Mazeikiai', 'Jonava', 'Utena', 'Kedainiai', 'Telsiai', 'Visaginas', 'Taurage', 'Ukmerge', 'Plunge', 'Kretinga', 'Silute', 'Radviliskis', 'Palanga'],
      'Estonia': ['Tallinn', 'Tartu', 'Narva', 'Parnu', 'Kohtla-Jarve', 'Viljandi', 'Rakvere', 'Maardu', 'Kuressaare', 'Sillamae', 'Valga', 'Voru', 'Jogeva', 'Haapsalu', 'Keila', 'Paide', 'Tapa', 'Polva', 'Kivioli', 'Turi'],
      'Moldova': ['Chisinau', 'Tiraspol', 'Balti', 'Bender', 'Ribnita', 'Cahul', 'Ungheni', 'Soroca', 'Orhei', 'Dubasari', 'Comrat', 'Edinet', 'Causeni', 'Straseni', 'Floresti', 'Drochia', 'Slobozia', 'Singerei', 'Falesti', 'Vulcanesti'],
      'Armenia': ['Yerevan', 'Gyumri', 'Vanadzor', 'Vagharshapat', 'Abovyan', 'Kapan', 'Hrazdan', 'Ijevan', 'Gavar', 'Armavir', 'Artashat', 'Sevan', 'Goris', 'Masis', 'Ashtarak', 'Ararat', 'Vedi', 'Martuni', 'Spitak', 'Alaverdi'],
      'Azerbaijan': ['Baku', 'Ganja', 'Sumqayit', 'Mingachevir', 'Lankaran', 'Shirvan', 'Nakhchivan', 'Shaki', 'Yevlakh', 'Khankendi', 'Gabala', 'Shamakhi', 'Fuzuli', 'Salyan', 'Barda', 'Neftchala', 'Agdash', 'Zaqatala', 'Goychay', 'Ujar']
    };
    
    const countryCities = cities[country as keyof typeof cities] || cities['Ukraine'];
    return countryCities[Math.floor(Math.random() * countryCities.length)];
  };

  useEffect(() => {
    if (isAdmin) {
      if (activeTab === 'conversations') {
        loadAdminData();
      } else if (activeTab === 'gifts') {
        loadGiftsData();
      } else if (activeTab === 'users') {
        loadUsers();
      } else if (activeTab === 'analytics') {
        loadAnalyticsData();
      }
    }
  }, [isAdmin, activeTab, dateRange]);

  // Add a test function to check admin client
  const testAdminClient = async () => {
    console.log('🧪 [TEST] Testing admin client...');
    
    // Check if service role key is available
    const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
    console.log('🔑 [TEST] Service role key available:', !!serviceRoleKey);
    console.log('🔑 [TEST] Service role key length:', serviceRoleKey?.length || 0);
    
    try {
      // Test 1: Basic connection
      const { data: testData, error: testError } = await supabaseAdmin
        .from('profiles')
        .select('count(*)')
        .limit(1);
      
      console.log('🧪 [TEST] Basic connection test:', { data: testData, error: testError });
      
      // Test 2: Get all profiles
      const { data: profiles, error: profilesError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .limit(5);
      
      console.log('🧪 [TEST] Profiles test:', { 
        count: profiles?.length || 0, 
        error: profilesError,
        sample: profiles?.slice(0, 2)
      });
      
      // Test 3: Get all transactions
      const { data: transactions, error: transactionsError } = await supabaseAdmin
        .from('transactions')
        .select('*')
        .limit(5);
      
      console.log('🧪 [TEST] Transactions test:', { 
        count: transactions?.length || 0, 
        error: transactionsError,
        sample: transactions?.slice(0, 2)
      });
      
      // Test 4: Get all subscription purchases
      const { data: subscriptions, error: subscriptionsError } = await supabaseAdmin
        .from('subscription_purchases')
        .select('*')
        .limit(5);
      
      console.log('🧪 [TEST] Subscriptions test:', { 
        count: subscriptions?.length || 0, 
        error: subscriptionsError,
        sample: subscriptions?.slice(0, 2)
      });
      
    } catch (error) {
      console.error('🧪 [TEST] Admin client test failed:', error);
    }
  };

  const loadAnalyticsData = async () => {
    setAnalyticsLoading(true);
    setAnalyticsError(null);
    try {

      console.log('🔍 [DEBUG] Starting analytics load...');

      // First, let's check if we can access the database at all
      console.log('🔍 [DEBUG] Testing basic database access...');
      
      // Test 1: Try to get any data from transactions table
      const { data: testTransactions, error: testError } = await supabaseAdmin
        .from('transactions')
        .select('count(*)')
        .limit(1);
      
      console.log('🔍 [DEBUG] Test transactions query result:', { data: testTransactions, error: testError });

      // Test 2: Try to get the actual transactions
      const { data: allTransactions, error: allError } = await supabaseAdmin
        .from('transactions')
        .select('*');
      
      console.log('🔍 [DEBUG] All transactions query result:', { 
        count: allTransactions?.length || 0, 
        error: allError,
        sample: allTransactions?.slice(0, 2) 
      });

      // Test 3: Check if RPC functions exist
      console.log('🔍 [DEBUG] Testing RPC function existence...');
      try {
        const { data: rpcTest, error: rpcTestError } = await supabase.rpc('is_admin_user');
        console.log('🔍 [DEBUG] RPC test result:', { data: rpcTest, error: rpcTestError });
      } catch (e) {
        console.log('🔍 [DEBUG] RPC test failed:', e);
      }

      // Try to get transactions using RPC function first
      let transactions: Transaction[] = [];
      let transactionsError = null;
      
      try {
        console.log('🔍 [DEBUG] Trying RPC function...');
        const { data: rpcTransactions, error: rpcError } = await supabase.rpc('get_all_transactions_admin');
        console.log('🔍 [DEBUG] RPC result:', { data: rpcTransactions?.length, error: rpcError });
        
        if (rpcError) {
          console.log('RPC failed, trying direct query...', rpcError);
          throw rpcError;
        }
        transactions = rpcTransactions || [];
        console.log('✅ [DEBUG] Got transactions via RPC:', transactions.length);
      } catch (rpcError) {
        console.log('🔄 [DEBUG] RPC failed, trying admin client...');
        
        // Fallback to admin client
        const { data: adminTransactions, error: adminError } = await supabaseAdmin
          .from('transactions')
          .select('*')
          .order('created_at', { ascending: false });
        
        console.log('🔍 [DEBUG] Admin client result:', { 
          data: adminTransactions?.length, 
          error: adminError,
          sample: adminTransactions?.slice(0, 2)
        });
        
        if (adminError) {
          console.error('Admin client also failed:', adminError);
          throw adminError;
        }
        
        transactions = adminTransactions || [];
        console.log('✅ [DEBUG] Got transactions via admin client:', transactions.length);
      }

      // Get all unique user IDs from transactions
      const userIds = [...new Set(transactions?.map(tx => tx.user_id) || [])];
      console.log('👥 [DEBUG] Unique user IDs:', userIds.length);
      
      // Get profiles for those users
      const { data: transactionProfiles, error: profilesError } = await supabaseAdmin
        .from('profiles')
        .select('id, first_name, last_name, role')
        .in('id', userIds);
        
      if (profilesError) {
        console.error('Failed to get transaction profiles:', profilesError);
        throw profilesError;
      }

      // Create a map of profiles
      const profileMap = (transactionProfiles || []).reduce((acc, profile) => {
        acc[profile.id] = profile;
        return acc;
      }, {} as Record<string, any>);

      // Attach profiles to transactions
      const transactionsWithProfiles = transactions?.map(tx => ({
        ...tx,
        profile: profileMap[tx.user_id] || {
          first_name: 'Unknown',
          last_name: 'User',
          id: tx.user_id
        }
      }));

      // Try to get subscription purchases
      let subscriptions: SubscriptionPurchase[] = [];
      let subscriptionsError = null;
      
      try {
        console.log('🔍 [DEBUG] Trying subscription RPC function...');
        const { data: rpcSubscriptions, error: rpcSubError } = await supabase.rpc('get_all_subscription_purchases_admin');
        console.log('🔍 [DEBUG] Subscription RPC result:', { data: rpcSubscriptions?.length, error: rpcSubError });
        
        if (rpcSubError) {
          console.log('Subscription RPC failed, trying direct query...', rpcSubError);
          throw rpcSubError;
        }
        subscriptions = rpcSubscriptions || [];
        console.log('✅ [DEBUG] Got subscriptions via RPC:', subscriptions.length);
      } catch (rpcSubError) {
        console.log('🔄 [DEBUG] Subscription RPC failed, trying admin client...');
        
        // Fallback to admin client
        const { data: adminSubscriptions, error: adminSubError } = await supabaseAdmin
          .from('subscription_purchases')
          .select('*')
          .order('created_at', { ascending: false });
        
        console.log('🔍 [DEBUG] Subscription admin client result:', { 
          data: adminSubscriptions?.length, 
          error: adminSubError,
          sample: adminSubscriptions?.slice(0, 2)
        });
        
        if (adminSubError) {
          console.error('Admin client for subscriptions also failed:', adminSubError);
          throw adminSubError;
        }
        
        subscriptions = adminSubscriptions || [];
        console.log('✅ [DEBUG] Got subscriptions via admin client:', subscriptions.length);
      }

      // Get all unique user IDs from subscriptions
      const subscriptionUserIds = [...new Set(subscriptions?.map(sub => sub.user_id) || [])];
      
      // Get profiles for subscription users
      const { data: subProfiles, error: subProfilesError } = await supabaseAdmin
        .from('profiles')
        .select('id, first_name, last_name, role')
        .in('id', subscriptionUserIds);
        
      if (subProfilesError) {
        console.error('Failed to get subscription profiles:', subProfilesError);
        throw subProfilesError;
      }

      // Create a map of subscription profiles
      const subProfileMap = (subProfiles || []).reduce((acc, profile) => {
        acc[profile.id] = profile;
        return acc;
      }, {} as Record<string, any>);

      // Get all subscription plans
      const { data: allSubscriptionPlans, error: subscriptionPlansError } = await supabaseAdmin
        .from('subscriptions')
        .select('*');
        
      if (subscriptionPlansError) {
        console.error('Failed to get subscription plans:', subscriptionPlansError);
        throw subscriptionPlansError;
      }

      // Create a map of subscription plans
      const subscriptionMap = (allSubscriptionPlans || []).reduce((acc, sub) => {
        acc[sub.id] = sub;
        return acc;
      }, {} as Record<string, any>);

      // Get profiles for subscriptions
      const { data: subscriptionProfiles, error: subscriptionProfilesError } = await supabaseAdmin
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', subscriptions?.map(sub => sub.user_id) || []);
        
      if (subscriptionProfilesError) {
        console.error('Failed to get subscription profiles:', subscriptionProfilesError);
        throw subscriptionProfilesError;
      }

      // Create a map of subscription profiles
      const subscriptionProfileMap = (subscriptionProfiles || []).reduce((acc, profile) => {
        acc[profile.id] = profile;
        return acc;
      }, {} as Record<string, any>);

      // Attach profiles and subscription details
      const subscriptionsWithDetails = subscriptions?.map(sub => ({
        ...sub,
        profile: subProfileMap[sub.user_id] || {
          first_name: 'Unknown',
          last_name: 'User',
          id: sub.user_id
        },
        subscription: subscriptionMap[sub.subscription_id] || {
          name: 'Unknown Plan',
          price: 0,
          duration: 0
        }
      }));

      console.log('📊 [DEBUG] Final data counts:');
      console.log('- Transactions:', transactions?.length || 0);
      console.log('- Subscriptions:', subscriptions?.length || 0);
      console.log('- Transaction profiles:', transactionProfiles?.length || 0);
      console.log('- Subscription profiles:', subProfiles?.length || 0);

      // Calculate date range filters
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      // Filter data based on selected date range
      const getFilteredTransactions = (transactions: (Transaction & { profile: any })[]) => {
        switch (dateRange) {
          case 'today':
            return transactions?.filter(tx => {
              const txDate = new Date(tx.created_at);
              return txDate >= todayStart && txDate <= todayEnd;
            }) || [];
          case 'week':
            return transactions?.filter(tx => {
              const txDate = new Date(tx.created_at);
              return txDate >= weekStart;
            }) || [];
          case 'month':
            return transactions?.filter(tx => {
              const txDate = new Date(tx.created_at);
              return txDate >= monthStart;
            }) || [];
          case 'all':
          default:
            return transactions || [];
        }
      };

      const getFilteredSubscriptions = (subscriptions: any[]) => {
        switch (dateRange) {
          case 'today':
            return subscriptions?.filter(sub => {
              const subDate = new Date(sub.created_at);
              return subDate >= todayStart && subDate <= todayEnd;
            }) || [];
          case 'week':
            return subscriptions?.filter(sub => {
              const subDate = new Date(sub.created_at);
              return subDate >= weekStart;
            }) || [];
          case 'month':
            return subscriptions?.filter(sub => {
              const subDate = new Date(sub.created_at);
              return subDate >= monthStart;
            }) || [];
          case 'all':
          default:
            return subscriptions || [];
        }
      };

      const getFilteredGiftMessages = (messages: any[]) => {
        switch (dateRange) {
          case 'today':
            return messages?.filter(msg => {
              const msgDate = new Date(msg.created_at);
              return msgDate >= todayStart && msgDate <= todayEnd;
            }) || [];
          case 'week':
            return messages?.filter(msg => {
              const msgDate = new Date(msg.created_at);
              return msgDate >= weekStart;
            }) || [];
          case 'month':
            return messages?.filter(msg => {
              const msgDate = new Date(msg.created_at);
              return msgDate >= monthStart;
            }) || [];
          case 'all':
          default:
            return messages || [];
        }
      };

      // Get filtered data
      const filteredTransactions = getFilteredTransactions(transactionsWithProfiles);
      const filteredSubscriptions = getFilteredSubscriptions(subscriptionsWithDetails);

      // Calculate revenues
      const totalRevenue = filteredTransactions.reduce((sum: number, tx: Transaction & { profile: any }) => 
        sum + (tx.status === 'completed' ? (tx.amount || 0) : 0), 0
      ) || 0;

      const monthlyRevenue = filteredTransactions.reduce((sum: number, tx: Transaction & { profile: any }) => 
        sum + (tx.status === 'completed' ? (tx.amount || 0) : 0), 0
      ) || 0;

      const subscriptionRevenue = filteredTransactions.reduce((sum: number, tx: Transaction & { profile: any }) => 
        sum + (tx.status === 'completed' && tx.type === 'subscription' ? (tx.amount || 0) : 0), 0
      ) || 0;

      const monthlySubscriptionRevenue = filteredTransactions.reduce((sum: number, tx: Transaction & { profile: any }) => 
        sum + (tx.status === 'completed' && tx.type === 'subscription' ? (tx.amount || 0) : 0), 0
      ) || 0;

      const coinsRevenue = filteredTransactions.reduce((sum: number, tx: Transaction & { profile: any }) => 
        sum + (tx.status === 'completed' && tx.type === 'coins' ? (tx.amount || 0) : 0), 0
      ) || 0;

      const monthlyCoinsRevenue = filteredTransactions.reduce((sum: number, tx: Transaction & { profile: any }) => 
        sum + (tx.status === 'completed' && tx.type === 'coins' ? (tx.amount || 0) : 0), 0
      ) || 0;

      // Get popular subscription plans
      const planCounts = filteredTransactions.reduce((acc: Record<string, number>, tx: Transaction & { profile: any }) => {
        if (tx.status === 'completed' && tx.subscription_plan) {
          acc[tx.subscription_plan] = (acc[tx.subscription_plan] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      interface PlanStats {
        plan: string;
        count: number;
        revenue: number;
      }

      const popularPlans = Object.entries(planCounts || {})
        .map(([plan, count]): PlanStats => ({
          plan,
          count: count as number,
          revenue: filteredTransactions.filter((tx: Transaction & { profile: any }) => 
            tx.status === 'completed' && tx.subscription_plan === plan
          ).reduce((sum: number, tx: Transaction & { profile: any }) => sum + (tx.amount || 0), 0) || 0
        }))
        .sort((a: PlanStats, b: PlanStats) => b.count - a.count)
        .slice(0, 5);

      // Calculate trends (last 7 days)
      const trendData = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayStart = new Date(date.setHours(0, 0, 0, 0));
        const dayEnd = new Date(date.setHours(23, 59, 59, 999));
        
        const dayTransactions = filteredTransactions.filter(tx => {
          const txDate = new Date(tx.created_at);
          return txDate >= dayStart && txDate <= dayEnd && tx.status === 'completed';
        }) || [];

        const dayRevenue = dayTransactions.reduce((sum, tx) => 
          sum + (tx.amount || 0), 0
        );

        return {
          date: dayStart.toISOString().split('T')[0],
          orders: dayTransactions.length,
          revenue: dayRevenue
        };
      }).reverse();

      // Calculate active subscriptions
      const activeSubscriptions = filteredSubscriptions.filter(sub => 
        sub.is_active && new Date(sub.expires_at) > new Date()
      ).length || 0;

      // Calculate total coins spent from gift messages
      console.log('🔍 [DEBUG] Calculating coins spent from gift messages...');
      
      // Get all gift messages to calculate coins spent
      const { data: giftMessages, error: giftMessagesError } = await supabaseAdmin
        .from('messages')
        .select('gift_cost, created_at, sender_id, receiver_id, gift_name')
        .eq('type', 'gift')
        .not('gift_cost', 'is', null);
        
      if (giftMessagesError) {
        console.error('Failed to get gift messages:', giftMessagesError);
        throw giftMessagesError;
      }
      
      console.log('🎁 [DEBUG] Gift messages found:', giftMessages?.length || 0);
      
      // Filter gift messages based on date range
      const filteredGiftMessages = getFilteredGiftMessages(giftMessages || []);
      
      const totalCoinsSpent = filteredGiftMessages.reduce((sum, msg) => 
        sum + (msg.gift_cost || 0), 0
      ) || 0;
      
      const monthlyCoinsSpent = filteredGiftMessages.reduce((sum, msg) => 
        sum + (msg.gift_cost || 0), 0
      ) || 0;
      
      // Calculate gift statistics
      const totalGiftsSent = filteredGiftMessages.length || 0;
      const monthlyGiftsSent = filteredGiftMessages.length || 0;
      
      // Get popular gifts
      const giftCounts = filteredGiftMessages.reduce((acc: Record<string, number>, msg) => {
        const giftName = msg.gift_name || 'Unknown Gift';
        acc[giftName] = (acc[giftName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};
      
      const popularGifts = Object.entries(giftCounts)
        .map(([giftName, count]) => ({
          name: giftName,
          count,
          totalCost: filteredGiftMessages.filter(msg => msg.gift_name === giftName)
            .reduce((sum, msg) => sum + (msg.gift_cost || 0), 0) || 0
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      
      console.log('💰 [DEBUG] Coins calculations:');
      console.log('- Total coins spent:', totalCoinsSpent);
      console.log('- Monthly coins spent:', monthlyCoinsSpent);
      console.log('- Total gifts sent:', totalGiftsSent);
      console.log('- Monthly gifts sent:', monthlyGiftsSent);
      console.log('- Popular gifts:', popularGifts);

      console.log('💰 [DEBUG] Revenue calculations:');
      console.log('- Total revenue:', totalRevenue);
      console.log('- Monthly revenue:', monthlyRevenue);
      console.log('- Subscription revenue:', subscriptionRevenue);
      console.log('- Coins revenue:', coinsRevenue);

      setAnalyticsData({
        totalRevenue,
        monthlyRevenue,
        totalOrders: filteredTransactions.filter(tx => tx.status === 'completed').length || 0,
        monthlyOrders: filteredTransactions.filter(tx => tx.status === 'completed').length || 0,
        subscriptionRevenue,
        monthlySubscriptionRevenue,
        coinsRevenue,
        monthlyCoinsRevenue,
        popularPlans,
        recentTransactions: filteredTransactions.filter(tx => tx.status === 'completed')
          .slice(0, 10)
          .map(tx => ({
            ...tx,
            profiles: tx.profile // Map to match the expected structure in the UI
          })) || [],
        revenueTrend: trendData.map(d => ({ date: d.date, value: d.revenue })),
        orderTrend: trendData.map(d => ({ date: d.date, value: d.orders })),
        activeSubscriptions: filteredSubscriptions.filter(sub => 
          sub.is_active && new Date(sub.expires_at) > new Date()
        ).length || 0,
        totalCoinsSpent: totalCoinsSpent,
        monthlyCoinsSpent: monthlyCoinsSpent,
        totalGiftsSent: totalGiftsSent,
        monthlyGiftsSent: monthlyGiftsSent,
        popularGifts: popularGifts
      });

    } catch (error: any) {
      console.error('❌ [DEBUG] Error loading analytics:', error);
      setAnalyticsError(
        error?.message || error?.error_description || 'Failed to load analytics data'
      );
      
      // Reset analytics data to prevent partial data display
      setAnalyticsData({
        totalRevenue: 0,
        monthlyRevenue: 0,
        totalOrders: 0,
        monthlyOrders: 0,
        subscriptionRevenue: 0,
        monthlySubscriptionRevenue: 0,
        coinsRevenue: 0,
        monthlyCoinsRevenue: 0,
        popularPlans: [],
        recentTransactions: [],
        revenueTrend: [],
        orderTrend: [],
        activeSubscriptions: 0,
        totalCoinsSpent: 0,
        monthlyCoinsSpent: 0,
        totalGiftsSent: 0,
        monthlyGiftsSent: 0,
        popularGifts: []
      });
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Add a handler for analytics refresh
  const handleAnalyticsRefresh = async () => {
    await loadAnalyticsData();
  };

  // After the existing useEffect for loading admin data, add new useEffect for real-time subscriptions
  useEffect(() => {
    if (!isAdmin || !user) return;

    // Subscribe to new messages
    const messagesSubscription = supabaseAdmin
      .channel('admin-messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        async (payload) => {
          console.log('🔄 Real-time message update:', payload);
          // Reload chats to get fresh data including unread counts
          await loadUserChats();
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      messagesSubscription.unsubscribe();
    };
  }, [isAdmin, user]);

  // Helper function to send EmailJS notification to admin
  const sendAdminEmailNotification = (message: any) => {
    // Only send if admin is not focused on the tab (off-site)
    if (typeof document !== 'undefined' && document.hasFocus && document.hasFocus()) return;

    // TODO: Replace with your actual EmailJS public key
    const EMAILJS_PUBLIC_KEY = 'FZP5RsHzl0vvkCVIJ';

    emailjs.send('service_0qmh0fk', 'template_6pgimka', {
      chat_id: message.conversation_id || message.conversationId || 'N/A',
      sender_name: message.sender_name || message.sender_id || 'Unknown',
      sender_role: message.sender_role || message.role || 'user',
      message_content: message.content,
      sent_at: new Date(message.created_at).toLocaleString(),
    }, EMAILJS_PUBLIC_KEY)
    .then((result: { text: string }) => {
      console.log('EmailJS notification sent:', result.text);
    }, (error: { text: string }) => {
      console.error('EmailJS error:', error);
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-rose-500 mb-6"></div>
          <div className="text-lg font-semibold text-gray-700">Loading...</div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="bg-red-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to access the admin panel.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 md:py-8">
      {/* Header */}
        <div className="mb-4 md:mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
            <div>
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="mt-1 md:mt-2 text-xs md:text-sm lg:text-base text-gray-600">
                Manage conversations and monitor user activity
              </p>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <button
                onClick={() => navigate('/')}
                className="px-2 md:px-3 lg:px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-colors text-xs md:text-sm flex items-center gap-1 md:gap-2"
              >
                <Home className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">Back to Website</span>
                <span className="sm:hidden">Home</span>
              </button>
              <button
                onClick={activeTab === 'analytics' ? handleAnalyticsRefresh : refreshData}
                className="px-2 md:px-3 lg:px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg hover:from-rose-600 hover:to-pink-600 transition-colors text-xs md:text-sm flex items-center gap-1 md:gap-2 relative"
                disabled={activeTab === 'analytics' ? analyticsLoading : loading}
              >
                {activeTab === 'analytics' ? (
                  analyticsLoading ? (
                    <span className="animate-spin inline-block mr-1">
                      <RefreshCw className="w-3 h-3 md:w-4 md:h-4" />
                    </span>
                  ) : (
                    <RefreshCw className="w-3 h-3 md:w-4 md:h-4" />
                  )
                ) : (
                  loading ? (
                    <span className="animate-spin inline-block mr-1">
                      <RefreshCw className="w-3 h-3 md:w-4 md:h-4" />
                    </span>
                  ) : (
                    <RefreshCw className="w-3 h-3 md:w-4 md:h-4" />
                  )
                )}
                <span className="hidden sm:inline">Refresh Data</span>
                <span className="sm:hidden">Refresh</span>
              </button>

            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1 mb-4 md:mb-8">
          <div className="grid grid-cols-2 md:flex md:flex-row gap-1 md:gap-0">
              <button
              onClick={() => setActiveTab('conversations')}
              className={`px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-1 md:gap-2 ${
                activeTab === 'conversations'
                  ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <MessageCircle className="w-3 h-3 md:w-4 md:h-4" />
              <span className="whitespace-nowrap">Chats</span>
              </button>
            <button
              onClick={() => setActiveTab('gifts')}
              className={`px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-1 md:gap-2 ${
                activeTab === 'gifts'
                  ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Package className="w-3 h-3 md:w-4 md:h-4" />
              <span className="whitespace-nowrap">Gifts</span>
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-1 md:gap-2 ${
                activeTab === 'users'
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <UserCog className="w-3 h-3 md:w-4 md:h-4" />
              <span className="whitespace-nowrap">Users</span>
            </button>
            <button
              onClick={() => setActiveTab('models')}
              className={`px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-1 md:gap-2 ${
                activeTab === 'models'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <SquareUser className="w-3 h-3 md:w-4 md:h-4" />
              <span className="whitespace-nowrap">Models</span>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-1 md:gap-2 col-span-2 md:col-span-1 ${
                activeTab === 'analytics'
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Sparkles className="w-3 h-3 md:w-4 md:h-4" />
              <span className="whitespace-nowrap">Analytics</span>
            </button>
          </div>
        </div>

        {/* Main Content - Conditional based on active tab */}
        {activeTab === 'conversations' ? (
          <div className="flex flex-col md:flex-row h-[600px] md:h-[700px] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Left Sidebar - Conversations List */}
          <div className={`w-full md:w-96 ${selectedConversation ? 'hidden md:flex' : 'flex'} border-r md:border-r border-gray-200 flex-col`}>
            {/* Sidebar Header */}
            <div className="px-3 md:px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Conversations</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {filteredUserChats.reduce((acc, chat) => acc + chat.conversations.length, 0)} active chats
                      </p>
                    </div>
                <div className="hidden md:flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-600">Users</span>
                          </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600">Models</span>
                        </div>
                </div>
              </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
                </div>
              ) : filteredUserChats.length === 0 ? (
                <div className="p-6 text-center">
                  <MessageCircle className="mx-auto h-8 w-8 text-gray-400 mb-3" />
                  <p className="text-sm text-gray-500">No conversations found</p>
                </div>
              ) : (
                filteredUserChats.flatMap((userChat) => 
                  // Sort conversations by last message time (most recent first)
                  userChat.conversations
                    .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())
                    .map((conv) => (
                      <div
                      key={`${userChat.user.id}-${conv.profileId}`}
                      className={`p-2 md:p-3 lg:p-4 cursor-pointer transition-all duration-200 border-b border-gray-100 hover:bg-slate-50 ${
                        selectedConversation?.id === `${userChat.user.id}-${conv.profileId}` 
                          ? 'bg-rose-50 border-l-4 border-l-rose-500' 
                          : conv.unreadCount > 0
                            ? 'bg-rose-50/30 border-l-4 border-l-rose-300'
                            : ''
                      }`}
                        onClick={async () => {
                        try {
                          // Clear unread count immediately like ChatWindow does
                          setUserChats(prev => prev.map(userChatItem => 
                            userChatItem.user.id === userChat.user.id 
                              ? {
                                  ...userChatItem,
                                  conversations: userChatItem.conversations.map(convItem =>
                                    convItem.profileId === conv.profileId
                                      ? { ...convItem, unreadCount: 0 }
                                      : convItem
                                  )
                                }
                              : userChatItem
                          ));
                          
                          // Mark conversation as read in database (optional)
                          try {
                            await AdminService.markConversationAsRead(userChat.user.id, conv.profileId);
                          } catch (dbError) {
                            console.log('Failed to mark conversation as read in database:', dbError);
                          }
                          
                          const conversation = await AdminService.getConversation(userChat.user.id, conv.profileId);
                          console.log('🔍 [DEBUG] Loaded conversation messages:', conversation.messages.map(msg => ({
                            id: msg.id,
                            type: msg.type,
                            content: msg.content?.substring(0, 50),
                            imageUrl: msg.imageUrl,
                            hasImageUrl: !!msg.imageUrl
                          })));
                          setSelectedConversation(conversation);
                          setIsConversationModalOpen(false); // Use sidebar view instead of modal
                        } catch (error) {
                          console.error('Failed to load conversation:', error);
                        }
                      }}
                      >
                                              <div className="flex items-center space-x-1 md:space-x-2 lg:space-x-3">
                        {/* User Avatar */}
                        <div className="relative">
                            {userChat.user.photo ? (
                            <img 
                              src={userChat.user.photo} 
                              alt={`${userChat.user.firstName} ${userChat.user.lastName}`}
                              className="h-6 w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 rounded-full object-cover border border-blue-200"
                            />
                            ) : (
                            <div className="h-6 w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center border border-blue-200">
                              <span className="text-xs font-semibold text-white">
                                {userChat.user.firstName[0]}{userChat.user.lastName[0]}
                              </span>
                              </div>
                            )}
                          <div className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 md:w-2 md:h-2 lg:w-2.5 lg:h-2.5 bg-blue-500 border border-white rounded-full" title="Real User"></div>
                          </div>

                        {/* Profile Avatar */}
                        <div className="relative">
                          {conv.profilePhoto ? (
                            <img 
                              src={conv.profilePhoto} 
                              alt={conv.profileName}
                              className="h-6 w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 rounded-full object-cover border border-green-200"
                              onError={(e) => {
                                // If Elena's photo fails to load, use the same fallback as ChatWindow
                                if (conv.profileName.includes('Elena')) {
                                  e.currentTarget.src = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=776&q=80';
                                } else {
                                  // Hide the image and show the fallback div
                                  e.currentTarget.style.display = 'none';
                                  const fallbackDiv = e.currentTarget.nextElementSibling as HTMLElement;
                                  if (fallbackDiv) {
                                    fallbackDiv.style.display = 'flex';
                                  }
                                }
                              }}
                            />
                          ) : null}
                          <div className={`h-6 w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 rounded-full bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center border border-green-200 ${conv.profilePhoto ? 'hidden' : 'flex'}`}>
                            <span className="text-xs font-semibold text-white">
                              {conv.profileName[0]}
                            </span>
                          </div>
                                                     <div className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 md:w-2 md:h-2 lg:w-2.5 lg:h-2.5 bg-green-500 border border-white rounded-full" title="Model"></div>
                        </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                            <p className="text-xs md:text-sm font-medium text-gray-900 truncate">
                              {userChat.user.firstName} ↔ {conv.profileName}
                              </p>
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-gray-500">
                                {formatLastMessageTime(new Date(conv.lastMessageAt))}
                              </span>
                              {conv.unreadCount > 0 && (
                                <div className="bg-rose-500 text-white text-xs font-semibold rounded-full min-w-[20px] h-[20px] flex items-center justify-center px-1.5 shadow-sm animate-pulse">
                                  {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                                </div>
                              )}
                            </div>
                            </div>
                          <p className="text-xs text-gray-600 truncate mt-0.5">
                            {conv.lastMessage || 'No messages yet...'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                )
              )}
                  </div>
                </div>

          {/* Right Side - Chat View */}
          <div className={`flex-1 ${selectedConversation ? 'flex' : 'hidden md:flex'} flex-col h-[100dvh] md:h-auto relative`}>
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="border-b border-gray-200 bg-gradient-to-r from-slate-50 to-white sticky top-0 z-10">
                  <div className="flex items-center justify-between p-2 md:p-4">
                    {/* Mobile Back Button */}
                    <button 
                      className="md:hidden h-8 w-8 -ml-1 hover:bg-white/60 rounded-lg flex items-center justify-center transition-colors"
                      onClick={() => setSelectedConversation(null)}
                    >
                      <ChevronLeft className="h-5 w-5 text-slate-600" />
                    </button>
                    <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                      {/* User Avatar */}
                      <div className="relative hidden md:block">
                        {selectedConversation.user.photo ? (
                          <img 
                            src={selectedConversation.user.photo} 
                            alt={`${selectedConversation.user.firstName} ${selectedConversation.user.lastName}`}
                            className="h-10 w-10 rounded-full object-cover border-2 border-blue-200"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center border-2 border-blue-200">
                            <span className="text-sm font-semibold text-white">
                              {selectedConversation.user.firstName[0]}{selectedConversation.user.lastName[0]}
                            </span>
                          </div>
                        )}
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-blue-500 border-2 border-white rounded-full"></div>
                      </div>

                      {/* Mobile User Avatar - Smaller */}
                      <div className="relative md:hidden">
                        {selectedConversation.user.photo ? (
                          <img 
                            src={selectedConversation.user.photo} 
                            alt={`${selectedConversation.user.firstName} ${selectedConversation.user.lastName}`}
                            className="h-8 w-8 rounded-full object-cover border-2 border-blue-200"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center border-2 border-blue-200">
                            <span className="text-xs font-semibold text-white">
                              {selectedConversation.user.firstName[0]}{selectedConversation.user.lastName[0]}
                            </span>
                          </div>
                        )}
                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-blue-500 border-2 border-white rounded-full"></div>
                      </div>

                      {/* Profile Avatar - Desktop */}
                      <div className="relative hidden md:block">
                        {selectedConversation.profile.photo ? (
                          <img 
                            src={selectedConversation.profile.photo} 
                            alt={`${selectedConversation.profile.firstName} ${selectedConversation.profile.lastName}`}
                            className="h-10 w-10 rounded-full object-cover border-2 border-green-200"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-400 flex items-center justify-center text-white font-semibold overflow-hidden">
                            {user.photos && user.photos[0] ? (
                              <img src={user.photos[0]} alt={user.firstName} className="h-10 w-10 object-cover rounded-full" />
                            ) : (
                              <span>{user.firstName?.[0]}{user.lastName?.[0]}</span>
                            )}
                          </div>
                        )}
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" title="Model"></div>
                      </div>

                      {/* Profile Avatar - Mobile */}
                      <div className="relative md:hidden">
                        {selectedConversation.profile.photo ? (
                          <img 
                            src={selectedConversation.profile.photo} 
                            alt={`${selectedConversation.profile.firstName} ${selectedConversation.profile.lastName}`}
                            className="h-8 w-8 rounded-full object-cover border-2 border-green-200"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-400 flex items-center justify-center text-white font-semibold overflow-hidden">
                            {user.photos && user.photos[0] ? (
                              <img src={user.photos[0]} alt={user.firstName} className="h-8 w-8 object-cover rounded-full" />
                            ) : (
                              <span className="text-xs">{user.firstName?.[0]}{user.lastName?.[0]}</span>
                            )}
                          </div>
                        )}
                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" title="Model"></div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold text-slate-800 truncate">
                          {selectedConversation.user.firstName} ↔ {selectedConversation.profile.firstName}
                        </h3>
                        <div className="flex flex-wrap items-center gap-1 md:gap-2 mt-0.5 md:mt-1">
                          <span className="inline-flex items-center px-1.5 md:px-2 py-0.5 rounded-full text-[10px] md:text-xs font-medium bg-blue-100 text-blue-800">
                            Real User
                          </span>
                          <span className="text-[10px] md:text-xs text-slate-500 hidden md:inline">•</span>
                          <span className="inline-flex items-center px-1.5 md:px-2 py-0.5 rounded-full text-[10px] md:text-xs font-medium bg-green-100 text-green-800">
                            Model
                          </span>
                        </div>
                      </div>
                    </div>
                    

                  </div>
                </div>

                  {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-50/30 to-white pb-[150px] md:pb-4">
                  {selectedConversation.messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <div className="text-center">
                        <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p>No messages yet</p>
                      </div>
                    </div>
                  ) : (
                    selectedConversation.messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.role === 'user' ? 'justify-start' : 'justify-end'}`}
                        >
                        <div className={`max-w-[85%] md:max-w-[80%] ${message.role === 'user' ? 'order-2' : 'order-2'}`}>
                          <div
                            className={`px-4 py-3 rounded-2xl shadow-sm ${
                              message.type === 'gift'
                                ? message.role === 'user'
                                  ? 'bg-gradient-to-r from-pink-50 to-rose-50 text-slate-800 rounded-bl-md border-2 border-rose-200 shadow-lg'
                                  : 'bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white rounded-br-md border-2 border-yellow-300 shadow-lg'
                                : message.role === 'user' 
                                  ? 'bg-white text-slate-800 rounded-bl-md border border-slate-200'
                                  : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md'
                            }`}
                          >
                            {(() => {
                              // Debug logging for each message render
                              console.log('🔍 [UI DEBUG] Rendering message:', {
                                id: message.id,
                                type: message.type,
                                content: message.content?.substring(0, 30),
                                imageUrl: message.imageUrl,
                                hasImageUrl: !!message.imageUrl,
                                isGift: message.type === 'gift',
                                isImage: message.type === 'image',
                                imageCondition: message.type === 'image' && message.imageUrl
                              });
                              
                              if (message.type === 'gift') {
                                return (
                                  <div className="text-center space-y-1">
                                    <div className="text-2xl animate-bounce">{parseGiftContent(message.content).emoji}</div>
                                    <p className="text-sm font-medium">
                                      {message.role === 'user' ? 'Gift Sent!' : 'Gift Received!'}
                                    </p>
                                    <p className="text-xs opacity-90">
                                      {parseGiftContent(message.content).name}
                            </p>
                          </div>
                                );
                              } else if (message.type === 'image' && message.imageUrl) {
                                return (
                                  <div className="space-y-2">
                                    <img 
                                      src={message.imageUrl} 
                                      alt="Shared image" 
                                      className="rounded-lg max-w-48 h-auto cursor-pointer hover:opacity-90 transition-opacity"
                                      style={{ maxHeight: '200px', objectFit: 'cover' }}
                                      onClick={() => window.open(message.imageUrl, '_blank')}
                                      loading="lazy"
                                      onError={(e) => {
                                        console.error('🔍 [UI DEBUG] Image failed to load:', message.imageUrl);
                                      }}
                                      onLoad={() => {
                                        console.log('🔍 [UI DEBUG] Image loaded successfully:', message.imageUrl);
                                      }}
                                    />
                                    {message.content && <p className="text-sm">{message.content}</p>}
                        </div>
                                );
                              } else if (message.type === 'image' && !message.imageUrl) {
                                // Special case: image message but no imageUrl
                                return (
                                  <div className="space-y-2">
                                    <div className="bg-red-100 border border-red-300 rounded-lg p-3 text-red-700 text-sm">
                                      🔍 DEBUG: Image message missing imageUrl
                                      <br />Type: {message.type}
                                      <br />ImageUrl: {message.imageUrl || 'null/undefined'}
                    </div>
                                    {message.content && <p className="text-sm">{message.content}</p>}
                  </div>
                                );
                              } else {
                                return <p className="text-sm leading-relaxed break-words">{message.content}</p>;
                              }
                            })()}
                          </div>
                          <p className={`text-xs text-slate-500 mt-2 px-1 ${message.role === 'user' ? 'text-left' : 'text-right'}`}>
                            {formatTime(new Date(message.timestamp))} • {message.role === 'user' ? selectedConversation.user.firstName : selectedConversation.profile.firstName}
                            </p>
                          </div>
                        {message.role === 'user' && (
                          <div className="order-1 mr-2">
                            {selectedConversation.user.photo ? (
                              <img 
                                src={selectedConversation.user.photo} 
                                alt={selectedConversation.user.firstName}
                                className="w-6 h-6 rounded-full object-cover border border-slate-200"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center border border-slate-200">
                                <span className="text-xs font-semibold text-white">
                                  {selectedConversation.user.firstName[0]}
                                  </span>
                        </div>
                            )}
                    </div>
                        )}
                        {message.role !== 'user' && (
                          <div className="order-3 ml-2">
                            {selectedConversation.profile.photo ? (
                              <img 
                                src={selectedConversation.profile.photo} 
                                alt={selectedConversation.profile.firstName}
                                className="w-6 h-6 rounded-full object-cover border border-blue-200"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center border border-blue-200">
                                <span className="text-xs font-semibold text-white">
                                  {selectedConversation.profile.firstName[0]}
                                </span>
                              </div>
                            )}
                            </div>
                        )}
                          </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                        </div>
                
                {/* Emoji Picker */}
                {showEmojiPicker && (
                  <div className="border-t border-slate-200 p-4 bg-white fixed bottom-[80px] left-0 right-0 md:static">
                    <div className="grid grid-cols-6 md:grid-cols-8 gap-2">
                      {emojis.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => handleEmojiClick(emoji)}
                          className="p-3 hover:bg-slate-100 active:bg-slate-200 rounded-lg text-lg transition-colors touch-manipulation"
                        >
                          {emoji}
                        </button>
                    ))}
                  </div>
                </div>
                )}

                {/* Message Input */}
                <div className="border-t border-slate-200 p-4 bg-white fixed bottom-0 left-0 right-0 md:static">
                  <div className="space-y-3 max-w-[100vw] md:max-w-none">
                    {/* Attachment options */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 px-3 hover:bg-slate-100 active:bg-slate-200 touch-manipulation flex-shrink-0"
                        onClick={handleFileUpload}
                        disabled={uploadingImage || sendingResponse}
                      >
                        {uploadingImage ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-600 mr-1"></div>
                        ) : (
                          <Image className="h-4 w-4 mr-1" />
                        )}
                        <span className="text-xs">Photo</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 px-3 hover:bg-slate-100 active:bg-slate-200 touch-manipulation flex-shrink-0"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      >
                        <Smile className="h-4 w-4 mr-1" />
                        <span className="text-xs">Emoji</span>
                      </Button>

                    </div>

                    {/* Main input row */}
                    <div className="flex items-end gap-2">
                      <div className="flex-1 relative">
                        <Input
                          value={responseText}
                          onChange={(e) => setResponseText(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              if (responseText.trim() && user && !sendingResponse) {
                                setSendingResponse(true);
                                AdminService.sendProfileResponse(
                                  selectedConversation.id,
                                  responseText,
                                  selectedConversation.profile.id,
                                  user.id
                                ).then(async () => {
                                  setResponseText('');
                                  const updatedConversation = await AdminService.getConversation(
                                    selectedConversation.userId,
                                    selectedConversation.profileId
                                  );
                                  setSelectedConversation(updatedConversation);
                                }).catch((error) => {
                                  console.error('Failed to send response:', error);
                                }).finally(() => {
                                  setSendingResponse(false);
                                });
                              }
                            }
                          }}
                          placeholder={`Message ${selectedConversation.user.firstName}...`}
                          className="rounded-full border-slate-300 focus:border-rose-400 focus:ring-rose-400 text-base h-12 pr-12"
                        />
                        {/* Emoji button inside input */}
                      <button
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full transition-colors"
                      >
                          <Smile className="h-5 w-5 text-slate-400" />
                      </button>
                    </div>

                      {/* Voice record button */}
                      {!responseText.trim() && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-12 w-12 p-0 touch-manipulation transition-colors hover:bg-slate-100 active:bg-slate-200 text-slate-600"
                          onClick={() => {/* TODO: Add voice recording */}}
                          title="Voice message"
                        >
                          <Mic className="h-5 w-5" />
                        </Button>
                      )}

                      {/* Send button */}
                      {responseText.trim() && (
                        <Button 
                          onClick={async () => {
                            if (responseText.trim() && user && !sendingResponse) {
                              setSendingResponse(true);
                              try {
                                await AdminService.sendProfileResponse(
                                  selectedConversation.id,
                                  responseText,
                                  selectedConversation.profile.id,
                                  user.id
                                );
                                setResponseText('');
                                const updatedConversation = await AdminService.getConversation(
                                  selectedConversation.userId,
                                  selectedConversation.profileId
                                );
                                setSelectedConversation(updatedConversation);
                              } catch (error) {
                                console.error('Failed to send response:', error);
                              } finally {
                                setSendingResponse(false);
                              }
                            }
                          }}
                          disabled={sendingResponse || uploadingImage}
                          className="h-12 w-12 p-0 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 touch-manipulation"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      )}
                  </div>
                </div>
                </div>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                  <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                  <p className="text-sm text-gray-500">Choose a conversation from the sidebar to start managing messages</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'gifts' ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Gift Management Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-rose-50 to-pink-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Gifts</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Manage {filteredGifts.length} gifts
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowAddGiftModal(true);
                    resetGiftForm();
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg hover:from-rose-600 hover:to-pink-600 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Gift
                </button>
              </div>
            </div>

            {/* Gift Categories */}
                  <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex flex-wrap gap-2">
                {giftCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedGiftCategory(category)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      selectedGiftCategory === category
                        ? 'bg-rose-100 text-rose-600'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </button>
                ))}
                        </div>
            </div>

            {/* Gifts List */}
              <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
                </div>
              ) : filteredGifts.length === 0 ? (
                <div className="text-center py-12">
                  <Gift className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No gifts found</h3>
                  <p className="text-gray-600">No gifts match your search criteria.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredGifts.map((gift) => (
                    <div key={gift.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      {/* Gift Image */}
                      <div className="aspect-w-16 aspect-h-12 bg-gray-100">
                        <img
                          src={gift.image_url}
                          alt={gift.name}
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400';
                          }}
                        />
                      </div>

                      {/* Gift Info */}
                      <div className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2">{gift.name}</h4>
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{gift.description}</p>
                            <div className="flex items-center gap-2 mb-3">
                              <span className="font-bold text-rose-600">{gift.price} coins</span>
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                {gift.category.replace(/_/g, ' ')}
                          </span>
                              <span className={`text-xs px-2 py-1 rounded ${
                                gift.is_active ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                              }`}>
                                {gift.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                        </div>

                        {/* Gift Actions */}
                        <div className="flex items-center gap-2">
                  <button
                            onClick={() => openEditGift(gift)}
                            className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-1"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit
                  </button>
                  <button
                            onClick={() => handleDeleteGift(gift.id)}
                            className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center"
                  >
                            <Trash2 className="w-4 h-4" />
                  </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'users' ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* User Management Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-teal-50 to-emerald-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Manage {filteredUsers.length} users
                  </p>
                      </div>
                    </div>
                  </div>

            {/* Search Bar */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  placeholder="Search users by name or email..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Users List */}
            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-12">
                  <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
                </div>
              ) : (
                    <div className="space-y-4">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="p-4">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 md:gap-0">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-teal-400 to-emerald-400 flex items-center justify-center text-white font-semibold overflow-hidden">
                                {user.photos && user.photos[0] ? (
                                  <img src={user.photos[0]} alt={user.first_name} className="h-10 w-10 object-cover rounded-full" />
                                ) : (
                                  <span>{user.first_name?.[0]}{user.last_name?.[0]}</span>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="font-semibold text-gray-900 truncate">
                                  {user.first_name} {user.last_name}
                                </h4>
                                <p className="text-sm text-gray-600 truncate">{user.email}</p>
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 mt-3">
                              <span className={`text-xs px-2 py-1 rounded ${
                                user.role === 'admin' 
                                  ? 'bg-purple-100 text-purple-600' 
                                  : 'bg-blue-100 text-blue-600'
                              }`}>
                                {user.role || 'user'}
                              </span>
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                Joined {new Date(user.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          {/* User Actions */}
                          <div className="flex items-center gap-1 md:gap-2 border-t md:border-t-0 pt-3 md:pt-0 mt-3 md:mt-0">
                            <button
                              onClick={() => openUserModal(user, 'view')}
                              className="flex-1 md:flex-none p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4 mx-auto" />
                              <span className="text-xs mt-1 block md:hidden">View</span>
                            </button>
                            <button
                              onClick={() => openUserModal(user, 'edit')}
                              className="flex-1 md:flex-none p-2 text-blue-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                              title="Edit User"
                            >
                              <Edit2 className="h-4 w-4 mx-auto" />
                              <span className="text-xs mt-1 block md:hidden">Edit</span>
                            </button>
                            <button
                              onClick={() => handleUserAction(user.id, 'delete')}
                              className="flex-1 md:flex-none p-2 text-red-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                              title="Delete User"
                            >
                              <Trash2 className="h-4 w-4 mx-auto" />
                              <span className="text-xs mt-1 block md:hidden">Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                    </div>
              )}
                  </div>
          </div>
        ) : activeTab === 'analytics' ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Analytics Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Sales Analytics</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Track your sales performance and revenue
                  </p>
                </div>
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 shadow-inner overflow-x-auto scrollbar-hide">
                  <button
                    onClick={() => setDateRange('today')}
                    className={`px-3 md:px-4 py-2 text-xs md:text-sm font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 whitespace-nowrap flex-shrink-0 ${
                      dateRange === 'today'
                        ? 'bg-white text-blue-600 shadow-sm transform scale-105'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 active:scale-95'
                    }`}
                    style={{
                      WebkitAppearance: 'none',
                      WebkitTapHighlightColor: 'transparent',
                      WebkitUserSelect: 'none',
                      userSelect: 'none'
                    }}
                  >
                    Today
                  </button>
                  <button
                    onClick={() => setDateRange('week')}
                    className={`px-3 md:px-4 py-2 text-xs md:text-sm font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 whitespace-nowrap flex-shrink-0 ${
                      dateRange === 'week'
                        ? 'bg-white text-blue-600 shadow-sm transform scale-105'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 active:scale-95'
                    }`}
                    style={{
                      WebkitAppearance: 'none',
                      WebkitTapHighlightColor: 'transparent',
                      WebkitUserSelect: 'none',
                      userSelect: 'none'
                    }}
                  >
                    Last 7 Days
                  </button>
                  <button
                    onClick={() => setDateRange('month')}
                    className={`px-3 md:px-4 py-2 text-xs md:text-sm font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 whitespace-nowrap flex-shrink-0 ${
                      dateRange === 'month'
                        ? 'bg-white text-blue-600 shadow-sm transform scale-105'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 active:scale-95'
                    }`}
                    style={{
                      WebkitAppearance: 'none',
                      WebkitTapHighlightColor: 'transparent',
                      WebkitUserSelect: 'none',
                      userSelect: 'none'
                    }}
                  >
                    This Month
                  </button>
                  <button
                    onClick={() => setDateRange('all')}
                    className={`px-3 md:px-4 py-2 text-xs md:text-sm font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 whitespace-nowrap flex-shrink-0 ${
                      dateRange === 'all'
                        ? 'bg-white text-blue-600 shadow-sm transform scale-105'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 active:scale-95'
                    }`}
                    style={{
                      WebkitAppearance: 'none',
                      WebkitTapHighlightColor: 'transparent',
                      WebkitUserSelect: 'none',
                      userSelect: 'none'
                    }}
                  >
                    All Time
                  </button>
                </div>
              </div>
            </div>

            {analyticsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : analyticsError ? (
              <div className="p-6">
                <div className="bg-red-50 text-red-600 rounded-lg p-4">
                  {analyticsError}
                </div>
              </div>
            ) : (
              <>
                                 {/* Key Metrics */}
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 p-3 md:p-6">
                   {/* Total Revenue */}
                   <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-4 md:p-6 text-white">
                     <div className="flex items-center justify-between">
                       <h4 className="text-sm md:text-lg font-semibold">Total Revenue</h4>
                       <DollarSign className="h-4 w-4 md:h-5 md:w-5 opacity-80" />
                     </div>
                     <p className="text-lg md:text-2xl font-bold mt-2">${analyticsData.totalRevenue.toFixed(2)}</p>
                     <div className="flex items-center gap-1 md:gap-2 mt-2">
                       <span className="text-xs bg-white/20 rounded-full px-1.5 md:px-2 py-0.5">
                         Subs: ${analyticsData.subscriptionRevenue.toFixed(2)}
                       </span>
                     </div>
                   </div>

                   {/* Monthly Revenue */}
                   <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-4 md:p-6 text-white">
                     <div className="flex items-center justify-between">
                       <h4 className="text-sm md:text-lg font-semibold">Monthly Revenue</h4>
                       <TrendingUp className="h-4 w-4 md:h-5 md:w-5 opacity-80" />
                     </div>
                     <p className="text-lg md:text-2xl font-bold mt-2">${analyticsData.monthlyRevenue.toFixed(2)}</p>
                     <div className="flex items-center gap-1 md:gap-2 mt-2">
                       <span className="text-xs bg-white/20 rounded-full px-1.5 md:px-2 py-0.5">
                         Subs: ${analyticsData.monthlySubscriptionRevenue.toFixed(2)}
                       </span>
                     </div>
                   </div>

                   {/* Subscription Stats */}
                   <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-4 md:p-6 text-white">
                     <div className="flex items-center justify-between">
                       <h4 className="text-sm md:text-lg font-semibold">Subscriptions</h4>
                       <Shield className="h-4 w-4 md:h-5 md:w-5 opacity-80" />
                     </div>
                     <p className="text-lg md:text-2xl font-bold mt-2">{analyticsData.activeSubscriptions}</p>
                     <div className="flex items-center gap-1 md:gap-2 mt-2">
                       <span className="text-xs bg-white/20 rounded-full px-1.5 md:px-2 py-0.5">
                         Active Plans
                       </span>
                     </div>
                   </div>

                   {/* Coins Stats */}
                   <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-4 md:p-6 text-white">
                     <div className="flex items-center justify-between">
                       <h4 className="text-sm md:text-lg font-semibold">Coins Activity</h4>
                       <DollarSign className="h-4 w-4 md:h-5 md:w-5 opacity-80" />
                     </div>
                     <p className="text-lg md:text-2xl font-bold mt-2">{analyticsData.totalCoinsSpent}</p>
                     <div className="flex items-center gap-1 md:gap-2 mt-2">
                       <span className="text-xs bg-white/20 rounded-full px-1.5 md:px-2 py-0.5">
                         Total Coins Spent
                       </span>
                     </div>
                   </div>
                 </div>

                                 {/* Recent Transactions */}
                 <div className="p-3 md:p-6 border-t border-gray-200">
                   <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-0 mb-4 md:mb-6">
                     <h4 className="text-base md:text-lg font-semibold text-gray-900">Recent Transactions</h4>
                     <div className="relative w-full md:w-auto">
                       <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                       <input
                         type="text"
                         value={orderSearchQuery}
                         onChange={(e) => setOrderSearchQuery(e.target.value)}
                         placeholder="Search transactions..."
                         className="w-full md:w-64 pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                       />
                     </div>
                   </div>

                   <div className="overflow-x-auto -mx-3 md:mx-0">
                     <table className="w-full min-w-[800px]">
                       <thead>
                         <tr className="border-b border-gray-200">
                           <th className="text-left py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm font-semibold text-gray-600">Transaction ID</th>
                           <th className="text-left py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm font-semibold text-gray-600">Customer</th>
                           <th className="text-left py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm font-semibold text-gray-600">Type</th>
                           <th className="text-left py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm font-semibold text-gray-600">Plan/Coins</th>
                           <th className="text-left py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm font-semibold text-gray-600">Amount</th>
                           <th className="text-left py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm font-semibold text-gray-600">Status</th>
                           <th className="text-left py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm font-semibold text-gray-600">Date</th>
                         </tr>
                       </thead>
                       <tbody>
                         {analyticsData.recentTransactions
                           .filter(tx => 
                             tx.subscription_plan?.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
                             tx.profiles?.first_name?.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
                             tx.profiles?.last_name?.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
                             tx.type?.toLowerCase().includes(orderSearchQuery.toLowerCase())
                           )
                           .map((tx) => (
                             <tr key={tx.id} className="border-b border-gray-100 hover:bg-gray-50">
                               <td className="py-2 md:py-3 px-2 md:px-4">
                                 <span className="text-xs md:text-sm font-medium text-gray-900">#{tx.id.slice(0, 8)}</span>
                               </td>
                               <td className="py-2 md:py-3 px-2 md:px-4">
                                 <div className="flex items-center gap-1 md:gap-2">
                                   <div className="h-6 w-6 md:h-8 md:w-8 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-600 text-xs md:text-sm font-medium">
                                     {tx.profiles?.first_name?.[0]}{tx.profiles?.last_name?.[0]}
                                   </div>
                                   <div>
                                     <p className="text-xs md:text-sm font-medium text-gray-900">
                                       {tx.profiles?.first_name} {tx.profiles?.last_name}
                                     </p>
                                   </div>
                                 </div>
                               </td>
                               <td className="py-2 md:py-3 px-2 md:px-4">
                                 <span className={`text-xs font-medium px-1.5 md:px-2 py-0.5 md:py-1 rounded-full ${
                                   tx.type === 'subscription' 
                                     ? 'bg-purple-100 text-purple-700'
                                     : 'bg-amber-100 text-amber-700'
                                 }`}>
                                   {tx.type === 'subscription' ? 'Subscription' : 'Coins'}
                                 </span>
                               </td>
                               <td className="py-2 md:py-3 px-2 md:px-4">
                                 <span className="text-xs md:text-sm text-gray-600">
                                   {tx.type === 'subscription' 
                                     ? tx.subscription_plan
                                     : `${tx.coins_added} coins`}
                                 </span>
                               </td>
                               <td className="py-2 md:py-3 px-2 md:px-4">
                                 <span className="text-xs md:text-sm font-medium text-gray-900">
                                   ${tx.amount?.toFixed(2)}
                                 </span>
                               </td>
                               <td className="py-2 md:py-3 px-2 md:px-4">
                                 <span className={`text-xs font-medium px-1.5 md:px-2 py-0.5 md:py-1 rounded-full ${
                                   tx.status === 'completed'
                                     ? 'bg-green-100 text-green-700'
                                     : tx.status === 'pending'
                                     ? 'bg-yellow-100 text-yellow-700'
                                     : 'bg-red-100 text-red-700'
                                 }`}>
                                   {tx.status}
                                 </span>
                               </td>
                               <td className="py-2 md:py-3 px-2 md:px-4">
                                 <span className="text-xs md:text-sm text-gray-600">
                                   {new Date(tx.created_at).toLocaleDateString()}
                                 </span>
                               </td>
                             </tr>
                           ))}
                       </tbody>
                     </table>
                   </div>
                 </div>

                 {/* Popular Subscription Plans */}
                 <div className="p-3 md:p-6 border-t border-gray-200">
                   <h4 className="text-base md:text-lg font-semibold text-gray-900 mb-4 md:mb-6">Popular Subscription Plans</h4>
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
                     {analyticsData.popularPlans.map((item, index) => (
                       <div key={index} className="bg-gray-50 rounded-lg p-3 md:p-4">
                         <div className="flex items-center justify-between mb-2">
                           <span className="text-xs md:text-sm font-medium text-gray-900">{item.plan}</span>
                           <span className="text-xs font-medium text-purple-600 bg-purple-100 px-1.5 md:px-2 py-0.5 md:py-1 rounded-full">
                             {item.count} sold
                           </span>
                         </div>
                         <p className="text-xs md:text-sm text-gray-600">Revenue: ${item.revenue?.toFixed(2)}</p>
                       </div>
                     ))}
                   </div>
                 </div>

                 {/* Additional Stats */}
                 <div className="p-3 md:p-6 border-t border-gray-200">
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                     <div className="bg-gray-50 rounded-lg p-4 md:p-6">
                       <h5 className="text-sm md:text-base font-semibold text-gray-900 mb-3 md:mb-4">Active Subscriptions</h5>
                       <div className="flex items-center justify-between">
                         <span className="text-2xl md:text-3xl font-bold text-purple-600">{analyticsData.activeSubscriptions}</span>
                         <div className="bg-purple-100 rounded-full p-2 md:p-3">
                           <Shield className="h-5 w-5 md:h-6 md:w-6 text-purple-600" />
                         </div>
                       </div>
                     </div>
                     <div className="bg-gray-50 rounded-lg p-4 md:p-6">
                       <h5 className="text-sm md:text-base font-semibold text-gray-900 mb-3 md:mb-4">Total Coins Spent</h5>
                       <div className="flex items-center justify-between">
                         <span className="text-2xl md:text-3xl font-bold text-amber-600">{analyticsData.totalCoinsSpent}</span>
                         <div className="bg-amber-100 rounded-full p-2 md:p-3">
                           <DollarSign className="h-5 w-5 md:h-6 md:w-6 text-amber-600" />
                         </div>
                       </div>
                       <p className="text-xs md:text-sm text-gray-600 mt-2">Monthly: {analyticsData.monthlyCoinsSpent} coins</p>
                     </div>
                     <div className="bg-gray-50 rounded-lg p-4 md:p-6 sm:col-span-2 md:col-span-1">
                       <h5 className="text-sm md:text-base font-semibold text-gray-900 mb-3 md:mb-4">Gift Activity</h5>
                       <div className="flex items-center justify-between">
                         <span className="text-2xl md:text-3xl font-bold text-pink-600">{analyticsData.totalGiftsSent}</span>
                         <div className="bg-pink-100 rounded-full p-2 md:p-3">
                           <Gift className="h-5 w-5 md:h-6 md:w-6 text-pink-600" />
                         </div>
                       </div>
                       <p className="text-xs md:text-sm text-gray-600 mt-2">Monthly: {analyticsData.monthlyGiftsSent} gifts</p>
                     </div>
                   </div>
                 </div>

              </>
            )}
          </div>
        ) : (
          // Models tab content
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Model Management Header - Responsive for Mobile */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-4 px-6 pt-4">
              <div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 text-left">Model Management</h3>
                <p className="text-sm md:text-base text-gray-600 mt-1 text-left">
                  Manage {users.filter(u => u.role === 'model').length} models
                </p>
              </div>
              <button
                onClick={() => setShowModelGenerator(true)}
                className="w-full md:w-auto px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-colors flex items-center justify-center gap-2 text-base md:text-lg"
              >
                <Sparkles className="w-4 h-4" />
                Generate Models
              </button>
            </div>
            {/* Search Bar */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  placeholder="Search models by name or email..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            {/* Models List */}
            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                </div>
              ) : users.filter(u => u.role === 'model' && (
                u.first_name?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                u.last_name?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                u.email?.toLowerCase().includes(userSearchQuery.toLowerCase())
              )).length === 0 ? (
                <div className="text-center py-12">
                  <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No models found</h3>
                </div>
              ) : (
                <div className="space-y-4">
                  {users.filter(u => u.role === 'model' && (
                    u.first_name?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                    u.last_name?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                    u.email?.toLowerCase().includes(userSearchQuery.toLowerCase())
                  )).map((user) => (
                    <div
                      key={user.id}
                      className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="p-4">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 md:gap-0">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-400 flex items-center justify-center text-white font-semibold overflow-hidden">
                                {user.photos && user.photos[0] ? (
                                  <img src={user.photos[0]} alt={user.first_name} className="h-10 w-10 object-cover rounded-full" />
                                ) : (
                                  <span>{user.first_name?.[0]}{user.last_name?.[0]}</span>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="font-semibold text-gray-900 truncate">
                                  {user.first_name} {user.last_name}
                                </h4>
                                <p className="text-sm text-gray-600 truncate">{user.email}</p>
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 mt-3">
                              <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-600">model</span>
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                Joined {new Date(user.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          {/* Model Actions */}
                          <div className="flex items-center gap-1 md:gap-2 border-t md:border-t-0 pt-3 md:pt-0 mt-3 md:mt-0">
                            <button
                              onClick={() => openUserModal(user, 'view')}
                              className="flex-1 md:flex-none p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4 mx-auto" />
                              <span className="text-xs mt-1 block md:hidden">View</span>
                            </button>
                            <button
                              onClick={() => openUserModal(user, 'edit')}
                              className="flex-1 md:flex-none p-2 text-blue-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                              title="Edit Model"
                            >
                              <Edit2 className="h-4 w-4 mx-auto" />
                              <span className="text-xs mt-1 block md:hidden">Edit</span>
                            </button>
                            <button
                              onClick={() => handleUserAction(user.id, 'delete')}
                              className="flex-1 md:flex-none p-2 text-red-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                              title="Delete Model"
                            >
                              <Trash2 className="h-4 w-4 mx-auto" />
                              <span className="text-xs mt-1 block md:hidden">Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* User Modal */}
        {showUserModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  {userModalMode === 'edit' ? 'Edit User/Model' : userModalMode === 'add' ? 'Add User/Model' : 'User Details'}
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* First Name */}
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input
                      type="text"
                      value={userFormData.firstName}
                      onChange={(e) => setUserFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      disabled={userModalMode === 'view'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-gray-100"
                    />
                    </div>
                  {/* Last Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      value={userFormData.lastName}
                      onChange={(e) => setUserFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      disabled={userModalMode === 'view'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-gray-100"
                    />
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                    <Select
                      value={userFormData.role}
                      onChange={e => setUserFormData(prev => ({ ...prev, role: e.target.value }))}
                      disabled={userModalMode === 'view'}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      <option value="model">Model</option>
                    </Select>
                  </div>
                  {/* Birth Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Birth Date *</label>
                    <input
                      type="date"
                      value={userFormData.birthDate || ''}
                      onChange={e => setUserFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                      disabled={userModalMode === 'view'}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-gray-100 ${formErrors.birthDate ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {formErrors.birthDate && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.birthDate}</p>
                    )}
                  </div>

                  {/* Country */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country *</label>
                    <input
                      type="text"
                      value={userFormData.country || ''}
                      onChange={e => setUserFormData(prev => ({ ...prev, country: e.target.value }))}
                      disabled={userModalMode === 'view'}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-gray-100 ${formErrors.country ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {formErrors.country && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.country}</p>
                    )}
                  </div>
                  {/* City */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                    <input
                      type="text"
                      value={userFormData.city || ''}
                      onChange={e => setUserFormData(prev => ({ ...prev, city: e.target.value }))}
                      disabled={userModalMode === 'view'}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-gray-100 ${formErrors.city ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {formErrors.city && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.city}</p>
                    )}
                  </div>

                  {/* Profession */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Profession *</label>
                    <input
                      type="text"
                      value={userFormData.profession || ''}
                      onChange={e => setUserFormData(prev => ({ ...prev, profession: e.target.value }))}
                      disabled={userModalMode === 'view'}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-gray-100 ${formErrors.profession ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {formErrors.profession && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.profession}</p>
                    )}
                  </div>

                  {/* Languages */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Languages (comma separated)</label>
                    <input
                      type="text"
                      value={userFormData.languages ? userFormData.languages.join(', ') : ''}
                      onChange={e => setUserFormData(prev => ({ ...prev, languages: e.target.value.split(',').map(l => l.trim()) }))}
                      disabled={userModalMode === 'view'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-gray-100"
                      placeholder="English, Spanish, French"
                    />
                  </div>

                  {/* Photos */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Photo URLs (comma separated) *</label>
                    <input
                      type="text"
                      value={userFormData.photos ? userFormData.photos.join(', ') : ''}
                      onChange={e => setUserFormData(prev => ({ ...prev, photos: e.target.value.split(',').map(p => p.trim()) }))}
                      disabled={userModalMode === 'view'}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-gray-100 ${formErrors.photos ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="https://example.com/photo1.jpg, https://example.com/photo2.jpg"
                    />
                    {formErrors.photos && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.photos}</p>
                    )}
                    {userFormData.photos && userFormData.photos[0] && (
                      <img src={userFormData.photos[0]} alt="Preview" className="h-16 w-16 rounded-full mt-2 object-cover border" />
                    )}
                  </div>

                  {/* Bio */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bio *</label>
                    <textarea
                      value={userFormData.bio || ''}
                      onChange={e => setUserFormData(prev => ({ ...prev, bio: e.target.value }))}
                      disabled={userModalMode === 'view'}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-gray-100 min-h-[80px] ${formErrors.bio ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Tell us about yourself..."
                    />
                    {formErrors.bio && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.bio}</p>
                    )}
                  </div>

                  {/* Interests */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Interests (comma separated)</label>
                    <input
                      type="text"
                      value={userFormData.interests ? userFormData.interests.join(', ') : ''}
                      onChange={e => setUserFormData(prev => ({ ...prev, interests: e.target.value.split(',').map(i => i.trim()) }))}
                      disabled={userModalMode === 'view'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-gray-100"
                      placeholder="Travel, Music, Art, Cooking"
                    />
                  </div>

                  {/* Coins */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Coins</label>
                    <input
                      type="number"
                      value={userFormData.coins || 0}
                      onChange={e => setUserFormData(prev => ({ ...prev, coins: parseInt(e.target.value) || 0 }))}
                      disabled={userModalMode === 'view'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-gray-100"
                      min="0"
                    />
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                    <Select
                      value={userFormData.gender || 'female'}
                      onChange={e => setUserFormData(prev => ({ ...prev, gender: e.target.value }))}
                      disabled={userModalMode === 'view'}
                    >
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                    </Select>
                  </div>

                  {/* Eye Color */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Eye Color</label>
                    <Select
                      value={userFormData.eyeColor || ''}
                      onChange={e => setUserFormData(prev => ({ ...prev, eyeColor: e.target.value }))}
                      disabled={userModalMode === 'view'}
                    >
                      <option value="">Select Eye Color</option>
                      <option value="blue">Blue</option>
                      <option value="brown">Brown</option>
                      <option value="green">Green</option>
                      <option value="hazel">Hazel</option>
                    </Select>
                  </div>

                  {/* Hair Color */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hair Color</label>
                    <Select
                      value={userFormData.hairColor || ''}
                      onChange={e => setUserFormData(prev => ({ ...prev, hairColor: e.target.value }))}
                      disabled={userModalMode === 'view'}
                    >
                      <option value="">Select Hair Color</option>
                      <option value="blonde">Blonde</option>
                      <option value="brunette">Brunette</option>
                      <option value="black">Black</option>
                      <option value="red">Red</option>
                    </Select>
                  </div>

                  {/* Appearance Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Appearance Type</label>
                    <Select
                      value={userFormData.appearanceType || ''}
                      onChange={e => setUserFormData(prev => ({ ...prev, appearanceType: e.target.value }))}
                      disabled={userModalMode === 'view'}
                    >
                      <option value="">Select Type</option>
                      <option value="slim">Slim</option>
                      <option value="athletic">Athletic</option>
                      <option value="average">Average</option>
                      <option value="curvy">Curvy</option>
                    </Select>
                  </div>

                  {/* Alcohol */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Alcohol</label>
                    <Select
                      value={userFormData.alcohol || ''}
                      onChange={e => setUserFormData(prev => ({ ...prev, alcohol: e.target.value }))}
                      disabled={userModalMode === 'view'}
                    >
                      <option value="">Select Preference</option>
                      <option value="never">Never</option>
                      <option value="rarely">Rarely</option>
                      <option value="socially">Socially</option>
                      <option value="regularly">Regularly</option>
                    </Select>
                  </div>

                  {/* Smoking */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Smoking</label>
                    <Select
                      value={userFormData.smoking || ''}
                      onChange={e => setUserFormData(prev => ({ ...prev, smoking: e.target.value }))}
                      disabled={userModalMode === 'view'}
                    >
                      <option value="">Select Preference</option>
                      <option value="never">Never</option>
                      <option value="rarely">Rarely</option>
                      <option value="regularly">Regularly</option>
                      <option value="trying to quit">Trying to Quit</option>
                    </Select>
                  </div>

                  {/* Children */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Children</label>
                    <Select
                      value={userFormData.children || ''}
                      onChange={e => setUserFormData(prev => ({ ...prev, children: e.target.value }))}
                      disabled={userModalMode === 'view'}
                    >
                      <option value="">Select Preference</option>
                      <option value="have">Have</option>
                      <option value="want">Want</option>
                      <option value="maybe">Maybe</option>
                      <option value="no">No</option>
                    </Select>
                  </div>

                  {/* Religion */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Religion</label>
                    <Select
                      value={userFormData.religion || ''}
                      onChange={e => setUserFormData(prev => ({ ...prev, religion: e.target.value }))}
                      disabled={userModalMode === 'view'}
                    >
                      <option value="">Select Religion</option>
                      <option value="christian">Christian</option>
                      <option value="orthodox">Orthodox</option>
                      <option value="catholic">Catholic</option>
                      <option value="muslim">Muslim</option>
                      <option value="none">None</option>
                    </Select>
                  </div>

                  {/* Zodiac Sign */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Zodiac Sign</label>
                    <Select
                      value={userFormData.zodiacSign || ''}
                      onChange={e => setUserFormData(prev => ({ ...prev, zodiacSign: e.target.value }))}
                      disabled={userModalMode === 'view'}
                    >
                      <option value="">Select Sign</option>
                      <option value="aries">Aries</option>
                      <option value="taurus">Taurus</option>
                      <option value="gemini">Gemini</option>
                      <option value="cancer">Cancer</option>
                      <option value="leo">Leo</option>
                      <option value="virgo">Virgo</option>
                      <option value="libra">Libra</option>
                      <option value="scorpio">Scorpio</option>
                      <option value="sagittarius">Sagittarius</option>
                      <option value="capricorn">Capricorn</option>
                      <option value="aquarius">Aquarius</option>
                      <option value="pisces">Pisces</option>
                    </Select>
                  </div>

                  {/* English Level */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">English Level</label>
                    <Select
                      value={userFormData.englishLevel || ''}
                      onChange={e => setUserFormData(prev => ({ ...prev, englishLevel: e.target.value }))}
                      disabled={userModalMode === 'view'}
                    >
                      <option value="">Select Level</option>
                      <option value="basic">Basic</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                      <option value="fluent">Fluent</option>
                    </Select>
                  </div>

                  {/* Boolean Flags */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Profile Features</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={userFormData.verified || false}
                          onChange={e => setUserFormData(prev => ({ ...prev, verified: e.target.checked }))}
                          disabled={userModalMode === 'view'}
                          className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                        />
                        <span className="text-sm">Verified</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={userFormData.premium || false}
                          onChange={e => setUserFormData(prev => ({ ...prev, premium: e.target.checked }))}
                          disabled={userModalMode === 'view'}
                          className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                        />
                        <span className="text-sm">Premium</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={userFormData.hasIntroVideo || false}
                          onChange={e => setUserFormData(prev => ({ ...prev, hasIntroVideo: e.target.checked }))}
                          disabled={userModalMode === 'view'}
                          className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                        />
                        <span className="text-sm">Intro Video</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={userFormData.isOnline || false}
                          onChange={e => setUserFormData(prev => ({ ...prev, isOnline: e.target.checked }))}
                          disabled={userModalMode === 'view'}
                          className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                        />
                        <span className="text-sm">Online</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={userFormData.hasVideo || false}
                          onChange={e => setUserFormData(prev => ({ ...prev, hasVideo: e.target.checked }))}
                          disabled={userModalMode === 'view'}
                          className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                        />
                        <span className="text-sm">Has Video</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={userFormData.hasCameraOn || false}
                          onChange={e => setUserFormData(prev => ({ ...prev, hasCameraOn: e.target.checked }))}
                          disabled={userModalMode === 'view'}
                          className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                        />
                        <span className="text-sm">Camera On</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={userFormData.birthdaySoon || false}
                          onChange={e => setUserFormData(prev => ({ ...prev, birthdaySoon: e.target.checked }))}
                          disabled={userModalMode === 'view'}
                          className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                        />
                        <span className="text-sm">Birthday Soon</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={userFormData.newProfile || false}
                          onChange={e => setUserFormData(prev => ({ ...prev, newProfile: e.target.checked }))}
                          disabled={userModalMode === 'view'}
                          className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                        />
                        <span className="text-sm">New Profile</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={userFormData.top1000 || false}
                          onChange={e => setUserFormData(prev => ({ ...prev, top1000: e.target.checked }))}
                          disabled={userModalMode === 'view'}
                          className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                        />
                        <span className="text-sm">Top 1000</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              {/* Modal Actions */}
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
                  <button
                  onClick={() => {
                    setShowUserModal(false);
                    setSelectedUser(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {userModalMode === 'view' ? 'Close' : 'Cancel'}
                  </button>
                {userModalMode === 'edit' && (
                  <button
                    onClick={() => {
                      if (userFormData.role === 'model' && !validateModelForm()) {
                        return;
                      }
                      handleUpdateUser();
                    }}
                    disabled={!userFormData.firstName || !userFormData.lastName}
                    className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-lg hover:from-teal-600 hover:to-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Update User/Model
                  </button>
                )}
                {userModalMode === 'add' && (
                  <button
                    onClick={() => {
                      if (userFormData.role === 'model' && !validateModelForm()) {
                        return;
                      }
                      handleAddUser();
                    }}
                    disabled={!userFormData.firstName || !userFormData.lastName}
                    className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-lg hover:from-teal-600 hover:to-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add User/Model
                  </button>
                )}
                </div>
            </div>
          </div>
        )}

        {/* Add/Edit Gift Modal */}
        {(showAddGiftModal || editingGift) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingGift ? 'Edit Gift' : 'Add New Gift'}
                </h3>
                    </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Gift Name */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gift Name
                    </label>
                    <input
                      type="text"
                      value={giftFormData.name}
                      onChange={(e) => setGiftFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Enter gift name"
                    />
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price (coins)
                    </label>
                    <input
                      type="number"
                      value={giftFormData.price}
                      onChange={(e) => setGiftFormData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Enter price"
                      min="0"
                    />
                </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <Select
                      value={giftFormData.category}
                      onChange={e => setGiftFormData(prev => ({ ...prev, category: e.target.value }))}
                    >
                      {giftCategories.filter(cat => cat !== 'all').map((category) => (
                        <option key={category} value={category}>
                          {category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </option>
                      ))}
                    </Select>
              </div>

                  {/* Image URL */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image URL
                    </label>
                    <input
                      type="url"
                      value={giftFormData.image_url}
                      onChange={(e) => setGiftFormData(prev => ({ ...prev, image_url: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="https://example.com/image.jpg"
                    />
            </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={giftFormData.description}
                      onChange={(e) => setGiftFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Enter gift description"
                    />
              </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setShowAddGiftModal(false);
                    setEditingGift(null);
                    resetGiftForm();
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={editingGift ? handleUpdateGift : handleAddGift}
                  disabled={!giftFormData.name || !giftFormData.price}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingGift ? 'Update Gift' : 'Add Gift'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Model Generator Modal */}
        {showModelGenerator && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Generate Random Models
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Automatically create model profiles with realistic data
                </p>
              </div>

              <div className="p-6">
                <div className="space-y-6">
                  {/* Number of Models */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Models to Generate
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={generatorSettings.count}
                      onChange={(e) => setGeneratorSettings(prev => ({ 
                        ...prev, 
                        count: Math.min(100, Math.max(1, parseInt(e.target.value) || 1)) 
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  {/* Countries */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Countries
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                      {['Ukraine', 'Russia', 'Belarus', 'Kazakhstan', 'Georgia', 'Poland', 'Czech Republic', 'Slovakia', 'Hungary', 'Romania', 'Bulgaria', 'Serbia', 'Croatia', 'Slovenia', 'Latvia', 'Lithuania', 'Estonia', 'Moldova', 'Armenia', 'Azerbaijan'].map((country) => (
                        <label key={country} className="flex items-center text-sm">
                          <input
                            type="checkbox"
                            checked={generatorSettings.countries.includes(country)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setGeneratorSettings(prev => ({
                                  ...prev,
                                  countries: [...prev.countries, country]
                                }));
                              } else {
                                setGeneratorSettings(prev => ({
                                  ...prev,
                                  countries: prev.countries.filter(c => c !== country)
                                }));
                              }
                            }}
                            className="mr-2"
                          />
                          <span className="truncate">{country}</span>
                        </label>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Selected: {generatorSettings.countries.length} countries
                    </p>
                  </div>

                  {/* Age Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Age Range
                    </label>
                    <div className="flex items-center gap-4">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Min Age</label>
                        <input
                          type="number"
                          min="18"
                          max="65"
                          value={generatorSettings.ageRange.min}
                          onChange={(e) => setGeneratorSettings(prev => ({ 
                            ...prev, 
                            ageRange: { 
                              ...prev.ageRange, 
                              min: Math.min(prev.ageRange.max, Math.max(18, parseInt(e.target.value) || 18)) 
                            } 
                          }))}
                          className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Max Age</label>
                        <input
                          type="number"
                          min="18"
                          max="65"
                          value={generatorSettings.ageRange.max}
                          onChange={(e) => setGeneratorSettings(prev => ({ 
                            ...prev, 
                            ageRange: { 
                              ...prev.ageRange, 
                              max: Math.max(prev.ageRange.min, Math.min(65, parseInt(e.target.value) || 35)) 
                            } 
                          }))}
                          className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Options */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Options
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={generatorSettings.includeVerified}
                          onChange={(e) => setGeneratorSettings(prev => ({ 
                            ...prev, 
                            includeVerified: e.target.checked 
                          }))}
                          className="mr-2"
                        />
                        <span className="text-sm">Include verified profiles (70% chance)</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={generatorSettings.includePremium}
                          onChange={(e) => setGeneratorSettings(prev => ({ 
                            ...prev, 
                            includePremium: e.target.checked 
                          }))}
                          className="mr-2"
                        />
                        <span className="text-sm">Include premium profiles (30% chance)</span>
                      </label>
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>• Will generate {generatorSettings.count} models</p>
                      <p>• From countries: {generatorSettings.countries.join(', ')}</p>
                      <p>• Age range: {generatorSettings.ageRange.min}-{generatorSettings.ageRange.max} years</p>
                      <p>• Each model will have random:</p>
                      <ul className="list-disc list-inside ml-4 space-y-1">
                        <li>Name, profession, bio, and interests</li>
                        <li>Eye color, hair color, and appearance type</li>
                        <li>Lifestyle preferences (alcohol, smoking, children)</li>
                        <li>Religious beliefs and zodiac sign</li>
                        <li>English level and special features</li>
                        <li>Profile photo from Unsplash</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowModelGenerator(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={generateRandomModels}
                  disabled={generatingModels || generatorSettings.countries.length === 0}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {generatingModels ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate Models
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Photo Upload Modal */}
        {showPhotoUpload && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Add Photos for Generated Models
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {generatedModels.length} models generated. Add custom photos or use default ones.
                </p>
              </div>

              <div className="p-6">
                <div className="space-y-6">
                  {generatedModels.map((model, index) => (
                    <div key={model.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start gap-4">
                        {/* Model Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-400 to-indigo-400 flex items-center justify-center text-white font-semibold">
                              {model.firstName[0]}{model.lastName[0]}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {model.firstName} {model.lastName}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {new Date().getFullYear() - new Date(model.birthDate).getFullYear()} years old • {model.city}, {model.country}
                              </p>
                              <p className="text-xs text-gray-500">{model.profession}</p>
                            </div>
                          </div>
                          
                          {/* Photo Input */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="block text-sm font-medium text-gray-700">
                                Photo URLs
                              </label>
                              <button
                                type="button"
                                onClick={() => addPhotoUrl(model.id)}
                                className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded hover:bg-purple-200 transition-colors flex items-center gap-1"
                              >
                                <Plus className="w-3 h-3" />
                                Add Photo
                              </button>
                            </div>
                            
                            {/* Photo URL Inputs */}
                            <div className="space-y-2">
                              {(photoUploads[model.id] || ['']).map((photoUrl, index) => (
                                <div key={index} className="flex items-center gap-2">
                                                                    <input
                                    type="text"
                                    placeholder="https://example.com/photo.jpg"
                                    value={photoUrl || ''}
                                    onChange={(e) => updatePhotoUrl(model.id, index, e.target.value)}
                                    onBlur={(e) => {
                                      // Trim whitespace when user leaves the field
                                      updatePhotoUrl(model.id, index, e.target.value.trim());
                                    }}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                                  />
                                  {(photoUploads[model.id] || []).length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => removePhotoUrl(model.id, index)}
                                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                      title="Remove photo"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                            
                            <p className="text-xs text-gray-500 mt-1">
                              Add photo URLs or leave empty. Multiple photos recommended for better profile presentation.
                            </p>
                          </div>
                        </div>

                        {/* Current Photo Preview */}
                        <div className="flex-shrink-0">
                          <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                            {photoUploads[model.id] && photoUploads[model.id].length > 0 && photoUploads[model.id][0] ? (
                              <img
                                src={photoUploads[model.id][0]}
                                alt={`${model.firstName}'s photo`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <div className={`w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs ${photoUploads[model.id] && photoUploads[model.id].length > 0 && photoUploads[model.id][0] ? 'hidden' : ''}`}>
                              No Photo
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 text-center">
                            Preview
                          </p>
                          {/* Photo count indicator */}
                          {photoUploads[model.id] && photoUploads[model.id].length > 1 && (
                            <div className="mt-1 text-center">
                              <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">
                                {photoUploads[model.id].filter(url => url.trim()).length} photos
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {generatedModels.length} models ready to create
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setShowPhotoUpload(false);
                      setGeneratedModels([]);
                      setPhotoUploads({});
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveModelsWithPhotos}
                    disabled={uploadingPhotos}
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {uploadingPhotos ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Creating Models...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Create {generatedModels.length} Models
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </div>
  );
};

export default AdminPage; 