import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Heart, Search, Shield, Gift, MessageCircle, Globe, ArrowRight } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ProfileCard } from '@/components/ProfileCard';
import { SearchFilters } from '@/components/SearchFilters';
import { ChatWindow } from '@/components/ChatWindow';
import { Button } from '@/components/ui/button';
import { scrollToTop } from '@/components/ScrollToTop';
import { Profile } from '@/types';
import { addLike, removeLike, isProfileLiked } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

// Mock data
const mockProfiles: Profile[] = [
  {
    id: 'c0a6fef9-7cb5-4f69-8c77-a4754e283e77',
    userId: 'c0a6fef9-7cb5-4f69-8c77-a4754e283e77',
    firstName: 'Olena',
    lastName: 'K.',
    gender: 'female',
    birthDate: '1995-05-15',
    country: 'Ukraine',
    city: 'Kyiv',
    bio: 'I feel music in every cell of my body. Looking for someone who shares my passion for arts and travel.',
    interests: ['Music', 'Travel', 'Art'],
    profession: 'Graphic Designer',
    languages: ['Ukrainian', 'English', 'Russian'],
    photos: ['https://images.unsplash.com/photo-1607746882042-944635dfe10e?ixlib=rb-4.0.3&auto=format&fit=crop&w=774&q=80'],
    verified: true,
    createdAt: '2023-01-15',
    height: 168,
    weight: 55,
    eyeColor: 'blue',
    hairColor: 'blonde',
    appearanceType: 'slim',
    alcohol: 'socially',
    smoking: 'never',
    children: 'want',
    religion: 'orthodox',
    zodiacSign: 'taurus',
    englishLevel: 'intermediate',
    hasIntroVideo: true,
    isOnline: true,
    hasVideo: true,
    hasCameraOn: false,
    birthdaySoon: false,
    newProfile: false,
    top1000: true,
  },
  {
    id: 'cd8983ed-6a0a-4034-ac27-60b4a345419d',
    userId: 'cd8983ed-6a0a-4034-ac27-60b4a345419d',
    firstName: 'Natalia',
    lastName: 'M.',
    gender: 'female',
    birthDate: '1992-08-23',
    country: 'Russia',
    city: 'Moscow',
    bio: 'Passionate about literature and philosophy. I enjoy deep conversations and quiet evenings with good wine.',
    interests: ['Reading', 'Philosophy', 'Wine Tasting'],
    profession: 'Literature Professor',
    languages: ['Russian', 'English', 'French'],
    photos: ['https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80'],
    verified: true,
    createdAt: '2023-02-10',
    height: 172,
    weight: 58,
    eyeColor: 'brown',
    hairColor: 'brunette',
    appearanceType: 'average',
    alcohol: 'regularly',
    smoking: 'rarely',
    children: 'none',
    religion: 'orthodox',
    zodiacSign: 'virgo',
    englishLevel: 'advanced',
    hasIntroVideo: false,
    isOnline: false,
    hasVideo: true,
    hasCameraOn: true,
    birthdaySoon: false,
    newProfile: false,
    top1000: true,
  },
  {
    id: '7640ee5a-0ca2-4839-85fc-e467102d44b5',
    userId: '7640ee5a-0ca2-4839-85fc-e467102d44b5',
    firstName: 'Madina',
    lastName: 'A.',
    gender: 'female',
    birthDate: '1997-11-05',
    country: 'Kazakhstan',
    city: 'Almaty',
    bio: 'Adventurous spirit who loves mountains and outdoor activities. Looking for someone who isn\'t afraid of heights—emotional or literal.',
    interests: ['Hiking', 'Mountains', 'Photography'],
    profession: 'Tour Guide',
    languages: ['Kazakh', 'Russian', 'English'],
    photos: ['https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80'],
    verified: false,
    createdAt: '2023-03-05',
    height: 165,
    weight: 52,
    eyeColor: 'hazel',
    hairColor: 'black',
    appearanceType: 'athletic',
    alcohol: 'rarely',
    smoking: 'never',
    children: 'want',
    religion: 'muslim',
    zodiacSign: 'scorpio',
    englishLevel: 'intermediate',
    hasIntroVideo: true,
    isOnline: true,
    hasVideo: false,
    hasCameraOn: false,
    birthdaySoon: true,
    newProfile: true,
    top1000: false,
  },
  {
    id: 'bb77508f-6c74-44e2-a2a3-e3ab4cb764b0',
    userId: 'bb77508f-6c74-44e2-a2a3-e3ab4cb764b0',
    firstName: 'Irina',
    lastName: 'S.',
    gender: 'female',
    birthDate: '1990-02-12',
    country: 'Belarus',
    city: 'Minsk',
    bio: 'Professional dancer with a passion for classical ballet. I love to cook traditional dishes and enjoy quiet evenings at home.',
    interests: ['Dancing', 'Cooking', 'Ballet'],
    profession: 'Ballet Dancer',
    languages: ['Belarusian', 'Russian', 'English'],
    photos: ['https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80'],
    verified: true,
    createdAt: '2023-04-20',
    height: 170,
    weight: 50,
    eyeColor: 'green',
    hairColor: 'auburn',
    appearanceType: 'slim',
    alcohol: 'never',
    smoking: 'never',
    children: 'have',
    religion: 'orthodox',
    zodiacSign: 'aquarius',
    englishLevel: 'upper-intermediate',
    hasIntroVideo: true,
    isOnline: false,
    hasVideo: true,
    hasCameraOn: true,
    birthdaySoon: false,
    newProfile: false,
    top1000: true,
  },
  {
    id: 'f75cbbb3-ea44-4ac5-a350-3516c386b5f7',
    userId: 'f75cbbb3-ea44-4ac5-a350-3516c386b5f7',
    firstName: 'Kateryna',
    lastName: 'P.',
    gender: 'female',
    birthDate: '1994-09-30',
    country: 'Ukraine',
    city: 'Lviv',
    bio: 'Software engineer by day, book lover by night. Looking for an intellectual partner who enjoys deep conversations and traveling.',
    interests: ['Technology', 'Reading', 'Travel'],
    profession: 'Software Engineer',
    languages: ['Ukrainian', 'English', 'Polish'],
    photos: ['https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=778&q=80'],
    verified: true,
    createdAt: '2023-01-05',
    height: 175,
    weight: 62,
    eyeColor: 'gray',
    hairColor: 'brunette',
    appearanceType: 'average',
    alcohol: 'socially',
    smoking: 'never',
    children: 'no-want',
    religion: 'christian',
    zodiacSign: 'libra',
    englishLevel: 'fluent',
    hasIntroVideo: false,
    isOnline: true,
    hasVideo: true,
    hasCameraOn: false,
    birthdaySoon: false,
    newProfile: false,
    top1000: true,
  },
  {
    id: '8b280ce8-d2db-456a-a074-62ae53dc5828',
    userId: '8b280ce8-d2db-456a-a074-62ae53dc5828',
    firstName: 'Aisha',
    lastName: 'T.',
    gender: 'female',
    birthDate: '1996-07-18',
    country: 'Kazakhstan',
    city: 'Nur-Sultan',
    bio: 'Medical student with a love for traditional music and modern art. I enjoy outdoor activities and exploring nature.',
    interests: ['Medicine', 'Music', 'Art', 'Nature'],
    profession: 'Medical Student',
    languages: ['Kazakh', 'Russian', 'English'],
    photos: ['https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=928&q=80'],
    verified: false,
    createdAt: '2023-05-12',
    height: 163,
    weight: 48,
    eyeColor: 'brown',
    hairColor: 'black',
    appearanceType: 'slim',
    alcohol: 'never',
    smoking: 'never',
    children: 'want',
    religion: 'muslim',
    zodiacSign: 'cancer',
    englishLevel: 'elementary',
    hasIntroVideo: true,
    isOnline: false,
    hasVideo: false,
    hasCameraOn: false,
    birthdaySoon: true,
    newProfile: true,
    top1000: false,
  },
  {
    id: '4b82e757-1065-4b74-899f-28cb7cdb6b4d',
    userId: '4b82e757-1065-4b74-899f-28cb7cdb6b4d',
    firstName: 'Anastasia',
    lastName: 'V.',
    gender: 'female',
    birthDate: '1993-12-08',
    country: 'Russia',
    city: 'Saint Petersburg',
    bio: 'Classical pianist who finds beauty in both music and mathematics. Looking for someone who appreciates the harmony in life.',
    interests: ['Piano', 'Mathematics', 'Classical Music'],
    profession: 'Pianist',
    languages: ['Russian', 'English', 'German'],
    photos: ['https://images.unsplash.com/photo-1616803689943-5601631c7fec?ixlib=rb-4.0.3&auto=format&fit=crop&w=774&q=80'],
    verified: true,
    createdAt: '2023-06-15',
    height: 169,
    weight: 54,
    eyeColor: 'blue',
    hairColor: 'blonde',
    appearanceType: 'slim',
    alcohol: 'socially',
    smoking: 'never',
    children: 'none',
    religion: 'orthodox',
    zodiacSign: 'sagittarius',
    englishLevel: 'advanced',
    hasIntroVideo: true,
    isOnline: true,
    hasVideo: true,
    hasCameraOn: true,
    birthdaySoon: false,
    newProfile: false,
    top1000: true,
  },
  {
    id: '150fd9f0-aa91-44e4-8bd4-7637bf66737b',
    userId: '150fd9f0-aa91-44e4-8bd4-7637bf66737b',
    firstName: 'Zuzana',
    lastName: 'K.',
    gender: 'female',
    birthDate: '1991-04-22',
    country: 'Czech Republic',
    city: 'Prague',
    bio: 'Architect with a passion for sustainable design. I love exploring old buildings and creating new spaces that respect history.',
    interests: ['Architecture', 'Design', 'History'],
    profession: 'Architect',
    languages: ['Czech', 'English', 'German'],
    photos: ['https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80'],
    verified: false,
    createdAt: '2023-07-03',
    height: 167,
    weight: 56,
    eyeColor: 'green',
    hairColor: 'brunette',
    appearanceType: 'average',
    alcohol: 'regularly',
    smoking: 'rarely',
    children: 'have',
    religion: 'catholic',
    zodiacSign: 'taurus',
    englishLevel: 'fluent',
    hasIntroVideo: false,
    isOnline: false,
    hasVideo: true,
    hasCameraOn: false,
    birthdaySoon: false,
    newProfile: true,
    top1000: false,
  },
  {
    id: '987a5400-4552-4fc6-9875-bf7a89c09c76',
    userId: '987a5400-4552-4fc6-9875-bf7a89c09c76',
    firstName: 'Karolina',
    lastName: 'W.',
    gender: 'female',
    birthDate: '1998-01-14',
    country: 'Poland',
    city: 'Warsaw',
    bio: 'Fashion designer inspired by traditional Polish patterns and modern trends. Looking for someone who values creativity and authenticity.',
    interests: ['Fashion', 'Design', 'Travel'],
    profession: 'Fashion Designer',
    languages: ['Polish', 'English', 'Italian'],
    photos: ['https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80'],
    verified: true,
    createdAt: '2023-08-20',
    height: 173,
    weight: 59,
    eyeColor: 'brown',
    hairColor: 'brunette',
    appearanceType: 'slim',
    alcohol: 'socially',
    smoking: 'never',
    children: 'want',
    religion: 'catholic',
    zodiacSign: 'capricorn',
    englishLevel: 'intermediate',
    hasIntroVideo: true,
    isOnline: true,
    hasVideo: false,
    hasCameraOn: true,
    birthdaySoon: true,
    newProfile: false,
    top1000: true,
  },
  {
    id: '1d34559b-6a60-4450-8a1a-25156e189e8f',
    userId: '1d34559b-6a60-4450-8a1a-25156e189e8f',
    firstName: 'Elena',
    lastName: 'D.',
    gender: 'female',
    birthDate: '1989-06-30',
    country: 'Bulgaria',
    city: 'Sofia',
    bio: 'Yoga instructor and wellness coach. I believe in the power of mindfulness and living a balanced life.',
    interests: ['Yoga', 'Wellness', 'Meditation'],
    profession: 'Yoga Instructor',
    languages: ['Bulgarian', 'English', 'Greek'],
    photos: ['https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80'],
    verified: true,
    createdAt: '2023-09-10',
    height: 166,
    weight: 53,
    eyeColor: 'hazel',
    hairColor: 'auburn',
    appearanceType: 'athletic',
    alcohol: 'never',
    smoking: 'never',
    children: 'none',
    religion: 'orthodox',
    zodiacSign: 'cancer',
    englishLevel: 'upper-intermediate',
    hasIntroVideo: false,
    isOnline: false,
    hasVideo: true,
    hasCameraOn: false,
    birthdaySoon: false,
    newProfile: false,
    top1000: true,
  },
];

