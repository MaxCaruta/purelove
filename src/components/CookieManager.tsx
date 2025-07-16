import { useState, useEffect } from 'react';

interface CookieOptions {
  expires?: Date | number; // Date object or days from now
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  httpOnly?: boolean; // Note: httpOnly can only be set server-side
}

interface CookieConsent {
  analytics: boolean;
  marketing: boolean;
  necessary: boolean;
  preferences: boolean;
}

export class CookieService {
  /**
   * Set a cookie with the given name, value, and options
   */
  static set(name: string, value: string, options: CookieOptions = {}): void {
    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

    if (options.expires) {
      let expires: Date;
      if (typeof options.expires === 'number') {
        expires = new Date();
        expires.setTime(expires.getTime() + options.expires * 24 * 60 * 60 * 1000);
      } else {
        expires = options.expires;
      }
      cookieString += `; expires=${expires.toUTCString()}`;
    }

    if (options.path) {
      cookieString += `; path=${options.path}`;
    }

    if (options.domain) {
      cookieString += `; domain=${options.domain}`;
    }

    if (options.secure) {
      cookieString += '; secure';
    }

    if (options.sameSite) {
      cookieString += `; samesite=${options.sameSite}`;
    }

    document.cookie = cookieString;
  }

  /**
   * Get a cookie value by name
   */
  static get(name: string): string | null {
    const nameEQ = encodeURIComponent(name) + '=';
    const cookies = document.cookie.split(';');
    
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.indexOf(nameEQ) === 0) {
        return decodeURIComponent(cookie.substring(nameEQ.length));
      }
    }
    
    return null;
  }

  /**
   * Delete a cookie by setting its expiration to the past
   */
  static delete(name: string, options: CookieOptions = {}): void {
    this.set(name, '', { ...options, expires: new Date(0) });
  }

  /**
   * Check if a cookie exists
   */
  static exists(name: string): boolean {
    return this.get(name) !== null;
  }

  /**
   * Get all cookies as an object
   */
  static getAll(): Record<string, string> {
    const cookies: Record<string, string> = {};
    const cookieList = document.cookie.split(';');
    
    for (let cookie of cookieList) {
      cookie = cookie.trim();
      const [name, value] = cookie.split('=');
      if (name && value) {
        cookies[decodeURIComponent(name)] = decodeURIComponent(value);
      }
    }
    
    return cookies;
  }

  /**
   * Clear all cookies
   */
  static clearAll(): void {
    const cookies = this.getAll();
    Object.keys(cookies).forEach(name => {
      this.delete(name);
    });
  }

  /**
   * Set a JSON cookie (automatically stringifies the value)
   */
  static setJSON(name: string, value: any, options: CookieOptions = {}): void {
    this.set(name, JSON.stringify(value), options);
  }

  /**
   * Get a JSON cookie (automatically parses the value)
   */
  static getJSON<T = any>(name: string): T | null {
    const value = this.get(name);
    if (value === null) return null;
    
    try {
      return JSON.parse(value);
    } catch (error) {
      console.error(`Error parsing JSON cookie ${name}:`, error);
      return null;
    }
  }

  /**
   * Check if user has given cookie consent
   */
  static hasConsent(): boolean {
    return this.exists('cookie-consent');
  }

  /**
   * Get current cookie consent
   */
  static getConsent(): CookieConsent | null {
    return this.getJSON<CookieConsent>('cookie-consent');
  }
}

// React Hook for cookies
export function useCookie(name: string, defaultValue?: string) {
  const [value, setValue] = useState<string | null>(() => {
    return CookieService.get(name) || defaultValue || null;
  });

  const updateValue = (newValue: string, options?: CookieOptions) => {
    CookieService.set(name, newValue, options);
    setValue(newValue);
  };

  const deleteValue = (options?: CookieOptions) => {
    CookieService.delete(name, options);
    setValue(null);
  };

  return [value, updateValue, deleteValue] as const;
}

// React Hook for JSON cookies
export function useJSONCookie<T = any>(name: string, defaultValue?: T) {
  const [value, setValue] = useState<T | null>(() => {
    return CookieService.getJSON<T>(name) || defaultValue || null;
  });

  const updateValue = (newValue: T, options?: CookieOptions) => {
    CookieService.setJSON(name, newValue, options);
    setValue(newValue);
  };

  const deleteValue = (options?: CookieOptions) => {
    CookieService.delete(name, options);
    setValue(null);
  };

  return [value, updateValue, deleteValue] as const;
}

// Cookie Consent Component
interface CookieConsentProps {
  onAccept: (consent: CookieConsent) => void;
  onDecline?: () => void;
  showPreferences?: boolean;
  className?: string;
  forceShow?: boolean; // Force show even if consent already given
}

