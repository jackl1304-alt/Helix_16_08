import { storage } from '../storage';

interface DuplicateReport {
  totalRecords: number;
  duplicatesFound: number;
  duplicateGroups: DuplicateGroup[];
  removalCandidates: string[];
}

interface DuplicateGroup {
  key: string;
  records: any[];
  confidence: number;
}

interface QualityMetrics {
  completeness: number;
  consistency: number;
  accuracy: number;
  freshness: number;
  overall: number;
}

interface StandardizationReport {
  countriesStandardized: number;
  datesFixed: number;
  categoriesNormalized: number;
  duplicatesRemoved: number;
}

export class DataQualityEnhancementService {
  private countryMappings: Record<string, string> = {
    'USA': 'US',
    'United States': 'US',
    'United States of America': 'US',
    'America': 'US',
    'U.S.': 'US',
    'UK': 'GB',
    'United Kingdom': 'GB',
    'Britain': 'GB',
    'Great Britain': 'GB',
    'England': 'GB',
    'Germany': 'DE',
    'Deutschland': 'DE',
    'Japan': 'JP',
    'Nippon': 'JP',
    'China': 'CN',
    'PRC': 'CN',
    "People's Republic of China": 'CN',
    'European Union': 'EU',
    'Europe': 'EU',
    'EU': 'EU',
    'France': 'FR',
    'Italy': 'IT',
    'Spain': 'ES',
    'Netherlands': 'NL',
    'Belgium': 'BE',
    'Switzerland': 'CH',
    'Schweiz': 'CH',
    'Austria': 'AT',
    'Sweden': 'SE',
    'Norway': 'NO',
    'Denmark': 'DK',
    'Finland': 'FI',
    'Canada': 'CA',
    'Australia': 'AU',
    'Brazil': 'BR',
    'India': 'IN',
    'Russia': 'RU',
    'South Korea': 'KR',
    'Korea': 'KR',
    'Singapore': 'SG',
    'Thailand': 'TH',
    'Mexico': 'MX',
    'Argentina': 'AR',
    'South Africa': 'ZA'
  };

  private categoryMappings: Record<string, string> = {
    // Device categories
    'cardiac': 'cardiovascular',
    'heart': 'cardiovascular',
    'cardio': 'cardiovascular',
    'orthopedic': 'orthopedics',
    'orthopaedic': 'orthopedics',
    'bone': 'orthopedics',
    'joint': 'orthopedics',
    'neuro': 'neurology',
    'neurological': 'neurology',
    'brain': 'neurology',
    'ophthalmic': 'ophthalmology',
    'eye': 'ophthalmology',
    'vision': 'ophthalmology',
    'dental': 'dentistry',
    'tooth': 'dentistry',
    'oral': 'dentistry',
    'surgical': 'surgery',
    'operative': 'surgery',
    
    // Document types
    'guideline': 'guidance',
    'guidance document': 'guidance',
    'recommendation': 'guidance',
    'standard': 'standards',
    'norm': 'standards',
    'specification': 'standards',
    'regulation': 'regulatory',
    'rule': 'regulatory',
    'directive': 'regulatory',
    'clearance': 'approval',
    'authorization': 'approval',
    'permit': 'approval',
    'recall': 'safety_alert',
    'warning': 'safety_alert',
    'alert': 'safety_alert'
  };

  async detectDuplicates(keyFields: string[] = ['title', 'authority']): Promise<DuplicateReport> {
    try {
      console.log('[Data Quality] Starting duplicate detection...');
      
      const allUpdates = await storage.getAllRegulatoryUpdates();
      const seen = new Map<string, any[]>();
      const duplicateGroups: DuplicateGroup[] = [];
      
      // Group records by composite key
      for (const record of allUpdates) {
        const key = this.generateCompositeKey(record, keyFields);
        
        if (!seen.has(key)) {
          seen.set(key, []);
        }
        seen.get(key)!.push(record);
      }
      
      // Identify duplicate groups
      for (const [key, records] of seen.entries()) {
        if (records.length > 1) {
          const confidence = this.calculateDuplicateConfidence(records);
          duplicateGroups.push({
            key,
            records,
            confidence
          });
        }
      }
      
      // Determine removal candidates (keep newest, remove older duplicates)
      const removalCandidates: string[] = [];
      for (const group of duplicateGroups) {
        // Sort by date, keep the most recent
        const sortedRecords = group.records.sort((a, b) => 
          new Date(b.published_at || 0).getTime() - new Date(a.published_at || 0).getTime()
        );
        
        // Mark all but the first (newest) for removal
        for (let i = 1; i < sortedRecords.length; i++) {
          removalCandidates.push(sortedRecords[i].id);
        }
      }
      
      console.log(`[Data Quality] Duplicate detection completed: ${duplicateGroups.length} groups, ${removalCandidates.length} removal candidates`);
      
      return {
        totalRecords: allUpdates.length,
        duplicatesFound: removalCandidates.length,
        duplicateGroups,
        removalCandidates
      };
    } catch (error) {
      console.error('[Data Quality] Error detecting duplicates:', error);
      return {
        totalRecords: 0,
        duplicatesFound: 0,
        duplicateGroups: [],
        removalCandidates: []
      };
    }
  }

