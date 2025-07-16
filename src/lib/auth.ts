import { supabase } from './supabase';
import { User } from '@/types';

// Test function to verify database setup
export async function testDatabaseConnection() {
  try {
    console.log('Testing database connection...');
    
    // Test 1: Check if profiles table exists
    const { data: tableCheck, error: tableError } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true });
    
    if (tableError) {
      console.error('Profiles table check failed:', tableError);
      return { success: false, error: 'Profiles table not accessible' };
    }
    
    console.log('Profiles table accessible');
    
    // Test 2: Check table structure (no insert needed)
    const { data: columns, error: columnError } = await supabase
      .from('profiles')
      .select('*')
      .limit(0);
    
    if (columnError) {
      console.error('Table structure check failed:', columnError);
      return { success: false, error: 'Table structure issue' };
    }
    
    console.log('Database connection test successful');
    return { success: true, error: null };
  } catch (error) {
    console.error('Database connection test failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function signUp(email: string, password: string, userData: Partial<User>) {
  try {
    console.log('🔄 [SIGNUP] Starting signup process...');
    console.log('📧 [SIGNUP] Email:', email);
    console.log('👤 [SIGNUP] User data:', userData);
    
    // Add timeout to signup request
    const signupRequest = supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: userData.firstName,
          last_name: userData.lastName,
          gender: userData.gender,
          birth_date: userData.birthDate,
          country: userData.country,
          city: userData.city,
        }
      }
    });
    
    const timeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Signup request timed out')), 15000)
    );
    
    console.log('⏱️ [SIGNUP] Waiting for signup response...');
    const result = await Promise.race([signupRequest, timeout]);
    const { data, error } = result as any;

    if (error) {
      console.error('❌ [SIGNUP] Signup error:', error);
      return { data: null, error };
    }

    console.log('✅ [SIGNUP] User created successfully!');
    console.log('👤 [SIGNUP] User ID:', data.user?.id);
    console.log('📧 [SIGNUP] User email:', data.user?.email);
    console.log('🎯 [SIGNUP] Profile will be created automatically by auth trigger');

    return { data, error: null };
  } catch (error) {
    console.error('❌ [SIGNUP] Sign up exception:', error);
    return { data: null, error };
  }
}

export async function signIn(email: string, password: string, rememberMe: boolean = true) {
  console.log('🔄 [STEP 1] Starting signIn function...');
  console.log('📧 Email:', email);
  console.log('🔐 Remember me:', rememberMe);
  
  try {
    console.log('🔄 [STEP 2] Creating auth request...');
    
    const startTime = Date.now();
    
    const authPromise = supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    console.log('🕐 [STEP 3] Auth request created, awaiting response...');
    console.log('⏱️ Request created at:', new Date().toISOString());
    
    const { data, error } = await authPromise;
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log('✅ [STEP 4] Auth response received after', duration, 'ms');
    console.log('📊 Response data present:', !!data);
    console.log('❌ Response error present:', !!error);
    
    if (data) {
      console.log('👤 User ID:', data.user?.id);
      console.log('📧 User email:', data.user?.email);
      console.log('🎫 Session present:', !!data.session);
      console.log('🔑 Access token present:', !!data.session?.access_token);
    }

    if (error) {
      console.log('❌ [STEP 5] Auth error details:', error);
      console.log('🔍 Error message:', error.message);
      console.log('🔍 Error code:', error.status);
      return { data: null, error };
    }

    console.log('✅ [STEP 5] Auth successful, processing session...');

    // Supabase handles session persistence automatically
    // No need to manually store tokens
    console.log('✅ [STEP 6] Session handled by Supabase automatically');
    console.log('✅ [STEP 7] SignIn completed successfully');
    console.log('🎉 Total duration:', Date.now() - startTime, 'ms');
    
    return { data, error: null };
    
  } catch (error: any) {
    console.error('❌ [ERROR] Sign in exception:', error);
    console.error('🔍 Error type:', typeof error);
    console.error('🔍 Error name:', error.name);
    console.error('🔍 Error message:', error.message);
    console.error('🔍 Error stack:', error.stack);
    return { data: null, error };
  }
}

