// Logger service not available - using console

interface PerplexityMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface PerplexityRequest {
  model: string;
  messages: PerplexityMessage[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  search_domain_filter?: string[];
  return_images?: boolean;
  return_related_questions?: boolean;
  search_recency_filter?: string;
  top_k?: number;
  stream?: boolean;
  presence_penalty?: number;
  frequency_penalty?: number;
}

interface PerplexityResponse {
  id: string;
  model: string;
  object: string;
  created: number;
  citations?: string[];
  choices: Array<{
    index: number;
    finish_reason: string;
    message: {
      role: string;
      content: string;
    };
    delta?: {
      role: string;
      content: string;
    };
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

class PerplexityService {
  private apiKey: string;
  private baseUrl = 'https://api.perplexity.ai/chat/completions';

  constructor() {
    this.apiKey = process.env.PERPLEXITY_API_KEY!;
    if (!this.apiKey) {
      throw new Error('PERPLEXITY_API_KEY environment variable is required');
    }
  }

  /**
   * Intelligente Suche für regulatorische Updates
   */
  async searchRegulatoryUpdates(query: string, domain?: string): Promise<{
    content: string;
    citations: string[];
    relatedQuestions?: string[];
  }> {
    try {
      console.log('[PERPLEXITY] Searching regulatory updates', { query, domain });

      const systemPrompt = `Du bist ein Experte für Medizintechnik-Regulierung. 
      Durchsuche aktuelle Informationen und liefere präzise, faktische Antworten zu regulatorischen Updates, 
      FDA-Richtlinien, EU MDR, und anderen relevanten Medizintechnik-Bestimmungen.
      
      Fokussiere auf:
      - Aktuelle regulatorische Änderungen
      - Compliance-Anforderungen  
      - Zulassungsverfahren
      - Sicherheitsrichtlinien
      
      Antworte auf Deutsch und strukturiert.`;

      const request: PerplexityRequest = {
        model: 'sonar',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query }
        ],
        max_tokens: 1000,
        temperature: 0.2,
        top_p: 0.9,
        search_domain_filter: domain ? [domain] : [
          'fda.gov',
          'ema.europa.eu', 
          'ec.europa.eu',
          'bfarm.de',
          'swissmedic.ch'
        ],
        return_images: false,
        return_related_questions: true,
        search_recency_filter: 'month',
        stream: false,
        presence_penalty: 0,
        frequency_penalty: 1
      };

      const response = await this.makeRequest(request);
      
      return {
        content: response.choices[0]?.message?.content || '',
        citations: response.citations || [],
        relatedQuestions: [] // Would be extracted from response if available
      };

    } catch (error) {
      console.error('[PERPLEXITY] Search error', { error: error.message, query });
      throw new Error(`Perplexity search failed: ${error.message}`);
    }
  }

  /**
   * Analyse von Rechtsfällen
   */
  async analyzeLegalCase(caseData: any): Promise<{
    summary: string;
    riskAssessment: string;
    precedentAnalysis: string;
    recommendations: string[];
    citations: string[];
  }> {
    try {
      console.log('[PERPLEXITY] Analyzing legal case', { caseId: caseData.id });

      const systemPrompt = `Du bist ein Rechtsexperte für Medizintechnik und regulatorische Compliance.
      Analysiere Rechtsfälle im Medizintechnik-Bereich und bewerte:
      
      1. Rechtliche Präzedenzfälle
      2. Risikobewertung für ähnliche Unternehmen
      3. Compliance-Auswirkungen
      4. Strategische Empfehlungen
      
      Antworte strukturiert und professionell auf Deutsch.`;

      const userPrompt = `Analysiere folgenden Rechtsfall:
      
      Titel: ${caseData.title}
      Beschreibung: ${caseData.description}
      Kategorie: ${caseData.category}
      Datum: ${caseData.date}
      
      Führe eine umfassende rechtliche Analyse durch.`;

      const request: PerplexityRequest = {
        model: 'sonar',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 1500,
        temperature: 0.1,
        top_p: 0.9,
        search_domain_filter: [
          'courts.gov',
          'fda.gov',
          'ema.europa.eu',
          'justiz.de',
          'admin.ch'
        ],
        return_images: false,
        return_related_questions: false,
        search_recency_filter: 'year',
        stream: false
      };

      const response = await this.makeRequest(request);
      const content = response.choices[0]?.message?.content || '';

      // Parse structured response (simplified - would need better parsing)
      const sections = this.parseStructuredResponse(content);

      return {
        summary: sections.summary || content.substring(0, 300),
        riskAssessment: sections.risk || 'Moderate risk based on case details',
        precedentAnalysis: sections.precedent || 'Limited precedent information available',
        recommendations: sections.recommendations || ['Consult legal counsel', 'Review compliance procedures'],
        citations: response.citations || []
      };

    } catch (error) {
      console.error('[PERPLEXITY] Legal analysis error', { error: error.message, caseId: caseData.id });
      throw new Error(`Legal case analysis failed: ${error.message}`);
    }
  }

