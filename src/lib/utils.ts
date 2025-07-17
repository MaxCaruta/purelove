import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Profile, Like } from '@/types';
import { supabase } from './supabase';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export const countries = [
  { value: 'ukraine', label: 'Ukraine' },
  { value: 'russia', label: 'Russia' },
  { value: 'kazakhstan', label: 'Kazakhstan' },
  { value: 'belarus', label: 'Belarus' },
  { value: 'moldova', label: 'Moldova' },
  { value: 'georgia', label: 'Georgia' },
  { value: 'armenia', label: 'Armenia' },
  { value: 'azerbaijan', label: 'Azerbaijan' },
  { value: 'kyrgyzstan', label: 'Kyrgyzstan' },
  { value: 'tajikistan', label: 'Tajikistan' },
  { value: 'turkmenistan', label: 'Turkmenistan' },
  { value: 'uzbekistan', label: 'Uzbekistan' },
];

export const interests = [
  'Travel', 'Music', 'Art', 'Cooking', 'Dancing', 
  'Reading', 'Sports', 'Movies', 'Photography', 'Nature',
  'Hiking', 'Swimming', 'Yoga', 'Fashion', 'Technology',
  'Languages', 'History', 'Science', 'Politics', 'Philosophy'
];

export const coinPackages = [
  { id: 1, amount: 100, price: 9.99, popular: false, bonus: 0 },
  { id: 2, amount: 500, price: 39.99, popular: true, bonus: 50 },
  { id: 3, amount: 1000, price: 69.99, popular: false, bonus: 150 },
  { id: 4, amount: 2000, price: 119.99, popular: false, bonus: 400 },
];

export const subscriptionPackages = [
  { 
    id: 'weekly', 
    name: 'Weekly Premium', 
    duration: 7, 
    durationUnit: 'days', 
    price: 19.99, 
    popular: false,
    features: [
      'Unlimited messaging',
      '50 bonus coins included',
      'Priority customer support',
      'Advanced search filters',
      'Profile boost feature'
    ]
  },
  { 
    id: 'monthly', 
    name: 'Monthly Premium', 
    duration: 1, 
    durationUnit: 'month', 
    price: 49.99, 
    popular: true,
    features: [
      'Unlimited messaging',
      '200 bonus coins included',
      'Priority customer support',
      'Advanced search filters',
      'Profile boost feature',
      'Read receipts',
      'Online status visibility'
    ]
  },
  { 
    id: 'quarterly', 
    name: 'Quarterly Premium', 
    duration: 3, 
    durationUnit: 'months', 
    price: 129.99, 
    popular: false,
    features: [
      'Unlimited messaging',
      '600 bonus coins included',
      'Priority customer support',
      'Advanced search filters',
      'Profile boost feature',
      'Read receipts',
      'Online status visibility',
      'VIP profile badge',
      'Extended profile visibility'
    ]
  },
];

export const coinPrices = {
  message: 1, // 1 coin per message
  gift: 10, // 10 coins for virtual gifts (base price - can vary by gift)
  voiceCall: 400, // 400 coins per minute for voice calls
  videoCall: 1000, // 1000 coins per minute for video calls
  contactInfo: 700, // 700 coins to view contact info (WhatsApp, phone, etc.)
  profileBoost: 20, // 20 coins to boost profile visibility
  superLike: 5, // 5 coins for super likes
  readReceipts: 2, // 2 coins to see if message was read
};

// Database gift interface matching the table structure
export interface Gift {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  is_active: boolean;
  created_at: string;
}

// Legacy interface for backwards compatibility (maps to database structure)
export interface RealGift {
  id: string;
  name: string;
  description: string;
  cost: number; // maps to price in database
  category: string;
  image: string; // maps to image_url in database
  delivery: string; // deprecated but kept for compatibility
}

// Function to load gifts from database
export const loadGifts = async (): Promise<Gift[]> => {
  try {
    const { data: gifts, error } = await supabase
      .from('gifts')
      .select('*')
      .eq('is_active', true)
      .order('category', { ascending: true })
      .order('price', { ascending: true });

    if (error) {
      console.error('Error loading gifts from database:', error);
      return [];
    }

    return gifts || [];
  } catch (error) {
    console.error('Error loading gifts:', error);
    return [];
  }
};

// Function to convert database gift to RealGift format for backwards compatibility
export const convertToRealGift = (gift: Gift): RealGift => ({
  id: gift.id,
  name: gift.name,
  description: gift.description,
  cost: gift.price,
  category: gift.category,
  image: gift.image_url,
  delivery: 'Virtual purchase with coins'
});

