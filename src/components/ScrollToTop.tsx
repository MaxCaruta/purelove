import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top when route changes
    // Use instant scroll for route changes to ensure it always works
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });
    
    // Also try the alternative method for better browser compatibility
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);

  return null;
}

// Helper function for manual scroll-to-top with smooth behavior
export const scrollToTop = (behavior: 'smooth' | 'instant' = 'smooth') => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior
  });
  
  // Fallback for older browsers
  if (behavior === 'instant') {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }
}; 