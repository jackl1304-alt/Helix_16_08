import { storage } from "../storage";
import type { RegulatoryUpdate } from "@shared/schema";

export class AIService {
  
  // Enhanced regulatory content analysis
  async analyzeRegulatoryContent(content: string): Promise<{
    categories: string[];
    confidence: number;
    deviceTypes: string[];
    riskLevel: string;
    therapeuticArea: string;
    complianceRequirements: string[];
  }> {
    try {
      const normalizedContent = content.toLowerCase();
      
      const categories: string[] = [];
      const deviceTypes: string[] = [];
      const complianceRequirements: string[] = [];
      let riskLevel = 'medium';
      let confidence = 0;
      let therapeuticArea = 'general';

      // Device type analysis
      const deviceTypeKeywords = [
        'diagnostic', 'therapeutic', 'surgical', 'monitoring', 'imaging',
        'implantable', 'prosthetic', 'orthopedic', 'cardiovascular', 'neurological',
        'ophthalmic', 'dental', 'dermatological', 'respiratory', 'anesthesia',
        'infusion pump', 'defibrillator', 'pacemaker', 'catheter', 'stent',
        'artificial intelligence', 'machine learning', 'software', 'mobile app'
      ];

      for (const deviceType of deviceTypeKeywords) {
        if (normalizedContent.includes(deviceType.toLowerCase())) {
          deviceTypes.push(deviceType);
          confidence += 0.1;
        }
      }

      // Risk level analysis
      if (normalizedContent.includes('class iii') || normalizedContent.includes('implantable') || 
          normalizedContent.includes('life-sustaining') || normalizedContent.includes('critical')) {
        riskLevel = 'high';
        confidence += 0.3;
      } else if (normalizedContent.includes('class ii') || normalizedContent.includes('monitoring')) {
        riskLevel = 'medium';
        confidence += 0.2;
      } else if (normalizedContent.includes('class i') || normalizedContent.includes('non-invasive')) {
        riskLevel = 'low';
        confidence += 0.1;
      }

      // Therapeutic area analysis
      const therapeuticAreas = [
        'cardiology', 'neurology', 'oncology', 'orthopedics', 'ophthalmology',
        'gastroenterology', 'urology', 'gynecology', 'dermatology', 'endocrinology'
      ];

      for (const area of therapeuticAreas) {
        if (normalizedContent.includes(area.toLowerCase())) {
          therapeuticArea = area;
          categories.push(area);
          confidence += 0.1;
          break;
        }
      }

      // Compliance requirements analysis
      const complianceTerms = [
        'cybersecurity', 'clinical evaluation', 'post-market surveillance',
        'quality management', 'risk management', 'biocompatibility',
        'software lifecycle', 'usability engineering', 'clinical investigation'
      ];

      for (const term of complianceTerms) {
        if (normalizedContent.includes(term.toLowerCase())) {
          complianceRequirements.push(term);
          confidence += 0.1;
        }
      }

      // Special categories
      if (normalizedContent.includes('ai') || normalizedContent.includes('artificial intelligence')) {
        categories.push('AI/ML Technology');
        confidence += 0.2;
      }

      if (normalizedContent.includes('recall') || normalizedContent.includes('safety alert')) {
        categories.push('Safety Alert');
        confidence += 0.3;
      }

      // Ensure minimum categorization
      if (categories.length === 0) {
        categories.push('Medical Device');
        confidence = Math.max(confidence, 0.5);
      }

      if (deviceTypes.length === 0) {
        deviceTypes.push('Medical Device');
      }

      return {
        categories: Array.from(new Set(categories)),
        confidence: Math.min(confidence, 1.0),
        deviceTypes: Array.from(new Set(deviceTypes)),
        riskLevel,
        therapeuticArea,
        complianceRequirements: Array.from(new Set(complianceRequirements))
      };
    } catch (error) {
      console.error("Error analyzing regulatory content:", error);
      throw error;
    }
  }

