import { LegalCase } from "@shared/schema";

interface LegalTheme {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  relatedCases: string[];
  precedentValue: 'high' | 'medium' | 'low';
  jurisdiction: string[];
  category: string;
}

interface CaseRelationship {
  caseId1: string;
  caseId2: string;
  relationshipType: 'precedent' | 'similar_facts' | 'conflicting' | 'citing' | 'overturned';
  strength: number; // 0-1
  explanation: string;
}

interface LegalAnalysis {
  themes: LegalTheme[];
  relationships: CaseRelationship[];
  precedentChains: Array<{
    theme: string;
    cases: string[];
    development: string;
  }>;
  conflictingDecisions: Array<{
    issue: string;
    cases: Array<{
      caseId: string;
      position: string;
      jurisdiction: string;
    }>;
  }>;
}

export class LegalAnalysisService {
  private themes: LegalTheme[] = [
    {
      id: "product_liability",
      name: "Produkthaftung bei Medizinprodukten",
      description: "Haftung des Herstellers für Schäden durch defekte Medizinprodukte",
      keywords: ["product liability", "defective device", "manufacturer liability", "Produkthaftung", "Herstellerhaftung"],
      relatedCases: [],
      precedentValue: "high",
      jurisdiction: ["US", "EU", "DE", "UK"],
      category: "Liability"
    },
    {
      id: "regulatory_compliance",
      name: "Regulatorische Compliance-Verletzungen",
      description: "Verstöße gegen FDA, EMA oder andere regulatorische Anforderungen",
      keywords: ["FDA violation", "regulatory breach", "compliance failure", "EMA non-compliance", "Zulassungsverstoß"],
      relatedCases: [],
      precedentValue: "high",
      jurisdiction: ["US", "EU", "DE", "UK", "CH"],
      category: "Regulatory"
    },
    {
      id: "clinical_trial_issues",
      name: "Klinische Studien und Ethik",
      description: "Probleme bei klinischen Studien, Einverständnis, Ethikkommissionen",
      keywords: ["clinical trial", "informed consent", "ethics committee", "klinische Studie", "Aufklärung"],
      relatedCases: [],
      precedentValue: "medium",
      jurisdiction: ["US", "EU", "DE", "UK", "CH"],
      category: "Clinical"
    },
    {
      id: "patent_ip",
      name: "Patente und geistiges Eigentum",
      description: "Patentstreitigkeiten, Lizenzierung, geistiges Eigentum bei Medizinprodukten",
      keywords: ["patent infringement", "intellectual property", "licensing", "Patentverletzung", "Lizenzierung"],
      relatedCases: [],
      precedentValue: "medium",
      jurisdiction: ["US", "EU", "DE", "UK", "CH"],
      category: "IP"
    },
    {
      id: "market_access",
      name: "Marktzugang und Erstattung",
      description: "Streitigkeiten um Marktzulassung, Preisgestaltung, Erstattung",
      keywords: ["market access", "reimbursement", "pricing", "Marktzugang", "Erstattung"],
      relatedCases: [],
      precedentValue: "medium",
      jurisdiction: ["US", "EU", "DE", "UK", "CH"],
      category: "Market Access"
    },
    {
      id: "data_privacy",
      name: "Datenschutz und Medizindaten",
      description: "GDPR/DSGVO Compliance, Patientendatenschutz, Cybersecurity",
      keywords: ["GDPR", "DSGVO", "data protection", "patient privacy", "Datenschutz"],
      relatedCases: [],
      precedentValue: "high",
      jurisdiction: ["EU", "DE", "UK", "CH"],
      category: "Privacy"
    },
    {
      id: "ai_ml_devices",
      name: "KI/ML-basierte Medizinprodukte",
      description: "Rechtliche Fragen zu künstlicher Intelligenz und maschinellem Lernen",
      keywords: ["artificial intelligence", "machine learning", "AI device", "KI-Medizinprodukt", "algorithm"],
      relatedCases: [],
      precedentValue: "high",
      jurisdiction: ["US", "EU", "DE", "UK"],
      category: "AI/ML"
    }
  ];

