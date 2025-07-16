import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Heart, MessageCircle, Gift, Shield, Check, Globe, Briefcase, Calendar, MapPin, Languages, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ChatWindow } from '../components/ChatWindow';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Profile } from '@/types';

// Mock data including notification profiles
const mockProfiles: Profile[] = [
  {
    id: 'c0a6fef9-7cb5-4f69-8c77-a4754e283e77',
    userId: 'c0a6fef9-7cb5-4f69-8c77-a4754e283e77',
    firstName: 'Olena',
    lastName: 'Kovalenko',
    gender: 'female',
    birthDate: '1995-05-15',
    country: 'Ukraine',
    city: 'Kyiv',
    bio: 'I feel music in every cell of my body. Looking for someone who shares my passion for arts and travel. I enjoy exploring new places, trying different cuisines, and attending cultural events. In my free time, I like to paint and play the piano. I\'m looking for a genuine connection with someone who appreciates art and has a sense of adventure.',
    interests: ['Music', 'Travel', 'Art', 'Cooking', 'Photography', 'Dancing'],
    profession: 'Graphic Designer',
    languages: ['Ukrainian', 'English', 'Russian'],
    photos: [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80',
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80'
    ],
    verified: true,
    createdAt: '2023-01-15',
  },
  // Notification profiles
  {
    id: 'n1',
    userId: 'n1',
    firstName: 'Elena',
    lastName: 'K.',
    gender: 'female',
    birthDate: '1999-05-15',
    country: 'Ukraine',
    city: 'Kyiv',
    bio: 'Sweet and romantic girl looking for true love 💕 I enjoy dancing, music, and spending time with friends. I believe in fairy tale love stories and hope to find my prince charming. In my free time, I like to read romance novels and watch romantic movies.',
    interests: ['Romance', 'Travel', 'Music', 'Dancing', 'Photography'],
    profession: 'Model',
    languages: ['Ukrainian', 'English'],
    photos: [
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=776&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80'
    ],
    verified: true,
    createdAt: '2023-01-15',
    height: 165,
    weight: 55,
    eyeColor: 'blue',
    hairColor: 'blonde',
    appearanceType: 'slim',
    alcohol: 'socially',
    smoking: 'never',
    children: 'want',
    religion: 'christian',
    zodiacSign: 'taurus',
    englishLevel: 'advanced',
    hasIntroVideo: true,
    isOnline: true,
    hasVideo: true,
  },
  {
    id: 'n2',
    userId: 'n2',
    firstName: 'Anastasia',
    lastName: 'M.',
    gender: 'female',
    birthDate: '1997-08-23',
    country: 'Russia',
    city: 'Moscow',
    bio: 'Passionate and caring, ready for serious relationship ❤️ I work as a psychologist and love helping people. I enjoy deep conversations about life, philosophy, and human nature. Looking for someone who values emotional connection.',
    interests: ['Romance', 'Art', 'Philosophy', 'Psychology', 'Literature'],
    profession: 'Psychologist',
    languages: ['Russian', 'English'],
    photos: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=776&q=80',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80'
    ],
    verified: true,
    createdAt: '2023-02-10',
    height: 170,
    weight: 58,
    eyeColor: 'brown',
    hairColor: 'brunette',
    appearanceType: 'athletic',
    alcohol: 'socially',
    smoking: 'never',
    children: 'want',
    religion: 'orthodox',
    zodiacSign: 'virgo',
    englishLevel: 'fluent',
    hasIntroVideo: false,
    isOnline: true,
    hasVideo: false,
  },
  {
    id: 'n3',
    userId: 'n3',
    firstName: 'Sofia',
    lastName: 'D.',
    gender: 'female',
    birthDate: '2001-03-18',
    country: 'Belarus',
    city: 'Minsk',
    bio: 'Young and optimistic, love dancing and meeting new people ✨ I\'m a student studying international relations. I enjoy exploring different cultures and learning languages. Always ready for new adventures and experiences.',
    interests: ['Dancing', 'Music', 'Fashion', 'Travel', 'Languages'],
    profession: 'Student',
    languages: ['Belarusian', 'Russian', 'English'],
    photos: [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80',
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80'
    ],
    verified: false,
    createdAt: '2023-03-18',
    height: 162,
    weight: 50,
    eyeColor: 'blue',
    hairColor: 'blonde',
    appearanceType: 'slim',
    alcohol: 'rarely',
    smoking: 'never',
    children: 'maybe',
    religion: 'christian',
    zodiacSign: 'pisces',
    englishLevel: 'intermediate',
    hasIntroVideo: true,
    isOnline: true,
    hasVideo: true,
  },
  {
    id: 'n4',
    userId: 'n4',
    firstName: 'Katarina',
    lastName: 'N.',
    gender: 'female',
    birthDate: '1995-07-12',
    country: 'Czech Republic',
    city: 'Prague',
    bio: 'Love exploring old cities and cozy cafes. Looking for meaningful conversations 📚 I work as a tour guide and love sharing the beauty of Prague with visitors. I enjoy history, architecture, and good coffee.',
    interests: ['History', 'Coffee', 'Architecture', 'Books', 'Travel'],
    profession: 'Tour Guide',
    languages: ['Czech', 'English', 'German'],
    photos: [
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=776&q=80'
    ],
    verified: true,
    createdAt: '2023-04-05',
    height: 168,
    weight: 56,
    eyeColor: 'green',
    hairColor: 'brown',
    appearanceType: 'athletic',
    alcohol: 'socially',
    smoking: 'never',
    children: 'want',
    religion: 'catholic',
    zodiacSign: 'cancer',
    englishLevel: 'fluent',
    hasIntroVideo: false,
    isOnline: true,
    hasVideo: false,
  },
  {
    id: 'n5',
    userId: 'n5',
    firstName: 'Alina',
    lastName: 'W.',
    gender: 'female',
    birthDate: '1998-11-25',
    country: 'Poland',
    city: 'Warsaw',
    bio: 'Creative soul who loves art and good food. Ready for new adventures 🎨 I work as a graphic designer and love creating beautiful things. I enjoy painting, cooking new recipes, and traveling to inspiring places.',
    interests: ['Art', 'Cooking', 'Travel', 'Design', 'Photography'],
    profession: 'Graphic Designer',
    languages: ['Polish', 'English', 'Spanish'],
    photos: [
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80'
    ],
    verified: true,
    createdAt: '2023-05-22',
    height: 165,
    weight: 54,
    eyeColor: 'hazel',
    hairColor: 'brown',
    appearanceType: 'slim',
    alcohol: 'socially',
    smoking: 'rarely',
    children: 'want',
    religion: 'catholic',
    zodiacSign: 'sagittarius',
    englishLevel: 'advanced',
    hasIntroVideo: true,
    isOnline: true,
    hasVideo: true,
  },
  {
    id: 'n6',
    userId: 'n6',
    firstName: 'Arina',
    lastName: 'B.',
    gender: 'female',
    birthDate: '2000-09-08',
    country: 'Kazakhstan',
    city: 'Almaty',
    bio: 'Love nature and outdoor activities. Looking for someone to share life adventures 🏔️ I\'m studying environmental science and passionate about protecting our planet. I enjoy hiking, camping, and photography in beautiful natural settings.',
    interests: ['Hiking', 'Photography', 'Nature', 'Environmental Science', 'Adventure'],
    profession: 'Environmental Science Student',
    languages: ['Kazakh', 'Russian', 'English'],
    photos: [
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80',
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80'
    ],
    verified: false,
    createdAt: '2023-06-14',
    height: 163,
    weight: 52,
    eyeColor: 'brown',
    hairColor: 'black',
    appearanceType: 'athletic',
    alcohol: 'never',
    smoking: 'never',
    children: 'maybe',
    religion: 'muslim',
    zodiacSign: 'virgo',
    englishLevel: 'intermediate',
    hasIntroVideo: false,
    isOnline: true,
    hasVideo: false,
  },
];

