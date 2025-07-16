import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@/types';
import { getCurrentUser, signIn, signOut, signUp, updateProfile, uploadProfilePhoto, checkStoredSession, testStorageAccess } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  isAdmin: boolean;
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<{ error: any }>;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  updateProfile: (profileData: Partial<User>) => Promise<{ error: any }>;
  uploadProfilePhoto: (file: File) => Promise<{ url: string | null, error: any }>;
  updateCoins: (amount: number) => Promise<{ error: any }>;
  testStorageAccess: () => Promise<{ success: boolean, error: string | null, buckets: string[] }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [isCheckingUser, setIsCheckingUser] = useState(false); // Prevent duplicate calls

  // Track network status
  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 [AUTH_CONTEXT] Network is back online');
      setIsOnline(true);
      // Retry auth when coming back online if not initialized
      if (!authInitialized && !user && !isCheckingUser) {
        console.log('🔄 [AUTH_CONTEXT] Retrying auth after reconnection...');
        checkUser();
      }
    };
    
    const handleOffline = () => {
      console.log('📴 [AUTH_CONTEXT] Network went offline');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [authInitialized, user, isCheckingUser]);

  const checkUser = async () => {
    // Prevent multiple simultaneous calls
    if (isCheckingUser) {
      console.log('⚠️ [AUTH_CONTEXT] CheckUser already in progress, skipping...');
          return;
        }
        
    if (!isOnline && !authInitialized) {
      console.log('📴 [AUTH_CONTEXT] Offline and not initialized, checking local session...');
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          console.log('✅ [AUTH_CONTEXT] Found cached session while offline');
          // Create basic user from session
          const basicUser: User = {
              id: session.user.id,
              email: session.user.email || '',
              firstName: session.user.user_metadata?.first_name || '',
              lastName: session.user.user_metadata?.last_name || '',
              gender: session.user.user_metadata?.gender || 'male',
              birthDate: session.user.user_metadata?.birth_date || '',
              country: session.user.user_metadata?.country || '',
              city: session.user.user_metadata?.city || '',
              bio: '',
              interests: [],
              profession: '',
              languages: [],
              photos: [],
              verified: false,
              premium: false,
              coins: 0,
              role: 'user',
              createdAt: session.user.created_at || '',
              chatSubscription: undefined,
            };
          setUser(basicUser);
          setAuthInitialized(true);
        }
      } catch (error) {
        console.warn('⚠️ [AUTH_CONTEXT] Error checking offline session:', error);
      }
      setLoading(false);
            return;
          }

    console.log('🔍 [AUTH_CONTEXT] Starting user check...');
    setIsCheckingUser(true); // Set flag to prevent duplicates
    
    try {
      // Quick session check first
      const { data: sessionData } = await supabase.auth.getSession();
      console.log('🔍 [AUTH_CONTEXT] Supabase session result:', {
        hasSession: !!sessionData.session,
        hasUser: !!sessionData.session?.user,
        sessionError: !!sessionData.session?.access_token,
        userEmail: sessionData.session?.user?.email
      });

      if (!sessionData.session) {
        console.log('❌ [AUTH_CONTEXT] No active session found');
        setUser(null);
        setAuthInitialized(true);
        setLoading(false);
        return;
      }

      // Session exists, try to get full user data
      console.log('✅ [AUTH_CONTEXT] Active session found for user:', sessionData.session.user.email);
      console.log('🔍 [AUTH_CONTEXT] Getting user data...');
      
      // First set basic user immediately to improve perceived performance
      const basicUser: User = {
        id: sessionData.session.user.id,
        email: sessionData.session.user.email || '',
        firstName: sessionData.session.user.user_metadata?.first_name || '',
        lastName: sessionData.session.user.user_metadata?.last_name || '',
        gender: sessionData.session.user.user_metadata?.gender || 'male',
        birthDate: sessionData.session.user.user_metadata?.birth_date || '',
        country: sessionData.session.user.user_metadata?.country || '',
        city: sessionData.session.user.user_metadata?.city || '',
        bio: '',
        interests: [],
        profession: '',
        languages: [],
        photos: [],
        verified: false,
        premium: false,
        coins: 0,
        role: 'user',
        createdAt: sessionData.session.user.created_at || '',
        chatSubscription: undefined,
      };
      
      // Set basic user immediately for faster UX
      setUser(basicUser);
      setAuthInitialized(true);
      setLoading(false);
      
      // Then try to enhance with profile data in the background
      try {
        const { user: authUser, profile, error: userError } = await getCurrentUser();
        
        if (!userError && profile) {
          // Enhance the user data with profile information
          const enhancedUser: User = {
            id: authUser.id,
            email: authUser.email || '',
            firstName: profile.first_name || authUser.user_metadata?.first_name || '',
            lastName: profile.last_name || authUser.user_metadata?.last_name || '',
            gender: profile.gender || authUser.user_metadata?.gender || 'male',
            birthDate: profile.birth_date || authUser.user_metadata?.birth_date || '',
            country: profile.country || authUser.user_metadata?.country || '',
            city: profile.city || authUser.user_metadata?.city || '',
            bio: profile.bio || '',
            interests: profile.interests || [],
            profession: profile.profession || '',
            languages: profile.languages || [],
            photos: profile.photos || [],
            verified: profile.verified || false,
            premium: profile.premium || false,
            coins: profile.coins || 0,
            role: profile.role || 'user',
            createdAt: profile.created_at || authUser.created_at || '',
            chatSubscription: profile.chat_subscription || undefined,
          };
          
          console.log('✅ [AUTH_CONTEXT] Enhanced user data with profile:', enhancedUser.email);
          setUser(enhancedUser);
        } else {
          console.log('⚠️ [AUTH_CONTEXT] Using basic user data due to profile error:', userError?.message);
        }
      } catch (profileError) {
        console.warn('⚠️ [AUTH_CONTEXT] Profile enhancement failed:', profileError);
        // Keep the basic user data, no need to change anything
      }
      
    } catch (error) {
      console.error('❌ [AUTH_CONTEXT] Error in checkUser:', error);
      
      // Try one more fallback with just session data
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          console.log('✅ [AUTH_CONTEXT] Emergency fallback to session data');
          const emergencyUser: User = {
            id: session.user.id,
            email: session.user.email || '',
            firstName: session.user.user_metadata?.first_name || '',
            lastName: session.user.user_metadata?.last_name || '',
            gender: session.user.user_metadata?.gender || 'male',
            birthDate: session.user.user_metadata?.birth_date || '',
            country: session.user.user_metadata?.country || '',
            city: session.user.user_metadata?.city || '',
            bio: '',
            interests: [],
            profession: '',
            languages: [],
            photos: [],
            verified: false,
            premium: false,
            coins: 0,
            role: 'user',
            createdAt: session.user.created_at || '',
            chatSubscription: undefined,
          };
          setUser(emergencyUser);
        } else {
          setUser(null);
        }
      } catch (fallbackError) {
        console.error('❌ [AUTH_CONTEXT] Emergency fallback failed:', fallbackError);
        setUser(null);
      }
      
      setAuthInitialized(true);
      setLoading(false);
      setError(error as Error);
    } finally {
      setIsCheckingUser(false); // Clear flag
      }
    };

  // Initial auth check - only run once
  useEffect(() => {
    if (!authInitialized) {
    checkUser();
    }
  }, [authInitialized]);

  // Set up auth state listener with improved error handling
  useEffect(() => {
    if (!authInitialized) return; // Wait for initial check

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔔 [AUTH_LISTENER] Auth state changed:', event);
      console.log('👤 [AUTH_LISTENER] Session user present:', !!session?.user);
      
      // Debounce rapid auth state changes
      if (loading) {
        console.log('⚠️ [AUTH_LISTENER] Still loading, ignoring rapid auth change');
        return;
      }
      
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('✅ [AUTH_LISTENER] User signed in');
        console.log('👤 [AUTH_LISTENER] User ID:', session.user.id);
        console.log('📧 [AUTH_LISTENER] User email:', session.user.email);
        
        // Avoid refetching if we already have this user
        if (user?.id === session.user.id) {
          console.log('🔄 [AUTH_LISTENER] Same user already loaded, skipping refetch');
          return;
        }
        
        // Get full user data including profile with timeout
        try {
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Auth listener timeout')), 3000)
          );
          
          const getUserPromise = getCurrentUser();
          const result = await Promise.race([getUserPromise, timeoutPromise]);
          const { user: authUser, profile, error } = result as any;
        
          if (authUser) {
          const userData: User = {
              id: authUser.id,
              email: authUser.email || '',
              firstName: profile?.first_name || authUser.user_metadata?.first_name || '',
              lastName: profile?.last_name || authUser.user_metadata?.last_name || '',
              gender: profile?.gender || authUser.user_metadata?.gender || 'male',
              birthDate: profile?.birth_date || authUser.user_metadata?.birth_date || '',
              country: profile?.country || authUser.user_metadata?.country || '',
              city: profile?.city || authUser.user_metadata?.city || '',
            bio: profile?.bio || '',
            interests: profile?.interests || [],
            profession: profile?.profession || '',
            languages: profile?.languages || [],
            photos: profile?.photos || [],
            verified: profile?.verified || false,
            premium: profile?.premium || false,
            coins: profile?.coins || 0,
            role: profile?.role || 'user',
              createdAt: profile?.created_at || authUser.created_at || '',
            chatSubscription: profile?.chat_subscription || undefined,
          };
          
          console.log('👤 [AUTH_LISTENER] Setting user state from session:', userData.email);
          setUser(userData);
          console.log('✅ [AUTH_LISTENER] User state set successfully');
          } else {
            // Fallback to session data
            const basicUser: User = {
              id: session.user.id,
              email: session.user.email || '',
              firstName: session.user.user_metadata?.first_name || '',
              lastName: session.user.user_metadata?.last_name || '',
              gender: session.user.user_metadata?.gender || 'male',
              birthDate: session.user.user_metadata?.birth_date || '',
              country: session.user.user_metadata?.country || '',
              city: session.user.user_metadata?.city || '',
              bio: '',
              interests: [],
              profession: '',
              languages: [],
              photos: [],
              verified: false,
              premium: false,
              coins: 0,
              role: 'user',
              createdAt: session.user.created_at || '',
              chatSubscription: undefined,
            };
            setUser(basicUser);
          }
        } catch (timeoutError) {
          console.warn('⚠️ [AUTH_LISTENER] Timeout getting user data, using session fallback');
          const basicUser: User = {
            id: session.user.id,
            email: session.user.email || '',
            firstName: session.user.user_metadata?.first_name || '',
            lastName: session.user.user_metadata?.last_name || '',
            gender: session.user.user_metadata?.gender || 'male',
            birthDate: session.user.user_metadata?.birth_date || '',
            country: session.user.user_metadata?.country || '',
            city: session.user.user_metadata?.city || '',
            bio: '',
            interests: [],
            profession: '',
            languages: [],
            photos: [],
            verified: false,
            premium: false,
            coins: 0,
            role: 'user',
            createdAt: session.user.created_at || '',
            chatSubscription: undefined,
          };
          setUser(basicUser);
        }
        
      } else if (event === 'SIGNED_OUT') {
        console.log('👋 [AUTH_LISTENER] User signed out');
        setUser(null);
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        console.log('🔄 [AUTH_LISTENER] Token refreshed');
        // Only refresh if user data seems stale or incomplete
        if (!user || user.id !== session.user.id) {
          console.log('🔄 [AUTH_LISTENER] Refreshing user data after token refresh');
          checkUser();
        }
      }
    });

    // Reduced session refresh interval and added connection check
    const sessionRefreshInterval = setInterval(async () => {
      if (!isOnline) {
        console.log('📴 [SESSION_REFRESH] Offline, skipping session check');
        return;
      }
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session && user) {
          console.log('⚠️ [SESSION_REFRESH] Session lost, clearing user');
          setUser(null);
        }
      } catch (error) {
        console.warn('⚠️ [SESSION_REFRESH] Error checking session:', error);
      }
    }, 10 * 60 * 1000); // Check every 10 minutes instead of 5

    // Refresh session when user returns to the tab (only if online)
    const handleWindowFocus = async () => {
      if (!isOnline) {
        console.log('📴 [WINDOW_FOCUS] Offline, skipping focus check');
        return;
      }
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session && user) {
          console.log('🔄 [WINDOW_FOCUS] Session lost on tab return, clearing user');
          setUser(null);
        }
      } catch (error) {
        console.warn('⚠️ [WINDOW_FOCUS] Error checking session on focus:', error);
      }
    };

    window.addEventListener('focus', handleWindowFocus);

    return () => {
      authListener.subscription.unsubscribe();
      clearInterval(sessionRefreshInterval);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [authInitialized, loading, user?.id, isOnline]); // Add dependencies to prevent stale closures

  const handleSignUp = async (email: string, password: string, userData: Partial<User>) => {
    try {
      setLoading(true);
      const { error } = await signUp(email, password, userData);
      
      if (error) {
        console.error('Sign up error in context:', error);
        // Check if it's a database error and provide a helpful message
        if (error && typeof error === 'object' && 'message' in error && 
            typeof error.message === 'string' && error.message.includes('Database error')) {
          return { 
            error: new Error('Database setup issue. Please contact support or try again later.') 
          };
        }
      return { error };
      }
      
      return { error: null };
    } catch (err) {
      console.error('Error in sign up:', err);
      setError(err as Error);
      return { error: err };
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (email: string, password: string, rememberMe: boolean = true) => {
    console.log('🏁 [CONTEXT] handleSignIn called');
    console.log('📧 [CONTEXT] Email:', email);
    console.log('🔐 [CONTEXT] Remember me:', rememberMe);
    
    // Prevent duplicate calls
    if (loading) {
      console.log('⚠️ [CONTEXT] Already loading, ignoring duplicate call');
      return { error: new Error('Login already in progress') };
    }
    
    try {
      console.log('⏳ [CONTEXT] Setting loading to true...');
      setLoading(true);
      
      console.log('🔄 [CONTEXT] Calling signIn function...');
      const { error } = await signIn(email, password, rememberMe);
      
      console.log('✅ [CONTEXT] signIn function returned');
      console.log('❌ [CONTEXT] Error present:', !!error);
      
      if (error) {
        console.log('❌ [CONTEXT] SignIn error details:', error);
      } else {
        console.log('✅ [CONTEXT] SignIn successful, updating user state...');
        // After successful login, get the current session and update user state
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            console.log('✅ [CONTEXT] Session found after login, creating user object...');
            const basicUser: User = {
              id: session.user.id,
              email: session.user.email || '',
              firstName: session.user.user_metadata?.first_name || '',
              lastName: session.user.user_metadata?.last_name || '',
              gender: session.user.user_metadata?.gender || 'male',
              birthDate: session.user.user_metadata?.birth_date || '',
              country: session.user.user_metadata?.country || '',
              city: session.user.user_metadata?.city || '',
              bio: '',
              interests: [],
              profession: '',
              languages: [],
              photos: [],
              verified: false,
              premium: false,
              coins: 0,
              role: 'user',
              createdAt: session.user.created_at || '',
              chatSubscription: undefined,
            };
            setUser(basicUser);
            setAuthInitialized(true);
            console.log('✅ [CONTEXT] User state updated after login');
          }
        } catch (checkError) {
          console.warn('⚠️ [CONTEXT] Error updating user state after login:', checkError);
        }
      }
      
      console.log('🏁 [CONTEXT] Returning from handleSignIn');
      return { error };
    } catch (err) {
      console.error('❌ [CONTEXT] Exception in handleSignIn:', err);
      setError(err as Error);
      return { error: err };
    } finally {
      console.log('🔄 [CONTEXT] Setting loading to false...');
      setLoading(false);
      console.log('✅ [CONTEXT] Loading set to false');
    }
  };

  const handleSignOut = async () => {
    try {
      setLoading(true);
      const { error } = await signOut();
      if (!error) {
        setUser(null);
      }
      return { error };
    } catch (err) {
      console.error('Error in sign out:', err);
      setError(err as Error);
      return { error: err };
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (profileData: Partial<User>) => {
    try {
      setLoading(true);
      if (!user) {
        throw new Error('No user logged in');
      }
      
      const { error } = await updateProfile(user.id, profileData);
      
      if (!error) {
        // Update the local user state with the new profile data
        setUser(prev => prev ? { ...prev, ...profileData } : null);
      }
      
      return { error };
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err as Error);
      return { error: err };
    } finally {
      setLoading(false);
    }
  };

  const handleUploadProfilePhoto = async (file: File) => {
    try {
      setLoading(true);
      if (!user) {
        throw new Error('No user logged in');
      }
      
      const { url, error } = await uploadProfilePhoto(user.id, file);
      
      if (!error && url) {
        // Update the local user state with the new photo
        setUser(prev => {
          if (!prev) return null;
          const updatedPhotos = [...(prev.photos || []), url];
          return { ...prev, photos: updatedPhotos };
        });
      }
      
      return { url, error };
    } catch (err) {
      console.error('Error uploading profile photo:', err);
      setError(err as Error);
      return { url: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCoins = async (amount: number) => {
    try {
      if (!user) {
        throw new Error('No user logged in');
      }

      const newCoinAmount = user.coins + amount;

      const { error } = await supabase
        .from('profiles')
        .update({ coins: newCoinAmount })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      // Update local user state
      setUser(prev => {
        if (!prev) return null;
        return { ...prev, coins: newCoinAmount };
      });

      return { error: null };
    } catch (err) {
      console.error('Error updating coins:', err);
      return { error: err };
    }
  };

  const handleTestStorageAccess = async () => {
    try {
      const { success, error, buckets } = await testStorageAccess();
      return { success, error, buckets };
    } catch (err) {
      console.error('Error testing storage access:', err);
      return { success: false, error: err as string | null, buckets: [] };
    }
  };

  // Check if user is admin based on role column
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin' || false;
  
  // Debug logging for admin check
  console.log('🔍 [AUTH_CONTEXT] Admin check:', {
    userId: user?.id,
    userRole: user?.role,
    isAdmin: isAdmin,
    hasUser: !!user
  });

  const value = {
    user,
    loading,
    error,
    isAdmin,
    signUp: handleSignUp,
    signIn: handleSignIn,
    signOut: handleSignOut,
    updateProfile: handleUpdateProfile,
    uploadProfilePhoto: handleUploadProfilePhoto,
    updateCoins: handleUpdateCoins,
    testStorageAccess: handleTestStorageAccess,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
