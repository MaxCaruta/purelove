import { Shield, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip } from './tooltip';

interface VerificationBadgeProps {
  verified: boolean;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export function VerificationBadge({ 
  verified, 
  size = 'md', 
  showText = true,
  className 
}: VerificationBadgeProps) {
  if (!verified) return null;
  
  const sizeClasses = {
    sm: 'h-4 w-4 text-xs',
    md: 'h-5 w-5 text-sm',
    lg: 'h-6 w-6 text-base'
  };
  
  const iconSize = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4'
  };
  
  return (
    <Tooltip content="This profile has been verified by our team">
      <div className={cn(
        "inline-flex items-center gap-1 rounded-full bg-green-100 text-green-700 px-2 py-0.5",
        sizeClasses[size],
        className
      )}>
        <div className="bg-green-500 rounded-full flex items-center justify-center">
          <Check className={iconSize[size]} color="white" />
        </div>
        {showText && <span>Verified</span>}
      </div>
    </Tooltip>
  );
}
