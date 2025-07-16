import { useState } from 'react';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';
import { Button } from './button';

export interface ConfirmationDialog {
  id: string;
  title: string;
  message: string;
  type?: 'warning' | 'danger' | 'info' | 'success';
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

interface ConfirmationDialogProps extends ConfirmationDialog {
  onClose: (id: string) => void;
}

export function ConfirmationDialogComponent({ 
  id, 
  title, 
  message, 
  type = 'warning', 
  confirmText = 'Confirm', 
  cancelText = 'Cancel',
  onConfirm, 
  onCancel,
  onClose 
}: ConfirmationDialogProps) {
  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <AlertTriangle className="h-6 w-6 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'info':
        return <Info className="h-6 w-6 text-blue-500" />;
    }
  };

  const getConfirmButtonStyle = () => {
    switch (type) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white';
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700 text-white';
      case 'success':
        return 'bg-green-600 hover:bg-green-700 text-white';
      case 'info':
        return 'bg-blue-600 hover:bg-blue-700 text-white';
    }
  };

  const handleConfirm = () => {
    onConfirm();
    onClose(id);
  };

  const handleCancel = () => {
    onCancel();
    onClose(id);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {getIcon()}
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
        <div className="p-6">
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="px-6"
          >
            {cancelText}
          </Button>
          <Button
            onClick={handleConfirm}
            className={`px-6 ${getConfirmButtonStyle()}`}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ConfirmationDialogContainer({ 
  dialogs, 
  onClose 
}: { 
  dialogs: ConfirmationDialog[]; 
  onClose: (id: string) => void; 
}) {
  if (dialogs.length === 0) return null;

  // Only show the most recent dialog
  const currentDialog = dialogs[dialogs.length - 1];

  return (
    <ConfirmationDialogComponent
      {...currentDialog}
      onClose={onClose}
    />
  );
}

// Custom hook for managing confirmation dialogs
export function useConfirmationDialog() {
  const [dialogs, setDialogs] = useState<ConfirmationDialog[]>([]);

  const showDialog = (dialog: Omit<ConfirmationDialog, 'id'>) => {
    const id = Date.now().toString();
    setDialogs(prev => [...prev, { ...dialog, id }]);
  };

  const closeDialog = (id: string) => {
    setDialogs(prev => prev.filter(dialog => dialog.id !== id));
  };

  const confirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel: () => void = () => {},
    options?: {
      type?: 'warning' | 'danger' | 'info' | 'success';
      confirmText?: string;
      cancelText?: string;
    }
  ) => {
    showDialog({
      title,
      message,
      onConfirm,
      onCancel,
      type: options?.type || 'warning',
      confirmText: options?.confirmText || 'Confirm',
      cancelText: options?.cancelText || 'Cancel'
    });
  };

  return {
    dialogs,
    showDialog,
    closeDialog,
    confirm
  };
} 