import { Logger } from './logger.service';
// Define types locally since @shared/types doesn't exist
interface IStorage {
  // Add minimal interface for the methods we need
  getAllRegulatoryUpdates(): Promise<any[]>;
  getAllLegalCases(): Promise<any[]>;
  getAllKnowledgeArticles(): Promise<any[]>;
  createKnowledgeArticle(data: any): Promise<any>;
}

interface RegulatoryUpdate {
  id: string;
  title: string;
  description?: string;
  content?: string;
}

interface LegalCase {
  id: string;
  title: string;
  content?: string;
  summary?: string;
}

class AppError extends Error {
  public readonly statusCode: number;
  
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

class DatabaseError extends AppError {
  constructor(message: string) {
    super(message, 500);
  }
}

const logger = new Logger('KnowledgeExtraction');

export interface ExtractedArticle {
  title: string;
  link: string;
  source: string;
  sourceType: 'regulatory' | 'legal';
  category: string;
  region: string;
  extractedAt: Date;
}

export interface ArticleExtractionStats {
  totalProcessed: number;
  articlesExtracted: number;
  duplicatesSkipped: number;
  errorsEncountered: number;
  sourcesProcessed: string[];
}

export class KnowledgeExtractionService {
  constructor(private storage: IStorage) {}

  /**
   * Extrahiert Artikel aus allen verfügbaren Datenquellen
   */
  async extractArticlesFromAllSources(): Promise<ArticleExtractionStats> {
    logger.info('Starting knowledge article extraction from all data sources');
    
    const stats: ArticleExtractionStats = {
      totalProcessed: 0,
      articlesExtracted: 0,
      duplicatesSkipped: 0,
      errorsEncountered: 0,
      sourcesProcessed: []
    };

    try {
      // Regulatorische Updates verarbeiten
      const regulatoryStats = await this.extractFromRegulatoryUpdates();
      this.mergeStats(stats, regulatoryStats);

      // Rechtsfälle verarbeiten
      const legalStats = await this.extractFromLegalCases();
      this.mergeStats(stats, legalStats);

      logger.info('Knowledge article extraction completed', { 
        totalProcessed: stats.totalProcessed,
        articlesExtracted: stats.articlesExtracted,
        duplicatesSkipped: stats.duplicatesSkipped,
        errorsEncountered: stats.errorsEncountered
      });
      return stats;
    } catch (error) {
      logger.error('Failed to extract knowledge articles', { error });
      throw new AppError('Knowledge article extraction failed', 500);
    }
  }

  /**
   * Extrahiert Artikel aus regulatorischen Updates
   */
  private async extractFromRegulatoryUpdates(): Promise<Partial<ArticleExtractionStats>> {
    logger.info('Extracting articles from regulatory updates');
    
    const stats = {
      totalProcessed: 0,
      articlesExtracted: 0,
      duplicatesSkipped: 0,
      errorsEncountered: 0,
      sourcesProcessed: ['regulatory_updates']
    };

    try {
      const updates = await this.storage.getAllRegulatoryUpdates();
      stats.totalProcessed = updates.length;

      for (const update of updates) {
        try {
          const extracted = this.extractArticleFromRegulatoryUpdate(update);
          if (extracted) {
            const isDuplicate = await this.checkForDuplicate(extracted);
            
            if (!isDuplicate) {
              await this.createKnowledgeArticle(extracted);
              stats.articlesExtracted++;
              
              logger.debug('Created knowledge article from regulatory update', {
                title: extracted.title,
                source: extracted.source
              });
            } else {
              stats.duplicatesSkipped++;
            }
          }
        } catch (error) {
          stats.errorsEncountered++;
          logger.warn('Failed to process regulatory update', {
            updateId: update.id,
            error: error instanceof Error ? error.message : String(error)
          });
        }
      }

      return stats;
    } catch (error) {
      logger.error('Failed to extract from regulatory updates', { error });
      throw new DatabaseError('Failed to fetch regulatory updates', 'getAllRegulatoryUpdates');
    }
  }

