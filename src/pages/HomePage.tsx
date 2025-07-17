import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Search, Shield, Gift, MessageCircle, Globe, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProfileCard } from '@/components/ProfileCard';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ChatWindow } from '../components/ChatWindow';
import { NotificationSystem } from '@/components/NotificationSystem';
import { Profile } from '@/types';
import { addLike, removeLike, isProfileLiked } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

// Testimonials data
const testimonials = [
  {
    id: '1',
    name: 'Michael & Tetyana',
    location: 'USA & Ukraine',
    text: 'We met on PureLove two years ago. Despite the distance, we connected instantly. After six months of online dating and two visits, I proposed during my trip to Kyiv. We\'re now happily married and living in Chicago.',
    image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1771&q=80',
  },
  {
    id: '2',
    name: 'David & Anastasia',
    location: 'Canada & Russia',
    text: 'I was skeptical about international dating until I met Anastasia. The translation feature helped us overcome the language barrier initially. After a year of dating online and meeting twice in person, she moved to Toronto. We\'re getting married next month!',
    image: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1769&q=80',
  },
];

export function HomePage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [ageRange, setAgeRange] = useState('18-24');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedInterest, setSelectedInterest] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [searchFilters, setSearchFilters] = useState<any>({});
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchModels() {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'model')
        .order('created_at', { ascending: false });
      
      if (error) {
        setError('Failed to load models.');
        setProfiles([]);
      } else {
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
      }
      setLoading(false);
    }
    fetchModels();
  }, []);

  // Pick models for hero/featured sections
  const heroModels = profiles.slice(0, 5);
  const featuredModels = profiles.slice(5, 11);

  // Update heroLiked when currentProfileIndex changes
  useEffect(() => {
    if (heroModels.length > 0 && currentProfileIndex < heroModels.length) {
      setHeroLiked(isProfileLiked(heroModels[currentProfileIndex].id));
    }
  }, [currentProfileIndex, heroModels]);

  // Show form after initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowForm(true);
    }, 600); // Show form after 600ms
    return () => clearTimeout(timer);
  }, []);

  // Auto-slide functionality with smooth infinite loop
  useEffect(() => {
    if (!isAutoPlaying || isTransitioning || heroModels.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentProfileIndex((prevIndex) => {
        // Smooth circular navigation
        return (prevIndex + 1) % heroModels.length;
      });
    }, 4000); // Change every 4 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, isTransitioning, heroModels.length]);

  const [heroLiked, setHeroLiked] = useState(false);

  const handleLike = (id: string) => {
    const profile = [...heroModels, ...featuredModels].find(p => p.id === id);
    if (!profile) return;

    if (isProfileLiked(id)) {
      removeLike(id);
      setHeroLiked(false);
    } else {
      addLike(profile);
      setHeroLiked(true);
    }
  };

  const handleMessage = (profile: Profile) => {
    setSelectedProfile(profile);
    setIsChatOpen(true);
  };

  const handleProfileSelect = (profileIndex: number) => {
    if (profileIndex === currentProfileIndex || isTransitioning) return;
    
    setIsTransitioning(true);
    setIsAutoPlaying(false);
    
    // Set new index immediately for smooth transition
    setCurrentProfileIndex(profileIndex);
    
    // Brief transition state to prevent rapid clicks
    setTimeout(() => {
      setIsTransitioning(false);
    }, 700); // Match animation duration
    
    // Resume auto-play after 5 seconds
    setTimeout(() => {
      setIsAutoPlaying(true);
    }, 5000);
  };

  const handleViewSingles = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Build query parameters for browse page
    const params = new URLSearchParams();
    if (ageRange) params.append('ageRange', ageRange);
    if (selectedCountry) params.append('country', selectedCountry);
    if (selectedInterest) params.append('interest', selectedInterest);
    
    const queryString = params.toString();
    const url = queryString ? `/browse?${queryString}` : '/browse';
    
    if (navigate) navigate(url);
  };

  const handleNotificationReply = (profileId: string) => {
    console.log('Reply to notification from profile:', profileId);
    
    // Create profiles that match the notification system
    const notificationProfiles: { [key: string]: any } = {
      'n1': {
        id: 'n1', userId: 'n1', firstName: 'Elena', lastName: 'K.', gender: 'female' as const,
        birthDate: '1999-05-15', country: 'Ukraine', city: 'Kyiv',
        bio: 'Sweet and romantic girl looking for true love 💕',
        interests: ['Romance', 'Travel', 'Music'], profession: 'Model',
        languages: ['Ukrainian', 'English'],
        photos: ['https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=776&q=80'],
        verified: true, createdAt: '2023-01-15', height: 165, weight: 55, eyeColor: 'blue', hairColor: 'blonde',
        appearanceType: 'slim', alcohol: 'socially', smoking: 'never', children: 'want', religion: 'christian',
        zodiacSign: 'taurus', englishLevel: 'advanced', hasIntroVideo: true, isOnline: true, hasVideo: true,
      },
      'n2': {
        id: 'cd8983ed-6a0a-4034-ac27-60b4a345419d', userId: 'cd8983ed-6a0a-4034-ac27-60b4a345419d', firstName: 'Anastasia', lastName: 'M.', gender: 'female' as const,
        birthDate: '1997-08-23', country: 'Russia', city: 'Moscow',
        bio: 'Passionate and caring, ready for serious relationship ❤️',
        interests: ['Romance', 'Art', 'Philosophy'], profession: 'Psychologist',
        languages: ['Russian', 'English'],
        photos: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=776&q=80'],
        verified: true, createdAt: '2023-02-10', height: 170, weight: 58, eyeColor: 'brown', hairColor: 'brunette',
        appearanceType: 'athletic', alcohol: 'socially', smoking: 'never', children: 'want', religion: 'orthodox',
        zodiacSign: 'virgo', englishLevel: 'fluent', hasIntroVideo: false, isOnline: true, hasVideo: false,
      },
      'n3': {
        id: 'bb77508f-6c74-44e2-a2a3-e3ab4cb764b0', userId: 'bb77508f-6c74-44e2-a2a3-e3ab4cb764b0', firstName: 'Sofia', lastName: 'D.', gender: 'female' as const,
        birthDate: '2001-03-18', country: 'Belarus', city: 'Minsk',
        bio: 'Young and optimistic, love dancing and meeting new people ✨',
        interests: ['Dancing', 'Music', 'Fashion'], profession: 'Student',
        languages: ['Belarusian', 'Russian', 'English'],
        photos: ['https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80'],
        verified: false, createdAt: '2023-03-18', height: 162, weight: 50, eyeColor: 'blue', hairColor: 'blonde',
        appearanceType: 'slim', alcohol: 'rarely', smoking: 'never', children: 'maybe', religion: 'christian',
        zodiacSign: 'pisces', englishLevel: 'intermediate', hasIntroVideo: true, isOnline: true, hasVideo: true,
      },
      'n4': {
        id: 'n4', userId: 'n4', firstName: 'Katarina', lastName: 'N.', gender: 'female' as const,
        birthDate: '1995-07-12', country: 'Czech Republic', city: 'Prague',
        bio: 'Love exploring old cities and cozy cafes. Looking for meaningful conversations 📚',
        interests: ['History', 'Coffee', 'Architecture'], profession: 'Tour Guide',
        languages: ['Czech', 'English', 'German'],
        photos: ['https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80'],
        verified: true, createdAt: '2023-04-05', height: 168, weight: 56, eyeColor: 'green', hairColor: 'brown',
        appearanceType: 'athletic', alcohol: 'socially', smoking: 'never', children: 'want', religion: 'catholic',
        zodiacSign: 'cancer', englishLevel: 'fluent', hasIntroVideo: false, isOnline: true, hasVideo: false,
      },
      'n5': {
        id: 'n5', userId: 'n5', firstName: 'Alina', lastName: 'W.', gender: 'female' as const,
        birthDate: '1998-11-25', country: 'Poland', city: 'Warsaw',
        bio: 'Creative soul who loves art and good food. Ready for new adventures 🎨',
        interests: ['Art', 'Cooking', 'Travel'], profession: 'Graphic Designer',
        languages: ['Polish', 'English', 'Spanish'],
        photos: ['https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80'],
        verified: true, createdAt: '2023-05-22', height: 165, weight: 54, eyeColor: 'hazel', hairColor: 'brown',
        appearanceType: 'slim', alcohol: 'socially', smoking: 'rarely', children: 'want', religion: 'catholic',
        zodiacSign: 'sagittarius', englishLevel: 'advanced', hasIntroVideo: true, isOnline: true, hasVideo: true,
      },
      'n6': {
        id: 'n6', userId: 'n6', firstName: 'Arina', lastName: 'B.', gender: 'female' as const,
        birthDate: '2000-09-08', country: 'Kazakhstan', city: 'Almaty',
        bio: 'Love nature and outdoor activities. Looking for someone to share life adventures 🏔️',
        interests: ['Hiking', 'Photography', 'Nature'], profession: 'Environmental Science Student',
        languages: ['Kazakh', 'Russian', 'English'],
        photos: ['https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80'],
        verified: false, createdAt: '2023-06-14', height: 163, weight: 52, eyeColor: 'brown', hairColor: 'black',
        appearanceType: 'athletic', alcohol: 'never', smoking: 'never', children: 'maybe', religion: 'muslim',
        zodiacSign: 'virgo', englishLevel: 'intermediate', hasIntroVideo: false, isOnline: true, hasVideo: false,
      },
    };
    
    // Use specific profile or fallback to first one
    const notificationProfile = notificationProfiles[profileId] || notificationProfiles['n1'];
    
    // Open chat with the notification profile
    setSelectedProfile(notificationProfile);
    setSearchFilters({ fromNotification: true, profileId });
    setIsChatOpen(true);
    
    // Visual feedback for user
    console.log(`💬 Opening chat with ${notificationProfile.firstName} from ${notificationProfile.country}`);
  };

    const handleNotificationViewProfile = (profileId: string) => {
    console.log('View profile from notification:', profileId);
    
    // Get profile info for feedback
    const profileNames = {
      'n1': 'Elena from Ukraine',
      'n2': 'Anastasia from Russia', 
      'n3': 'Sofia from Belarus',
      'n4': 'Katarina from Czech Republic',
      'n5': 'Alina from Poland',
      'n6': 'Arina from Kazakhstan'
    };
    
    const profileName = profileNames[profileId as keyof typeof profileNames] || 'Unknown';
    console.log(`👁️ Viewing profile: ${profileName}`);
    
    // Navigate directly to the profile page
    navigate(`/profile/${profileId}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden bg-gradient-to-br from-slate-900 via-rose-900 to-slate-900">
        {/* Background Images */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70 z-10"></div>
          <img
            src="https://images.unsplash.com/photo-1516195851888-6f1a981a862e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
            alt="Romantic couple"
            className="w-full h-full object-cover opacity-30 hover:scale-105 transition-transform duration-[20s]"
          />
        </div>
        
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
          <div className="absolute top-20 left-10 w-20 h-20 bg-rose-500/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-32 h-32 bg-pink-500/20 rounded-full blur-xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-20 left-20 w-24 h-24 bg-red-500/20 rounded-full blur-xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>

        <div className="container mx-auto px-4 relative z-20 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[600px] animate-fade-in-up">
            {/* Left Content */}
            <div className="text-white">
              <div className="inline-flex items-center gap-2 bg-rose-500/20 backdrop-blur-sm border border-rose-300/30 rounded-full px-4 py-2 mb-6 ">
                <Heart className="h-4 w-4 text-rose-300 fill-current animate-pulse" />
                <span className="text-sm text-rose-100">Trusted by 50,000+ singles worldwide</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight" style={{animationDelay: '0.1s'}}>
                Find Your Perfect Match
                <span className="block bg-gradient-to-r from-rose-300 via-pink-300 to-red-300 bg-clip-text text-transparent">
                  Online Today
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed max-w-2xl " style={{animationDelay: '0.2s'}}>
                The leading international dating site with over <span className="text-rose-300 font-semibold">50,000+ verified profiles</span>
              </p>
              
              {/* Quick Filters */}
              <div className={`bg-white/10 backdrop-blur-md rounded-xl p-6 mb-6 max-w-2xl w-full transition-all duration-700 ease-out ${
                showForm ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}>
                <form onSubmit={handleViewSingles}>
                  <h3 className="text-white/90 text-lg font-semibold mb-4">Find Your Perfect Match</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-white/90 text-sm font-medium mb-2">Age Range</label>
                      <select
                        className="w-full px-4 py-2 rounded-lg bg-white/0 border border-white/10 text-sm text-white focus:border-rose-300/50 focus:outline-none"
                        value={ageRange}
                        onChange={e => setAgeRange(e.target.value)}
                      >
                        <option value="18-24">18-24</option>
                        <option value="25-34">25-34</option>
                        <option value="35-44">35-44</option>
                        <option value="45+">45+</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-white/90 text-sm font-medium mb-2">Country</label>
                      <select
                        className="w-full px-4 py-2 rounded-lg bg-white/0 border border-white/10 text-sm text-white focus:border-rose-300/50 focus:outline-none"
                        value={selectedCountry}
                        onChange={e => setSelectedCountry(e.target.value)}
                      >
                        <option value="">Any Country</option>
                        <option value="ukraine">Ukraine</option>
                        <option value="russia">Russia</option>
                        <option value="kazakhstan">Kazakhstan</option>
                        <option value="belarus">Belarus</option>
                        <option value="moldova">Moldova</option>
                        <option value="georgia">Georgia</option>
                        <option value="armenia">Armenia</option>
                        <option value="azerbaijan">Azerbaijan</option>
                        <option value="kyrgyzstan">Kyrgyzstan</option>
                        <option value="tajikistan">Tajikistan</option>
                        <option value="turkmenistan">Turkmenistan</option>
                        <option value="uzbekistan">Uzbekistan</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-white/90 text-sm font-medium mb-2">Interests</label>
                      <select
                        className="w-full px-4 py-2 rounded-lg bg-white/0 border border-white/10 text-sm text-white focus:border-rose-300/50 focus:outline-none"
                        value={selectedInterest}
                        onChange={e => setSelectedInterest(e.target.value)}
                      >
                        <option value="">Any Interest</option>
                        <option value="travel">Travel</option>
                        <option value="music">Music</option>
                        <option value="art">Art</option>
                        <option value="sports">Sports</option>
                        <option value="cooking">Cooking</option>
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-rose-500 hover:bg-rose-600 text-white rounded-lg py-3 text-sm font-semibold shadow-none flex items-center justify-center gap-2 mt-4">
                    <Heart className="h-4 w-4 mr-2" />
                    View Singles Now
                  </button>
                </form>
              </div>


            </div>
            
            {/* Right Content - Minimalist Slider Design */}
            <div className="h-full flex items-center">
              {loading ? (
                <div className="w-full max-w-lg mx-auto text-center">
                  <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
                  <p className="text-white/80">Loading profiles...</p>
                </div>
              ) : error ? (
                <div className="w-full max-w-lg mx-auto text-center">
                  <div className="bg-red-500/20 backdrop-blur-sm rounded-xl p-6 border border-red-300/30">
                    <p className="text-red-200 mb-2">Failed to load profiles</p>
                    <p className="text-red-100 text-sm">{error}</p>
                  </div>
                </div>
              ) : heroModels.length === 0 ? (
                <div className="w-full max-w-lg mx-auto text-center">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                    <p className="text-white/80 mb-2">No profiles available</p>
                    <p className="text-white/60 text-sm">Check back later for new profiles</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Desktop: Clean Card Stack */}
                  <div className="hidden lg:block relative w-full max-w-lg mx-auto">
                    <div className="relative h-[550px]">
                      <div className="relative w-full h-full">
                        {heroModels.map((profile, index) => {
                          // Calculate shortest path for circular navigation
                          let offset = index - currentProfileIndex;
                          const totalProfiles = heroModels.length;
                          
                          // Handle wrap-around by choosing shortest path
                          if (offset > totalProfiles / 2) {
                            offset -= totalProfiles;
                          } else if (offset < -totalProfiles / 2) {
                            offset += totalProfiles;
                          }
                          
                          const isActive = index === currentProfileIndex;
                          const absOffset = Math.abs(offset);
                          const isVisible = absOffset <= 2;
                          
                          return (
                            <div
                              key={profile.id}
                              className={`absolute inset-0 transition-all duration-700 ease-out cursor-pointer ${
                                !isVisible ? 'pointer-events-none' : ''
                              }`}
                              style={{
                                transform: `
                                  translateX(${offset * 30}px) 
                                  translateY(${absOffset * 15}px) 
                                  scale(${Math.max(0.8, 1 - absOffset * 0.05)})
                                `,
                                opacity: isVisible ? Math.max(0.3, 1 - absOffset * 0.3) : 0,
                                zIndex: isVisible ? 10 - absOffset : 0,
                                transition: isTransitioning ? 'all 0.7s ease-out' : 'all 0.7s ease-out',
                              }}
                              onClick={() => handleProfileSelect(index)}
                            >
                              <div className={`
                                w-full h-full rounded-2xl overflow-hidden transition-all duration-500
                                ${isActive 
                                  ? 'shadow-xl border border-white/30' 
                                  : 'shadow-lg border border-white/10 hover:border-white/20'
                                }
                              `}>
                                {/* Profile Image */}
                                <div className="relative w-full h-full">
                                  {profile.photos && profile.photos.length > 0 && profile.photos[0] ? (
                                    <img
                                      src={profile.photos[0]}
                                      alt={`${profile.firstName}'s profile`}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                      <div className="text-center text-gray-500">
                                        <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        <p className="text-lg font-medium">No Photo</p>
                                        <p className="text-sm text-gray-400">Photo not available</p>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Subtle Overlay */}
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                                  
                                  {/* Verification Badge - Only on active */}
                                  {profile.verified && isActive && (
                                    <div className="absolute top-4 right-4">
                                      <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-white text-xs font-medium">
                                        ✓ Verified
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Profile Info */}
                                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                                    <h3 className="text-2xl font-semibold mb-1">{profile.firstName}, {new Date().getFullYear() - new Date(profile.birthDate).getFullYear()}</h3>
                                    <p className="text-white/80 text-sm mb-3">
                                      {profile.city}, {profile.country}
                                    </p>
                                    
                                    {/* Bio - Only show on active card */}
                                    {isActive && (
                                      <>
                                        <p className="text-white/70 text-sm mb-4 line-clamp-2 leading-relaxed">
                                          {profile.bio}
                                        </p>
                                        
                                        {/* Simple Action Buttons */}
                                        <div className="flex gap-3">
                                          <Button
                                            size="sm"
                                            className={`flex-1 bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm ${
                                              heroLiked ? 'bg-rose-500/50 hover:bg-rose-500/60' : ''
                                            }`}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleLike(profile.id);
                                            }}
                                          >
                                            <Heart className={`h-4 w-4 mr-1 ${heroLiked ? 'fill-current' : ''}`} />
                                            {heroLiked ? 'Liked' : 'Like'}
                                          </Button>
                                          <Button
                                            size="sm"
                                            className="flex-1 bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleMessage(profile);
                                            }}
                                          >
                                            <MessageCircle className="h-4 w-4 mr-1" />
                                            Message
                                          </Button>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Simple Indicators */}
                    <div className="flex justify-center gap-2 mt-6">
                      {heroModels.map((_, index) => (
                        <button
                          key={index}
                          className={`transition-all duration-300 rounded-full ${
                            index === currentProfileIndex 
                              ? 'w-8 h-2 bg-white' 
                              : 'w-2 h-2 bg-white/40 hover:bg-white/60'
                          }`}
                          onClick={() => handleProfileSelect(index)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Mobile: Clean Card Slider */}
                  <div className="lg:hidden block relative w-full max-w-sm mx-auto animate-fade-in" style={{animationDelay: '0.5s'}}>
                    <div className="relative h-[450px] overflow-hidden rounded-2xl">
                      <div 
                        className="flex transition-transform duration-700 ease-out h-full"
                        style={{ transform: `translateX(-${currentProfileIndex * 100}%)` }}
                      >
                        {heroModels.map((profile) => (
                          <div
                            key={profile.id}
                            className="w-full flex-shrink-0 h-full relative"
                          >
                            <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-lg border border-white/10">
                              {/* Profile Image */}
                              {profile.photos && profile.photos.length > 0 && profile.photos[0] ? (
                                <img
                                  src={profile.photos[0]}
                                  alt={`${profile.firstName}'s profile`}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                  <div className="text-center text-gray-500">
                                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <p className="text-lg font-medium">No Photo</p>
                                    <p className="text-sm text-gray-400">Photo not available</p>
                                  </div>
                                </div>
                              )}
                              
                              {/* Subtle Overlay */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                              
                              {/* Verification Badge */}
                              {profile.verified && (
                                <div className="absolute top-4 right-4">
                                  <div className="bg-white/20 backdrop-blur-sm rounded-full px-2 py-1 text-white text-xs">
                                    ✓ Verified
                                  </div>
                                </div>
                              )}
                              
                              {/* Profile Info */}
                              <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                                <h3 className="text-xl font-semibold mb-1">{profile.firstName}, {new Date().getFullYear() - new Date(profile.birthDate).getFullYear()}</h3>
                                <p className="text-white/80 text-sm mb-3">
                                  {profile.city}, {profile.country}
                                </p>
                                <p className="text-white/70 text-sm mb-4 line-clamp-2">
                                  {profile.bio}
                                </p>
                                
                                {/* Action Buttons */}
                                <div className="flex gap-3">
                                  <Button
                                    size="sm"
                                    className={`flex-1 bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm ${
                                      heroLiked ? 'bg-rose-500/50 hover:bg-rose-500/60' : ''
                                    }`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleLike(profile.id);
                                    }}
                                  >
                                    <Heart className={`h-4 w-4 mr-1 ${heroLiked ? 'fill-current' : ''}`} />
                                    {heroLiked ? 'Liked' : 'Like'}
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="flex-1 bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMessage(profile);
                                    }}
                                  >
                                    <MessageCircle className="h-4 w-4 mr-1" />
                                    Message
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Mobile Indicators */}
                    <div className="flex justify-center gap-2 mt-4">
                      {heroModels.map((_, index) => (
                        <button
                          key={index}
                          className={`transition-all duration-300 rounded-full ${
                            index === currentProfileIndex ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/40'
                          }`}
                          onClick={() => handleProfileSelect(index)}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Profiles */}
      <section className="py-20 bg-gradient-to-b from-slate-50 via-white to-slate-50 relative overflow-hidden">
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-32 left-16 w-24 h-24 bg-rose-500/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-32 h-32 bg-pink-500/10 rounded-full blur-xl animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-800">
              Featured Profiles
              <span className="block bg-gradient-to-r from-rose-500 via-pink-500 to-red-500 bg-clip-text text-transparent">
                From Around the World
              </span>
            </h2>
            <p className="text-slate-600 max-w-3xl mx-auto text-lg leading-relaxed">
              Discover verified profiles from around the world and start meaningful conversations today
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 stagger-animation">
            {featuredModels.map((profile) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                onMessage={handleMessage}
              />
            ))}
          </div>
          
          <div className="text-center mt-12 animate-fade-in">
            <Link to="/browse">
              <Button className="bg-rose-500 hover:bg-rose-600 text-white border-0 hover:scale-105 transition-all duration-300 px-8 py-3">
                <span>View All Profiles</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Features */}
      <section className="py-20 bg-gradient-to-b from-gray-50 via-slate-100 to-gray-50 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-800">
              Why Choose Us?
              <span className="block bg-gradient-to-r from-rose-500 via-pink-500 to-red-500 bg-clip-text text-transparent">
                Premium Features
              </span>
            </h2>
            <p className="text-slate-600 max-w-3xl mx-auto text-lg leading-relaxed">
              Experience premium features designed to help you find genuine connections safely and effectively
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 stagger-animation">
            <div className="bg-white/80 backdrop-blur-lg border border-slate-200/60 rounded-xl p-8 hover:bg-white/95 hover:border-slate-300/80 transition-all duration-500 group shadow-lg hover:shadow-xl">
              <div className="text-center">
                <div className="bg-rose-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="h-8 w-8 text-rose-600" />
                </div>
                <h3 className="font-semibold text-xl mb-4 text-slate-800">Verified Profiles</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  All profiles undergo strict verification to ensure authenticity and prevent scams.
                </p>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-lg border border-slate-200/60 rounded-xl p-8 hover:bg-white/95 hover:border-slate-300/80 transition-all duration-500 group shadow-lg hover:shadow-xl">
              <div className="text-center">
                <div className="bg-blue-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <MessageCircle className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-xl mb-4 text-slate-800">Smart Messaging</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  AI-powered translation and conversation starters to break down barriers.
                </p>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-lg border border-slate-200/60 rounded-xl p-8 hover:bg-white/95 hover:border-slate-300/80 transition-all duration-500 group shadow-lg hover:shadow-xl">
              <div className="text-center">
                <div className="bg-pink-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Gift className="h-8 w-8 text-pink-600" />
                </div>
                <h3 className="font-semibold text-xl mb-4 text-slate-800">Virtual Gifts</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Send thoughtful virtual gifts to show your interest and make memorable impressions.
                </p>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-lg border border-slate-200/60 rounded-xl p-8 hover:bg-white/95 hover:border-slate-300/80 transition-all duration-500 group shadow-lg hover:shadow-xl">
              <div className="text-center">
                <div className="bg-green-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Globe className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-xl mb-4 text-slate-800">Global Reach</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Connect with people from different cultures and backgrounds worldwide.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Success Stories */}
      <section className="py-20 bg-gradient-to-b from-white via-slate-50 to-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-10 w-20 h-20 bg-rose-500/10 rounded-full blur-xl animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-32 left-16 w-28 h-28 bg-pink-500/10 rounded-full blur-xl animate-pulse" style={{animationDelay: '3s'}}></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-800">
              Success Stories
              <span className="block bg-gradient-to-r from-rose-500 via-pink-500 to-red-500 bg-clip-text text-transparent">
                Real Love Found
              </span>
            </h2>
            <p className="text-slate-600 max-w-3xl mx-auto text-lg leading-relaxed">
              Real couples who found love and built meaningful relationships through our platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-white/80 backdrop-blur-lg border border-slate-200/60 rounded-2xl overflow-hidden hover:bg-white/95 hover:border-slate-300/80 transition-all duration-500 group shadow-lg hover:shadow-xl">
                <div className="flex flex-col md:flex-row h-full">
                  <div className="md:w-1/3 relative">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-full h-48 md:h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-slate-900/20"></div>
                  </div>
                  <div className="md:w-2/3 p-8 flex flex-col justify-center">
                    <div className="mb-4">
                      <h3 className="font-bold text-2xl mb-1 text-slate-800">{testimonial.name}</h3>
                      <div className="flex items-center gap-2 text-rose-600 font-medium">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-sm">{testimonial.location}</span>
                      </div>
                    </div>
                    <blockquote className="text-slate-700 leading-relaxed italic text-lg">
                      "{testimonial.text}"
                    </blockquote>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12 animate-fade-in">
            <Link to="/success-stories">
              <Button className="bg-rose-500 hover:bg-rose-600 text-white border-0 hover:scale-105 transition-all duration-300 px-8 py-3">
                <span>Read More Stories</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-rose-100 via-pink-50 to-rose-100 relative overflow-hidden">
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-32 h-32 bg-rose-500/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-pink-500/10 rounded-full blur-xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-rose-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto ">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-slate-800 animate-fade-in">
              Ready to Find Your Match?
              <span className="block bg-gradient-to-r from-rose-500 via-pink-500 to-red-500 bg-clip-text text-transparent h-[80px]">
                Start Your Journey Today
              </span>
            </h2>
            <p className="text-xl md:text-2xl mb-12 text-slate-600 leading-relaxed animate-fade-in-up">
              Join thousands of singles who have found meaningful connections. Your perfect match is waiting.
            </p>
            <div className="animate-fade-in-up" style={{animationDelay: '0.3s'}}>
              <Link to="/signup">
                <Button size="lg" className="bg-rose-600 text-white hover:bg-rose-700 hover:scale-105 transition-all duration-300 px-12 py-4 text-lg font-semibold shadow-2xl">
                  <Heart className="h-6 w-6 mr-3" />
                  <span>Start Your Journey</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
      
      {/* Chat Window */}
      {selectedProfile && (
        <ChatWindow
          profile={selectedProfile}
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          searchFilters={searchFilters}
        />
      )}

      {/* Notification System */}
      <NotificationSystem
        isActive={true}
        onReply={handleNotificationReply}
        onViewProfile={handleNotificationViewProfile}
      />
    </div>
  );
}
