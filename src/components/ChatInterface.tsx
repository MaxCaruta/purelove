import { useState, useRef, useEffect } from 'react';
import { Send, Phone, Video, MoreVertical, Smile, Paperclip, Heart, Settings, Archive, Star, Image, Mic, Gift, Lock, MessageCircle, UserX, Flag, Volume2, VolumeX, Bell, BellOff } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Profile } from '@/types';
import { chatbot } from '@/lib/chatbot';
import { useAuth } from '@/context/AuthContext';
import { useToast, ToastContainer } from './ui/toast';
import { useConfirmationDialog, ConfirmationDialogContainer } from './ui/confirmation-dialog';
import { usePromptDialog, PromptDialogContainer } from './ui/prompt-dialog';
import { useSettingsDialog, SettingsDialogContainer, ChatSettings } from './ui/settings-dialog';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';

interface Message {
  id: string;
  text: string;
  timestamp: Date;
  isOwn: boolean;
  type: 'text' | 'emoji' | 'image' | 'gift';
  imageUrl?: string;
}

interface ChatInterfaceProps {
  profile: Profile;
  searchFilters?: any;
  className?: string;
}

export function ChatInterface({ profile, searchFilters = {}, className = '' }: ChatInterfaceProps) {
  const { user } = useAuth();
  const toast = useToast();
  const confirmDialog = useConfirmationDialog();
  const promptDialog = usePromptDialog();
  const settingsDialog = useSettingsDialog();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Generate context-aware opening messages based on search filters
  const generateContextualMessages = (profile: Profile, filters: any) => {
    // Temporarily disabled - return empty array to prevent preset messages
    return [];
    
    // Original code commented out:
    /*
    const messages: Message[] = [];
    let messageId = 1;
    
    // Check if user used specific filters to tailor conversation
    if (filters.interests && filters.interests.length > 0) {
      const sharedInterest = filters.interests.find((interest: string) => 
        profile.interests.includes(interest)
      );
      if (sharedInterest) {
        messages.push({
          id: `${messageId++}`,
          text: `Hi! I saw you're looking for someone into ${sharedInterest.toLowerCase()} - me too! 😊`,
          timestamp: new Date(Date.now() - 25 * 60 * 1000),
          isOwn: false,
          type: 'text'
        });
        messages.push({
          id: `${messageId++}`,
          text: `How did you get started with ${sharedInterest.toLowerCase()}? I'd love to hear your story!`,
          timestamp: new Date(Date.now() - 23 * 60 * 1000),
          isOwn: false,
          type: 'text'
        });
        return messages;
      }
    }
    
    if (filters.country && profile.country.toLowerCase() === filters.country.toLowerCase()) {
      messages.push({
        id: `${messageId++}`,
        text: `Hi! I see you're specifically looking for someone from ${profile.country} - that's where I'm from! 🇺🇦`,
        timestamp: new Date(Date.now() - 25 * 60 * 1000),
        isOwn: false,
        type: 'text'
      });
      messages.push({
        id: `${messageId++}`,
        text: `What made you interested in meeting someone from here? I'm curious! 😊`,
        timestamp: new Date(Date.now() - 23 * 60 * 1000),
        isOwn: false,
        type: 'text'
      });
      return messages;
    }
    
    // Default messages when no specific filters are used
    messages.push({
      id: `${messageId++}`,
      text: `Hi! I came across your profile and thought we might have some things in common 😊`,
      timestamp: new Date(Date.now() - 25 * 60 * 1000),
      isOwn: false,
      type: 'text'
    });
    messages.push({
      id: `${messageId++}`,
      text: `I'm ${profile.firstName}, nice to meet you! What brings you to this app?`,
      timestamp: new Date(Date.now() - 23 * 60 * 1000),
      isOwn: false,
      type: 'text'
    });
    
    return messages;
    */
  };

  // Initialize conversation
  useEffect(() => {
    const initialMessages = generateContextualMessages(profile, searchFilters);
    setMessages(initialMessages);
  }, [profile, searchFilters]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    // Check if user has enough coins
    if (!user || user.coins < 1) {
      toast.error('You need at least 1 coin to send messages. Each message costs 1 coin.');
      return;
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: newMessage,
      timestamp: new Date(),
      isOwn: true,
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setHasUserSentMessage(true);

    // Show typing indicator
    setIsTyping(true);

    try {
      // Get AI response
      const response = await chatbot.generateResponse(newMessage, profile);
      
      setTimeout(() => {
        setIsTyping(false);
        const aiMessage: Message = {
          id: `ai-${Date.now()}`,
          text: response,
          timestamp: new Date(),
          isOwn: false,
          type: 'text'
        };
        setMessages(prev => [...prev, aiMessage]);
      }, 1000 + Math.random() * 2000); // Random delay 1-3 seconds
    } catch (error) {
      setIsTyping(false);
      toast.error('Failed to send message');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEmojiClick = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleFileUpload = () => {
    if (!user || user.coins < 1) {
      toast.error('You need at least 1 coin to send files. Each message costs 1 coin.');
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const imageUrl = URL.createObjectURL(file);
        const imageMessage: Message = {
          id: `image-${Date.now()}`,
          text: 'Shared a photo',
          timestamp: new Date(),
          isOwn: true,
          type: 'image',
          imageUrl
        };
        setMessages(prev => [...prev, imageMessage]);
      }
    }
  };

  const handleVideoCall = () => {
    if (!user || user.coins < 1000) {
      toast.error('You need at least 1000 coins to start a video call. Video calls cost 1000 coins per minute.');
      return;
    }
    toast.success('Video call feature coming soon!');
  };

  const handlePhoneCall = () => {
    if (!user || user.coins < 400) {
      toast.error('You need at least 400 coins to start a voice call. Voice calls cost 400 coins per minute.');
      return;
    }
    toast.success('Voice call feature coming soon!');
  };

  const handleSendGift = () => {
    if (!user || user.coins < 5) {
      toast.error('You need at least 5 coins to send virtual gifts. Virtual gifts start from 5 coins.');
      return;
    }
    toast.success('Gift feature coming soon!');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const emojis = ['😊', '😍', '🥰', '😘', '💕', '❤️', '🌹', '💐', '🎉', '👍', '😂', '🤗'];

  return (
    <div className={`flex flex-col h-full bg-white ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile.photos?.[0]} alt={profile.firstName} />
            <AvatarFallback>{profile.firstName[0]}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">
                {profile.firstName}, {new Date().getFullYear() - new Date(profile.birthDate).getFullYear()}
              </h3>
              {profile.verified && (
                <Badge variant="verified" className="text-xs">
                  Verified
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-500">{profile.city}, {profile.country}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handlePhoneCall}
            className="text-gray-600 hover:text-gray-900"
          >
            <Phone className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleVideoCall}
            className="text-gray-600 hover:text-gray-900"
          >
            <Video className="h-4 w-4" />
          </Button>
          <div className="relative" ref={moreMenuRef}>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="text-gray-600 hover:text-gray-900"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
            
            {showMoreMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <button
                  onClick={handleSendGift}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Gift className="h-4 w-4" />
                  Send Gift
                </button>
                <button
                  onClick={() => setIsNotificationsEnabled(!isNotificationsEnabled)}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  {isNotificationsEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                  {isNotificationsEnabled ? 'Disable' : 'Enable'} Notifications
                </button>
                <button
                  onClick={() => setIsSoundEnabled(!isSoundEnabled)}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  {isSoundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  {isSoundEnabled ? 'Disable' : 'Enable'} Sound
                </button>
                <hr className="my-1" />
                <button
                  onClick={() => confirmDialog.confirm('Block User', 'Are you sure you want to block this user?', () => {})}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <UserX className="h-4 w-4" />
                  Block User
                </button>
                <button
                  onClick={() => promptDialog.prompt('Report User', 'Please describe the issue:', (value) => {})}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <Flag className="h-4 w-4" />
                  Report User
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Coin Balance Notice */}
      {!user || user.coins < 1 ? (
        <div className="bg-rose-50 border-b border-rose-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5 text-rose-500" />
              <div>
                <h4 className="font-medium text-rose-800">Need Coins to Message</h4>
                <p className="text-sm text-rose-600">You need at least 1 coin to send messages. Each message costs 1 coin.</p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-rose-600">Buy Coins</p>
              <Button 
                onClick={() => window.location.href = '/pricing'}
                className="bg-rose-500 hover:bg-rose-600 text-white mt-2"
              >
                Get Coins
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.isOwn
                  ? 'bg-rose-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {message.type === 'image' && message.imageUrl ? (
                <img
                  src={message.imageUrl}
                  alt="Shared image"
                  className="rounded-lg max-w-full h-auto"
                />
              ) : (
                <p className="text-sm">{message.text}</p>
              )}
              <p
                className={`text-xs mt-1 ${
                  message.isOwn ? 'text-rose-100' : 'text-gray-500'
                }`}
              >
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="border-t border-gray-200 p-4">
          <div className="grid grid-cols-6 gap-2">
            {emojis.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleEmojiClick(emoji)}
                className="text-2xl hover:bg-gray-100 rounded p-2 transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="text-gray-500 hover:text-gray-700"
          >
            <Smile className="h-5 w-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFileUpload}
            className="text-gray-500 hover:text-gray-700"
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          
          <div className="flex-1">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="border-0 focus:ring-0 bg-gray-50"
            />
          </div>
          
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="bg-rose-500 hover:bg-rose-600 text-white"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Toast Container */}
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
      
      {/* Dialog Containers */}
      <ConfirmationDialogContainer dialogs={confirmDialog.dialogs} onClose={confirmDialog.closeDialog} />
      <PromptDialogContainer dialogs={promptDialog.dialogs} onClose={promptDialog.closeDialog} />
      <SettingsDialogContainer dialogs={settingsDialog.dialogs} onClose={settingsDialog.closeDialog} />
    </div>
  );
} 