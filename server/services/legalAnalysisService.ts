import { storage } from "../storage";
import type { LegalCase } from "@shared/schema";

interface LegalAnalysisResult {
  themes: string[];
  riskAssessment: string;
  precedentValue: 'high' | 'medium' | 'low';
  actionItems: string[];
  complianceImpact: string;
  recommendedSteps: string[];
}

interface LegalTrendAnalysis {
  emergingLegalTrends: string[];
  jurisdictionActivity: { [key: string]: number };
  riskPatterns: string[];
  litigationTypes: { [key: string]: number };
  preventiveRecommendations: string[];
}

export class LegalAnalysisService {
  
  private legalThemes = {
    'Produkthaftung': {
      keywords: ['product liability', 'defective device', 'manufacturer liability', 'design defect', 'manufacturing defect'],
      riskLevel: 'high',
      description: 'Haftungsrisiken bei fehlerhaften Medizinprodukten'
    },
    'Regulatorische Compliance': {
      keywords: ['FDA violation', 'regulatory breach', 'compliance failure', 'regulatory non-compliance', 'violation of regulation'],
      riskLevel: 'high',
      description: 'Verstöße gegen regulatorische Vorschriften'
    },
    'Klinische Studien': {
      keywords: ['clinical trial', 'informed consent', 'ethics committee', 'clinical investigation', 'study protocol'],
      riskLevel: 'medium',
      description: 'Rechtliche Aspekte klinischer Prüfungen'
    },
    'Patente und IP': {
      keywords: ['patent infringement', 'intellectual property', 'licensing', 'trademark', 'copyright'],
      riskLevel: 'medium',
      description: 'Geistiges Eigentum und Patentrechte'
    },
    'Datenschutz': {
      keywords: ['GDPR', 'DSGVO', 'data protection', 'privacy', 'personal data', 'data breach'],
      riskLevel: 'high',
      description: 'Datenschutzrechtliche Compliance'
    },
    'KI/ML-Regulierung': {
      keywords: ['artificial intelligence', 'machine learning', 'AI device', 'algorithmic bias', 'AI liability'],
      riskLevel: 'high',
      description: 'Rechtliche Herausforderungen bei KI-basierten Medizinprodukten'
    },
    'Cybersecurity': {
      keywords: ['cybersecurity', 'data breach', 'security vulnerability', 'cyber attack', 'data security'],
      riskLevel: 'high',
      description: 'IT-Sicherheit und Cyber-Bedrohungen'
    },
    'Marktüberwachung': {
      keywords: ['post-market surveillance', 'market surveillance', 'recall', 'corrective action', 'field safety notice'],
      riskLevel: 'medium',
      description: 'Marktüberwachung und Rückrufmaßnahmen'
    }
  };

  private jurisdictions = {
    'US': ['united states', 'usa', 'fda', 'america'],
    'EU': ['european union', 'europe', 'ema', 'mdr', 'ce mark'],
    'DE': ['germany', 'deutschland', 'bfarm', 'german'],
    'UK': ['united kingdom', 'britain', 'mhra', 'british'],
    'CH': ['switzerland', 'swissmedic', 'swiss'],
    'CA': ['canada', 'health canada', 'canadian'],
    'AU': ['australia', 'tga', 'australian'],
    'JP': ['japan', 'pmda', 'japanese']
  };

