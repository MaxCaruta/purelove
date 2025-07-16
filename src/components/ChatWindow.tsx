import { useState, useRef, useEffect } from 'react';
import { X, Send, Phone, Video, MoreVertical, Smile, Paperclip, Heart, Search, Settings, Archive, Star, Image, Mic, VideoIcon, Gift, Lock, MessageCircle, UserX, Flag, Volume2, VolumeX, Bell, BellOff, ChevronLeft, Coins, User, LogIn, Reply, Forward, Trash2, Edit3, Copy, Play, Pause, RotateCcw, Check, CheckCheck, Clock, CornerUpLeft, Zap } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Profile } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useMessageNotifications } from '@/context/MessageNotificationContext';
import { useToast, ToastContainer } from './ui/toast';
import { useConfirmationDialog, ConfirmationDialogContainer } from './ui/confirmation-dialog';
import { usePromptDialog, PromptDialogContainer } from './ui/prompt-dialog';
import { useSettingsDialog, SettingsDialogContainer, ChatSettings } from './ui/settings-dialog';
import { useArchiveDialog, ArchiveDialogContainer, ArchivedConversation } from './ui/archive-dialog';
import { GiftSelector } from './ui/gift-selector';
import { GiftCelebration } from './ui/gift-celebration';
import { CallModal } from './ui/call-modal';
import { supabase } from '@/lib/supabase';
import { coinPrices } from '@/lib/utils';
import { RealGift } from '@/lib/utils';
// @ts-ignore
import emailjs from '@emailjs/browser';

interface Message {
  id: string;
  text: string;
  timestamp: Date;
  isOwn: boolean;
  type: 'text' | 'emoji' | 'image' | 'gift' | 'voice';
  imageUrl?: string;
  voiceUrl?: string;
  duration?: number; // for voice messages
  status?: 'sending' | 'sent' | 'delivered' | 'read'; // message status
  giftData?: {
    name: string;
    cost: number;
    category: string;
    giftType: 'real';
    image: string;
    quantity?: number;
  };
  replyTo?: {
    id: string;
    text: string;
    senderName: string;
  };
  reactions?: {
    emoji: string;
    users: string[];
  }[];
  isEdited?: boolean;
  editedAt?: Date;
  isForwarded?: boolean;
}

interface ChatConversation {
  id: string;
  profile: Profile;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  isOnline: boolean;
  messages: Message[];
}

interface ChatWindowProps {
  profile: Profile;
  isOpen: boolean;
  onClose: () => void;
  searchFilters?: any;
}