export function BrowsePage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [profilesPerPage] = useState(18);
  const [activeTab, setActiveTab] = useState('all');
  const [chatProfile, setChatProfile] = useState<Profile | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [searchFilters, setSearchFilters] = useState<Record<string, any>>({});
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filterKey, setFilterKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Convert URL parameters to filter format
  const convertUrlParamsToFilters = useCallback(() => {
    const ageRange = searchParams.get('ageRange');
    const country = searchParams.get('country');
    const interest = searchParams.get('interest');
    
    const filters: Record<string, any> = {
      ageMin: 18,
      ageMax: 99,
      country: '',
      interests: [],
      // ... other default values
    };
    
    // Convert ageRange to ageMin/ageMax
    if (ageRange) {
      if (ageRange === '18-24') {
        filters.ageMin = 18;
        filters.ageMax = 24;
      } else if (ageRange === '25-34') {
        filters.ageMin = 25;
        filters.ageMax = 34;
      } else if (ageRange === '35-44') {
        filters.ageMin = 35;
        filters.ageMax = 44;
      } else if (ageRange === '45+') {
        filters.ageMin = 45;
        filters.ageMax = 99;
      }
    }
    
    // Set country filter
    if (country) {
      filters.country = country;
    }
    
    // Set interest filter
    if (interest) {
      filters.interests = [interest];
    }
    
    console.log('🔍 [BROWSE] Converted URL params to filters:', filters);
    return filters;
  }, [searchParams]);

  // Initialize filters from URL parameters
  useEffect(() => {
    const urlFilters = convertUrlParamsToFilters();
    if (Object.keys(urlFilters).length > 0) {
      console.log('🔍 [BROWSE] Setting initial filters from URL:', urlFilters);
      setSearchFilters(urlFilters);
      // Force filter component to re-render with new initial values
      setFilterKey(prev => prev + 1);
    }
  }, [convertUrlParamsToFilters]);



  // Function to apply filters to data immediately (without state dependencies)
  const applyFiltersToData = (data: Profile[], filters: Record<string, any>) => {
    console.log('🔍 [BROWSE] Applying filters to data immediately:', filters);
    console.log('🔍 [BROWSE] Total profiles to filter:', data.length);
    
    // Check if any filters are actually set (not default values)
    const hasActiveFilters = (
      (filters.ageMin !== 18 || filters.ageMax !== 99) ||
      (filters.country && filters.country.trim() !== '') ||
      (filters.city && filters.city.trim() !== '') ||
      (filters.eyeColor && filters.eyeColor.trim() !== '') ||
      (filters.hairColor && filters.hairColor.trim() !== '') ||
      (filters.appearanceType && filters.appearanceType.trim() !== '') ||
      (filters.alcohol && filters.alcohol.trim() !== '') ||
      (filters.smoking && filters.smoking.trim() !== '') ||
      (filters.children && filters.children.trim() !== '') ||
      (filters.religion && filters.religion.trim() !== '') ||
      (filters.zodiacSign && filters.zodiacSign.trim() !== '') ||
      (filters.englishLevel && filters.englishLevel.trim() !== '') ||
      (filters.interests && filters.interests.length > 0) ||
      (filters.languages && filters.languages.length > 0) ||
      filters.hasIntroVideo === true ||
      filters.isOnline === true ||
      filters.hasVideo === true ||
      filters.hasCameraOn === true ||
      filters.birthdaySoon === true ||
      filters.newProfile === true ||
      filters.top1000 === true ||
      filters.verified === true
    );
    
    if (!hasActiveFilters) {
      console.log('🔍 [BROWSE] No active filters, showing all profiles');
      setFilteredProfiles([...data]);
      return;
    }
    
    // Apply filters
    let filtered = [...data];
    
    // Age filter
    if (filters.ageMin !== 18 || filters.ageMax !== 99) {
      filtered = filtered.filter(profile => {
        if (!profile.birthDate) return true;
        const age = new Date().getFullYear() - new Date(profile.birthDate).getFullYear();
        return age >= filters.ageMin && age <= filters.ageMax;
      });
      console.log('🔍 [BROWSE] After age filter:', filtered.length);
    }
    
    // Country filter - case insensitive matching
    if (filters.country && filters.country.trim() !== '') {
      filtered = filtered.filter(profile => 
        profile.country && profile.country.toLowerCase() === filters.country.toLowerCase()
      );
      console.log('🔍 [BROWSE] After country filter:', filtered.length);
    }
    
    // Interest filter
    if (filters.interests && filters.interests.length > 0) {
      filtered = filtered.filter(profile => 
        profile.interests && profile.interests.length > 0 && 
        profile.interests.some(interest => 
          filters.interests.includes(interest)
        )
      );
      console.log('🔍 [BROWSE] After interest filter:', filtered.length);
    }
    
    console.log('🔍 [BROWSE] Final filtered profiles:', filtered.length);
    setFilteredProfiles(filtered);
  };

  // Fetch real model profiles from Supabase
  useEffect(() => {
    async function fetchModels() {
      setLoading(true);
      setError(null);
      // First, let's check if there are any profiles at all
      const { data: allProfiles, error: allError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
        
      console.log('🔍 [BROWSE] All profiles in database:', allProfiles?.length || 0);
      if (allProfiles && allProfiles.length > 0) {
        console.log('🔍 [BROWSE] Sample profile roles:', allProfiles.slice(0, 5).map(p => ({ id: p.id, role: p.role, name: p.first_name })));
      }
      
      // Now get only model profiles, excluding the current user
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'model')
        .neq('id', user?.id || '') // Exclude current user
        .order('created_at', { ascending: false });

      if (error) {
        setError('Failed to load models.');
        setProfiles([]);
        setFilteredProfiles([]);
      } else if (!data || data.length === 0) {
        console.log('🔍 [BROWSE] No model profiles found, showing all profiles instead');
        // If no model profiles, show all profiles
        const transformedData = (allProfiles || []).map(profile => ({
          id: profile.id,
          userId: profile.id,
          firstName: profile.first_name,
          lastName: profile.last_name,
          gender: profile.gender,
          birthDate: profile.birth_date,
          country: profile.country,
          city: profile.city,
          bio: profile.bio,
          interests: profile.interests || [],
          profession: profile.profession,
          languages: profile.languages || [],
          photos: profile.photos || [],
          verified: profile.verified,
          createdAt: profile.created_at,
          height: profile.height,
          weight: profile.weight,
          eyeColor: profile.eye_color,
          hairColor: profile.hair_color,
          appearanceType: profile.appearance_type,
          alcohol: profile.alcohol,
          smoking: profile.smoking,
          children: profile.children,
          religion: profile.religion,
          zodiacSign: profile.zodiac_sign,
          englishLevel: profile.english_level,
          hasIntroVideo: profile.has_intro_video,
          isOnline: profile.is_online,
          hasVideo: profile.has_video,
          hasCameraOn: profile.has_camera_on,
          birthdaySoon: profile.birthday_soon,
          newProfile: profile.new_profile,
          top1000: profile.top_1000
        }));
        
        setProfiles(transformedData);
        setFilteredProfiles(transformedData);
      } else {
        console.log('🔍 [BROWSE] Raw data from database:', data?.length || 0, 'profiles');
        
        // Transform the data to match our frontend Profile type
        const transformedData = (data || []).map(profile => ({
          id: profile.id,
          userId: profile.id, // Same as id for our purposes
          firstName: profile.first_name,
          lastName: profile.last_name,
          gender: profile.gender,
          birthDate: profile.birth_date,
          country: profile.country,
          city: profile.city,
          bio: profile.bio,
          interests: profile.interests || [],
          profession: profile.profession,
          languages: profile.languages || [],
          photos: profile.photos || [],
          verified: profile.verified,
          createdAt: profile.created_at,
          height: profile.height,
          weight: profile.weight,
          eyeColor: profile.eye_color,
          hairColor: profile.hair_color,
          appearanceType: profile.appearance_type,
          alcohol: profile.alcohol,
          smoking: profile.smoking,
          children: profile.children,
          religion: profile.religion,
          zodiacSign: profile.zodiac_sign,
          englishLevel: profile.english_level,
          hasIntroVideo: profile.has_intro_video,
          isOnline: profile.is_online,
          hasVideo: profile.has_video,
          hasCameraOn: profile.has_camera_on,
          birthdaySoon: profile.birthday_soon,
          newProfile: profile.new_profile,
          top1000: profile.top_1000
        }));

        setProfiles(transformedData);
        
        // Check if we have URL parameters - if so, apply filters immediately
        const hasUrlParams = searchParams.get('ageRange') || searchParams.get('country') || searchParams.get('interest');
        if (hasUrlParams) {
          console.log('🔍 [BROWSE] URL parameters detected, applying filters immediately');
          const urlFilters = convertUrlParamsToFilters();
          // Apply filters immediately before setting loading to false
          applyFiltersToData(transformedData, urlFilters);
        } else {
          console.log('🔍 [BROWSE] No URL parameters, showing all profiles');
          setFilteredProfiles(transformedData); // Show all profiles if no URL params
        }
      }
      setLoading(false);
    }
    fetchModels();
  }, []);

  // Function to apply filters directly (without initialization checks)
  const applyFiltersDirectly = useCallback((filters: Record<string, any>) => {
    console.log('🔍 [BROWSE] Applying filters directly:', filters);
    console.log('🔍 [BROWSE] Total profiles available:', profiles.length);
    console.log('🔍 [BROWSE] Sample profile countries:', profiles.slice(0, 3).map(p => p.country));
    
    // Check if any filters are actually set (not default values)
    const hasActiveFilters = (
      (filters.ageMin !== 18 || filters.ageMax !== 99) ||
      (filters.country && filters.country.trim() !== '') ||
      (filters.city && filters.city.trim() !== '') ||
      (filters.eyeColor && filters.eyeColor.trim() !== '') ||
      (filters.hairColor && filters.hairColor.trim() !== '') ||
      (filters.appearanceType && filters.appearanceType.trim() !== '') ||
      (filters.alcohol && filters.alcohol.trim() !== '') ||
      (filters.smoking && filters.smoking.trim() !== '') ||
      (filters.children && filters.children.trim() !== '') ||
      (filters.religion && filters.religion.trim() !== '') ||
      (filters.zodiacSign && filters.zodiacSign.trim() !== '') ||
      (filters.englishLevel && filters.englishLevel.trim() !== '') ||
      (filters.interests && filters.interests.length > 0) ||
      (filters.languages && filters.languages.length > 0) ||
      filters.hasIntroVideo === true ||
      filters.isOnline === true ||
      filters.hasVideo === true ||
      filters.hasCameraOn === true ||
      filters.birthdaySoon === true ||
      filters.newProfile === true ||
      filters.top1000 === true ||
      filters.verified === true
    );
    
    if (!hasActiveFilters) {
      console.log('🔍 [BROWSE] No active filters, showing all profiles');
      setFilteredProfiles([...profiles]);
      return;
    }
    
    // Apply filters
    let filtered = [...profiles];
    
    // Age filter
    if (filters.ageMin !== 18 || filters.ageMax !== 99) {
      filtered = filtered.filter(profile => {
        if (!profile.birthDate) return true;
        const age = new Date().getFullYear() - new Date(profile.birthDate).getFullYear();
        return age >= filters.ageMin && age <= filters.ageMax;
      });
    }
    
    // Country filter - case insensitive matching
    if (filters.country && filters.country.trim() !== '') {
      filtered = filtered.filter(profile => 
        profile.country && profile.country.toLowerCase() === filters.country.toLowerCase()
      );
      console.log('🔍 [BROWSE] After country filter:', filtered.length);
    }
    
    // Interest filter
    if (filters.interests && filters.interests.length > 0) {
      filtered = filtered.filter(profile => 
        profile.interests && profile.interests.length > 0 && 
        profile.interests.some(interest => 
          filters.interests.includes(interest)
        )
      );
    }
    
    console.log('🔍 [BROWSE] Final filtered profiles:', filtered.length);
    setFilteredProfiles(filtered);
  }, [profiles]);



  // Handle opening chat from notification
  useEffect(() => {
    const openChatId = searchParams.get('openChat');
    if (openChatId) {
      // Find profile by ID
      const profileToOpen = profiles.find(p => p.id === openChatId || p.userId === openChatId);
      if (profileToOpen) {
        setChatProfile(profileToOpen);
        setIsChatOpen(true);
        
        // Clear the URL parameter
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete('openChat');
        setSearchParams(newSearchParams, { replace: true });
      }
    }
  }, [searchParams, profiles, setSearchParams]);

  // Get current profiles for pagination
  const indexOfLastProfile = currentPage * profilesPerPage;
  const indexOfFirstProfile = indexOfLastProfile - profilesPerPage;
  const currentProfiles = filteredProfiles.slice(indexOfFirstProfile, indexOfLastProfile);

  // Function to apply filters
  const handleFiltersChange = useCallback((filters: Record<string, any>) => {
    console.log('🔍 [BROWSE] Filter change triggered with:', filters);
    
    setSearchFilters(filters);
    setCurrentPage(1); // Reset to first page when filters change
    
    // Always apply filters immediately - no skipping
    setHasInitialized(true);
    
    // Check if any filters are actually set (not default values)
    const hasActiveFilters = (
      (filters.ageMin !== 18 || filters.ageMax !== 99) ||
      (filters.country && filters.country.trim() !== '') ||
      (filters.city && filters.city.trim() !== '') ||
      (filters.eyeColor && filters.eyeColor.trim() !== '') ||
      (filters.hairColor && filters.hairColor.trim() !== '') ||
      (filters.appearanceType && filters.appearanceType.trim() !== '') ||
      (filters.alcohol && filters.alcohol.trim() !== '') ||
      (filters.smoking && filters.smoking.trim() !== '') ||
      (filters.children && filters.children.trim() !== '') ||
      (filters.religion && filters.religion.trim() !== '') ||
      (filters.zodiacSign && filters.zodiacSign.trim() !== '') ||
      (filters.englishLevel && filters.englishLevel.trim() !== '') ||
      (filters.interests && filters.interests.length > 0) ||
      (filters.languages && filters.languages.length > 0) ||
      filters.hasIntroVideo === true ||
      filters.isOnline === true ||
      filters.hasVideo === true ||
      filters.hasCameraOn === true ||
      filters.birthdaySoon === true ||
      filters.newProfile === true ||
      filters.top1000 === true ||
      filters.verified === true
    );
    
    console.log('🔍 [BROWSE] Has active filters:', hasActiveFilters);
    console.log('🔍 [BROWSE] Total profiles before filtering:', profiles.length);
    
    // If no active filters, show all profiles
    if (!hasActiveFilters) {
      console.log('🔍 [BROWSE] No active filters, showing all profiles');
      setFilteredProfiles([...profiles]);
      return;
    }
    
    // Apply filters
    let filtered = [...profiles];
    
    // Age filter - only apply if it's different from default
    if (filters.ageMin !== 18 || filters.ageMax !== 99) {
      filtered = filtered.filter(profile => {
        if (!profile.birthDate) return true; // Skip profiles without birth date
        const age = new Date().getFullYear() - new Date(profile.birthDate).getFullYear();
        return age >= filters.ageMin && age <= filters.ageMax;
      });
      console.log('🔍 [BROWSE] After age filter:', filtered.length);
    }
    
    // Location filters - only apply if they have values
    if (filters.country && filters.country.trim() !== '') {
      filtered = filtered.filter(profile => 
        profile.country && profile.country.toLowerCase() === filters.country.toLowerCase()
      );
      console.log('🔍 [BROWSE] After country filter:', filtered.length);
    }
    
    if (filters.city && filters.city.trim() !== '') {
      filtered = filtered.filter(profile => 
        profile.city && profile.city.toLowerCase().includes(filters.city.toLowerCase())
      );
      console.log('🔍 [BROWSE] After city filter:', filtered.length);
    }
    
    // Appearance filters - only apply if they have values
    if (filters.eyeColor && filters.eyeColor.trim() !== '') {
      filtered = filtered.filter(profile => profile.eyeColor === filters.eyeColor);
      console.log('🔍 [BROWSE] After eye color filter:', filtered.length);
    }
    
    if (filters.hairColor && filters.hairColor.trim() !== '') {
      filtered = filtered.filter(profile => profile.hairColor === filters.hairColor);
      console.log('🔍 [BROWSE] After hair color filter:', filtered.length);
    }
    
    if (filters.appearanceType && filters.appearanceType.trim() !== '') {
      filtered = filtered.filter(profile => profile.appearanceType === filters.appearanceType);
      console.log('🔍 [BROWSE] After appearance type filter:', filtered.length);
    }
    
    // Lifestyle filters - only apply if they have values
    if (filters.alcohol && filters.alcohol.trim() !== '') {
      filtered = filtered.filter(profile => profile.alcohol === filters.alcohol);
      console.log('🔍 [BROWSE] After alcohol filter:', filtered.length);
    }
    
    if (filters.smoking && filters.smoking.trim() !== '') {
      filtered = filtered.filter(profile => profile.smoking === filters.smoking);
      console.log('🔍 [BROWSE] After smoking filter:', filtered.length);
    }
    
    if (filters.children && filters.children.trim() !== '') {
      filtered = filtered.filter(profile => profile.children === filters.children);
      console.log('🔍 [BROWSE] After children filter:', filtered.length);
    }
    
    // Personal info filters - only apply if they have values
    if (filters.religion && filters.religion.trim() !== '') {
      filtered = filtered.filter(profile => profile.religion === filters.religion);
      console.log('🔍 [BROWSE] After religion filter:', filtered.length);
    }
    
    if (filters.zodiacSign && filters.zodiacSign.trim() !== '') {
      filtered = filtered.filter(profile => profile.zodiacSign === filters.zodiacSign);
      console.log('🔍 [BROWSE] After zodiac filter:', filtered.length);
    }
    
    if (filters.englishLevel && filters.englishLevel.trim() !== '') {
      filtered = filtered.filter(profile => profile.englishLevel === filters.englishLevel);
      console.log('🔍 [BROWSE] After english level filter:', filtered.length);
    }
    
    // Interests and languages - only apply if they have values
    if (filters.interests && filters.interests.length > 0) {
      filtered = filtered.filter(profile => 
        profile.interests && profile.interests.length > 0 && 
        profile.interests.some(interest => 
          filters.interests.includes(interest)
        )
      );
      console.log('🔍 [BROWSE] After interests filter:', filtered.length);
    }
    
    if (filters.languages && filters.languages.length > 0) {
      filtered = filtered.filter(profile => 
        profile.languages && profile.languages.length > 0 && 
        profile.languages.some(language => 
          filters.languages.includes(language)
        )
      );
      console.log('🔍 [BROWSE] After languages filter:', filtered.length);
    }
    
    // Special features - only apply if they are true
    if (filters.hasIntroVideo === true) {
      filtered = filtered.filter(profile => profile.hasIntroVideo === true);
      console.log('🔍 [BROWSE] After intro video filter:', filtered.length);
    }
    
    if (filters.isOnline === true) {
      filtered = filtered.filter(profile => profile.isOnline === true);
      console.log('🔍 [BROWSE] After online filter:', filtered.length);
    }
    
    if (filters.hasVideo === true) {
      filtered = filtered.filter(profile => profile.hasVideo === true);
      console.log('🔍 [BROWSE] After video filter:', filtered.length);
    }
    
    if (filters.hasCameraOn === true) {
      filtered = filtered.filter(profile => profile.hasCameraOn === true);
      console.log('🔍 [BROWSE] After camera on filter:', filtered.length);
    }
    
    if (filters.birthdaySoon === true) {
      filtered = filtered.filter(profile => profile.birthdaySoon === true);
      console.log('🔍 [BROWSE] After birthday soon filter:', filtered.length);
    }
    
    if (filters.newProfile === true) {
      filtered = filtered.filter(profile => profile.newProfile === true);
      console.log('🔍 [BROWSE] After new profile filter:', filtered.length);
    }
    
    if (filters.top1000 === true) {
      filtered = filtered.filter(profile => profile.top1000 === true);
      console.log('🔍 [BROWSE] After top1000 filter:', filtered.length);
    }
    
    if (filters.verified === true) {
      filtered = filtered.filter(profile => profile.verified === true);
      console.log('🔍 [BROWSE] After verified filter:', filtered.length);
    }

    console.log('🔍 [BROWSE] Final filtered profiles:', filtered.length);
    setFilteredProfiles(filtered);
  }, [profiles, hasInitialized, searchParams]);



  const handleMessage = (profile: Profile) => {
      setChatProfile(profile);
      setIsChatOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
          <div className="lg:hidden mb-4">
            <Button
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className="w-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center gap-2 py-3 touch-none active:scale-[0.98] transition-transform"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
              </svg>
            {isFiltersOpen ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </div>

        <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Sidebar - Filters */}
            <aside className={`${
            isFiltersOpen ? 'block' : 'hidden'
          } lg:block w-full lg:w-80 flex-shrink-0 transition-all duration-300 ease-in-out z-20`}>
            <div className="lg:sticky lg:top-24 space-y-4 lg:space-y-6 bg-white/95 backdrop-blur-lg rounded-xl shadow-lg p-4 lg:p-0 lg:shadow-none lg:rounded-none lg:bg-transparent">
                  <SearchFilters 
                    key={filterKey}
                onFiltersChange={handleFiltersChange}
                    initialFilters={searchFilters} 
                  />
              </div>
            </aside>

          {/* Main Content - Profile Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading profiles...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={() => window.location.reload()} variant="outline">
                  Try Again
                </Button>
              </div>
            ) : filteredProfiles.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-xl font-medium mb-2">No profiles found</h3>
                <p className="text-slate-600 mb-4">Try adjusting your filters or check back later</p>
                <Button onClick={() => setSearchFilters({})} variant="outline">
                  Clear Filters
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {currentProfiles.map((profile) => (
                    <ProfileCard
                      key={profile.id}
                      profile={profile}
                      onMessage={handleMessage}
                    />
                  ))}
                </div>
                
                {/* Pagination */}
                {filteredProfiles.length > profilesPerPage && (
                  <div className="mt-8 flex justify-center gap-2">
                    {Array.from({ length: Math.ceil(filteredProfiles.length / profilesPerPage) }).map((_, index) => (
                      <Button
                        key={index}
                        variant={currentPage === index + 1 ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setCurrentPage(index + 1);
                          scrollToTop();
                        }}
                      >
                        {index + 1}
                      </Button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
      
      {chatProfile && (
        <ChatWindow
          profile={chatProfile}
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          searchFilters={searchFilters}
        />
      )}
    </div>
  );
}