// Function to get gifts by category
export const getGiftsByCategory = async (category?: string): Promise<RealGift[]> => {
  const allGifts = await loadGifts();
  const filteredGifts = category && category !== 'all' 
    ? allGifts.filter(gift => gift.category === category)
    : allGifts;
  
  return filteredGifts.map(convertToRealGift);
};

// Function to get unique categories
export const getGiftCategories = async (): Promise<string[]> => {
  const allGifts = await loadGifts();
  const categories = [...new Set(allGifts.map(gift => gift.category))];
  return categories.sort();
};

// Legacy arrays for backwards compatibility (will be populated dynamically)
export const realGifts: RealGift[] = [];

// Real gift categories for filtering
export const realGiftCategories = [
  { id: 'all', name: 'All Gifts', icon: '🎁' },
  { id: 'flowers', name: 'Flowers', icon: '🌹' },
  { id: 'perfumes', name: 'Perfumes', icon: '💐' },
  { id: 'gift_baskets', name: 'Gift Baskets', icon: '🧺' },
  { id: 'electronics', name: 'Electronics', icon: '📱' },
  { id: 'jewelry', name: 'Jewelry', icon: '💎' },
  { id: 'beauty', name: 'Beauty', icon: '💄' },
  { id: 'fashion', name: 'Fashion', icon: '👗' },
  { id: 'home', name: 'Home', icon: '🏠' },
];

// Helper functions for real gifts - now async to work with database
export const getRealGiftsByCategory = async (category: string): Promise<RealGift[]> => {
  return await getGiftsByCategory(category === 'all' ? undefined : category);
};

export const getRealGiftsByPriceRange = async (minPrice: number, maxPrice: number): Promise<RealGift[]> => {
  const allGifts = await getGiftsByCategory();
  return allGifts.filter(gift => gift.cost >= minPrice && gift.cost <= maxPrice);
};

// Function to initialize legacy arrays (for backwards compatibility)
export const initializeGifts = async (): Promise<void> => {
  try {
    const gifts = await getGiftsByCategory();
    realGifts.length = 0;
    realGifts.push(...gifts);
    console.log('✅ Loaded', gifts.length, 'gifts from database');
  } catch (error) {
    console.error('❌ Error initializing gifts:', error);
  }
};

// Combined gift types - only real gifts now
export type GiftType = 'real';

interface LocalStorageData {
  likedProfiles: {
    [key: string]: {
      likedAt: string;
      status: 'sent' | 'received' | 'matched';
      profile: Profile;
    };
  };
}

// Storage keys
const STORAGE_KEYS = {
  LIKES: 'purelove_likes_data'
} as const;

// Mock user ID for demo purposes
const MOCK_USER_ID = 'current-user';

// Get likes data from localStorage
export function getLikesData(): LocalStorageData {
  const data = localStorage.getItem(STORAGE_KEYS.LIKES);
  if (!data) {
    return { likedProfiles: {} };
  }
  
  try {
    const parsedData = JSON.parse(data);
    
    // Handle corrupted data structures
    if (!parsedData || typeof parsedData !== 'object') {
      return { likedProfiles: {} };
    }
    
    // Handle case where data is an array (old format)
    if (Array.isArray(parsedData)) {
      return { likedProfiles: {} };
    }
    
    // Ensure likedProfiles exists and is an object
    if (!parsedData.likedProfiles || typeof parsedData.likedProfiles !== 'object' || Array.isArray(parsedData.likedProfiles)) {
      parsedData.likedProfiles = {};
    }
    
    return parsedData;
  } catch (e) {
    console.error('Error parsing likes data:', e);
    return { likedProfiles: {} };
  }
}

// Save likes data to localStorage
export function saveLikesData(data: LocalStorageData) {
  try {
    localStorage.setItem(STORAGE_KEYS.LIKES, JSON.stringify(data));
    console.log('💾 Saved likes data:', data);
  } catch (e) {
    console.error('Error saving likes data:', e);
  }
}

