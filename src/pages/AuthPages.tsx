import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Heart, Mail, Lock, User, Calendar, MapPin, Globe, Check, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NotificationToast } from '@/components/ui/notification-toast';
import { countries } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

export function LoginPage() {
  const { signIn, user, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Redirect if user is already logged in
  useEffect(() => {
    if (!loading && user) {
      console.log('🔄 [LOGIN] User already logged in, redirecting to dashboard...');
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);
  
  // Show email confirmation notice only if coming from signup or if specified in URL
  const showEmailConfirmation = location.state?.showEmailConfirmation || 
                                new URLSearchParams(location.search).get('confirm') === 'true';
  
  // Don't render the login form if user is logged in or still loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }
  
  const handleLogin = async (e: React.FormEvent) => {
    console.log('🚀 [UI] handleLogin called');
    
    e.preventDefault();
    
    // Prevent duplicate submissions
    if (isLoading) {
      console.log('⚠️ [UI] Already loading, ignoring duplicate submission');
      return;
    }
    
    console.log('🔄 [UI] Setting loading state...');
    setIsLoading(true);
    setError('');
    
    try {
      console.log('📧 [UI] Login credentials:', { email, password: '***', rememberMe });
      
      console.log('🔄 [UI] Calling signIn from auth context...');
      const { error } = await signIn(email, password, rememberMe);
      
      console.log('✅ [UI] signIn returned');
      console.log('❌ [UI] Error present:', !!error);
      
      if (error) {
        console.log('❌ [UI] Login error:', error);
        if (error.message.includes('timeout')) {
          setError('Connection timeout. Please check your internet connection and try again.');
        } else {
          setError(error.message || 'Invalid email or password. Please try again.');
        }
      } else {
        console.log('✅ [UI] Login successful, user state will be updated and useEffect will handle redirect...');
        // The useEffect will handle the redirect when user state updates
      }
    } catch (err: any) {
      console.error('❌ [UI] Exception in handleLogin:', err);
      if (err.message?.includes('timeout')) {
        setError('Connection timeout. Please check your internet connection and try again.');
      } else {
        setError('Invalid email or password. Please try again.');
      }
    } finally {
      console.log('🔄 [UI] Setting loading to false...');
      setIsLoading(false);
      console.log('✅ [UI] Loading state cleared');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Heart className="h-8 w-8 text-rose-600" />
            <span className="text-2xl font-bold">PureLove</span>
          </div>
          <h1 className="text-2xl font-bold">Welcome Back</h1>
          <p className="text-slate-600">Sign in to your account to continue</p>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            {/* Email confirmation notice */}
            {showEmailConfirmation && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-blue-800">Email Confirmation Required</h3>
                    <p className="text-sm text-blue-700 mt-1">
                      Please check your email and click the confirmation link before signing in.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
                {error}
              </div>
            )}
            
            <form onSubmit={handleLogin}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-600"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600">
                      Remember me
                    </label>
                  </div>
                  
                  <div className="text-sm">
                    <Link to="/forgot-password" className="text-rose-600 hover:text-rose-700">
                      Forgot password?
                    </Link>
                  </div>
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </div>
            </form>
          </CardContent>
          
          <CardFooter className="flex justify-center border-t p-6">
            <p className="text-sm text-slate-600">
              Don't have an account?{' '}
              <Link to="/signup" className="text-rose-600 hover:text-rose-700 font-medium">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export function SignupPage() {
  const { signUp, user, loading } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    gender: 'male',
    birthDate: '',
    country: '',
    city: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  
  // Redirect if user is already logged in
  useEffect(() => {
    if (!loading && user) {
      console.log('🔄 [SIGNUP] User already logged in, redirecting to dashboard...');
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);
  
  // Don't render the signup form if user is logged in or still loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }
  
  // Function to calculate age from birth date
  const calculateAge = (birthDate: string): number => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 1) {
      if (formData.password !== formData.confirmPassword) {
        setNotification({ message: 'Passwords do not match', type: 'error' });
        return;
      }
      setStep(2);
    } else if (step === 2) {
      handleSignup(e);
    }
  };
  
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Simple age validation
      const age = calculateAge(formData.birthDate);
      if (age < 18) {
        setNotification({ message: 'You must be at least 18 years old to sign up.', type: 'error' });
        setIsLoading(false);
        return;
      }
      
      console.log('Signing up with:', formData);
      
      const { error } = await signUp(formData.email, formData.password, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        gender: formData.gender as 'male' | 'female',
        birthDate: formData.birthDate,
        country: formData.country,
        city: formData.city,
      });
      
      if (error) {
        if (error.message?.includes('timeout')) {
          setNotification({ message: 'Connection timeout. Please check your internet connection and try again.', type: 'error' });
        } else {
          setNotification({ message: error.message || 'An error occurred during signup. Please try again.', type: 'error' });
        }
      } else {
        // Show success message and redirect to login page
        setNotification({ message: 'Account created! Please check your email to confirm your account, then sign in.', type: 'success' });
        setTimeout(() => {
          navigate('/login', { state: { showEmailConfirmation: true } });
        }, 3000); // Redirect after 3 seconds to show the success message
      }
    } catch (err: any) {
      if (err.message?.includes('timeout')) {
        setNotification({ message: 'Connection timeout. Please check your internet connection and try again.', type: 'error' });
      } else {
        setNotification({ message: 'An error occurred during signup. Please try again.', type: 'error' });
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePrevStep = () => {
    setStep(1);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Heart className="h-8 w-8 text-rose-600" />
            <span className="text-2xl font-bold">PureLove</span>
          </div>
          <h1 className="text-2xl font-bold">Create Your Account</h1>
          <p className="text-slate-600">Join our community and find your perfect match</p>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            {/* Step Indicator */}
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-rose-600 text-white">
                  1
                </div>
                <div className={`h-1 w-16 ${step >= 2 ? 'bg-rose-600' : 'bg-slate-200'}`}></div>
                <div className={`flex items-center justify-center h-8 w-8 rounded-full ${
                  step >= 2 ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  2
                </div>
              </div>
            </div>
            
            {notification && (
              <NotificationToast
                message={notification.message}
                type={notification.type}
                onClose={() => setNotification(null)}
              />
            )}
            
            <form onSubmit={handleNextStep}>
              {step === 1 ? (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={handleChange}
                        className="pl-9"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        className="pl-9"
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-400"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Password must be at least 8 characters long
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="pl-9"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3 text-slate-400"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium mb-1">
                        First Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                          id="firstName"
                          name="firstName"
                          type="text"
                          placeholder="John"
                          value={formData.firstName}
                          onChange={handleChange}
                          className="pl-9"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium mb-1">
                        Last Name
                      </label>
                      <Input
                        id="lastName"
                        name="lastName"
                        type="text"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="gender" className="block text-sm font-medium mb-1">
                      I am a
                    </label>
                    <Select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      required
                    >
                      <option value="male">Man</option>
                      <option value="female">Woman</option>
                    </Select>
                  </div>
                  
                  <div>
                    <label htmlFor="birthDate" className="block text-sm font-medium mb-1">
                      Date of Birth
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="birthDate"
                        name="birthDate"
                        type="date"
                        value={formData.birthDate}
                        onChange={handleChange}
                        className="pl-9"
                        required
                        max={new Date().toISOString().split('T')[0]}
                        min={new Date(Date.now() - 100 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium mb-1">
                      Country
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Select
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        className="pl-9"
                        required
                      >
                        <option value="">Select your country</option>
                        {countries.map((country) => (
                          <option key={country.value} value={country.value}>
                            {country.label}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium mb-1">
                      City
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="city"
                        name="city"
                        type="text"
                        placeholder="New York"
                        value={formData.city}
                        onChange={handleChange}
                        className="pl-9"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mt-6 flex gap-4">
                {step === 2 && (
                  <Button type="button" variant="outline" className="flex-1" onClick={handlePrevStep}>
                    Back
                  </Button>
                )}
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading
                    ? 'Processing...'
                    : step === 1
                    ? 'Next'
                    : 'Create Account'}
                </Button>
              </div>
            </form>
          </CardContent>
          
          <CardFooter className="flex justify-center border-t p-6">
            <p className="text-sm text-slate-600">
              Already have an account?{' '}
              <Link to="/login" className="text-rose-600 hover:text-rose-700 font-medium">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
        
        <div className="mt-6 text-center text-sm text-slate-500">
          By signing up, you agree to our{' '}
          <Link to="/terms" className="text-rose-600 hover:text-rose-700">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link to="/privacy" className="text-rose-600 hover:text-rose-700">
            Privacy Policy
          </Link>
          .
        </div>
      </div>
    </div>
  );
}
