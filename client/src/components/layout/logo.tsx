import React from 'react';
// Fallback Logo für Development - wird durch echtes Logo ersetzt
const helixLogo = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='15' fill='%23123456'/%3E%3Ctext x='50' y='35' font-family='Arial,sans-serif' font-size='24' font-weight='bold' text-anchor='middle' fill='white'%3EHelix%3C/text%3E%3Cpath d='M25 45 Q50 55 75 45 Q50 65 25 75 Q50 85 75 75' stroke='white' stroke-width='2' fill='none'/%3E%3C/svg%3E";

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