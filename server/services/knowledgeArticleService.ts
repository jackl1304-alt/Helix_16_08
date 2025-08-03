import { storage } from '../storage';

interface KnowledgeSource {
  id: string;
  name: string;
  url: string;
  category: 'medtech_knowledge' | 'regulatory_updates' | 'legal_cases';
  authority: string;
  region: string;
  language: string;
  priority: 'high' | 'medium' | 'low';
  updateFrequency: number; // hours
  lastChecked?: string;
  status: 'active' | 'pending' | 'error';
}

interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  source: string;
  category: string;
  author?: string;
  publishedAt: string;
  url: string;
  tags: string[];
  summary: string;
  impact: 'high' | 'medium' | 'low';
  audience: string[];
}

export class KnowledgeArticleService {
  private sources: KnowledgeSource[] = [
    // Medical Technology Knowledge Sources
    {
      id: 'jama_medical_devices',
      name: 'JAMA Network - Medical Devices',
      url: 'https://jamanetwork.com/collections/5738/medical-devices-and-equipment',
      category: 'medtech_knowledge',
      authority: 'JAMA Network',
      region: 'Global',
      language: 'en',
      priority: 'high',
      updateFrequency: 24,
      status: 'active'
    },
    {
      id: 'pmc_medical_device_regulation',
      name: 'PMC - Medical Device Regulation',
      url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8968778/',
      category: 'medtech_knowledge',
      authority: 'PubMed Central',
      region: 'Global',
      language: 'en',
      priority: 'high',
      updateFrequency: 48,
      status: 'active'
    },
    {
      id: 'johner_institute',
      name: 'Johner Institute - Regulatory Knowledge',
      url: 'https://blog.johner-institute.com/',
      category: 'medtech_knowledge',
      authority: 'Johner Institute',
      region: 'Germany',
      language: 'de',
      priority: 'high',
      updateFrequency: 12,
      status: 'active'
    },
    {
      id: 'mtd_fachartikel',
      name: 'MTD - Medizintechnik Fachartikel',
      url: 'https://mtd.de/medizintechnik-fachartikel/',
      category: 'medtech_knowledge',
      authority: 'MTD',
      region: 'Germany',
      language: 'de',
      priority: 'medium',
      updateFrequency: 24,
      status: 'active'
    },
    {
      id: 'mt_medizintechnik',
      name: 'mt-medizintechnik News',
      url: 'https://mt-medizintechnik.de/',
      category: 'medtech_knowledge',
      authority: 'mt-medizintechnik',
      region: 'Germany',
      language: 'de',
      priority: 'medium',
      updateFrequency: 12,
      status: 'active'
    },
    {
      id: 'frontiers_medical_tech',
      name: 'Frontiers in Medical Technology',
      url: 'https://www.frontiersin.org/journals/medical-technology',
      category: 'medtech_knowledge',
      authority: 'Frontiers',
      region: 'Global',
      language: 'en',
      priority: 'high',
      updateFrequency: 24,
      status: 'active'
    },

    // Regulatory Updates Sources
    {
      id: 'regulatory_rapporteur',
      name: 'Regulatory Rapporteur - Standards Update',
      url: 'https://www.regulatoryrapporteur.org/medical-device-standards-update-may-2025/898.article',
      category: 'regulatory_updates',
      authority: 'Regulatory Rapporteur',
      region: 'Global',
      language: 'en',
      priority: 'high',
      updateFrequency: 6,
      status: 'active'
    },
    {
      id: 'mdr_regulator',
      name: 'MDR Regulator - EU Medical Market',
      url: 'https://mdrregulator.com/news',
      category: 'regulatory_updates',
      authority: 'MDR Regulator',
      region: 'European Union',
      language: 'en',
      priority: 'high',
      updateFrequency: 6,
      status: 'active'
    },
    {
      id: 'rephine_medtech',
      name: 'Rephine - MedTech EU Regulatory Updates',
      url: 'https://www.rephine.com/medical-devices/medtech-eu-regulatory-updates/',
      category: 'regulatory_updates',
      authority: 'Rephine',
      region: 'European Union',
      language: 'en',
      priority: 'high',
      updateFrequency: 12,
      status: 'active'
    },
    {
      id: 'emergo_regulatory',
      name: 'Emergo by UL - Regulatory Updates',
      url: 'https://www.emergobyul.com/news/regulatory-updates',
      category: 'regulatory_updates',
      authority: 'Emergo by UL',
      region: 'Global',
      language: 'en',
      priority: 'high',
      updateFrequency: 8,
      status: 'active'
    },
    {
      id: 'medicept_regulations',
      name: 'Medicept - FDA and EU Regulations 2025',
      url: 'https://www.medicept.com/top-5-upcoming-fda-and-eu-regulations-what-to-know-for-2025/',
      category: 'regulatory_updates',
      authority: 'Medicept',
      region: 'Global',
      language: 'en',
      priority: 'high',
      updateFrequency: 24,
      status: 'active'
    },

    // Legal Cases Sources
    {
      id: 'lsu_medical_devices_cases',
      name: 'LSU - Medical Devices Legal Cases',
      url: 'https://biotech.law.lsu.edu/cases/devices/index.htm',
      category: 'legal_cases',
      authority: 'Louisiana State University',
      region: 'United States',
      language: 'en',
      priority: 'high',
      updateFrequency: 48,
      status: 'active'
    },
    {
      id: 'rapoport_law_stryker',
      name: 'Rapoport Law - Bausch v. Stryker Corp',
      url: 'https://rapoportlaw.com/bausch-v-stryker-corp-a-major-victory-for-plaintiffs-in-medical-device-cases/',
      category: 'legal_cases',
      authority: 'Rapoport Law',
      region: 'United States',
      language: 'en',
      priority: 'medium',
      updateFrequency: 72,
      status: 'active'
    },
    {
      id: 'advamed_litigation',
      name: 'AdvaMed - Medical Device Industry Litigation',
      url: 'https://www.advamed.org/2022/05/31/litigation-in-the-medical-device-industry/',
      category: 'legal_cases',
      authority: 'AdvaMed',
      region: 'United States',
      language: 'en',
      priority: 'high',
      updateFrequency: 24,
      status: 'active'
    },
    {
      id: 'se_legal_medizinprodukte',
      name: 'SE Legal - Rechtsberatung Medizinprodukte',
      url: 'https://se-legal.de/branchenspezialisierte-rechtsanwalte/rechtsanwalt-fuer-gesundheitswesen-und-biowissenschaftliche-branche/rechtsberatung-fuer-unternehmen-der-medizinprodukte-und-der-medizintechnik-branche/',
      category: 'legal_cases',
      authority: 'SE Legal',
      region: 'Germany',
      language: 'de',
      priority: 'medium',
      updateFrequency: 48,
      status: 'active'
    },
    {
      id: 'motley_rice_devices',
      name: 'Motley Rice - Defective Medical Device Lawsuits',
      url: 'https://www.motleyrice.com/medical-devices',
      category: 'legal_cases',
      authority: 'Motley Rice',
      region: 'United States',
      language: 'en',
      priority: 'medium',
      updateFrequency: 48,
      status: 'active'
    }
  ];

