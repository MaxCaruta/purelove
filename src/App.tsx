import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { HomePage } from './pages/HomePage';
import { BrowsePage } from './pages/BrowsePage';
import { ProfilePage } from './pages/ProfilePage';
import { EditProfilePage } from './pages/EditProfilePage';

import { PricingPage } from './pages/PricingPage';
import CheckoutPage from './pages/CheckoutPage';
import { LoginPage, SignupPage } from './pages/AuthPages';
import { BlogPage, BlogPostPage } from './pages/BlogPage';
import { SettingsPage } from './pages/SettingsPage';
import { AuthProvider } from './context/AuthContext';
import { ChatProvider, useChat } from './context/ChatContext';
import { MessageNotificationProvider } from './context/MessageNotificationContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ScrollToTop } from './components/ScrollToTop';
import { ChatWindow } from './components/ChatWindow';
import { supabase } from './lib/supabase';
import SuccessPage from './pages/SuccessPage';
import BillingPage from './pages/BillingPage';
import DashboardPage from './pages/DashboardPage';
import { CookieConsentProvider } from './components/CookieConsentProvider';
import CookieTestPage from './pages/CookieTestPage';
import { SuccessStoriesPage } from './pages/SuccessStoriesPage';
import { AboutPage } from './pages/AboutPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { SafetyPage } from './pages/SafetyPage';
import { FAQPage } from './pages/FAQPage';
import { ContactPage } from './pages/ContactPage';
import { TermsPage } from './pages/TermsPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { CookiePolicyPage } from './pages/CookiePolicyPage';
import { IMBRAPage } from './pages/IMBRAPage';
import { AntiScamPage } from './pages/AntiScamPage';
import AdminPage from './pages/AdminPage';
import DatabaseDebugPage from './pages/DatabaseDebugPage';
import { NotificationTestPage } from './pages/NotificationTestPage';
import { NotFoundPage } from './pages/404Page';

// Simple Cancel Page Component
const CancelPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4 text-center">
        <div className="bg-red-100 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="h-12 w-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Cancelled</h1>
        <p className="text-gray-600 mb-6">Your payment was cancelled. No charges were made.</p>
        <div className="space-y-3">
          <button
                            onClick={() => window.location.href = '/pricing'}
            className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white py-3 rounded-lg hover:from-rose-600 hover:to-pink-600 transition-all duration-300 font-medium"
          >
            Try Again
          </button>
          <button
                            onClick={() => window.location.href = '/dashboard'}
            className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-all duration-300 font-medium"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

// Component to handle ChatWindow rendering
const ChatWindowRenderer = () => {
  const { showChatWindow, chatProfile, closeChat } = useChat();
  
  if (!showChatWindow || !chatProfile) return null;
  
  return (
    <ChatWindow
      profile={chatProfile}
      isOpen={showChatWindow}
      onClose={closeChat}
    />
  );
};

const App = () => {
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);

  useEffect(() => {
    // Check if Supabase connection is working
    const checkConnection = () => {
      // Quick check of environment variables
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'https://example.supabase.co') {
        setIsSupabaseConnected(false);
      } else {
        setIsSupabaseConnected(true);
      }
    };

    checkConnection();
  }, []);

  const handleCookieConsent = (consent: any) => {
    console.log('Cookie consent updated:', consent);
    // You can add analytics initialization here based on consent
    if (consent.analytics) {
      // Initialize analytics
      console.log('Analytics enabled');
    }
    if (consent.marketing) {
      // Initialize marketing cookies
      console.log('Marketing cookies enabled');
    }
  };

  return (
    <CookieConsentProvider onConsentChange={handleCookieConsent}>
    <AuthProvider>
        <ChatProvider>
          <MessageNotificationProvider>
          <Router>
        <ScrollToTop />
        {!isSupabaseConnected && (
          <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-700 p-4 fixed top-0 left-0 right-0 z-50">
            <p className="font-medium">Supabase connection not established. Using mock data.</p>
            <p className="text-sm">To connect to Supabase, update your .env file with valid credentials.</p>
          </div>
        )}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/browse" element={<BrowsePage />} />
          <Route path="/profile/:id" element={<ProfilePage />} />

          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              } />
          <Route path="/edit-profile" element={
            <ProtectedRoute>
              <EditProfilePage />
            </ProtectedRoute>
          } />
                        <Route path="/billing" element={
            <ProtectedRoute>
              <BillingPage />
            </ProtectedRoute>
          } />
              <Route path="/admin" element={
                <ProtectedRoute>
                  <AdminPage />
                </ProtectedRoute>
              } />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/success" element={<SuccessPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/success-stories" element={<SuccessStoriesPage />} />
              <Route path="/safety" element={<SafetyPage />} />
              <Route path="/anti-scam" element={<AntiScamPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/imbra" element={<IMBRAPage />} />
              <Route path="/cookie-policy" element={<CookiePolicyPage />} />
              <Route path="/cookie-test" element={<CookieTestPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<SignupPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/debug" element={<DatabaseDebugPage />} />
              <Route path="/notifications-test" element={<NotificationTestPage />} />
              <Route path="*" element={<NotFoundPage />} />
        </Routes>
            
            {/* Global Chat Window */}
            <ChatWindowRenderer />
      </Router>
          </MessageNotificationProvider>
        </ChatProvider>
    </AuthProvider>
    </CookieConsentProvider>
  );
};

export default App;