// Add a new like
export function addLike(profile: Profile, status: 'sent' | 'received' = 'sent'): void {
  console.log('❤️ Adding like:', { profile, status });
  
  // Safety check to ensure profile is defined
  if (!profile || !profile.id) {
    console.error('❌ Invalid profile passed to addLike:', profile);
    return;
  }
  
  const data = getLikesData();
  
  // Check if there's already a like in the opposite direction
  const existingLike = data.likedProfiles[profile.id];
  console.log('🔍 Existing like:', existingLike);
  
  const newStatus = existingLike?.status === 'received' && status === 'sent' ? 'matched' : status;
  console.log('✨ New status:', newStatus);
  
  data.likedProfiles[profile.id] = {
    likedAt: new Date().toISOString(),
    status: newStatus,
    profile: {
      id: profile.id,
      userId: profile.userId,
      firstName: profile.firstName,
      lastName: profile.lastName || '',
      gender: profile.gender,
      birthDate: profile.birthDate,
      city: profile.city,
      country: profile.country,
      bio: profile.bio,
      interests: profile.interests,
      profession: profile.profession,
      languages: profile.languages,
      photos: profile.photos,
      verified: profile.verified,
      createdAt: profile.createdAt
    }
  };
  
  saveLikesData(data);

  // For demo purposes, simulate the other person liking back with a 50% chance
  if (status === 'sent' && Math.random() < 0.5) {
    console.log('💘 Simulating received like back');
    setTimeout(() => {
      const data = getLikesData();
      if (data.likedProfiles[profile.id]) {
        data.likedProfiles[profile.id].status = 'matched';
        saveLikesData(data);
      }
    }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds
  }
}

// Remove a like
export function removeLike(profileId: string): void {
  console.log('💔 Removing like:', profileId);
  const data = getLikesData();
  delete data.likedProfiles[profileId];
  saveLikesData(data);
}

// Update like status
export function updateLikeStatus(profileId: string, status: 'sent' | 'received' | 'matched'): void {
  console.log('🔄 Updating like status:', { profileId, status });
  const data = getLikesData();
  if (data.likedProfiles[profileId]) {
    data.likedProfiles[profileId].status = status;
    saveLikesData(data);
  }
}

// Check if profile is liked
export function isProfileLiked(profileId: string): boolean {
  const data = getLikesData();
  const isLiked = !!data.likedProfiles[profileId];
  return isLiked;
}

// Get all likes
export function getAllLikes(): Like[] {
  const data = getLikesData();
  const likes = Object.entries(data.likedProfiles)
    .filter(([, like]) => like.status === 'sent')
    .map(([id, like]) => ({
      id,
      fromUserId: MOCK_USER_ID,
      toUserId: like.profile.userId,
      createdAt: like.likedAt,
      status: 'pending' as const,
      profile: {
        id: like.profile.id,
        userId: like.profile.userId,
        firstName: like.profile.firstName,
        lastName: like.profile.lastName,
        age: new Date().getFullYear() - new Date(like.profile.birthDate).getFullYear(),
        city: like.profile.city,
        country: like.profile.country,
        photo: like.profile.photos[0],
        verified: like.profile.verified
      }
    }));
  console.log('📤 Getting all sent likes:', likes);
  return likes;
}

// Get received likes
export function getReceivedLikes(): Like[] {
  const data = getLikesData();
  const likes = Object.entries(data.likedProfiles)
    .filter(([, like]) => like.status === 'received')
    .map(([id, like]) => ({
      id,
      fromUserId: like.profile.userId,
      toUserId: MOCK_USER_ID,
      createdAt: like.likedAt,
      status: 'pending' as const,
      profile: {
        id: like.profile.id,
        userId: like.profile.userId,
        firstName: like.profile.firstName,
        lastName: like.profile.lastName,
        age: new Date().getFullYear() - new Date(like.profile.birthDate).getFullYear(),
        city: like.profile.city,
        country: like.profile.country,
        photo: like.profile.photos[0],
        verified: like.profile.verified
      }
    }));
  console.log('📥 Getting received likes:', likes);
  return likes;
}

// Flag to track if demo likes have been added
let demoLikesAdded = false;

// Clear existing demo data
function clearDemoData() {
  try {
    const data = getLikesData();
    console.log('🧹 Current data structure:', data);
    
    // Check if likedProfiles exists and is an object
    if (!data.likedProfiles || typeof data.likedProfiles !== 'object') {
      console.log('🧹 Invalid or missing likedProfiles, initializing...');
      data.likedProfiles = {};
      saveLikesData(data);
      return;
    }
    
    // Handle case where likedProfiles might be an array (corrupted data)
    if (Array.isArray(data.likedProfiles)) {
      console.log('🧹 Found array instead of object, resetting...');
      data.likedProfiles = {};
      saveLikesData(data);
      return;
    }
    
    const demoIds = ['c0a6fef9-7cb5-4f69-8c77-a4754e283e77', 'demo2', 'demo3'];
    
    demoIds.forEach(id => {
      if (data.likedProfiles[id]) {
        delete data.likedProfiles[id];
        console.log(`🧹 Removed demo profile: ${id}`);
      }
    });
    
    saveLikesData(data);
    console.log('🧹 Cleared existing demo data successfully');
  } catch (error) {
    console.error('❌ Error clearing demo data:', error);
    // Reset to clean state if there's an error
    try {
      localStorage.removeItem('purelove_likes_data');
      console.log('🧹 Reset localStorage due to error');
    } catch (resetError) {
      console.error('❌ Error resetting localStorage:', resetError);
    }
  }
}

// Reset likes data completely
export function resetLikesData(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.LIKES);
    console.log('🔄 Reset likes data completely');
  } catch (error) {
    console.error('❌ Error resetting likes data:', error);
  }
}

