import { useEffect, useRef } from 'react';
import { measureComponentRender, debounce, throttle, createIntersectionObserver } from '@/utils/performance';

// Hook to measure component render performance
export function useRenderPerformance(componentName: string) {
  const endMeasurement = useRef<(() => void) | null>(null);

  useEffect(() => {
    endMeasurement.current = measureComponentRender(componentName);
    
    return () => {
      if (endMeasurement.current) {
        endMeasurement.current();
      }
    };
  }, [componentName]);
}

// Hook for debounced callbacks
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const debouncedCallback = useRef<T>();

  useEffect(() => {
    debouncedCallback.current = debounce(callback, delay) as T;
  }, [callback, delay]);

  return debouncedCallback.current as T;
}

// Hook for throttled callbacks
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  limit: number
): T {
  const throttledCallback = useRef<T>();

  useEffect(() => {
    throttledCallback.current = throttle(callback, limit) as T;
  }, [callback, limit]);

  return throttledCallback.current as T;
}

// Hook for lazy loading with Intersection Observer
export function useLazyLoading(
  threshold = 0.1,
  rootMargin = '50px'
) {
  const elementRef = useRef<HTMLElement>(null);
  const isVisible = useRef(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = createIntersectionObserver(
      (entries: IntersectionObserverEntry[]) => {
        entries.forEach((entry: IntersectionObserverEntry) => {
          if (entry.isIntersecting && !isVisible.current) {
            isVisible.current = true;
            // Trigger lazy loading
            if (element.dataset.src) {
              element.setAttribute('src', element.dataset.src);
              element.removeAttribute('data-src');
            }
            observer?.disconnect();
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    if (observer) {
      observer.observe(element);
      observerRef.current = observer;
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [threshold, rootMargin]);

  return { elementRef, isVisible: isVisible.current };
}

// Hook to monitor memory usage
export function useMemoryMonitor() {
  useEffect(() => {
    const checkMemory = () => {
      if (typeof window !== 'undefined' && (window as any).performance?.memory) {
        const memory = (window as any).performance.memory;
        const usedMB = memory.usedJSHeapSize / 1048576;
        const totalMB = memory.totalJSHeapSize / 1048576;
        const limitMB = memory.jsHeapSizeLimit / 1048576;
        
        // Log warning if memory usage is high
        if (usedMB / limitMB > 0.8) {
          console.warn(`🚨 High memory usage: ${usedMB.toFixed(2)}MB / ${limitMB.toFixed(2)}MB (${((usedMB / limitMB) * 100).toFixed(1)}%)`);
        }
        
        return { used: usedMB, total: totalMB, limit: limitMB };
      }
      return null;
    };

    const interval = setInterval(checkMemory, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, []);
}

// Hook for optimized scroll handling
export function useOptimizedScroll(
  callback: (scrollY: number) => void,
  throttleMs = 16 // ~60fps
) {
  const throttledCallback = useThrottle(callback, throttleMs);
  
  useEffect(() => {
    const handleScroll = () => {
      throttledCallback(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [throttledCallback]);
}