  async analyzeLegalCase(legalCase: LegalCase): Promise<LegalAnalysisResult> {
    try {
      const fullText = `${legalCase.title} ${legalCase.summary} ${legalCase.keyIssues?.join(' ') || ''}`.toLowerCase();
      
      const themes: string[] = [];
      let riskAssessment = 'Mittleres Risiko';
      let precedentValue: 'high' | 'medium' | 'low' = 'medium';
      const actionItems: string[] = [];
      const recommendedSteps: string[] = [];

      // Analyze legal themes
      let maxRiskLevel = 'low';
      for (const [theme, data] of Object.entries(this.legalThemes)) {
        if (data.keywords.some(keyword => fullText.includes(keyword.toLowerCase()))) {
          themes.push(theme);
          if (data.riskLevel === 'high') {
            maxRiskLevel = 'high';
            precedentValue = 'high';
          } else if (data.riskLevel === 'medium' && maxRiskLevel !== 'high') {
            maxRiskLevel = 'medium';
            if (precedentValue === 'low') precedentValue = 'medium';
          }
        }
      }

      // Determine risk assessment based on themes
      if (maxRiskLevel === 'high') {
        riskAssessment = 'Hohes Risiko - Sofortige Maßnahmen erforderlich';
        actionItems.push('Sofortige rechtliche Bewertung durch Fachanwalt');
        actionItems.push('Prüfung der Auswirkungen auf aktuelle Produkte');
        actionItems.push('Risikobewertung für ähnliche Technologien');
        recommendedSteps.push('Externe Rechtsberatung einbeziehen');
        recommendedSteps.push('Compliance-Audit durchführen');
      } else if (maxRiskLevel === 'medium') {
        riskAssessment = 'Mittleres Risiko - Regelmäßige Überwachung erforderlich';
        actionItems.push('Entwicklungen verfolgen und dokumentieren');
        actionItems.push('Interne Compliance-Prüfung einleiten');
        recommendedSteps.push('Vierteljährliche Bewertung einrichten');
        recommendedSteps.push('Präventive Maßnahmen evaluieren');
      } else {
        riskAssessment = 'Geringes Risiko - Zur Kenntnisnahme';
        actionItems.push('Archivierung für zukünftige Referenz');
        recommendedSteps.push('Jährliche Überprüfung der Relevanz');
      }

      // Theme-specific recommendations
      if (themes.includes('Produkthaftung')) {
        recommendedSteps.push('Produkthaftungsversicherung überprüfen');
        recommendedSteps.push('Design- und Fertigungsprozesse evaluieren');
      }

      if (themes.includes('KI/ML-Regulierung')) {
        recommendedSteps.push('KI-Governance-Framework entwickeln');
        recommendedSteps.push('Algorithmus-Transparenz verbessern');
      }

      if (themes.includes('Datenschutz')) {
        recommendedSteps.push('DSGVO-Compliance überprüfen');
        recommendedSteps.push('Privacy Impact Assessment durchführen');
      }

      if (themes.includes('Cybersecurity')) {
        recommendedSteps.push('IT-Sicherheitsaudit beauftragen');
        recommendedSteps.push('Incident Response Plan aktualisieren');
      }

      // Determine compliance impact
      const complianceImpact = this.determineComplianceImpact(themes, legalCase.jurisdiction);

      return {
        themes: themes.length > 0 ? themes : ['Allgemein'],
        riskAssessment,
        precedentValue,
        actionItems,
        complianceImpact,
        recommendedSteps
      };
    } catch (error) {
      console.error("Error analyzing legal case:", error);
      return {
        themes: ['Analysefehler'],
        riskAssessment: 'Manuelle Überprüfung erforderlich',
        precedentValue: 'medium',
        actionItems: ['Detaillierte manuelle Analyse durchführen'],
        complianceImpact: 'Unbekannt - manuelle Bewertung erforderlich',
        recommendedSteps: ['Externes Rechtsgutachten einholen']
      };
    }
  }

  private determineComplianceImpact(themes: string[], jurisdiction?: string): string {
    let impact = 'Gering';
    
    if (themes.includes('Regulatorische Compliance') || themes.includes('Produkthaftung')) {
      impact = 'Hoch - Direkte Auswirkungen auf Zulassungsverfahren möglich';
    } else if (themes.includes('KI/ML-Regulierung') || themes.includes('Datenschutz')) {
      impact = 'Mittel - Präventive Maßnahmen empfohlen';
    } else if (themes.includes('Cybersecurity') || themes.includes('Marktüberwachung')) {
      impact = 'Mittel - Überprüfung bestehender Prozesse erforderlich';
    }

    if (jurisdiction) {
      impact += ` (Jurisdiktion: ${jurisdiction})`;
    }

    return impact;
  }

  async analyzeLegalTrends(legalCases: LegalCase[]): Promise<LegalTrendAnalysis> {
    try {
      const emergingLegalTrends: string[] = [];
      const jurisdictionActivity: { [key: string]: number } = {};
      const riskPatterns: string[] = [];
      const litigationTypes: { [key: string]: number } = {};
      const preventiveRecommendations: string[] = [];

      // Analyze recent cases (last 6 months)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      const recentCases = legalCases.filter(legalCase => {
        const caseDate = new Date(legalCase.publishedAt);
        return caseDate > sixMonthsAgo;
      });

