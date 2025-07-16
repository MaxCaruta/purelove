import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Profile } from '@/types';

interface ChatContextType {
  showChatWindow: boolean;
  chatProfile: Profile | null;
  openChat: (profile: Profile) => void;
  closeChat: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [showChatWindow, setShowChatWindow] = useState(false);
  const [chatProfile, setChatProfile] = useState<Profile | null>(null);

  const openChat = (profile: Profile) => {
    setChatProfile(profile);
    setShowChatWindow(true);
  };

  const closeChat = () => {
    setShowChatWindow(false);
    setChatProfile(null);
  };

  return (
    <ChatContext.Provider value={{
      showChatWindow,
      chatProfile,
      openChat,
      closeChat
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
} 