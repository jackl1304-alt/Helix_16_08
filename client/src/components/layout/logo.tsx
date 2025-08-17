import React from 'react';
import helixLogo from '@assets/ICON Helix_1753735753843.jpg';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className = '', showText = true, size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-16 w-16', 
    lg: 'h-20 w-20'
  };

  return (
    <div className={`flex flex-col items-center space-y-2 ${className}`}>
      <div className="relative">
        <img 
          src={helixLogo} 
          alt="Helix DNA Logo" 
          className={`${sizeClasses[size]} rounded-lg object-cover shadow-lg`}
        />
      </div>
      {showText && (
        <div className="flex flex-col items-center">
          <span className="text-xl font-bold text-[#07233e] tracking-wide">HELIX</span>
          <span className="text-xs text-gray-600 font-medium">Powered by DELTAWAYS</span>
        </div>
      )}
    </div>
  );
}

export default Logo;
export { Logo as CompactLogo };