export function ChatWindow({ profile, isOpen, onClose, searchFilters = {} }: ChatWindowProps) {
  // Early returns MUST come before any hooks
  if (!isOpen) return null;
  
  const { user, updateCoins } = useAuth();

  // Show login prompt if user is not authenticated
  if (!user) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm p-4 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-8 h-8 text-rose-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign In Required</h2>
            <p className="text-gray-600">
              You need to be signed in to start messaging with <span className="font-semibold text-rose-600">{profile.firstName}</span>
            </p>
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={() => window.location.href = '/login'}
              className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white py-3 text-lg font-medium"
            >
              Sign In
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/signup'}
              className="w-full border-rose-300 text-rose-600 hover:bg-rose-50 py-3 text-lg font-medium"
            >
              Create Account
            </Button>
            <Button 
              variant="ghost"
              onClick={onClose}
              className="w-full text-gray-500 hover:text-gray-700 py-2"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Now all hooks come after early returns
  const { setActiveChat } = useMessageNotifications();
  const toast = useToast();
  const confirmDialog = useConfirmationDialog();
  const promptDialog = usePromptDialog();
  const settingsDialog = useSettingsDialog();
  const archiveDialog = useArchiveDialog();
  
  const [activeConversation, setActiveConversation] = useState<string>(profile.id);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasUserSentMessage, setHasUserSentMessage] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [chatSettings, setChatSettings] = useState<ChatSettings>({
    notifications: true,
    sounds: true,
    readReceipts: true,
    onlineStatus: true,
    autoArchive: false,
    messagePreview: true
  });
  const [archivedConversations, setArchivedConversations] = useState<ArchivedConversation[]>([]);
  const [showGiftSelector, setShowGiftSelector] = useState(false);
  const [showGiftCelebration, setShowGiftCelebration] = useState(false);
  const [celebrationGift, setCelebrationGift] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Call modal states
  const [showCallModal, setShowCallModal] = useState(false);
  const [currentCallType, setCurrentCallType] = useState<'video' | 'voice'>('voice');
  
  // Enhanced messaging states
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [showMessageMenu, setShowMessageMenu] = useState<string | null>(null);
  const [voiceRecording, setVoiceRecording] = useState<{
    isRecording: boolean;
    duration: number;
    mediaRecorder: MediaRecorder | null;
  }>({
    isRecording: false,
    duration: 0,
    mediaRecorder: null
  });
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const [messageSearchQuery, setMessageSearchQuery] = useState('');
  const [showMessageSearch, setShowMessageSearch] = useState(false);
  const [messageDrafts, setMessageDrafts] = useState<{[key: string]: string}>({});
  const [lastSeen, setLastSeen] = useState<Date | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const messageMenuRef = useRef<HTMLDivElement>(null);
  const voiceRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const menuJustOpenedRef = useRef<boolean>(false);
  const lastEmailSentRef = useRef<number>(0);

  // Helper function to send EmailJS notification to admin
  const sendAdminEmailNotification = (message: any) => {
    console.log('📧 [EMAIL] Preparing to send admin email notification...');

    // Check cooldown (2 minutes = 120,000 milliseconds)
    const now = Date.now();
    const cooldownPeriod = 2 * 60 * 1000; // 2 minutes in milliseconds
    const timeSinceLastEmail = now - lastEmailSentRef.current;

    if (timeSinceLastEmail < cooldownPeriod) {
      const remainingTime = Math.ceil((cooldownPeriod - timeSinceLastEmail) / 1000);
      console.log(`📧 [EMAIL] Cooldown active. Next email can be sent in ${remainingTime} seconds`);
      return;
    }

    console.log('📧 [EMAIL] Cooldown passed, proceeding with email notification');

    // TODO: Replace with your actual EmailJS public key
    const EMAILJS_PUBLIC_KEY = 'FZP5RsHzl0vvkCVIJ';

    const emailData = {
      chat_id: message.conversation_id || message.conversationId || 'N/A',
      sender_name: user?.firstName || user?.email || 'Unknown User',
      sender_role: 'user',
      message_content: message.content,
      sent_at: new Date().toLocaleString(),
    };

    console.log('📧 [EMAIL] Sending email with data:', emailData);
    console.log('📧 [EMAIL] Using service: service_0qmh0fk, template: template_6pgimka');

    emailjs.send('service_0qmh0fk', 'template_6pgimka', emailData, EMAILJS_PUBLIC_KEY)
    .then((result: { text: string }) => {
      console.log('✅ [EMAIL] Email notification sent successfully!');
      console.log('📧 [EMAIL] EmailJS response:', result.text);
      
      // Update last email sent timestamp
      lastEmailSentRef.current = Date.now();
      console.log('📧 [EMAIL] Cooldown timer started - next email can be sent in 2 minutes');
    }, (error: { text: string }) => {
      console.error('❌ [EMAIL] Failed to send email notification');
      console.error('📧 [EMAIL] EmailJS error:', error);
    });
  };

  // Request notification permission
  useEffect(() => {
    if (isOpen && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('Notification permission:', permission);
      });
    }
  }, [isOpen]);

  // Set active chat for notification management
  useEffect(() => {
    if (isOpen && profile?.id) {
      setActiveChat(profile.id);
    } else {
      setActiveChat(null);
    }
    
    // Cleanup when component unmounts or closes
    return () => {
      if (isOpen) {
        setActiveChat(null);
      }
    };
  }, [isOpen, profile?.id, setActiveChat]);

  // Initialize conversations when component mounts
  useEffect(() => {
    if (isOpen && user?.id && !isInitialized) {
      setLoading(true);
      if (isValidUUID(user.id) && isValidUUID(profile.id)) {
        // Real user-to-user conversation: fetch from Supabase
        fetchAllConversationsFromSupabase(user.id);
      } else {
        // Demo/AI: use localStorage fallback
      initializeConversations();
        setLoading(false);
      }
      setIsInitialized(true);
    }
  }, [isOpen, user?.id, isInitialized]);

  // Real-time message subscription
  useEffect(() => {
    if (!isOpen || !user?.id || !isValidUUID(user.id)) {
      return;
    }

    console.log('🔔 [CHAT] Setting up real-time message subscription...');
    console.log('🔔 [CHAT] User ID:', user.id);
    
    // Create unique channel name to avoid conflicts with admin
    const channelName = `chat_messages_${user.id}`;
    
    // Subscribe to messages involving the current user
    // Note: Supabase real-time filters have limitations, so we'll filter on the client side
    const messageSubscription = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
          // Removing complex filter and doing client-side filtering instead
        },
        (payload) => {
          console.log('🔔 [CHAT] Real-time message received:', payload);
          
          const newMessage = payload.new as any;
          
          // Client-side filtering: Only process messages involving current user
          const isRelevantMessage = 
            newMessage.sender_id === user.id || newMessage.receiver_id === user.id;
          
          if (!isRelevantMessage) {
            console.log('🔔 [CHAT] Message not relevant to current user, ignoring');
            return;
          }
          
          console.log('🔔 [CHAT] Processing relevant message');
          
          // Check if this is our own optimistic message that we should replace
          const isOwnMessage = newMessage.sender_id === user.id;
          const messageContent = newMessage.content;
          
          // For our own messages, check if we already have an optimistic message to replace
          if (isOwnMessage) {
            const conversation = conversations.find(conv => conv.id === activeConversation);
            if (conversation) {
                             // Look for optimistic message with similar content and timestamp (within 10 seconds)
              const recentOptimisticMessage = conversation.messages.find(msg => 
                msg.isOwn && 
                msg.text === messageContent &&
                Math.abs(new Date(msg.timestamp).getTime() - new Date(newMessage.created_at).getTime()) < 10000 &&
                (msg.id.startsWith('gift-') || msg.id.startsWith('optimistic-')) // Check for optimistic messages
              );
              
              if (recentOptimisticMessage) {
                console.log('🔔 [CHAT] Replacing optimistic message with real message');
                // Replace the optimistic message with the real one
                setConversations(prev => prev.map(conv => 
                  conv.id === activeConversation 
                    ? {
                        ...conv,
                        messages: conv.messages.map(msg => 
                          msg.id === recentOptimisticMessage.id 
                            ? {
                                ...msg,
                                id: newMessage.id,
                                status: 'delivered'
                              }
                            : msg
                        )
                      }
                    : conv
                ));
                return; // Don't add a new message, we replaced the optimistic one
              }
            }
          }
          
          const message: Message = {
            id: newMessage.id,
            text: messageContent,
            timestamp: new Date(newMessage.created_at),
            isOwn: isOwnMessage,
            type: (newMessage.type === 'image' ? 'image' : 
                   newMessage.type === 'emoji' ? 'emoji' : 
                   newMessage.type === 'gift' ? 'gift' : 
                   newMessage.type === 'voice' ? 'voice' : 'text') as 'text' | 'emoji' | 'image' | 'gift' | 'voice',
            imageUrl: newMessage.type === 'image' ? newMessage.image_url : undefined,
            voiceUrl: newMessage.type === 'voice' ? newMessage.voice_url : undefined,
            duration: newMessage.duration || undefined,
            status: 'delivered',
            // Include basic gift data from database if it's a gift message
            giftData: newMessage.type === 'gift' && newMessage.gift_name ? {
              name: newMessage.gift_name,
              cost: newMessage.gift_cost || 0,
              category: 'unknown',
              giftType: 'real',
              image: '/placeholder-gift.jpg',
              quantity: 1
            } : undefined
          };

          console.log('🔔 [CHAT] Processing message:', { isOwn: message.isOwn, content: message.text });

          // Update conversations with proper optimistic message replacement and unread counts
          setConversations(prev => {
            return prev.map(conv => {
              // Check if this message belongs to this conversation
              // For outgoing messages: conv.id should match receiver_id
              // For incoming messages: conv.id should match sender_id
              const isThisConversation = 
                (isOwnMessage && conv.id === newMessage.receiver_id) ||
                (!isOwnMessage && conv.id === newMessage.sender_id);
              
              if (isThisConversation) {
                let updatedMessages = [...conv.messages];
                let newUnreadCount = conv.unreadCount;
                
                // If this is our own message, replace any optimistic message with same content
                if (isOwnMessage) {
                  const optimisticIndex = updatedMessages.findIndex(msg => {
                    // Check for optimistic/gift message IDs
                    const isOptimisticId = msg.id.startsWith('optimistic-') || msg.id.startsWith('gift-');
                    
                    if (!isOptimisticId || !msg.isOwn) return false;
                    
                    // For gift messages, be more flexible with text matching
                    if (newMessage.type === 'gift' && msg.type === 'gift') {
                      // Compare gift names if available in both messages
                      if (newMessage.gift_name && msg.giftData?.name) {
                        return newMessage.gift_name === msg.giftData.name;
                      }
                      // Fallback: check if the database content is contained in the optimistic message text
                      return msg.text.includes(messageContent.replace('🎁 ', ''));
                    }
                    
                    // For non-gift messages, use exact text matching
                    return msg.text === messageContent;
                  });
                  
                  if (optimisticIndex !== -1) {
                    console.log('🔔 [CHAT] Replacing optimistic message with real message');
                    // Preserve giftData from optimistic message if the new message doesn't have it
                    const optimisticMessage = updatedMessages[optimisticIndex];
                    updatedMessages[optimisticIndex] = {
                      ...message,
                      id: newMessage.id,
                      // For gift messages, always preserve the rich gift data from optimistic message
                      giftData: newMessage.type === 'gift' ? optimisticMessage.giftData : (message.giftData || optimisticMessage.giftData),
                      status: 'delivered'
                    };
                  } else {
                    console.log('🔔 [CHAT] No optimistic message found, adding real message');
                    updatedMessages.push(message);
                  }
                } else {
                  // Incoming message from other user
                  console.log('🔔 [CHAT] Adding incoming message');
                  updatedMessages.push(message);
                  
                  // Increment unread count only if this conversation is not currently active
                  if (activeConversation !== conv.id) {
                    newUnreadCount = conv.unreadCount + 1;
                    console.log('🔔 [CHAT] Incrementing unread count for conversation:', conv.profile.firstName, 'New count:', newUnreadCount);
                  }
                }
                
                // Set appropriate last message text based on type
                let lastMessageText = messageContent;
                if (newMessage.type === 'image') {
                  lastMessageText = '📷 Photo';
                } else if (newMessage.type === 'gift') {
                  lastMessageText = `🎁 ${messageContent}`;
                } else if (newMessage.type === 'voice') {
                  lastMessageText = '🎵 Voice message';
                }

                return {
                  ...conv,
                  messages: updatedMessages,
                  lastMessage: lastMessageText,
                  lastMessageTime: message.timestamp,
                  unreadCount: newUnreadCount
                };
              }
              return conv;
            });
          });
          
          // Only play notifications for incoming messages (not our own)
          if (!isOwnMessage) {
            console.log('🔔 [CHAT] Playing notification for incoming message');
            
            // Play notification sound if enabled
            if (isSoundEnabled) {
              const audio = new Audio('/notification.mp3');
              audio.play().catch(e => console.log('Sound play failed:', e));
            }
            
            // Show browser notification if enabled and page is not focused
            if (isNotificationsEnabled && document.hidden) {
              let notificationBody = message.text;
              if (newMessage.type === 'image') {
                notificationBody = '📷 Sent a photo';
              } else if (newMessage.type === 'voice') {
                notificationBody = '🎵 Sent a voice message';
              } else if (newMessage.type === 'gift') {
                notificationBody = `🎁 Sent a gift: ${message.text}`;
              }
              
              new Notification(`New message from ${profile.firstName}`, {
                body: notificationBody.substring(0, 50) + (notificationBody.length > 50 ? '...' : ''),
                icon: profile.photos?.[0] || undefined
              });
            }
          }
        }
      )
      .subscribe((status, err) => {
        console.log('🔔 [CHAT] Subscription status:', status);
        if (err) {
          console.error('🔔 [CHAT] Subscription error:', err);
        }
        
        if (status === 'SUBSCRIBED') {
          console.log('🔔 [CHAT] ✅ Successfully subscribed to real-time messages');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('🔔 [CHAT] ❌ Channel error in subscription');
        } else if (status === 'TIMED_OUT') {
          console.error('🔔 [CHAT] ❌ Subscription timed out');
        } else if (status === 'CLOSED') {
          console.log('🔔 [CHAT] 🔒 Subscription closed');
        }
      });

    // Cleanup subscription
    return () => {
      console.log('🔔 [CHAT] Cleaning up message subscription...');
      supabase.removeChannel(messageSubscription);
    };
  }, [isOpen, user?.id, isSoundEnabled, isNotificationsEnabled, activeConversation]);

  // Helper to check for valid UUID
  const isValidUUID = (id: string) => /^[0-9a-fA-F-]{36}$/.test(id);

  // Fetch all conversations for the user from Supabase
  const fetchAllConversationsFromSupabase = async (userId: string) => {
    try {
      console.log('🔔 [CHAT] Fetching all conversations for user:', userId);
      
      // Fetch all conversations where user is involved
      const { data: conversationsData, error: conversationsError } = await supabase
        .from('conversations')
        .select('*')
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .order('last_message_at', { ascending: false });

      if (conversationsError) {
        console.error('Error fetching conversations from Supabase:', conversationsError);
        // Fallback to single conversation
        fetchConversationFromSupabase(userId, profile.id);
        return;
      }

      if (!conversationsData || conversationsData.length === 0) {
        console.log('🔔 [CHAT] No conversations found, creating new one with current profile');
        // Create new conversation with current profile
        const newConversation = createNewConversation(profile);
        setConversations([newConversation]);
        setActiveConversation(profile.id);
        return;
      }

      console.log('🔔 [CHAT] Found conversations:', conversationsData.length);

      // Get all unique user IDs from conversations (excluding current user)
      const otherUserIds = new Set<string>();
      conversationsData.forEach(conv => {
        if (conv.user1_id !== userId) otherUserIds.add(conv.user1_id);
        if (conv.user2_id !== userId) otherUserIds.add(conv.user2_id);
      });

      // Fetch profile data for all other users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, photos, country, city, profession, birth_date, role')
        .in('id', Array.from(otherUserIds));

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        return;
      }

      // Create profiles map for quick lookup
      const profilesMap = new Map();
      profilesData?.forEach(p => profilesMap.set(p.id, p));

      // Convert conversations to ChatConversation format
      const chatConversations: ChatConversation[] = [];

      for (const conv of conversationsData) {
        const otherUserId = conv.user1_id === userId ? conv.user2_id : conv.user1_id;
        const otherUserProfile = profilesMap.get(otherUserId);

        if (!otherUserProfile) {
          console.warn('Profile not found for user:', otherUserId);
          continue;
        }

        // Fetch messages for this conversation
        const { data: messagesData } = await supabase
          .from('messages')
          .select('*')
          .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`)
          .order('created_at', { ascending: true });

        // Map messages to local format
        const mappedMessages = (messagesData || []).map((msg: any) => ({
          id: msg.id,
          text: msg.content,
          timestamp: new Date(msg.created_at),
          isOwn: msg.sender_id === userId,
          type: (msg.type === 'image' ? 'image' : 
                 msg.type === 'emoji' ? 'emoji' : 
                 msg.type === 'gift' ? 'gift' : 
                 msg.type === 'voice' ? 'voice' : 'text') as 'text' | 'emoji' | 'image' | 'gift' | 'voice',
          imageUrl: msg.type === 'image' ? msg.image_url : undefined,
          voiceUrl: msg.type === 'voice' ? msg.voice_url : undefined,
          duration: msg.duration || undefined,
          status: 'delivered' as const
        }));

        // Calculate age if birth_date is available
        const age = otherUserProfile.birth_date 
          ? new Date().getFullYear() - new Date(otherUserProfile.birth_date).getFullYear()
          : null;

        // Create Profile object
        const profileObj: Profile = {
          id: otherUserProfile.id,
          userId: otherUserProfile.id,
          firstName: otherUserProfile.first_name || 'Unknown',
          lastName: otherUserProfile.last_name || 'User',
          gender: 'female', // Default, could be fetched from profile
          birthDate: otherUserProfile.birth_date || '1990-01-01',
          country: otherUserProfile.country || 'Unknown',
          city: otherUserProfile.city || 'Unknown',
          bio: '',
          interests: [],
          profession: otherUserProfile.profession || 'Unknown',
          languages: ['English'],
          photos: otherUserProfile.photos || [],
          verified: otherUserProfile.role === 'model',
          createdAt: conv.created_at || new Date().toISOString(),
          height: 170,
          weight: 60,
          eyeColor: 'brown',
          hairColor: 'brown',
          appearanceType: 'slim',
          alcohol: 'socially',
          smoking: 'never',
          children: 'no',
          religion: 'other',
          zodiacSign: 'aquarius',
          englishLevel: 'advanced',
          hasIntroVideo: false,
          isOnline: true,
          hasVideo: false,
          hasCameraOn: false,
          birthdaySoon: false,
          newProfile: false,
          top1000: false
        };

        const chatConversation: ChatConversation = {
          id: otherUserId,
          profile: profileObj,
          lastMessage: mappedMessages.length > 0 ? 
            (() => {
              const lastMsg = mappedMessages[mappedMessages.length - 1];
              if (lastMsg.type === 'image') return '📷 Photo';
              if (lastMsg.type === 'voice') return '🎵 Voice message';
              if (lastMsg.type === 'gift') return `🎁 ${lastMsg.text}`;
              return lastMsg.text;
            })() : '',
          lastMessageTime: mappedMessages.length > 0 ? mappedMessages[mappedMessages.length - 1].timestamp : new Date(),
          unreadCount: userId === conv.user1_id ? (conv.user1_unread_count || 0) : (conv.user2_unread_count || 0),
          isOnline: true,
          messages: mappedMessages
        };

        chatConversations.push(chatConversation);
      }

      // Add current profile conversation if not already present
      const currentProfileExists = chatConversations.find(conv => conv.id === profile.id);
      if (!currentProfileExists) {
        const newConversation = createNewConversation(profile);
        chatConversations.unshift(newConversation);
      }

      console.log('🔔 [CHAT] Loaded conversations:', chatConversations.map(c => c.profile.firstName));
      setConversations(chatConversations);
      setActiveConversation(profile.id);
      setLoading(false);

    } catch (error) {
      console.error('Error fetching all conversations from Supabase:', error);
      // Fallback to single conversation
      fetchConversationFromSupabase(user.id, profile.id);
      setLoading(false);
    }
  };

  // Fetch full conversation from Supabase for real users
  const fetchConversationFromSupabase = async (userId: string, profileId: string) => {
    try {
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${userId},receiver_id.eq.${profileId}),and(sender_id.eq.${profileId},receiver_id.eq.${userId})`)
        .order('created_at', { ascending: true });
      if (messagesError) {
        console.error('Error fetching messages from Supabase:', messagesError);
        initializeConversations(); // fallback
        return;
      }
      // Map Supabase messages to local Message format
      const mappedMessages = (messagesData || []).map((msg: any) => ({
        id: msg.id,
        text: msg.content,
        timestamp: new Date(msg.created_at),
        isOwn: msg.sender_id === userId,
        type: (msg.type === 'image' ? 'image' : 
               msg.type === 'emoji' ? 'emoji' : 
               msg.type === 'gift' ? 'gift' : 
               msg.type === 'voice' ? 'voice' : 'text') as 'text' | 'emoji' | 'image' | 'gift' | 'voice',
        imageUrl: msg.type === 'image' ? msg.image_url : undefined,
        voiceUrl: msg.type === 'voice' ? msg.voice_url : undefined,
        duration: msg.duration || undefined
      }));
      // Set up the conversation state
      const conversation: ChatConversation = {
        id: profileId,
        profile: profile,
        lastMessage: mappedMessages.length > 0 ? 
          (() => {
            const lastMsg = mappedMessages[mappedMessages.length - 1];
            if (lastMsg.type === 'image') return '📷 Photo';
            if (lastMsg.type === 'voice') return '🎵 Voice message';
            if (lastMsg.type === 'gift') return `🎁 ${lastMsg.text}`;
            return lastMsg.text;
          })() : '',
        lastMessageTime: mappedMessages.length > 0 ? mappedMessages[mappedMessages.length - 1].timestamp : new Date(),
        unreadCount: 0, // You can enhance this with unread logic if needed
        isOnline: true,
        messages: mappedMessages
      };
      setConversations([conversation]);
      setActiveConversation(profileId);
    } catch (error) {
      console.error('Error fetching conversation from Supabase:', error);
      initializeConversations(); // fallback
    }
  };

  const initializeConversations = () => {
    try {
      console.log('🔔 [CHAT] Initializing conversations from localStorage for user:', user.id);
      const storageKey = `conversations_${user.id}`;
      const storedData = localStorage.getItem(storageKey);
      
      if (storedData) {
        const parsedConversations = JSON.parse(storedData);
        const formattedConversations: ChatConversation[] = parsedConversations.map((conv: any) => ({
          ...conv,
          lastMessageTime: new Date(conv.lastMessageTime),
          messages: conv.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
        
        console.log('🔔 [CHAT] Found stored conversations:', formattedConversations.map(c => c.profile.firstName));
        
        // Keep conversations as is - let UI handle missing photos
        const updatedConversations = formattedConversations;
        
        // Check if current profile conversation exists
        const existingConv = updatedConversations.find(conv => conv.id === profile.id);
        if (existingConv) {
          // Sort conversations by last message time (most recent first)
          updatedConversations.sort((a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime());
          setConversations(updatedConversations);
          setActiveConversation(profile.id);
        } else {
          // Add current profile to conversations at the top
          const newConversation = createNewConversation(profile);
          // Sort existing conversations by last message time
          updatedConversations.sort((a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime());
          setConversations([newConversation, ...updatedConversations]);
          setActiveConversation(profile.id);
        }
      } else {
        console.log('🔔 [CHAT] No stored conversations found, creating new conversation and sample conversations');
        
        // Create sample conversations with some unread messages for demo
        const sampleConversations: ChatConversation[] = [];
        
        // Create main conversation with current profile
        const newConversation = createNewConversation(profile);
        sampleConversations.push(newConversation);
        
        // Add sample conversations with unread messages (only for demo users)
        if (!isValidUUID(user.id)) {
          const sampleProfiles = [
            {
              id: 'sample-1',
              firstName: 'Emma',
              lastName: 'Wilson',
              photos: ['https://images.unsplash.com/photo-1494790108755-2616b612b353?w=400'],
              country: 'USA',
              city: 'New York',
              verified: true
            },
            {
              id: 'sample-2', 
              firstName: 'Sofia',
              lastName: 'Rodriguez',
              photos: ['https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400'],
              country: 'Spain',
              city: 'Madrid',
              verified: true
            },
            {
              id: 'sample-3',
              firstName: 'Anna',
              lastName: 'Kowalski',
              photos: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'],
              country: 'Poland',
              city: 'Warsaw',
              verified: false
            }
          ];
          
          sampleProfiles.forEach((sampleProfile, index) => {
            const fullProfile: Profile = {
              id: sampleProfile.id,
              userId: sampleProfile.id,
              firstName: sampleProfile.firstName,
              lastName: sampleProfile.lastName,
              gender: 'female',
              birthDate: '1995-01-01',
              country: sampleProfile.country,
              city: sampleProfile.city,
              bio: '',
              interests: [],
              profession: 'Model',
              languages: ['English'],
              photos: sampleProfile.photos,
              verified: sampleProfile.verified,
              createdAt: new Date().toISOString(),
              height: 170,
              weight: 60,
              eyeColor: 'brown',
              hairColor: 'brown',
              appearanceType: 'slim',
              alcohol: 'socially',
              smoking: 'never',
              children: 'no',
              religion: 'other',
              zodiacSign: 'aquarius',
              englishLevel: 'advanced',
              hasIntroVideo: false,
              isOnline: true,
              hasVideo: false,
              hasCameraOn: false,
              birthdaySoon: false,
              newProfile: false,
              top1000: false
            };
            
            const sampleMessages: Message[] = [
              {
                id: `sample-msg-${index}-1`,
                text: `Hi! I saw your profile and would love to chat! 😊`,
                timestamp: new Date(Date.now() - (24 - index * 6) * 60 * 60 * 1000),
                isOwn: false,
                type: 'text',
                status: 'delivered'
              },
              {
                id: `sample-msg-${index}-2`,
                text: `Hope you're having a wonderful day! 💕`,
                timestamp: new Date(Date.now() - (12 - index * 3) * 60 * 60 * 1000),
                isOwn: false,
                type: 'text',
                status: 'delivered'
              }
            ];
            
            const sampleConversation: ChatConversation = {
              id: sampleProfile.id,
              profile: fullProfile,
              lastMessage: sampleMessages[sampleMessages.length - 1].text,
              lastMessageTime: sampleMessages[sampleMessages.length - 1].timestamp,
              unreadCount: 2, // Start with 2 unread messages
              isOnline: true,
              messages: sampleMessages
            };
            
            sampleConversations.push(sampleConversation);
          });
        }
        
        setConversations(sampleConversations);
        setActiveConversation(profile.id);
      }
    } catch (error) {
      console.error('Error initializing conversations:', error);
      // Fallback: create new conversation
      const newConversation = createNewConversation(profile);
      setConversations([newConversation]);
      setActiveConversation(profile.id);
    }
  };

  const createNewConversation = (profile: Profile): ChatConversation => {
    // Use profile as is - let UI handle missing photos
    const updatedProfile = { ...profile };
    
    return {
    id: profile.id,
      profile: updatedProfile,
          lastMessage: '',
          lastMessageTime: new Date(),
          unreadCount: 0,
          isOnline: true,
    messages: []
    };
  };

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    if (user?.id && conversations.length > 0 && isInitialized) {
      const storageKey = `conversations_${user.id}`;
      localStorage.setItem(storageKey, JSON.stringify(conversations));
    }
  }, [conversations, user?.id, isInitialized]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [conversations, isTyping]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const addMessageToConversation = (conversationId: string, message: Message) => {
    console.log('🔔 [CHAT] Adding message to conversation:', { conversationId, messageId: message.id, content: message.text });
    
    setConversations(prev => {
      const updated = prev.map(conv => {
          if (conv.id === conversationId) {
          // Check if message already exists to prevent duplicates
          const messageExists = conv.messages.some(existing => existing.id === message.id);
          if (messageExists) {
            console.log('🔔 [CHAT] Message already exists, skipping:', message.id);
            return conv;
          }
          
          console.log('🔔 [CHAT] Adding new message to conversation');
          
          // For incoming messages (not own messages), increment unread count if conversation is not active
          let newUnreadCount = conv.unreadCount;
          if (!message.isOwn && activeConversation !== conversationId) {
            newUnreadCount = conv.unreadCount + 1;
            console.log('🔔 [CHAT] Incrementing unread count for localStorage conversation:', conv.profile.firstName, 'New count:', newUnreadCount);
          }
          
            return {
              ...conv,
            messages: [...conv.messages, message],
            lastMessage: message.text,
            lastMessageTime: message.timestamp,
            unreadCount: newUnreadCount
            };
          }
          return conv;
      });
      
      return updated;
    });
  };



  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    // Check subscription status - require active subscription for messaging
    if (!user || !user.chatSubscription || new Date(user.chatSubscription.expiresAt) <= new Date()) {
      // Redirect to pricing to get subscription
      window.location.href = '/pricing';
        return;
      }

    const messageContent = newMessage.trim();
    setNewMessage('');
    setReplyingTo(null);
    setHasUserSentMessage(true);

    // For real user-to-user conversations, send to database
    if (isValidUUID(user.id) && isValidUUID(activeConversation)) {
      // Create optimistic message for immediate UI feedback
      const optimisticMessage: Message = {
        id: `optimistic-${Date.now()}`,
      text: messageContent,
        timestamp: new Date(),
        isOwn: true,
        type: 'text',
        status: 'sending',
        replyTo: replyingTo ? {
          id: replyingTo.id,
          text: replyingTo.text,
          senderName: replyingTo.isOwn ? 'You' : currentProfile?.firstName || 'User'
        } : undefined
      };

      // Add optimistic message immediately for better UX
      addMessageToConversation(activeConversation, optimisticMessage);
      
    try {
        const { error } = await supabase
          .from('messages')
          .insert({
            sender_id: user.id,
            receiver_id: activeConversation,
            content: messageContent,
            type: 'text'
          });

      if (error) {
          console.error('❌ Failed to send message to database:', error);
          toast.error('Failed to send message. Please try again.', 'Error');
        setNewMessage(messageContent); // Restore message
          // Remove the optimistic message
          setConversations(prev => prev.map(conv => 
            conv.id === activeConversation 
              ? { ...conv, messages: conv.messages.filter(msg => msg.id !== optimisticMessage.id) }
              : conv
          ));
        return;
                } else {
          console.log('✅ Message sent to database successfully');
          
          // Send email notification to admin after successful message send
          sendAdminEmailNotification({
            conversation_id: activeConversation,
            content: messageContent,
            sender_id: user.id,
            created_at: new Date().toISOString()
          });
          
          // The real-time subscription will replace the optimistic message with the real one
        }
    } catch (error) {
        console.error('❌ Failed to send message:', error);
      toast.error('Failed to send message. Please try again.', 'Error');
      setNewMessage(messageContent); // Restore message
        // Remove the optimistic message
        setConversations(prev => prev.map(conv => 
          conv.id === activeConversation 
            ? { ...conv, messages: conv.messages.filter(msg => msg.id !== optimisticMessage.id) }
            : conv
        ));
      return;
    }
    } else {
      // Demo/AI: add message locally for localStorage conversations
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      text: messageContent,
        timestamp: new Date(),
        isOwn: true,
          type: 'text',
        status: 'sent',
        replyTo: replyingTo ? {
          id: replyingTo.id,
          text: replyingTo.text,
          senderName: replyingTo.isOwn ? 'You' : currentProfile?.firstName || 'User'
        } : undefined
          };
          
    addMessageToConversation(activeConversation, userMessage);

      // Simulate AI response for demo (after a short delay)
      if (!isValidUUID(user.id)) {
        setTimeout(() => {
          const aiResponses = [
            "Thank you for your message! 😊",
            "That's really interesting!",
            "I'd love to hear more about that.",
            "You seem like such a nice person! 💕",
            "I'm really enjoying our conversation.",
            "Tell me more about yourself!",
            "That sounds wonderful! ✨",
            "I hope we can chat more soon.",
            "You made me smile today! 😊",
            "I feel like we have a great connection!"
          ];
          
          const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
          const aiMessage: Message = {
            id: `ai-${Date.now()}`,
            text: randomResponse,
            timestamp: new Date(),
            isOwn: false,
            type: 'text',
            status: 'delivered'
          };
          
          addMessageToConversation(activeConversation, aiMessage);
        }, 2000 + Math.random() * 3000); // 2-5 second delay
      }
      }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleConversationSwitch = (conversationId: string) => {
    // Clear unread count when switching to a conversation
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId 
        ? { ...conv, unreadCount: 0 }
        : conv
    ));
    
    setActiveConversation(conversationId);
    setShowMoreMenu(false);
  };

  const getCurrentConversation = () => {
    return conversations.find(conv => conv.id === activeConversation);
  };

  const currentConversation = getCurrentConversation();
  const currentProfile = currentConversation?.profile;
  const currentMessages = currentConversation?.messages || [];
  const age = currentProfile?.birthDate ? new Date().getFullYear() - new Date(currentProfile.birthDate).getFullYear() : 0;

  const emojis = ['😊', '😍', '🥰', '😘', '💕', '❤️', '🔥', '😂', '👍', '🙌', '💯', '🎉'];

  const filteredConversations = conversations.filter(conv =>
    conv.profile.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEmojiClick = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      try {
        // Compress image before sending
        const compressedFile = await compressImage(file, 800, 0.7); // Max width 800px, 70% quality
        
        // If real conversation, upload to Supabase storage directly
        if (user && isValidUUID(user.id) && isValidUUID(activeConversation)) {
          const messageId = `img-${Date.now()}`;
          await uploadImageToSupabase(compressedFile, messageId);
          // Don't add to UI here - let the real-time subscription handle it to prevent duplicates
        } else {
          // For demo conversations, add to UI directly
      const imageMessage: Message = {
        id: `img-${Date.now()}`,
            text: '', // Empty text for images - we'll show the image directly
        timestamp: new Date(),
        isOwn: true,
        type: 'image',
            imageUrl: URL.createObjectURL(compressedFile),
            status: 'sent'
      };
      addMessageToConversation(activeConversation, imageMessage);
        }

      } catch (error) {
        console.error('Error processing image:', error);
        toast.error('Failed to send image');
      }
    }
  };

  // Image compression function
  const compressImage = (file: File, maxWidth: number, quality: number): Promise<File> => {
    return new Promise<File>((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = document.createElement('img');

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve(compressedFile);
          } else {
            // Fallback if blob creation fails
            resolve(file);
          }
        }, 'image/jpeg', quality);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  // Upload image to Supabase storage
  const uploadImageToSupabase = async (file: File, messageId: string) => {
    try {
      console.log('🔍 [CHAT] Starting image upload process:', {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        messageId,
        userId: user!.id,
        activeConversation
      });

      const fileName = `${user!.id}/${messageId}-${Date.now()}.jpg`;
      
      const { data, error } = await supabase.storage
        .from('chat-images')
        .upload(fileName, file);

      if (error) {
        console.error('❌ [CHAT] Error uploading image to storage:', error);
        return;
      }

      console.log('✅ [CHAT] Image uploaded to storage successfully:', data);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('chat-images')
        .getPublicUrl(fileName);

      console.log('🔍 [CHAT] Generated public URL:', publicUrl);

      // Prepare message data for database
      const messageData = {
        sender_id: user!.id,
        receiver_id: activeConversation,
        content: '', // Don't send filename - just show the image
        type: 'image',
        image_url: publicUrl
      };

      console.log('🔍 [CHAT] Inserting message into database:', messageData);

      // Update message in database
      const { data: insertData, error: insertError } = await supabase
        .from('messages')
        .insert(messageData);

      if (insertError) {
        console.error('❌ [CHAT] Error inserting message into database:', insertError);
        throw insertError;
      }

      console.log('✅ [CHAT] Message inserted into database successfully:', insertData);
      console.log('✅ [CHAT] Image upload process completed successfully');
    } catch (error) {
      console.error('❌ [CHAT] Error in uploadImageToSupabase:', error);
    }
  };

  const handleVoiceRecord = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      setTimeout(() => {
        setIsRecording(false);
        const voiceMessage: Message = {
          id: `voice-${Date.now()}`,
          text: 'Sent a voice message 🎵',
          timestamp: new Date(),
          isOwn: true,
          type: 'text'
        };
        
        addMessageToConversation(activeConversation, voiceMessage);
      }, 2000);
    }
  };

  const handleVideoCall = async () => {
    if (!user || user.coins < coinPrices.videoCall) {
      window.location.href = '/lcn/pricing';
      return;
    }

    // Deduct coins silently and start call immediately
    const { error } = await updateCoins(-coinPrices.videoCall);
        if (error) {
      toast.error('Unable to connect. Please try again.', 'Connection Error');
          return;
        }

    // Start call modal
    setCurrentCallType('video');
    setShowCallModal(true);
        
        const callMessage: Message = {
          id: `vcall-${Date.now()}`,
      text: `📹 Video call initiated`,
          timestamp: new Date(),
          isOwn: true,
      type: 'text',
      status: 'sending'
        };

        addMessageToConversation(activeConversation, callMessage);
  };

  const handlePhoneCall = async () => {
    if (!user || user.coins < coinPrices.voiceCall) {
      window.location.href = '/lcn/pricing';
      return;
    }

    // Deduct coins silently and start call immediately
    const { error } = await updateCoins(-coinPrices.voiceCall);
        if (error) {
      toast.error('Unable to connect. Please try again.', 'Connection Error');
          return;
        }

    // Start call modal
    setCurrentCallType('voice');
    setShowCallModal(true);
        
        const callMessage: Message = {
          id: `acall-${Date.now()}`,
      text: `📞 Voice call initiated`,
          timestamp: new Date(),
          isOwn: true,
      type: 'text',
      status: 'sending'
        };

        addMessageToConversation(activeConversation, callMessage);
  };

  const handleSendGift = () => {
    if (!user || user.coins < 5) {
      window.location.href = '/lcn/pricing';
      return;
    }

    setShowGiftSelector(true);
  };
    
  const handleGiftSelection = async (gift: RealGift, giftType: 'real', quantity: number = 1) => {
    setShowGiftSelector(false);
    
    const totalCost = gift.cost * quantity;
    if (!user || user.coins < totalCost) {
      window.location.href = '/lcn/pricing';
      return;
    }

    const currentProfile = getCurrentConversation()?.profile;
    
    // Send gift immediately without confirmation
    const { error } = await updateCoins(-totalCost);
        if (error) {
      toast.error('Failed to send gift. Please try again.', 'Error');
          return;
        }

    // Create message content for real gift
    const giftMessageText = quantity > 1 ? `${quantity}x ${gift.name}` : gift.name;

        const giftMessage: Message = {
          id: `gift-${Date.now()}`,
      text: giftMessageText,
          timestamp: new Date(),
          isOwn: true,
      type: 'gift',
      status: 'sending',
      giftData: {
        name: gift.name,
        cost: gift.cost,
        category: gift.category,
        giftType: 'real',
        image: gift.image,
        quantity: quantity
      }
        };

        addMessageToConversation(activeConversation, giftMessage);
        
    let giftSentSuccessfully = true;

    // If real conversation, save to Supabase
    if (user && isValidUUID(user.id) && isValidUUID(activeConversation)) {
      try {
        await saveGiftToSupabase(giftMessage.id, { ...gift, giftType: 'real', quantity });
      } catch (error) {
        giftSentSuccessfully = false;
        console.error('Gift failed to send:', error);
        
        // Remove the failed message from the conversation
        setConversations(prev => prev.map(conv => 
          conv.id === activeConversation 
            ? {
                ...conv,
                messages: conv.messages.filter(msg => msg.id !== giftMessage.id)
              }
            : conv
        ));
        
        return; // Exit early if gift failed to send
      }
    }

    // Only show success if gift was sent successfully
    if (giftSentSuccessfully) {
      // Update status to sent
      setTimeout(() => {
        setConversations(prev => prev.map(conv => 
          conv.id === activeConversation 
            ? {
                ...conv,
                messages: conv.messages.map(msg => 
                  msg.id === giftMessage.id 
                    ? { ...msg, status: 'sent' }
                    : msg
                )
              }
            : conv
        ));
      }, 1000);
        
      setCelebrationGift({
        ...gift,
        giftType: 'real'
      });
        setShowGiftCelebration(true);
        
      // Show success message
      const quantityText = quantity > 1 ? ` (${quantity} items)` : '';
      toast.success(
        `Gift sent! ${gift.name}${quantityText} purchased for ${currentProfile?.firstName}.`, 
        'Gift Sent!'
      );
    }
  };

  const handleWhatsAppContact = async () => {
    if (!user || user.coins < coinPrices.contactInfo) {
      window.location.href = '/lcn/pricing';
      return;
    }
    
    // Deduct coins silently and send request immediately
    const { error } = await updateCoins(-coinPrices.contactInfo);
        if (error) {
      toast.error('Failed to send request. Please try again.', 'Error');
          return;
        }


        
        const contactMessage: Message = {
          id: `whatsapp-${Date.now()}`,
          text: `📱 WhatsApp contact request sent`,
          timestamp: new Date(),
          isOwn: true,
      type: 'text',
      status: 'sending'
        };

        addMessageToConversation(activeConversation, contactMessage);

    // Simulate request processing
    setTimeout(() => {
      // Update message to show sent
      setConversations(prev => prev.map(conv => 
        conv.id === activeConversation 
          ? {
              ...conv,
              messages: conv.messages.map(msg => 
                msg.id === contactMessage.id 
                  ? { ...msg, text: `📱 WhatsApp contact request delivered`, status: 'sent' }
                  : msg
              )
            }
          : conv
      ));



      // Simulate response after some time (30-45 seconds)
      const responseTime = Math.random() * 15000 + 30000; // 30-45 seconds
      
      setTimeout(() => {
        // Update original message
        setConversations(prev => prev.map(conv => 
          conv.id === activeConversation 
            ? {
                ...conv,
                messages: conv.messages.map(msg => 
                  msg.id === contactMessage.id 
                    ? { ...msg, text: `📱 WhatsApp contact request`, status: 'delivered' }
                    : msg
                )
              }
            : conv
        ));

        // Simulate different responses (80% decline, 20% consideration)
        const willApprove = Math.random() > 0.8;
        
        if (willApprove) {
          // Positive but delayed response
          const positiveMessage: Message = {
            id: `system-${Date.now()}`,
            text: `Hi! I received your WhatsApp request. I'm a bit cautious about sharing my contact outside the platform. Let's chat here a bit more first! 😊`,
            timestamp: new Date(),
            isOwn: false,
            type: 'text',
            status: 'delivered'
          };
          
          addMessageToConversation(activeConversation, positiveMessage);
        } else {
          // Polite decline
          const declineMessage: Message = {
            id: `system-${Date.now()}`,
            text: `Thank you for your interest! I prefer to keep our conversations on this platform for now. I hope you understand! 💕`,
            timestamp: new Date(),
            isOwn: false,
            type: 'text',
            status: 'delivered'
          };
          
          addMessageToConversation(activeConversation, declineMessage);
        }

      }, responseTime);
    }, 3000); // 3 seconds delay for processing
  };

  const handleBlockUser = () => {
    confirmDialog.confirm(
      'Block User',
      `Are you sure you want to block ${currentProfile?.firstName}?\n\nThis will prevent them from contacting you and remove this conversation.`,
      () => {
        setConversations(prev => prev.filter(conv => conv.id !== activeConversation));
        setActiveConversation('');
        toast.success(`${currentProfile?.firstName} has been blocked.`, 'User Blocked');
      },
      () => {},
      { type: 'danger', confirmText: 'Block User', cancelText: 'Cancel' }
    );
  };

  const handleReportUser = () => {
    promptDialog.prompt(
      'Report User',
      `Report ${currentProfile?.firstName} for inappropriate behavior?\n\nPlease provide details about the issue:`,
      (reason: string) => {
        if (reason.trim()) {
          toast.success(`Thank you for your report. We will review ${currentProfile?.firstName}'s account.`, 'Report Submitted');
        }
      },
      () => {}
    );
  };

  const handleToggleNotifications = () => {
    setIsNotificationsEnabled(!isNotificationsEnabled);
    setChatSettings(prev => ({ ...prev, notifications: !isNotificationsEnabled }));
  };

  const handleToggleSound = () => {
    setIsSoundEnabled(!isSoundEnabled);
    setChatSettings(prev => ({ ...prev, sounds: !isSoundEnabled }));
  };

  const handleArchiveConversation = () => {
    const conversation = getCurrentConversation();
    if (!conversation) return;

      confirmDialog.confirm(
        'Archive Conversation',
      `Archive conversation with ${conversation.profile.firstName}?\n\nYou can restore it later from archived conversations.`,
        () => {
          const archivedConv: ArchivedConversation = {
          id: conversation.id,
          profile: conversation.profile,
          lastMessage: conversation.lastMessage,
          lastMessageTime: conversation.lastMessageTime,
            archivedAt: new Date(),
          messageCount: conversation.messages.length
          };
          
        setArchivedConversations(prev => [archivedConv, ...prev]);
        setConversations(prev => prev.filter(conv => conv.id !== activeConversation));
        setActiveConversation('');
        toast.success(`Conversation with ${conversation.profile.firstName} archived.`, 'Conversation Archived');
        },
      () => {}
      );
  };

  const handleViewProfile = () => {
    window.open(`/lcn/profile/${currentProfile?.id}`, '_blank');
  };

  const handleChatSettings = () => {
    settingsDialog.openSettings(
      'Chat Settings',
      chatSettings,
      (newSettings) => {
        setChatSettings(newSettings);
        setIsNotificationsEnabled(newSettings.notifications);
        setIsSoundEnabled(newSettings.sounds);
        toast.success('Chat settings updated successfully.', 'Settings Saved');
      }
    );
  };

  const handleArchiveConversations = () => {
    archiveDialog.openArchive(
      'Archived Conversations',
      archivedConversations,
      (conversationId) => {
        const archivedConv = archivedConversations.find(conv => conv.id === conversationId);
        if (archivedConv) {
          const restoredConv: ChatConversation = {
            id: archivedConv.id,
            profile: archivedConv.profile,
            lastMessage: archivedConv.lastMessage,
            lastMessageTime: archivedConv.lastMessageTime,
            unreadCount: 0,
            isOnline: true,
            messages: []
          };
          
          setConversations(prev => [restoredConv, ...prev]);
          setArchivedConversations(prev => prev.filter(conv => conv.id !== conversationId));
          setActiveConversation(conversationId);
          toast.success(`Conversation with ${archivedConv.profile.firstName} restored.`, 'Conversation Restored');
        }
      },
      (conversationId) => {
        const archivedConv = archivedConversations.find(conv => conv.id === conversationId);
        if (archivedConv) {
          confirmDialog.confirm(
            'Delete Conversation',
            `Are you sure you want to permanently delete your conversation with ${archivedConv.profile.firstName}?\n\nThis action cannot be undone and all messages will be lost.`,
            () => {
              setArchivedConversations(prev => prev.filter(conv => conv.id !== conversationId));
              toast.success(`Conversation with ${archivedConv.profile.firstName} has been permanently deleted.`, 'Conversation Deleted');
            },
            () => {},
            { type: 'danger', confirmText: 'Delete Forever', cancelText: 'Cancel' }
          );
        }
      },
      () => {}
    );
  };

  // Close more menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      // Don't close if menu was just opened
      if (menuJustOpenedRef.current) {
        console.log('Menu just opened, ignoring outside click');
        return;
      }
      
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        console.log('Clicking outside more menu, closing...');
        setShowMoreMenu(false);
      }
      if (messageMenuRef.current && !messageMenuRef.current.contains(event.target as Node)) {
        setShowMessageMenu(null);
      }
    };

    if (showMoreMenu || showMessageMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('touchstart', handleClickOutside);
      };
    }
  }, [showMoreMenu, showMessageMenu]);

  // Initialize sample archived conversations
  useEffect(() => {
    if (isOpen && archivedConversations.length === 0) {
      // Add sample archived conversations for demo
      const sampleArchivedConversations: ArchivedConversation[] = [
        {
          id: 'archived-1',
          profile: {
            id: 'archived-1',
            userId: 'archived-1',
            firstName: 'Sofia',
            lastName: 'P.',
            gender: 'female',
            birthDate: '1995-03-15',
            country: 'Bulgaria',
            city: 'Sofia',
            bio: 'Marketing manager who loves travel',
            interests: ['Travel', 'Photography', 'Yoga'],
            profession: 'Marketing Manager',
            languages: ['Bulgarian', 'English'],
            photos: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'],
            verified: true,
            createdAt: '2025-05-15',
            height: 165,
            weight: 55,
            eyeColor: 'brown',
            hairColor: 'brown',
            appearanceType: 'slim',
            alcohol: 'socially',
            smoking: 'never',
            children: 'no',
            religion: 'orthodox',
            zodiacSign: 'pisces',
            englishLevel: 'advanced',
            hasIntroVideo: false,
            isOnline: false,
            hasVideo: false,
            hasCameraOn: false,
            birthdaySoon: false,
            newProfile: false,
            top1000: false,
          },
          lastMessage: 'Thanks for the lovely evening! 😊',
          lastMessageTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          archivedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          messageCount: 47
        }
      ];
      setArchivedConversations(sampleArchivedConversations);
    }
  }, [isOpen, archivedConversations.length]);

  // Demo: Simulate incoming messages for testing notifications (only for localStorage conversations)
  useEffect(() => {
    if (!isOpen || !user?.id || isValidUUID(user.id)) return;
    
    // Only for demo/localStorage users - simulate incoming messages
    const simulateIncomingMessage = () => {
      const inactiveConversations = conversations.filter(conv => 
        conv.id !== activeConversation && conv.messages.length > 0
      );
      
      if (inactiveConversations.length === 0) return;
      
      const randomConv = inactiveConversations[Math.floor(Math.random() * inactiveConversations.length)];
      const incomingMessages = [
        "Hey! How are you doing? 😊",
        "I was thinking about our last conversation...",
        "Would you like to chat sometime? ☕",
        "Hope you're having a great day! 🌟",
        "Just wanted to say hi! 👋",
        "What are your plans for the weekend?",
        "I saw something that reminded me of you 💕",
        "Good morning! ☀️",
        "How was your day today?",
        "I'd love to get to know you better 💫"
      ];
      
      const randomMessage = incomingMessages[Math.floor(Math.random() * incomingMessages.length)];
      
      const incomingMsg: Message = {
        id: `incoming-${Date.now()}`,
        text: randomMessage,
        timestamp: new Date(),
        isOwn: false,
        type: 'text',
        status: 'delivered'
      };
      
      console.log('🔔 [DEMO] Simulating incoming message from:', randomConv.profile.firstName);
      addMessageToConversation(randomConv.id, incomingMsg);
      
      // Play notification sound if enabled
      if (isSoundEnabled) {
        const audio = new Audio('/notification.mp3');
        audio.play().catch(e => console.log('Sound play failed:', e));
      }
      
              // Show browser notification if enabled and page is not focused
        if (isNotificationsEnabled && document.hidden) {
          new Notification(`New message from ${randomConv.profile.firstName}`, {
            body: randomMessage.substring(0, 50) + (randomMessage.length > 50 ? '...' : ''),
                            icon: randomConv.profile.photos?.[0] || undefined
          });
        }
    };
    
    // Simulate incoming messages every 30-60 seconds for demo
    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance every interval
        simulateIncomingMessage();
      }
    }, 45000); // Every 45 seconds
    
    return () => clearInterval(interval);
  }, [isOpen, user?.id, conversations, activeConversation, isSoundEnabled, isNotificationsEnabled]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatLastMessageTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    return 'now';
  };

  // Enhanced messaging functions
  const handleReplyToMessage = (message: Message) => {
    setReplyingTo(message);
    setShowMessageMenu(null);
  };

  const handleEditMessage = (message: Message) => {
    if (message.isOwn) {
      setEditingMessage(message);
      setNewMessage(message.text);
      setShowMessageMenu(null);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      // Remove from local state
      setConversations(prev => prev.map(conv => 
        conv.id === activeConversation 
          ? { ...conv, messages: conv.messages.filter(msg => msg.id !== messageId) }
          : conv
      ));
      
      // If using Supabase, delete from database
      if (user && isValidUUID(user.id)) {
        await supabase.from('messages').delete().eq('id', messageId);
      }
      
      setShowMessageMenu(null);
      toast.success('Message deleted');
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    }
  };

  const handleForwardMessage = (message: Message) => {
    // For now, just copy the message text
    navigator.clipboard.writeText(message.text);
    toast.success('Message copied to clipboard');
    setShowMessageMenu(null);
  };

  const handleCopyMessage = (message: Message) => {
    navigator.clipboard.writeText(message.text);
    toast.success('Message copied to clipboard');
    setShowMessageMenu(null);
  };

  const handleAddReaction = (messageId: string, emoji: string) => {
    const userName = user?.firstName || 'You';
    
    setConversations(prev => prev.map(conv => 
      conv.id === activeConversation 
        ? {
            ...conv,
            messages: conv.messages.map(msg => 
              msg.id === messageId 
                ? {
                    ...msg,
                    reactions: msg.reactions 
                      ? msg.reactions.map(reaction => 
                          reaction.emoji === emoji 
                            ? { ...reaction, users: [...reaction.users, userName] }
                            : reaction
                        ).concat(
                          msg.reactions.find(r => r.emoji === emoji) 
                            ? [] 
                            : [{ emoji, users: [userName] }]
                        )
                      : [{ emoji, users: [userName] }]
                  }
                : msg
            )
          }
        : conv
    ));
    
    setShowMessageMenu(null);
  };

  const handleVoiceRecordNew = async () => {
    if (!voiceRecording.isRecording) {
      try {
        // Request microphone permission
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 44100
          }
        });
        
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'audio/webm;codecs=opus'
        });
        const audioChunks: Blob[] = [];
        let recordingTimer: NodeJS.Timeout;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunks.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          // Clear the timer
          clearInterval(recordingTimer);
          
          // Create audio blob
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          const audioUrl = URL.createObjectURL(audioBlob);
          
          // Get final duration
          const finalDuration = voiceRecording.duration;
          
          // Create voice message
          const voiceMessage: Message = {
            id: `voice-${Date.now()}`,
            text: '', // Empty text for voice messages
            timestamp: new Date(),
            isOwn: true,
            type: 'voice',
            voiceUrl: audioUrl,
            duration: finalDuration,
            status: 'sending'
          };

          addMessageToConversation(activeConversation, voiceMessage);

          // If real conversation, upload to Supabase storage
          if (user && isValidUUID(user.id) && isValidUUID(activeConversation)) {
            await uploadVoiceToSupabase(audioBlob, voiceMessage.id, finalDuration);
          }

          // Update status to sent
          setTimeout(() => {
            setConversations(prev => prev.map(conv => 
              conv.id === activeConversation 
                ? {
                    ...conv,
                    messages: conv.messages.map(msg => 
                      msg.id === voiceMessage.id 
                        ? { ...msg, status: 'sent' }
                        : msg
                    )
                  }
                : conv
            ));
          }, 1000);
          
          // Stop all tracks and cleanup
          stream.getTracks().forEach(track => track.stop());
          
          // Reset recording state
          setVoiceRecording({
            isRecording: false,
            duration: 0,
            mediaRecorder: null
          });
        };

        mediaRecorder.onerror = (event) => {
          console.error('MediaRecorder error:', event);
          toast.error('Recording failed. Please try again.');
          clearInterval(recordingTimer);
          stream.getTracks().forEach(track => track.stop());
          setVoiceRecording({
            isRecording: false,
            duration: 0,
            mediaRecorder: null
          });
        };

        // Start recording
        mediaRecorder.start(100); // Collect data every 100ms
        voiceRecorderRef.current = mediaRecorder;
        
        // Set initial recording state
        setVoiceRecording({
          isRecording: true,
          duration: 0,
          mediaRecorder
        });

        // Start duration timer
        recordingTimer = setInterval(() => {
          setVoiceRecording(prev => ({
            ...prev,
            duration: prev.duration + 1
          }));
        }, 1000);

        // Auto-stop after 5 minutes (300 seconds)
        setTimeout(() => {
          if (voiceRecorderRef.current?.state === 'recording') {
            voiceRecorderRef.current.stop();
          }
        }, 300000);

      } catch (error) {
        console.error('Error accessing microphone:', error);
        if (error instanceof Error) {
          if (error.name === 'NotAllowedError') {
            toast.error('Microphone access denied. Please allow microphone access and try again.');
          } else if (error.name === 'NotFoundError') {
            toast.error('No microphone found. Please connect a microphone and try again.');
          } else {
            toast.error('Could not access microphone. Please check your browser settings.');
          }
        } else {
          toast.error('Could not access microphone');
        }
      }
    } else {
      // Stop recording
      if (voiceRecorderRef.current && voiceRecorderRef.current.state === 'recording') {
        voiceRecorderRef.current.stop();
      }
    }
  };

  // Upload voice message to Supabase storage
  const uploadVoiceToSupabase = async (audioBlob: Blob, messageId: string, duration: number) => {
    try {
      const fileName = `${user!.id}/${messageId}-${Date.now()}.webm`;
      
      const { data, error } = await supabase.storage
        .from('chat-voice')
        .upload(fileName, audioBlob);

      if (error) {
        console.error('Error uploading voice:', error);
        return;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('chat-voice')
        .getPublicUrl(fileName);

      // Update message in database
      await supabase
        .from('messages')
        .insert({
          sender_id: user!.id,
          receiver_id: activeConversation,
          content: '', // Empty content for voice messages
          type: 'voice',
          voice_url: publicUrl,
          duration: duration
        });

      console.log('Voice message uploaded successfully:', publicUrl);
    } catch (error) {
      console.error('Error uploading voice to Supabase:', error);
    }
  };

  // Save gift message to Supabase
  const saveGiftToSupabase = async (messageId: string, gift: any) => {
    try {
      console.log('🎁 Saving gift to Supabase:', {
        messageId,
        sender_id: user!.id,
        receiver_id: activeConversation,
        content: gift.quantity > 1 
          ? `${gift.quantity}x ${gift.name}` 
          : gift.name,
        type: 'gift',
        gift_name: gift.name,
        gift_cost: gift.cost,
        senderIdValid: isValidUUID(user!.id),
        receiverIdValid: isValidUUID(activeConversation)
      });

      // Update message in database
      const insertData: any = {
        sender_id: user!.id,
        receiver_id: activeConversation,
        content: gift.quantity > 1 
          ? `${gift.quantity}x ${gift.name}` 
          : gift.name,
        type: 'gift'
      };

      // Add gift-specific fields (only save fields that exist in the database)
      if (gift.name) insertData.gift_name = gift.name;
      if (gift.cost) insertData.gift_cost = gift.cost;

      const { data, error } = await supabase
        .from('messages')
        .insert(insertData);

      if (error) {
        console.error('❌ Supabase error saving gift:', error);
        console.error('❌ Error details:', JSON.stringify(error, null, 2));
        console.error('❌ Insert data was:', JSON.stringify(insertData, null, 2));
        throw error;
      }

      console.log('✅ Gift message saved successfully:', data);
    } catch (error) {
      console.error('❌ Error saving gift to Supabase:', error);
      
      // Show user-friendly error message
      toast.error('Failed to send gift. Please try again.', 'Error');
      
      // Refund the user's coins since the gift failed to send
      if (user) {
        await updateCoins(gift.cost);
      }
    }
  };

  const handlePlayVoice = (messageId: string, voiceUrl: string) => {
    if (playingVoice === messageId) {
      // Pause current audio
      if (audioRef.current) {
        audioRef.current.pause();
        setPlayingVoice(null);
      }
    } else {
      // Play new audio
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      const audio = new Audio(voiceUrl);
      audioRef.current = audio;
      
      audio.onended = () => {
        setPlayingVoice(null);
      };
      
      audio.play();
      setPlayingVoice(messageId);
    }
  };



  const formatVoiceDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getMessageStatusIcon = (status?: string) => {
    switch (status) {
      case 'sending':
        return <Clock className="w-3 h-3 text-gray-400" />;
      case 'sent':
        return <Check className="w-3 h-3 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-gray-400" />;
      case 'read':
        return <CheckCheck className="w-3 h-3 text-blue-500" />;
      default:
        return null;
    }
  };

  const searchMessages = (query: string) => {
    if (!query.trim()) return [];
    
    const currentConv = conversations.find(conv => conv.id === activeConversation);
    if (!currentConv) return [];
    
    return currentConv.messages.filter(msg => 
      msg.text.toLowerCase().includes(query.toLowerCase())
    );
  };

  // Save draft when message changes
  useEffect(() => {
    if (newMessage && activeConversation) {
      setMessageDrafts(prev => ({
        ...prev,
        [activeConversation]: newMessage
      }));
    }
  }, [newMessage, activeConversation]);

  // Load draft when conversation changes
  useEffect(() => {
    if (activeConversation && messageDrafts[activeConversation] && !editingMessage) {
      setNewMessage(messageDrafts[activeConversation]);
    }
  }, [activeConversation, messageDrafts, editingMessage]);

  // Handle call end
  const handleCallEnd = () => {
    setShowCallModal(false);
    
    // Update conversation with call result
    const callType = currentCallType === 'video' ? '📹 Video' : '📞 Voice';
    const coins = currentCallType === 'video' ? coinPrices.videoCall : coinPrices.voiceCall;
    
          // Find the most recent call message and update it
      setConversations(prev => prev.map(conv => 
        conv.id === activeConversation 
          ? {
              ...conv,
              messages: conv.messages.map((msg, index, arr) => {
                // Find the last call message
                if (index === arr.length - 1 && msg.text.includes('call initiated')) {
                  return { 
                    ...msg, 
                    text: `${callType} call - No answer`, 
                    status: 'delivered' as const
                  };
                }
                return msg;
              })
            }
          : conv
      ));

    // Add system message about the missed call
    setTimeout(() => {
      const systemMessage: Message = {
        id: `system-${Date.now()}`,
        text: `${currentProfile?.firstName} ${currentCallType === 'video' ? 'missed your video call' : 'is not available right now'}. ${currentCallType === 'voice' ? 'Your call went to voicemail.' : 'You can try again later or send a message instead.'}`,
        timestamp: new Date(),
        isOwn: false,
        type: 'text',
        status: 'delivered'
      };
      
      addMessageToConversation(activeConversation, systemMessage);
    }, 1000);

    toast.warning(`${currentProfile?.firstName} ${currentCallType === 'video' ? "is currently unavailable. Your call couldn't be completed." : "didn't answer your call. Try sending a message instead."}`, 'Call Not Answered');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-none sm:rounded-2xl shadow-2xl w-full h-full sm:max-w-6xl sm:h-[700px] flex animate-scale-in overflow-hidden">
        {/* Mobile: Show sidebar only if no active conversation on small screens */}
        {/* Desktop: Always show sidebar */}
        <div className={`${
          activeConversation ? 'hidden md:flex' : 'flex'
        } w-full md:w-80 border-r border-slate-200 flex-col bg-gradient-to-b from-slate-50 to-white sm:rounded-l-2xl h-full`}>
          {/* Sidebar Header - Fixed */}
          <div className="flex-shrink-0 p-3 border-b border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-medium text-slate-800">Messages</h2>
              <div className="flex gap-1">
                {/* Close button on mobile */}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 hover:bg-slate-100 md:hidden touch-manipulation"
                  onClick={onClose}
                  title="Close"
                >
                  <X className="h-4 w-4 text-slate-600" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 hover:bg-slate-100 touch-manipulation"
                  onClick={handleChatSettings}
                  title="Settings"
                >
                  <Settings className="h-4 w-4 text-slate-600" />
                </Button>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-50 border-slate-200 focus:border-rose-400 focus:ring-rose-400 text-sm h-9 rounded-lg"
              />
            </div>
          </div>

          {/* Conversations List - Scrollable */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
            </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-6 text-center">
                <MessageCircle className="mx-auto h-8 w-8 text-gray-400 mb-3" />
                <p className="text-sm text-gray-500">No conversations found</p>
                <p className="text-xs text-gray-400 mt-1">Start chatting to see your conversations here</p>
              </div>
            ) : (
              <>
                {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => handleConversationSwitch(conversation.id)}
                    className={`p-3 cursor-pointer transition-all duration-200 hover:bg-slate-50 ${
                      activeConversation === conversation.id ? 'bg-rose-50 border-l-2 border-l-rose-500' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      {conversation.profile.photos && conversation.profile.photos.length > 0 && conversation.profile.photos[0] ? (
                        <img
                          src={conversation.profile.photos[0]}
                          alt={conversation.profile.firstName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}
                      {conversation.isOnline && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border border-white rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-medium text-slate-900 truncate">
                          {conversation.profile.firstName}
                        </h3>
                            {conversation.profile.verified && (
                              <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs">✓</span>
                            </div>
                          )}
                        </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400">
                              {conversation.lastMessage ? formatLastMessageTime(conversation.lastMessageTime) : 'now'}
                          </span>
                          {conversation.unreadCount > 0 && (
                              <div className="bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                                {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                            </div>
                          )}
                        </div>
                      </div>
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {conversation.lastMessage || 'No messages yet'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              </>
            )}
          </div>
        </div>

        {/* Right Side - Chat Window */}
        <div className={`${
          !activeConversation ? 'hidden md:flex' : 'flex'
        } flex-1 flex-col`}>
          {currentProfile && (
            <>
              {/* Header */}
              <div className="border-b border-slate-200 bg-gradient-to-r from-rose-50 to-pink-50">
                {/* Top row - Basic info and main actions */}
                <div className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Back button on mobile */}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                      className="h-9 w-9 p-0 hover:bg-white/60 md:hidden touch-manipulation flex-shrink-0"
                    onClick={() => setActiveConversation('')}
                    title="Back to conversations"
                  >
                      <ChevronLeft className="h-5 w-5 text-slate-600" />
                  </Button>
                    <div className="relative flex-shrink-0">
                      {currentProfile.photos && currentProfile.photos.length > 0 && currentProfile.photos[0] ? (
                        <img 
                          src={currentProfile.photos[0]} 
                          alt={currentProfile.firstName}
                          className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center border-2 border-white shadow-sm">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}
                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-slate-800 truncate">{currentProfile.firstName}, {age}</h3>
                      <p className="text-xs text-slate-600 truncate">{currentProfile.city}, {currentProfile.country}</p>
                  </div>
                </div>
                  
                  {/* Mobile Actions - Prioritized for touch */}
                  <div className="flex items-center gap-1 flex-shrink-0 md:hidden">
                    {/* Coins Tracker - Mobile only */}
                    <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-100 to-yellow-100 border border-amber-200 rounded-full px-2 py-1 shadow-sm">
                      <Coins className="w-3 h-3 text-amber-600" />
                      <span className="text-xs font-semibold text-amber-800">
                        {user?.coins || 0}
                      </span>
                    </div>
                    
                    {/* Phone call - Primary action on mobile */}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                      className="h-10 w-10 p-0 hover:bg-white/60 touch-manipulation"
                      onClick={handlePhoneCall}
                      title="Voice call"
                    >
                      <Phone className="h-5 w-5 text-slate-600" />
                    </Button>
                    
                    {/* Video call - Primary action on mobile */}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-10 w-10 p-0 hover:bg-white/60 touch-manipulation"
                      onClick={handleVideoCall}
                      title="Video call"
                    >
                      <Video className="h-5 w-5 text-slate-600" />
                    </Button>
                    
                    {/* More menu - Mobile */}
                    <div className="relative" ref={moreMenuRef}>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-10 w-10 p-0 hover:bg-white/60 touch-manipulation"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('Mobile more menu clicked, current state:', showMoreMenu);
                          if (!showMoreMenu) {
                            menuJustOpenedRef.current = true;
                            setShowMoreMenu(true);
                            // Reset the flag after a short delay
                            setTimeout(() => {
                              menuJustOpenedRef.current = false;
                            }, 200);
                          } else {
                            setShowMoreMenu(false);
                          }
                        }}
                        title="More options"
                      >
                        <MoreVertical className="h-5 w-5 text-slate-600" />
                      </Button>
                    </div>
                  </div>

                  {/* Desktop Actions - Full feature set */}
                  <div className="hidden md:flex items-center gap-1 flex-shrink-0">
                    {/* Coins Tracker - Desktop */}
                    <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-100 to-yellow-100 border border-amber-200 rounded-full px-2 py-1 shadow-sm">
                      <Coins className="w-3 h-3 text-amber-600" />
                      <span className="text-xs font-semibold text-amber-800">
                        {user?.coins || 0}
                      </span>
                    </div>
                    
                    {/* Gift button - Desktop */}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-9 w-9 p-0 hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 relative group transition-all duration-300 touch-manipulation" 
                      onClick={handleSendGift}
                      title="Send a special gift ✨"
                    >
                      {/* Sparkle effects */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute top-0 left-1 w-1 h-1 bg-yellow-400 rounded-full animate-ping"></div>
                        <div className="absolute bottom-1 right-0 w-1 h-1 bg-pink-400 rounded-full animate-ping delay-150"></div>
                      </div>
                      <Gift className="h-4 w-4 text-purple-600 group-hover:text-pink-600 transition-colors duration-300 animate-pulse" />
                  </Button>
                    
                    {/* WhatsApp button - Desktop */}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                      className="h-9 w-9 p-0 hover:bg-green-100 hover:text-green-600 touch-manipulation" 
                    onClick={handleWhatsAppContact}
                    title="Request Contact"
                  >
                      <MessageCircle className="h-4 w-4 text-green-600" />
                  </Button>
                    
                    {/* Message Search Button */}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-9 w-9 p-0 hover:bg-white/60 touch-manipulation" 
                      onClick={() => setShowMessageSearch(!showMessageSearch)}
                      title="Search messages"
                    >
                      <Search className="h-4 w-4 text-slate-600" />
                  </Button>
                    
                    <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-white/60 touch-manipulation" onClick={handlePhoneCall}>
                      <Phone className="h-4 w-4 text-slate-600" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-white/60 touch-manipulation" onClick={handleVideoCall}>
                      <Video className="h-4 w-4 text-slate-600" />
                    </Button>
                      
                    {/* More menu - Desktop */}
                  <div className="relative" ref={moreMenuRef}>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                        className="h-9 w-9 p-0 hover:bg-white/60 touch-manipulation"
                      onClick={() => setShowMoreMenu(!showMoreMenu)}
                    >
                      <MoreVertical className="h-4 w-4 text-slate-600" />
                    </Button>
                    </div>
                    
                    {/* Close button on desktop */}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-9 w-9 p-0 hover:bg-white/60 touch-manipulation"
                      onClick={onClose}
                      title="Close"
                    >
                      <X className="h-4 w-4 text-slate-600" />
                    </Button>
                  </div>
                </div>
                
                {/* More Menu Dropdown - Responsive positioning */}
                    {showMoreMenu && (
                  <div className="absolute top-16 right-3 md:right-4 z-[60] bg-white rounded-lg shadow-xl border border-slate-200 py-2 min-w-48 max-w-xs animate-in slide-in-from-top-2 duration-200">
                    {/* Mobile-specific options */}
                    <div className="md:hidden">
                        <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('Mobile Search Messages clicked');
                          setShowMoreMenu(false);
                          setShowMessageSearch(!showMessageSearch);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-slate-50 active:bg-slate-100 flex items-center gap-3 touch-manipulation transition-colors"
                        >
                        <Search className="h-5 w-5 text-slate-600" />
                        <span className="text-sm font-medium">Search Messages</span>
                        </button>
                      <hr className="my-2 border-slate-200" />
                    </div>
                    
                    {/* Common options for both mobile and desktop */}
                        <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('View Profile clicked');
                        setShowMoreMenu(false);
                        handleViewProfile();
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-slate-50 active:bg-slate-100 flex items-center gap-3 touch-manipulation transition-colors"
                        >
                      <User className="h-5 w-5 text-slate-600" />
                      <span className="text-sm font-medium">View Profile</span>
                        </button>
                        <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Chat Settings clicked');
                        setShowMoreMenu(false);
                        handleChatSettings();
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-slate-50 active:bg-slate-100 flex items-center gap-3 touch-manipulation transition-colors"
                        >
                      <Settings className="h-5 w-5 text-slate-600" />
                      <span className="text-sm font-medium">Chat Settings</span>
                        </button>
                    <hr className="my-2 border-slate-200" />
                        <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Block User clicked');
                        setShowMoreMenu(false);
                        handleBlockUser();
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-red-50 active:bg-red-100 flex items-center gap-3 text-red-600 touch-manipulation transition-colors"
                    >
                      <UserX className="h-5 w-5" />
                      <span className="text-sm font-medium">Block User</span>
                        </button>
                        <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Report User clicked');
                        setShowMoreMenu(false);
                        handleReportUser();
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-red-50 active:bg-red-100 flex items-center gap-3 text-red-600 touch-manipulation transition-colors"
                        >
                      <Flag className="h-5 w-5" />
                      <span className="text-sm font-medium">Report User</span>
                        </button>
                      </div>
                    )}

              </div>

              {/* Message Search Bar */}
              {showMessageSearch && (
                <div className="border-b border-slate-200 p-3 bg-white">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search messages..."
                      value={messageSearchQuery}
                      onChange={(e) => setMessageSearchQuery(e.target.value)}
                      className="pl-10 bg-slate-50 border-slate-300 focus:border-rose-400 focus:ring-rose-400 text-sm"
                    />
                  </div>
                  {messageSearchQuery && (
                    <div className="mt-2 text-xs text-slate-500">
                      {searchMessages(messageSearchQuery).length} message(s) found
                    </div>
                  )}
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-50/30 to-white">
                {currentMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'} group`}
                  >
                    <div className={`max-w-[85%] md:max-w-[80%] ${message.isOwn ? 'order-2' : 'order-2'} relative`}>
                      {/* Reply indicator */}
                      {message.replyTo && (
                        <div className={`mb-2 px-3 py-2 rounded-lg bg-slate-100 border-l-4 border-rose-400 text-sm ${
                          message.isOwn ? 'ml-auto' : 'mr-auto'
                        }`}>
                          <div className="flex items-center gap-2 mb-1">
                            <Reply className="w-3 h-3 text-slate-500" />
                            <span className="text-xs font-medium text-slate-600">{message.replyTo.senderName}</span>
                          </div>
                          <p className="text-xs text-slate-500 truncate">{message.replyTo.text}</p>
                        </div>
                      )}
                      
                      {/* Forwarded indicator */}
                      {message.isForwarded && (
                        <div className={`mb-1 flex items-center gap-1 text-xs text-slate-500 ${
                          message.isOwn ? 'justify-end' : 'justify-start'
                        }`}>
                          <Forward className="w-3 h-3" />
                          <span>Forwarded</span>
                        </div>
                      )}

                      <div
                        className={`px-4 py-3 rounded-2xl shadow-sm relative ${
                          message.type === 'gift'
                            ? message.isOwn
                              ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white rounded-br-md border-2 border-yellow-300 shadow-lg'
                              : 'bg-gradient-to-r from-pink-50 to-rose-50 text-slate-800 rounded-bl-md border-2 border-rose-200 shadow-lg'
                            : message.isOwn
                            ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-br-md'
                            : 'bg-white text-slate-800 rounded-bl-md border border-slate-200'
                        }`}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          setShowMessageMenu(showMessageMenu === message.id ? null : message.id);
                        }}
                      >
                        {/* Message content based on type */}
                        {message.type === 'image' && message.imageUrl ? (
                          <div className="space-y-2">
                            <img 
                              src={message.imageUrl} 
                              alt="Shared image" 
                              className="rounded-lg max-w-48 h-auto cursor-pointer hover:opacity-90 transition-opacity"
                              style={{ maxHeight: '200px', objectFit: 'cover' }}
                              onClick={() => window.open(message.imageUrl, '_blank')}
                              loading="lazy"
                            />
                            {message.text && <p className="text-sm">{message.text}</p>}
                          </div>
                        ) : message.type === 'voice' && message.voiceUrl ? (
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handlePlayVoice(message.id, message.voiceUrl!)}
                              className="flex-shrink-0 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                            >
                              {playingVoice === message.id ? (
                                <Pause className="w-4 h-4" />
                              ) : (
                                <Play className="w-4 h-4" />
                              )}
                            </button>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-1 bg-white/20 rounded-full">
                                  <div className="h-full bg-white rounded-full" style={{width: '60%'}}></div>
                                </div>
                                <span className="text-xs opacity-75">
                                  {formatVoiceDuration(message.duration || 0)}
                                </span>
                              </div>
                            </div>
                            <Mic className="w-4 h-4 opacity-75" />
                          </div>

                        ) : message.type === 'gift' ? (
                          <div className="space-y-2">
                            {message.giftData?.giftType === 'real' && message.giftData.image ? (
                              // Real gift with product image
                              <div className="space-y-3">
                                <img 
                                  src={message.giftData.image} 
                                  alt={message.giftData.name}
                                  className="w-40 h-32 object-cover rounded-lg mx-auto"
                                />
                                <div className="text-center">
                                  <p className="text-sm font-medium">
                                    {message.isOwn ? 'Gift Sent!' : 'Gift Received!'}
                                  </p>
                                  <p className="text-xs opacity-90 mt-1">
                                    {message.giftData.quantity && message.giftData.quantity > 1 
                                      ? `${message.giftData.quantity}x ${message.giftData.name}`
                                      : message.giftData.name
                                    }
                                  </p>
                                </div>
                              </div>
                            ) : (
                              // Old gift messages without rich data - show simple emoji
                          <div className="text-center space-y-1">
                                <div className="text-2xl animate-bounce">
                                  🎁
                                </div>
                            <p className="text-sm font-medium">
                              {message.isOwn ? 'Gift Sent!' : 'Gift Received!'}
                            </p>
                            <p className="text-xs opacity-90">
                                  {message.giftData?.name || message.text.replace(/^[^\s]+\s/, '')}
                            </p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div>
                          <p className="text-base leading-relaxed break-words">{message.text}</p>
                            {message.isEdited && (
                              <span className="text-xs opacity-60 italic">edited</span>
                        )}
                      </div>
                        )}

                        {/* Message status and time */}
                        <div className={`flex items-center gap-1 mt-1 ${
                          message.isOwn ? 'justify-end' : 'justify-start'
                        }`}>
                          <span className="text-xs opacity-60">
                        {formatTime(message.timestamp)}
                          </span>
                          {message.isOwn && getMessageStatusIcon(message.status)}
                    </div>
                      </div>

                      {/* Reactions */}
                      {message.reactions && message.reactions.length > 0 && (
                        <div className={`flex flex-wrap gap-1 mt-1 ${
                          message.isOwn ? 'justify-end' : 'justify-start'
                        }`}>
                          {message.reactions.map((reaction, index) => (
                            <button
                              key={index}
                              className="bg-white border border-slate-200 rounded-full px-2 py-1 text-xs flex items-center gap-1 hover:bg-slate-50 transition-colors"
                              onClick={() => handleAddReaction(message.id, reaction.emoji)}
                            >
                              <span>{reaction.emoji}</span>
                              <span className="text-slate-600">{reaction.users.length}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Message context menu */}
                      {showMessageMenu === message.id && (
                        <div 
                          ref={messageMenuRef}
                          className={`absolute z-50 bg-white rounded-lg shadow-lg border border-slate-200 py-2 min-w-48 ${
                            message.isOwn ? 'right-0' : 'left-0'
                          }`}
                          style={{
                            top: '100%',
                            marginTop: '4px'
                          }}
                        >
                          <button
                            onClick={() => handleReplyToMessage(message)}
                            className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-3 text-sm"
                          >
                            <Reply className="w-4 h-4 text-slate-600" />
                            Reply
                          </button>
                          <button
                            onClick={() => handleCopyMessage(message)}
                            className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-3 text-sm"
                          >
                            <Copy className="w-4 h-4 text-slate-600" />
                            Copy
                          </button>
                          <button
                            onClick={() => handleForwardMessage(message)}
                            className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-3 text-sm"
                          >
                            <Forward className="w-4 h-4 text-slate-600" />
                            Forward
                          </button>
                          {message.isOwn && (
                            <>
                              <button
                                onClick={() => handleEditMessage(message)}
                                className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-3 text-sm"
                              >
                                <Edit3 className="w-4 h-4 text-slate-600" />
                                Edit
                              </button>
                              <hr className="my-1 border-slate-200" />
                              <button
                                onClick={() => handleDeleteMessage(message.id)}
                                className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center gap-3 text-sm text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            </>
                          )}
                          <hr className="my-1 border-slate-200" />
                          <div className="px-4 py-2">
                            <p className="text-xs text-slate-500 mb-2">Quick reactions:</p>
                            <div className="flex gap-2">
                              {['❤️', '😂', '👍', '😮', '😢', '🔥'].map((emoji) => (
                                <button
                                  key={emoji}
                                  onClick={() => handleAddReaction(message.id, emoji)}
                                  className="text-lg hover:bg-slate-100 rounded p-1 transition-colors"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {!message.isOwn && (
                      <div className="order-1 mr-3">
                        <img 
                          src={currentProfile.photos[0]} 
                          alt={currentProfile.firstName}
                          className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
                        />
                      </div>
                    )}
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-3">
                      <img 
                        src={currentProfile.photos[0]} 
                        alt={currentProfile.firstName}
                        className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
                      />
                      <div className="bg-white text-slate-800 rounded-2xl rounded-bl-md border border-slate-200 px-3 py-2 sm:px-4 sm:py-2 shadow-sm">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Emoji Picker */}
              {showEmojiPicker && (
                <div className="border-t border-slate-200 p-4 bg-white">
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

              {/* Reply Bar */}
              {replyingTo && (
                <div className="border-t border-slate-200 p-3 bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Reply className="w-4 h-4 text-slate-500" />
                        <span className="text-sm font-medium text-slate-700">
                          Replying to {replyingTo.isOwn ? 'yourself' : currentProfile.firstName}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 truncate">{replyingTo.text}</p>
                    </div>
                    <button
                      onClick={() => setReplyingTo(null)}
                      className="p-1 hover:bg-slate-200 rounded-full transition-colors"
                    >
                      <X className="w-4 h-4 text-slate-500" />
                    </button>
                  </div>
                </div>
              )}

              {/* Voice Recording Bar */}
              {voiceRecording.isRecording && (
                <div className="border-t border-slate-200 p-3 bg-red-50">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-red-700">Recording...</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-red-600">
                        {formatVoiceDuration(voiceRecording.duration)}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleVoiceRecordNew}
                        className="px-3 py-1 bg-red-500 text-white rounded-full text-sm hover:bg-red-600 transition-colors"
                      >
                        Stop
                      </button>
                      <button
                        onClick={() => {
                          if (voiceRecorderRef.current) {
                            voiceRecorderRef.current.stop();
                            setVoiceRecording({
                              isRecording: false,
                              duration: 0,
                              mediaRecorder: null
                            });
                          }
                        }}
                        className="px-3 py-1 bg-slate-500 text-white rounded-full text-sm hover:bg-slate-600 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="p-4 border-t border-slate-200 bg-white sm:rounded-br-2xl">
                {!user || user.coins < 1 ? (
                  // Insufficient balance state - redirect silently
                  <div className="bg-gradient-to-r from-rose-50 to-pink-50 border-2 border-rose-200 rounded-xl p-4 text-center">
                    <div className="text-rose-600 mb-2">
                      <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <h3 className="font-medium text-rose-800 mb-2">Upgrade Your Account</h3>
                    <p className="text-base text-rose-600 mb-4">
                      Unlock unlimited messaging and premium features with our membership plans.
                    </p>
                    <button 
                      onClick={() => window.location.href = '/lcn/pricing'}
                      className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-6 py-3 rounded-lg text-base font-medium hover:from-rose-600 hover:to-pink-600 transition-all duration-200 touch-manipulation"
                    >
                      View Plans
                    </button>
                  </div>
                ) : (
                  // Enhanced chat input
                  <div className="space-y-3">
                    {/* Attachment options */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                        className="h-8 px-3 hover:bg-slate-100 active:bg-slate-200 touch-manipulation flex-shrink-0"
                      onClick={handleFileUpload}
                    >
                        <Image className="h-4 w-4 mr-1" />
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
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 px-3 hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 active:bg-purple-200 touch-manipulation flex-shrink-0 relative group"
                        onClick={handleSendGift}
                      >
                        <Gift className="h-4 w-4 mr-1 text-purple-600 group-hover:text-pink-600 transition-colors" />
                        <span className="text-xs">Gift</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 px-3 hover:bg-green-100 active:bg-green-200 touch-manipulation flex-shrink-0"
                        onClick={handleWhatsAppContact}
                      >
                        <MessageCircle className="h-4 w-4 mr-1 text-green-600" />
                        <span className="text-xs">Contact</span>
                      </Button>
                    </div>

                    {/* Main input row */}
                    <div className="flex items-end gap-2">
                    <div className="flex-1 relative">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              if (editingMessage) {
                                // Handle message editing
                                setConversations(prev => prev.map(conv => 
                                  conv.id === activeConversation 
                                    ? {
                                        ...conv,
                                        messages: conv.messages.map(msg => 
                                          msg.id === editingMessage.id 
                                            ? { ...msg, text: newMessage, isEdited: true, editedAt: new Date() }
                                            : msg
                                        )
                                      }
                                    : conv
                                ));
                                setEditingMessage(null);
                                setNewMessage('');
                              } else {
                                handleSendMessage();
                              }
                            }
                          }}
                          placeholder={
                            editingMessage 
                              ? 'Edit message...' 
                              : replyingTo 
                                ? `Reply to ${replyingTo.isOwn ? 'yourself' : currentProfile.firstName}...`
                                : `Message ${currentProfile.firstName}...`
                          }
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
                      {!newMessage.trim() && !editingMessage && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                          className={`h-12 w-12 p-0 touch-manipulation transition-colors ${
                            voiceRecording.isRecording 
                              ? 'bg-red-100 hover:bg-red-200 text-red-600' 
                              : 'hover:bg-slate-100 active:bg-slate-200 text-slate-600'
                          }`}
                          onClick={handleVoiceRecordNew}
                          title={voiceRecording.isRecording ? 'Stop recording' : 'Start voice recording'}
                        >
                          {voiceRecording.isRecording ? (
                            <div className="flex items-center justify-center">
                              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                            </div>
                          ) : (
                            <Mic className="h-5 w-5" />
                          )}
                    </Button>
                      )}

                      {/* Send/Edit button */}
                      {(newMessage.trim() || editingMessage) && (
                    <Button 
                          onClick={() => {
                            if (editingMessage) {
                              // Handle message editing
                              setConversations(prev => prev.map(conv => 
                                conv.id === activeConversation 
                                  ? {
                                      ...conv,
                                      messages: conv.messages.map(msg => 
                                        msg.id === editingMessage.id 
                                          ? { ...msg, text: newMessage, isEdited: true, editedAt: new Date() }
                                          : msg
                                      )
                                    }
                                  : conv
                              ));
                              setEditingMessage(null);
                              setNewMessage('');
                            } else {
                              handleSendMessage();
                            }
                          }}
                          className="h-12 w-12 p-0 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 touch-manipulation"
                    >
                          {editingMessage ? (
                            <Check className="h-4 w-4" />
                          ) : (
                      <Send className="h-4 w-4" />
                          )}
                    </Button>
                      )}

                      {/* Cancel edit button */}
                      {editingMessage && (
                        <Button 
                          variant="ghost"
                          size="sm" 
                          className="h-12 w-12 p-0 hover:bg-slate-100 active:bg-slate-200 touch-manipulation"
                          onClick={() => {
                            setEditingMessage(null);
                            setNewMessage('');
                          }}
                        >
                          <X className="h-4 w-4 text-slate-600" />
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

             {/* Notification Containers */}
       <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
       <ConfirmationDialogContainer dialogs={confirmDialog.dialogs} onClose={confirmDialog.closeDialog} />
       <PromptDialogContainer dialogs={promptDialog.dialogs} onClose={promptDialog.closeDialog} />
       <SettingsDialogContainer dialogs={settingsDialog.dialogs} onClose={settingsDialog.closeDialog} />
       <ArchiveDialogContainer dialogs={archiveDialog.dialogs} onClose={archiveDialog.closeDialog} />
       
       {/* Gift Selector */}
       <GiftSelector
         isOpen={showGiftSelector}
         onClose={() => setShowGiftSelector(false)}
         onSelectGift={handleGiftSelection}
         userCoins={user?.coins || 0}
         recipientName={getCurrentConversation()?.profile.firstName || 'someone'}
       />

       {/* Gift Celebration */}
       <GiftCelebration
         isVisible={showGiftCelebration}
         gift={celebrationGift}
         recipientName={getCurrentConversation()?.profile.firstName || 'someone'}
         onComplete={() => {
           setShowGiftCelebration(false);
           setCelebrationGift(null);
         }}
       />

       {/* Call Modal */}
       {currentProfile && (
         <CallModal
           isOpen={showCallModal}
           isVideoCall={currentCallType === 'video'}
           profile={currentProfile}
           userName={user?.firstName || 'You'}
           onEndCall={handleCallEnd}
         />
       )}
    </div>
  );
} 