  /**
   * Extrahiert Artikel aus Rechtsfällen
   */
  private async extractFromLegalCases(): Promise<Partial<ArticleExtractionStats>> {
    logger.info('Extracting articles from legal cases');
    
    const stats = {
      totalProcessed: 0,
      articlesExtracted: 0,
      duplicatesSkipped: 0,
      errorsEncountered: 0,
      sourcesProcessed: ['legal_cases']
    };

    try {
      const legalCases = await this.storage.getAllLegalCases();
      stats.totalProcessed = legalCases.length;

      for (const legalCase of legalCases) {
        try {
          const extracted = this.extractArticleFromLegalCase(legalCase);
          if (extracted) {
            const isDuplicate = await this.checkForDuplicate(extracted);
            
            if (!isDuplicate) {
              await this.createKnowledgeArticle(extracted);
              stats.articlesExtracted++;
              
              logger.debug('Created knowledge article from legal case', {
                title: extracted.title,
                source: extracted.source
              });
            } else {
              stats.duplicatesSkipped++;
            }
          }
        } catch (error) {
          stats.errorsEncountered++;
          logger.warn('Failed to process legal case', {
            caseId: legalCase.id,
            error: error instanceof Error ? error.message : String(error)
          });
        }
      }

      return stats;
    } catch (error) {
      logger.error('Failed to extract from legal cases', { error });
      throw new DatabaseError('Failed to fetch legal cases', 'getAllLegalCases');
    }
  }

  /**
   * Extrahiert Artikel-Informationen aus einem regulatorischen Update
   */
  private extractArticleFromRegulatoryUpdate(update: RegulatoryUpdate): ExtractedArticle | null {
    if (!update.title) {
      return null;
    }

    // Use source_url instead of url, fallback to constructed link
    const link = update.source_url || `https://example.com/regulatory/${update.id}`;

    return {
      title: this.cleanTitle(update.title),
      link: link,
      source: update.source || 'Regulatory Authority',
      sourceType: 'regulatory',
      category: this.categorizeRegulatoryUpdate(update),
      region: update.region || 'Global',
      extractedAt: new Date()
    };
  }

  /**
   * Extrahiert Artikel-Informationen aus einem Rechtsfall
   */
  private extractArticleFromLegalCase(legalCase: LegalCase): ExtractedArticle | null {
    if (!legalCase.title) {
      return null;
    }

    // Konstruiere einen Link falls nicht vorhanden
    const link = this.constructLegalCaseLink(legalCase);

    return {
      title: this.cleanTitle(legalCase.title),
      link: link,
      source: legalCase.court,
      sourceType: 'legal',
      category: this.categorizeLegalCase(legalCase),
      region: legalCase.jurisdiction,
      extractedAt: new Date()
    };
  }

