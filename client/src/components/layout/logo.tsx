import React from 'react';
// import helixLogo from '@assets/ICON Helix_1753735753843.jpg';

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
        <div className={`${sizeClasses[size]} bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg`}>
          <span className="text-white font-bold text-xl">H</span>
        </div>
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