  // Regulatory update prioritization
  async prioritizeRegulatoryUpdate(update: RegulatoryUpdate): Promise<{
    priority: 'critical' | 'high' | 'medium' | 'low';
    reasoning: string;
    actionItems: string[];
  }> {
    try {
      const analysis = await this.analyzeRegulatoryContent(
        `${update.title} ${update.description || ''}`
      );

      let priority: 'critical' | 'high' | 'medium' | 'low' = 'medium';
      const reasoning: string[] = [];
      const actionItems: string[] = [];

      // Critical priority factors
      if (analysis.categories.includes('Safety Alert') || 
          update.updateType === 'recall' ||
          analysis.riskLevel === 'high') {
        priority = 'critical';
        reasoning.push('Sicherheitsrelevante Inhalte oder Hochrisiko-Geräte');
        actionItems.push('Sofortige Überprüfung der betroffenen Produkte');
        actionItems.push('Benachrichtigung der relevanten Teams');
      }

      // High priority factors
      else if (analysis.categories.includes('AI/ML Technology') ||
               update.region === 'EU' && analysis.complianceRequirements.length > 2 ||
               analysis.confidence > 0.8) {
        priority = 'high';
        reasoning.push('Neue Technologien oder umfangreiche Compliance-Anforderungen');
        actionItems.push('Detaillierte Analyse der Auswirkungen');
        actionItems.push('Aktualisierung der internen Richtlinien prüfen');
      }

      // Medium priority (default)
      else if (analysis.confidence > 0.5) {
        priority = 'medium';
        reasoning.push('Standardmäßige regulatorische Änderungen');
        actionItems.push('Routinemäßige Überprüfung einplanen');
      }

      // Low priority
      else {
        priority = 'low';
        reasoning.push('Geringfügige oder allgemeine Informationen');
        actionItems.push('Zur Kenntnisnahme archivieren');
      }

      return {
        priority,
        reasoning: reasoning.join('; '),
        actionItems
      };
    } catch (error) {
      console.error("Error prioritizing regulatory update:", error);
      return {
        priority: 'medium',
        reasoning: 'Automatische Priorisierung fehlgeschlagen',
        actionItems: ['Manuelle Überprüfung erforderlich']
      };
    }
  }

  // Legal case analysis
  async analyzeLegalCase(caseData: {
    title: string;
    summary: string;
    keyIssues: string[];
  }): Promise<{
    themes: string[];
    riskAssessment: string;
    precedentValue: 'high' | 'medium' | 'low';
    actionItems: string[];
  }> {
    try {
      const searchText = `${caseData.title} ${caseData.summary} ${caseData.keyIssues.join(' ')}`.toLowerCase();
      
      const themes: string[] = [];
      let precedentValue: 'high' | 'medium' | 'low' = 'medium';
      const actionItems: string[] = [];

      // Legal theme detection
      const legalThemes = {
        'Produkthaftung': ['product liability', 'defective device', 'manufacturer liability'],
        'Regulatorische Compliance': ['FDA violation', 'regulatory breach', 'compliance failure'],
        'Klinische Studien': ['clinical trial', 'informed consent', 'ethics committee'],
        'Patente': ['patent infringement', 'intellectual property', 'licensing'],
        'Datenschutz': ['GDPR', 'DSGVO', 'data protection', 'privacy'],
        'KI/ML-Geräte': ['artificial intelligence', 'machine learning', 'AI device']
      };

      for (const [theme, keywords] of Object.entries(legalThemes)) {
        if (keywords.some(keyword => searchText.includes(keyword.toLowerCase()))) {
          themes.push(theme);
        }
      }

      // Precedent value assessment
      if (themes.includes('Produkthaftung') || themes.includes('Regulatorische Compliance')) {
        precedentValue = 'high';
        actionItems.push('Überprüfung der aktuellen Compliance-Maßnahmen');
        actionItems.push('Risikoanalyse für ähnliche Produkte');
      } else if (themes.includes('KI/ML-Geräte') || themes.includes('Datenschutz')) {
        precedentValue = 'high';
        actionItems.push('Bewertung der Auswirkungen auf digitale Gesundheitslösungen');
      } else if (themes.length > 0) {
        precedentValue = 'medium';
        actionItems.push('Monitoring ähnlicher Fälle');
      } else {
        precedentValue = 'low';
        actionItems.push('Zur Kenntnisnahme archivieren');
      }

      const riskAssessment = precedentValue === 'high' 
        ? 'Hohes Risiko - Sofortige Maßnahmen erforderlich'
        : precedentValue === 'medium'
        ? 'Mittleres Risiko - Regelmäßige Überwachung'
        : 'Geringes Risiko - Allgemeine Beobachtung';

      return {
        themes: themes.length > 0 ? themes : ['Allgemein'],
        riskAssessment,
        precedentValue,
        actionItems
      };
    } catch (error) {
      console.error("Error analyzing legal case:", error);
      return {
        themes: ['Analysefehler'],
        riskAssessment: 'Manuelle Überprüfung erforderlich',
        precedentValue: 'medium',
        actionItems: ['Detaillierte manuelle Analyse durchführen']
      };
    }
  }

