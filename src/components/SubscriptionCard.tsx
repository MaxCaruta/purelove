import { useState } from 'react';
import { Check, MessageCircle, Clock, Star, Crown, Calendar, Zap } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { useNavigate } from 'react-router-dom';

interface SubscriptionPackageProps {
  id: string;
  name: string;
  duration: number;
  durationUnit: string;
  price: number;
  features: string[];
  popular?: boolean;
  selected?: boolean;
  onSelect: (id: string) => void;
}

export function SubscriptionPackage({ 
  id,
  name,
  duration, 
  durationUnit, 
  price,
  features,
  popular, 
  selected, 
  onSelect 
}: SubscriptionPackageProps) {
  const navigate = useNavigate();

  const handleSelect = () => {
    onSelect(id);
    // Navigate to checkout page with the selected subscription
    navigate(`/checkout?subscription=${id}`);
  };

  return (
    <div className="relative h-full">
      {/* Badge positioned absolutely outside the card */}
      {popular && (
        <Badge variant="premium" className="absolute -top-3 left-1/2 transform -translate-x-1/2 animate-bounce-subtle shadow-lg z-10">
          Most Popular
        </Badge>
      )}
      
      <Card className={`h-full flex flex-col ${
        popular ? 'border-amber-500 shadow-lg hover-glow ring-2 ring-amber-200' : 
        selected ? 'border-rose-500 shadow-lg ring-2 ring-rose-200' :
        'border-gray-200 hover:border-primary-300'
      } transition-all duration-300 hover-lift group animate-fade-in`}>
        
        <CardHeader className="text-center pb-4 flex-shrink-0 pt-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Crown className="h-6 w-6 text-amber-500" />
            <CardTitle className="text-2xl font-bold group-hover:text-primary-600 transition-colors duration-200">
              {name}
            </CardTitle>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-slate-600 mb-2">
            <Calendar className="h-4 w-4" />
            <span>{duration} {durationUnit}{duration > 1 ? 's' : ''}</span>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold text-primary-600 group-hover:scale-105 transition-transform duration-200">
              €{price.toFixed(2)}
            </p>
            <p className="text-sm text-slate-500">
              €{(price / duration).toFixed(2)} per {durationUnit.slice(0, -1)}
            </p>
          </div>
        </CardHeader>
        
        <CardContent className="flex-grow pb-6">
          <ul className="space-y-3">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                <span className="text-sm leading-relaxed">{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
        
        <CardFooter className="pt-0 flex-shrink-0">
          <Button 
            className={`w-full transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
              popular ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600' : 
              selected ? 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600' : ''
            }`}
            variant={popular ? "premium" : selected ? "default" : "default"}
            onClick={handleSelect}
          >
            {selected ? 'Selected - Click to Proceed' : 'Subscribe Now'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 