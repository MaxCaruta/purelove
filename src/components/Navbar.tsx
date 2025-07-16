import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Heart, Menu, X, MessageCircle, User, LogOut, CreditCard, Settings, UserPlus, Crown, Video, Users, Globe, ChevronDown, LayoutDashboard, Coins, Wifi, WifiOff } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { useAuth } from '@/context/AuthContext';
import { useChat } from '@/context/ChatContext';
import { useMessageNotifications } from '@/context/MessageNotificationContext';
import { useToast } from '@/components/ui/toast';
import { Profile } from '@/types';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isBridesOpen, setIsBridesOpen] = useState(false);
  const navigate = useNavigate();
  const { user, signOut, isAdmin } = useAuth();
  const { openChat } = useChat();
  const { totalUnreadCount } = useMessageNotifications();
  const location = useLocation();
  const toast = useToast();
  const [sessionStatus, setSessionStatus] = useState<'active' | 'checking' | 'lost'>('checking');
  const [hasSession, setHasSession] = useState(false);
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const menuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    // Reset drawer states when closing menu
    if (isMenuOpen) {
      setIsBridesOpen(false);
    }
  };

  const toggleBrides = () => {
    setIsBridesOpen(!isBridesOpen);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const openChatWindow = () => {
    if (!user) {
      toast.error('Please sign in to start messaging');
      navigate('/login');
      return;
    }
    
    // Create a demo profile for the chat
    const demoProfile: Profile = {
      id: '6a4dc632-6e3f-42a6-91b6-0644ff94c864',
      userId: '6a4dc632-6e3f-42a6-91b6-0644ff94c864',
      firstName: 'Elena',
      lastName: 'Volkov',
      gender: 'female',
      country: 'Ukraine',
      city: 'Kyiv',
      photos: ['https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400'],
      bio: 'Looking for meaningful connections and someone to share life adventures with.',
      profession: 'Designer',
      interests: ['Travel', 'Art', 'Cooking'],
      languages: ['Ukrainian', 'English', 'Russian'],
      verified: true,
      birthDate: '1995-05-15',
      height: 165,
      children: 'No children',
      smoking: 'Non-smoker',
      religion: 'Christian',
      createdAt: new Date().toISOString()
    };
    
    openChat(demoProfile);
    setIsMenuOpen(false); // Close mobile menu if open
  };

  // Check for session in localStorage immediately (synchronous)
  useEffect(() => {
    const checkLocalSession = () => {
      try {
        // Check if there's a session stored in localStorage
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const projectRef = supabaseUrl?.split('//')[1]?.split('.')[0];
        const sessionKey = `sb-${projectRef}-auth-token`;
        const sessionData = localStorage.getItem(sessionKey);
        
        if (sessionData) {
          const parsedSession = JSON.parse(sessionData);
          if (parsedSession && parsedSession.access_token) {
            // Session exists, show user as connected immediately
            setHasSession(true);
            setSessionStatus('active');
            
            // Try to extract user info from session
            if (parsedSession.user) {
              setSessionUser(parsedSession.user);
            }
            
            console.log('✅ [NAVBAR] Session found in localStorage, user connected immediately');
            return;
          }
        }
        
        // No session found
        setHasSession(false);
        setSessionUser(null);
        setSessionStatus('lost');
        console.log('❌ [NAVBAR] No session found in localStorage');
      } catch (error) {
        console.error('❌ [NAVBAR] Error checking localStorage session:', error);
        setHasSession(false);
        setSessionUser(null);
        setSessionStatus('lost');
      }
    };

    // Check immediately on mount
    checkLocalSession();
    
    // Listen for localStorage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && e.key.includes('auth-token')) {
        console.log('🔄 [NAVBAR] localStorage changed, rechecking session');
        checkLocalSession();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check when user state changes (as backup)
    if (user) {
      setHasSession(true);
      setSessionStatus('active');
    }

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user]);

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('🌐 [NAVBAR] Network is back online');
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      console.log('📴 [NAVBAR] Network went offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsBridesOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Use user from context if available, otherwise use session user
  const displayUser = user || sessionUser;
  const isConnected = hasSession || !!user;

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error('Failed to sign out');
    } else {
      toast.success('Signed out successfully');
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2 group">
            <Heart className="h-6 w-6 text-rose-500 fill-rose-500 group-hover:scale-110 transition-transform duration-200" />
            <span className="text-xl font-bold bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent">PureLove</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          {/* Brides Dropdown */}
          <div className="relative group">
            <div className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-rose-500 hover:scale-105 transition-all duration-200 py-2 px-1 cursor-pointer">
              Brides
              <ChevronDown className="h-3 w-3" />
            </div>
            
            <div className="absolute left-0 mt-2 w-64 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              <div className="py-2">
                <Link 
                  to="/browse?country=ukraine"
                  className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                >
                  <span className="text-lg">🇺🇦</span>
                  <div>
                    <div className="font-medium">Ukrainian Brides</div>
                    <div className="text-xs text-gray-500">Beautiful women from Ukraine</div>
                  </div>
                </Link>
                <Link 
                  to="/browse?country=russia"
                  className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                >
                  <span className="text-lg">🇷🇺</span>
                  <div>
                    <div className="font-medium">Russian Brides</div>
                    <div className="text-xs text-gray-500">Elegant women from Russia</div>
                  </div>
                </Link>
                <Link 
                  to="/browse?country=belarus"
                  className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                >
                  <span className="text-lg">🇧🇾</span>
                  <div>
                    <div className="font-medium">Belarusian Brides</div>
                    <div className="text-xs text-gray-500">Charming women from Belarus</div>
                  </div>
                </Link>
                <Link 
                  to="/browse?country=poland"
                  className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                >
                  <span className="text-lg">🇵🇱</span>
                  <div>
                    <div className="font-medium">Polish Brides</div>
                    <div className="text-xs text-gray-500">Amazing women from Poland</div>
                  </div>
                </Link>
                <Link 
                  to="/browse?country=kazakhstan"
                  className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                >
                  <span className="text-lg">🇰🇿</span>
                  <div>
                    <div className="font-medium">Kazakhstani Brides</div>
                    <div className="text-xs text-gray-500">Wonderful women from Kazakhstan</div>
                  </div>
                </Link>
                <Link 
                  to="/browse?country=czech"
                  className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                >
                  <span className="text-lg">🇨🇿</span>
                  <div>
                    <div className="font-medium">Czech Brides</div>
                    <div className="text-xs text-gray-500">Lovely women from Czech Republic</div>
                  </div>
                </Link>
                <Link 
                  to="/browse?country=romania"
                  className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                >
                  <span className="text-lg">🇷🇴</span>
                  <div>
                    <div className="font-medium">Romanian Brides</div>
                    <div className="text-xs text-gray-500">Gorgeous women from Romania</div>
                  </div>
                </Link>
                <Link 
                  to="/browse?country=bulgaria"
                  className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                >
                  <span className="text-lg">🇧🇬</span>
                  <div>
                    <div className="font-medium">Bulgarian Brides</div>
                    <div className="text-xs text-gray-500">Beautiful women from Bulgaria</div>
                  </div>
                </Link>
                <Link 
                  to="/browse?country=latvia"
                  className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                >
                  <span className="text-lg">🇱🇻</span>
                  <div>
                    <div className="font-medium">Latvian Brides</div>
                    <div className="text-xs text-gray-500">Stunning women from Latvia</div>
                  </div>
                </Link>
                <Link 
                  to="/browse?country=lithuania"
                  className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                >
                  <span className="text-lg">🇱🇹</span>
                  <div>
                    <div className="font-medium">Lithuanian Brides</div>
                    <div className="text-xs text-gray-500">Attractive women from Lithuania</div>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Browse Link */}
          <Link to="/browse" className="text-sm font-medium text-gray-600 hover:text-rose-500 hover:scale-105 transition-all duration-200 py-2 px-1">
            Browse
          </Link>

          {/* Pricing Link */}
          <Link to="/pricing" className="text-sm font-medium text-gray-600 hover:text-rose-500 hover:scale-105 transition-all duration-200 py-2 px-1">
            Pricing
          </Link>

          {/* Chat Link */}
          <button 
            onClick={openChatWindow}
            className="text-sm font-medium text-gray-600 hover:text-rose-500 hover:scale-105 transition-all duration-200 py-2 px-1 flex items-center gap-1"
          >
              Live Chat
          </button>

          {/* Blog */}
          <Link to="/blog" className="text-sm font-medium text-gray-600 hover:text-rose-500 hover:scale-105 transition-all duration-200 py-2 px-1">
            Blog
          </Link>
        </nav>

        {/* User Menu (Desktop) */}
        <div className="hidden lg:flex items-center gap-4">
          {displayUser ? (
            <>
              <Button 
                onClick={openChatWindow}
                variant="ghost" 
                size="icon" 
                className="relative hover:scale-110 transition-transform duration-200"
              >
                  <MessageCircle className="h-5 w-5 text-gray-600" />
                  {totalUnreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-500 text-[10px] text-white flex items-center justify-center animate-pulse">
                      {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
                    </span>
                  )}
                </Button>
              
              {/* Coin Balance */}
              <Badge variant="secondary" className="font-medium text-sm px-3 py-1 bg-gradient-to-r from-yellow-50 to-amber-50 text-amber-700 border-amber-200 hover:from-yellow-100 hover:to-amber-100 transition-all duration-200">
                <Coins className="h-4 w-4 mr-1 text-amber-600" />
                {displayUser.coins || 0}
              </Badge>

              {/* Network Status Indicator */}
              {!isOnline && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-red-50 border border-red-200 text-red-700">
                  <WifiOff className="h-4 w-4" />
                  <span className="text-xs font-medium">Offline</span>
                </div>
              )}
              
              {/* Dashboard Link */}
              <Link to="/dashboard">
                <Button variant="ghost" className="flex items-center gap-2 text-gray-600 hover:text-rose-600 hover:bg-rose-50">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Button>
              </Link>

              {/* Admin Link (only for admin users) */}
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="ghost" className="flex items-center gap-2 text-gray-600 hover:text-red-600 hover:bg-red-50">
                    <Settings className="h-4 w-4" />
                    Admin
                  </Button>
                </Link>
              )}
              
              {/* User Avatar */}
              <Link to="/dashboard">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar>
                    <AvatarImage src={displayUser.photos?.[0] || "https://danielschule.de/wp-content/uploads/2019/12/avatar.jpg"} />
                    <AvatarFallback>{displayUser.firstName?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" className="text-gray-600 hover:text-rose-600 hover:bg-rose-50">
                  Sign In
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-rose-500 hover:bg-rose-600 text-white px-6">
                  Join Now
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="lg:hidden" onClick={toggleMenu}>
          {isMenuOpen ? (
            <X className="h-6 w-6 text-gray-600" />
          ) : (
            <Menu className="h-6 w-6 text-gray-600" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden border-t animate-fade-in bg-white/95 backdrop-blur-md">
          <div className="container mx-auto px-4 py-6 space-y-6">
            <nav className="flex flex-col space-y-4">
              {/* Brides Section */}
              <div className="space-y-2">
                <button 
                  onClick={toggleBrides}
                  className="flex items-center justify-between w-full text-sm  text-gray-800 py-1 hover:text-rose-600 transition-colors"
                >
                  <div className="flex items-center gap-2">
                  Brides 
                </div>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isBridesOpen ? 'rotate-180' : ''}`} />
                </button>
                {isBridesOpen && (
                  <div className="ml-6 space-y-2 animate-fade-in">
                  <Link to="/browse?country=ukraine" className="flex items-center gap-2 text-sm text-gray-600 hover:text-rose-500 py-1" onClick={toggleMenu}>
                    <span>🇺🇦</span> Ukrainian Brides
                  </Link>
                  <Link to="/browse?country=russia" className="flex items-center gap-2 text-sm text-gray-600 hover:text-rose-500 py-1" onClick={toggleMenu}>
                    <span>🇷🇺</span> Russian Brides
                  </Link>
                  <Link to="/browse?country=belarus" className="flex items-center gap-2 text-sm text-gray-600 hover:text-rose-500 py-1" onClick={toggleMenu}>
                    <span>🇧🇾</span> Belarusian Brides
                  </Link>
                  <Link to="/browse?country=poland" className="flex items-center gap-2 text-sm text-gray-600 hover:text-rose-500 py-1" onClick={toggleMenu}>
                    <span>🇵🇱</span> Polish Brides
                  </Link>
                  <Link to="/browse?country=kazakhstan" className="flex items-center gap-2 text-sm text-gray-600 hover:text-rose-500 py-1" onClick={toggleMenu}>
                    <span>🇰🇿</span> Kazakhstani Brides
                  </Link>
                  <Link to="/browse?country=czech" className="flex items-center gap-2 text-sm text-gray-600 hover:text-rose-500 py-1" onClick={toggleMenu}>
                    <span>🇨🇿</span> Czech Brides
                  </Link>
                  <Link to="/browse?country=romania" className="flex items-center gap-2 text-sm text-gray-600 hover:text-rose-500 py-1" onClick={toggleMenu}>
                    <span>🇷🇴</span> Romanian Brides
                  </Link>
                  <Link to="/browse?country=bulgaria" className="flex items-center gap-2 text-sm text-gray-600 hover:text-rose-500 py-1" onClick={toggleMenu}>
                    <span>🇧🇬</span> Bulgarian Brides
                  </Link>
                  <Link to="/browse?country=latvia" className="flex items-center gap-2 text-sm text-gray-600 hover:text-rose-500 py-1" onClick={toggleMenu}>
                    <span>🇱🇻</span> Latvian Brides
                  </Link>
                  <Link to="/browse?country=lithuania" className="flex items-center gap-2 text-sm text-gray-600 hover:text-rose-500 py-1" onClick={toggleMenu}>
                    <span>🇱🇹</span> Lithuanian Brides
                  </Link>
                </div>
                )}
              </div>

              {/* Browse */}
              <Link to="/browse" className="text-sm font-medium text-gray-600 hover:text-rose-500 py-2" onClick={toggleMenu}>
                Browse All Profiles
              </Link>

              {/* Pricing */}
              <Link to="/pricing" className="text-sm font-medium text-gray-600 hover:text-rose-500 py-2" onClick={toggleMenu}>
                Pricing
              </Link>

              {/* Chat */}
              <button 
                onClick={openChatWindow}
                className="text-sm font-medium text-gray-600 hover:text-rose-500 py-2 flex items-center gap-2"
              >
                Live Chat
              </button>

              {/* Other Links */}
              <Link to="/blog" className="text-sm font-medium text-gray-600 hover:text-rose-500 py-2" onClick={toggleMenu}>
                Blog
              </Link>
            </nav>
            
            {displayUser ? (
              <div className="flex flex-col space-y-4 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={displayUser.photos?.[0] || "https://danielschule.de/wp-content/uploads/2019/12/avatar.jpg"} />
                      <AvatarFallback>{displayUser.firstName?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{displayUser.firstName} {displayUser.lastName}</p>
                      <p className="text-xs text-gray-500">{displayUser.email}</p>
                      {!isOnline && (
                        <div className="flex items-center gap-1 text-red-600 text-xs mt-1">
                          <WifiOff className="h-3 w-3" />
                          <span>Offline</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Badge variant="secondary" className="font-medium">
                    {displayUser.coins || 0} Coins
                  </Badge>
                </div>
                
                <Link to="/dashboard" className="flex items-center gap-2" onClick={toggleMenu}>
                  <LayoutDashboard className="h-5 w-5" />
                  <span>Dashboard</span>
                </Link>

                {/* Admin Link (only for admin users) */}
                {isAdmin && (
                  <Link to="/admin" className="flex items-center gap-2 text-red-600" onClick={toggleMenu}>
                    <Settings className="h-5 w-5" />
                    <span>Admin Panel</span>
                  </Link>
                )}
                
                <button 
                  onClick={openChatWindow} 
                  className="flex items-center gap-2 w-full text-left"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>Messages</span>
                  {totalUnreadCount > 0 && (
                    <span className="ml-auto h-5 w-5 rounded-full bg-rose-500 text-[10px] text-white flex items-center justify-center">
                      {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
                    </span>
                  )}
                </button>
                
                <button
                  onClick={() => {
                    handleLogout();
                    toggleMenu();
                  }}
                  className="flex items-center gap-2 text-red-600"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-3 pt-6 border-t border-gray-200">
                <Link to="/login" onClick={toggleMenu}>
                  <Button variant="outline" className="w-full text-gray-600 border-gray-300 hover:text-rose-600 hover:border-rose-300">
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup" onClick={toggleMenu}>
                  <Button className="w-full bg-rose-500 hover:bg-rose-600 text-white">
                    Join Now
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

    </header>
  );
}
