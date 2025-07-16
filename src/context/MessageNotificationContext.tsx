import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useChat } from './ChatContext';
import { supabase } from '@/lib/supabase';
import { MessageNotification } from '@/components/ui/message-notification';
import { Profile } from '@/types';

interface MessageNotificationData {
  id: string;
  senderName: string;
  senderPhoto?: string;
  message: string;
  senderId: string;
  timestamp: string;
}

interface UnreadConversation {
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  unreadCount: number;
  lastMessage: string;
  lastMessageTime: string;
}

interface MessageNotificationContextType {
  notifications: MessageNotificationData[];
  unreadConversations: UnreadConversation[];
  totalUnreadCount: number;
  addNotification: (notification: MessageNotificationData) => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  markConversationAsRead: (senderId: string) => void;
  isInActiveChat: (senderId: string) => boolean;
  setActiveChat: (senderId: string | null) => void;
}

const MessageNotificationContext = createContext<MessageNotificationContextType | undefined>(undefined);

interface MessageNotificationProviderProps {
  children: React.ReactNode;
}

export function MessageNotificationProvider({ children }: MessageNotificationProviderProps) {
  const { user } = useAuth();
  const { openChat } = useChat();
  const [notifications, setNotifications] = useState<MessageNotificationData[]>([]);
  const [unreadConversations, setUnreadConversations] = useState<UnreadConversation[]>([]);
  const [activeChatSenderId, setActiveChatSenderId] = useState<string | null>(null);

  // Calculate total unread count from all conversations
  const totalUnreadCount = unreadConversations.reduce((total, conv) => total + conv.unreadCount, 0);

  // Check if user is currently in an active chat with a specific sender
  const isInActiveChat = useCallback((senderId: string) => {
    return activeChatSenderId === senderId;
  }, [activeChatSenderId]);

  // Mark a conversation as read
  const markConversationAsRead = useCallback((senderId: string) => {
    setUnreadConversations(prev => prev.filter(conv => conv.senderId !== senderId));
    setNotifications(prev => prev.filter(n => n.senderId !== senderId));
  }, []);

  // Set the currently active chat
  const setActiveChat = useCallback((senderId: string | null) => {
    setActiveChatSenderId(senderId);
    // Mark conversation as read when user opens it
    if (senderId) {
      markConversationAsRead(senderId);
    }
  }, [markConversationAsRead]);

  // Add a new notification
  const addNotification = useCallback((notification: MessageNotificationData) => {
    // Don't show notification if user is in active chat with this sender
    if (isInActiveChat(notification.senderId)) {
      return;
    }

    // Update unread conversations
    setUnreadConversations(prev => {
      const existingIndex = prev.findIndex(conv => conv.senderId === notification.senderId);
      
      if (existingIndex >= 0) {
        // Update existing conversation
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          unreadCount: updated[existingIndex].unreadCount + 1,
          lastMessage: notification.message,
          lastMessageTime: notification.timestamp
        };
        return updated;
      } else {
        // Add new conversation
        const newConversation: UnreadConversation = {
          senderId: notification.senderId,
          senderName: notification.senderName,
          senderPhoto: notification.senderPhoto,
          unreadCount: 1,
          lastMessage: notification.message,
          lastMessageTime: notification.timestamp
        };
        return [...prev, newConversation];
      }
    });

    // Limit to 3 notifications max for UI display
    setNotifications(prev => {
      const filtered = prev.filter(n => n.id !== notification.id);
      const newNotifications = [notification, ...filtered].slice(0, 3);
      return newNotifications;
    });
  }, [isInActiveChat]);

  // Remove a specific notification
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Helper function to open chat from notification
  const openChatFromNotification = useCallback(async (senderId: string) => {
    try {
      console.log('🔔 [NOTIFICATION] Opening chat for sender:', senderId);
      
      // Check if this is a test profile first
      const testProfiles = (window as any).testProfiles;
      if (testProfiles && testProfiles[senderId]) {
        console.log('🔔 [NOTIFICATION] Using test profile');
        openChat(testProfiles[senderId]);
        return;
      }
      
      // Fetch sender profile to open ChatWindow
      const { data: senderProfile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', senderId)
        .single();

      if (error) {
        console.error('Error fetching sender profile:', error);
        // Fallback to navigation
        window.location.href = `/browse?openChat=${senderId}`;
        return;
      }

      if (senderProfile) {
        // Convert database profile to frontend Profile type
        const profile: Profile = {
          id: senderProfile.id,
          userId: senderProfile.id,
          firstName: senderProfile.first_name,
          lastName: senderProfile.last_name,
          gender: senderProfile.gender,
          birthDate: senderProfile.birth_date,
          country: senderProfile.country,
          city: senderProfile.city,
          bio: senderProfile.bio,
          interests: senderProfile.interests || [],
          profession: senderProfile.profession,
          languages: senderProfile.languages || [],
          photos: senderProfile.photos || [],
          verified: senderProfile.verified || false,
          createdAt: senderProfile.created_at,
          height: senderProfile.height,
          weight: senderProfile.weight,
          eyeColor: senderProfile.eye_color,
          hairColor: senderProfile.hair_color,
          appearanceType: senderProfile.appearance_type,
          alcohol: senderProfile.alcohol,
          smoking: senderProfile.smoking,
          children: senderProfile.children,
          religion: senderProfile.religion,
          zodiacSign: senderProfile.zodiac_sign,
          englishLevel: senderProfile.english_level,
          hasIntroVideo: senderProfile.has_intro_video || false,
          isOnline: senderProfile.is_online || false,
          hasVideo: senderProfile.has_video || false,
          hasCameraOn: senderProfile.has_camera_on || false,
          birthdaySoon: false,
          newProfile: false,
          top1000: false,
        };

        console.log('🔔 [NOTIFICATION] Opening ChatWindow with profile:', profile.firstName);
        // Open ChatWindow with the profile
        openChat(profile);
      }
    } catch (error) {
      console.error('Error opening chat from notification:', error);
      // Fallback to navigation
              window.location.href = `/browse?openChat=${senderId}`;
    }
  }, [openChat]);

  // Real-time message subscription
  useEffect(() => {
    if (!user?.id) return;

    console.log('🔔 [MESSAGE-NOTIFICATIONS] Setting up real-time message notifications for user:', user.id);

    // Check if we're online before setting up subscriptions
    if (!navigator.onLine) {
      console.log('📴 [MESSAGE-NOTIFICATIONS] Device is offline, skipping real-time setup');
      return;
    }

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('🔔 [MESSAGE-NOTIFICATIONS] Notification permission:', permission);
      });
    }

    let messageSubscription: any = null;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 3;
    let reconnectTimer: NodeJS.Timeout | null = null;

    const setupSubscription = () => {
      try {
        // Subscribe to new messages with enhanced error handling
        messageSubscription = supabase
          .channel(`message_notifications_${user.id}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'messages',
              filter: `receiver_id=eq.${user.id}`
            },
            async (payload) => {
              console.log('🔔 [MESSAGE-NOTIFICATIONS] New message received:', payload);
              
              const newMessage = payload.new as any;
              
              // Don't show notification for our own messages
              if (newMessage.sender_id === user.id) {
                return;
              }

              // Don't show notification if user is in active chat with this sender
              if (isInActiveChat(newMessage.sender_id)) {
                console.log('🔔 [MESSAGE-NOTIFICATIONS] User is in active chat, skipping notification');
                return;
              }

              try {
                // Fetch sender profile information with timeout
                const profilePromise = supabase
                  .from('profiles')
                  .select('id, first_name, last_name, photos')
                  .eq('id', newMessage.sender_id)
                  .single();

                const timeoutPromise = new Promise((_, reject) => 
                  setTimeout(() => reject(new Error('Profile fetch timeout')), 3000)
                );

                const { data: senderProfile, error } = await Promise.race([
                  profilePromise, 
                  timeoutPromise
                ]) as any;

                if (error) {
                  console.warn('🔔 [MESSAGE-NOTIFICATIONS] Error fetching sender profile:', error);
                  // Still show notification with generic name
                  const notification: MessageNotificationData = {
                    id: newMessage.id,
                    senderName: 'Someone',
                    message: newMessage.content,
                    senderId: newMessage.sender_id,
                    timestamp: newMessage.created_at
                  };
                  addNotification(notification);
                  return;
                }

                const senderName = senderProfile 
                  ? `${senderProfile.first_name} ${senderProfile.last_name}`.trim() 
                  : 'Someone';
                
                const senderPhoto = senderProfile?.photos?.[0];

                // Create notification
                const notification: MessageNotificationData = {
                  id: newMessage.id,
                  senderName,
                  senderPhoto,
                  message: newMessage.content,
                  senderId: newMessage.sender_id,
                  timestamp: newMessage.created_at
                };

                console.log('🔔 [MESSAGE-NOTIFICATIONS] Adding notification:', notification);
                addNotification(notification);

              } catch (error) {
                console.error('🔔 [MESSAGE-NOTIFICATIONS] Error processing notification:', error);
                // Fallback: show basic notification
                const basicNotification: MessageNotificationData = {
                  id: newMessage.id,
                  senderName: 'Someone',
                  message: newMessage.content,
                  senderId: newMessage.sender_id,
                  timestamp: newMessage.created_at
                };
                addNotification(basicNotification);
              }
            }
          )
          .subscribe((status) => {
            console.log('🔔 [MESSAGE-NOTIFICATIONS] Subscription status:', status);
            
            if (status === 'SUBSCRIBED') {
              console.log('✅ [MESSAGE-NOTIFICATIONS] Successfully subscribed to real-time messages');
              reconnectAttempts = 0; // Reset on successful connection
            } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
              console.warn('⚠️ [MESSAGE-NOTIFICATIONS] Subscription error, attempting to reconnect...');
              
              if (reconnectAttempts < maxReconnectAttempts && navigator.onLine) {
                reconnectAttempts++;
                const delay = Math.min(1000 * Math.pow(2, reconnectAttempts - 1), 10000); // Exponential backoff, max 10s
                
                console.log(`🔄 [MESSAGE-NOTIFICATIONS] Reconnect attempt ${reconnectAttempts}/${maxReconnectAttempts} in ${delay}ms`);
                
                reconnectTimer = setTimeout(() => {
                  if (messageSubscription) {
                    supabase.removeChannel(messageSubscription);
                  }
                  setupSubscription();
                }, delay);
              } else {
                console.error('❌ [MESSAGE-NOTIFICATIONS] Max reconnection attempts reached or offline');
              }
            } else if (status === 'CLOSED') {
              console.log('🔌 [MESSAGE-NOTIFICATIONS] Subscription closed');
            }
          });
      } catch (error) {
        console.error('❌ [MESSAGE-NOTIFICATIONS] Error setting up subscription:', error);
      }
    };

    // Initial setup
    setupSubscription();

    // Handle online/offline events
    const handleOnline = () => {
      console.log('🌐 [MESSAGE-NOTIFICATIONS] Back online, reconnecting...');
      reconnectAttempts = 0;
      if (messageSubscription) {
        supabase.removeChannel(messageSubscription);
      }
      setupSubscription();
    };

    const handleOffline = () => {
      console.log('📴 [MESSAGE-NOTIFICATIONS] Gone offline, pausing real-time notifications');
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup function
    return () => {
      console.log('🔔 [MESSAGE-NOTIFICATIONS] Cleaning up message notification subscription');
      
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
      
      if (messageSubscription) {
        supabase.removeChannel(messageSubscription);
      }
      
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user?.id, addNotification, isInActiveChat]);

  // Auto-clear old notifications
  useEffect(() => {
    const interval = setInterval(() => {
      const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
      setNotifications(prev => 
        prev.filter(notification => 
          new Date(notification.timestamp).getTime() > fiveMinutesAgo
        )
      );
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const value: MessageNotificationContextType = {
    notifications,
    unreadConversations,
    totalUnreadCount,
    addNotification,
    removeNotification,
    clearAllNotifications,
    markConversationAsRead,
    isInActiveChat,
    setActiveChat
  };

  return (
    <MessageNotificationContext.Provider value={value}>
      {children}
      
      {/* Render notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification, index) => (
          <div 
            key={notification.id} 
            style={{ 
              transform: `translateY(${index * 10}px)`,
              zIndex: 50 - index 
            }}
          >
            <MessageNotification
              senderName={notification.senderName}
              senderPhoto={notification.senderPhoto}
              message={notification.message}
              duration={8000}
              onClose={() => removeNotification(notification.id)}
              onReply={() => openChatFromNotification(notification.senderId)}
              onViewConversation={() => openChatFromNotification(notification.senderId)}
            />
          </div>
        ))}
      </div>
    </MessageNotificationContext.Provider>
  );
}

export function useMessageNotifications() {
  const context = useContext(MessageNotificationContext);
  if (context === undefined) {
    throw new Error('useMessageNotifications must be used within a MessageNotificationProvider');
  }
  return context;
} 