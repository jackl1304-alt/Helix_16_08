/**
 * Comprehensive Performance Testing Utilities
 * Helix Platform Optimization Suite
 */

interface PerformanceTestResult {
  name: string;
  duration: number;
  memoryUsed?: number;
  score: 'excellent' | 'good' | 'needs-improvement' | 'poor';
  recommendations: string[];
}

interface PerformanceBenchmark {
  componentRender: number;
  apiCall: number;
  dataProcessing: number;
  imageLoad: number;
  totalPageLoad: number;
}

class PerformanceTester {
  private results: PerformanceTestResult[] = [];
  private benchmarks: PerformanceBenchmark = {
    componentRender: 16, // 60fps = 16ms per frame
    apiCall: 1000, // 1 second max for API calls
    dataProcessing: 500, // 500ms max for data processing
    imageLoad: 2000, // 2 seconds max for image loading
    totalPageLoad: 3000, // 3 seconds max for page load
  };

  // Test API call performance
  async testApiCall(url: string, expectedSize?: number): Promise<PerformanceTestResult> {
    const start = performance.now();
    const startMemory = this.getMemoryUsage();

    try {
      const response = await fetch(url);
      const data = await response.json();
      const end = performance.now();
      const endMemory = this.getMemoryUsage();
      
      const duration = end - start;
      const memoryUsed = endMemory - startMemory;
      const dataSize = JSON.stringify(data).length;
      
      const score = this.calculateScore(duration, this.benchmarks.apiCall);
      const recommendations: string[] = [];

      if (duration > this.benchmarks.apiCall) {
        recommendations.push('Consider implementing request caching');
        recommendations.push('Optimize server response time');
      }

      if (expectedSize && dataSize > expectedSize * 1.5) {
        recommendations.push('Response payload is larger than expected - consider pagination');
      }

      if (memoryUsed > 5) {
        recommendations.push('High memory usage during API call - check for memory leaks');
      }

      const result: PerformanceTestResult = {
        name: `API Call: ${url}`,
        duration,
        memoryUsed,
        score,
        recommendations: recommendations.length ? recommendations : ['API call performance is optimal']
      };

      this.results.push(result);
      return result;
    } catch (error) {
      const result: PerformanceTestResult = {
        name: `API Call: ${url}`,
        duration: 0,
        score: 'poor',
        recommendations: [`API call failed: ${error}`]
      };
      
      this.results.push(result);
      return result;
    }
  }

  // Test component rendering performance
  testComponentRender(componentName: string, renderFunction: () => void): PerformanceTestResult {
    const start = performance.now();
    const startMemory = this.getMemoryUsage();

    renderFunction();

    const end = performance.now();
    const endMemory = this.getMemoryUsage();
    
    const duration = end - start;
    const memoryUsed = endMemory - startMemory;
    const score = this.calculateScore(duration, this.benchmarks.componentRender);
    
    const recommendations: string[] = [];
    
    if (duration > this.benchmarks.componentRender) {
      recommendations.push('Consider using React.memo for expensive components');
      recommendations.push('Check for unnecessary re-renders');
      recommendations.push('Use useMemo/useCallback for expensive calculations');
    }

    if (memoryUsed > 2) {
      recommendations.push('Component using excessive memory - check for memory leaks');
    }

    const result: PerformanceTestResult = {
      name: `Component Render: ${componentName}`,
      duration,
      memoryUsed,
      score,
      recommendations: recommendations.length ? recommendations : ['Component rendering performance is optimal']
    };

    this.results.push(result);
    return result;
  }

  // Test image loading performance
  async testImageLoad(imageUrl: string): Promise<PerformanceTestResult> {
    return new Promise((resolve) => {
      const start = performance.now();
      const img = new Image();
      
      img.onload = () => {
        const end = performance.now();
        const duration = end - start;
        const score = this.calculateScore(duration, this.benchmarks.imageLoad);
        
        const recommendations: string[] = [];
        
        if (duration > this.benchmarks.imageLoad) {
          recommendations.push('Consider optimizing image format (WebP, AVIF)');
          recommendations.push('Implement lazy loading for images');
          recommendations.push('Use appropriate image sizes and compression');
        }

        const result: PerformanceTestResult = {
          name: `Image Load: ${imageUrl}`,
          duration,
          score,
          recommendations: recommendations.length ? recommendations : ['Image loading performance is optimal']
        };

        this.results.push(result);
        resolve(result);
      };

      img.onerror = () => {
        const result: PerformanceTestResult = {
          name: `Image Load: ${imageUrl}`,
          duration: 0,
          score: 'poor',
          recommendations: ['Image failed to load - check URL and server availability']
        };
        
        this.results.push(result);
        resolve(result);
      };

      img.src = imageUrl;
    });
  }