export function CookieConsentBanner({ 
  onAccept, 
  onDecline, 
  showPreferences = false,
  className = '',
  forceShow = false
}: CookieConsentProps) {
  const [showBanner, setShowBanner] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const [consent, setConsent] = useState<CookieConsent>({
    necessary: true, // Always true
    analytics: false,
    marketing: false,
    preferences: false
  });

  useEffect(() => {
    // Check if user has already made a choice
    const hasConsent = CookieService.hasConsent();
    if (!hasConsent || forceShow) {
      setShowBanner(true);
    }
  }, [forceShow]);

  const handleAcceptAll = () => {
    const fullConsent: CookieConsent = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true
    };
    
    CookieService.setJSON('cookie-consent', fullConsent, { expires: 365 });
    onAccept(fullConsent);
    setShowBanner(false);
  };

  const handleAcceptSelected = () => {
    CookieService.setJSON('cookie-consent', consent, { expires: 365 });
    onAccept(consent);
    setShowBanner(false);
  };

  const handleDecline = () => {
    const minimalConsent: CookieConsent = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false
    };
    
    CookieService.setJSON('cookie-consent', minimalConsent, { expires: 365 });
    onDecline?.();
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50 ${className}`}>
      <div className="bg-white rounded-t-lg shadow-2xl w-full max-w-4xl mx-4 mb-0">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  We value your privacy
                </h3>
              </div>
              
              <p className="text-gray-600 mb-4 leading-relaxed">
                We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. 
                By clicking "Accept All", you consent to our use of cookies. You can customize your preferences below.
              </p>
              
              {showPrefs && (
                <div className="space-y-4 mb-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Necessary Cookies</label>
                      <p className="text-xs text-gray-500">Required for the website to function properly</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={consent.necessary}
                      disabled
                      className="rounded border-gray-300"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Analytics Cookies</label>
                      <p className="text-xs text-gray-500">Help us understand how visitors interact with our website</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={consent.analytics}
                      onChange={(e) => setConsent(prev => ({ ...prev, analytics: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Marketing Cookies</label>
                      <p className="text-xs text-gray-500">Used to deliver personalized advertisements</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={consent.marketing}
                      onChange={(e) => setConsent(prev => ({ ...prev, marketing: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Preference Cookies</label>
                      <p className="text-xs text-gray-500">Remember your settings and preferences</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={consent.preferences}
                      onChange={(e) => setConsent(prev => ({ ...prev, preferences: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
            {showPreferences && (
              <button
                onClick={() => setShowPrefs(!showPrefs)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50"
              >
                {showPrefs ? 'Hide Preferences' : 'Customize Cookies'}
              </button>
            )}
            
            <button
              onClick={handleDecline}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50"
            >
              Decline All
            </button>
            
            {showPrefs ? (
              <button
                onClick={handleAcceptSelected}
                className="px-6 py-2 text-sm bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded font-medium transition-all duration-200"
              >
                Accept Selected
              </button>
            ) : (
              <button
                onClick={handleAcceptAll}
                className="px-6 py-2 text-sm bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded font-medium transition-all duration-200"
              >
                Accept All Cookies
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Cookie Settings Component
export function CookieSettings() {
  const [consent, setConsent] = useState<CookieConsent>(() => {
    return CookieService.getConsent() || {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false
    };
  });

  const handleSave = () => {
    CookieService.setJSON('cookie-consent', consent, { expires: 365 });
    alert('Cookie preferences saved!');
  };

  const handleReset = () => {
    CookieService.delete('cookie-consent');
    setConsent({
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false
    });
    alert('Cookie preferences reset!');
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Cookie Settings</h2>
      
      <div className="space-y-6">
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Necessary Cookies</h3>
              <p className="text-sm text-gray-600">Required for the website to function properly</p>
            </div>
            <input
              type="checkbox"
              checked={consent.necessary}
              disabled
              className="rounded border-gray-300"
            />
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Analytics Cookies</h3>
              <p className="text-sm text-gray-600">Help us understand how visitors interact with our website</p>
            </div>
            <input
              type="checkbox"
              checked={consent.analytics}
              onChange={(e) => setConsent(prev => ({ ...prev, analytics: e.target.checked }))}
              className="rounded border-gray-300"
            />
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Marketing Cookies</h3>
              <p className="text-sm text-gray-600">Used to deliver personalized advertisements</p>
            </div>
            <input
              type="checkbox"
              checked={consent.marketing}
              onChange={(e) => setConsent(prev => ({ ...prev, marketing: e.target.checked }))}
              className="rounded border-gray-300"
            />
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Preference Cookies</h3>
              <p className="text-sm text-gray-600">Remember your settings and preferences</p>
            </div>
            <input
              type="checkbox"
              checked={consent.preferences}
              onChange={(e) => setConsent(prev => ({ ...prev, preferences: e.target.checked }))}
              className="rounded border-gray-300"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-4 mt-6">
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded hover:shadow-lg transition-all duration-200"
        >
          Save Preferences
        </button>
        <button
          onClick={handleReset}
          className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Reset to Default
        </button>
      </div>
    </div>
  );
}

// Hook to check if consent is needed
export function useCookieConsent() {
  const [hasConsent, setHasConsent] = useState(() => CookieService.hasConsent());
  const [consent, setConsent] = useState<CookieConsent | null>(() => CookieService.getConsent());

  const updateConsent = (newConsent: CookieConsent) => {
    CookieService.setJSON('cookie-consent', newConsent, { expires: 365 });
    setConsent(newConsent);
    setHasConsent(true);
  };

  const clearConsent = () => {
    CookieService.delete('cookie-consent');
    setConsent(null);
    setHasConsent(false);
  };

  return {
    hasConsent,
    consent,
    updateConsent,
    clearConsent
  };
}

export default CookieService; 