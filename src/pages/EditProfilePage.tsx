import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Plus, X, Save, ArrowLeft } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { countries, interests } from '@/lib/utils';

export function EditProfilePage() {
  const { user, updateProfile, uploadProfilePhoto } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    gender: user?.gender || 'male',
    birthDate: user?.birthDate || '',
    country: user?.country || '',
    city: user?.city || '',
    bio: user?.bio || '',
    profession: user?.profession || '',
    interests: user?.interests || [],
    languages: user?.languages || [],
  });
  const [photos, setPhotos] = useState<string[]>(user?.photos || []);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => {
      const newInterests = prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest];
      
      return { ...prev, interests: newInterests };
    });
  };

  const handleLanguageToggle = (language: string) => {
    setFormData(prev => {
      const newLanguages = prev.languages.includes(language)
        ? prev.languages.filter(l => l !== language)
        : [...prev.languages, language];
      
      return { ...prev, languages: newLanguages };
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, photo: 'Please upload an image file' }));
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, photo: 'Image size should be less than 5MB' }));
      return;
    }

    try {
      setIsUploading(true);
      const { url, error } = await uploadProfilePhoto(file);
      
      if (error) {
        throw error;
      }
      
      if (url) {
        setPhotos(prev => [...prev, url]);
      }
    } catch (err) {
      console.error('Error uploading photo:', err);
      setErrors(prev => ({ ...prev, photo: 'Failed to upload photo. Please try again.' }));
    } finally {
      setIsUploading(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePhoto = (photoUrl: string) => {
    setPhotos(prev => prev.filter(url => url !== photoUrl));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.birthDate) {
      newErrors.birthDate = 'Birth date is required';
    } else {
      const birthYear = new Date(formData.birthDate).getFullYear();
      const currentYear = new Date().getFullYear();
      if (currentYear - birthYear < 18) {
        newErrors.birthDate = 'You must be at least 18 years old';
      }
    }
    
    if (!formData.country) {
      newErrors.country = 'Country is required';
    }
    
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsSaving(true);
      
      const profileData = {
        ...formData,
        photos,
      };
      
      const { error } = await updateProfile(profileData);
      
      if (error) {
        throw error;
      }
      
      // Navigate back to dashboard on success
      navigate('/dashboard');
    } catch (err) {
      console.error('Error updating profile:', err);
      setErrors(prev => ({ ...prev, form: 'Failed to update profile. Please try again.' }));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 mb-6">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Edit Profile</h1>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Photos */}
              <div className="lg:col-span-1">
                <Card className="mb-6">
                  <CardContent className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Profile Photos</h2>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      {photos.map((photo, index) => (
                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                          <img 
                            src={photo} 
                            alt={`Profile photo ${index + 1}`} 
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            className="absolute top-2 right-2 bg-white/80 rounded-full p-1 hover:bg-white"
                            onClick={() => handleRemovePhoto(photo)}
                          >
                            <X className="h-4 w-4 text-red-500" />
                          </button>
                          {index === 0 && (
                            <Badge 
                              variant="default" 
                              className="absolute bottom-2 left-2"
                            >
                              Main Photo
                            </Badge>
                          )}
                        </div>
                      ))}
                      
                      {photos.length < 6 && (
                        <div 
                          className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-primary-500 transition-colors"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <div className="text-center">
                            <Plus className="h-8 w-8 mx-auto text-gray-400" />
                            <span className="text-sm text-gray-500">Add Photo</span>
                          </div>
                          <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            disabled={isUploading}
                          />
                        </div>
                      )}
                    </div>
                    
                    {errors.photo && (
                      <p className="text-red-500 text-sm mt-1">{errors.photo}</p>
                    )}
                    
                    <div className="text-sm text-gray-500">
                      <p>• Upload up to 6 photos</p>
                      <p>• First photo will be your main profile picture</p>
                      <p>• Photos should clearly show your face</p>
                      <p>• Maximum file size: 5MB</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Verification</h2>
                    
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-primary-100 h-10 w-10 rounded-full flex items-center justify-center">
                        <Camera className="h-5 w-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium">Verify your profile</p>
                        <p className="text-sm text-gray-500">Get a verified badge to increase trust</p>
                      </div>
                    </div>
                    
                    <Button variant="outline" className="w-full">
                      Start Verification
                    </Button>
                  </CardContent>
                </Card>
              </div>
              
              {/* Right Column - Profile Details */}
              <div className="lg:col-span-2">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
                    
                    {errors.form && (
                      <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
                        {errors.form}
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium mb-1">
                          First Name
                        </label>
                        <Input
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className={errors.firstName ? 'border-red-500' : ''}
                        />
                        {errors.firstName && (
                          <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor="lastName" className="block text-sm font-medium mb-1">
                          Last Name
                        </label>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className={errors.lastName ? 'border-red-500' : ''}
                        />
                        {errors.lastName && (
                          <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor="gender" className="block text-sm font-medium mb-1">
                          Gender
                        </label>
                        <Select
                          id="gender"
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                        >
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </Select>
                      </div>
                      
                      <div>
                        <label htmlFor="birthDate" className="block text-sm font-medium mb-1">
                          Birth Date
                        </label>
                        <Input
                          id="birthDate"
                          name="birthDate"
                          type="date"
                          value={formData.birthDate}
                          onChange={handleInputChange}
                          className={errors.birthDate ? 'border-red-500' : ''}
                        />
                        {errors.birthDate && (
                          <p className="text-red-500 text-sm mt-1">{errors.birthDate}</p>
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor="country" className="block text-sm font-medium mb-1">
                          Country
                        </label>
                        <Select
                          id="country"
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          className={errors.country ? 'border-red-500' : ''}
                        >
                          <option value="">Select country</option>
                          {countries.map(country => (
                            <option key={country.value} value={country.value}>
                              {country.label}
                            </option>
                          ))}
                        </Select>
                        {errors.country && (
                          <p className="text-red-500 text-sm mt-1">{errors.country}</p>
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor="city" className="block text-sm font-medium mb-1">
                          City
                        </label>
                        <Input
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className={errors.city ? 'border-red-500' : ''}
                        />
                        {errors.city && (
                          <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                        )}
                      </div>
                      
                      <div className="md:col-span-2">
                        <label htmlFor="profession" className="block text-sm font-medium mb-1">
                          Profession
                        </label>
                        <Input
                          id="profession"
                          name="profession"
                          value={formData.profession}
                          onChange={handleInputChange}
                          placeholder="e.g. Software Engineer, Teacher, Artist"
                        />
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <label htmlFor="bio" className="block text-sm font-medium mb-1">
                        About Me
                      </label>
                      <Textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        placeholder="Tell others about yourself, your interests, and what you're looking for..."
                        className="min-h-[120px]"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        {formData.bio.length}/500 characters
                      </p>
                    </div>
                    
                    <div className="mb-6">
                      <label className="block text-sm font-medium mb-2">
                        Interests
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {interests.map(interest => (
                          <Badge
                            key={interest}
                            variant={formData.interests.includes(interest) ? 'default' : 'outline'}
                            className="cursor-pointer px-3 py-1"
                            onClick={() => handleInterestToggle(interest)}
                          >
                            {interest}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Select up to 10 interests that describe you
                      </p>
                    </div>
                    
                    <div className="mb-6">
                      <label className="block text-sm font-medium mb-2">
                        Languages
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {['English', 'Russian', 'Ukrainian', 'Kazakh', 'French', 'German', 'Spanish', 'Italian', 'Chinese', 'Japanese'].map(language => (
                          <Badge
                            key={language}
                            variant={formData.languages.includes(language) ? 'default' : 'outline'}
                            className="cursor-pointer px-3 py-1"
                            onClick={() => handleLanguageToggle(language)}
                          >
                            {language}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate(-1)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSaving}
                        className="gap-2"
                      >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                        {!isSaving && <Save className="h-4 w-4" />}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