  async analyzeLegalCases(cases: LegalCase[]): Promise<LegalAnalysis> {
    console.log(`Analyzing ${cases.length} legal cases for themes and relationships...`);

    const analysis: LegalAnalysis = {
      themes: [],
      relationships: [],
      precedentChains: [],
      conflictingDecisions: []
    };

    // 1. Kategorisiere Fälle nach Themen
    for (const theme of this.themes) {
      const relatedCases = this.findCasesForTheme(cases, theme);
      if (relatedCases.length > 0) {
        theme.relatedCases = relatedCases.map(c => c.id);
        analysis.themes.push({
          ...theme,
          relatedCases: theme.relatedCases
        });
      }
    }

    // 2. Finde Beziehungen zwischen Fällen
    analysis.relationships = this.findCaseRelationships(cases);

    // 3. Erstelle Präzedenzfallketten
    analysis.precedentChains = this.buildPrecedentChains(cases, analysis.relationships);

    // 4. Identifiziere widersprüchliche Entscheidungen
    analysis.conflictingDecisions = this.findConflictingDecisions(cases, analysis.themes);

    console.log(`Legal analysis complete: ${analysis.themes.length} themes, ${analysis.relationships.length} relationships`);
    return analysis;
  }

  private findCasesForTheme(cases: LegalCase[], theme: LegalTheme): LegalCase[] {
    return cases.filter(case_ => {
      const searchText = `${case_.caseTitle} ${case_.summary} ${case_.keyIssues.join(' ')}`.toLowerCase();
      
      return theme.keywords.some(keyword => 
        searchText.includes(keyword.toLowerCase())
      );
    });
  }

  private findCaseRelationships(cases: LegalCase[]): CaseRelationship[] {
    const relationships: CaseRelationship[] = [];

    for (let i = 0; i < cases.length; i++) {
      for (let j = i + 1; j < cases.length; j++) {
        const case1 = cases[i];
        const case2 = cases[j];

        const relationship = this.analyzeCaseRelationship(case1, case2);
        if (relationship.strength > 0.3) { // Nur signifikante Beziehungen
          relationships.push(relationship);
        }
      }
    }

    return relationships.sort((a, b) => b.strength - a.strength);
  }

  private analyzeCaseRelationship(case1: LegalCase, case2: LegalCase): CaseRelationship {
    let strength = 0;
    let relationshipType: CaseRelationship['relationshipType'] = 'similar_facts';
    let explanation = '';

    // Prüfe auf gemeinsame Themen
    const commonIssues = case1.keyIssues.filter(issue => 
      case2.keyIssues.some(issue2 => 
        issue.toLowerCase().includes(issue2.toLowerCase()) || 
        issue2.toLowerCase().includes(issue.toLowerCase())
      )
    );

    if (commonIssues.length > 0) {
      strength += 0.3 * (commonIssues.length / Math.max(case1.keyIssues.length, case2.keyIssues.length));
      explanation += `Gemeinsame Rechtsfragen: ${commonIssues.join(', ')}. `;
    }

    // Prüfe auf ähnliche Gerätetypen
    const deviceSimilarity = this.calculateDeviceSimilarity(case1.deviceTypes, case2.deviceTypes);
    if (deviceSimilarity > 0) {
      strength += 0.2 * deviceSimilarity;
      explanation += `Ähnliche Gerätetypen. `;
    }

    // Prüfe auf Zitierungen
    if (case1.summary.toLowerCase().includes(case2.caseTitle.toLowerCase()) ||
        case2.summary.toLowerCase().includes(case1.caseTitle.toLowerCase())) {
      strength += 0.4;
      relationshipType = 'citing';
      explanation += `Ein Fall zitiert den anderen. `;
    }

    // Prüfe zeitliche Abfolge für Präzedenzfälle
    const date1 = new Date(case1.decisionDate);
    const date2 = new Date(case2.decisionDate);
    if (Math.abs(date1.getTime() - date2.getTime()) < 365 * 24 * 60 * 60 * 1000 && // Binnen eines Jahres
        case1.jurisdiction === case2.jurisdiction) {
      strength += 0.2;
      if (date1 < date2) {
        relationshipType = 'precedent';
        explanation += `${case1.caseTitle} könnte Präzedenzfall für ${case2.caseTitle} sein. `;
      }
    }

    // Prüfe auf widersprüchliche Entscheidungen
    if (this.areDecisionsConflicting(case1, case2)) {
      relationshipType = 'conflicting';
      strength += 0.3;
      explanation += `Widersprüchliche Entscheidungen zu ähnlichen Sachverhalten. `;
    }

    return {
      caseId1: case1.id,
      caseId2: case2.id,
      relationshipType,
      strength,
      explanation: explanation.trim()
    };
  }

