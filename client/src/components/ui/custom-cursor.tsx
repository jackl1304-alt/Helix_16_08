import React, { useEffect, useState } from 'react';

interface CursorPosition {
  x: number;
  y: number;
}

export function CustomCursor() {
  const [position, setPosition] = useState<CursorPosition>({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target && typeof target.matches === 'function' && target.matches('button, a, [role="button"], .cursor-hover')) {
        setIsHovering(true);
      }
    };

    const handleMouseLeave = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target && typeof target.matches === 'function' && target.matches('button, a, [role="button"], .cursor-hover')) {
        setIsHovering(false);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseenter', handleMouseEnter, true);
    document.addEventListener('mouseleave', handleMouseLeave, true);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseenter', handleMouseEnter, true);
      document.removeEventListener('mouseleave', handleMouseLeave, true);
    };
  }, []);

  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
    // Don't show custom cursor on touch devices
    return null;
  }

  return (
    <>
      <div
        className="cursor-dot"
        style={{
          left: position.x - 4,
          top: position.y - 4,
          transform: isHovering ? 'scale(1.5)' : 'scale(1)',
        }}
      />
      <div
        className={`cursor-ring ${isHovering ? 'cursor-hover' : ''}`}
        style={{
          left: position.x - 20,
          top: position.y - 20,
        }}
      />
    </>
  );
}