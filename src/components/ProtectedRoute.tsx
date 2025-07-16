import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const [showLoading, setShowLoading] = useState(true);
  const [timeoutReached, setTimeoutReached] = useState(false);

  // Show loading only after 500ms to avoid flash for fast connections
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(loading);
    }, 500);

    // Add a timeout to prevent infinite loading
    const timeoutTimer = setTimeout(() => {
      if (loading) {
        console.warn('⚠️ [PROTECTED_ROUTE] Loading timeout reached, forcing render');
        setTimeoutReached(true);
        setShowLoading(false);
      }
    }, 10000); // 10 second timeout

    return () => {
      clearTimeout(timer);
      clearTimeout(timeoutTimer);
    };
  }, [loading]);

  console.log('🔍 [PROTECTED_ROUTE] State:', { user: !!user, loading, showLoading, timeoutReached });

  // Show loading state while checking authentication
  if (showLoading && loading && !timeoutReached) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // If timeout reached and still loading, show a message
  if (timeoutReached && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Timeout</h3>
          <p className="text-gray-600 mb-4">The page is taking longer than expected to load.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    console.log('❌ [PROTECTED_ROUTE] No user, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Render the protected component
  console.log('✅ [PROTECTED_ROUTE] Rendering protected component for user:', user.email);
  return <>{children}</>;
}