  private calculateDeviceSimilarity(devices1: string[], devices2: string[]): number {
    if (devices1.length === 0 || devices2.length === 0) return 0;
    
    const commonDevices = devices1.filter(d1 => 
      devices2.some(d2 => 
        d1.toLowerCase().includes(d2.toLowerCase()) || 
        d2.toLowerCase().includes(d1.toLowerCase())
      )
    );
    
    return commonDevices.length / Math.max(devices1.length, devices2.length);
  }

  private areDecisionsConflicting(case1: LegalCase, case2: LegalCase): boolean {
    // Vereinfachte Logik zur Erkennung widersprüchlicher Entscheidungen
    const outcome1 = case1.outcome.toLowerCase();
    const outcome2 = case2.outcome.toLowerCase();
    
    const case1Favorable = outcome1.includes('granted') || outcome1.includes('approved') || outcome1.includes('allowed');
    const case2Favorable = outcome2.includes('granted') || outcome2.includes('approved') || outcome2.includes('allowed');
    
    const case1Unfavorable = outcome1.includes('denied') || outcome1.includes('rejected') || outcome1.includes('dismissed');
    const case2Unfavorable = outcome2.includes('denied') || outcome2.includes('rejected') || outcome2.includes('dismissed');
    
    return (case1Favorable && case2Unfavorable) || (case1Unfavorable && case2Favorable);
  }

  private buildPrecedentChains(cases: LegalCase[], relationships: CaseRelationship[]): Array<{theme: string, cases: string[], development: string}> {
    const chains: Array<{theme: string, cases: string[], development: string}> = [];
    
    for (const theme of this.themes) {
      const themeCases = cases.filter(c => 
        theme.keywords.some(keyword => 
          `${c.caseTitle} ${c.summary}`.toLowerCase().includes(keyword.toLowerCase())
        )
      ).sort((a, b) => new Date(a.decisionDate).getTime() - new Date(b.decisionDate).getTime());
      
      if (themeCases.length > 1) {
        chains.push({
          theme: theme.name,
          cases: themeCases.map(c => c.id),
          development: this.analyzeLegalDevelopment(themeCases)
        });
      }
    }
    
    return chains;
  }

  private analyzeLegalDevelopment(cases: LegalCase[]): string {
    if (cases.length < 2) return "Einzelentscheidung ohne erkennbare Entwicklung.";
    
    const developments = [];
    
    // Analysiere zeitliche Entwicklung
    const timeSpan = new Date(cases[cases.length - 1].decisionDate).getTime() - 
                     new Date(cases[0].decisionDate).getTime();
    const years = timeSpan / (365 * 24 * 60 * 60 * 1000);
    
    developments.push(`Rechtsentwicklung über ${Math.round(years)} Jahre`);
    
    // Analysiere Trend in Entscheidungen
    const favorableOutcomes = cases.filter(c => 
      c.outcome.toLowerCase().includes('granted') || 
      c.outcome.toLowerCase().includes('approved')
    ).length;
    
    const trend = favorableOutcomes / cases.length;
    if (trend > 0.7) {
      developments.push("überwiegend positive Entscheidungen");
    } else if (trend < 0.3) {
      developments.push("überwiegend ablehnende Entscheidungen");
    } else {
      developments.push("gemischte Rechtslage");
    }
    
    return developments.join(', ') + '.';
  }