  async standardizeData(): Promise<StandardizationReport> {
    try {
      console.log('[Data Quality] Starting data standardization...');
      
      const allUpdates = await storage.getAllRegulatoryUpdates();
      let countriesStandardized = 0;
      let datesFixed = 0;
      let categoriesNormalized = 0;
      
      for (const update of allUpdates) {
        let modified = false;
        
        // Standardize country/region codes
        if (update.region && this.countryMappings[update.region]) {
          update.region = this.countryMappings[update.region];
          countriesStandardized++;
          modified = true;
        }
        
        // Fix date formats
        if (update.published_at && !this.isValidISODate(update.published_at)) {
          const fixedDate = this.standardizeDate(update.published_at);
          if (fixedDate) {
            update.published_at = fixedDate;
            datesFixed++;
            modified = true;
          }
        }
        
        // Normalize categories
        if (update.category) {
          const normalizedCategory = this.normalizeCategory(update.category);
          if (normalizedCategory !== update.category) {
            update.category = normalizedCategory;
            categoriesNormalized++;
            modified = true;
          }
        }
        
        // Normalize tags
        if (update.tags && Array.isArray(update.tags)) {
          const normalizedTags = update.tags.map(tag => this.normalizeCategory(tag));
          if (JSON.stringify(normalizedTags) !== JSON.stringify(update.tags)) {
            update.tags = normalizedTags;
            modified = true;
          }
        }
        
        // Update the record if modified
        if (modified) {
          await storage.updateRegulatoryUpdate(update.id, update);
        }
      }
      
      // Remove duplicates
      const duplicateReport = await this.detectDuplicates();
      let duplicatesRemoved = 0;
      
      for (const duplicateId of duplicateReport.removalCandidates) {
        try {
          await storage.deleteRegulatoryUpdate(duplicateId);
          duplicatesRemoved++;
        } catch (error) {
          console.error(`[Data Quality] Error removing duplicate ${duplicateId}:`, error);
        }
      }
      
      console.log(`[Data Quality] Standardization completed: ${countriesStandardized} countries, ${datesFixed} dates, ${categoriesNormalized} categories, ${duplicatesRemoved} duplicates removed`);
      
      return {
        countriesStandardized,
        datesFixed,
        categoriesNormalized,
        duplicatesRemoved
      };
    } catch (error) {
      console.error('[Data Quality] Error standardizing data:', error);
      return {
        countriesStandardized: 0,
        datesFixed: 0,
        categoriesNormalized: 0,
        duplicatesRemoved: 0
      };
    }
  }

  async calculateQualityMetrics(): Promise<QualityMetrics> {
    try {
      console.log('[Data Quality] Calculating quality metrics...');
      
      const allUpdates = await storage.getAllRegulatoryUpdates();
      
      if (allUpdates.length === 0) {
        return { completeness: 0, consistency: 0, accuracy: 0, freshness: 0, overall: 0 };
      }
      
      // Completeness: percentage of records with all required fields
      const requiredFields = ['title', 'content', 'authority', 'published_at'];
      let completeRecords = 0;
      
      for (const update of allUpdates) {
        const isComplete = requiredFields.every(field => 
          update[field] && update[field].toString().trim().length > 0
        );
        if (isComplete) completeRecords++;
      }
      
      const completeness = (completeRecords / allUpdates.length) * 100;
      
      // Consistency: percentage of records with standardized formats
      let consistentRecords = 0;
      
      for (const update of allUpdates) {
        let isConsistent = true;
        
        // Check date format consistency
        if (update.published_at && !this.isValidISODate(update.published_at)) {
          isConsistent = false;
        }
        
        // Check country code consistency
        if (update.region && !this.isStandardCountryCode(update.region)) {
          isConsistent = false;
        }
        
        if (isConsistent) consistentRecords++;
      }
      
      const consistency = (consistentRecords / allUpdates.length) * 100;
      
      // Accuracy: based on data validation rules
      let accurateRecords = 0;
      
      for (const update of allUpdates) {
        let isAccurate = true;
        
        // Check for reasonable title length
        if (!update.title || update.title.length < 10 || update.title.length > 500) {
          isAccurate = false;
        }
        
        // Check for reasonable content length
        if (!update.content || update.content.length < 50) {
          isAccurate = false;
        }
        
        // Check for valid authority
        if (!update.authority || update.authority.length < 2) {
          isAccurate = false;
        }
        
        if (isAccurate) accurateRecords++;
      }
      
      const accuracy = (accurateRecords / allUpdates.length) * 100;
      
      // Freshness: percentage of records from last 2 years
      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
      
      let freshRecords = 0;
      
      for (const update of allUpdates) {
        if (update.published_at) {
          const publishDate = new Date(update.published_at);
          if (publishDate > twoYearsAgo) {
            freshRecords++;
          }
        }
      }
      
      const freshness = (freshRecords / allUpdates.length) * 100;
      
      // Overall quality score (weighted average)
      const overall = (
        completeness * 0.3 +
        consistency * 0.25 +
        accuracy * 0.25 +
        freshness * 0.2
      );
      
      console.log(`[Data Quality] Quality metrics calculated: Overall ${overall.toFixed(1)}%`);
      
      return {
        completeness: Math.round(completeness * 10) / 10,
        consistency: Math.round(consistency * 10) / 10,
        accuracy: Math.round(accuracy * 10) / 10,
        freshness: Math.round(freshness * 10) / 10,
        overall: Math.round(overall * 10) / 10
      };
    } catch (error) {
      console.error('[Data Quality] Error calculating quality metrics:', error);
      return { completeness: 0, consistency: 0, accuracy: 0, freshness: 0, overall: 0 };
    }
  }

