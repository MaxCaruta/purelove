import { useState } from 'react';
import { Send, Gift, Video, Phone, Image, Smile } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  timestamp: Date;
  read: boolean;
}

interface MessageBoxProps {
  messages: Message[];
  currentUserId: string;
  receiver: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    online?: boolean;
    verified?: boolean;
  };
  onSendMessage: (content: string) => void;
  onSendGift: () => void;
  onStartVideoCall: () => void;
  onStartVoiceCall: () => void;
}

export function MessageBox({
  messages,
  currentUserId,
  receiver,
  onSendMessage,
  onSendGift,
  onStartVideoCall,
  onStartVoiceCall,
}: MessageBoxProps) {
  const [messageText, setMessageText] = useState('');

  const handleSendMessage = () => {
    if (messageText.trim()) {
      onSendMessage(messageText);
      setMessageText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full border rounded-lg overflow-hidden bg-white">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={receiver.avatarUrl} />
            <AvatarFallback>{receiver.firstName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{receiver.firstName} {receiver.lastName}</h3>
              {receiver.verified && (
                <Badge variant="verified" className="h-5 flex items-center">Verified</Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span className={`h-2 w-2 rounded-full ${receiver.online ? 'bg-green-500' : 'bg-slate-300'}`}></span>
              <span>{receiver.online ? 'Online' : 'Offline'}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={onStartVoiceCall}>
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onStartVideoCall}>
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onSendGift}>
            <Gift className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50">
        {messages.map((message) => {
          const isCurrentUser = message.senderId === currentUserId;
          return (
            <div
              key={message.id}
              className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  isCurrentUser
                    ? 'bg-rose-600 text-white'
                    : 'bg-white border border-slate-200'
                }`}
              >
                <p>{message.content}</p>
                <div
                  className={`text-xs mt-1 ${
                    isCurrentUser ? 'text-rose-200' : 'text-slate-500'
                  }`}
                >
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  {isCurrentUser && (
                    <span className="ml-1">{message.read ? '• Read' : ''}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex items-end gap-2">
          <Button variant="ghost" size="icon">
            <Image className="h-5 w-5 text-slate-500" />
          </Button>
          <Button variant="ghost" size="icon">
            <Smile className="h-5 w-5 text-slate-500" />
          </Button>
          <Textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 min-h-[60px] resize-none"
          />
          <Button onClick={handleSendMessage} disabled={!messageText.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-2 text-xs text-slate-500 text-center">
          <span>5 coins per message • </span>
          <span className="text-rose-600 font-medium">Buy more coins</span>
        </div>
      </div>
    </div>
  );
}