  async collectKnowledgeArticles(): Promise<{ success: boolean; summary: any }> {
    try {
      console.log('[Knowledge Service] Starting comprehensive knowledge article collection...');
      
      const collectionResults = await Promise.allSettled(
        this.sources.map(source => this.processKnowledgeSource(source))
      );
      
      let totalArticles = 0;
      let successfulSources = 0;
      const categoryBreakdown: any = {};
      
      for (let i = 0; i < collectionResults.length; i++) {
        const result = collectionResults[i];
        const source = this.sources[i];
        
        if (result.status === 'fulfilled' && result.value.success) {
          successfulSources++;
          totalArticles += result.value.articlesCreated;
          
          if (!categoryBreakdown[source.category]) {
            categoryBreakdown[source.category] = 0;
          }
          categoryBreakdown[source.category] += result.value.articlesCreated;
        }
      }
      
      const summary = {
        totalSources: this.sources.length,
        successfulSources,
        totalArticles,
        categoryBreakdown,
        processedAt: new Date().toISOString()
      };
      
      console.log(`[Knowledge Service] Collection completed: ${totalArticles} articles from ${successfulSources}/${this.sources.length} sources`);
      
      return { success: successfulSources > 0, summary };
    } catch (error) {
      console.error('[Knowledge Service] Error during collection:', error);
      return { success: false, summary: { error: 'Collection failed' } };
    }
  }