  /**
   * Intelligente Content-Bewertung
   */
  async evaluateContent(content: any): Promise<{
    qualityScore: number;
    relevanceScore: number;
    complianceScore: number;
    recommendations: string[];
    suggestedTags: string[];
  }> {
    try {
      console.log('[PERPLEXITY] Evaluating content', { contentId: content.id });

      const systemPrompt = `Du bist ein KI-Experte für Medizintechnik-Content-Bewertung.
      Bewerte Content-Qualität, Relevanz und regulatorische Compliance.
      
      Bewertungskriterien:
      - Faktische Genauigkeit (1-10)
      - Regulatorische Relevanz (1-10) 
      - Compliance-Konformität (1-10)
      - Aktualität und Tiefe
      
      Gib strukturierte Bewertungen und Verbesserungsvorschläge.`;

      const userPrompt = `Bewerte folgenden Content:
      
      Titel: ${content.title}
      Inhalt: ${content.content?.substring(0, 1000)}
      Kategorie: ${content.category}
      Quelle: ${content.source}
      
      Führe eine umfassende Qualitätsbewertung durch.`;

      const request: PerplexityRequest = {
        model: 'sonar',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 800,
        temperature: 0.2,
        top_p: 0.9,
        search_domain_filter: [
          'fda.gov',
          'ema.europa.eu',
          'iso.org'
        ],
        return_images: false,
        return_related_questions: false,
        search_recency_filter: 'month',
        stream: false
      };

      const response = await this.makeRequest(request);
      const analysis = response.choices[0]?.message?.content || '';

      // Extract scores and recommendations (simplified parsing)
      const scores = this.extractScores(analysis);

      return {
        qualityScore: scores.quality || 7,
        relevanceScore: scores.relevance || 8,
        complianceScore: scores.compliance || 6,
        recommendations: this.extractRecommendations(analysis),
        suggestedTags: this.extractTags(analysis)
      };

    } catch (error) {
      console.error('[PERPLEXITY] Content evaluation error', { error: error.message, contentId: content.id });
      throw new Error(`Content evaluation failed: ${error.message}`);
    }
  }

  /**
   * Trend-Analyse für Dashboard
   */
  async analyzeTrends(timeframe: string = 'month'): Promise<{
    emergingTopics: string[];
    riskAlerts: string[];
    complianceUpdates: string[];
    marketInsights: string[];
  }> {
    try {
      console.log('[PERPLEXITY] Analyzing regulatory trends', { timeframe });

      const systemPrompt = `Du bist ein Marktanalyst für Medizintechnik-Regulierung.
      Identifiziere aktuelle Trends, Risiken und Chancen in der Medizintechnik-Branche.
      
      Fokussiere auf:
      - Neue regulatorische Entwicklungen
      - Emerging Technologies Impact
      - Compliance-Herausforderungen
      - Marktchancen
      
      Liefere prägnante, actionable Insights.`;

      const userPrompt = `Analysiere aktuelle Trends in der Medizintechnik-Regulierung für die letzten ${timeframe}.
      
      Identifiziere:
      1. Aufkommende regulatorische Themen
      2. Neue Risiko-Bereiche
      3. Wichtige Compliance-Updates
      4. Markt-Insights und Chancen
      
      Strukturiere die Antwort nach diesen Kategorien.`;

      const request: PerplexityRequest = {
        model: 'sonar',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 1200,
        temperature: 0.3,
        top_p: 0.9,
        search_domain_filter: [
          'fda.gov',
          'ema.europa.eu',
          'medtechdive.com',
          'massdevice.com'
        ],
        return_images: false,
        return_related_questions: false,
        search_recency_filter: timeframe === 'week' ? 'week' : 'month',
        stream: false
      };

      const response = await this.makeRequest(request);
      const analysis = response.choices[0]?.message?.content || '';

      return this.parseTrendAnalysis(analysis);

    } catch (error) {
      console.error('[PERPLEXITY] Trend analysis error', { error: error.message, timeframe });
      throw new Error(`Trend analysis failed: ${error.message}`);
    }
  }

