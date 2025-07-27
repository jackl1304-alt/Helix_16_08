interface CategoryResult {
  categories: string[];
  confidence: number;
  deviceTypes: string[];
  riskLevel: string;
}

class NLPService {
  private medtechKeywords = {
    deviceTypes: [
      'diagnostic', 'therapeutic', 'surgical', 'monitoring', 'imaging',
      'implantable', 'prosthetic', 'orthopedic', 'cardiovascular', 'neurological',
      'ophthalmic', 'dental', 'dermatological', 'respiratory', 'anesthesia',
      'infusion pump', 'defibrillator', 'pacemaker', 'catheter', 'stent',
      'artificial intelligence', 'machine learning', 'software', 'mobile app',
      'telemedicine', 'remote monitoring', 'digital health', 'ai-enabled'
    ],
    riskKeywords: {
      high: ['class iii', 'implantable', 'life-sustaining', 'critical', 'invasive', 'surgical'],
      medium: ['class ii', 'monitoring', 'diagnostic', 'therapeutic'],
      low: ['class i', 'non-invasive', 'general wellness', 'fitness']
    },
    therapeuticAreas: [
      'cardiology', 'neurology', 'oncology', 'orthopedics', 'ophthalmology',
      'gastroenterology', 'urology', 'gynecology', 'dermatology', 'endocrinology',
      'psychiatry', 'radiology', 'anesthesiology', 'emergency medicine'
    ],
    complianceTerms: [
      'cybersecurity', 'clinical evaluation', 'post-market surveillance',
      'quality management', 'risk management', 'biocompatibility',
      'software lifecycle', 'usability engineering', 'clinical investigation'
    ]
  };

  async categorizeContent(content: string): Promise<CategoryResult> {
    const normalizedContent = content.toLowerCase();
    
    const categories: string[] = [];
    const deviceTypes: string[] = [];
    let riskLevel = 'medium';
    let confidence = 0;

    // Identify device types
    for (const deviceType of this.medtechKeywords.deviceTypes) {
      if (normalizedContent.includes(deviceType.toLowerCase())) {
        deviceTypes.push(deviceType);
        confidence += 0.1;
      }
    }

    // Identify therapeutic areas
    for (const area of this.medtechKeywords.therapeuticAreas) {
      if (normalizedContent.includes(area.toLowerCase())) {
        categories.push(area);
        confidence += 0.1;
      }
    }

    // Identify compliance terms
    for (const term of this.medtechKeywords.complianceTerms) {
      if (normalizedContent.includes(term.toLowerCase())) {
        categories.push(term);
        confidence += 0.1;
      }
    }

    // Determine risk level
    for (const [level, keywords] of Object.entries(this.medtechKeywords.riskKeywords)) {
      for (const keyword of keywords) {
        if (normalizedContent.includes(keyword.toLowerCase())) {
          riskLevel = level;
          confidence += 0.2;
          break;
        }
      }
      if (riskLevel === level) break;
    }

    // Add general categories based on content analysis
    if (normalizedContent.includes('ai') || normalizedContent.includes('artificial intelligence') || normalizedContent.includes('machine learning')) {
      categories.push('AI/ML Technology');
      confidence += 0.2;
    }

    if (normalizedContent.includes('cybersecurity') || normalizedContent.includes('cyber security')) {
      categories.push('Cybersecurity');
      confidence += 0.2;
    }

    if (normalizedContent.includes('clinical trial') || normalizedContent.includes('clinical study')) {
      categories.push('Clinical Trials');
      confidence += 0.2;
    }

    if (normalizedContent.includes('recall') || normalizedContent.includes('safety alert')) {
      categories.push('Safety Alert');
      confidence += 0.3;
    }

    // Ensure we have at least some basic categorization
    if (categories.length === 0) {
      categories.push('General MedTech');
      confidence = 0.5;
    }

    if (deviceTypes.length === 0) {
      deviceTypes.push('Medical Device');
    }

    return {
      categories: Array.from(new Set(categories)), // Remove duplicates
      confidence: Math.min(confidence, 1.0),
      deviceTypes: Array.from(new Set(deviceTypes)),
      riskLevel
    };
  }

  async extractKeyInformation(content: string): Promise<{
    keyPoints: string[];
    entities: string[];
    sentiment: 'positive' | 'negative' | 'neutral';
  }> {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // Extract key sentences (simple heuristic: sentences with important keywords)
    const importantKeywords = [
      'guidance', 'requirement', 'standard', 'compliance', 'approval', 'clearance',
      'recall', 'safety', 'risk', 'clinical', 'regulatory', 'fda', 'ema', 'ce mark'
    ];
    
    const keyPoints = sentences.filter(sentence => {
      const lowerSentence = sentence.toLowerCase();
      return importantKeywords.some(keyword => lowerSentence.includes(keyword));
    }).slice(0, 5); // Limit to top 5 key points

    // Extract entities (simplified - just find capitalized words/phrases)
    const entityPattern = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g;
    const entities = Array.from(new Set(content.match(entityPattern) || []));

    // Simple sentiment analysis based on keywords
    const positiveWords = ['approval', 'clearance', 'authorized', 'improved', 'enhanced', 'breakthrough'];
    const negativeWords = ['recall', 'violation', 'warning', 'denied', 'rejected', 'risk', 'adverse'];
    
    const lowerContent = content.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowerContent.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerContent.includes(word)).length;
    
    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
    if (positiveCount > negativeCount) sentiment = 'positive';
    else if (negativeCount > positiveCount) sentiment = 'negative';

    return {
      keyPoints,
      entities: entities.slice(0, 10), // Limit to top 10 entities
      sentiment
    };
  }

  async generateSummary(content: string, maxLength: number = 200): Promise<string> {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    if (sentences.length <= 2) {
      return content.substring(0, maxLength);
    }

    // Score sentences based on keyword frequency and position
    const scoredSentences = sentences.map((sentence, index) => {
      let score = 0;
      
      // First sentences are more important
      if (index < 2) score += 2;
      
      // Sentences with key terms are more important
      const keyTerms = ['guidance', 'requirement', 'approval', 'recall', 'standard', 'compliance', 'fda', 'ema'];
      keyTerms.forEach(term => {
        if (sentence.toLowerCase().includes(term)) score += 1;
      });
      
      // Longer sentences might contain more information
      score += sentence.length / 100;
      
      return { sentence: sentence.trim(), score };
    });

    // Sort by score and take top sentences
    scoredSentences.sort((a, b) => b.score - a.score);
    
    let summary = '';
    for (const item of scoredSentences) {
      if (summary.length + item.sentence.length + 2 <= maxLength) {
        summary += (summary ? '. ' : '') + item.sentence;
      } else {
        break;
      }
    }

    return summary || content.substring(0, maxLength);
  }
}

export const nlpService = new NLPService();
