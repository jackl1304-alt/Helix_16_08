import axios from 'axios';
import * as cheerio from 'cheerio';
import { Logger } from './logger.service.js';

// Initialize logger instance
const logger = new Logger('RegulatoryDataScraper');

interface RegulatorySource {
  id: string;
  name: string;
  url: string;
  description: string;
  requiresAuth: boolean;
  category: 'regulatory_database' | 'market_analysis' | 'compliance' | 'standards';
  region: string;
  status: 'active' | 'configured';
  credentials?: {
    email?: string;
    password?: string;
    apiKey?: string;
  };
}

interface ScrapedRegulatoryData {
  source_name: string;
  title: string;
  url: string;
  content: string;
  category: string;
  region: string;
  publication_date: string;
  regulation_type?: string;
  device_class?: string;
  keywords: string[];
  scrape_timestamp: string;
}

export class RegulatoryDataScraper {
  private sources: RegulatorySource[] = [
    {
      id: 'fda_medical_device_db',
      name: 'FDA Medical Device Databases',
      url: 'https://www.fda.gov/medical-devices/device-advice-comprehensive-regulatory-assistance/medical-device-databases',
      description: 'Umfassende FDA-Datenbanken für medizinische Geräte',
      requiresAuth: false,
      category: 'regulatory_database',
      region: 'US',
      status: 'active'
    },
    {
      id: 'who_global_atlas',
      name: 'WHO Global Atlas of Medical Devices',
      url: 'https://www.who.int/teams/health-product-policy-and-standards/assistive-and-medical-technology/medical-devices/global-atlas-of-medical-devices',
      description: 'Globale WHO-Daten zur Verfügbarkeit von Gesundheitstechnologiepolitiken',
      requiresAuth: false,
      category: 'standards',
      region: 'Global',
      status: 'active'
    },
    {
      id: 'medtech_europe_convergence', 
      name: 'MedTech Europe Regulatory Convergence',
      url: 'https://www.medtecheurope.org/international/international-regulatory-convergence/',
      description: 'Regulatorische Konvergenz und MDR/IVDR-Auswirkungen',
      requiresAuth: false,
      category: 'compliance',
      region: 'EU',
      status: 'active'
    },
    {
      id: 'ncbi_global_framework',
      name: 'NCBI Global Regulation Framework',
      url: 'https://www.ncbi.nlm.nih.gov/books/NBK209785/',
      description: 'Globaler Rahmen für die Regulierung von Medizinprodukten',
      requiresAuth: false,
      category: 'standards',
      region: 'Global', 
      status: 'active'
    },
    {
      id: 'iqvia_compliance_blog',
      name: 'IQVIA MedTech Compliance Blog',
      url: 'https://www.iqvia.com/blogs/2025/05/the-future-of-medtech-compliance',
      description: 'Future of MedTech Compliance - Regulatory Intelligence Insights',
      requiresAuth: false,
      category: 'market_analysis',
      region: 'Global',
      status: 'active'
    },
    // Premium sources (configured but require credentials)
    {
      id: 'medboard_regulatory',
      name: 'MedBoard Regulatory Intelligence',
      url: 'https://www.medboard.com/regulatory/',
      description: 'Regulatory Intelligence und Research in über 225 Ländern',
      requiresAuth: true,
      category: 'regulatory_database',
      region: 'Global',
      status: 'configured',
      credentials: { email: 'helix@medtech-intelligence.com' }
    },
    {
      id: 'clarivate_medtech',
      name: 'Clarivate Medtech Regulatory Intelligence',
      url: 'https://clarivate.com/life-sciences-healthcare/medtech/medtech-regulatory-intelligence/',
      description: 'Medtech-Regulierungsdaten aus 75 Ländern, 79.000+ Quelldokumente',
      requiresAuth: true,
      category: 'regulatory_database',
      region: 'Global',
      status: 'configured',
      credentials: { email: 'helix@medtech-intelligence.com' }
    },
    {
      id: 'iqvia_regulatory_intelligence',
      name: 'IQVIA Regulatory Intelligence Platform',
      url: 'https://www.iqvia.com/solutions/safety-regulatory-compliance/regulatory-compliance/iqvia-regulatory-intelligence',
      description: 'Regulatory Intelligence mit Echtzeit-Updates von nationalen Behörden in 110+ Ländern',
      requiresAuth: true,
      category: 'regulatory_database',
      region: 'Global',
      status: 'configured',
      credentials: { email: 'helix@medtech-intelligence.com' }
    }
  ];

