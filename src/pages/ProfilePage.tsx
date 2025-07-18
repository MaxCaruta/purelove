import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Gift, Shield, Check, Globe, Briefcase, Calendar, MapPin, Languages, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ChatWindow } from '../components/ChatWindow';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Profile } from '@/types';
import { supabase } from '@/lib/supabase';
import { sendGift } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

export function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, updateCoins } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [likedProfiles, setLikedProfiles] = useState<string[]>(() => {
    const saved = localStorage.getItem('likedProfiles');
    return saved ? JSON.parse(saved) : [];
  });
  const [openGiftSelectorOnOpen, setOpenGiftSelectorOnOpen] = useState(false);

  // Fetch profile from database
  useEffect(() => {
    async function fetchProfile() {
      if (!id) {
        setError('Profile ID not found');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          setError('Profile not found');
          setLoading(false);
          return;
        }

        if (!data) {
          setError('Profile not found');
          setLoading(false);
          return;
        }

        // Transform the data to match our frontend Profile type
        const transformedProfile: Profile = {
          id: data.id,
          userId: data.id,
          firstName: data.first_name,
          lastName: data.last_name,
          gender: data.gender,
          birthDate: data.birth_date,
          country: data.country,
          city: data.city,
          bio: data.bio,
          interests: data.interests || [],
          profession: data.profession,
          languages: data.languages || [],
          photos: data.photos || [],
          verified: data.verified,
          createdAt: data.created_at,
          height: data.height,
          weight: data.weight,
          eyeColor: data.eye_color,
          hairColor: data.hair_color,
          appearanceType: data.appearance_type,
          alcohol: data.alcohol,
          smoking: data.smoking,
          children: data.children,
          religion: data.religion,
          zodiacSign: data.zodiac_sign,
          englishLevel: data.english_level,
          hasIntroVideo: data.has_intro_video,
          isOnline: data.is_online,
          hasVideo: data.has_video,
          hasCameraOn: data.has_camera_on,
          birthdaySoon: data.birthday_soon,
          newProfile: data.new_profile,
          top1000: data.top_1000
        };

        setProfile(transformedProfile);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [id]);

  // Save liked profiles to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('likedProfiles', JSON.stringify(likedProfiles));
  }, [likedProfiles]);

  const handleLike = () => {
    if (!profile) return;
    setLikedProfiles(prev => {
      if (prev.includes(profile.id)) {
        return prev.filter(profileId => profileId !== profile.id);
      } else {
        return [...prev, profile.id];
      }
    });
  };
  
  const handlePrevPhoto = () => {
    if (!profile) return;
    setCurrentPhotoIndex((prev) => (prev === 0 ? profile.photos.length - 1 : prev - 1));
  };
  
  const handleNextPhoto = () => {
    if (!profile) return;
    setCurrentPhotoIndex((prev) => (prev === profile.photos.length - 1 ? 0 : prev + 1));
  };
  
  const openPhotoModal = (index: number) => {
    setCurrentPhotoIndex(index);
    setShowPhotoModal(true);
  };
  
  const closePhotoModal = () => {
    setShowPhotoModal(false);
  };

  const handleMessage = () => {
    setIsChatOpen(true);
  };

  const handleGiftButton = () => {
    if (!user) {
      // Redirect to login if not authenticated
      navigate('/login');
      return;
    }
    
    // Prevent sending gifts to yourself
    if (user.id === profile?.id) {
      alert('You cannot send gifts to yourself!');
      return;
    }
    
    // Open the chat - the ChatWindow will handle gift sending
    setOpenGiftSelectorOnOpen(true);
    setIsChatOpen(true);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || 'Profile not found'}</p>
            <Button onClick={() => navigate('/browse')} variant="outline">
              Back to Browse
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // Prevent users from viewing their own profile
  if (user && user.id === profile.id) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">You cannot view your own profile</p>
            <Button onClick={() => navigate('/browse')} variant="outline">
              Back to Browse
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const age = profile.birthDate ? new Date().getFullYear() - new Date(profile.birthDate).getFullYear() : 0;
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Photos */}
            <div className="lg:col-span-1">
              <div className="relative mb-4">
                <img
                  src={profile.photos[currentPhotoIndex]}
                  alt={`${profile.firstName}'s photo`}
                  className="w-full h-[500px] object-cover rounded-lg cursor-pointer"
                  onClick={() => openPhotoModal(currentPhotoIndex)}
                />
                
                {profile.photos.length > 1 && (
                  <>
                    <button
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 rounded-full p-1 hover:bg-white"
                      onClick={handlePrevPhoto}
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 rounded-full p-1 hover:bg-white"
                      onClick={handleNextPhoto}
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                )}
                
                {profile.verified && (
                  <div className="absolute top-2 right-2">
                    <Badge variant="verified" className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      <span>Verified</span>
                    </Badge>
                  </div>
                )}
              </div>
              
              {/* Thumbnails */}
              {profile.photos.length > 1 && (
                <div className="flex gap-2 mb-6">
                  {profile.photos.map((photo, index) => (
                    <img
                      key={index}
                      src={photo}
                      alt={`${profile.firstName}'s photo ${index + 1}`}
                      className={`h-20 w-20 object-cover rounded cursor-pointer ${
                        index === currentPhotoIndex ? 'ring-2 ring-rose-600' : ''
                      }`}
                      onClick={() => setCurrentPhotoIndex(index)}
                    />
                  ))}
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex gap-2 mb-6">
                <Button className="flex-1 gap-2" onClick={handleMessage}>
                  <MessageCircle className="h-4 w-4" />
                  <span>Message</span>
                </Button>
                <Button 
                  variant={likedProfiles.includes(profile?.id || '') ? "default" : "outline"} 
                  className={`flex-1 gap-2 ${
                    likedProfiles.includes(profile?.id || '') 
                      ? 'bg-rose-500 text-white hover:bg-rose-600' 
                      : ''
                  }`}
                  onClick={handleLike}
                >
                  <Heart className={`h-4 w-4 ${likedProfiles.includes(profile?.id || '') ? 'fill-current' : ''}`} />
                  <span>{likedProfiles.includes(profile?.id || '') ? 'Liked' : 'Like'}</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="gap-2 relative overflow-hidden group bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200 hover:border-amber-300 hover:from-amber-100 hover:to-yellow-100 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  onClick={handleGiftButton}
                >
                  {/* Animated sparkles */}
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-1 -left-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping opacity-75"></div>
                    <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-amber-400 rounded-full animate-ping opacity-75" style={{animationDelay: '0.5s'}}></div>
                    <div className="absolute -bottom-1 -left-2 w-1 h-1 bg-yellow-300 rounded-full animate-ping opacity-75" style={{animationDelay: '1s'}}></div>
                  </div>
                  
                  {/* Gift icon with animation */}
                  <Gift className="h-4 w-4 text-amber-600 group-hover:text-amber-700 group-hover:scale-110 transition-all duration-300" />
                  
                  {/* Text with gradient */}
                  <span className="bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent font-semibold group-hover:from-amber-700 group-hover:to-yellow-700 transition-all duration-300">
                    Send Gift
                  </span>
                  
                  {/* Hover effect overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-200/20 to-yellow-200/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md"></div>
                </Button>
              </div>
              
              {/* Basic Info Card */}
              <Card className="mb-6">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-4">Basic Information</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-slate-500" />
                      <div>
                        <p className="text-sm text-slate-500">Age</p>
                        <p>{age} years</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-slate-500" />
                      <div>
                        <p className="text-sm text-slate-500">Location</p>
                        <p>{profile.city}, {profile.country}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-slate-500" />
                      <div>
                        <p className="text-sm text-slate-500">Profession</p>
                        <p>{profile.profession}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Languages className="h-5 w-5 text-slate-500" />
                      <div>
                        <p className="text-sm text-slate-500">Languages</p>
                        <p>{profile.languages.join(', ')}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-slate-500" />
                      <div>
                        <p className="text-sm text-slate-500">Member Since</p>
                        <p>{new Date(profile.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              

            </div>
            
            {/* Right Column - Profile Details */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-3xl font-bold">{profile.firstName} {profile.lastName}</h1>
                  {profile.verified && (
                    <Badge variant="verified" className="flex items-center gap-1">
                      <Check className="h-3 w-3" />
                    </Badge>
                  )}
                </div>
                <p className="text-slate-600">{profile.city}, {profile.country} • {age} years old</p>
              </div>
              
              {/* About Me */}
              <Card className="mb-6">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">About Me</h2>
                  <p className="text-slate-700 whitespace-pre-line">{profile.bio}</p>
                </CardContent>
              </Card>
              
              {/* Interests */}
              <Card className="mb-6">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Interests</h2>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.map((interest, index) => (
                      <Badge key={index} variant="secondary">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              {/* Looking For */}
              <Card className="mb-6">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">What I'm Looking For</h2>
                  <p className="text-slate-700">
                    I'm looking for a genuine connection with someone who shares my interests in art and travel. 
                    I value honesty, kindness, and a good sense of humor. I hope to find a partner who is 
                    supportive, communicative, and open-minded about different cultures.
                  </p>
                </CardContent>
              </Card>
              
              {/* Cultural Background */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Cultural Background</h2>
                  <p className="text-slate-700 mb-4">
                    I was born and raised in Kyiv, Ukraine. I'm proud of my Ukrainian heritage and enjoy 
                    sharing our traditions, cuisine, and culture. I speak Ukrainian as my native language, 
                    along with Russian and English.
                  </p>
                  <p className="text-slate-700">
                    I enjoy cooking traditional Ukrainian dishes like borscht and varenyky. During holidays, 
                    I like to celebrate with traditional customs. I'm open to learning about other cultures 
                    and would love to share mine with someone special.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      {/* Photo Modal */}
      {showPhotoModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full">
            <button
              className="absolute top-4 right-4 bg-white/20 rounded-full p-2 hover:bg-white/40"
              onClick={closePhotoModal}
            >
              <X className="h-6 w-6 text-white" />
            </button>
            
            <img
              src={profile.photos[currentPhotoIndex]}
              alt={`${profile.firstName}'s photo`}
              className="w-full max-h-[80vh] object-contain"
            />
            
            <div className="absolute left-0 right-0 bottom-4 flex justify-center gap-2">
              {profile.photos.map((_, index) => (
                <button
                  key={index}
                  className={`h-2 w-2 rounded-full ${
                    index === currentPhotoIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                  onClick={() => setCurrentPhotoIndex(index)}
                />
              ))}
            </div>
            
            {profile.photos.length > 1 && (
              <>
                <button
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 rounded-full p-2 hover:bg-white/40"
                  onClick={handlePrevPhoto}
                >
                  <ChevronLeft className="h-6 w-6 text-white" />
                </button>
                <button
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 rounded-full p-2 hover:bg-white/40"
                  onClick={handleNextPhoto}
                >
                  <ChevronRight className="h-6 w-6 text-white" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
      
      <Footer />
      
      {/* Chat Window */}
      <ChatWindow
        profile={profile}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        searchFilters={{}}
        openGiftSelectorOnOpen={openGiftSelectorOnOpen}
        setOpenGiftSelectorOnOpen={setOpenGiftSelectorOnOpen}
      />
    </div>
  );
}