// For demo purposes, let's add some received likes
export function addDemoReceivedLikes() {
  if (demoLikesAdded) {
    console.log('🎭 Demo likes already added, skipping...');
    return;
  }
  
  console.log('🎭 Adding demo likes...');
  
  try {
    // Clear any existing demo data first
    clearDemoData();
    
    const demoProfiles: Profile[] = [
      {
        id: 'c0a6fef9-7cb5-4f69-8c77-a4754e283e77',
        userId: 'c0a6fef9-7cb5-4f69-8c77-a4754e283e77',
        firstName: 'Olena',
        lastName: 'K.',
        gender: 'female',
        birthDate: '1995-05-15',
        city: 'Kyiv',
        country: 'Ukraine',
        bio: 'Looking for meaningful connections',
        interests: ['Travel', 'Photography', 'Music'],
        profession: 'Photographer',
        languages: ['English', 'Ukrainian'],
        photos: ['https://images.unsplash.com/photo-1494790108377-be9c29b29330'],
        verified: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'demo2',
        userId: 'demo2',
        firstName: 'Maria',
        lastName: 'S.',
        gender: 'female',
        birthDate: '1993-08-22',
        city: 'Moscow',
        country: 'Russia',
        bio: 'Love to explore new places',
        interests: ['Dancing', 'Cooking', 'Art'],
        profession: 'Dance Instructor',
        languages: ['English', 'Russian'],
        photos: ['https://images.unsplash.com/photo-1524504388940-b1c1722653e1'],
        verified: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'demo3',
        userId: 'demo3',
        firstName: 'Sofia',
        lastName: 'V.',
        gender: 'female',
        birthDate: '1996-03-10',
        city: 'Lviv',
        country: 'Ukraine',
        bio: 'Art lover and coffee enthusiast',
        interests: ['Coffee', 'Art', 'Books'],
        profession: 'Barista',
        languages: ['English', 'Ukrainian'],
        photos: ['https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e'],
        verified: true,
        createdAt: new Date().toISOString()
      }
    ];

    // Add demo profiles as received likes
    demoProfiles.forEach((profile, index) => {
      console.log(`🎭 Adding demo profile ${index + 1}:`, profile.firstName);
      if (profile && profile.id) {
        addLike(profile, 'received');
      } else {
        console.error('❌ Invalid demo profile:', profile);
      }
    });

    demoLikesAdded = true;
    console.log('✅ Demo data added successfully');
  } catch (error) {
    console.error('❌ Error adding demo data:', error);
    // If there's still an error, reset everything and try once more
    console.log('🔄 Attempting to reset and retry...');
    resetLikesData();
    demoLikesAdded = false;
  }
}

// Gift transaction function
export const sendGift = async (
  senderId: string,
  receiverId: string,
  giftId: string,
  quantity: number = 1
): Promise<{ success: boolean; error?: string }> => {
  try {
    // First, get the gift details to calculate cost
    const { data: gift, error: giftError } = await supabase
      .from('gifts')
      .select('*')
      .eq('id', giftId)
      .single();

    if (giftError || !gift) {
      return { success: false, error: 'Gift not found' };
    }

    const totalCost = gift.price * quantity;

    // Check if sender has enough coins
    const { data: senderProfile, error: senderError } = await supabase
      .from('profiles')
      .select('coins')
      .eq('id', senderId)
      .single();

    if (senderError || !senderProfile) {
      return { success: false, error: 'Sender profile not found' };
    }

    if (senderProfile.coins < totalCost) {
      return { success: false, error: 'Insufficient coins' };
    }

    // Manual transaction handling for better reliability
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ coins: senderProfile.coins - totalCost })
      .eq('id', senderId);

    if (updateError) {
      console.error('Error updating sender coins:', updateError);
      return { success: false, error: 'Failed to deduct coins' };
    }

    // Record the gift transaction
    const { error: transactionError } = await supabase
      .from('gift_transactions')
      .insert({
        sender_id: senderId,
        receiver_id: receiverId,
        gift_id: giftId,
        coins_spent: totalCost,
        created_at: new Date().toISOString()
      });

    if (transactionError) {
      console.error('Error recording gift transaction:', transactionError);
      // Try to refund the coins if transaction recording fails
      await supabase
        .from('profiles')
        .update({ coins: senderProfile.coins })
        .eq('id', senderId);
      return { success: false, error: 'Failed to record gift transaction' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending gift:', error);
    return { success: false, error: 'Unexpected error occurred' };
  }
};