  async scrapeAllSources(): Promise<ScrapedRegulatoryData[]> {
    const allData: ScrapedRegulatoryData[] = [];
    const activeSources = this.sources.filter(source => source.status === 'active');

    for (const source of activeSources) {
      try {
        logger.info(`Scraping regulatory source: ${source.name}`);
        const sourceData = await this.scrapeSource(source);
        allData.push(...sourceData);
        
        // Rate limiting between sources
        await new Promise(resolve => setTimeout(resolve, 3000));
      } catch (error: any) {
        logger.error(`Error scraping ${source.name}:`, error.message);
      }
    }

    return allData;
  }

  private async scrapeSource(source: RegulatorySource): Promise<ScrapedRegulatoryData[]> {
    switch (source.id) {
      case 'fda_medical_device_db':
        return this.scrapeFDADatabases(source);
      case 'who_global_atlas':
        return this.scrapeWHOAtlas(source);
      case 'medtech_europe_convergence':
        return this.scrapeMedTechEurope(source);
      case 'ncbi_global_framework':
        return this.scrapeNCBIFramework(source);
      case 'iqvia_compliance_blog':
        return this.scrapeIQVIABlog(source);
      case 'bfarm_web_scraping':
        return this.scrapeBfARM(source);
      case 'swissmedic_web_scraping':
        return this.scrapeSwissmedic(source);
      case 'health_canada_web_scraping':
        return this.scrapeHealthCanada(source);
      default:
        logger.warn(`No scraping method implemented for source: ${source.id}`);
        return this.generateFallbackData(source);
    }
  }

  private async scrapeFDADatabases(source: RegulatorySource): Promise<ScrapedRegulatoryData[]> {
    const data: ScrapedRegulatoryData[] = [];
    
    try {
      const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
      };

      const response = await axios.get(source.url, { headers, timeout: 30000 });
      const $ = cheerio.load(response.data);
      
      // FDA database links extraction
      const databaseSelectors = [
        'table.table-striped a',
        '.database-list a',
        '.content-area a[href*="database"]',
        'ul li a'
      ];

      let foundDatabases = false;

      for (const selector of databaseSelectors) {
        const dbLinks = $(selector);
        
        if (dbLinks.length > 0) {
          foundDatabases = true;
          logger.info(`Found ${dbLinks.length} FDA database links using selector: ${selector}`);

          dbLinks.each((index, element) => {
            if (index >= 15) return false; // Limit to 15 databases

            const $link = $(element);
            const title = $link.text().trim();
            const href = $link.attr('href');
            
            if (title && href && title.length > 10) {
              let fullUrl = href;
              if (!href.startsWith('http')) {
                fullUrl = new URL(href, source.url).href;
              }

              data.push({
                source_name: source.name,
                title: `FDA Database: ${title}`,
                url: fullUrl,
                content: `FDA Medical Device Database: ${title}. Provides comprehensive regulatory data for medical devices including approvals, recalls, and compliance information.`,
                category: 'regulatory_database',
                region: 'US',
                publication_date: new Date().toISOString(),
                regulation_type: 'FDA_Database',
                keywords: this.extractKeywords(title, 'FDA medical device database'),
                scrape_timestamp: new Date().toISOString()
              });
            }
          });
          break;
        }
      }

      if (!foundDatabases) {
        data.push(...this.generateFallbackData(source));
      }

    } catch (error: any) {
      logger.error(`Error scraping FDA databases:`, error.message);
      data.push(...this.generateFallbackData(source));
    }

    return data;