  private async processKnowledgeSource(source: KnowledgeSource): Promise<{ success: boolean; articlesCreated: number }> {
    try {
      console.log(`[Knowledge Service] Processing source: ${source.name}`);
      
      // Generate simulated knowledge articles based on source type
      const articles = this.generateKnowledgeArticles(source);
      
      let articlesCreated = 0;
      
      for (const article of articles) {
        const regulatoryUpdate = this.transformToRegulatoryUpdate(article, source);
        
        // Check if article already exists
        const exists = await this.checkIfArticleExists(regulatoryUpdate);
        if (!exists) {
          await storage.createRegulatoryUpdate(regulatoryUpdate);
          articlesCreated++;
        }
      }
      
      // Update source status
      source.lastChecked = new Date().toISOString();
      source.status = 'active';
      
      return { success: true, articlesCreated };
    } catch (error: any) {
      console.error(`[Knowledge Service] Error processing ${source.name}:`, error);
      source.status = 'error';
      return { success: false, articlesCreated: 0 };
    }
  }

  private generateKnowledgeArticles(source: KnowledgeSource): KnowledgeArticle[] {
    const articles: KnowledgeArticle[] = [];
    // ALLE MOCK-DATEN ENTFERNT - Keine automatische Artikel-Generierung
    const count = 0;
    
    console.log(`[Knowledge Service] MOCK DATA DELETED - No artificial articles for ${source.name}`);
    
    // ALLE MOCK-ARTIKEL-GENERIERUNG KOMPLETT ENTFERNT
    console.log(`[Knowledge Service] No artificial articles generated for ${source.name}`);
    
    return articles;
  }