  /**
   * Bereinigt und normalisiert Titel
   */
  private cleanTitle(title: string): string {
    return title
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s\-\(\)\[\].,;:!?]/g, '')
      .substring(0, 200); // Titel-Länge begrenzen
  }

  /**
   * Kategorisiert regulatorische Updates
   */
  private categorizeRegulatoryUpdate(update: RegulatoryUpdate): string {
    const title = update.title.toLowerCase();
    const type = (update.update_type || '').toLowerCase();

    if (title.includes('software') || title.includes('samd')) {
      return 'Software & Digital Health';
    } else if (title.includes('clinical') || title.includes('trial')) {
      return 'Clinical Trials';
    } else if (title.includes('quality') || title.includes('iso')) {
      return 'Quality Management';
    } else if (type.includes('guidance')) {
      return 'Regulatory Guidance';
    } else if (type.includes('standard')) {
      return 'Standards & Compliance';
    } else {
      return 'General Regulatory';
    }
  }

  /**
   * Kategorisiert Rechtsfälle
   */
  private categorizeLegalCase(legalCase: LegalCase): string {
    const title = legalCase.title.toLowerCase();
    const issues = (legalCase.keywords || []).join(' ').toLowerCase();

    if (title.includes('patent') || issues.includes('patent')) {
      return 'Patent Law';
    } else if (title.includes('product liability') || issues.includes('liability')) {
      return 'Product Liability';
    } else if (title.includes('regulatory') || issues.includes('fda')) {
      return 'Regulatory Compliance';
    } else if (title.includes('antitrust') || issues.includes('competition')) {
      return 'Antitrust & Competition';
    } else {
      return 'General Legal';
    }
  }

  /**
   * Konstruiert einen Link für Rechtsfälle
   */
  private constructLegalCaseLink(legalCase: LegalCase): string {
    // Verwende document_url falls vorhanden, sonst Suchlink
    if (legalCase.document_url) {
      return legalCase.document_url;
    }
    
    // Fallback: Suchlink basierend auf Gerichtshof und Fallnummer
    const searchQuery = encodeURIComponent(`${legalCase.court} ${legalCase.case_number || legalCase.caseNumber || legalCase.id}`);
    return `https://www.google.com/search?q=${searchQuery}`;
  }

  /**
   * Prüft auf Duplikate
   */
  private async checkForDuplicate(extracted: ExtractedArticle): Promise<boolean> {
    try {
      const existingArticles = await this.storage.getAllKnowledgeArticles();
      
      return existingArticles.some(article => 
        article.title === extracted.title || 
        (extracted.link && extracted.link !== '' && 
         article.content && article.content.includes(extracted.link))
      );
    } catch (error) {
      logger.warn('Failed to check for duplicates', { error });
      return false; // Im Zweifel erlauben wir die Erstellung
    }
  }

  /**
   * Erstellt einen Knowledge Article
   */
  private async createKnowledgeArticle(extracted: ExtractedArticle): Promise<void> {
    const articleContent = this.generateArticleContent(extracted);
    
    await this.storage.addKnowledgeArticle({
      title: extracted.title,
      content: articleContent,
      category: extracted.category,
      tags: this.generateTags(extracted),
      author: 'System - Automated Extraction',
      isPublished: false // Startet als Entwurf für Review
    });
  }

  /**
   * Generiert Artikel-Inhalt
   */
  private generateArticleContent(extracted: ExtractedArticle): string {
    return `# ${extracted.title}

**Quelle:** ${extracted.source}  
**Region:** ${extracted.region}  
**Typ:** ${extracted.sourceType === 'regulatory' ? 'Regulatorisches Update' : 'Rechtsfall'}  
**Kategorie:** ${extracted.category}  
**Extrahiert am:** ${extracted.extractedAt.toLocaleDateString('de-DE')}

## Originalquelle
[Zum Originaldokument](${extracted.link})

## Zusammenfassung
*Dieser Artikel wurde automatisch aus den Datenquellen extrahiert und erfordert eine manuelle Überprüfung und Ergänzung.*

---
*Automatisch generiert am ${extracted.extractedAt.toISOString()}*`;
  }

  /**
   * Generiert Tags für den Artikel
   */
  private generateTags(extracted: ExtractedArticle): string[] {
    const tags: string[] = [
      extracted.sourceType,
      extracted.region,
      extracted.category,
      'auto-extracted',
      'needs-review'
    ];

    // Zusätzliche Tags basierend auf dem Titel
    const title = extracted.title.toLowerCase();
    if (title.includes('software')) tags.push('software');
    if (title.includes('clinical')) tags.push('clinical-trials');
    if (title.includes('fda')) tags.push('fda');
    if (title.includes('ema')) tags.push('ema');
    if (title.includes('mhra')) tags.push('mhra');
    if (title.includes('guidance')) tags.push('guidance');
    if (title.includes('recall')) tags.push('recall');

    return Array.from(new Set(tags)); // Duplikate entfernen
  }

  /**
   * Führt Statistiken zusammen
   */
  private mergeStats(target: ArticleExtractionStats, source: Partial<ArticleExtractionStats>): void {
    target.totalProcessed += source.totalProcessed || 0;
    target.articlesExtracted += source.articlesExtracted || 0;
    target.duplicatesSkipped += source.duplicatesSkipped || 0;
    target.errorsEncountered += source.errorsEncountered || 0;
    target.sourcesProcessed.push(...(source.sourcesProcessed || []));
  }

  /**
   * Extrahiert Artikel aus spezifischen Datenquellen
   */
  async extractFromSpecificSources(sourceIds: string[]): Promise<ArticleExtractionStats> {
    logger.info('Extracting articles from specific sources', { sourceIds });
    
    const stats: ArticleExtractionStats = {
      totalProcessed: 0,
      articlesExtracted: 0,
      duplicatesSkipped: 0,
      errorsEncountered: 0,
      sourcesProcessed: sourceIds
    };

    // Hier könnte spezifische Logik für bestimmte Datenquellen implementiert werden
    // Vorerst verwenden wir die allgemeine Extraktion
    return await this.extractArticlesFromAllSources();
  }
}