export async function signOut() {
  try {
    // Supabase handles session clearing automatically
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (error) {
    console.error('Sign out error:', error);
    return { error };
  }
}

// Function to check for stored session and restore it
export async function checkStoredSession() {
  try {
    // Let Supabase handle session checking
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      console.log('Found active Supabase session');
      return { hasStoredSession: true, storage: 'supabase' };
    }

    return { hasStoredSession: false, storage: null };
  } catch (error) {
    console.error('Error checking stored session:', error);
    return { hasStoredSession: false, storage: null };
  }
}

export async function getCurrentUser() {
  console.log('🔍 [GET_USER] Starting getCurrentUser...');
  
  try {
    console.log('👤 [GET_USER] Fetching auth user...');
    
    // Check if we're offline
    if (!navigator.onLine) {
      console.log('📴 [GET_USER] Device is offline, using cached session data');
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        return { 
          user: session.user, 
          profile: null, 
          error: new Error('Offline - using cached session') 
        };
      }
      return { user: null, profile: null, error: new Error('No internet connection') };
    }
    
    // Get auth user with reduced timeout and fewer retries for faster response
    let getUserResult;
    let retryCount = 0;
    const maxRetries = 1; // Reduced from 2 for faster response
    
    while (retryCount <= maxRetries) {
      try {
    const getUserPromise = supabase.auth.getUser();
    const getUserTimeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('getUser timeout')), 3000) // Reduced from 5000
    );
    
        getUserResult = await Promise.race([getUserPromise, getUserTimeoutPromise]);
        break; // Success, exit retry loop
      } catch (error) {
        retryCount++;
        console.warn(`⚠️ [GET_USER] Attempt ${retryCount} failed:`, error);
        
        if (retryCount > maxRetries) {
          // Try to get session as fallback
          console.log('🔄 [GET_USER] Falling back to session data...');
          try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
              console.log('✅ [GET_USER] Using session fallback');
              return { 
                user: session.user, 
                profile: null, 
                error: new Error('Auth service unavailable - using session fallback') 
              };
            }
          } catch (sessionError) {
            console.error('❌ [GET_USER] Session fallback failed:', sessionError);
          }
          
          throw error; // Re-throw the original error
        }
        
        // Shorter wait before retry
        await new Promise(resolve => setTimeout(resolve, 500 * retryCount)); // Reduced from 1000
      }
    }
    
    const { data: { user }, error: userError } = getUserResult as any;
    
    if (userError) {
      console.error('❌ [GET_USER] Auth user error:', userError);
      return { user: null, profile: null, error: userError };
    }
    
    console.log('✅ [GET_USER] Auth user result:', !!user);
    
    if (!user) {
      console.log('❌ [GET_USER] No authenticated user found');
      return { user: null, profile: null, error: null };
    }

    console.log('👤 [GET_USER] User ID:', user.id);
    console.log('📧 [GET_USER] User email:', user.email);

    // Get the user's profile with retry logic and graceful degradation
    console.log('🔍 [GET_USER] Fetching profile from database...');
    
    let profile = null;
    let profileError = null;
    
    try {
    const profilePromise = supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    const profileTimeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('profile fetch timeout')), 2000) // Reduced from 3000
    );
    
      const profileResult = await Promise.race([profilePromise, profileTimeoutPromise]);
      const result = profileResult as any;
      profile = result.data;
      profileError = result.error;
      
    } catch (timeoutError) {
      console.warn('⚠️ [GET_USER] Profile fetch timed out, continuing with basic user data');
      profileError = timeoutError as Error;
      
      // Return user with basic metadata instead of failing
      return {
        user,
        profile: null,
        error: new Error('Profile service unavailable - using basic user data')
      };
    }

    console.log('📊 [GET_USER] Profile query result:', { 
      profile: !!profile, 
      error: !!profileError 
    });

    if (profileError) {
      console.error('❌ [GET_USER] Error fetching profile:', profileError);
      
      // If profile doesn't exist, create a basic one (only if online)
      if (profileError.code === 'PGRST116' && navigator.onLine) { // No rows returned
        console.log('🔧 [GET_USER] Profile not found, creating basic profile...');
        
        const basicProfile = {
          id: user.id,
          first_name: user.user_metadata?.first_name || '',
          last_name: user.user_metadata?.last_name || '',
          gender: user.user_metadata?.gender || 'male',
          birth_date: user.user_metadata?.birth_date || '',
          country: user.user_metadata?.country || '',
          city: user.user_metadata?.city || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        try {
          const createProfilePromise = supabase
          .from('profiles')
          .insert(basicProfile)
          .select()
          .single();
        
          const createTimeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('profile creation timeout')), 2000) // Reduced from 3000
          );
          
          const createResult = await Promise.race([createProfilePromise, createTimeoutPromise]);
          const { data: newProfile, error: createError } = createResult as any;
          
        if (createError) {
          console.error('❌ [GET_USER] Failed to create profile:', createError);
            // Return user without profile rather than failing completely
          return { user, profile: null, error: createError };
        }
        
        console.log('✅ [GET_USER] Profile created successfully');
        return { user, profile: newProfile, error: null };
          
        } catch (createTimeoutError) {
          console.warn('⚠️ [GET_USER] Profile creation timed out, continuing without profile');
          return { user, profile: null, error: createTimeoutError as Error };
        }
      }
      
      // For other errors or offline state, return user without profile
      return { user, profile: null, error: profileError };
    }

    console.log('✅ [GET_USER] Profile found:', profile?.first_name);
    return { user, profile, error: null };
    
  } catch (error) {
    console.error('❌ [GET_USER] Exception in getCurrentUser:', error);
    
    // Last resort: try to get any cached session data
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        console.log('🆘 [GET_USER] Emergency fallback to cached session');
        return { 
          user: session.user, 
          profile: null, 
          error: new Error('Service unavailable - emergency session fallback') 
        };
      }
    } catch (fallbackError) {
      console.error('❌ [GET_USER] Emergency fallback failed:', fallbackError);
    }
    
    return { user: null, profile: null, error: error as Error };
  }
}

