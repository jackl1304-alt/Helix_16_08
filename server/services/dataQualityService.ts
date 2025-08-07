export interface DuplicateMatch {
  id: string;
  title: string;
  similarity: number;
  matchType: 'exact' | 'fuzzy' | 'semantic';
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  score: number; // 0-100
}

interface DataStandardization {
  countryCode?: string;
  normalizedDate?: Date;
  standardizedCategory?: string;
  cleanedTitle?: string;
}

export class DataQualityService {
  
  // Country code mapping for standardization
  private countryMapping: Record<string, string> = {
    'USA': 'US',
    'United States': 'US',
    'United States of America': 'US',
    'America': 'US',
    'UK': 'GB',
    'United Kingdom': 'GB',
    'Britain': 'GB',
    'Great Britain': 'GB',
    'Deutschland': 'DE',
    'Germany': 'DE',
    'Schweiz': 'CH',
    'Switzerland': 'CH',
    'Suisse': 'CH',
    'Svizzera': 'CH',
    'European Union': 'EU',
    'EU': 'EU',
    'Europe': 'EU'
  };

  // Standardized categories
  private categoryMapping: Record<string, string> = {
    '510k': 'FDA 510(k) Clearance',
    '510(k)': 'FDA 510(k) Clearance',
    'pma': 'FDA PMA Approval',
    'recall': 'Safety Recall',
    'guidance': 'Regulatory Guidance',
    'guideline': 'Regulatory Guidance',
    'standard': 'Technical Standard',
    'iso': 'ISO Standard',
    'iec': 'IEC Standard',
    'safety': 'Safety Notice',
    'alert': 'Safety Alert',
    'warning': 'Safety Warning'
  };

  /**
   * Fuzzy string matching using Levenshtein distance
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const normalize = (s: string) => s.toLowerCase().replace(/[^\w\s]/g, '').trim();
    
    const s1 = normalize(str1);
    const s2 = normalize(str2);
    
    if (s1 === s2) return 1.0;
    
    const maxLength = Math.max(s1.length, s2.length);
    if (maxLength === 0) return 1.0;
    
    const distance = this.levenshteinDistance(s1, s2);
    return (maxLength - distance) / maxLength;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0]![i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j]![0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const substitutionCost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j]![i] = Math.min(
          matrix[j]![i - 1]! + 1, // deletion
          matrix[j - 1]![i]! + 1, // insertion
          matrix[j - 1]![i - 1]! + substitutionCost // substitution
        );
      }
    }
    
    return matrix[str2.length]![str1.length]!;
  }

  /**
   * Find potential duplicates in a list of items
   */
  async findDuplicates(items: any[], similarityThreshold: number = 0.85): Promise<DuplicateMatch[]> {
    const duplicates: DuplicateMatch[] = [];
    const processed = new Set<string>();
    
    console.log(`[Quality] Checking ${items.length} items for duplicates (threshold: ${similarityThreshold})`);
    
    for (let i = 0; i < items.length; i++) {
      if (processed.has(items[i].id)) continue;
      
      const currentItem = items[i];
      const matches: DuplicateMatch[] = [];
      
      for (let j = i + 1; j < items.length; j++) {
        if (processed.has(items[j].id)) continue;
        
        const compareItem = items[j];
        
        // Exact title match
        if (currentItem.title === compareItem.title) {
          matches.push({
            id: compareItem.id,
            title: compareItem.title,
            similarity: 1.0,
            matchType: 'exact'
          });
          continue;
        }
        
        // Fuzzy matching
        const similarity = this.calculateSimilarity(currentItem.title, compareItem.title);
        if (similarity >= similarityThreshold) {
          matches.push({
            id: compareItem.id,
            title: compareItem.title,
            similarity,
            matchType: 'fuzzy'
          });
        }
        
        // Content-based matching (if available)
        if (currentItem.content && compareItem.content) {
          const contentSimilarity = this.calculateSimilarity(currentItem.content, compareItem.content);
          if (contentSimilarity >= 0.9) {
            matches.push({
              id: compareItem.id,
              title: compareItem.title,
              similarity: contentSimilarity,
              matchType: 'semantic'
            });
          }
        }
      }
      
      if (matches.length > 0) {
        duplicates.push({
          id: currentItem.id,
          title: currentItem.title,
          similarity: 1.0,
          matchType: 'exact'
        });
        
        duplicates.push(...matches);
        
        // Mark all matches as processed
        matches.forEach(match => processed.add(match.id));
        processed.add(currentItem.id);
      }
    }
    
    console.log(`[Quality] Found ${duplicates.length} potential duplicates`);
    return duplicates;
  }