      // Count by jurisdiction
      for (const legalCase of recentCases) {
        if (legalCase.jurisdiction) {
          jurisdictionActivity[legalCase.jurisdiction] = (jurisdictionActivity[legalCase.jurisdiction] || 0) + 1;
        }
      }

      // Analyze themes and trends
      const themeCount: { [key: string]: number } = {};
      
      for (const legalCase of recentCases) {
        const analysis = await this.analyzeLegalCase(legalCase);
        
        for (const theme of analysis.themes) {
          themeCount[theme] = (themeCount[theme] || 0) + 1;
          litigationTypes[theme] = (litigationTypes[theme] || 0) + 1;
        }
      }

      // Identify emerging trends
      const sortedThemes = Object.entries(themeCount).sort(([,a], [,b]) => b - a);
      
      if (sortedThemes.length > 0) {
        const topTheme = sortedThemes[0];
        if (topTheme[1] > 3) {
          emergingLegalTrends.push(`Zunahme von ${topTheme[0]}-Fällen (${topTheme[1]} Fälle)`);
        }
      }

      // Specific trend analysis
      const aiCases = recentCases.filter(c => 
        c.title.toLowerCase().includes('ai') || 
        c.summary.toLowerCase().includes('artificial intelligence') ||
        c.keyIssues?.some(issue => issue.toLowerCase().includes('machine learning'))
      );

      if (aiCases.length > 2) {
        emergingLegalTrends.push('Verstärkte Regulierung von KI-basierten Medizinprodukten');
        preventiveRecommendations.push('KI-Governance und Ethik-Richtlinien entwickeln');
      }

      const cyberCases = recentCases.filter(c => 
        c.title.toLowerCase().includes('cyber') || 
        c.summary.toLowerCase().includes('data breach')
      );

      if (cyberCases.length > 1) {
        emergingLegalTrends.push('Erhöhte Cybersecurity-Litigation');
        preventiveRecommendations.push('IT-Sicherheitsmaßnahmen verstärken');
      }

      const gdprCases = recentCases.filter(c => 
        c.title.toLowerCase().includes('gdpr') || 
        c.summary.toLowerCase().includes('data protection')
      );

      if (gdprCases.length > 1) {
        emergingLegalTrends.push('Verstärkte Datenschutz-Enforcement');
        preventiveRecommendations.push('DSGVO-Compliance überprüfen und verstärken');
      }

      // Risk pattern analysis
      const highRiskCases = recentCases.filter(async c => {
        const analysis = await this.analyzeLegalCase(c);
        return analysis.precedentValue === 'high';
      });

      if (highRiskCases.length > recentCases.length * 0.3) {
        riskPatterns.push('Erhöhte Anzahl von High-Impact Rechtsfällen');
      }

      // Most active jurisdiction
      const mostActiveJurisdiction = Object.entries(jurisdictionActivity)
        .sort(([,a], [,b]) => b - a)[0];

      if (mostActiveJurisdiction && mostActiveJurisdiction[1] > 2) {
        emergingLegalTrends.push(`Erhöhte Rechtsaktivität in ${mostActiveJurisdiction[0]}`);
        preventiveRecommendations.push(`${mostActiveJurisdiction[0]}-spezifische Compliance-Strategie entwickeln`);
      }

      // General recommendations based on trends
      if (emergingLegalTrends.length > 2) {
        preventiveRecommendations.push('Quartalsmäßige Legal Risk Assessments implementieren');
        preventiveRecommendations.push('Proaktive Stakeholder-Kommunikation bei Rechtsänderungen');
      }

