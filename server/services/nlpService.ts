interface CategoryResult {
  categories: string[];
  confidence: number;
  deviceTypes: string[];
  riskLevel: string;
  therapeuticArea: string;
}

interface ExtractionResult {
  keyPoints: string[];
  entities: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
}

interface SummaryOptions {
  maxLength: number;
  extractKeywords: boolean;
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
    let therapeuticArea = 'general';

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
        therapeuticArea = area;
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

    if (normalizedContent.includes('mdr') || normalizedContent.includes('medical device regulation')) {
      categories.push('MDR Compliance');
      confidence += 0.2;
    }

    if (normalizedContent.includes('fda') || normalizedContent.includes('510k') || normalizedContent.includes('pma')) {
      categories.push('FDA Regulation');
      confidence += 0.2;
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
      riskLevel,
      therapeuticArea
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
      'recall', 'safety', 'risk', 'clinical', 'regulatory', 'fda', 'ema', 'ce mark',
      'mdr', 'cybersecurity', 'artificial intelligence', 'machine learning'
    ];
    
    const keyPoints = sentences.filter(sentence => {
      const lowerSentence = sentence.toLowerCase();
      return importantKeywords.some(keyword => lowerSentence.includes(keyword));
    }).slice(0, 5); // Limit to top 5 key points

    // Extract entities (simplified - just find capitalized words/phrases)
    const entityPattern = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g;
    const entities = Array.from(new Set(content.match(entityPattern) || []));

    // Simple sentiment analysis based on keywords
    const positiveWords = ['approval', 'clearance', 'authorized', 'improved', 'enhanced', 'breakthrough', 'innovation'];
    const negativeWords = ['recall', 'violation', 'warning', 'denied', 'rejected', 'risk', 'adverse', 'violation'];
    
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
      const keyTerms = ['guidance', 'requirement', 'approval', 'recall', 'standard', 'compliance', 'fda', 'ema', 'mdr'];
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
      if (summary.length + item.sentence.length <= maxLength) {
        summary += (summary ? '. ' : '') + item.sentence;
      } else {
        break;
      }
    }
    
    return summary || content.substring(0, maxLength);
  }

  async detectRegulatoryCompliance(content: string): Promise<{
    complianceAreas: string[];
    requirements: string[];
    risks: string[];
    recommendations: string[];
  }> {
    const normalizedContent = content.toLowerCase();
    
    const complianceAreas: string[] = [];
    const requirements: string[] = [];
    const risks: string[] = [];
    const recommendations: string[] = [];

    // Detect compliance areas
    const compliancePatterns = {
      'MDR': ['mdr', 'medical device regulation', 'eu 2017/745'],
      'FDA': ['fda', '510k', 'pma', 'de novo'],
      'ISO 13485': ['iso 13485', 'quality management'],
      'ISO 14971': ['iso 14971', 'risk management'],
      'IEC 62304': ['iec 62304', 'software lifecycle'],
      'Cybersecurity': ['cybersecurity', 'cyber security', 'data protection'],
      'Clinical Evaluation': ['clinical evaluation', 'clinical data', 'clinical investigation']
    };

    for (const [area, patterns] of Object.entries(compliancePatterns)) {
      if (patterns.some(pattern => normalizedContent.includes(pattern))) {
        complianceAreas.push(area);
      }
    }

    // Detect requirements
    if (normalizedContent.includes('clinical evaluation')) {
      requirements.push('Klinische Bewertung erforderlich');
    }
    if (normalizedContent.includes('post-market surveillance')) {
      requirements.push('Post-Market Surveillance implementieren');
    }
    if (normalizedContent.includes('risk management')) {
      requirements.push('Risikomanagement nach ISO 14971');
    }
    if (normalizedContent.includes('cybersecurity')) {
      requirements.push('Cybersecurity-Maßnahmen implementieren');
    }

    // Detect risks
    if (normalizedContent.includes('recall') || normalizedContent.includes('warning')) {
      risks.push('Sicherheitsrisiko - Überwachung erforderlich');
    }
    if (normalizedContent.includes('non-compliance') || normalizedContent.includes('violation')) {
      risks.push('Compliance-Risiko - Sofortige Maßnahmen erforderlich');
    }
    if (normalizedContent.includes('ai') || normalizedContent.includes('machine learning')) {
      risks.push('KI-Risiko - Spezielle Regulierung beachten');
    }

    // Generate recommendations
    if (complianceAreas.includes('MDR')) {
      recommendations.push('MDR-Compliance überprüfen und dokumentieren');
    }
    if (complianceAreas.includes('FDA')) {
      recommendations.push('FDA-Submission-Strategie entwickeln');
    }
    if (complianceAreas.includes('Cybersecurity')) {
      recommendations.push('Cybersecurity-Assessment durchführen');
    }
    if (risks.length > 0) {
      recommendations.push('Risikobewertung aktualisieren');
    }

    return {
      complianceAreas,
      requirements,
      risks,
      recommendations
    };
  }
}

export const nlpService = new NLPService();