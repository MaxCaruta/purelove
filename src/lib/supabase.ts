import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

// Check if environment variables are defined
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase URL or Anon Key is missing. Please check your .env file.');
  console.error('Create a .env file in the root directory with:');
  console.error('VITE_SUPABASE_URL=your-supabase-url');
  console.error('VITE_SUPABASE_ANON_KEY=your-supabase-anon-key');
  throw new Error('Missing Supabase configuration');
}

// Validate that we're not using placeholder values
if (supabaseUrl === 'https://example.supabase.co') {
  console.error('❌ Using placeholder Supabase URL. Please update your .env file with real credentials.');
  throw new Error('Invalid Supabase configuration');
}

// Create the standard client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Create a service role client for admin operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Add error handling for browser extension conflicts
if (typeof window !== 'undefined') {
  // Protect against browser extension conflicts
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    try {
      return originalFetch.apply(this, args);
    } catch (error) {
      console.warn('⚠️ Fetch error (possibly from browser extension):', error);
      throw error;
    }
  };
}