export async function updateProfile(userId: string, profileData: Partial<User>) {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        gender: profileData.gender,
        birth_date: profileData.birthDate,
        country: profileData.country,
        city: profileData.city,
        bio: profileData.bio,
        interests: profileData.interests,
        profession: profileData.profession,
        languages: profileData.languages,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    return { error };
  } catch (error) {
    console.error('Update profile error:', error);
    return { error };
  }
}

export async function uploadProfilePhoto(userId: string, file: File) {
  try {
    console.log('📸 [UPLOAD] Starting photo upload for user:', userId);
    console.log('📄 [UPLOAD] File details:', { 
      name: file.name, 
      size: file.size, 
      type: file.type 
    });

    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('Please upload an image file (JPG, PNG, GIF, etc.)');
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Image size must be less than 5MB');
    }

    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `profiles/${userId}/${fileName}`;

    console.log('📁 [UPLOAD] File path:', filePath);

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('profile-photos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('❌ [UPLOAD] Storage upload error:', uploadError);
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    console.log('✅ [UPLOAD] File uploaded to storage successfully');

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('profile-photos')
      .getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      throw new Error('Failed to generate public URL for uploaded image');
    }

    console.log('🔗 [UPLOAD] Public URL generated:', urlData.publicUrl);

    // Get current photos array
    const { data: currentProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('photos')
      .eq('id', userId)
      .single();

    if (fetchError) {
      console.error('❌ [UPLOAD] Error fetching current profile:', fetchError);
      throw new Error(`Failed to fetch profile: ${fetchError.message}`);
    }

    // Append new photo URL to existing photos array
    const currentPhotos = currentProfile?.photos || [];
    const updatedPhotos = [...currentPhotos, urlData.publicUrl];

    console.log('📸 [UPLOAD] Updating photos array:', {
      current: currentPhotos.length,
      updated: updatedPhotos.length
    });

    // Update the profile with the new photo URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        photos: updatedPhotos,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (updateError) {
      console.error('❌ [UPLOAD] Error updating profile:', updateError);
      throw new Error(`Failed to update profile: ${updateError.message}`);
    }

    console.log('✅ [UPLOAD] Profile updated successfully');
    return { url: urlData.publicUrl, error: null };
  } catch (error) {
    console.error('❌ [UPLOAD] Upload profile photo error:', error);
    return { 
      url: null, 
      error: error instanceof Error ? error : new Error('Unknown upload error')
    };
  }
}

