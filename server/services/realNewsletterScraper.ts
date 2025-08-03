import { Logger } from './logger.service';
import * as cheerio from 'cheerio';
import axios from 'axios';

const logger = new Logger('RealNewsletterScraper');

export interface NewsletterSource {
  id: string;
  name: string;
  url: string;
  description: string;
  requiresAuth: boolean;
  category: 'industry_newsletter' | 'regulatory_newsletter' | 'market_analysis';
  status: 'active' | 'configured';
  credentials?: {
    email?: string;
    password?: string;
  };
}

export interface ScrapedArticle {
  source_name: string;
  article_title: string;
  article_url: string;
  publication_date: string;
  author?: string;
  content_text: string;
  content_html?: string;
  keywords?: string[];
  is_gated: boolean;
  scrape_timestamp: string;
}

export class RealNewsletterScraper {
  private sources: NewsletterSource[] = [
    {
      id: 'medtech_dive',
      name: 'MedTech Dive',
      url: 'https://www.medtechdive.com/',
      description: 'Tägliche Nachrichten und Einblicke in die Medizintechnikbranche',
      requiresAuth: false,
      category: 'industry_newsletter',
      status: 'active'
    },
    {
      id: 'medtech_europe',
      name: 'MedTech Europe Newsletter',
      url: 'https://www.medtecheurope.org/medtech-views/newsletters/',
      description: 'Monatliche Newsletter mit umfassender Berichterstattung über den Medizintechniksektor',
      requiresAuth: true,
      category: 'regulatory_newsletter',
      status: 'active',
      credentials: {
        email: 'helix@medtech-intelligence.com',
        password: '[configured]'
      }
    },
    {
      id: 'medical_device_network',
      name: 'Medical Device Network Newsletter',
      url: 'https://www.medicaldevice-network.com/all-newsletters/',
      description: 'Tägliche Nachrichten-Digest über medizinische Geräte',
      requiresAuth: true,
      category: 'industry_newsletter',
      status: 'configured'
    },
    {
      id: 'medtech_strategist',
      name: 'MedTech Strategist Newsletter',
      url: 'https://www.medtechstrategist.com/medtech-strategist-newsletter',
      description: 'Umfassende globale Berichterstattung über Trends im Bereich der medizinischen Geräte',
      requiresAuth: true,
      category: 'market_analysis',
      status: 'configured'
    },
    {
      id: 'bioworld',
      name: 'BioWorld Newsletter',
      url: 'https://www.bioworld.com/',
      description: 'Nachrichten und Analysen für die globale Biotechnologie-, Pharma- und Medizintechnikindustrie',
      requiresAuth: true,
      category: 'market_analysis',
      status: 'configured'
    },
    {
      id: 'medtech_insights',
      name: 'Med-Tech Insights Newsletter',
      url: 'https://med-techinsights.com/',
      description: 'Neueste Nachrichten, Expertenanalysen und Branchentrends in der Medizintechnik',
      requiresAuth: true,
      category: 'industry_newsletter',
      status: 'active',
      credentials: {
        email: 'helix@medtech-intelligence.com'
      }
    },
    {
      id: 'citeline_medtech',
      name: 'Citeline Medtech Insight Newsletter',
      url: 'https://insights.citeline.com/medtech-insight/',
      description: 'Globale Medtech-Nachrichten und Einblicke, Trends und Marktinformationen',
      requiresAuth: true,
      category: 'market_analysis',
      status: 'active',
      credentials: {
        email: 'helix@medtech-intelligence.com'
      }
    }
  ];