      return {
        emergingLegalTrends,
        jurisdictionActivity,
        riskPatterns,
        litigationTypes,
        preventiveRecommendations
      };
    } catch (error) {
      console.error("Error analyzing legal trends:", error);
      return {
        emergingLegalTrends: ['Trendanalyse nicht verfügbar'],
        jurisdictionActivity: {},
        riskPatterns: ['Manuelle Risikoanalyse erforderlich'],
        litigationTypes: {},
        preventiveRecommendations: ['Externe Rechtsberatung für Trendanalyse einholen']
      };
    }
  }

  async generateComplianceReport(themes: string[], jurisdiction: string): Promise<{
    riskLevel: 'high' | 'medium' | 'low';
    specificRequirements: string[];
    actionPlan: string[];
    timeline: string;
  }> {
    let riskLevel: 'high' | 'medium' | 'low' = 'low';
    const specificRequirements: string[] = [];
    const actionPlan: string[] = [];
    let timeline = '3-6 Monate';

    // High-risk themes
    if (themes.some(theme => ['Produkthaftung', 'Regulatorische Compliance', 'KI/ML-Regulierung', 'Datenschutz'].includes(theme))) {
      riskLevel = 'high';
      timeline = '1-3 Monate';
    } else if (themes.some(theme => ['Cybersecurity', 'Marktüberwachung', 'Klinische Studien'].includes(theme))) {
      riskLevel = 'medium';
      timeline = '2-4 Monate';
    }

    // Jurisdiction-specific requirements
    switch (jurisdiction.toUpperCase()) {
      case 'EU':
        specificRequirements.push('MDR-Compliance überprüfen');
        specificRequirements.push('CE-Kennzeichnung validieren');
        specificRequirements.push('DSGVO-Konformität sicherstellen');
        actionPlan.push('Benannte Stelle konsultieren');
        break;
      case 'US':
        specificRequirements.push('FDA-Registrierung überprüfen');
        specificRequirements.push('510(k) oder PMA-Status validieren');
        specificRequirements.push('QSR-Compliance sicherstellen');
        actionPlan.push('FDA-Beratung beantragen');
        break;
      case 'DE':
        specificRequirements.push('BfArM-Richtlinien befolgen');
        specificRequirements.push('DiGA-Kriterien prüfen (falls zutreffend)');
        actionPlan.push('Deutsche Rechtexperten konsultieren');
        break;
    }

    // Theme-specific action plans
    if (themes.includes('KI/ML-Regulierung')) {
      actionPlan.push('KI-Ethik-Komitee einrichten');
      actionPlan.push('Algorithmus-Auditierung implementieren');
    }

    if (themes.includes('Cybersecurity')) {
      actionPlan.push('Penetration Testing durchführen');
      actionPlan.push('ISO 27001 Zertifizierung anstreben');
    }

    return {
      riskLevel,
      specificRequirements,
      actionPlan,
      timeline
    };
  }

  async extractKeyLegalPrinciples(caseText: string): Promise<{
    principles: string[];
    precedents: string[];
    implications: string[];
  }> {
    const principles: string[] = [];
    const precedents: string[] = [];
    const implications: string[] = [];

    const lowerText = caseText.toLowerCase();

    // Extract legal principles
    if (lowerText.includes('duty of care') || lowerText.includes('sorgfaltspflicht')) {
      principles.push('Sorgfaltspflicht des Herstellers');
      implications.push('Erhöhte Dokumentations- und Qualitätssicherungsanforderungen');
    }

    if (lowerText.includes('informed consent') || lowerText.includes('aufklärungspflicht')) {
      principles.push('Informed Consent bei klinischen Studien');
      implications.push('Verstärkte Aufklärungs- und Dokumentationspflichten');
    }

    if (lowerText.includes('regulatory compliance') || lowerText.includes('regulatorische compliance')) {
      principles.push('Strikte Einhaltung regulatorischer Vorgaben');
      implications.push('Kontinuierliche Überwachung von Regulierungsänderungen erforderlich');
    }

    if (lowerText.includes('data protection') || lowerText.includes('datenschutz')) {
      principles.push('Datenschutz als Grundrecht');
      implications.push('Privacy by Design in Produktentwicklung integrieren');
    }

    // Extract precedents
    if (lowerText.includes('landmark case') || lowerText.includes('precedent')) {
      precedents.push('Präzedenzfall für ähnliche Technologien');
    }

    if (lowerText.includes('class action') || lowerText.includes('sammelklage')) {
      precedents.push('Potenzial für Sammelklagen bei ähnlichen Problemen');
    }

    return {
      principles,
      precedents,
      implications
    };
  }
}

export const legalAnalysisService = new LegalAnalysisService();