import { Logger } from './logger.service';
import { storage } from '../storage';

interface NewsletterSource {
  id: string;
  name: string;
  url: string;
  category: 'industry_newsletter' | 'regulatory_newsletter';
  authority: string;
  region: string;
  language: string;
  priority: 'high' | 'medium' | 'low';
  extractorType: 'newsletter' | 'industry_news';
  rssUrl?: string;
  apiEndpoint?: string;
}

interface NewsletterArticle {
  title: string;
  content: string;
  summary: string;
  url: string;
  publishedAt: Date;
  category: string;
  tags: string[];
  authority: string;
  region: string;
  language: string;
  newsletterSource: string;
}

/**
 * Newsletter Extraction Service für MedTech-Informationsquellen
 * Sammelt Newsletter-Inhalte von Branchenverbänden und Informationsanbietern
 */
export class NewsletterExtractionService {
  private logger = new Logger('NewsletterExtractionService');

  private newsletterSources: NewsletterSource[] = [
    // Deutsche MedTech Newsletter
    {
      id: 'bvmed_newsletter',
      name: 'BVMed - Bundesverband Medizintechnologie',
      url: 'https://www.bvmed.de/de/aktuelles/pressemitteilungen',
      category: 'industry_newsletter',
      authority: 'BVMed',
      region: 'Germany',
      language: 'de',
      priority: 'high',
      extractorType: 'newsletter',
      rssUrl: 'https://www.bvmed.de/de/service/newsletter'
    },
    {
      id: 'spectaris_medtech',
      name: 'SPECTARIS - MedTech News Deutschland',
      url: 'https://www.spectaris.de/presse-medien/pressemitteilungen/',
      category: 'industry_newsletter', 
      authority: 'SPECTARIS',
      region: 'Germany',
      language: 'de',
      priority: 'medium',
      extractorType: 'newsletter'
    },
    {
      id: 'medica_magazine',
      name: 'MEDICA Magazine Newsletter',
      url: 'https://www.medica.de/de/News',
      category: 'industry_newsletter',
      authority: 'MEDICA',
      region: 'Germany',
      language: 'de',
      priority: 'high',
      extractorType: 'newsletter'
    },
    {
      id: 'mt_medizintechnik',
      name: 'mt-medizintechnik Newsletter',
      url: 'https://mt-medizintechnik.de/news/',
      category: 'industry_newsletter',
      authority: 'mt-medizintechnik',
      region: 'Germany',
      language: 'de',
      priority: 'medium',
      extractorType: 'newsletter'
    },
    
    // Internationale MedTech Newsletter
    {
      id: 'medtech_dive',
      name: 'MedTech Dive - Industry Newsletter',
      url: 'https://www.medtechdive.com/',
      category: 'industry_newsletter',
      authority: 'Industry Dive',
      region: 'Global',
      language: 'en',
      priority: 'high',
      extractorType: 'newsletter',
      rssUrl: 'https://www.medtechdive.com/feeds/'
    },
    {
      id: 'medtech_breakthrough',
      name: 'MedTech Breakthrough News',
      url: 'https://medtechbreakthrough.com/news/',
      category: 'industry_newsletter',
      authority: 'MedTech Breakthrough',
      region: 'Global',
      language: 'en',
      priority: 'high',
      extractorType: 'industry_news'
    },
    {
      id: 'meddevice_online',
      name: 'Medical Device and Diagnostic Industry',
      url: 'https://www.mddionline.com/',
      category: 'industry_newsletter',
      authority: 'MDDI',
      region: 'Global',
      language: 'en',
      priority: 'high',
      extractorType: 'industry_news'
    },
    {
      id: 'medtech_europe',
      name: 'MedTech Europe Newsletter',
      url: 'https://www.medtecheurope.org/news-and-events/news/',
      category: 'industry_newsletter',
      authority: 'MedTech Europe',
      region: 'European Union',
      language: 'en',
      priority: 'high',
      extractorType: 'newsletter'
    },
    
    // Regulatory Newsletter
    {
      id: 'emergo_newsletter',
      name: 'Emergo by UL Newsletter',
      url: 'https://www.emergobyul.com/newsletter',
      category: 'regulatory_newsletter',
      authority: 'Emergo by UL',
      region: 'Global',
      language: 'en',
      priority: 'high',
      extractorType: 'newsletter'
    },
    {
      id: 'rephine_newsletter',
      name: 'Rephine Regulatory Newsletter',
      url: 'https://www.rephine.com/newsletter/',
      category: 'regulatory_newsletter',
      authority: 'Rephine',
      region: 'European Union',
      language: 'en',
      priority: 'high',
      extractorType: 'newsletter'
    }
  ];