  // Add expanded premium sources based on your comprehensive newsletter analysis
  private expandedSources: NewsletterSource[] = [
    {
      id: 'emergo_ul',
      name: 'Emergo by UL Newsletter',
      url: 'https://www.emergobyul.com/services/newsletters',
      description: 'Regulatorische Updates und Markteinblicke für Medizinprodukte-Hersteller',
      requiresAuth: true,
      category: 'regulatory_newsletter',
      status: 'configured',
      credentials: { email: 'helix@medtech-intelligence.com' }
    },
    {
      id: 'kpmg_medtech',
      name: 'KPMG MedTech Newsletter',
      url: 'https://home.kpmg/xx/en/home/industries/healthcare/medtech.html',
      description: 'Strategische Einblicke und Marktanalysen von KPMG für MedTech-Unternehmen',
      requiresAuth: true,
      category: 'market_analysis',
      status: 'configured',
      credentials: { email: 'helix@medtech-intelligence.com' }
    },
    {
      id: 'mckinsey_health',
      name: 'McKinsey Health Tech Newsletter',
      url: 'https://www.mckinsey.com/industries/healthcare-systems-and-services',
      description: 'Strategische Gesundheitstechnologie-Insights von McKinsey & Company',
      requiresAuth: true,
      category: 'market_analysis',
      status: 'configured',
      credentials: { email: 'helix@medtech-intelligence.com' }
    },
    {
      id: 'pwc_health',
      name: 'PwC Health Services Newsletter',
      url: 'https://www.pwc.com/gx/en/industries/healthcare.html',
      description: 'Gesundheitswesen und MedTech-Trends von PricewaterhouseCoopers',
      requiresAuth: true,
      category: 'market_analysis',
      status: 'configured',
      credentials: { email: 'helix@medtech-intelligence.com' }
    },
    {
      id: 'fiercebiotech',
      name: 'FierceBiotech Newsletter',
      url: 'https://www.fiercebiotech.com/',
      description: 'Tägliche Biotechnologie- und MedTech-Nachrichten für Führungskräfte',
      requiresAuth: true,
      category: 'industry_newsletter',
      status: 'configured',
      credentials: { email: 'helix@medtech-intelligence.com' }
    },
    {
      id: 'massdevice',
      name: 'MassDevice Newsletter',
      url: 'https://www.massdevice.com/',
      description: 'Medizinprodukte-Industrie News, Analysis und Intelligence',
      requiresAuth: true,
      category: 'industry_newsletter',
      status: 'configured',
      credentials: { email: 'helix@medtech-intelligence.com' }
    },
    {
      id: 'regulatory_focus',
      name: 'Regulatory Focus Newsletter',
      url: 'https://www.raps.org/news-and-articles/news-articles',
      description: 'Regulatorische Nachrichten und Analysen für Life Sciences',
      requiresAuth: true,
      category: 'regulatory_newsletter',
      status: 'configured',
      credentials: { email: 'helix@medtech-intelligence.com' }
    },
    {
      id: 'devicetalks',
      name: 'DeviceTalks Newsletter',
      url: 'https://www.devicetalks.com/',
      description: 'Medizinprodukte-Engineering und Business Intelligence',
      requiresAuth: false,
      category: 'industry_newsletter',
      status: 'configured'
    },
    {
      id: 'mdt_magazine',
      name: 'Medical Design & Technology Magazine',
      url: 'https://www.mdtmag.com/',
      description: 'Design, Entwicklung und Herstellung von Medizinprodukten',
      requiresAuth: false,
      category: 'industry_newsletter',
      status: 'configured'
    },
    {
      id: 'meddeviceonline',
      name: 'Medical Device Online Newsletter',
      url: 'https://www.meddeviceonline.com/',
      description: 'Umfassende Medizinprodukte-Ressourcen und Branchennachrichten',
      requiresAuth: false,
      category: 'industry_newsletter',
      status: 'configured'
    },
    {
      id: 'qmed',
      name: 'Qmed Newsletter',
      url: 'https://www.qmed.com/',
      description: 'Qualität und Compliance in der Medizinprodukte-Branche',
      requiresAuth: true,
      category: 'regulatory_newsletter',
      status: 'configured',
      credentials: { email: 'helix@medtech-intelligence.com' }
    },
    {
      id: 'medtechbreakthrough',
      name: 'MedTech Breakthrough Newsletter',
      url: 'https://medtechbreakthrough.com/',
      description: 'Innovationen und Durchbrüche in der Medizintechnologie',
      requiresAuth: false,
      category: 'industry_newsletter',
      status: 'configured'
    },
    {
      id: 'dotmed',
      name: 'DOTmed Newsletter',
      url: 'https://www.dotmed.com/',
      description: 'Medizinische Ausrüstung, Service und Handelsnachrichten',
      requiresAuth: false,
      category: 'industry_newsletter',
      status: 'configured'
    },
    {
      id: 'healthcareitnews',
      name: 'Healthcare IT News MedTech',
      url: 'https://www.healthcareitnews.com/',
      description: 'Digital Health und Health IT Innovations',
      requiresAuth: false,
      category: 'industry_newsletter',
      status: 'configured'
    },
    {
      id: 'mobihealthnews',
      name: 'MobiHealthNews Newsletter',
      url: 'https://www.mobihealthnews.com/',
      description: 'Mobile Health und Digital Health Technologien',
      requiresAuth: false,
      category: 'industry_newsletter',
      status: 'configured'
    },
    {
      id: 'mpo_magazine',
      name: 'Medical Product Outsourcing Magazine',
      url: 'https://www.mpo-mag.com/',
      description: 'Outsourcing und Lieferketten-Management in der MedTech-Branche',
      requiresAuth: false,
      category: 'industry_newsletter',
      status: 'configured'
    }
  ];

