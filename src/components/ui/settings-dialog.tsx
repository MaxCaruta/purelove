import { useState } from 'react';
import { Settings, X, Bell, BellOff, Volume2, VolumeX, Eye, EyeOff, Trash2, Shield, MessageCircle } from 'lucide-react';
import { Button } from './button';
import { Switch } from './switch';

export interface ChatSettings {
  notifications: boolean;
  sounds: boolean;
  readReceipts: boolean;
  onlineStatus: boolean;
  autoArchive: boolean;
  messagePreview: boolean;
}

export interface SettingsDialog {
  id: string;
  title: string;
  settings: ChatSettings;
  onSave: (settings: ChatSettings) => void;
  onCancel: () => void;
}

interface SettingsDialogProps extends SettingsDialog {
  onClose: (id: string) => void;
}

export function SettingsDialogComponent({ 
  id, 
  title, 
  settings: initialSettings,
  onSave, 
  onCancel,
  onClose 
}: SettingsDialogProps) {
  const [settings, setSettings] = useState<ChatSettings>(initialSettings);

  const handleSave = () => {
    onSave(settings);
    onClose(id);
  };

  const handleCancel = () => {
    onCancel();
    onClose(id);
  };

  const updateSetting = (key: keyof ChatSettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Settings className="h-6 w-6 text-blue-500" />
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
        <div className="p-6 space-y-6">
          {/* Notifications */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </h4>
            
            <div className="space-y-3 ml-6">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Push Notifications</label>
                  <p className="text-xs text-gray-500">Receive notifications for new messages</p>
                </div>
                <Switch
                  checked={settings.notifications}
                  onCheckedChange={(checked) => updateSetting('notifications', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Message Preview</label>
                  <p className="text-xs text-gray-500">Show message content in notifications</p>
                </div>
                <Switch
                  checked={settings.messagePreview}
                  onCheckedChange={(checked) => updateSetting('messagePreview', checked)}
                />
              </div>
            </div>
          </div>

          {/* Audio */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              Audio
            </h4>
            
            <div className="space-y-3 ml-6">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Message Sounds</label>
                  <p className="text-xs text-gray-500">Play sound when receiving messages</p>
                </div>
                <Switch
                  checked={settings.sounds}
                  onCheckedChange={(checked) => updateSetting('sounds', checked)}
                />
              </div>
            </div>
          </div>

          {/* Privacy */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Privacy
            </h4>
            
            <div className="space-y-3 ml-6">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Read Receipts</label>
                  <p className="text-xs text-gray-500">Let others know when you've read their messages</p>
                </div>
                <Switch
                  checked={settings.readReceipts}
                  onCheckedChange={(checked) => updateSetting('readReceipts', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Online Status</label>
                  <p className="text-xs text-gray-500">Show when you're online to other users</p>
                </div>
                <Switch
                  checked={settings.onlineStatus}
                  onCheckedChange={(checked) => updateSetting('onlineStatus', checked)}
                />
              </div>
            </div>
          </div>

          {/* Chat Management */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Chat Management
            </h4>
            
            <div className="space-y-3 ml-6">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Auto Archive</label>
                  <p className="text-xs text-gray-500">Automatically archive inactive conversations</p>
                </div>
                <Switch
                  checked={settings.autoArchive}
                  onCheckedChange={(checked) => updateSetting('autoArchive', checked)}
                />
              </div>
            </div>
          </div>
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
            onClick={handleSave}
            className="px-6 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}

export function SettingsDialogContainer({ 
  dialogs, 
  onClose 
}: { 
  dialogs: SettingsDialog[]; 
  onClose: (id: string) => void; 
}) {
  if (dialogs.length === 0) return null;

  // Only show the most recent dialog
  const currentDialog = dialogs[dialogs.length - 1];

  return (
    <SettingsDialogComponent
      {...currentDialog}
      onClose={onClose}
    />
  );
}

// Custom hook for managing settings dialogs
export function useSettingsDialog() {
  const [dialogs, setDialogs] = useState<SettingsDialog[]>([]);

  const showDialog = (dialog: Omit<SettingsDialog, 'id'>) => {
    const id = Date.now().toString();
    setDialogs(prev => [...prev, { ...dialog, id }]);
  };

  const closeDialog = (id: string) => {
    setDialogs(prev => prev.filter(dialog => dialog.id !== id));
  };

  const openSettings = (
    title: string,
    currentSettings: ChatSettings,
    onSave: (settings: ChatSettings) => void,
    onCancel: () => void = () => {}
  ) => {
    showDialog({
      title,
      settings: currentSettings,
      onSave,
      onCancel
    });
  };

  return {
    dialogs,
    showDialog,
    closeDialog,
    openSettings
  };
} 