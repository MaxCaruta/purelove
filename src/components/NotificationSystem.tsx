import { useState, useEffect, useCallback, useRef } from 'react';
import { DatingNotification } from './ui/dating-notification';

interface NotificationProfile {
  id: string;
  firstName: string;
  age: number;
  city: string;
  country: string;
  photo: string;
  verified: boolean;
}

interface Notification {
  id: string;
  profile: NotificationProfile;
  message: string;
  timestamp: number;
}

// Mock data for notification profiles
const notificationProfiles: NotificationProfile[] = [
  {
    id: 'n1',
    firstName: 'Elena',
    age: 24,
    city: 'Kyiv',
    country: 'Ukraine',
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=776&q=80',
    verified: true,
  },
  {
    id: 'n2',
    firstName: 'Anastasia',
    age: 26,
    city: 'Moscow',
    country: 'Russia',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=776&q=80',
    verified: true,
  },
  {
    id: 'n3',
    firstName: 'Sofia',
    age: 22,
    city: 'Minsk',
    country: 'Belarus',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80',
    verified: false,
  },
  {
    id: 'n4',
    firstName: 'Katarina',
    age: 28,
    city: 'Prague',
    country: 'Czech Republic',
    photo: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80',
    verified: true,
  },
  {
    id: 'n5',
    firstName: 'Alina',
    age: 25,
    city: 'Warsaw',
    country: 'Poland',
    photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80',
    verified: true,
  },
  {
    id: 'n6',
    firstName: 'Arina',
    age: 23,
    city: 'Almaty',
    country: 'Kazakhstan',
    photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80',
    verified: false,
  },
];

// Message templates for notifications - Engaging but tasteful
const messageTemplates = [
  "Hi! Your profile really caught my attention. Would you like to chat? 😊",
  "I think we might have a lot in common! Are you interested in talking?",
  "Your photos are lovely! I'd love to get to know you better 💕",
  "Hello! I'm looking for someone genuine to connect with. Interested?",
  "You seem like exactly what I've been looking for! Want to chat?",
  "Hi there! I really like your profile. Are you free to talk?",
  "Your smile made my day! Would you like to start a conversation? 😍",
  "I'm interested in getting to know you better. Care to chat?",
  "Hello! I think you seem really interesting. Want to talk?",
  "Hi! I'd love to chat with you and see if we connect 💖",
  "Your profile is amazing! I'd like to know more about you.",
  "I'm hoping we could start a conversation. What do you think?",
  "You look like someone I'd really enjoy talking to! Interested?",
  "Hi! I think we could be a great match. Want to find out?",
  "I'd love to chat with you if you're interested 😘"
];

interface NotificationSystemProps {
  isActive?: boolean;
  onReply?: (profileId: string) => void;
  onViewProfile?: (profileId: string) => void;
}

export function NotificationSystem({ 
  isActive = true, 
  onReply, 
  onViewProfile 
}: NotificationSystemProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [usedProfiles, setUsedProfiles] = useState<Set<string>>(new Set());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getRandomMessage = () => {
    return messageTemplates[Math.floor(Math.random() * messageTemplates.length)];
  };

  const getRandomProfile = useCallback(() => {
    // Filter out recently used profiles
    const availableProfiles = notificationProfiles.filter(
      profile => !usedProfiles.has(profile.id)
    );
    
    // If all profiles have been used, reset the used set
    if (availableProfiles.length === 0) {
      setUsedProfiles(new Set());
      return notificationProfiles[Math.floor(Math.random() * notificationProfiles.length)];
    }
    
    return availableProfiles[Math.floor(Math.random() * availableProfiles.length)];
  }, [usedProfiles]);

  const createNotification = useCallback(() => {
    if (!isActive) return;

    const profile = getRandomProfile();
    if (!profile) return;

    const notification: Notification = {
      id: `notification-${Date.now()}-${Math.random()}`,
      profile,
      message: getRandomMessage(),
      timestamp: Date.now(),
    };

    // Keep only one notification at a time
    setNotifications([notification]);
    setUsedProfiles(prev => new Set([...prev, profile.id]));
  }, [isActive, getRandomProfile]);

  const scheduleNextNotification = useCallback(() => {
    if (!isActive) return;

    // Realistic notification timing - every 2-5 minutes (120-300 seconds)
    const delay = Math.random() * 180000 + 120000; // 2-5 minutes in milliseconds
    
    timeoutRef.current = setTimeout(() => {
      createNotification();
      scheduleNextNotification(); // Schedule the next one
      
      // Add sound effect hook for future implementation
      try {
        // navigator.vibrate && navigator.vibrate(200); // Mobile vibration
        console.log('🔔 New message notification sound would play here');
      } catch (e) {
        // Silent fail for sound effects
      }
    }, delay);
  }, [isActive, createNotification]);

  const handleDismiss = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const handleReply = (notificationId: string) => {
    const notification = notifications.find(n => n.id === notificationId);
    if (notification && onReply) {
      onReply(notification.profile.id);
    }
    handleDismiss(notificationId);
  };

  const handleViewProfile = (notificationId: string) => {
    const notification = notifications.find(n => n.id === notificationId);
    if (notification && onViewProfile) {
      onViewProfile(notification.profile.id);
    }
    handleDismiss(notificationId);
  };

  // Initialize the notification system
  useEffect(() => {
    if (!isActive) {
      // Clean up when inactive
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setNotifications([]);
      return;
    }

    // Start with a reasonable delay after component mounts
    const initialDelay = Math.random() * 60000 + 30000; // 30-90 seconds
    timeoutRef.current = setTimeout(() => {
      createNotification();
      scheduleNextNotification(); // Start the recurring schedule
    }, initialDelay);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isActive, createNotification, scheduleNextNotification]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (notifications.length === 0) return null;

  // Show single notification
  const currentNotification = notifications[0];

  return (
    <DatingNotification
      profile={currentNotification.profile}
      message={currentNotification.message}
      duration={8000}
      onClose={() => handleDismiss(currentNotification.id)}
      onReply={() => handleReply(currentNotification.id)}
      onViewProfile={() => handleViewProfile(currentNotification.id)}
    />
  );
} 