  getAllSources(): NewsletterSource[] {
    return [...this.sources, ...this.expandedSources];
  }

  async scrapeAllSources(): Promise<ScrapedArticle[]> {
    const articles: ScrapedArticle[] = [];
    const allSources = this.getAllSources();
    const activeSources = allSources.filter(source => source.status === 'active');

    for (const source of activeSources) {
      try {
        logger.info(`Scraping source: ${source.name} (Auth required: ${source.requiresAuth})`);
        const sourceArticles = await this.scrapeSource(source);
        articles.push(...sourceArticles);
        
        // Rate limiting - wait between sources
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error: any) {
        logger.error(`Error scraping ${source.name}:`, error);
      }
    }

    return articles;
  }

  async scrapePublicSources(): Promise<ScrapedArticle[]> {
    const articles: ScrapedArticle[] = [];
    const allSources = this.getAllSources();
    const publicSources = allSources.filter(source => !source.requiresAuth && source.status === 'active');

    for (const source of publicSources) {
      try {
        logger.info(`Scraping public source: ${source.name}`);
        const sourceArticles = await this.scrapeSource(source);
        articles.push(...sourceArticles);
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1500));
      } catch (error: any) {
        logger.error(`Error scraping ${source.name}:`, error);
      }
    }

    return articles;
  }

  private async scrapeSource(source: NewsletterSource): Promise<ScrapedArticle[]> {
    switch (source.id) {
      case 'medtech_dive':
        return this.scrapeMedTechDive(source);
      case 'medtech_europe':
        return this.scrapeMedTechEurope(source);
      case 'medical_device_network':
        return this.scrapeMedicalDeviceNetwork(source);
      case 'medtech_insights':
        return this.scrapeMedTechInsights(source);
      case 'citeline_medtech':
        return this.scrapeCitelineMedtech(source);
      case 'medtech_strategist':
        return this.scrapeMedTechStrategist(source);
      case 'bioworld':
        return this.scrapeBioWorld(source);
      default:
        logger.warn(`No scraper implemented for source: ${source.id}`);
        return this.generateFallbackArticles(source);
    }
  }

  private async scrapeMedTechDive(source: NewsletterSource): Promise<ScrapedArticle[]> {
    const articles: ScrapedArticle[] = [];
    
    try {
      // Headers to appear as a regular browser
      const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
      };

      const response = await axios.get(source.url, { 
        headers,
        timeout: 30000,
        maxRedirects: 5
      });

      const $ = cheerio.load(response.data);
      
      // MedTech Dive article selectors (these would need to be refined based on actual site structure)
      const articleSelectors = [
        '.feed__item',
        '.story-item',
        'article',
        '.news-item'
      ];

      let foundArticles = false;

      for (const selector of articleSelectors) {
        const articleElements = $(selector);
        
        if (articleElements.length > 0) {
          foundArticles = true;
          logger.info(`Found ${articleElements.length} articles using selector: ${selector}`);

          articleElements.each((index, element) => {
            if (index >= 10) return false; // Limit to 10 articles per source

            const $article = $(element);
            
            // Extract article data
            const title = $article.find('h1, h2, h3, .title, .headline').first().text().trim();
            const url = $article.find('a').first().attr('href');
            const dateText = $article.find('.date, .published, time').first().text().trim();
            const author = $article.find('.author, .byline').first().text().trim();
            const summary = $article.find('.summary, .excerpt, p').first().text().trim();

            if (title && title.length > 10) {
              // Construct full URL if relative
              let articleUrl = url || source.url;
              if (url && !url.startsWith('http')) {
                const baseUrl = new URL(source.url).origin;
                articleUrl = baseUrl + (url.startsWith('/') ? url : '/' + url);
              }

              // Parse date or use current date
              let publicationDate = new Date().toISOString();
              if (dateText) {
                const parsedDate = new Date(dateText);
                if (!isNaN(parsedDate.getTime())) {
                  publicationDate = parsedDate.toISOString();
                }
              }

              articles.push({
                source_name: source.name,
                article_title: title,
                article_url: articleUrl,
                publication_date: publicationDate,
                author: author || undefined,
                content_text: summary || title,
                keywords: this.extractKeywords(title + ' ' + summary, source.category),
                is_gated: false,
                scrape_timestamp: new Date().toISOString()
              });
            }
          });
          break; // Stop after finding articles with first working selector
        }
      }

      if (!foundArticles) {
        logger.warn(`No articles found for ${source.name} with any selector`);
        // Generate fallback articles based on source category to ensure we have content
        articles.push(...this.generateFallbackArticles(source));
      }

    } catch (error: any) {
      logger.error(`Error scraping ${source.name}:`, error.message);
      // Generate fallback articles on error
      articles.push(...this.generateFallbackArticles(source));
    }

    return articles;
  }

  private async scrapeMedTechEurope(source: NewsletterSource): Promise<ScrapedArticle[]> {
    const articles: ScrapedArticle[] = [];
    
    try {
      const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      };

      const response = await axios.get(source.url, { 
        headers,
        timeout: 30000,
        maxRedirects: 5
      });

      const $ = cheerio.load(response.data);
      
      // MedTech Europe newsletter selectors
      const articleSelectors = [
        '.newsletter-item',
        '.news-item',
        '.content-item',
        'article.post',
        '.entry-content'
      ];

      let foundArticles = false;

      for (const selector of articleSelectors) {
        const articleElements = $(selector);
        
        if (articleElements.length > 0) {
          foundArticles = true;
          logger.info(`Found ${articleElements.length} articles from MedTech Europe using selector: ${selector}`);

          articleElements.each((index, element) => {
            if (index >= 8) return false;

            const $article = $(element);
            
            const title = $article.find('h1, h2, h3, .title, .headline').first().text().trim();
            const url = $article.find('a').first().attr('href');
            const dateText = $article.find('.date, .published, time').first().text().trim();
            const summary = $article.find('.summary, .excerpt, p').first().text().trim();

            if (title && title.length > 10) {
              let articleUrl = url || source.url;
              if (url && !url.startsWith('http')) {
                const baseUrl = new URL(source.url).origin;
                articleUrl = baseUrl + (url.startsWith('/') ? url : '/' + url);
              }

              let publicationDate = new Date().toISOString();
              if (dateText) {
                const parsedDate = new Date(dateText);
                if (!isNaN(parsedDate.getTime())) {
                  publicationDate = parsedDate.toISOString();
                }
              }

              articles.push({
                source_name: source.name,
                article_title: title,
                article_url: articleUrl,
                publication_date: publicationDate,
                content_text: summary || title,
                keywords: this.extractKeywords(title + ' ' + summary, source.category),
                is_gated: source.requiresAuth,
                scrape_timestamp: new Date().toISOString()
              });
            }
          });
          break;
        }
      }

      if (!foundArticles) {
        logger.info(`No articles found for MedTech Europe, generating fallback content`);
        articles.push(...this.generateFallbackArticles(source));
      }

    } catch (error: any) {
      logger.error(`Error scraping MedTech Europe:`, error.message);
      articles.push(...this.generateFallbackArticles(source));
    }

    return articles;
  }

  private async scrapeMedicalDeviceNetwork(source: NewsletterSource): Promise<ScrapedArticle[]> {
    const articles: ScrapedArticle[] = [];
    
    try {
      const headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-GB,en;q=0.5',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      };

      const response = await axios.get(source.url, { 
        headers,
        timeout: 25000,
        maxRedirects: 3
      });

      const $ = cheerio.load(response.data);
      
      // Medical Device Network selectors
      const articleSelectors = [
        '.newsletter-archive-item',
        '.archive-item',
        '.news-list-item',
        '.content-block',
        'article'
      ];

      let foundArticles = false;

      for (const selector of articleSelectors) {
        const articleElements = $(selector);
        
        if (articleElements.length > 0) {
          foundArticles = true;
          logger.info(`Found ${articleElements.length} articles from Medical Device Network`);

          articleElements.each((index, element) => {
            if (index >= 6) return false;

            const $article = $(element);
            
            const title = $article.find('h1, h2, h3, .title').first().text().trim();
            const url = $article.find('a').first().attr('href');
            const dateText = $article.find('.date, time, .published').first().text().trim();
            const summary = $article.find('p, .excerpt, .description').first().text().trim();

            if (title && title.length > 15) {
              let articleUrl = url || source.url;
              if (url && !url.startsWith('http')) {
                const baseUrl = new URL(source.url).origin;
                articleUrl = baseUrl + (url.startsWith('/') ? url : '/' + url);
              }

              articles.push({
                source_name: source.name,
                article_title: title,
                article_url: articleUrl,
                publication_date: this.parseDate(dateText),
                content_text: summary || title,
                keywords: this.extractKeywords(title + ' ' + summary, source.category),
                is_gated: source.requiresAuth,
                scrape_timestamp: new Date().toISOString()
              });
            }
          });
          break;
        }
      }

      if (!foundArticles) {
        articles.push(...this.generateFallbackArticles(source));
      }

    } catch (error: any) {
      logger.error(`Error scraping Medical Device Network:`, error.message);
      articles.push(...this.generateFallbackArticles(source));
    }

    return articles;
  }

  private async scrapeMedTechInsights(source: NewsletterSource): Promise<ScrapedArticle[]> {
    const articles: ScrapedArticle[] = [];
    
    try {
      const headers = {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
      };

      const response = await axios.get(source.url, { 
        headers,
        timeout: 20000,
        maxRedirects: 5
      });

      const $ = cheerio.load(response.data);
      
      const articleSelectors = [
        '.post',
        '.blog-post',
        '.insight-item',
        '.article-item',
        'article'
      ];

      let foundArticles = false;

      for (const selector of articleSelectors) {
        const articleElements = $(selector);
        
        if (articleElements.length > 0) {
          foundArticles = true;
          logger.info(`Found ${articleElements.length} articles from Med-Tech Insights`);

          articleElements.each((index, element) => {
            if (index >= 7) return false;

            const $article = $(element);
            
            const title = $article.find('h1, h2, h3, .post-title, .title').first().text().trim();
            const url = $article.find('a').first().attr('href');
            const dateText = $article.find('.date, .post-date, time').first().text().trim();
            const author = $article.find('.author, .by-author').first().text().trim();
            const summary = $article.find('.excerpt, .summary, p').first().text().trim();

            if (title && title.length > 10) {
              let articleUrl = url || source.url;
              if (url && !url.startsWith('http')) {
                const baseUrl = new URL(source.url).origin;
                articleUrl = baseUrl + (url.startsWith('/') ? url : '/' + url);
              }

              articles.push({
                source_name: source.name,
                article_title: title,
                article_url: articleUrl,
                publication_date: this.parseDate(dateText),
                author: author || undefined,
                content_text: summary || title,
                keywords: this.extractKeywords(title + ' ' + summary, source.category),
                is_gated: source.requiresAuth,
                scrape_timestamp: new Date().toISOString()
              });
            }
          });
          break;
        }
      }

      if (!foundArticles) {
        articles.push(...this.generateFallbackArticles(source));
      }

    } catch (error: any) {
      logger.error(`Error scraping Med-Tech Insights:`, error.message);
      articles.push(...this.generateFallbackArticles(source));
    }

    return articles;
  }

  private async scrapeCitelineMedtech(source: NewsletterSource): Promise<ScrapedArticle[]> {
    const articles: ScrapedArticle[] = [];
    
    try {
      const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/120.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br'
      };

      const response = await axios.get(source.url, { 
        headers,
        timeout: 30000
      });

      const $ = cheerio.load(response.data);
      
      const articleSelectors = [
        '.insight-article',
        '.medtech-article',
        '.news-article',
        '.content-item',
        'article'
      ];

      let foundArticles = false;

      for (const selector of articleSelectors) {
        const articleElements = $(selector);
        
        if (articleElements.length > 0) {
          foundArticles = true;
          logger.info(`Found ${articleElements.length} articles from Citeline Medtech`);

          articleElements.each((index, element) => {
            if (index >= 5) return false;

            const $article = $(element);
            
            const title = $article.find('h1, h2, h3, .article-title').first().text().trim();
            const url = $article.find('a').first().attr('href');
            const dateText = $article.find('.published-date, .date, time').first().text().trim();
            const summary = $article.find('.article-summary, .excerpt, p').first().text().trim();

            if (title && title.length > 12) {
              let articleUrl = url || source.url;
              if (url && !url.startsWith('http')) {
                const baseUrl = new URL(source.url).origin;
                articleUrl = baseUrl + (url.startsWith('/') ? url : '/' + url);
              }

              articles.push({
                source_name: source.name,
                article_title: title,
                article_url: articleUrl,
                publication_date: this.parseDate(dateText),
                content_text: summary || title,
                keywords: this.extractKeywords(title + ' ' + summary, source.category),
                is_gated: source.requiresAuth,
                scrape_timestamp: new Date().toISOString()
              });
            }
          });
          break;
        }
      }

      if (!foundArticles) {
        articles.push(...this.generateFallbackArticles(source));
      }

    } catch (error: any) {
      logger.error(`Error scraping Citeline Medtech:`, error.message);
      articles.push(...this.generateFallbackArticles(source));
    }

    return articles;
  }

  private async scrapeMedTechStrategist(source: NewsletterSource): Promise<ScrapedArticle[]> {
    const articles: ScrapedArticle[] = [];
    
    try {
      const headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      };

      const response = await axios.get(source.url, { 
        headers,
        timeout: 25000
      });

      const $ = cheerio.load(response.data);
      
      const articleSelectors = [
        '.newsletter-item',
        '.strategy-article',
        '.medtech-news',
        '.content-block',
        'article'
      ];

      let foundArticles = false;

      for (const selector of articleSelectors) {
        const articleElements = $(selector);
        
        if (articleElements.length > 0) {
          foundArticles = true;
          logger.info(`Found ${articleElements.length} articles from MedTech Strategist`);

          articleElements.each((index, element) => {
            if (index >= 4) return false;

            const $article = $(element);
            
            const title = $article.find('h1, h2, h3, .title').first().text().trim();
            const url = $article.find('a').first().attr('href');
            const dateText = $article.find('.date, time').first().text().trim();
            const summary = $article.find('.summary, p').first().text().trim();

            if (title && title.length > 15) {
              let articleUrl = url || source.url;
              if (url && !url.startsWith('http')) {
                const baseUrl = new URL(source.url).origin;
                articleUrl = baseUrl + (url.startsWith('/') ? url : '/' + url);
              }

              articles.push({
                source_name: source.name,
                article_title: title,
                article_url: articleUrl,
                publication_date: this.parseDate(dateText),
                content_text: summary || title,
                keywords: this.extractKeywords(title + ' ' + summary, source.category),
                is_gated: source.requiresAuth,
                scrape_timestamp: new Date().toISOString()
              });
            }
          });
          break;
        }
      }

      if (!foundArticles) {
        articles.push(...this.generateFallbackArticles(source));
      }

    } catch (error: any) {
      logger.error(`Error scraping MedTech Strategist:`, error.message);
      articles.push(...this.generateFallbackArticles(source));
    }

    return articles;
  }

  private async scrapeBioWorld(source: NewsletterSource): Promise<ScrapedArticle[]> {
    const articles: ScrapedArticle[] = [];
    
    try {
      const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8'
      };

      const response = await axios.get(source.url, { 
        headers,
        timeout: 30000
      });

      const $ = cheerio.load(response.data);
      
      const articleSelectors = [
        '.bioworld-article',
        '.medtech-news',
        '.news-item',
        '.article-preview',
        'article'
      ];

      let foundArticles = false;

      for (const selector of articleSelectors) {
        const articleElements = $(selector);
        
        if (articleElements.length > 0) {
          foundArticles = true;
          logger.info(`Found ${articleElements.length} articles from BioWorld`);

          articleElements.each((index, element) => {
            if (index >= 6) return false;

            const $article = $(element);
            
            const title = $article.find('h1, h2, h3, .headline').first().text().trim();
            const url = $article.find('a').first().attr('href');
            const dateText = $article.find('.publish-date, .date, time').first().text().trim();
            const author = $article.find('.author, .byline').first().text().trim();
            const summary = $article.find('.summary, .excerpt, p').first().text().trim();

            if (title && title.length > 10) {
              let articleUrl = url || source.url;
              if (url && !url.startsWith('http')) {
                const baseUrl = new URL(source.url).origin;
                articleUrl = baseUrl + (url.startsWith('/') ? url : '/' + url);
              }

              articles.push({
                source_name: source.name,
                article_title: title,
                article_url: articleUrl,
                publication_date: this.parseDate(dateText),
                author: author || undefined,
                content_text: summary || title,
                keywords: this.extractKeywords(title + ' ' + summary, source.category),
                is_gated: source.requiresAuth,
                scrape_timestamp: new Date().toISOString()
              });
            }
          });
          break;
        }
      }

      if (!foundArticles) {
        articles.push(...this.generateFallbackArticles(source));
      }

    } catch (error: any) {
      logger.error(`Error scraping BioWorld:`, error.message);
      articles.push(...this.generateFallbackArticles(source));
    }

    return articles;
  }

  private parseDate(dateText: string): string {
    if (!dateText) {
      return new Date().toISOString();
    }

    const cleanedDate = dateText.replace(/Published:|Posted:|Date:/gi, '').trim();
    const parsedDate = new Date(cleanedDate);
    
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate.toISOString();
    }

    // Try common date patterns
    const patterns = [
      /(\d{1,2})\/(\d{1,2})\/(\d{4})/,  // MM/DD/YYYY
      /(\d{1,2})-(\d{1,2})-(\d{4})/,   // MM-DD-YYYY
      /(\d{4})-(\d{1,2})-(\d{1,2})/,   // YYYY-MM-DD
    ];

    for (const pattern of patterns) {
      const match = cleanedDate.match(pattern);
      if (match) {
        const testDate = new Date(match[0]);
        if (!isNaN(testDate.getTime())) {
          return testDate.toISOString();
        }
      }
    }

    // Default to current date if parsing fails
    return new Date().toISOString();
  }

  private generateFallbackArticles(source: NewsletterSource): ScrapedArticle[] {
    const categoryArticles = {
      industry_newsletter: [
        'KI-Revolution in der Medizintechnik: Neue FDA-Genehmigungen für ML-Algorithmen',
        'Digital Health Funding erreicht Rekordhoch von $8.2 Milliarden im Q3 2024',
        'Wearable Medical Devices: Marktprognose zeigt 15% CAGR bis 2028',
        'Robotik-Chirurgie: Da Vinci Xi System erhält erweiterte EU-Zulassung',
        'Implantierbare Sensoren revolutionieren Diabetes-Management'
      ],
      regulatory_newsletter: [
        'FDA veröffentlicht neue Guidance für Software als Medizinprodukt (SaMD)',
        'EU MDR: Neue Anforderungen für klinische Studien ab Januar 2025',
        'Swissmedic harmonisiert Zulassungsverfahren mit EU-Standards',
        'MHRA Brexit-Update: Neue Anforderungen für Medizinprodukte-Import',
        'ISO 13485:2024 - Wichtige Änderungen im Qualitätsmanagement'
      ],
      market_analysis: [
        'Global MedTech Market: $595 Milliarden Volumen bis 2025 prognostiziert',
        'Venture Capital Investment in Digital Health steigt um 23%',
        'M&A-Aktivitäten im MedTech-Sektor erreichen 5-Jahres-Hoch',
        'Supply Chain Resilience: Neue Strategien nach COVID-19',
        'Emerging Markets: Asien-Pazifik führt MedTech-Wachstum an'
      ]
    };

    const titles = categoryArticles[source.category] || categoryArticles.industry_newsletter;
    const articlesToGenerate = 0; // MOCK DATA ENTFERNT - Keine automatische Artikel-Generierung

    return titles.slice(0, articlesToGenerate).map(title => ({
      source_name: source.name,
      article_title: title,
      article_url: source.url,
      publication_date: new Date().toISOString(), // MOCK DATA ENTFERNT - Feste Zeit statt random
      content_text: this.generateArticleContent(title, source),
      keywords: this.extractKeywords(title, source.category),
      is_gated: source.requiresAuth,
      scrape_timestamp: new Date().toISOString()
    }));
  }

  private generateArticleContent(title: string, source: NewsletterSource): string {
    const premiumContent = source.requiresAuth ? 
      "Premium-Inhalt basierend auf Branchenexpertise und verifizierten Quellen. " : 
      "Öffentlich verfügbare Informationen aus vertrauenswürdigen Industriequellen. ";
      
    return `${premiumContent}${title}

Dieser Artikel stammt aus ${source.name} und behandelt wichtige Entwicklungen im MedTech-Bereich. 

Die Inhalte basieren auf authentischen Newsletter-Quellen und bieten Einblicke in:
- Aktuelle Markttrends und Entwicklungen
- Regulatorische Änderungen und Compliance-Anforderungen  
- Technologische Innovationen und deren Auswirkungen
- Strategische Geschäftsentscheidungen der Branche

Quelle: ${source.name} (${source.category})
Authentifizierung erforderlich: ${source.requiresAuth ? 'Ja' : 'Nein'}
URL: ${source.url}

Für vollständige Details und weitere Analysen besuchen Sie die ursprüngliche Quelle.`;
  }

  private extractKeywords(text: string, category: string): string[] {
    const keywordMap = {
      industry_newsletter: ['MedTech', 'Innovation', 'Branche', 'Technologie', 'Digital Health'],
      regulatory_newsletter: ['Regulatorik', 'Compliance', 'FDA', 'EU MDR', 'Zulassung'],
      market_analysis: ['Marktanalyse', 'Investment', 'Trends', 'Prognosen', 'M&A']
    };
    
    const baseKeywords = keywordMap[category as keyof typeof keywordMap] || ['MedTech'];
    
    // Extract additional keywords from title
    const additionalKeywords = text.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 4)
      .filter(word => ['medtech', 'medical', 'device', 'health', 'digital', 'innovation'].includes(word))
      .slice(0, 3);
    
    return [...baseKeywords, ...additionalKeywords].slice(0, 5);
  }

  getSources(): NewsletterSource[] {
    return this.getAllSources();
  }

  getStats() {
    const allSources = this.getAllSources();
    const activeSources = allSources.filter(s => s.status === 'active').length;
    const configuredSources = allSources.filter(s => s.status === 'configured').length;
    const authRequired = allSources.filter(s => s.requiresAuth).length;
    
    const categories = allSources.reduce((acc, source) => {
      acc[source.category] = (acc[source.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalSources: allSources.length,
      activeSources,
      configuredSources,
      authRequired,
      categories
    };
  }
}

export const realNewsletterScraper = new RealNewsletterScraper();