    return data;
  }

  private async scrapeWHOAtlas(source: RegulatorySource): Promise<ScrapedRegulatoryData[]> {
    const data: ScrapedRegulatoryData[] = [];
    
    try {
      const headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      };

      const response = await axios.get(source.url, { headers, timeout: 25000 });
      const $ = cheerio.load(response.data);
      
      // WHO content extraction
      const contentSelectors = [
        '.sf-content-block p',
        '.page-content p',
        '.main-content p',
        'article p'
      ];

      let foundContent = false;

      for (const selector of contentSelectors) {
        const paragraphs = $(selector);
        
        if (paragraphs.length > 0) {
          foundContent = true;
          logger.info(`Found ${paragraphs.length} WHO content paragraphs`);

          paragraphs.each((index, element) => {
            if (index >= 10) return false; // Limit to 10 content blocks

            const $p = $(element);
            const content = $p.text().trim();
            
            if (content && content.length > 100) {
              data.push({
                source_name: source.name,
                title: `WHO Medical Device Policy - Section ${index + 1}`,
                url: source.url,
                content: content,
                category: 'standards',
                region: 'Global',
                publication_date: new Date().toISOString(),
                regulation_type: 'WHO_Policy',
                keywords: this.extractKeywords(content.substring(0, 200), 'WHO medical device policy'),
                scrape_timestamp: new Date().toISOString()
              });
            }
          });
          break;
        }
      }

      if (!foundContent) {
        data.push(...this.generateFallbackData(source));
      }

    } catch (error: any) {
      logger.error(`Error scraping WHO Atlas:`, error.message);
      data.push(...this.generateFallbackData(source));
    }

    return data;

    return data;
  }

  private async scrapeMedTechEurope(source: RegulatorySource): Promise<ScrapedRegulatoryData[]> {
    const data: ScrapedRegulatoryData[] = [];
    
    try {
      const headers = {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      };

      const response = await axios.get(source.url, { headers, timeout: 30000 });
      const $ = cheerio.load(response.data);
      
      // MedTech Europe content extraction
      const articleSelectors = [
        '.field-name-body p',
        '.content-area p',
        '.page-content p',
        'main p'
      ];

      let foundArticles = false;

      for (const selector of articleSelectors) {
        const contentBlocks = $(selector);
        
        if (contentBlocks.length > 0) {
          foundArticles = true;
          logger.info(`Found ${contentBlocks.length} MedTech Europe content blocks`);

          contentBlocks.each((index, element) => {
            if (index >= 8) return false;

            const $block = $(element);
            const content = $block.text().trim();
            
            if (content && content.length > 80) {
              data.push({
                source_name: source.name,
                title: `EU Regulatory Convergence - Topic ${index + 1}`,
                url: source.url,
                content: content,
                category: 'compliance',
                region: 'EU',
                publication_date: new Date().toISOString(),
                regulation_type: 'EU_MDR_IVDR',
                keywords: this.extractKeywords(content.substring(0, 200), 'EU MDR IVDR convergence'),
                scrape_timestamp: new Date().toISOString()
              });
            }
          });
          break;
        }
      }

      if (!foundArticles) {
        data.push(...this.generateFallbackData(source));
      }

    } catch (error: any) {
      logger.error(`Error scraping MedTech Europe:`, error.message);
      data.push(...this.generateFallbackData(source));
    }

    return data;

    return data;
  }

  private async scrapeNCBIFramework(source: RegulatorySource): Promise<ScrapedRegulatoryData[]> {
    const data: ScrapedRegulatoryData[] = [];
    
    try {
      const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/120.0'
      };

      const response = await axios.get(source.url, { headers, timeout: 30000 });
      const $ = cheerio.load(response.data);
      
      // NCBI book content extraction
      const chapterSelectors = [
        '.chapter p',
        '.sec p',
        '.content p',
        '#maincontent p'
      ];

      let foundChapters = false;

      for (const selector of chapterSelectors) {
        const paragraphs = $(selector);
        
        if (paragraphs.length > 0) {
          foundChapters = true;
          logger.info(`Found ${paragraphs.length} NCBI framework paragraphs`);

          paragraphs.each((index, element) => {
            if (index >= 12) return false;

            const $p = $(element);
            const content = $p.text().trim();
            
            if (content && content.length > 120) {
              data.push({
                source_name: source.name,
                title: `Global Medical Device Regulation Framework - Chapter ${index + 1}`,
                url: source.url,
                content: content,
                category: 'standards',
                region: 'Global',
                publication_date: new Date().toISOString(),
                regulation_type: 'Global_Framework',
                keywords: this.extractKeywords(content.substring(0, 200), 'global medical device regulation'),
                scrape_timestamp: new Date().toISOString()
              });
            }
          });
          break;
        }
      }

      if (!foundChapters) {
        data.push(...this.generateFallbackData(source));
      }

    } catch (error: any) {
      logger.error(`Error scraping NCBI Framework:`, error.message);
      data.push(...this.generateFallbackData(source));
    }

    return data;

    return data;
  }

  private async scrapeIQVIABlog(source: RegulatorySource): Promise<ScrapedRegulatoryData[]> {
    const data: ScrapedRegulatoryData[] = [];
    
    try {
      const headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15'
      };

      const response = await axios.get(source.url, { headers, timeout: 25000 });
      const $ = cheerio.load(response.data);
      
      // IQVIA blog content extraction
      const blogSelectors = [
        '.blog-content p',
        '.article-body p',
        '.post-content p',
        '.content-area p'
      ];

      let foundBlogContent = false;

      for (const selector of blogSelectors) {
        const contentParagraphs = $(selector);
        
        if (contentParagraphs.length > 0) {
          foundBlogContent = true;
          logger.info(`Found ${contentParagraphs.length} IQVIA blog paragraphs`);

          contentParagraphs.each((index, element) => {
            if (index >= 6) return false;

            const $p = $(element);
            const content = $p.text().trim();
            
            if (content && content.length > 100) {
              data.push({
                source_name: source.name,
                title: `Future of MedTech Compliance - Insight ${index + 1}`,
                url: source.url,
                content: content,
                category: 'market_analysis',
                region: 'Global',
                publication_date: new Date().toISOString(),
                regulation_type: 'Market_Analysis',
                keywords: this.extractKeywords(content.substring(0, 200), 'medtech compliance future'),
                scrape_timestamp: new Date().toISOString()
              });
            }
          });
          break;
        }
      }

      if (!foundBlogContent) {
        data.push(...this.generateFallbackData(source));
      }

    } catch (error: any) {
      logger.error(`Error scraping IQVIA Blog:`, error.message);
      data.push(...this.generateFallbackData(source));
    }

    return data;
  }

  private async scrapeBfARM(source: RegulatorySource): Promise<ScrapedRegulatoryData[]> {
    const data: ScrapedRegulatoryData[] = [];
    
    try {
      const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8'
      };

      const response = await axios.get(source.url, { headers, timeout: 30000 });
      const $ = cheerio.load(response.data);
      
      // BfArM spezifische Selektoren für Medizinprodukte
      const contentSelectors = [
        '.contentWrapper .text-content p',
        '.main-content .page-content p',
        '.content-area p',
        '.article-body p',
        'main p'
      ];

      let foundContent = false;

      for (const selector of contentSelectors) {
        const contentBlocks = $(selector);
        
        if (contentBlocks.length > 0) {
          foundContent = true;
          logger.info(`Found ${contentBlocks.length} BfArM content blocks`);

          contentBlocks.each((index, element) => {
            if (index >= 10) return false;

            const $block = $(element);
            const content = $block.text().trim();
            
            if (content && content.length > 100 && content.includes('Medizinprodukt')) {
              data.push({
                source_name: source.name,
                title: `BfArM Medizinprodukte-Regulierung - Update ${index + 1}`,
                url: source.url,
                content: content,
                category: 'regulatory_update',
                region: 'DE',
                publication_date: new Date().toISOString(),
                regulation_type: 'BfArM_MPG',
                keywords: this.extractKeywords(content.substring(0, 200), 'BfArM Medizinprodukt regulierung'),
                scrape_timestamp: new Date().toISOString()
              });
            }
          });
          break;
        }
      }

      if (!foundContent) {
        data.push(...this.generateFallbackData(source));
      }

    } catch (error: any) {
      logger.error(`Error scraping BfArM:`, error.message);
      data.push(...this.generateFallbackData(source));
    }

    return data;
  }

  private async scrapeSwissmedic(source: RegulatorySource): Promise<ScrapedRegulatoryData[]> {
    const data: ScrapedRegulatoryData[] = [];
    
    try {
      const headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'de-CH,de;q=0.9,en;q=0.8'
      };

      const response = await axios.get(source.url, { headers, timeout: 30000 });
      const $ = cheerio.load(response.data);
      
      // Swissmedic spezifische Selektoren
      const contentSelectors = [
        '.main-content .text p',
        '.content-wrapper p',
        '.page-content p',
        '.article-content p',
        'main .content p'
      ];

      let foundContent = false;

      for (const selector of contentSelectors) {
        const contentBlocks = $(selector);
        
        if (contentBlocks.length > 0) {
          foundContent = true;
          logger.info(`Found ${contentBlocks.length} Swissmedic content blocks`);

          contentBlocks.each((index, element) => {
            if (index >= 8) return false;

            const $block = $(element);
            const content = $block.text().trim();
            
            if (content && content.length > 120) {
              data.push({
                source_name: source.name,
                title: `Swissmedic Medizinprodukte-Zulassung - Update ${index + 1}`,
                url: source.url,
                content: content,
                category: 'approval',
                region: 'CH',
                publication_date: new Date().toISOString(),
                regulation_type: 'Swissmedic_MDD',
                keywords: this.extractKeywords(content.substring(0, 200), 'Swissmedic Medizinprodukt Zulassung'),
                scrape_timestamp: new Date().toISOString()
              });
            }
          });
          break;
        }
      }

      if (!foundContent) {
        data.push(...this.generateFallbackData(source));
      }

    } catch (error: any) {
      logger.error(`Error scraping Swissmedic:`, error.message);
      data.push(...this.generateFallbackData(source));
    }

    return data;
  }

  private async scrapeHealthCanada(source: RegulatorySource): Promise<ScrapedRegulatoryData[]> {
    const data: ScrapedRegulatoryData[] = [];
    
    try {
      const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-CA,en;q=0.9,fr-CA;q=0.8'
      };

      const response = await axios.get(source.url, { headers, timeout: 30000 });
      const $ = cheerio.load(response.data);
      
      // Health Canada spezifische Selektoren
      const contentSelectors = [
        '.main-content .field-item p',
        '.page-content p',
        '.content-wrapper p',
        '.article-body p',
        'main .content p'
      ];

      let foundContent = false;

      for (const selector of contentSelectors) {
        const contentBlocks = $(selector);
        
        if (contentBlocks.length > 0) {
          foundContent = true;
          logger.info(`Found ${contentBlocks.length} Health Canada content blocks`);

          contentBlocks.each((index, element) => {
            if (index >= 10) return false;

            const $block = $(element);
            const content = $block.text().trim();
            
            if (content && content.length > 100 && (content.includes('medical device') || content.includes('device'))) {
              data.push({
                source_name: source.name,
                title: `Health Canada Medical Device Regulation - Update ${index + 1}`,
                url: source.url,
                content: content,
                category: 'regulatory_update',
                region: 'CA',
                publication_date: new Date().toISOString(),
                regulation_type: 'Health_Canada_MDR',
                keywords: this.extractKeywords(content.substring(0, 200), 'Health Canada medical device regulation'),
                scrape_timestamp: new Date().toISOString()
              });
            }
          });
          break;
        }
      }

      if (!foundContent) {
        data.push(...this.generateFallbackData(source));
      }

    } catch (error: any) {
      logger.error(`Error scraping Health Canada:`, error.message);
      data.push(...this.generateFallbackData(source));
    }

    return data;
  }

  private generateFallbackData(source: RegulatorySource): ScrapedRegulatoryData[] {
    const fallbackContent = {
      regulatory_database: [
        'FDA medical device database access requirements updated for enhanced transparency',
        'New regulatory submission pathways for innovative medical technologies',
        'Quality system regulations compliance framework for medical device manufacturers',
        'Post-market surveillance reporting obligations for Class II and III devices'
      ],
      market_analysis: [
        'Global medtech market regulatory convergence drives efficiency gains',
        'Digital health regulatory frameworks evolving to support innovation',
        'Risk-based approach to medical device regulation gains international adoption',
        'Regulatory intelligence platforms enhance compliance decision-making'
      ],
      compliance: [
        'EU MDR implementation challenges and solutions for medical device companies',
        'Brexit impact on UK medical device regulatory pathways and market access',
        'IVDR transition timeline and key compliance milestones for manufacturers',
        'Notified body capacity constraints affecting EU market approvals'
      ],
      standards: [
        'ISO 13485 quality management system updates for medical device sector',
        'IEC 62304 software lifecycle processes for medical device development',
        'Risk management standards ISO 14971 application in modern medtech',
        'Clinical evaluation guidelines under new regulatory frameworks'
      ]
    };

    const content = fallbackContent[source.category as keyof typeof fallbackContent] || fallbackContent.regulatory_database;
    const itemCount = 0; // MOCK DATA ENTFERNT - Keine automatische Item-Generierung

    return content.slice(0, itemCount).map((title, index) => ({
      source_name: source.name,
      title: title,
      url: source.url,
      content: this.generateDetailedContent(title, source),
      category: source.category,
      region: source.region,
      publication_date: new Date().toISOString(), // MOCK DATA ENTFERNT - Feste Zeit statt random
      regulation_type: this.getRegulationType(source.category),
      keywords: this.extractKeywords(title, source.category),
      scrape_timestamp: new Date().toISOString()
    }));
  }

  private generateDetailedContent(title: string, source: RegulatorySource): string {
    const baseContent = `${title} - Authentische regulatorische Informationen von ${source.name}. `;
    
    const additionalContent = {
      regulatory_database: 'Diese Datenbank bietet umfassende Informationen zu medizinischen Geräten, einschließlich Zulassungen, Rückrufe, Sicherheitsmitteilungen und Compliance-Anforderungen. Regulatorische Behörden weltweit nutzen diese Systeme zur Überwachung der Medizinprodukte-Sicherheit.',
      market_analysis: 'Marktanalysen zeigen aktuelle Trends in der Medizintechnik-Regulierung, einschließlich regulatorischer Konvergenz, digitaler Transformation und sich ändernder Compliance-Anforderungen. Diese Erkenntnisse unterstützen strategische Entscheidungen von Herstellern.',
      compliance: 'Compliance-Anforderungen für medizinische Geräte entwickeln sich kontinuierlich weiter. Neue Vorschriften wie EU MDR und IVDR erfordern verstärkte klinische Evidenz, Post-Market-Surveillance und Risikomanagementsysteme.',
      standards: 'Internationale Standards wie ISO 13485, IEC 62304 und ISO 14971 bilden das Fundament für Qualitätsmanagementsysteme in der Medizintechnik. Diese Standards werden regelmäßig aktualisiert, um technologische Entwicklungen zu berücksichtigen.'
    };

    return baseContent + (additionalContent[source.category as keyof typeof additionalContent] || additionalContent.regulatory_database);
  }

  private getRegulationType(category: string): string {
    const typeMapping = {
      regulatory_database: 'Database_Entry',
      market_analysis: 'Market_Intelligence',
      compliance: 'Compliance_Guidance',
      standards: 'Technical_Standard'
    };
    return typeMapping[category] || 'General_Regulatory';
  }

  private extractKeywords(text: string, category: string): string[] {
    const baseKeywords = {
      regulatory_database: ['FDA', 'database', 'medical device', 'regulatory'],
      market_analysis: ['market', 'analysis', 'trends', 'compliance'],
      compliance: ['MDR', 'IVDR', 'compliance', 'regulation'],
      standards: ['ISO', 'IEC', 'standards', 'quality']
    };

    const categoryKeywords = baseKeywords[category] || baseKeywords.regulatory_database;
    
    // Extract additional keywords from text
    const words = text.toLowerCase().split(/\s+/);
    const medtechKeywords = words.filter(word => 
      ['medtech', 'medical', 'device', 'regulatory', 'compliance', 'fda', 'who', 'ema', 'mdr', 'ivdr'].includes(word)
    );

    return [...categoryKeywords, ...medtechKeywords.slice(0, 3)].slice(0, 6);
  }

  getSources(): RegulatorySource[] {
    return this.sources;
  }

  getStats() {
    const activeSources = this.sources.filter(s => s.status === 'active').length;
    const configuredSources = this.sources.filter(s => s.status === 'configured').length;
    const authRequired = this.sources.filter(s => s.requiresAuth).length;
    
    const categories = this.sources.reduce((acc, source) => {
      acc[source.category] = (acc[source.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const regions = this.sources.reduce((acc, source) => {
      acc[source.region] = (acc[source.region] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalSources: this.sources.length,
      activeSources,
      configuredSources,
      authRequired,
      categories,
      regions
    };
  }
}

// Export singleton instance
export const regulatoryDataScraper = new RegulatoryDataScraper();