  // Comprehensive performance audit
  async runFullAudit(): Promise<{ 
    results: PerformanceTestResult[]; 
    overallScore: number; 
    summary: string;
  }> {
    console.log('🚀 Starting Helix Platform Performance Audit...');
    
    // Clear previous results
    this.results = [];

    // Test critical API endpoints
    const criticalEndpoints = [
      '/api/dashboard/stats',
      '/api/admin/permissions',
      '/api/regulatory-updates/recent'
    ];

    for (const endpoint of criticalEndpoints) {
      await this.testApiCall(endpoint);
    }

    // Test Web Vitals if available
    if (typeof window !== 'undefined') {
      this.measureWebVitals();
    }

    // Calculate overall performance score
    const scores = this.results.map(r => this.scoreToNumber(r.score));
    const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const overallScore = Math.round(averageScore);

    const summary = this.generateSummary(overallScore);

    console.log('✅ Performance Audit Complete!');
    console.table(this.results.map(r => ({
      Test: r.name,
      Duration: `${r.duration.toFixed(2)}ms`,
      Score: r.score,
      'Top Recommendation': r.recommendations[0] || 'All good!'
    })));

    return {
      results: this.results,
      overallScore,
      summary
    };
  }

  private getMemoryUsage(): number {
    if (typeof window !== 'undefined' && (window as any).performance?.memory) {
      return (window as any).performance.memory.usedJSHeapSize / 1048576; // MB
    }
    return 0;
  }

  private calculateScore(duration: number, benchmark: number): 'excellent' | 'good' | 'needs-improvement' | 'poor' {
    const ratio = duration / benchmark;
    
    if (ratio <= 0.5) return 'excellent';
    if (ratio <= 1.0) return 'good';
    if (ratio <= 2.0) return 'needs-improvement';
    return 'poor';
  }

  private scoreToNumber(score: 'excellent' | 'good' | 'needs-improvement' | 'poor'): number {
    switch (score) {
      case 'excellent': return 100;
      case 'good': return 80;
      case 'needs-improvement': return 60;
      case 'poor': return 40;
      default: return 0;
    }
  }

  private generateSummary(overallScore: number): string {
    if (overallScore >= 90) {
      return '🎉 Excellent! Your Helix platform is performing exceptionally well.';
    } else if (overallScore >= 75) {
      return '👍 Good performance! Minor optimizations could bring it to excellent.';
    } else if (overallScore >= 60) {
      return '⚠️ Performance needs improvement. Check the recommendations below.';
    } else {
      return '🚨 Poor performance detected. Immediate optimization required.';
    }
  }

  private measureWebVitals() {
    // Measure Core Web Vitals if PerformanceObserver is available
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      try {
        // Largest Contentful Paint (LCP)
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (lastEntry) {
            const lcp = lastEntry.startTime;
            const score = this.calculateScore(lcp, 2500); // 2.5s benchmark
            
            this.results.push({
              name: 'Largest Contentful Paint (LCP)',
              duration: lcp,
              score,
              recommendations: lcp > 2500 ? 
                ['Optimize images and fonts', 'Improve server response time', 'Remove render-blocking resources'] :
                ['LCP performance is optimal']
            });
          }
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay (FID) 
        new PerformanceObserver((list) => {
          const firstInput = list.getEntries()[0] as any;
          if (firstInput) {
            const fid = firstInput.processingStart - firstInput.startTime;
            const score = this.calculateScore(fid, 100); // 100ms benchmark
            
            this.results.push({
              name: 'First Input Delay (FID)',
              duration: fid,
              score,
              recommendations: fid > 100 ? 
                ['Break up long tasks', 'Use web workers for heavy computations', 'Optimize JavaScript execution'] :
                ['FID performance is optimal']
            });
          }
        }).observe({ entryTypes: ['first-input'] });

        // Cumulative Layout Shift (CLS)
        let clsValue = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
          
          const score = clsValue < 0.1 ? 'excellent' : clsValue < 0.25 ? 'good' : 'needs-improvement';
          
          this.results.push({
            name: 'Cumulative Layout Shift (CLS)',
            duration: clsValue,
            score,
            recommendations: clsValue > 0.1 ? 
              ['Set size attributes on images and videos', 'Avoid inserting content above existing content', 'Use CSS transforms for animations'] :
              ['CLS performance is optimal']
          });
        }).observe({ entryTypes: ['layout-shift'] });

      } catch (error) {
        console.warn('Some Web Vitals could not be measured:', error);
      }
    }
  }
}

// Export singleton instance
export const performanceTester = new PerformanceTester();

// Convenience function for quick performance testing
export const quickPerformanceTest = async () => {
  return await performanceTester.runFullAudit();
};

// Development helper - run tests automatically
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  // Run performance tests after page load
  window.addEventListener('load', () => {
    setTimeout(() => {
      quickPerformanceTest().then(result => {
        console.group('📊 Helix Performance Test Results');
        console.log(`Overall Score: ${result.overallScore}/100`);
        console.log(`Summary: ${result.summary}`);
        console.groupEnd();
      });
    }, 3000); // Wait 3 seconds for the app to fully initialize
  });
}