import { useState, useEffect } from "react";

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export interface DeviceInfo {
  type: DeviceType;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
  height: number;
  orientation: 'portrait' | 'landscape';
  touchSupport: boolean;
  userAgent: string;
  os: 'ios' | 'android' | 'windows' | 'macos' | 'linux' | 'unknown';
  browser: 'chrome' | 'firefox' | 'safari' | 'edge' | 'unknown';
}

export function useDevice(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => {
    if (typeof window === 'undefined') {
      return {
        type: 'desktop',
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        width: 1920,
        height: 1080,
        orientation: 'landscape',
        touchSupport: false,
        userAgent: '',
        os: 'unknown',
        browser: 'unknown'
      };
    }

    return getDeviceInfo();
  });

  useEffect(() => {
    function handleResize() {
      setDeviceInfo(getDeviceInfo());
    }

    function handleOrientationChange() {
      // Verzögerung für Orientierungsänderung
      setTimeout(() => {
        setDeviceInfo(getDeviceInfo());
      }, 100);
    }

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return deviceInfo;
}

function getDeviceInfo(): DeviceInfo {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const userAgent = navigator.userAgent;
  
  // Device Type Detection
  let type: DeviceType = 'desktop';
  if (width < 768) {
    type = 'mobile';
  } else if (width < 1024) {
    type = 'tablet';
  }

  // Touch Support Detection
  const touchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // Orientation Detection
  const orientation: 'portrait' | 'landscape' = width > height ? 'landscape' : 'portrait';

  // OS Detection
  let os: DeviceInfo['os'] = 'unknown';
  if (/iPhone|iPad|iPod/.test(userAgent)) {
    os = 'ios';
  } else if (/Android/.test(userAgent)) {
    os = 'android';
  } else if (/Windows/.test(userAgent)) {
    os = 'windows';
  } else if (/Mac/.test(userAgent)) {
    os = 'macos';
  } else if (/Linux/.test(userAgent)) {
    os = 'linux';
  }

  // Browser Detection
  let browser: DeviceInfo['browser'] = 'unknown';
  if (/Chrome/.test(userAgent) && !/Edge/.test(userAgent)) {
    browser = 'chrome';
  } else if (/Firefox/.test(userAgent)) {
    browser = 'firefox';
  } else if (/Safari/.test(userAgent) && !/Chrome/.test(userAgent)) {
    browser = 'safari';
  } else if (/Edge/.test(userAgent)) {
    browser = 'edge';
  }

  return {
    type,
    isMobile: type === 'mobile',
    isTablet: type === 'tablet',
    isDesktop: type === 'desktop',
    width,
    height,
    orientation,
    touchSupport,
    userAgent,
    os,
    browser
  };
}

// Device-spezifische CSS Klassen
export function getDeviceClasses(device: DeviceInfo): string {
  const classes = [
    `device-${device.type}`,
    `orientation-${device.orientation}`,
    `os-${device.os}`,
    `browser-${device.browser}`,
  ];

  if (device.touchSupport) {
    classes.push('touch-device');
  }

  return classes.join(' ');
}

// Responsive Breakpoints
export const breakpoints = {
  mobile: 768,
  tablet: 1024,
  desktop: 1280,
  wide: 1920
} as const;