export async function deleteProfilePhoto(userId: string, photoUrl: string) {
  try {
    console.log('🗑️ [DELETE] Starting photo deletion for user:', userId);
    console.log('🔗 [DELETE] Photo URL:', photoUrl);

    // Extract file path from URL
    const urlParts = photoUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const filePath = `profiles/${userId}/${fileName}`;

    console.log('📁 [DELETE] File path:', filePath);

    // Delete from storage
    const { error: deleteError } = await supabase.storage
      .from('profile-photos')
      .remove([filePath]);

    if (deleteError) {
      console.error('❌ [DELETE] Storage deletion error:', deleteError);
      // Don't throw here - continue to remove from database even if storage fails
    } else {
      console.log('✅ [DELETE] File deleted from storage successfully');
    }

    // Get current photos array
    const { data: currentProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('photos')
      .eq('id', userId)
      .single();

    if (fetchError) {
      console.error('❌ [DELETE] Error fetching current profile:', fetchError);
      throw new Error(`Failed to fetch profile: ${fetchError.message}`);
    }

    // Remove photo URL from photos array
    const currentPhotos = currentProfile?.photos || [];
    const updatedPhotos = currentPhotos.filter((url: string) => url !== photoUrl);

    console.log('📸 [DELETE] Updating photos array:', {
      current: currentPhotos.length,
      updated: updatedPhotos.length
    });

    // Update the profile with the updated photos array
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        photos: updatedPhotos,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (updateError) {
      console.error('❌ [DELETE] Error updating profile:', updateError);
      throw new Error(`Failed to update profile: ${updateError.message}`);
    }

    console.log('✅ [DELETE] Profile updated successfully');
    return { error: null };
  } catch (error) {
    console.error('❌ [DELETE] Delete profile photo error:', error);
    return { 
      error: error instanceof Error ? error : new Error('Unknown deletion error')
    };
  }
}

export async function testStorageAccess() {
  try {
    console.log('🔍 [STORAGE] Testing storage access...');
    
    // List all buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ [STORAGE] Error listing buckets:', bucketsError);
      return { success: false, error: bucketsError.message, buckets: [] };
    }
    
    console.log('✅ [STORAGE] Available buckets:', buckets.map(b => b.name));
    
    // Check if profile-photos bucket exists
    const profilePhotosBucket = buckets.find(b => b.name === 'profile-photos');
    
    if (!profilePhotosBucket) {
      console.log('⚠️ [STORAGE] profile-photos bucket not found');
      return { 
        success: false, 
        error: 'profile-photos bucket does not exist. Please create it in Supabase Dashboard.', 
        buckets: buckets.map(b => b.name) 
      };
    }
    
    console.log('✅ [STORAGE] profile-photos bucket found');
    
    // Test listing files in the bucket
    const { data: files, error: filesError } = await supabase.storage
      .from('profile-photos')
      .list('', { limit: 1 });
    
    if (filesError) {
      console.error('❌ [STORAGE] Error accessing profile-photos bucket:', filesError);
      return { 
        success: false, 
        error: `Cannot access profile-photos bucket: ${filesError.message}`, 
        buckets: buckets.map(b => b.name) 
      };
    }
    
    console.log('✅ [STORAGE] Can access profile-photos bucket');
    
    return { 
      success: true, 
      error: null, 
      buckets: buckets.map(b => b.name),
      canAccessProfilePhotos: true
    };
    
  } catch (error) {
    console.error('❌ [STORAGE] Storage test exception:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown storage error',
      buckets: []
    };
  }
}