  private getArticleTemplates(category: string, language: string): any[] {
    const templates = {
      medtech_knowledge: {
        en: [
          {
            title: 'AI-Powered Medical Devices: Regulatory Challenges and Opportunities',
            content: 'The integration of artificial intelligence in medical devices presents unprecedented opportunities for improved patient care while introducing complex regulatory challenges. This comprehensive analysis explores current FDA guidance, EU MDR requirements, and emerging best practices for AI/ML-enabled medical devices.',
            author: 'Dr. Sarah Johnson, Regulatory Affairs Expert',
            summary: 'Analysis of AI in medical device regulation covering FDA guidance and EU MDR requirements.',
            tags: ['artificial-intelligence', 'regulation', 'fda', 'eu-mdr', 'medical-devices'],
            impact: 'high' as const,
            audience: ['regulatory-professionals', 'manufacturers', 'developers']
          },
          {
            title: 'Cybersecurity Framework for Connected Medical Devices',
            content: 'As medical devices become increasingly connected, cybersecurity has emerged as a critical consideration for manufacturers and healthcare providers. This article examines the latest cybersecurity requirements, best practices for secure device design, and post-market surveillance strategies.',
            author: 'Michael Chen, Cybersecurity Specialist',
            summary: 'Comprehensive guide to cybersecurity requirements for connected medical devices.',
            tags: ['cybersecurity', 'connected-devices', 'iot', 'security', 'risk-management'],
            impact: 'high' as const,
            audience: ['engineers', 'security-professionals', 'manufacturers']
          },
          {
            title: 'Digital Therapeutics: Bridging Healthcare and Technology',
            content: 'Digital therapeutics represent a new frontier in healthcare technology, offering evidence-based interventions delivered through software applications. This analysis covers regulatory pathways, clinical evidence requirements, and market access strategies.',
            author: 'Dr. Lisa Wang, Digital Health Expert',
            summary: 'Overview of digital therapeutics regulation and market access strategies.',
            tags: ['digital-therapeutics', 'software', 'clinical-evidence', 'market-access'],
            impact: 'medium' as const,
            audience: ['developers', 'clinicians', 'investors']
          }
        ],
        de: [
          {
            title: 'KI-gestützte Medizinprodukte: Regulatorische Herausforderungen in Deutschland',
            content: 'Die Integration künstlicher Intelligenz in Medizinprodukte eröffnet neue Möglichkeiten für die Patientenversorgung, bringt aber auch komplexe regulatorische Herausforderungen mit sich. Diese Analyse untersucht aktuelle BfArM-Leitlinien und EU-MDR-Anforderungen.',
            author: 'Dr. Klaus Müller, Regulatory Affairs Experte',
            summary: 'Analyse der KI-Regulierung in Medizinprodukten mit Fokus auf deutsche und EU-Bestimmungen.',
            tags: ['künstliche-intelligenz', 'regulierung', 'bfarm', 'eu-mdr', 'medizinprodukte'],
            impact: 'high' as const,
            audience: ['regulatory-professionals', 'hersteller', 'entwickler']
          },
          {
            title: 'Digitale Gesundheitsanwendungen (DiGA): Chancen und Herausforderungen',
            content: 'Digitale Gesundheitsanwendungen revolutionieren die Patientenversorgung in Deutschland. Dieser Artikel beleuchtet den DiGA-Zulassungsprozess, Erstattungsmodelle und praktische Implementierungsstrategien.',
            author: 'Prof. Dr. Anna Schmidt, Digitale Gesundheit',
            summary: 'Umfassender Leitfaden zu DiGA-Zulassung und Implementierung in Deutschland.',
            tags: ['diga', 'digitale-gesundheit', 'zulassung', 'erstattung', 'bfarm'],
            impact: 'high' as const,
            audience: ['entwickler', 'hersteller', 'krankenkassen']
          }
        ]
      },
      regulatory_updates: {
        en: [
          {
            title: 'FDA Releases Updated Guidance on Software as Medical Device (SaMD)',
            content: 'The FDA has published comprehensive updates to its Software as Medical Device guidance, addressing AI/ML algorithms, cybersecurity requirements, and quality management systems. Key changes include enhanced pre-market submission requirements and post-market surveillance obligations.',
            author: 'FDA Center for Devices and Radiological Health',
            summary: 'Latest FDA guidance updates for Software as Medical Device with focus on AI/ML and cybersecurity.',
            tags: ['fda', 'samd', 'software', 'ai-ml', 'guidance', 'cybersecurity'],
            impact: 'high' as const,
            audience: ['manufacturers', 'software-developers', 'regulatory-professionals']
          },
          {
            title: 'EU MDR: New Requirements for Clinical Evidence and Post-Market Surveillance',
            content: 'The European Commission has introduced additional requirements for clinical evidence generation and post-market surveillance under the Medical Device Regulation. These changes affect Class IIa, IIb, and III devices, with implementation deadlines approaching in 2025.',
            author: 'European Commission DG GROW',
            summary: 'Updated EU MDR requirements for clinical evidence and post-market surveillance.',
            tags: ['eu-mdr', 'clinical-evidence', 'post-market-surveillance', 'class-ii', 'class-iii'],
            impact: 'high' as const,
            audience: ['manufacturers', 'notified-bodies', 'clinical-researchers']
          }
        ],
        de: [
          {
            title: 'BfArM veröffentlicht neue Leitlinien für KI-basierte Medizinprodukte',
            content: 'Das Bundesinstitut für Arzneimittel und Medizinprodukte hat aktualisierte Leitlinien für die Zulassung KI-basierter Medizinprodukte veröffentlicht. Die neuen Anforderungen betreffen Algorithmus-Validierung, Datenqualität und kontinuierliches Lernen.',
            author: 'BfArM Medizinprodukte-Abteilung',
            summary: 'Neue BfArM-Leitlinien für KI-basierte Medizinprodukte mit Fokus auf Validierung und Datenqualität.',
            tags: ['bfarm', 'ki-medizinprodukte', 'leitlinien', 'validierung', 'datenqualität'],
            impact: 'high' as const,
            audience: ['hersteller', 'entwickler', 'regulatory-professionals']
          }
        ]
      },
      legal_cases: {
        en: [
          {
            title: 'Landmark Ruling: Johnson & Johnson Hip Implant Settlement Reaches $2.5 Billion',
            content: 'A federal court has approved a $2.5 billion settlement in the multidistrict litigation involving Johnson & Johnson hip implants. The case sets important precedents for design defect claims and the scope of manufacturer liability for medical devices.',
            author: 'Medical Device Legal Reporter',
            summary: 'Major settlement in J&J hip implant litigation with significant precedents for device liability.',
            tags: ['johnson-johnson', 'hip-implant', 'settlement', 'design-defect', 'liability'],
            impact: 'high' as const,
            audience: ['legal-professionals', 'manufacturers', 'patients']
          },
          {
            title: 'FDA Preemption Defense Rejected in Pacemaker Malfunction Case',
            content: 'The Third Circuit Court of Appeals rejected a manufacturer\'s FDA preemption defense in a case involving pacemaker malfunctions, ruling that state law claims for inadequate warnings can proceed despite FDA approval.',
            author: 'Circuit Court Legal Analysis',
            summary: 'Third Circuit ruling on FDA preemption in pacemaker malfunction case.',
            tags: ['fda-preemption', 'pacemaker', 'malfunction', 'state-law', 'warnings'],
            impact: 'medium' as const,
            audience: ['legal-professionals', 'manufacturers', 'regulatory-professionals']
          }
        ],
        de: [
          {
            title: 'BGH-Urteil: Haftung bei fehlerhaften Herzschrittmachern verschärft',
            content: 'Der Bundesgerichtshof hat die Haftungsregeln für fehlerhafte Medizinprodukte verschärft. Das Urteil betrifft einen Fall defekter Herzschrittmacher und stellt höhere Anforderungen an die Risikoaufklärung und Produktüberwachung.',
            author: 'BGH Medizinrecht-Senat',
            summary: 'BGH-Urteil verschärft Haftung bei fehlerhaften Medizinprodukten am Beispiel von Herzschrittmachern.',
            tags: ['bgh', 'haftung', 'herzschrittmacher', 'produktfehler', 'risikoaufklärung'],
            impact: 'high' as const,
            audience: ['juristen', 'hersteller', 'ärzte']
          }
        ]
      }
    };
    
    const categoryTemplates = templates[category as keyof typeof templates];
    return categoryTemplates?.[language as keyof typeof categoryTemplates] || categoryTemplates?.['en'] || [];
  }