  /**
   * Validate data quality of a regulatory update
   */
  validateUpdate(update: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 100;

    // Required fields validation
    if (!update.title || update.title.trim().length === 0) {
      errors.push('Title is required');
      score -= 20;
    } else if (update.title.length < 10) {
      warnings.push('Title is very short');
      score -= 5;
    }

    if (!update.content || update.content.trim().length === 0) {
      errors.push('Content is required');
      score -= 15;
    } else if (update.content.length < 50) {
      warnings.push('Content is very brief');
      score -= 5;
    }

    if (!update.source) {
      warnings.push('Source is missing');
      score -= 10;
    }

    if (!update.authority) {
      warnings.push('Authority is missing');
      score -= 10;
    }

    if (!update.region) {
      warnings.push('Region is missing');
      score -= 10;
    }

    // Date validation
    if (update.published_at) {
      const publishDate = new Date(update.published_at);
      if (isNaN(publishDate.getTime())) {
        errors.push('Invalid publication date format');
        score -= 10;
      } else if (publishDate > new Date()) {
        warnings.push('Publication date is in the future');
        score -= 5;
      } else if (publishDate < new Date('2000-01-01')) {
        warnings.push('Publication date seems very old');
        score -= 5;
      }
    }

    // Priority validation
    if (update.priority && !['low', 'medium', 'high', 'critical'].includes(update.priority)) {
      errors.push('Invalid priority value');
      score -= 5;
    }

    // URL validation for links
    if (update.metadata?.originalLink) {
      try {
        new URL(update.metadata.originalLink);
      } catch {
        warnings.push('Invalid URL in metadata');
        score -= 3;
      }
    }

    // Content quality checks
    if (update.content) {
      // 🔴 MOCK DATA DETECTION - Check for placeholder content
      const placeholders = ['lorem ipsum', 'placeholder', 'todo', 'coming soon', '🔴 mock data'];
      if (placeholders.some(ph => update.content.toLowerCase().includes(ph))) {
        warnings.push('🔴 MOCK DATA DETECTED - Content contains placeholder text - AUTHENTIC DATA REQUIRED');
        score -= 10;
      }

      // Check for very repetitive content
      const words = update.content.toLowerCase().split(/\s+/);
      const uniqueWords = new Set(words);
      if (words.length > 20 && uniqueWords.size / words.length < 0.3) {
        warnings.push('Content appears very repetitive');
        score -= 5;
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      score: Math.max(0, score)
    };
  }

  /**
   * Standardize data formats
   */
  standardizeData(update: any): DataStandardization {
    const result: DataStandardization = {};

    // Standardize country/region codes
    if (update.region) {
      const standardCountry = this.countryMapping[update.region];
      if (standardCountry) {
        result.countryCode = standardCountry;
      }
    }

    // Standardize dates to ISO format
    if (update.published_at) {
      try {
        const date = new Date(update.published_at);
        if (!isNaN(date.getTime())) {
          result.normalizedDate = date;
        }
      } catch (error) {
        console.warn('[Quality] Could not parse date:', update.published_at);
      }
    }

    // Standardize categories
    if (update.type) {
      const lowerType = update.type.toLowerCase();
      for (const [key, value] of Object.entries(this.categoryMapping)) {
        if (lowerType.includes(key)) {
          result.standardizedCategory = value;
          break;
        }
      }
    }

    // Clean and standardize title
    if (update.title) {
      result.cleanedTitle = update.title
        .replace(/\s+/g, ' ') // Normalize whitespace
        .replace(/[^\w\s\-\(\):\.,]/g, '') // Remove special characters
        .trim();
    }

    return result;
  }

  /**
   * Generate data quality report
   */
  async generateQualityReport(updates: any[]): Promise<any> {
    console.log(`[Quality] Generating quality report for ${updates.length} updates`);
    
    const validationResults = updates.map(update => ({
      id: update.id,
      ...this.validateUpdate(update)
    }));

    const duplicates = await this.findDuplicates(updates);
    
    const totalScore = validationResults.reduce((sum, result) => sum + result.score, 0);
    const averageScore = updates.length > 0 ? totalScore / updates.length : 0;
    
    const qualityMetrics = {
      totalUpdates: updates.length,
      validUpdates: validationResults.filter(r => r.isValid).length,
      averageQualityScore: Math.round(averageScore * 100) / 100,
      totalErrors: validationResults.reduce((sum, r) => sum + r.errors.length, 0),
      totalWarnings: validationResults.reduce((sum, r) => sum + r.warnings.length, 0),
      duplicateCount: duplicates.length,
      duplicateGroups: this.groupDuplicates(duplicates)
    };

    const recommendations = this.generateRecommendations(qualityMetrics, validationResults);

    return {
      metrics: qualityMetrics,
      validationResults: validationResults.slice(0, 50), // Limit for performance
      duplicates: duplicates.slice(0, 100),
      recommendations,
      generatedAt: new Date().toISOString()
    };
  }

  private groupDuplicates(duplicates: DuplicateMatch[]): any[] {
    const groups: Record<string, DuplicateMatch[]> = {};
    
    duplicates.forEach(dup => {
      const key = dup.title.toLowerCase().slice(0, 50);
      if (!groups[key]) groups[key] = [];
      groups[key].push(dup);
    });

    return Object.values(groups).filter(group => group.length > 1);
  }

  private generateRecommendations(metrics: any, validationResults: any[]): string[] {
    const recommendations: string[] = [];

    if (metrics.averageQualityScore < 70) {
      recommendations.push('Overall data quality is below acceptable threshold. Review data collection processes.');
    }

    if (metrics.duplicateCount > metrics.totalUpdates * 0.1) {
      recommendations.push('High number of duplicates detected. Implement better deduplication strategies.');
    }

    if (metrics.totalErrors > 0) {
      recommendations.push(`${metrics.totalErrors} validation errors found. Address critical data issues.`);
    }

    const lowQualityCount = validationResults.filter(r => r.score < 60).length;
    if (lowQualityCount > 0) {
      recommendations.push(`${lowQualityCount} updates have low quality scores. Review and improve data sources.`);
    }

    if (metrics.validUpdates / metrics.totalUpdates < 0.95) {
      recommendations.push('Less than 95% of updates are valid. Strengthen validation at data ingestion.');
    }

    return recommendations;
  }

  /**
   * Clean and standardize a batch of updates
   */
  async cleanBatchData(updates: any[]): Promise<any[]> {
    console.log(`[Quality] Cleaning batch of ${updates.length} updates`);
    
    return updates.map(update => {
      const standardization = this.standardizeData(update);
      const validation = this.validateUpdate(update);
      
      return {
        ...update,
        // Apply standardizations
        region: standardization.countryCode || update.region,
        published_at: standardization.normalizedDate || update.published_at,
        type: standardization.standardizedCategory || update.type,
        title: standardization.cleanedTitle || update.title,
        // Add quality metadata
        _quality: {
          score: validation.score,
          isValid: validation.isValid,
          hasWarnings: validation.warnings.length > 0,
          lastCleaned: new Date().toISOString()
        }
      };
    });
  }
}