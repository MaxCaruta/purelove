import React, { useState } from 'react';
import { 
  CookieService, 
  useCookie, 
  useJSONCookie, 
  CookieConsentBanner,
  CookieSettings 
} from './CookieManager';

export function CookieExample() {
  const [showSettings, setShowSettings] = useState(false);
  
  // Example using the useCookie hook
  const [theme, setTheme, deleteTheme] = useCookie('theme', 'light');
  
  // Example using the useJSONCookie hook
  const [userPreferences, setUserPreferences, deleteUserPreferences] = useJSONCookie('user-preferences', {
    language: 'en',
    notifications: true,
    autoSave: false
  });

  // Example of direct CookieService usage
  const handleSetSessionData = () => {
    CookieService.set('session-id', 'abc123', { expires: 1 }); // 1 day
    CookieService.setJSON('user-data', { 
      id: 1, 
      name: 'John Doe',
      lastLogin: new Date().toISOString()
    }, { expires: 7 }); // 7 days
    alert('Session data saved to cookies!');
  };

  const handleClearSessionData = () => {
    CookieService.delete('session-id');
    CookieService.delete('user-data');
    alert('Session data cleared from cookies!');
  };

  const handleCookieConsent = (consent: any) => {
    console.log('Cookie consent updated:', consent);
    alert('Cookie preferences saved!');
  };

  const handleDeleteTheme = () => {
    deleteTheme();
  };

  const handleDeletePreferences = () => {
    deleteUserPreferences();
  };

  const handleUpdateNotifications = (checked: boolean) => {
    setUserPreferences({
      language: userPreferences?.language || 'en',
      notifications: checked,
      autoSave: userPreferences?.autoSave || false
    }, { expires: 365 });
  };

  const handleUpdateAutoSave = (checked: boolean) => {
    setUserPreferences({
      language: userPreferences?.language || 'en',
      notifications: userPreferences?.notifications || false,
      autoSave: checked
    }, { expires: 365 });
  };

  const handleUpdateLanguage = (language: string) => {
    setUserPreferences({
      language,
      notifications: userPreferences?.notifications || false,
      autoSave: userPreferences?.autoSave || false
    }, { expires: 365 });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Cookie Manager Examples</h1>
      
      {/* Theme Selection */}
      <div className="border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Theme Selection (useCookie hook)</h2>
        <div className="flex gap-4 items-center">
          <button
            onClick={() => setTheme('light', { expires: 30 })}
            className={`px-4 py-2 rounded ${theme === 'light' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Light Theme
          </button>
          <button
            onClick={() => setTheme('dark', { expires: 30 })}
            className={`px-4 py-2 rounded ${theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Dark Theme
          </button>
          <button
            onClick={handleDeleteTheme}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Clear Theme
          </button>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          Current theme: <strong>{theme || 'default'}</strong>
        </p>
      </div>

      {/* User Preferences */}
      <div className="border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">User Preferences (useJSONCookie hook)</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={userPreferences?.notifications || false}
                onChange={(e) => handleUpdateNotifications(e.target.checked)}
                className="rounded"
              />
              Enable Notifications
            </label>
          </div>
          
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={userPreferences?.autoSave || false}
                onChange={(e) => handleUpdateAutoSave(e.target.checked)}
                className="rounded"
              />
              Auto Save
            </label>
          </div>
          
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              Language:
              <select
                value={userPreferences?.language || 'en'}
                onChange={(e) => handleUpdateLanguage(e.target.value)}
                className="border rounded px-2 py-1"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
              </select>
            </label>
          </div>
          
          <button
            onClick={handleDeletePreferences}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Clear Preferences
          </button>
        </div>
        
        <div className="mt-4 p-3 bg-gray-100 rounded">
          <p className="text-sm font-mono">
            {JSON.stringify(userPreferences, null, 2)}
          </p>
        </div>
      </div>

      {/* Direct CookieService Usage */}
      <div className="border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Direct CookieService Usage</h2>
        <div className="flex gap-4">
          <button
            onClick={handleSetSessionData}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Set Session Data
          </button>
          <button
            onClick={handleClearSessionData}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Clear Session Data
          </button>
        </div>
        
        <div className="mt-4">
          <h3 className="font-semibold mb-2">All Cookies:</h3>
          <div className="p-3 bg-gray-100 rounded text-sm font-mono">
            {Object.entries(CookieService.getAll()).map(([name, value]) => (
              <div key={name}>
                <strong>{name}:</strong> {value}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cookie Settings */}
      <div className="border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Cookie Settings</h2>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {showSettings ? 'Hide Settings' : 'Show Cookie Settings'}
        </button>
        
        {showSettings && (
          <div className="mt-4">
            <CookieSettings />
          </div>
        )}
      </div>

      {/* Cookie Consent Banner */}
      <CookieConsentBanner
        onAccept={handleCookieConsent}
        onDecline={() => alert('Cookies declined')}
        showPreferences={true}
      />
    </div>
  );
}

export default CookieExample; 