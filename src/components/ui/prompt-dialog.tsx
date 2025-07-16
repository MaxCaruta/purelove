import { useState } from 'react';
import { MessageSquare, X } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import { Textarea } from './textarea';

export interface PromptDialog {
  id: string;
  title: string;
  message: string;
  placeholder?: string;
  defaultValue?: string;
  multiline?: boolean;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}

interface PromptDialogProps extends PromptDialog {
  onClose: (id: string) => void;
}

export function PromptDialogComponent({ 
  id, 
  title, 
  message, 
  placeholder = '',
  defaultValue = '',
  multiline = false,
  onConfirm, 
  onCancel,
  onClose 
}: PromptDialogProps) {
  const [value, setValue] = useState(defaultValue);

  const handleConfirm = () => {
    onConfirm(value);
    onClose(id);
  };

  const handleCancel = () => {
    onCancel();
    onClose(id);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) {
        handleConfirm();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-6 w-6 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
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

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-gray-700 leading-relaxed">{message}</p>
          
          {multiline ? (
            <Textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              className="min-h-[100px] resize-none"
              autoFocus
            />
          ) : (
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              autoFocus
            />
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="px-6"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!value.trim()}
            className="px-6 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
}

export function PromptDialogContainer({ 
  dialogs, 
  onClose 
}: { 
  dialogs: PromptDialog[]; 
  onClose: (id: string) => void; 
}) {
  if (dialogs.length === 0) return null;

  // Only show the most recent dialog
  const currentDialog = dialogs[dialogs.length - 1];

  return (
    <PromptDialogComponent
      {...currentDialog}
      onClose={onClose}
    />
  );
}

// Custom hook for managing prompt dialogs
export function usePromptDialog() {
  const [dialogs, setDialogs] = useState<PromptDialog[]>([]);

  const showDialog = (dialog: Omit<PromptDialog, 'id'>) => {
    const id = Date.now().toString();
    setDialogs(prev => [...prev, { ...dialog, id }]);
  };

  const closeDialog = (id: string) => {
    setDialogs(prev => prev.filter(dialog => dialog.id !== id));
  };

  const prompt = (
    title: string,
    message: string,
    onConfirm: (value: string) => void,
    onCancel: () => void = () => {},
    options?: {
      placeholder?: string;
      defaultValue?: string;
      multiline?: boolean;
    }
  ) => {
    showDialog({
      title,
      message,
      onConfirm,
      onCancel,
      placeholder: options?.placeholder || '',
      defaultValue: options?.defaultValue || '',
      multiline: options?.multiline || false
    });
  };

  return {
    dialogs,
    showDialog,
    closeDialog,
    prompt
  };
} 