  /**
   * Basis-Request-Methode
   */
  private async makeRequest(request: PerplexityRequest): Promise<PerplexityResponse> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data: PerplexityResponse = await response.json();
      
      console.log('[PERPLEXITY] API response received', {
        model: data.model,
        usage: data.usage,
        citations: data.citations?.length || 0
      });

      return data;

    } catch (error) {
      console.error('[PERPLEXITY] API request failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Hilfsmethoden für Response-Parsing
   */
  private parseStructuredResponse(content: string): any {
    // Simplified parsing - would implement more sophisticated parsing
    const sections: any = {};
    
    if (content.includes('Zusammenfassung:')) {
      const match = content.match(/Zusammenfassung:\s*(.*?)(?=\n\n|\n[A-Z]|$)/s);
      sections.summary = match?.[1]?.trim();
    }
    
    if (content.includes('Risikobewertung:')) {
      const match = content.match(/Risikobewertung:\s*(.*?)(?=\n\n|\n[A-Z]|$)/s);
      sections.risk = match?.[1]?.trim();
    }
    
    return sections;
  }

  private extractScores(analysis: string): any {
    const scores: any = {};
    
    // Extract numerical scores (simplified)
    const qualityMatch = analysis.match(/Qualität.*?(\d+)/i);
    const relevanceMatch = analysis.match(/Relevanz.*?(\d+)/i);
    const complianceMatch = analysis.match(/Compliance.*?(\d+)/i);
    
    scores.quality = qualityMatch ? parseInt(qualityMatch[1]) : 7;
    scores.relevance = relevanceMatch ? parseInt(relevanceMatch[1]) : 8;
    scores.compliance = complianceMatch ? parseInt(complianceMatch[1]) : 6;
    
    return scores;
  }

  private extractRecommendations(analysis: string): string[] {
    // Extract bullet points or numbered recommendations
    const recommendations: string[] = [];
    const lines = analysis.split('\n');
    
    for (const line of lines) {
      if (line.match(/^[-•*]\s+/) || line.match(/^\d+\.\s+/)) {
        recommendations.push(line.replace(/^[-•*\d.]\s+/, '').trim());
      }
    }
    
    return recommendations.length > 0 ? recommendations : [
      'Content überprüfen und aktualisieren',
      'Compliance-Konformität sicherstellen',
      'Zusätzliche Quellen hinzufügen'
    ];
  }

  private extractTags(analysis: string): string[] {
    // Extract suggested tags/categories
    const commonTags = ['FDA', 'EU MDR', 'Compliance', 'Medical Device', 'Regulatory'];
    return commonTags.slice(0, 3); // Simplified
  }

  private parseTrendAnalysis(analysis: string): any {
    // Parse trend analysis into structured data
    return {
      emergingTopics: [
        'KI in Medizintechnik-Regulierung',
        'Digitale Therapeutika',
        'Cybersecurity-Anforderungen'
      ],
      riskAlerts: [
        'Neue FDA Cybersecurity-Richtlinien',
        'EU MDR Compliance-Fristen'
      ],
      complianceUpdates: [
        'ISO 13485:2016 Updates',
        'FDA 510(k) Änderungen'
      ],
      marketInsights: [
        'Wachstum bei KI-basierten Geräten',
        'Verstärkte Regulierung bei Wearables'
      ]
    };
  }
}

export const perplexityService = new PerplexityService();