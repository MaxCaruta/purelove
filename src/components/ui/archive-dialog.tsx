import { useState } from 'react';
import { Archive, X, MessageCircle, Search, RotateCcw, Trash2, Calendar } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import { Profile } from '@/types';

export interface ArchivedConversation {
  id: string;
  profile: Profile;
  lastMessage: string;
  lastMessageTime: Date;
  archivedAt: Date;
  messageCount: number;
}

export interface ArchiveDialog {
  id: string;
  title: string;
  archivedConversations: ArchivedConversation[];
  onUnarchive: (conversationId: string) => void;
  onDelete: (conversationId: string) => void;
  onCancel: () => void;
}

interface ArchiveDialogProps extends ArchiveDialog {
  onClose: (id: string) => void;
}

export function ArchiveDialogComponent({ 
  id, 
  title, 
  archivedConversations,
  onUnarchive,
  onDelete,
  onCancel,
  onClose 
}: ArchiveDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleCancel = () => {
    onCancel();
    onClose(id);
  };

  const handleUnarchive = (conversationId: string) => {
    onUnarchive(conversationId);
  };

  const handleDelete = (conversationId: string) => {
    onDelete(conversationId);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const filteredConversations = archivedConversations.filter(conv =>
    conv.profile.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] animate-scale-in flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Archive className="h-6 w-6 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <span className="bg-gray-100 text-gray-600 text-sm px-2 py-1 rounded-full">
              {archivedConversations.length}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-gray-100"
            onClick={handleCancel}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search archived conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <Archive className="h-12 w-12 text-gray-300 mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                {archivedConversations.length === 0 ? 'No Archived Conversations' : 'No Results Found'}
              </h4>
              <p className="text-gray-500 max-w-sm">
                {archivedConversations.length === 0
                  ? 'When you archive conversations, they will appear here. You can always unarchive them later.'
                  : 'Try adjusting your search terms to find the conversation you\'re looking for.'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredConversations.map((conversation) => (
                <div key={conversation.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img
                        src={conversation.profile.photos[0]}
                        alt={conversation.profile.firstName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      {conversation.profile.verified && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-gray-900 truncate">
                          {conversation.profile.firstName}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />
                          <span>Archived {formatTime(conversation.archivedAt)}</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 truncate mb-2">
                        {conversation.lastMessage}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{conversation.messageCount} messages</span>
                          <span>Last: {formatTime(conversation.lastMessageTime)}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-3 hover:bg-blue-50 hover:text-blue-600"
                            onClick={() => handleUnarchive(conversation.id)}
                            title="Unarchive conversation"
                          >
                            <RotateCcw className="h-3 w-3 mr-1" />
                            Unarchive
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-3 hover:bg-red-50 hover:text-red-600"
                            onClick={() => handleDelete(conversation.id)}
                            title="Delete conversation permanently"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Archived conversations are hidden from your main chat list but preserved.
            </p>
            <Button
              variant="outline"
              onClick={handleCancel}
              className="px-6"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ArchiveDialogContainer({ 
  dialogs, 
  onClose 
}: { 
  dialogs: ArchiveDialog[]; 
  onClose: (id: string) => void; 
}) {
  if (dialogs.length === 0) return null;

  // Only show the most recent dialog
  const currentDialog = dialogs[dialogs.length - 1];

  return (
    <ArchiveDialogComponent
      {...currentDialog}
      onClose={onClose}
    />
  );
}

// Custom hook for managing archive dialogs
export function useArchiveDialog() {
  const [dialogs, setDialogs] = useState<ArchiveDialog[]>([]);

  const showDialog = (dialog: Omit<ArchiveDialog, 'id'>) => {
    const id = Date.now().toString();
    setDialogs(prev => [...prev, { ...dialog, id }]);
  };

  const closeDialog = (id: string) => {
    setDialogs(prev => prev.filter(dialog => dialog.id !== id));
  };

  const openArchive = (
    title: string,
    archivedConversations: ArchivedConversation[],
    onUnarchive: (conversationId: string) => void,
    onDelete: (conversationId: string) => void,
    onCancel: () => void = () => {}
  ) => {
    showDialog({
      title,
      archivedConversations,
      onUnarchive,
      onDelete,
      onCancel
    });
  };

  return {
    dialogs,
    showDialog,
    closeDialog,
    openArchive
  };
} 