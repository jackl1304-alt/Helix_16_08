// Services imports - using dynamic imports to avoid circular dependencies

interface SearchResult {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  type: 'regulatory' | 'legal' | 'knowledge' | 'historical';
  source: string;
  relevance: number;
  date: string;
  url?: string;
  metadata: {
    region?: string;
    deviceClass?: string;
    category?: string;
    tags?: string[];
    language?: string;
  };
}

interface IntelligentAnswer {
  query: string;
  answer: string;
  confidence: number;
  sources: string[];
  recommendations: string[];
  relatedTopics: string[];
  timestamp: string;
}

interface SearchFilters {
  type: string;
  region: string;
  timeframe: string;
}

class IntelligentSearchService {
  private knowledgeBase = [
    {
      id: "kb_1",
      title: "MDR Implementierung: Vollständiger Leitfaden für Klasse III Geräte",
      content: "Detaillierte Anleitung zur vollständigen Implementierung der EU MDR für Medizinprodukte der Klasse III mit praktischen Checklisten und Zeitplänen.",
      category: "regulatory_guidance",
      tags: ["MDR", "Klasse III", "EU", "Implementierung", "Compliance"],
      author: "Dr. Maria Schmidt",
      region: "EU",
      deviceClass: "Klasse III"
    },
    {
      id: "kb_2",
      title: "FDA 510(k) Einreichung: Schritt-für-Schritt Anleitung",
      content: "Komplette Anleitung für erfolgreiche FDA 510(k) Einreichungen mit häufigen Fehlern und deren Vermeidung.",
      category: "compliance_process",
      tags: ["FDA", "510(k)", "USA", "Einreichung", "Zulassung"],
      author: "Dr. Robert Johnson",
      region: "USA",
      deviceClass: "Klasse II"
    },
    {
      id: "kb_3",
      title: "Cybersecurity Framework für Connected Medical Devices",
      content: "Umfassender Leitfaden zur Implementierung von Cybersecurity-Maßnahmen für vernetzte Medizinprodukte nach FDA und EU-Anforderungen.",
      category: "cybersecurity",
      tags: ["Cybersecurity", "Connected Devices", "FDA", "EU", "IoT"],
      author: "Sarah Chen",
      region: "Global",
      deviceClass: "Alle Klassen"
    }
  ];

  // Text similarity calculation using simple keyword matching
  private calculateSimilarity(text1: string, text2: string): number {
    const words1 = text1.toLowerCase().split(/\s+/);
    const words2 = text2.toLowerCase().split(/\s+/);
    
    const intersection = words1.filter(word => words2.includes(word));
    const union = Array.from(new Set([...words1, ...words2]));
    
    return intersection.length / union.length;
  }

  // Enhanced keyword extraction and matching
  private extractKeywords(query: string): string[] {
    const keywords = query.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2)
      .filter(word => !['und', 'oder', 'der', 'die', 'das', 'ist', 'sind', 'für', 'mit', 'von', 'zu', 'auf', 'bei'].includes(word));
    
