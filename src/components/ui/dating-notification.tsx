import { useState, useEffect } from 'react';
import { X, Heart, MessageCircle, User } from 'lucide-react';
import { Badge } from './badge';

interface DatingNotificationProps {
  profile: {
    id: string;
    firstName: string;
    age: number;
    city: string;
    country: string;
    photo: string;
    verified: boolean;
  };
  message: string;
  duration?: number;
  onClose?: () => void;
  onReply?: () => void;
  onViewProfile?: () => void;
}

export function DatingNotification({ 
  profile, 
  message, 
  duration = 8000, 
  onClose,
  onReply,
  onViewProfile
}: DatingNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Animate in
    const showTimer = setTimeout(() => setIsVisible(true), 100);
    
    // Auto-dismiss after duration
    const hideTimer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300);
  };

  const handleReply = () => {
    onReply?.();
    handleClose();
  };

  const handleViewProfile = () => {
    onViewProfile?.();
    handleClose();
  };

  if (!isVisible && !isExiting) return null;

  return (
    <div 
      className={`fixed bottom-4 right-4 z-50 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden transition-all duration-300 ease-out ${
        isVisible && !isExiting 
          ? 'translate-y-0 opacity-100 scale-100' 
          : 'translate-y-4 opacity-0 scale-95'
      }`}
    >
      {/* Header with close button */}
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-rose-50 to-pink-50 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Heart className="h-4 w-4 text-rose-500" />
          <span className="text-sm font-medium text-gray-700">New Message</span>
        </div>
        <button
          onClick={handleClose}
          className="p-1 rounded-full hover:bg-white/60 transition-colors"
        >
          <X className="h-4 w-4 text-gray-500" />
        </button>
      </div>

      {/* Profile section */}
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="relative">
            <img
              src={profile.photo}
              alt={`${profile.firstName}'s profile`}
              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
            />
            {profile.verified && (
              <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">{profile.firstName}, {profile.age}</h3>
              {profile.verified && (
                <Badge variant="verified" className="text-xs">
                  Verified
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-600">{profile.city}, {profile.country}</p>
          </div>
        </div>

        {/* Message */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <p className="text-sm text-gray-700 leading-relaxed">{message}</p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleViewProfile}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium"
          >
            <User className="h-4 w-4" />
            View Profile
          </button>
          <button
            onClick={handleReply}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition-colors text-sm font-medium"
          >
            <MessageCircle className="h-4 w-4" />
            Reply
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-gray-100">
        <div 
          className="h-full bg-gradient-to-r from-rose-400 to-pink-400"
          style={{
            width: '100%',
            animation: `progressShrink ${duration}ms linear forwards`
          }}
        />
      </div>

      <style>
        {`
          @keyframes progressShrink {
            from { width: 100%; }
            to { width: 0%; }
          }
        `}
      </style>
    </div>
  );
} 