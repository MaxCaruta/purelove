import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ChatConversation, ChatMessage, UserChatSummary } from '@/types';
import { AdminService } from '@/lib/admin';
import { AdminConversationUtils } from '@/lib/adminUtils';
import { supabase } from '@/lib/supabase';
import { loadGifts, getGiftCategories, type Gift as DatabaseGift, type RealGift } from '@/lib/utils';
import { X, Send, Search, Settings, Archive, MoreVertical, User, Phone, Video, MessageCircle, Flag, ChevronLeft, RefreshCw, Gift, Image, Smile, Mic, Plus, Edit2, Trash2, Eye, EyeOff, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const AdminPage = () => {
  const { user, isAdmin } = useAuth();
  
  // Tab system state
  const [activeTab, setActiveTab] = useState<'conversations' | 'gifts'>('conversations');
  
  // Existing conversation state
  const [userChats, setUserChats] = useState<UserChatSummary[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [isConversationModalOpen, setIsConversationModalOpen] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [sendingResponse, setSendingResponse] = useState(false);
  const [debugResults, setDebugResults] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  
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
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
      // Load gifts data if gifts tab is active
      if (activeTab === 'gifts') {
        loadGiftsData();
      }
    }
  }, [isAdmin, activeTab]);

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
      
      // Log each user and their conversations in detail
      chats.forEach((chat, index) => {
        console.log(`🔄 User ${index + 1}:`, {
          name: `${chat.user.firstName} ${chat.user.lastName}`,
          userId: chat.user.id.substring(0, 8),
          email: chat.user.email,
          conversationCount: chat.conversations.length
        });
      
        // Log each conversation separately for better visibility
        chat.conversations.forEach((conv, convIndex) => {
          console.log(`  💬 Conversation ${convIndex + 1}:`, {
            profileName: conv.profileName,
            profileId: conv.profileId.substring(0, 8),
            lastMessage: conv.lastMessage,
            lastMessageAt: conv.lastMessageAt,
            status: conv.status,
            unreadCount: conv.unreadCount
          });
        });
        
        if (chat.conversations.length === 0) {
          console.log(`  📭 No conversations found for ${chat.user.firstName}`);
        }
      });
      
      // Debug: Log all unread counts
      console.log('🔍 [DEBUG] All unread counts after load:');
      chats.forEach(chat => {
        chat.conversations.forEach(conv => {
          if (conv.unreadCount > 0) {
            console.log(`🔍 [DEBUG] ${chat.user.firstName} ↔ ${conv.profileName}: ${conv.unreadCount} unread`);
          }
        });
      });
      
      setUserChats(chats);
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
    } catch (error) {
      console.error('Failed to update conversation status:', error);
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
        // Subscribe to new messages for live chat monitoring
        messageSubscription = supabase
          .channel(`admin_messages_${user.id}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'messages'
            },
            (payload) => {
              console.log('🔔 [ADMIN] New message received:', payload);
              const newMessage = payload.new as any;
              
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
              if (selectedConversation) {
                console.log('🔔 [ADMIN] Checking if message belongs to selected conversation...');
                console.log('🔔 [ADMIN] Selected conversation:', {
                  userId: selectedConversation.userId,
                  profileId: selectedConversation.profileId
                });
                
                const isSelectedConversation = 
                  (selectedConversation.userId === newMessage.sender_id && selectedConversation.profileId === newMessage.receiver_id) ||
                  (selectedConversation.userId === newMessage.receiver_id && selectedConversation.profileId === newMessage.sender_id);
                
                if (isSelectedConversation) {
                  console.log('🔔 [ADMIN] Adding message to selected conversation');
                  
                  const newChatMessage: ChatMessage = {
                    id: newMessage.id,
                    conversationId: selectedConversation.id,
                    content: newMessage.content,
                    role: newMessage.sender_id === selectedConversation.userId ? 'user' : 'assistant',
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
        conversationSubscription = supabase
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
      if (messageSubscription) supabase.removeChannel(messageSubscription);
      if (conversationSubscription) supabase.removeChannel(conversationSubscription);
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
      if (messageSubscription) supabase.removeChannel(messageSubscription);
      if (conversationSubscription) supabase.removeChannel(conversationSubscription);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isAdmin, user, selectedConversation]);

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

  // Close more menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setShowMoreMenu(false);
      }
    };

    if (showMoreMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMoreMenu]);

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
    } catch (error) {
      console.error('Error adding gift:', error);
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
    } catch (error) {
      console.error('Error updating gift:', error);
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
    } catch (error) {
      console.error('Error deleting gift:', error);
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
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="mt-1 md:mt-2 text-sm md:text-base text-gray-600">
                Manage conversations and monitor user activity
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={refreshData}
                className="px-3 md:px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg hover:from-rose-600 hover:to-pink-600 transition-colors text-sm flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Refresh Data</span>
                <span className="sm:hidden">Refresh</span>
              </button>
              

        </div>
      </div>


        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1 mb-6 md:mb-8">
          <div className="flex">
            <button
              onClick={() => setActiveTab('conversations')}
              className={`flex-1 px-4 py-3 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'conversations'
                  ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              <span>Conversations</span>
            </button>
            <button
              onClick={() => setActiveTab('gifts')}
              className={`flex-1 px-4 py-3 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'gifts'
                  ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Gift Management</span>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 mb-6 md:mb-8">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-gray-400" />
              <input
                type="text"
                placeholder={activeTab === 'conversations' ? "Search users, conversations, or messages..." : "Search gifts by name or description..."}
                value={activeTab === 'conversations' ? searchQuery : giftSearchQuery}
                onChange={(e) => activeTab === 'conversations' ? setSearchQuery(e.target.value) : setGiftSearchQuery(e.target.value)}
                className="w-full pl-9 md:pl-10 pr-4 py-2.5 md:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm md:text-base"
              />
                </div>
                              </div>
                          </div>

        {/* Main Content - Conditional based on active tab */}
        {activeTab === 'conversations' ? (
          <div className="flex flex-col md:flex-row h-[700px] md:h-[700px] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
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
                      className={`p-3 md:p-4 cursor-pointer transition-all duration-200 border-b border-gray-100 hover:bg-slate-50 ${
                        selectedConversation?.id === `${userChat.user.id}-${conv.profileId}` ? 'bg-rose-50 border-l-4 border-l-rose-500' : ''
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
                                              <div className="flex items-center space-x-2 md:space-x-3">
                        {/* User Avatar */}
                        <div className="relative">
                          {userChat.user.photo ? (
                            <img 
                              src={userChat.user.photo} 
                              alt={`${userChat.user.firstName} ${userChat.user.lastName}`}
                              className="h-7 w-7 md:h-8 md:w-8 rounded-full object-cover border border-blue-200"
                            />
                            ) : (
                            <div className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center border border-blue-200">
                              <span className="text-xs font-semibold text-white">
                                {userChat.user.firstName[0]}{userChat.user.lastName[0]}
                              </span>
                              </div>
                            )}
                          <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 md:w-2.5 md:h-2.5 bg-blue-500 border border-white rounded-full" title="Real User"></div>
                          </div>

                        {/* Profile Avatar */}
                        <div className="relative">
                          {conv.profilePhoto ? (
                            <img 
                              src={conv.profilePhoto} 
                              alt={conv.profileName}
                              className="h-7 w-7 md:h-8 md:w-8 rounded-full object-cover border border-green-200"
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
                          <div className={`h-7 w-7 md:h-8 md:w-8 rounded-full bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center border border-green-200 ${conv.profilePhoto ? 'hidden' : 'flex'}`}>
                            <span className="text-xs font-semibold text-white">
                              {conv.profileName[0]}
                            </span>
                          </div>
                                                     <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 md:w-2.5 md:h-2.5 bg-green-500 border border-white rounded-full" title="Model"></div>
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
                                <div className="bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
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
          <div className={`flex-1 ${selectedConversation ? 'flex' : 'hidden md:flex'} flex-col`}>
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="border-b border-gray-200 bg-gradient-to-r from-slate-50 to-white">
                  <div className="flex items-center justify-between p-4">
                    {/* Mobile Back Button */}
                    <button 
                      className="md:hidden h-9 w-9 p-0 hover:bg-white/60 rounded-lg flex items-center justify-center transition-colors mr-2"
                      onClick={() => setSelectedConversation(null)}
                    >
                      <ChevronLeft className="h-5 w-5 text-slate-600" />
                    </button>
                    <div className="flex items-center gap-3">
                      {/* User Avatar */}
                      <div className="relative">
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

                      {/* Profile Avatar */}
                      <div className="relative">
                        {selectedConversation.profile.photo ? (
                          <img 
                            src={selectedConversation.profile.photo} 
                            alt={`${selectedConversation.profile.firstName} ${selectedConversation.profile.lastName}`}
                            className="h-10 w-10 rounded-full object-cover border-2 border-green-200"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center border-2 border-green-200">
                            <span className="text-sm font-semibold text-white">
                              {selectedConversation.profile.firstName[0]}
                          </span>
                        </div>
                        )}
                                                 <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" title="Model"></div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold text-slate-800 truncate">
                          {selectedConversation.user.firstName} ↔ {selectedConversation.profile.firstName}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Real User
                          </span>
                          <span className="text-xs text-slate-500">•</span>
                                                     <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                             Model
                           </span>
                          <span className="text-xs text-slate-500">•</span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            selectedConversation.status === 'active' ? 'bg-green-100 text-green-800' :
                            selectedConversation.status === 'archived' ? 'bg-gray-100 text-gray-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {selectedConversation.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <div className="relative" ref={moreMenuRef}>
                        <button 
                          className="h-9 w-9 p-0 hover:bg-white/60 rounded-lg flex items-center justify-center transition-colors"
                          onClick={() => setShowMoreMenu(!showMoreMenu)}
                        >
                          <MoreVertical className="h-4 w-4 text-slate-600" />
                        </button>
                        
                        {showMoreMenu && (
                          <div className="absolute top-12 right-0 z-50 bg-white rounded-lg shadow-lg border border-slate-200 py-2 min-w-48">
                            <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</div>
                            <div className="flex gap-1 px-4 py-2">
                              {['active', 'archived', 'flagged'].map((status) => (
                                <button
                                  key={status}
                                  onClick={() => updateConversationStatus(selectedConversation.id, status as any)}
                                  className={`px-2 py-1 rounded text-xs transition-colors ${
                                    selectedConversation.status === status
                                      ? 'bg-rose-500 text-white'
                                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                  }`}
                                >
                                  {status.charAt(0).toUpperCase() + status.slice(1)}
                                </button>
                              ))}
                      </div>
                            <hr className="my-1 border-slate-200" />
                            <button className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center gap-3 text-red-600 text-sm">
                              <Flag className="h-4 w-4" />
                              Report Conversation
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    </div>
                  </div>

                  {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-50/30 to-white">
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

                {/* Message Input */}
                <div className="border-t border-slate-200 p-4 bg-white">
                  <div className="space-y-3">
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
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 px-3 hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 active:bg-purple-200 touch-manipulation flex-shrink-0 relative group"
                        onClick={() => {/* TODO: Add gift functionality */}}
                      >
                        <Gift className="h-4 w-4 mr-1 text-purple-600 group-hover:text-pink-600 transition-colors" />
                        <span className="text-xs">Gift</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 px-3 hover:bg-green-100 active:bg-green-200 touch-manipulation flex-shrink-0"
                        onClick={() => {/* TODO: Add contact functionality */}}
                      >
                        <MessageCircle className="h-4 w-4 mr-1 text-green-600" />
                        <span className="text-xs">Contact</span>
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

        {/* ChatWindow-Style Conversation Modal */}
        {isConversationModalOpen && selectedConversation && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-0 sm:p-4">
            <div className="bg-white rounded-none sm:rounded-2xl shadow-2xl w-full h-full sm:max-w-4xl sm:h-[700px] flex animate-scale-in overflow-hidden">
              
              {/* Chat Header */}
              <div className="flex-1 flex flex-col">
                <div className="border-b border-slate-200 bg-gradient-to-r from-rose-50 to-pink-50">
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                  <button
                        className="h-9 w-9 p-0 hover:bg-white/60 rounded-lg flex items-center justify-center transition-colors sm:hidden"
                        onClick={() => setIsConversationModalOpen(false)}
                  >
                        <ChevronLeft className="h-5 w-5 text-slate-600" />
                  </button>
                  
                      <div className="relative flex-shrink-0">
                        {selectedConversation.profile.photo ? (
                          <img 
                            src={selectedConversation.profile.photo} 
                            alt={`${selectedConversation.profile.firstName} ${selectedConversation.profile.lastName}`}
                            className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-sm"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center border-2 border-white shadow-sm">
                            <span className="text-sm font-semibold text-white">
                              {selectedConversation.profile.firstName[0]}
                            </span>
                          </div>
                        )}
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" title="AI Model"></div>
            </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold text-slate-800 truncate">
                          {selectedConversation.user.firstName} ↔ {selectedConversation.profile.firstName}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Real User
                          </span>
                          <span className="text-xs text-slate-500">•</span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            AI Model
                          </span>
                          <span className="text-xs text-slate-500">•</span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            selectedConversation.status === 'active' ? 'bg-green-100 text-green-800' :
                            selectedConversation.status === 'archived' ? 'bg-gray-100 text-gray-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {selectedConversation.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button className="h-9 w-9 p-0 hover:bg-white/60 rounded-lg flex items-center justify-center transition-colors">
                        <Phone className="h-4 w-4 text-slate-600" />
                      </button>
                      <button className="h-9 w-9 p-0 hover:bg-white/60 rounded-lg flex items-center justify-center transition-colors">
                        <Video className="h-4 w-4 text-slate-600" />
                      </button>
                      
                      <div className="relative" ref={moreMenuRef}>
                  <button
                          className="h-9 w-9 p-0 hover:bg-white/60 rounded-lg flex items-center justify-center transition-colors"
                          onClick={() => setShowMoreMenu(!showMoreMenu)}
                  >
                          <MoreVertical className="h-4 w-4 text-slate-600" />
                  </button>
                  
                        {showMoreMenu && (
                          <div className="absolute top-12 right-0 z-50 bg-white rounded-lg shadow-lg border border-slate-200 py-2 min-w-48">
                            <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</div>
                            <div className="flex gap-1 px-4 py-2">
                              {['active', 'archived', 'flagged'].map((status) => (
                  <button
                                  key={status}
                                  onClick={() => updateConversationStatus(selectedConversation.id, status as any)}
                                  className={`px-2 py-1 rounded text-xs transition-colors ${
                                    selectedConversation.status === status
                                      ? 'bg-rose-500 text-white'
                                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                  }`}
                                >
                                  {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                              ))}
                            </div>
                            <hr className="my-1 border-slate-200" />
                            <button className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center gap-3 text-red-600 text-sm">
                              <Flag className="h-4 w-4" />
                              Report Conversation
                            </button>
                          </div>
                        )}
                      </div>
                  
                  <button
                        className="h-9 w-9 p-0 hover:bg-white/60 rounded-lg flex items-center justify-center transition-colors hidden sm:block"
                        onClick={() => setIsConversationModalOpen(false)}
                  >
                        <X className="h-4 w-4 text-slate-600" />
                  </button>
                    </div>
                  </div>
                </div>
                
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-50/30 to-white">
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
                                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-bl-md border-2 border-yellow-300 shadow-lg'
                                  : 'bg-gradient-to-r from-pink-50 to-rose-50 text-slate-800 rounded-br-md border-2 border-rose-200 shadow-lg'
                                : message.role === 'user'
                                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-bl-md'
                                  : 'bg-white text-slate-800 rounded-br-md border border-slate-200'
                            }`}
                          >
                            {message.type === 'gift' ? (
                              <div className="text-center space-y-1">
                                <div className="text-2xl animate-bounce">{parseGiftContent(message.content).emoji}</div>
                                <p className="text-sm font-medium">
                                  {message.role === 'user' ? 'Gift Sent!' : 'Gift Received!'}
                                </p>
                                <p className="text-xs opacity-90">
                                  {parseGiftContent(message.content).name}
                      </p>
                    </div>
                            ) : message.type === 'image' && message.imageUrl ? (
                              <div className="space-y-2">
                                <img 
                                  src={message.imageUrl} 
                                  alt="Shared image" 
                                  className="rounded-lg max-w-48 h-auto cursor-pointer hover:opacity-90 transition-opacity"
                                  style={{ maxHeight: '200px', objectFit: 'cover' }}
                                  onClick={() => window.open(message.imageUrl, '_blank')}
                                  loading="lazy"
                                />
                                {message.content && <p className="text-sm">{message.content}</p>}
                  </div>
                            ) : (
                              <p className="text-sm leading-relaxed break-words">{message.content}</p>
                            )}
                </div>
                          <p className={`text-xs text-slate-500 mt-2 px-1 ${message.role === 'user' ? 'text-left' : 'text-right'}`}>
                            {formatTime(new Date(message.timestamp))}
                      </p>
              </div>
                        {message.role === 'user' && (
                          <div className="order-1 mr-2">
                            {selectedConversation.user.photo ? (
                              <img 
                                src={selectedConversation.user.photo} 
                                alt={selectedConversation.user.firstName}
                                className="w-6 h-6 rounded-full object-cover border border-blue-200 shadow-sm"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center border border-blue-200 shadow-sm">
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
                                className="w-6 h-6 rounded-full object-cover border border-slate-200 shadow-sm"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center border border-slate-200 shadow-sm">
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

                {/* Message Input */}
                <div className="border-t border-slate-200 p-4 bg-white">
                  <div className="space-y-3">
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
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 px-3 hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 active:bg-purple-200 touch-manipulation flex-shrink-0 relative group"
                        onClick={() => {/* TODO: Add gift functionality */}}
                      >
                        <Gift className="h-4 w-4 mr-1 text-purple-600 group-hover:text-pink-600 transition-colors" />
                        <span className="text-xs">Gift</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 px-3 hover:bg-green-100 active:bg-green-200 touch-manipulation flex-shrink-0"
                        onClick={() => {/* TODO: Add contact functionality */}}
                      >
                        <MessageCircle className="h-4 w-4 mr-1 text-green-600" />
                        <span className="text-xs">Contact</span>
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
              </div>
            </div>
          </div>
        )}

        {/* Gift Management Interface */}
        {activeTab === 'gifts' ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Gift Management Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Gift Management</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Manage {filteredGifts.length} gifts across {giftCategories.length - 1} categories
                  </p>
                </div>
                <button
                  onClick={() => setShowAddGiftModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Gift
                </button>
              </div>
            </div>

            {/* Category Filter */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex flex-wrap gap-2">
                {giftCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedGiftCategory(category)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      selectedGiftCategory === category
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category === 'all' ? 'All Categories' : category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </button>
                ))}
              </div>
            </div>

            {/* Gifts Grid */}
            <div className="p-6">
              {filteredGifts.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No gifts found</h3>
                  <p className="text-gray-600">No gifts match your current filters.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                              <span className="font-bold text-emerald-600">{gift.price} coins</span>
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
                            onClick={() => handleToggleGiftStatus(gift)}
                            className={`flex-1 px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-1 ${
                              gift.is_active
                                ? 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                                : 'bg-green-50 text-green-600 hover:bg-green-100'
                            }`}
                          >
                            {gift.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            {gift.is_active ? 'Hide' : 'Show'}
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
        ) : (
          // Add/Edit Gift Modal
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
                    <select
                      value={giftFormData.category}
                      onChange={(e) => setGiftFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                      {giftCategories.filter(cat => cat !== 'all').map((category) => (
                        <option key={category} value={category}>
                          {category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </option>
                      ))}
                    </select>
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
      </div>
    </div>
  );
};

export default AdminPage; 