export function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [likedProfiles, setLikedProfiles] = useState<string[]>(() => {
    const saved = localStorage.getItem('likedProfiles');
    return saved ? JSON.parse(saved) : [];
  });
  
  // Find the profile based on the ID from the URL
  const profile = mockProfiles.find(p => p.id === id) || mockProfiles[0];
  
  const age = profile.birthDate ? new Date().getFullYear() - new Date(profile.birthDate).getFullYear() : 0;
  
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
    setCurrentPhotoIndex((prev) => (prev === 0 ? profile.photos.length - 1 : prev - 1));
  };
  
  const handleNextPhoto = () => {
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
                <Button variant="outline" className="gap-2">
                  <Gift className="h-4 w-4" />
                  <span>Gift</span>
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
              
              {/* Verification Card */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-4">Verification Status</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className={`h-5 w-5 rounded-full flex items-center justify-center ${profile.verified ? 'bg-green-100' : 'bg-slate-100'}`}>
                        {profile.verified ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <X className="h-3 w-3 text-slate-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p>Identity Verified</p>
                        <p className="text-sm text-slate-500">
                          {profile.verified
                            ? 'ID and personal information verified'
                            : 'Verification pending'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className={`h-5 w-5 rounded-full flex items-center justify-center ${profile.verified ? 'bg-green-100' : 'bg-slate-100'}`}>
                        {profile.verified ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <X className="h-3 w-3 text-slate-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p>Photo Verification</p>
                        <p className="text-sm text-slate-500">
                          {profile.verified
                            ? 'Photos match identity documents'
                            : 'Verification pending'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className={`h-5 w-5 rounded-full flex items-center justify-center ${profile.verified ? 'bg-green-100' : 'bg-slate-100'}`}>
                        {profile.verified ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <X className="h-3 w-3 text-slate-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p>Background Check</p>
                        <p className="text-sm text-slate-500">
                          {profile.verified
                            ? 'Background check completed'
                            : 'Verification pending'}
                        </p>
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
      />
    </div>
  );
}
