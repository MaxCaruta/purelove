import { useState, useEffect, useMemo } from 'react';
import { Heart, MessageCircle, X, Check, Shield, ChevronLeft, ChevronRight, Gift } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Profile } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useToast } from './ui/toast';
import { addLike, removeLike, isProfileLiked } from '@/lib/utils';

interface ProfileCardProps {
  profile: Profile;
  onMessage?: (profile: Profile) => void;
  showMessageButton?: boolean;
  showLikeButton?: boolean;
  className?: string;
}

export function ProfileCard({ 
  profile,
  onMessage,
  showMessageButton = true,
  showLikeButton = true,
  className = ''
}: ProfileCardProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [liked, setLiked] = useState(() => isProfileLiked(profile.id));
  const { user } = useAuth();
  const toast = useToast();
  
  // Memoize age calculation to prevent unnecessary re-computations
  const age = useMemo(() => {
    return profile.birthDate ? new Date().getFullYear() - new Date(profile.birthDate).getFullYear() : 0;
  }, [profile.birthDate]);

  // Only update liked state when profile.id actually changes
  useEffect(() => {
    setLiked(isProfileLiked(profile.id));
  }, [profile.id]);

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentPhotoIndex((prev) => (prev === 0 ? profile.photos.length - 1 : prev - 1));
  };

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentPhotoIndex((prev) => (prev === profile.photos.length - 1 ? 0 : prev + 1));
  };

  const handleLike = () => {
    if (liked) {
      removeLike(profile.id);
    } else {
      addLike(profile);
    }
    setLiked(!liked);
  };

  const handleMessage = () => {
    if (!user) {
      toast.error('Please sign in to start messaging', 'Authentication Required');
      setTimeout(() => {
        window.location.href = '/lcn/login';
      }, 1500);
      return;
    }
    onMessage && onMessage(profile);
  };

  return (
    <Card className={`overflow-hidden hover-lift group animate-fade-in ${className}`}>
      <div className="relative overflow-hidden">
        <div className="transition-transform duration-500 group-hover:scale-105">
          {profile.photos && profile.photos.length > 0 && profile.photos[currentPhotoIndex] ? (
            <img 
              src={profile.photos[currentPhotoIndex]} 
              alt={`${profile.firstName}'s profile`}
              className={`w-full ${className ? 'h-[70vh]' : 'h-96'} object-cover`}
            />
          ) : (
            <div className={`w-full ${className ? 'h-[70vh]' : 'h-96'} bg-gray-200 flex items-center justify-center`}>
              <div className="text-center text-gray-500">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <p className="text-lg font-medium">No Photo</p>
                <p className="text-sm text-gray-400">Photo not available</p>
              </div>
            </div>
          )}
          
          {/* Profile info overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 text-white">
            <div className="flex items-end justify-between">
              <div className="transform transition-transform duration-300 group-hover:translate-y-[-2px]">
                <h3 className="text-2xl font-bold mb-1">{profile.firstName}, {age}</h3>
                <p className="text-white/90 text-sm flex items-center gap-1">
                  <span>{profile.city}, {profile.country}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Photo navigation */}
        {profile.photos && profile.photos.length > 1 && (
          <>
            <button
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-2 hover:bg-white hover:scale-110 transition-all duration-200 opacity-0 group-hover:opacity-100"
              onClick={handlePrevPhoto}
            >
              <ChevronLeft className="h-4 w-4 text-gray-700" />
            </button>
            <button
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-2 hover:bg-white hover:scale-110 transition-all duration-200 opacity-0 group-hover:opacity-100"
              onClick={handleNextPhoto}
            >
              <ChevronRight className="h-4 w-4 text-gray-700" />
            </button>
            
            {/* Photo indicators */}
            <div className="absolute top-4 left-0 right-0 flex justify-center gap-1">
              {profile.photos.map((_, index) => (
                <div 
                  key={index} 
                  className={`h-1 rounded-full transition-all duration-300 ${
                    index === currentPhotoIndex 
                      ? 'w-8 bg-white shadow-lg' 
                      : 'w-2 bg-white/60 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          </>
        )}
        
        {profile.verified && (
          <div className="absolute top-4 right-4 animate-bounce-subtle">
            <Badge variant="verified" className="flex items-center gap-1 shadow-lg">
              <Shield className="h-3 w-3" />
              <span>Verified</span>
            </Badge>
          </div>
        )}
      </div>
      
      <div className="p-6">
        <p className="text-gray-700 line-clamp-2 mb-4 leading-relaxed">{profile.bio}</p>
        
        <div className="flex flex-wrap gap-2 mb-4 stagger-animation">
          {profile.interests.slice(0, 3).map((interest, index) => (
            <Badge 
              key={index} 
              variant="secondary" 
              className="text-xs hover:bg-primary-100 hover:text-primary-700 transition-colors duration-200"
            >
              {interest}
            </Badge>
          ))}
          {profile.interests.length > 3 && (
            <Badge 
              variant="outline" 
              className="text-xs hover:bg-gray-100 transition-colors duration-200"
            >
              +{profile.interests.length - 3} more
            </Badge>
          )}
        </div>
        
        <div className="flex gap-3 mt-6">
          {showLikeButton && (
            <Button 
              variant="outline" 
              size="sm" 
              className={`flex-1 gap-2 ${
                liked 
                  ? 'bg-rose-500 text-white '
                  : 'hover:bg-primary-50  hover:border-primary-300'
              } transition-all duration-200`}
              onClick={handleLike}
            >
              <Heart className={`h-4 w-4 transition-all duration-200 ${liked ? 'fill-current' : ''}`} />
              <span>{liked ? 'Liked' : 'Like'}</span>
            </Button>
          )}
          
          {showMessageButton && onMessage && (
            <Button 
              variant="default" 
              size="sm" 
              className="flex-1 gap-2 hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
              onClick={handleMessage}
            >
              <MessageCircle className="h-4 w-4" />
              <span>Message</span>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
