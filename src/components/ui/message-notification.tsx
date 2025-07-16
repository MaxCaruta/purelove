import { useState, useEffect } from 'react';
import { X, MessageCircle } from 'lucide-react';

interface MessageNotificationProps {
  senderName: string;
  senderPhoto?: string;
  message: string;
  duration?: number;
  onClose?: () => void;
  onReply?: () => void;
  onViewConversation?: () => void;
}

export function MessageNotification({ 
  senderName,
  senderPhoto,
  message, 
  duration = 6000, 
  onClose,
  onReply,
  onViewConversation
}: MessageNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Animate in
    const showTimer = setTimeout(() => setIsVisible(true), 100);
    
    // Auto-dismiss after duration
    const hideTimer = setTimeout(() => {
      handleClose();
    }, duration);

    // Play notification sound
    try {
      // Create a subtle notification sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.15);
    } catch (error) {
      // Silent fail for audio
    }

    // Request browser notification permission and show if allowed
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`${senderName}`, {
        body: message.length > 50 ? message.substring(0, 50) + '...' : message,
        icon: senderPhoto || '/default-avatar.png',
        tag: 'chat-message',
        requireInteraction: false
      });
    }

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [duration, senderName, message, senderPhoto]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 200);
  };

  const handleClick = () => {
    onViewConversation?.();
    handleClose();
  };

  if (!isVisible && !isExiting) return null;

  return (
    <div 
      className={`fixed top-4 right-4 z-50 w-80 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden cursor-pointer transition-all duration-200 ease-out ${
        isVisible && !isExiting 
          ? 'translate-y-0 opacity-100 scale-100' 
          : '-translate-y-2 opacity-0 scale-95'
      }`}
      onClick={handleClick}
    >
      {/* Simple content */}
      <div className="p-3">
        <div className="flex items-start gap-3">
          <div className="relative flex-shrink-0">
            {senderPhoto ? (
              <img
                src={senderPhoto}
                alt={`${senderName}'s profile`}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center">
                <span className="text-xs font-semibold text-white">
                  {senderName[0]?.toUpperCase()}
                </span>
              </div>
            )}
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border border-white rounded-full"></div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="font-medium text-gray-900 text-sm truncate">{senderName}</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClose();
                }}
                className="p-0.5 rounded-full hover:bg-gray-100 transition-colors ml-2"
              >
                <X className="w-3 h-3 text-gray-400" />
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
              {message.length > 60 ? message.substring(0, 60) + '...' : message}
            </p>
          </div>
        </div>
      </div>

      {/* Minimal progress bar */}
      <div className="h-0.5 bg-gray-100">
        <div 
          className="h-full bg-gray-400"
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
          .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        `}
      </style>
    </div>
  );
} 