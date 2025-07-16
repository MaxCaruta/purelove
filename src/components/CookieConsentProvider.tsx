import React, { useEffect, useState } from 'react';
import { CookieConsentBanner, CookieService, useCookieConsent } from './CookieManager';

interface CookieConsentProviderProps {
  children: React.ReactNode;
  showPreferences?: boolean;
  onConsentChange?: (consent: any) => void;
}

export function CookieConsentProvider({ 
  children, 
  showPreferences = true,
  onConsentChange 
}: CookieConsentProviderProps) {
  const { hasConsent, consent, updateConsent } = useCookieConsent();
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Show banner if user hasn't given consent
    if (!hasConsent) {
      setShowBanner(true);
    }
  }, [hasConsent]);

  const handleAccept = (newConsent: any) => {
    updateConsent(newConsent);
    setShowBanner(false);
    onConsentChange?.(newConsent);
  };

  const handleDecline = () => {
    const minimalConsent = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false
    };
    updateConsent(minimalConsent);
    setShowBanner(false);
    onConsentChange?.(minimalConsent);
  };

  return (
    <>
      {children}
      
      {showBanner && (
        <CookieConsentBanner
          onAccept={handleAccept}
          onDecline={handleDecline}
          showPreferences={showPreferences}
        />
      )}
    </>
  );
}

// Hook to check if cookies are allowed based on consent
export function useCookiePermission() {
  const { consent } = useCookieConsent();
  
  return {
    canUseAnalytics: consent?.analytics ?? false,
    canUseMarketing: consent?.marketing ?? false,
    canUsePreferences: consent?.preferences ?? false,
    canUseNecessary: consent?.necessary ?? true,
    hasConsent: consent !== null
  };
}

// Component to conditionally render based on cookie consent
interface ConditionalCookieContentProps {
  children: React.ReactNode;
  type: 'analytics' | 'marketing' | 'preferences' | 'necessary';
  fallback?: React.ReactNode;
}

export function ConditionalCookieContent({ 
  children, 
  type, 
  fallback 
}: ConditionalCookieContentProps) {
  const permissions = useCookiePermission();
  
  const isAllowed = (() => {
    switch (type) {
      case 'analytics':
        return permissions.canUseAnalytics;
      case 'marketing':
        return permissions.canUseMarketing;
      case 'preferences':
        return permissions.canUsePreferences;
      case 'necessary':
        return permissions.canUseNecessary;
      default:
        return false;
    }
  })();

  if (!isAllowed) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
}

export default CookieConsentProvider; 