  /**
   * NEWSLETTER EXTRACTION KOMPLETT DEAKTIVIERT
   * Keine Demo-Daten mehr - nur echte Newsletter-APIs
   */
  async extractFromAllNewsletterSources(): Promise<{
    processedSources: number;
    articlesExtracted: number;
    errors: string[];
  }> {
    this.logger.info('NEWSLETTER EXTRACTION DEAKTIVIERT - Keine Demo-Artikel mehr');

    return {
      processedSources: 0,
      articlesExtracted: 0,
      errors: ['Newsletter extraction disabled - waiting for authentic RSS/API access']
    };
  }

  /**
   * Extrahiert Newsletter-Artikel von einer spezifischen Quelle
   * **PRODUCTION MODE**: Keine Demo-Daten mehr, nur echte RSS/API-Anbindung
   */
  private async extractNewsletterArticles(source: NewsletterSource): Promise<NewsletterArticle[]> {
    this.logger.warn(`DEAKTIVIERT: ${source.name} - Keine Demo-Newsletter, nur echte RSS-Feeds`);

    // **PRODUCTION MODE**: NO DEMO ARTICLES
    return [];
    
    // Deutsche Quellen
    if (source.language === 'de') {
      demoArticles.push({
        title: `${source.authority} Newsletter Update: Neue MDR-Anforderungen für 2025`,
        content: `Aktuelle Entwicklungen in der Medizintechnik-Regulierung: ${source.authority} berichtet über neue MDR-Anforderungen, die 2025 in Kraft treten. Die wichtigsten Änderungen betreffen Klassifizierung von KI-gestützten Medizinprodukten, erweiterte Cybersecurity-Anforderungen und neue Post-Market-Surveillance-Verpflichtungen.`,
        summary: `${source.authority} Newsletter über neue MDR-Anforderungen 2025`,
        url: `${source.url}#newsletter-${Date.now()}`,
        publishedAt: new Date(),
        category: source.category,
        tags: ['Newsletter', 'MDR', 'Regulierung', '2025', source.authority],
        authority: source.authority,
        region: source.region,
        language: source.language,
        newsletterSource: source.name
      });

      demoArticles.push({
        title: `${source.authority} Branchen-Update: Digitalisierung in der MedTech`,
        content: `Newsletter-Beitrag zur fortschreitenden Digitalisierung in der Medizintechnik-Branche. ${source.authority} analysiert aktuelle Trends bei vernetzten Medizinprodukten, KI-Integration und Digital Health Lösungen. Besonderer Fokus auf Cybersecurity und Datenschutz-Compliance.`,
        summary: `${source.authority} über Digitalisierung und Digital Health Trends`,
        url: `${source.url}#newsletter-digital-${Date.now()}`,
        publishedAt: new Date(Date.now() - 86400000), // Gestern
        category: source.category,
        tags: ['Newsletter', 'Digitalisierung', 'Digital Health', 'KI', source.authority],
        authority: source.authority,
        region: source.region,
        language: source.language,
        newsletterSource: source.name
      });
    } else {
      // Englische Quellen
      demoArticles.push({
        title: `${source.authority} Newsletter: Global MedTech Market Trends Q4 2024`,
        content: `Latest newsletter from ${source.authority} covering global medical technology market trends for Q4 2024. Key topics include regulatory harmonization efforts, emerging market expansion, and breakthrough technologies in diagnostics and therapeutics. Special focus on AI/ML integration and personalized medicine advancements.`,
        summary: `${source.authority} newsletter on global MedTech market trends`,
        url: `${source.url}#newsletter-q4-${Date.now()}`,
        publishedAt: new Date(),
        category: source.category,
        tags: ['Newsletter', 'Market Trends', 'Global', 'Q4 2024', source.authority],
        authority: source.authority,
        region: source.region,
        language: source.language,
        newsletterSource: source.name
      });

      demoArticles.push({
        title: `${source.authority} Industry Update: Regulatory Changes and Compliance`,
        content: `Newsletter update from ${source.authority} on recent regulatory changes affecting the medical device industry. Coverage includes FDA guidance updates, EU MDR implementation progress, and emerging cybersecurity requirements. Expert insights on compliance strategies and best practices.`,
        summary: `${source.authority} on regulatory changes and compliance strategies`,
        url: `${source.url}#newsletter-regulatory-${Date.now()}`,
        publishedAt: new Date(Date.now() - 172800000), // 2 Tage her
        category: source.category,
        tags: ['Newsletter', 'Regulatory', 'Compliance', 'FDA', 'EU MDR', source.authority],
        authority: source.authority,
        region: source.region,
        language: source.language,
        newsletterSource: source.name
      });
    }

    return demoArticles;
  }

