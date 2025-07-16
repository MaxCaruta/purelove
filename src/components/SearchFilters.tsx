import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapPin, Users, Heart, Globe, Check, X, Eye, Wine, Baby, Church, Star, MessageCircle, Video, Camera, Gift, Sparkles, Crown } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select } from './ui/select';
import { Badge } from './ui/badge';
import { countries, interests } from '@/lib/utils';
import { scrollToTop } from './ScrollToTop';

interface SearchFiltersProps {
  onFiltersChange: (filters: Record<string, any>) => void;
  initialFilters?: Record<string, any>;
}

export function SearchFilters({ onFiltersChange, initialFilters = {} }: SearchFiltersProps) {
  const [, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<Record<string, any>>({
    ageMin: initialFilters?.ageMin || 18,
    ageMax: initialFilters?.ageMax || 99,
    country: initialFilters?.country || '',
    city: initialFilters?.city || '',
    eyeColor: initialFilters?.eyeColor || '',
    hairColor: initialFilters?.hairColor || '',
    appearanceType: initialFilters?.appearanceType || '',
    alcohol: initialFilters?.alcohol || '',
    smoking: initialFilters?.smoking || '',
    children: initialFilters?.children || '',
    religion: initialFilters?.religion || '',
    zodiacSign: initialFilters?.zodiacSign || '',
    englishLevel: initialFilters?.englishLevel || '',
    interests: initialFilters?.interests || [],
    languages: initialFilters?.languages || [],
    hasIntroVideo: initialFilters?.hasIntroVideo || false,
    isOnline: initialFilters?.isOnline || false,
    hasVideo: initialFilters?.hasVideo || false,
    hasCameraOn: initialFilters?.hasCameraOn || false,
    birthdaySoon: initialFilters?.birthdaySoon || false,
    newProfile: initialFilters?.newProfile || false,
    top1000: initialFilters?.top1000 || false,
    verified: initialFilters?.verified || false,
  });
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  // Update filters when initialFilters change
  useEffect(() => {
    if (initialFilters && Object.keys(initialFilters).length > 0) {
      setFilters(prev => ({
        ...prev,
        ...initialFilters,
        interests: initialFilters.interests || [],
        languages: initialFilters.languages || [],
      }));
    }
  }, [initialFilters]);

  // Auto-search when filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      // Only trigger search if filters have actually changed from initial state
      const hasChanged = Object.keys(filters).some(key => {
        const currentValue = filters[key];
        const initialValue = initialFilters?.[key];
        
        // Handle arrays specially
        if (Array.isArray(currentValue) && Array.isArray(initialValue)) {
          return currentValue.length !== initialValue.length || 
                 !currentValue.every((item, index) => item === initialValue[index]);
        }
        
        return currentValue !== initialValue;
      });
      
      console.log('🔍 [SEARCH_FILTERS] Checking if filters changed:', hasChanged);
      console.log('🔍 [SEARCH_FILTERS] Current filters:', filters);
      console.log('🔍 [SEARCH_FILTERS] Initial filters:', initialFilters);
      
      if (hasChanged) {
        console.log('🔍 [SEARCH_FILTERS] Triggering search due to filter changes');
        handleSearch();
      } else {
        console.log('🔍 [SEARCH_FILTERS] No changes detected, skipping search');
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [filters, initialFilters]);

  // Don't trigger initial search when component mounts with default filters
  const [hasInitialized, setHasInitialized] = useState(false);
  
  useEffect(() => {
    if (!hasInitialized) {
      setHasInitialized(true);
      return;
    }
    
    // Only trigger search after initial mount
    const timer = setTimeout(() => {
      console.log('🔍 [SEARCH_FILTERS] Initial mount - not triggering search');
    }, 100);
    
    return () => clearTimeout(timer);
  }, [hasInitialized]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    console.log('🔍 [SEARCH_FILTERS] handleInputChange:', name, '=', value);
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSliderChange = (name: string, value: number) => {
    console.log('🔍 [SEARCH_FILTERS] handleSliderChange:', name, '=', value);
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    console.log('🔍 [SEARCH_FILTERS] handleCheckboxChange:', name, '=', checked);
    setFilters((prev) => ({ ...prev, [name]: checked }));
  };

  const handleInterestChange = (interest: string) => {
    console.log('🔍 [SEARCH_FILTERS] handleInterestChange:', interest);
    setFilters((prev) => {
      const newInterests = prev.interests.includes(interest)
        ? prev.interests.filter((i: string) => i !== interest)
        : [...prev.interests, interest];
      console.log('🔍 [SEARCH_FILTERS] New interests:', newInterests);
      return { ...prev, interests: newInterests };
    });
  };

  const handleLanguageChange = (language: string) => {
    console.log('🔍 [SEARCH_FILTERS] handleLanguageChange:', language);
    setFilters((prev) => {
      const newLanguages = prev.languages.includes(language)
        ? prev.languages.filter((l: string) => l !== language)
        : [...prev.languages, language];
      console.log('🔍 [SEARCH_FILTERS] New languages:', newLanguages);
      return { ...prev, languages: newLanguages };
    });
  };

  const handleSearch = () => {
    console.log('🔍 [SEARCH_FILTERS] handleSearch called with filters:', filters);
    
    // Build active filters list
    const newActiveFilters: string[] = [];
    if (filters.ageMin !== 18 || filters.ageMax !== 99) {
      newActiveFilters.push(`Age: ${filters.ageMin}-${filters.ageMax}`);
    }
    if (filters.country) newActiveFilters.push(`Country: ${filters.country}`);
    if (filters.city) newActiveFilters.push(`City: ${filters.city}`);
    if (filters.eyeColor) newActiveFilters.push(`Eyes: ${filters.eyeColor}`);
    if (filters.hairColor) newActiveFilters.push(`Hair: ${filters.hairColor}`);
    if (filters.appearanceType) newActiveFilters.push(`Type: ${filters.appearanceType}`);
    if (filters.alcohol) newActiveFilters.push(`Alcohol: ${filters.alcohol}`);
    if (filters.smoking) newActiveFilters.push(`Smoking: ${filters.smoking}`);
    if (filters.children) newActiveFilters.push(`Children: ${filters.children}`);
    if (filters.religion) newActiveFilters.push(`Religion: ${filters.religion}`);
    if (filters.zodiacSign) newActiveFilters.push(`Zodiac: ${filters.zodiacSign}`);
    if (filters.englishLevel) newActiveFilters.push(`English: ${filters.englishLevel}`);
    
    filters.interests.forEach((interest: string) => {
      newActiveFilters.push(`${interest}`);
    });
    
    filters.languages.forEach((language: string) => {
      newActiveFilters.push(`${language}`);
    });
    
    if (filters.hasIntroVideo) newActiveFilters.push('Has Intro Video');
    if (filters.isOnline) newActiveFilters.push('Online');
    if (filters.hasVideo) newActiveFilters.push('Has Video');
    if (filters.hasCameraOn) newActiveFilters.push('Camera On');
    if (filters.birthdaySoon) newActiveFilters.push('Birthday Soon');
    if (filters.newProfile) newActiveFilters.push('New Profile');
    if (filters.top1000) newActiveFilters.push('Top 1000');
    if (filters.verified) newActiveFilters.push('Verified');
    
    console.log('🔍 [SEARCH_FILTERS] Active filters:', newActiveFilters);
    console.log('🔍 [SEARCH_FILTERS] Calling onFiltersChange with:', filters);
    
    setActiveFilters(newActiveFilters);
    onFiltersChange(filters);
  };

  const clearFilters = () => {
    console.log('🔍 [SEARCH_FILTERS] clearFilters called');
    
    const clearedFilters = {
      ageMin: 18,
      ageMax: 99,
      country: '',
      city: '',
      eyeColor: '',
      hairColor: '',
      appearanceType: '',
      alcohol: '',
      smoking: '',
      children: '',
      religion: '',
      zodiacSign: '',
      englishLevel: '',
      interests: [],
      languages: [],
      hasIntroVideo: false,
      isOnline: false,
      hasVideo: false,
      hasCameraOn: false,
      birthdaySoon: false,
      newProfile: false,
      top1000: false,
      verified: false,
    };
    
    console.log('🔍 [SEARCH_FILTERS] Setting cleared filters:', clearedFilters);
    
    setFilters(clearedFilters);
    setActiveFilters([]);
    
    // Clear URL parameters
    setSearchParams({});
    
    console.log('🔍 [SEARCH_FILTERS] Calling onFiltersChange with cleared filters');
    onFiltersChange(clearedFilters);
    
    // Scroll to top when clearing filters
    scrollToTop();
  };

  const removeFilter = (filter: string) => {
    console.log('🔍 [SEARCH_FILTERS] removeFilter called with:', filter);
    
    if (filter.startsWith('Age:')) {
      console.log('🔍 [SEARCH_FILTERS] Removing age filter');
      setFilters(prev => ({ ...prev, ageMin: 18, ageMax: 99 }));
    } else if (filter.startsWith('Country:')) {
      console.log('🔍 [SEARCH_FILTERS] Removing country filter');
      setFilters(prev => ({ ...prev, country: '' }));
    } else if (filter.startsWith('City:')) {
      console.log('🔍 [SEARCH_FILTERS] Removing city filter');
      setFilters(prev => ({ ...prev, city: '' }));
    } else if (filter.startsWith('Eyes:')) {
      console.log('🔍 [SEARCH_FILTERS] Removing eye color filter');
      setFilters(prev => ({ ...prev, eyeColor: '' }));
    } else if (filter.startsWith('Hair:')) {
      console.log('🔍 [SEARCH_FILTERS] Removing hair color filter');
      setFilters(prev => ({ ...prev, hairColor: '' }));
    } else if (filter.startsWith('Type:')) {
      console.log('🔍 [SEARCH_FILTERS] Removing appearance type filter');
      setFilters(prev => ({ ...prev, appearanceType: '' }));
    } else if (filter.startsWith('Alcohol:')) {
      console.log('🔍 [SEARCH_FILTERS] Removing alcohol filter');
      setFilters(prev => ({ ...prev, alcohol: '' }));
    } else if (filter.startsWith('Smoking:')) {
      console.log('🔍 [SEARCH_FILTERS] Removing smoking filter');
      setFilters(prev => ({ ...prev, smoking: '' }));
    } else if (filter.startsWith('Children:')) {
      console.log('🔍 [SEARCH_FILTERS] Removing children filter');
      setFilters(prev => ({ ...prev, children: '' }));
    } else if (filter.startsWith('Religion:')) {
      console.log('🔍 [SEARCH_FILTERS] Removing religion filter');
      setFilters(prev => ({ ...prev, religion: '' }));
    } else if (filter.startsWith('Zodiac:')) {
      console.log('🔍 [SEARCH_FILTERS] Removing zodiac filter');
      setFilters(prev => ({ ...prev, zodiacSign: '' }));
    } else if (filter.startsWith('English:')) {
      console.log('🔍 [SEARCH_FILTERS] Removing english level filter');
      setFilters(prev => ({ ...prev, englishLevel: '' }));
    } else if (interests.includes(filter)) {
      console.log('🔍 [SEARCH_FILTERS] Removing interest filter:', filter);
      setFilters(prev => ({ 
        ...prev, 
        interests: prev.interests.filter((i: string) => i !== filter)
      }));
    } else if (['English', 'Russian', 'Ukrainian', 'Kazakh', 'Belarusian', 'Polish', 'Czech', 'Romanian', 'Bulgarian', 'Serbian', 'Croatian', 'Latvian', 'Lithuanian', 'Estonian', 'Hungarian', 'Slovak', 'Slovenian', 'German', 'French', 'Italian', 'Spanish', 'Portuguese'].includes(filter)) {
      console.log('🔍 [SEARCH_FILTERS] Removing language filter:', filter);
      setFilters(prev => ({ 
        ...prev, 
        languages: prev.languages.filter((l: string) => l !== filter)
      }));
    } else if (filter === 'Has Intro Video') {
      console.log('🔍 [SEARCH_FILTERS] Removing has intro video filter');
      setFilters(prev => ({ ...prev, hasIntroVideo: false }));
    } else if (filter === 'Online') {
      console.log('🔍 [SEARCH_FILTERS] Removing online filter');
      setFilters(prev => ({ ...prev, isOnline: false }));
    } else if (filter === 'Has Video') {
      console.log('🔍 [SEARCH_FILTERS] Removing has video filter');
      setFilters(prev => ({ ...prev, hasVideo: false }));
    } else if (filter === 'Camera On') {
      console.log('🔍 [SEARCH_FILTERS] Removing camera on filter');
      setFilters(prev => ({ ...prev, hasCameraOn: false }));
    } else if (filter === 'Birthday Soon') {
      console.log('🔍 [SEARCH_FILTERS] Removing birthday soon filter');
      setFilters(prev => ({ ...prev, birthdaySoon: false }));
    } else if (filter === 'New Profile') {
      console.log('🔍 [SEARCH_FILTERS] Removing new profile filter');
      setFilters(prev => ({ ...prev, newProfile: false }));
    } else if (filter === 'Top 1000') {
      console.log('🔍 [SEARCH_FILTERS] Removing top 1000 filter');
      setFilters(prev => ({ ...prev, top1000: false }));
    } else if (filter === 'Verified') {
      console.log('🔍 [SEARCH_FILTERS] Removing verified filter');
      setFilters(prev => ({ ...prev, verified: false }));
    }
  };

  const CheckboxFilter = ({ name, label, icon: Icon, checked, onChange }: { name: string, label: string, icon: any, checked: boolean, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div className="relative flex items-center justify-center">
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={onChange}
          className="sr-only"
        />
        <div className={`w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center ${
          checked 
            ? 'bg-rose-500 border-rose-500' 
            : 'border-slate-300 group-hover:border-rose-300'
        }`}>
          {checked && (
            <Check className="w-3.5 h-3.5 text-white" />
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-rose-500" />
        <span className="text-slate-600 group-hover:text-slate-700 transition-colors text-sm">
          {label}
        </span>
      </div>
    </label>
  );

  const RangeSlider = ({ label, min, max, minValue, maxValue, onMinChange, onMaxChange, unit = '' }: { 
    label: string, 
    min: number, 
    max: number, 
    minValue: number, 
    maxValue: number, 
    onMinChange: (value: number) => void, 
    onMaxChange: (value: number) => void, 
    unit?: string 
  }) => {
    const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);
    
    const getPercentage = (value: number) => ((value - min) / (max - min)) * 100;
    
    const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const percentage = (e.clientX - rect.left) / rect.width;
      const value = Math.round(min + percentage * (max - min));
      
      const distanceToMin = Math.abs(value - minValue);
      const distanceToMax = Math.abs(value - maxValue);
      
      if (distanceToMin < distanceToMax) {
        onMinChange(Math.min(value, maxValue));
      } else {
        onMaxChange(Math.max(value, minValue));
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const track = document.getElementById(`track-${label.replace(/\s+/g, '-')}`);
      if (!track) return;
      
      const rect = track.getBoundingClientRect();
      const percentage = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const value = Math.round(min + percentage * (max - min));
      
      if (isDragging === 'min') {
        onMinChange(Math.min(value, maxValue));
      } else {
        onMaxChange(Math.max(value, minValue));
      }
    };

    const handleMouseUp = () => {
      setIsDragging(null);
    };

    useEffect(() => {
      if (isDragging) {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
        };
      }
    }, [isDragging, minValue, maxValue]);

    return (
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-600">{label}</span>
          <span className="text-sm font-medium text-slate-700">{minValue}{unit} - {maxValue}{unit}</span>
        </div>
        
        <div className="relative h-6 px-3">
          {/* Track */}
          <div 
            id={`track-${label.replace(/\s+/g, '-')}`}
            className="absolute top-2 left-3 right-3 h-2 bg-slate-200 rounded-lg cursor-pointer"
            onClick={handleTrackClick}
          />
          
          {/* Active range */}
          <div 
            className="absolute top-2 h-2 bg-rose-500 rounded-lg pointer-events-none"
            style={{
              left: `${3 + (getPercentage(minValue) * 0.85)}%`,
              width: `${(getPercentage(maxValue) - getPercentage(minValue)) * 0.85}%`
            }}
          />
          
          {/* Min thumb */}
          <div
            className="absolute top-1 w-4 h-4 bg-rose-500 border-2 border-white rounded-full shadow-md cursor-pointer hover:scale-110 transition-transform"
            style={{ left: `${1 + (getPercentage(minValue) * 0.85)}%` }}
            onMouseDown={() => setIsDragging('min')}
          />
          
          {/* Max thumb */}
          <div
            className="absolute top-1 w-4 h-4 bg-rose-600 border-2 border-white rounded-full shadow-md cursor-pointer hover:scale-110 transition-transform"
            style={{ left: `${1 + (getPercentage(maxValue) * 0.85)}%` }}
            onMouseDown={() => setIsDragging('max')}
          />
        </div>
        
        {/* Value inputs */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Min:</span>
            <input
              type="number"
              min={min}
              max={maxValue}
              value={minValue}
              onChange={(e) => onMinChange(Math.min(Number(e.target.value), maxValue))}
              className="w-16 px-2 py-1 border border-slate-200 rounded text-center focus:border-rose-300 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Max:</span>
            <input
              type="number"
              min={minValue}
              max={max}
              value={maxValue}
              onChange={(e) => onMaxChange(Math.max(Number(e.target.value), minValue))}
              className="w-16 px-2 py-1 border border-slate-200 rounded text-center focus:border-rose-300 focus:outline-none"
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Active Filters - Moved to Top */}
      {activeFilters.length > 0 && (
        <div className="space-y-4 pb-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-slate-700 font-medium text-sm">
              Active Filters ({activeFilters.length})
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters}
              className="text-slate-500 hover:text-slate-700 text-xs h-7 px-2"
            >
              Clear All
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {activeFilters.map((filter, index) => (
              <div
                key={index}
                className="flex items-center gap-1 bg-rose-50 text-rose-700 px-2 py-1 rounded-full text-xs border border-rose-200"
              >
                <span>{filter}</span>
                <button 
                  onClick={() => removeFilter(filter)}
                  className="hover:bg-rose-200 rounded-full p-0.5 transition-colors"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Age Range - with sliders */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-slate-700 font-medium">
          <Users className="w-4 h-4 text-rose-500" />
          <span>Age</span>
          <span className="text-xs text-slate-500">18 - 99 years</span>
        </div>
        <RangeSlider
          label="Age Range"
          min={18}
          max={99}
          minValue={filters.ageMin}
          maxValue={filters.ageMax}
          onMinChange={(value) => handleSliderChange('ageMin', value)}
          onMaxChange={(value) => handleSliderChange('ageMax', value)}
        />
      </div>

      {/* Special Features */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-slate-700 font-medium">
          <Sparkles className="w-4 h-4 text-rose-500" />
          <span>Special Features</span>
        </div>
        <div className="space-y-3">
          <CheckboxFilter name="hasIntroVideo" label="Has Intro video" icon={Video} checked={filters.hasIntroVideo} onChange={handleCheckboxChange} />
          <CheckboxFilter name="isOnline" label="Lady is online" icon={MessageCircle} checked={filters.isOnline} onChange={handleCheckboxChange} />
          <CheckboxFilter name="hasVideo" label="Has video" icon={Video} checked={filters.hasVideo} onChange={handleCheckboxChange} />
          <CheckboxFilter name="hasCameraOn" label="Has camera On" icon={Camera} checked={filters.hasCameraOn} onChange={handleCheckboxChange} />
          <CheckboxFilter name="birthdaySoon" label="Birthday soon" icon={Gift} checked={filters.birthdaySoon} onChange={handleCheckboxChange} />
          <CheckboxFilter name="newProfile" label="New profile" icon={Sparkles} checked={filters.newProfile} onChange={handleCheckboxChange} />
          <CheckboxFilter name="top1000" label="Top 1000" icon={Crown} checked={filters.top1000} onChange={handleCheckboxChange} />
          <CheckboxFilter name="verified" label="Verified Profile" icon={Check} checked={filters.verified} onChange={handleCheckboxChange} />
        </div>
      </div>

      {/* Location */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-slate-700 font-medium">
          <MapPin className="w-4 h-4 text-rose-500" />
          <span>Location</span>
        </div>
        <div className="space-y-3">
          <Select 
            name="country" 
            value={filters.country} 
            onChange={handleInputChange}
            className="border-slate-200 focus:border-rose-300 focus:ring-rose-200"
          >
            <option value="">Country</option>
            {countries.map((country) => (
              <option key={country.value} value={country.value}>
                {country.label}
              </option>
            ))}
          </Select>
          <Input
            name="city"
            value={filters.city}
            onChange={handleInputChange}
            placeholder="City"
            className="border-slate-200 focus:border-rose-300 focus:ring-rose-200"
          />
        </div>
      </div>

      {/* Appearance */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-slate-700 font-medium">
          <Eye className="w-4 h-4 text-rose-500" />
          <span>Appearance</span>
        </div>
        <div className="space-y-3">
          <Select 
            name="eyeColor" 
            value={filters.eyeColor} 
            onChange={handleInputChange}
            className="border-slate-200 focus:border-rose-300 focus:ring-rose-200"
          >
            <option value="">Eyes color</option>
            <option value="blue">Blue</option>
            <option value="brown">Brown</option>
            <option value="green">Green</option>
            <option value="hazel">Hazel</option>
            <option value="gray">Gray</option>
            <option value="amber">Amber</option>
          </Select>
          <Select 
            name="hairColor" 
            value={filters.hairColor} 
            onChange={handleInputChange}
            className="border-slate-200 focus:border-rose-300 focus:ring-rose-200"
          >
            <option value="">Hair color</option>
            <option value="blonde">Blonde</option>
            <option value="brunette">Brunette</option>
            <option value="black">Black</option>
            <option value="red">Red</option>
            <option value="auburn">Auburn</option>
            <option value="gray">Gray</option>
          </Select>
          <Select 
            name="appearanceType" 
            value={filters.appearanceType} 
            onChange={handleInputChange}
            className="border-slate-200 focus:border-rose-300 focus:ring-rose-200"
          >
            <option value="">Appearance type</option>
            <option value="slim">Slim</option>
            <option value="athletic">Athletic</option>
            <option value="average">Average</option>
            <option value="curvy">Curvy</option>
            <option value="full">Full</option>
          </Select>
        </div>
      </div>

      {/* Lifestyle */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-slate-700 font-medium">
          <Wine className="w-4 h-4 text-rose-500" />
          <span>Lifestyle</span>
        </div>
        <div className="space-y-3">
          <Select 
            name="alcohol" 
            value={filters.alcohol} 
            onChange={handleInputChange}
            className="border-slate-200 focus:border-rose-300 focus:ring-rose-200"
          >
            <option value="">Alcohol</option>
            <option value="never">Never</option>
            <option value="rarely">Rarely</option>
            <option value="socially">Socially</option>
            <option value="regularly">Regularly</option>
          </Select>
          <Select 
            name="smoking" 
            value={filters.smoking} 
            onChange={handleInputChange}
            className="border-slate-200 focus:border-rose-300 focus:ring-rose-200"
          >
            <option value="">Smoking</option>
            <option value="never">Never</option>
            <option value="rarely">Rarely</option>
            <option value="socially">Socially</option>
            <option value="regularly">Regularly</option>
          </Select>
          <Select 
            name="children" 
            value={filters.children} 
            onChange={handleInputChange}
            className="border-slate-200 focus:border-rose-300 focus:ring-rose-200"
          >
            <option value="">Children</option>
            <option value="none">No children</option>
            <option value="have">Have children</option>
            <option value="want">Want children</option>
            <option value="no-want">Don't want children</option>
          </Select>
        </div>
      </div>

      {/* Personal Info */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-slate-700 font-medium">
          <Church className="w-4 h-4 text-rose-500" />
          <span>Personal</span>
        </div>
        <div className="space-y-3">
          <Select 
            name="religion" 
            value={filters.religion} 
            onChange={handleInputChange}
            className="border-slate-200 focus:border-rose-300 focus:ring-rose-200"
          >
            <option value="">Religion</option>
            <option value="christian">Christian</option>
            <option value="orthodox">Orthodox</option>
            <option value="catholic">Catholic</option>
            <option value="muslim">Muslim</option>
            <option value="jewish">Jewish</option>
            <option value="buddhist">Buddhist</option>
            <option value="hindu">Hindu</option>
            <option value="other">Other</option>
            <option value="none">None</option>
          </Select>
          <Select 
            name="zodiacSign" 
            value={filters.zodiacSign} 
            onChange={handleInputChange}
            className="border-slate-200 focus:border-rose-300 focus:ring-rose-200"
          >
            <option value="">Zodiac sign</option>
            <option value="aries">Aries</option>
            <option value="taurus">Taurus</option>
            <option value="gemini">Gemini</option>
            <option value="cancer">Cancer</option>
            <option value="leo">Leo</option>
            <option value="virgo">Virgo</option>
            <option value="libra">Libra</option>
            <option value="scorpio">Scorpio</option>
            <option value="sagittarius">Sagittarius</option>
            <option value="capricorn">Capricorn</option>
            <option value="aquarius">Aquarius</option>
            <option value="pisces">Pisces</option>
          </Select>
          <Select 
            name="englishLevel" 
            value={filters.englishLevel} 
            onChange={handleInputChange}
            className="border-slate-200 focus:border-rose-300 focus:ring-rose-200"
          >
            <option value="">English speaking skills</option>
            <option value="beginner">Beginner</option>
            <option value="elementary">Elementary</option>
            <option value="intermediate">Intermediate</option>
            <option value="upper-intermediate">Upper Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="fluent">Fluent</option>
            <option value="native">Native</option>
          </Select>
        </div>
      </div>

      {/* Interests */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-slate-700 font-medium">
          <Heart className="w-4 h-4 text-rose-500" />
          <span>Interests</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {interests.slice(0, 12).map((interest) => (
            <button
              key={interest}
              onClick={() => handleInterestChange(interest)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                filters.interests.includes(interest)
                  ? 'bg-rose-500 text-white shadow-md hover:bg-rose-600'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {interest}
            </button>
          ))}
        </div>
      </div>

      {/* Languages */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-slate-700 font-medium">
          <Globe className="w-4 h-4 text-rose-500" />
          <span>Languages</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {['English', 'Russian', 'Ukrainian', 'Kazakh', 'Belarusian', 'Polish', 'Czech', 'Romanian', 'Bulgarian', 'Serbian', 'Croatian', 'Latvian', 'Lithuanian', 'Estonian', 'Hungarian', 'Slovak', 'Slovenian', 'German', 'French', 'Italian', 'Spanish', 'Portuguese'].map((language) => (
            <button
              key={language}
              onClick={() => handleLanguageChange(language)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                filters.languages.includes(language)
                  ? 'bg-rose-500 text-white shadow-md hover:bg-rose-600'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {language}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
