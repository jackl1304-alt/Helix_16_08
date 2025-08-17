import React from 'react';
import helixLogo from '../../assets/helix-logo.jpg';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className = '', showText = true, size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10', 
    lg: 'h-12 w-12'
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className="relative">
        <img 
          src={helixLogo} 
          alt="Helix DNA Logo" 
          className={`${sizeClasses[size]} rounded-lg object-cover shadow-sm`}
        />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className="text-lg font-bold text-white tracking-wide">HELIX</span>
          <span className="text-xs text-blue-100 font-medium">Powered by DELTAWAYS</span>
        </div>
      )}
    </div>
  );
}

export default Logo;
export { Logo as CompactLogo };