  /**
   * Speichert Newsletter-Artikel in der Knowledge Base
   */
  private async saveNewsletterToKnowledgeBase(article: NewsletterArticle, source: NewsletterSource): Promise<void> {
    try {
      const knowledgeArticle = {
        title: article.title,
        content: article.content,
        category: article.category,
        tags: JSON.stringify(article.tags),
        source: article.newsletterSource,
        authority: article.authority,
        region: article.region,
        priority: source.priority,
        language: article.language,
        summary: article.summary,
        published_at: article.publishedAt,
        is_published: true
      };

      // Prüfe auf Duplikate
      const existingArticles = await storage.getAllKnowledgeArticles();
      const isDuplicate = existingArticles.some(existing => 
        existing.title === article.title && 
        existing.authority === article.authority
      );

      if (!isDuplicate) {
        await storage.createKnowledgeArticle(knowledgeArticle);
        this.logger.info(`Saved newsletter article: ${article.title}`, {
          source: source.name,
          authority: article.authority,
          category: article.category
        });
      } else {
        this.logger.info(`Skipped duplicate newsletter article: ${article.title}`);
      }

    } catch (error: any) {
      this.logger.error(`Failed to save newsletter article: ${article.title}`, error);
      throw error;
    }
  }

  /**
   * Ruft Status aller Newsletter-Quellen ab
   */
  async getNewsletterSourcesStatus() {
    return {
      totalSources: this.newsletterSources.length,
      sourcesByCategory: {
        industry_newsletter: this.newsletterSources.filter(s => s.category === 'industry_newsletter').length,
        regulatory_newsletter: this.newsletterSources.filter(s => s.category === 'regulatory_newsletter').length
      },
      sourcesByRegion: {
        Germany: this.newsletterSources.filter(s => s.region === 'Germany').length,
        'European Union': this.newsletterSources.filter(s => s.region === 'European Union').length,
        Global: this.newsletterSources.filter(s => s.region === 'Global').length
      },
      sourcesByLanguage: {
        de: this.newsletterSources.filter(s => s.language === 'de').length,
        en: this.newsletterSources.filter(s => s.language === 'en').length
      },
      highPrioritySources: this.newsletterSources.filter(s => s.priority === 'high').length
    };
  }

  /**
   * Delay Hilfsfunktion
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}