  private findConflictingDecisions(cases: LegalCase[], themes: LegalTheme[]): Array<{issue: string, cases: Array<{caseId: string, position: string, jurisdiction: string}>}> {
    const conflicts: Array<{issue: string, cases: Array<{caseId: string, position: string, jurisdiction: string}>}> = [];
    
    for (const theme of themes) {
      const themeCases = cases.filter(c => theme.relatedCases.includes(c.id));
      
      if (themeCases.length > 1) {
        const positions = new Map<string, Array<{caseId: string, jurisdiction: string}>>();
        
        for (const case_ of themeCases) {
          const position = this.extractLegalPosition(case_);
          if (!positions.has(position)) {
            positions.set(position, []);
          }
          positions.get(position)!.push({
            caseId: case_.id,
            jurisdiction: case_.jurisdiction
          });
        }
        
        if (positions.size > 1) {
          const conflictCases = Array.from(positions.entries()).map(([position, cases]) => ({
            position,
            cases: cases.map(c => ({
              caseId: c.caseId,
              position,
              jurisdiction: c.jurisdiction
            }))
          })).flat().map(item => item.cases).flat();
          
          conflicts.push({
            issue: theme.name,
            cases: conflictCases
          });
        }
      }
    }
    
    return conflicts;
  }

  private extractLegalPosition(case_: LegalCase): string {
    const outcome = case_.outcome.toLowerCase();
    
    if (outcome.includes('granted') || outcome.includes('approved') || outcome.includes('allowed')) {
      return 'favorable';
    } else if (outcome.includes('denied') || outcome.includes('rejected') || outcome.includes('dismissed')) {
      return 'unfavorable';
    } else if (outcome.includes('remanded') || outcome.includes('remand')) {
      return 'remanded';
    } else if (outcome.includes('settled')) {
      return 'settled';
    }
    
    return 'neutral';
  }

  async searchRelatedCases(query: string, jurisdiction?: string): Promise<{cases: LegalCase[], analysis: LegalAnalysis}> {
    // Diese Methode würde echte Fälle aus der Datenbank abrufen
    // Für Demo-Zwecke generieren wir Beispieldaten
    const mockCases = this.generateMockCasesForQuery(query, jurisdiction);
    const analysis = await this.analyzeLegalCases(mockCases);
    
    return { cases: mockCases, analysis };
  }

  private generateMockCasesForQuery(query: string, jurisdiction?: string): LegalCase[] {
    // Mock-Implementierung - in der Realität würde dies aus der Datenbank kommen
    const baseCases: Partial<LegalCase>[] = [
      {
        caseTitle: "Medtronic vs. FDA Product Liability Case",
        summary: "Manufacturer liability for defective cardiac device causing patient harm",
        keyIssues: ["product liability", "defective device", "FDA oversight"],
        deviceTypes: ["cardiac device", "implantable"],
        outcome: "Granted in favor of plaintiff",
        jurisdiction: "US",
        decisionDate: "2023-03-15"
      },
      {
        caseTitle: "Boston Scientific Regulatory Compliance Violation",
        summary: "FDA enforcement action for non-compliance with clinical trial regulations",
        keyIssues: ["regulatory compliance", "clinical trial violations", "FDA enforcement"],
        deviceTypes: ["surgical instruments"],
        outcome: "Denied - company sanctioned",
        jurisdiction: "US", 
        decisionDate: "2023-08-22"
      }
    ];

    return baseCases.map((case_, index) => ({
      id: `mock_case_${index}`,
      caseTitle: case_.caseTitle || "Mock Case",
      caseNumber: `${Date.now()}_${index}`,
      court: "Mock Court",
      jurisdiction: jurisdiction || case_.jurisdiction || "US",
      decisionDate: case_.decisionDate || "2023-01-01",
      summary: case_.summary || "Mock case summary",
      keyIssues: case_.keyIssues || ["mock issue"],
      deviceTypes: case_.deviceTypes || ["medical device"],
      parties: {
        plaintiff: "Plaintiff Name",
        defendant: "Defendant Name"
      },
      outcome: case_.outcome || "Mock outcome",
      significance: "High",
      precedentValue: "Medium",
      relatedCases: [],
      documentUrl: `/legal/cases/mock_case_${index}`,
      lastUpdated: new Date().toISOString()
    }));
  }
}