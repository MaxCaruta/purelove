import { Check, Coins } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface CoinPackageProps {
  id: number;
  amount: number;
  price: number;
  bonus?: number;
  popular?: boolean;
  selected?: boolean;
  onSelect: (id: number) => void;
}

export function CoinPackage({ id, amount, price, bonus = 0, popular, selected, onSelect }: CoinPackageProps) {
  const totalCoins = amount + bonus;
  
  return (
    <Card className={`relative hover-lift group animate-fade-in ${
      popular ? 'border-amber-500 shadow-lg hover-glow ring-2 ring-amber-200' : 
      selected ? 'border-rose-500 shadow-lg ring-2 ring-rose-200' :
      'hover:border-primary-300'
    } transition-all duration-300`}>
      {popular && (
        <Badge variant="premium" className="absolute -top-3 left-1/2 transform -translate-x-1/2 animate-bounce-subtle shadow-lg">
          Most Popular
        </Badge>
      )}
      <CardHeader className="text-center pb-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Coins className="h-6 w-6 text-amber-500" />
          <CardTitle className="text-2xl font-bold group-hover:text-primary-600 transition-colors duration-200">
            {totalCoins} Coins
          </CardTitle>
        </div>
        {bonus > 0 && (
          <div className="text-sm text-green-600 font-medium mb-2">
            {amount} + {bonus} bonus coins
          </div>
        )}
        <div className="space-y-1">
          <p className="text-3xl font-bold text-primary-600 group-hover:scale-105 transition-transform duration-200">
            €{price.toFixed(2)}
          </p>
          <p className="text-sm text-slate-500">€{(price / totalCoins).toFixed(3)} per coin</p>
        </div>
      </CardHeader>
      <CardContent className="pb-6">
        <ul className="space-y-3 stagger-animation">
          <li className="flex items-start gap-3 opacity-0">
            <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
            <span className="text-sm leading-relaxed">Send {totalCoins} messages</span>
          </li>
          <li className="flex items-start gap-3 opacity-0">
            <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
            <span className="text-sm leading-relaxed">Send {Math.floor(totalCoins / 5)}-{Math.floor(totalCoins / 50)} virtual gifts</span>
          </li>
          <li className="flex items-start gap-3 opacity-0">
            <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
            <span className="text-sm leading-relaxed">{Math.floor(totalCoins / 10)} minutes of video calls</span>
          </li>
          <li className="flex items-start gap-3 opacity-0">
            <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
            <span className="text-sm leading-relaxed">{Math.floor(totalCoins / 400)} minutes of voice calls</span>
          </li>
          {totalCoins >= 50 && (
            <li className="flex items-start gap-3 opacity-0">
              <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
              <span className="text-sm leading-relaxed">View contact info {Math.floor(totalCoins / 50)} time{Math.floor(totalCoins / 50) > 1 ? 's' : ''}</span>
            </li>
          )}
        </ul>
      </CardContent>
      <CardFooter className="pt-0">
        <Button 
          className={`w-full transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
            popular ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600' : 
            selected ? 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600' : ''
          }`}
          variant={popular ? "premium" : selected ? "default" : "default"}
          onClick={() => onSelect(id)}
        >
          {selected ? 'Selected - Click to Proceed' : 'Buy Now'}
        </Button>
      </CardFooter>
    </Card>
  );
}
