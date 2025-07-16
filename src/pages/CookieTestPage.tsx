import React, { useState } from 'react';
import { 
  CookieService, 
  useCookie, 
  useJSONCookie, 
  CookieConsentBanner,
  CookieSettings 
} from '../components/CookieManager';
import { 
  CookieConsentProvider, 
  ConditionalCookieContent, 
  useCookiePermission 
} from '../components/CookieConsentProvider';

export function CookieTestPage() {
  const [showSettings, setShowSettings] = useState(false);
  const [forceShowBanner, setForceShowBanner] = useState(false);
  
  // Example using the useCookie hook
  const [theme, setTheme, deleteTheme] = useCookie('theme', 'light');
  
  // Example using the useJSONCookie hook
  const [userPreferences, setUserPreferences, deleteUserPreferences] = useJSONCookie('user-preferences', {
    language: 'en',
    notifications: true,
    autoSave: false
  });

  const permissions = useCookiePermission();

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

  const clearAllConsent = () => {
    CookieService.delete('cookie-consent');
    setForceShowBanner(true);
    alert('Cookie consent cleared! Refresh the page to see the banner again.');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Cookie Consent Test</h1>
          <p className="text-gray-600 mb-8">
            This page demonstrates the cookie consent functionality. Try different actions to see how it works.
          </p>
        </div>

        {/* Current Consent Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Current Consent Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${permissions.hasConsent ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <p className="text-sm font-medium">Has Consent</p>
              <p className="text-xs text-gray-500">{permissions.hasConsent ? 'Yes' : 'No'}</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${permissions.canUseAnalytics ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <p className="text-sm font-medium">Analytics</p>
              <p className="text-xs text-gray-500">{permissions.canUseAnalytics ? 'Allowed' : 'Blocked'}</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${permissions.canUseMarketing ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <p className="text-sm font-medium">Marketing</p>
              <p className="text-xs text-gray-500">{permissions.canUseMarketing ? 'Allowed' : 'Blocked'}</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${permissions.canUsePreferences ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <p className="text-sm font-medium">Preferences</p>
              <p className="text-xs text-gray-500">{permissions.canUsePreferences ? 'Allowed' : 'Blocked'}</p>
            </div>
          </div>
        </div>

        {/* Conditional Content Examples */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Conditional Content Examples</h2>
          
          <ConditionalCookieContent type="analytics">
            <div className="p-4 bg-green-100 border border-green-300 rounded mb-4">
              <h3 className="font-medium text-green-800">Analytics Content</h3>
              <p className="text-green-700 text-sm">This content is only shown if analytics cookies are allowed.</p>
            </div>
          </ConditionalCookieContent>

          <ConditionalCookieContent type="marketing">
            <div className="p-4 bg-blue-100 border border-blue-300 rounded mb-4">
              <h3 className="font-medium text-blue-800">Marketing Content</h3>
              <p className="text-blue-700 text-sm">This content is only shown if marketing cookies are allowed.</p>
            </div>
          </ConditionalCookieContent>

          <ConditionalCookieContent type="preferences">
            <div className="p-4 bg-purple-100 border border-purple-300 rounded mb-4">
              <h3 className="font-medium text-purple-800">Preferences Content</h3>
              <p className="text-purple-700 text-sm">This content is only shown if preference cookies are allowed.</p>
            </div>
          </ConditionalCookieContent>

          <ConditionalCookieContent type="analytics" fallback={
            <div className="p-4 bg-gray-100 border border-gray-300 rounded mb-4">
              <h3 className="font-medium text-gray-800">Analytics Blocked</h3>
              <p className="text-gray-700 text-sm">Analytics cookies are not allowed. Please enable them in settings.</p>
            </div>
          }>
            <div className="p-4 bg-green-100 border border-green-300 rounded mb-4">
              <h3 className="font-medium text-green-800">Analytics Active</h3>
              <p className="text-green-700 text-sm">Analytics are running and collecting data.</p>
            </div>
          </ConditionalCookieContent>
        </div>

        {/* Theme Selection */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Theme Selection (useCookie hook)</h2>
          <div className="flex gap-4 items-center">
            <button
              onClick={() => setTheme('light', { expires: 30 })}
              className={`px-4 py-2 rounded ${theme === 'light' ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white' : 'bg-gray-200'}`}
            >
              Light Theme
            </button>
            <button
              onClick={() => setTheme('dark', { expires: 30 })}
              className={`px-4 py-2 rounded ${theme === 'dark' ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white' : 'bg-gray-200'}`}
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
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">User Preferences (useJSONCookie hook)</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={userPreferences?.notifications || false}
                  onChange={(e) => handleUpdateNotifications(e.target.checked)}
                  className="rounded border-gray-300 focus:ring-rose-500 focus:ring-2"
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
                  className="rounded border-gray-300 focus:ring-rose-500 focus:ring-2"
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
                  className="border rounded px-2 py-1 focus:ring-rose-500 focus:border-rose-500"
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
        <div className="bg-white rounded-lg shadow p-6">
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
            <div className="p-3 bg-gray-100 rounded text-sm font-mono max-h-40 overflow-y-auto">
              {Object.entries(CookieService.getAll()).map(([name, value]) => (
                <div key={name}>
                  <strong>{name}:</strong> {value}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cookie Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Cookie Settings</h2>
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded hover:shadow-lg transition-all duration-200"
            >
              {showSettings ? 'Hide Settings' : 'Show Cookie Settings'}
            </button>
            <button
              onClick={clearAllConsent}
              className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
            >
              Clear All Consent
            </button>
          </div>
          
          {showSettings && (
            <div className="mt-4">
              <CookieSettings />
            </div>
          )}
        </div>

        {/* Force Show Banner */}
        {forceShowBanner && (
          <CookieConsentBanner
            onAccept={handleCookieConsent}
            onDecline={() => {
              setForceShowBanner(false);
              alert('Cookies declined');
            }}
            showPreferences={true}
            forceShow={true}
          />
        )}
      </div>
    </div>
  );
}

export default CookieTestPage; 