  private transformToRegulatoryUpdate(article: KnowledgeArticle, source: KnowledgeSource): any {
    return {
      id: `knowledge-${article.id}`,
      title: article.title,
      content: article.content,
      authority: source.authority,
      region: source.region,
      category: source.category,
      type: 'knowledge_article',
      published_at: article.publishedAt,
      priority: this.determinePriority(article),
      tags: this.enhanceTags(article.tags, source),
      url: article.url,
      document_type: 'knowledge_article',
      language: source.language,
      source: `Knowledge: ${source.name}`,
      summary: article.summary,
      impact_level: article.impact,
      target_audience: article.audience
    };
  }

  private determinePriority(article: KnowledgeArticle): 'low' | 'medium' | 'high' | 'critical' {
    if (article.impact === 'high') return 'high';
    if (article.impact === 'medium') return 'medium';
    return 'low';
  }

  private enhanceTags(baseTags: string[], source: KnowledgeSource): string[] {
    const enhancedTags = [...baseTags];
    
    enhancedTags.push('knowledge_article');
    enhancedTags.push(source.category);
    enhancedTags.push(source.authority.toLowerCase().replace(/\s+/g, '-'));
    
    if (source.region) {
      enhancedTags.push(source.region.toLowerCase().replace(/\s+/g, '-'));
    }
    
    return enhancedTags;
  }

  private async checkIfArticleExists(article: any): Promise<boolean> {
    try {
      const allUpdates = await storage.getAllRegulatoryUpdates();
      return allUpdates.some(existing => 
        existing.url === article.url || 
        (existing.title === article.title && existing.authority === article.authority)
      );
    } catch (error) {
      console.error('[Knowledge Service] Error checking for existing article:', error);
      return false;
    }
  }

  async getSourcesStatus(): Promise<KnowledgeSource[]> {
    return this.sources.map(source => ({
      ...source,
      lastChecked: source.lastChecked || 'Never'
    }));
  }

  async syncSpecificSource(sourceId: string): Promise<{ success: boolean; articlesCreated: number }> {
    const source = this.sources.find(s => s.id === sourceId);
    if (!source) {
      throw new Error(`Source not found: ${sourceId}`);
    }
    
    return this.processKnowledgeSource(source);
  }
}