  async validateAndCleanData(): Promise<{ success: boolean; report: any }> {
    try {
      console.log('[Data Quality] Starting comprehensive data validation and cleaning...');
      
      const startTime = Date.now();
      
      // Run all quality improvement processes
      const [
        duplicateReport,
        standardizationReport,
        qualityMetrics
      ] = await Promise.all([
        this.detectDuplicates(),
        this.standardizeData(),
        this.calculateQualityMetrics()
      ]);
      
      const processingTime = Date.now() - startTime;
      
      const report = {
        processingTimeMs: processingTime,
        duplicateReport,
        standardizationReport,
        qualityMetrics,
        timestamp: new Date().toISOString(),
        summary: {
          totalRecords: duplicateReport.totalRecords,
          duplicatesRemoved: standardizationReport.duplicatesRemoved,
          dataStandardized: standardizationReport.countriesStandardized + 
                           standardizationReport.datesFixed + 
                           standardizationReport.categoriesNormalized,
          overallQuality: qualityMetrics.overall
        }
      };
      
      console.log(`[Data Quality] Validation and cleaning completed in ${processingTime}ms`);
      console.log(`[Data Quality] Overall quality score: ${qualityMetrics.overall}%`);
      
      return { success: true, report };
    } catch (error) {
      console.error('[Data Quality] Error in validation and cleaning:', error);
      return { 
        success: false, 
        report: { error: error instanceof Error ? error.message : 'Unknown error' } 
      };
    }
  }

  private generateCompositeKey(record: any, fields: string[]): string {
    return fields.map(field => {
      const value = record[field] || '';
      return value.toString().toLowerCase().trim();
    }).join('|');
  }

  private calculateDuplicateConfidence(records: any[]): number {
    if (records.length < 2) return 0;
    
    let confidence = 0;
    const first = records[0];
    
    // Check title similarity
    for (let i = 1; i < records.length; i++) {
      const similarity = this.calculateStringSimilarity(
        first.title || '', 
        records[i].title || ''
      );
      confidence += similarity;
    }
    
    // Check authority match
    const authoritiesMatch = records.every(r => r.authority === first.authority);
    if (authoritiesMatch) confidence += 0.3;
    
    // Check date proximity
    const dates = records.map(r => new Date(r.published_at || 0));
    const maxDateDiff = Math.max(...dates.map(d => d.getTime())) - 
                       Math.min(...dates.map(d => d.getTime()));
    
    // If dates are within 30 days, increase confidence
    if (maxDateDiff < 30 * 24 * 60 * 60 * 1000) {
      confidence += 0.2;
    }
    
    return Math.min(confidence / (records.length - 1), 1);
  }

  private calculateStringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  private isValidISODate(dateString: string): boolean {
    const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
    return isoRegex.test(dateString) && !isNaN(Date.parse(dateString));
  }

  private standardizeDate(dateString: string): string | null {
    try {
      // Try to parse various date formats
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return null;
      
      return date.toISOString();
    } catch (error) {
      return null;
    }
  }

  private isStandardCountryCode(code: string): boolean {
    const standardCodes = ['US', 'GB', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'CH', 'AT', 'SE', 'NO', 'DK', 'FI', 'CA', 'AU', 'BR', 'IN', 'RU', 'KR', 'SG', 'TH', 'MX', 'AR', 'ZA', 'CN', 'JP', 'EU'];
    return standardCodes.includes(code);
  }

  private normalizeCategory(category: string): string {
    const normalized = category.toLowerCase().trim();
    return this.categoryMappings[normalized] || category;
  }
}