    return Array.from(new Set(keywords));
  }

  // Search through regulatory data sources
  private async searchRegulatoryData(query: string, filters: SearchFilters): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    const keywords = this.extractKeywords(query);
    
    // Sample regulatory data
    const regulatoryData = [
      {
        id: "reg_1",
        title: "EU MDR 2017/745 - Anforderungen für Klasse III Medizinprodukte",
        content: "Die Verordnung (EU) 2017/745 über Medizinprodukte legt spezifische Anforderungen für Klasse III Geräte fest, einschließlich klinischer Bewertung, technischer Dokumentation und Konformitätsbewertungsverfahren.",
        source: "EU MDR",
        region: "EU",
        deviceClass: "Klasse III",
        date: "2025-01-15"
      },
      {
        id: "reg_2", 
        title: "FDA Guidance: Cybersecurity in Medical Devices (2022)",
        content: "FDA-Leitfaden zur Cybersecurity für Medizinprodukte mit Anforderungen an Risikoanalyse, Sicherheitskontrollen und Post-Market-Überwachung für vernetzte Geräte.",
        source: "FDA",
        region: "USA",
        deviceClass: "Alle Klassen",
        date: "2024-12-20"
      },
      {
        id: "reg_3",
        title: "BfArM Stellungnahme zu KI-basierten Medizinprodukten",
        content: "Offizielle Stellungnahme des BfArM zu Anforderungen an KI-basierte Medizinprodukte, einschließlich Algorithm Lifecycle Management und Kontinuierliches Lernen.",
        source: "BfArM",
        region: "Deutschland",
        deviceClass: "Alle Klassen",
        date: "2025-01-10"
      }
    ];

    for (const item of regulatoryData) {
      const relevance = this.calculateSimilarity(query, item.title + " " + item.content);
      if (relevance > 0.1) {
        results.push({
          id: item.id,
          title: item.title,
          content: item.content,
          excerpt: item.content.substring(0, 200) + "...",
          type: 'regulatory',
          source: item.source,
          relevance,
          date: item.date,
          metadata: {
            region: item.region,
            deviceClass: item.deviceClass,
            tags: keywords
          }
        });
      }
    }

    return results;
  }

  // Search through legal cases
  private async searchLegalData(query: string, filters: SearchFilters): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    const keywords = this.extractKeywords(query);
    
    // Get legal cases from legal data service (using dynamic import)
    try {
      const { legalDataService } = await import('./legalDataService');
      // Simplified legal data search without external service dependency
      const mockLegalData = [
        {
          id: 'legal-001',
          title: 'Medical Device Regulation Case',
          summary: 'Important regulatory decision',
          jurisdiction: 'US',
          caseType: 'Federal',
          date: '2025-01-15',
          url: '#'
        }
      ];

      for (const legalCase of mockLegalData) {
        const relevance = this.calculateSimilarity(query, legalCase.title + " " + legalCase.summary);
        if (relevance > 0.1) {
          results.push({
            id: legalCase.id,
            title: legalCase.title,
            content: legalCase.summary,
            excerpt: legalCase.summary.substring(0, 200) + "...",
            type: 'legal',
            source: 'Legal Database',
            relevance,
            date: legalCase.date,
            url: legalCase.url,
            metadata: {
              region: legalCase.jurisdiction,
              category: legalCase.caseType,
              tags: keywords
            }
          });
        }
      }
    } catch (error) {
      console.error('Error loading legal data service:', error);
    }

    return results;
  }

  // Search through knowledge base
  private async searchKnowledgeBase(query: string, filters: SearchFilters): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    const keywords = this.extractKeywords(query);
    
    for (const item of this.knowledgeBase) {
      const relevance = this.calculateSimilarity(query, item.title + " " + item.content);
      if (relevance > 0.1) {
        results.push({
          id: item.id,
          title: item.title,
          content: item.content,
          excerpt: item.content.substring(0, 200) + "...",
          type: 'knowledge',
          source: "Helix Knowledge Base",
          relevance,
          date: "2025-01-20",
          metadata: {
            region: item.region,
            deviceClass: item.deviceClass,
            category: item.category,
            tags: item.tags
          }
        });
      }
    }

    return results;
  }

  // Search through historical data
  private async searchHistoricalData(query: string, filters: SearchFilters): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    const keywords = this.extractKeywords(query);
    
    // Get historical data from all sources
    const historicalSources = ['fda_guidance', 'ema_guidelines', 'bfarm_guidance', 'mhra_guidance', 'swissmedic_guidance'];
    
    try {
      const { historicalDataService } = await import('./historicalDataService');
      
      for (const sourceId of historicalSources) {
        try {
          const documents = await historicalDataService.getHistoricalData(sourceId);
        
        for (const doc of documents.slice(0, 5)) { // Limit for performance
          const relevance = this.calculateSimilarity(query, doc.title + " " + (doc.summary || ''));
          if (relevance > 0.1) {
            results.push({
              id: doc.id,
              title: doc.title,
              content: doc.summary || doc.title,
              excerpt: (doc.summary || doc.title).substring(0, 200) + "...",
              type: 'historical',
              source: sourceId.replace('_', ' ').toUpperCase(),
              relevance,
              date: doc.publishedDate,
              url: doc.documentUrl,
              metadata: {
                region: doc.region,
                category: doc.documentType,
                language: doc.language,
                tags: keywords
              }
            });
          }
        }
        } catch (error) {
          console.error(`Error searching historical data for ${sourceId}:`, error);
        }
      }
    } catch (error) {
      console.error('Error loading historical data service:', error);
    }

    return results;
  }

  // Generate intelligent answer based on search results
  private generateIntelligentAnswer(query: string, results: SearchResult[]): IntelligentAnswer {
    const topResults = results.slice(0, 5);
    const sources = Array.from(new Set(topResults.map(r => r.source)));
    
    // Simple answer generation based on query patterns
    let answer = "";
    let confidence = 75;
    let recommendations: string[] = [];
    let relatedTopics: string[] = [];

    if (query.toLowerCase().includes('mdr') && query.toLowerCase().includes('klasse iii')) {
      answer = "Für MDR-konforme Klasse III Medizinprodukte müssen folgende Hauptanforderungen erfüllt werden: 1) Vollständige technische Dokumentation nach Anhang II und III, 2) Konformitätsbewertung durch benannte Stelle, 3) Klinische Bewertung und ggf. klinische Prüfung, 4) Post-Market Clinical Follow-up (PMCF), 5) EUDAMED-Registrierung und UDI-System. Die Implementierung erfordert typischerweise 12-18 Monate Vorbereitung.";
      confidence = 90;
      recommendations = [
        "Starten Sie frühzeitig mit der Gap-Analyse Ihrer aktuellen Dokumentation",
        "Wählen Sie eine benannte Stelle für die Konformitätsbewertung aus",
        "Entwickeln Sie einen umfassenden PMCF-Plan",
        "Bereiten Sie die EUDAMED-Registrierung vor"
      ];
      relatedTopics = ["Benannte Stelle Auswahl", "PMCF Plan", "EUDAMED Registrierung", "Klinische Bewertung"];
    } 
    else if (query.toLowerCase().includes('fda') && query.toLowerCase().includes('510(k)')) {
      answer = "Der FDA 510(k) Einreichungsprozess erfordert den Nachweis der wesentlichen Äquivalenz zu einem bereits zugelassenen Prädikatsgerät. Wichtige Schritte: 1) Prädikatsgerät-Identifikation, 2) Vergleichsanalyse, 3) Performance-Tests, 4) Biokompatibilitätsprüfung (falls erforderlich), 5) Labeling-Review. Die Standardbearbeitungszeit beträgt 90 Tage.";
      confidence = 85;
      recommendations = [
        "Identifizieren Sie ein geeignetes Prädikatsgerät früh im Entwicklungsprozess",
        "Führen Sie ausreichende Performance-Tests durch",
        "Bereiten Sie eine detaillierte Vergleichsanalyse vor",
        "Stellen Sie sicher, dass alle Labeling-Anforderungen erfüllt sind"
      ];
      relatedTopics = ["Prädikatsgerät Suche", "Performance Testing", "510(k) Labeling", "FDA QSR"];
    }
    else if (query.toLowerCase().includes('cybersecurity')) {
      answer = "Cybersecurity für Medizinprodukte erfordert einen risikobasierten Ansatz mit folgenden Elementen: 1) Threat Modeling und Risikoanalyse, 2) Security Controls Implementation, 3) Software Bill of Materials (SBOM), 4) Vulnerability Management, 5) Incident Response Plan. Sowohl FDA als auch EU MDR haben spezifische Cybersecurity-Anforderungen.";
      confidence = 80;
      recommendations = [
        "Implementieren Sie Cybersecurity by Design",
        "Erstellen Sie ein Software Bill of Materials (SBOM)",
        "Entwickeln Sie einen Vulnerability Management Prozess",
        "Etablieren Sie einen Incident Response Plan"
      ];
      relatedTopics = ["SBOM", "Threat Modeling", "Vulnerability Management", "Security by Design"];
    }
    else {
      // Generic answer based on top results
      const topResult = topResults[0];
      if (topResult) {
        answer = `Based auf den verfügbaren Daten: ${topResult.content.substring(0, 300)}...`;
        confidence = Math.round(topResult.relevance * 100);
        recommendations = ["Überprüfen Sie die Quelldokumente für detaillierte Informationen"];
        relatedTopics = topResult.metadata.tags || [];
      } else {
        answer = "Keine spezifischen Informationen zu Ihrer Anfrage gefunden. Versuchen Sie, Ihre Suche zu präzisieren oder verwenden Sie andere Suchbegriffe.";
        confidence = 20;
      }
    }

    return {
      query,
      answer,
      confidence,
      sources,
      recommendations,
      relatedTopics,
      timestamp: new Date().toISOString()
    };
  }

  // Main search function
  async search(query: string, filters: SearchFilters = { type: "all", region: "all", timeframe: "all" }) {
    const allResults: SearchResult[] = [];

    try {
      // Search all data sources in parallel if type is "all"
      if (filters.type === "all" || filters.type === "regulatory") {
        const regulatoryResults = await this.searchRegulatoryData(query, filters);
        allResults.push(...regulatoryResults);
      }

      if (filters.type === "all" || filters.type === "legal") {
        const legalResults = await this.searchLegalData(query, filters);
        allResults.push(...legalResults);
      }

      if (filters.type === "all" || filters.type === "knowledge") {
        const knowledgeResults = await this.searchKnowledgeBase(query, filters);
        allResults.push(...knowledgeResults);
      }

      if (filters.type === "all" || filters.type === "historical") {
        const historicalResults = await this.searchHistoricalData(query, filters);
        allResults.push(...historicalResults);
      }

      // Sort by relevance
      allResults.sort((a, b) => b.relevance - a.relevance);

      // Generate intelligent answer
      const intelligentAnswer = this.generateIntelligentAnswer(query, allResults);

      return {
        results: allResults.slice(0, 20), // Limit to top 20 results
        answer: intelligentAnswer,
        totalResults: allResults.length
      };
    } catch (error) {
      console.error("Error in intelligent search:", error);
      throw new Error("Fehler bei der intelligenten Suche");
    }
  }
}

export const intelligentSearchService = new IntelligentSearchService();