  // Market trend analysis
  async analyzeMarketTrends(regulatoryUpdates: RegulatoryUpdate[]): Promise<{
    emergingTrends: string[];
    deviceTypeTrends: { [key: string]: number };
    regionActivity: { [key: string]: number };
    recommendations: string[];
  }> {
    try {
      const emergingTrends: string[] = [];
      const deviceTypeTrends: { [key: string]: number } = {};
      const regionActivity: { [key: string]: number } = {};
      const recommendations: string[] = [];

      // Analyze recent updates (last 30 days)
      const recentUpdates = regulatoryUpdates.filter(update => {
        const updateDate = new Date(update.publishedAt);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return updateDate > thirtyDaysAgo;
      });

      // Count by region
      for (const update of recentUpdates) {
        regionActivity[update.region] = (regionActivity[update.region] || 0) + 1;
      }

      // Analyze content for trends
      const aiMlCount = recentUpdates.filter(u => 
        u.title.toLowerCase().includes('ai') || 
        u.title.toLowerCase().includes('artificial intelligence') ||
        u.description?.toLowerCase().includes('machine learning')
      ).length;

      const cybersecurityCount = recentUpdates.filter(u => 
        u.title.toLowerCase().includes('cybersecurity') || 
        u.description?.toLowerCase().includes('cyber')
      ).length;

      const digitalHealthCount = recentUpdates.filter(u => 
        u.title.toLowerCase().includes('digital') || 
        u.title.toLowerCase().includes('telemedicine') ||
        u.description?.toLowerCase().includes('remote monitoring')
      ).length;

      // Identify emerging trends
      if (aiMlCount > 3) {
        emergingTrends.push('KI/ML-Regulierung verstärkt sich');
        recommendations.push('Verstärkte Vorbereitung auf KI-Regulierung empfohlen');
      }

      if (cybersecurityCount > 2) {
        emergingTrends.push('Erhöhte Cybersecurity-Anforderungen');
        recommendations.push('Cybersecurity-Maßnahmen überprüfen und verstärken');
      }

      if (digitalHealthCount > 4) {
        emergingTrends.push('Digitale Gesundheitslösungen im Fokus');
        recommendations.push('Digitale Strategien entwickeln oder erweitern');
      }

      // Most active regions
      const mostActiveRegion = Object.entries(regionActivity)
        .sort(([,a], [,b]) => b - a)[0];

      if (mostActiveRegion && mostActiveRegion[1] > 5) {
        recommendations.push(`Erhöhte Aktivität in ${mostActiveRegion[0]} - Marktchancen prüfen`);
      }

      return {
        emergingTrends,
        deviceTypeTrends,
        regionActivity,
        recommendations
      };
    } catch (error) {
      console.error("Error analyzing market trends:", error);
      return {
        emergingTrends: ['Analyse nicht verfügbar'],
        deviceTypeTrends: {},
        regionActivity: {},
        recommendations: ['Manuelle Trendanalyse durchführen']
      };
    }
  }
}

export const aiService = new AIService();