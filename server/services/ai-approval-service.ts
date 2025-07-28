import { pool } from "../db";
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

interface ApprovalDecision {
  action: 'approve' | 'reject' | 'manual_review';
  confidence: number;
  reasoning: string;
  aiTags: string[];
}

export class AIApprovalService {
  
  // KI-basierte Entscheidungslogik für verschiedene Content-Typen
  async evaluateForApproval(itemType: string, itemId: string, content: any): Promise<ApprovalDecision> {
    console.log(`KI evaluiert ${itemType} mit ID ${itemId}`);
    
    switch (itemType) {
      case 'regulatory_update':
        return this.evaluateRegulatoryUpdate(content);
      case 'newsletter':
        return this.evaluateNewsletter(content);
      case 'knowledge_article':
        return this.evaluateKnowledgeArticle(content);
      default:
        return {
          action: 'manual_review',
          confidence: 0,
          reasoning: 'Unbekannter Content-Typ erfordert manueller Review',
          aiTags: ['unknown_type']
        };
    }
  }

  // Bewertung von Regulatory Updates
  private evaluateRegulatoryUpdate(update: any): ApprovalDecision {
    const score = this.calculateRegulatoryScore(update);
    
    if (score >= 0.85) {
      return {
        action: 'approve',
        confidence: score,
        reasoning: `Hohe Qualität: Offizielle Quelle (${update.region}), vollständige Metadaten, klare Kategorisierung`,
        aiTags: ['high_quality', 'official_source', 'auto_approved']
      };
    } else if (score >= 0.60) {
      return {
        action: 'manual_review',
        confidence: score,
        reasoning: `Mittlere Qualität: Zusätzliche Überprüfung empfohlen`,
        aiTags: ['needs_review', 'medium_quality']
      };
    } else {
      return {
        action: 'reject',
        confidence: score,
        reasoning: `Niedrige Qualität: Unvollständige Daten oder unzuverlässige Quelle`,
        aiTags: ['low_quality', 'auto_rejected']
      };
    }
  }

  // Bewertung von Newsletter-Inhalten
  private evaluateNewsletter(newsletter: any): ApprovalDecision {
    const qualityIndicators = {
      hasTitle: !!newsletter.title,
      hasContent: !!newsletter.content && newsletter.content.length > 100,
      hasValidEmail: !!newsletter.template,
      containsUpdates: !!newsletter.updates && newsletter.updates.length > 0,
      properFormatting: this.checkFormatting(newsletter.content)
    };

    const score = Object.values(qualityIndicators).filter(Boolean).length / Object.keys(qualityIndicators).length;

    if (score >= 0.8) {
      return {
        action: 'approve',
        confidence: score,
        reasoning: 'Newsletter erfüllt alle Qualitätsstandards: Vollständiger Inhalt, korrekte Formatierung',
        aiTags: ['newsletter_ready', 'quality_check_passed']
      };
    } else {
      return {
        action: 'manual_review',
        confidence: score,
        reasoning: `Newsletter unvollständig: ${Object.entries(qualityIndicators).filter(([k,v]) => !v).map(([k]) => k).join(', ')}`,
        aiTags: ['incomplete_newsletter', 'needs_completion']
      };
    }
  }

  // Bewertung von Knowledge Base Artikeln
  private evaluateKnowledgeArticle(article: any): ApprovalDecision {
    const contentQuality = this.analyzeContentQuality(article.content || '');
    const hasReferences = !!article.references && article.references.length > 0;
    const hasProperStructure = this.checkArticleStructure(article.content || '');

    let score = contentQuality * 0.5;
    if (hasReferences) score += 0.25;
    if (hasProperStructure) score += 0.25;

    if (score >= 0.75) {
      return {
        action: 'approve',
        confidence: score,
        reasoning: 'Artikel hat hohe Qualität: Strukturierter Inhalt, Referenzen vorhanden',
        aiTags: ['high_quality_article', 'well_structured']
      };
    } else {
      return {
        action: 'manual_review',
        confidence: score,
        reasoning: 'Artikel benötigt Review: Unvollständige Struktur oder fehlende Referenzen',
        aiTags: ['needs_improvement', 'structure_check']
      };
    }
  }

  // Scoring für Regulatory Updates
  private calculateRegulatoryScore(update: any): number {
    let score = 0;

    // Offizielle Quellen bekommen höhere Bewertung
    const officialSources = ['FDA', 'EMA', 'BfArM', 'Swissmedic', 'MHRA'];
    const isOfficialSource = officialSources.some(source => 
      update.region?.includes(source) || update.sourceId?.includes(source)
    );
    if (isOfficialSource) score += 0.3;

    // Vollständigkeit der Daten
    if (update.title && update.title.length > 10) score += 0.2;
    if (update.description && update.description.length > 50) score += 0.2;
    if (update.region) score += 0.1;
    if (update.publishedAt) score += 0.1;
    if (update.documentUrl || update.sourceUrl) score += 0.1;

    return Math.min(score, 1.0);
  }

  // Formatierung prüfen
  private checkFormatting(content: string): boolean {
    if (!content) return false;
    
    // Grundlegende Formatierung prüfen
    const hasHeaders = /#{1,6}\s/.test(content);
    const hasStructure = content.includes('\n\n');
    const reasonableLength = content.length > 200;
    
    return hasHeaders && hasStructure && reasonableLength;
  }

  // Content-Qualität analysieren
  private analyzeContentQuality(content: string): number {
    if (!content || content.length < 100) return 0;

    let qualityScore = 0;
    
    // Länge des Inhalts
    if (content.length > 500) qualityScore += 0.3;
    else if (content.length > 200) qualityScore += 0.2;
    
    // Strukturelle Elemente
    if (/#{1,6}\s/.test(content)) qualityScore += 0.2; // Headers
    if (/\*\*.*\*\*/.test(content)) qualityScore += 0.1; // Bold text
    if (/\n\n/.test(content)) qualityScore += 0.1; // Paragraphs
    if (/(https?:\/\/[^\s]+)/.test(content)) qualityScore += 0.1; // Links
    
    // Fachbegriffe (Medical/Regulatory)
    const medicalTerms = ['device', 'regulation', 'compliance', 'FDA', 'clinical', 'safety', 'efficacy'];
    const termCount = medicalTerms.filter(term => 
      content.toLowerCase().includes(term.toLowerCase())
    ).length;
    qualityScore += Math.min(termCount * 0.05, 0.2);

    return Math.min(qualityScore, 1.0);
  }

  // Artikel-Struktur prüfen
  private checkArticleStructure(content: string): boolean {
    if (!content) return false;
    
    const hasIntroduction = content.toLowerCase().includes('introduction') || 
                           content.toLowerCase().includes('overview') ||
                           content.toLowerCase().includes('summary');
    const hasConclusion = content.toLowerCase().includes('conclusion') || 
                         content.toLowerCase().includes('summary');
    const hasMultipleSections = (content.match(/#{1,6}\s/g) || []).length >= 2;
    
    return hasMultipleSections && (hasIntroduction || hasConclusion);
  }

  // Automatische Approval-Aktion ausführen
  async processAutoApproval(itemType: string, itemId: string): Promise<void> {
    try {
      console.log(`Starte Auto-Approval für ${itemType} ID: ${itemId}`);
      
      // Content laden basierend auf itemType
      let content;
      switch (itemType) {
        case 'regulatory_update':
          const [update] = await sql`SELECT * FROM regulatory_updates WHERE id = ${itemId}`;
          content = update;
          break;
        case 'newsletter':
          const [newsletter] = await sql`SELECT * FROM newsletters WHERE id = ${itemId}`;
          content = newsletter;
          break;
        default:
          console.log(`Unbekannter itemType: ${itemType}`);
          return;
      }

      if (!content) {
        console.log(`Content nicht gefunden für ${itemType} ID: ${itemId}`);
        return;
      }

      // KI-Bewertung durchführen
      const decision = await this.evaluateForApproval(itemType, itemId, content);
      console.log(`KI-Entscheidung:`, decision);

      // Approval-Record erstellen oder aktualisieren
      if (decision.action === 'approve') {
        await sql`
          INSERT INTO approvals (item_type, item_id, status, comments, reviewed_at)
          VALUES (${itemType}, ${itemId}, 'approved', ${`KI Auto-Approval: ${decision.reasoning}`}, NOW())
        `;
        console.log(`✅ Auto-Approved: ${itemType} ${itemId}`);
        
      } else if (decision.action === 'reject') {
        await sql`
          INSERT INTO approvals (item_type, item_id, status, comments, reviewed_at)
          VALUES (${itemType}, ${itemId}, 'rejected', ${`KI Auto-Reject: ${decision.reasoning}`}, NOW())
        `;
        console.log(`❌ Auto-Rejected: ${itemType} ${itemId}`);
        
      } else {
        await sql`
          INSERT INTO approvals (item_type, item_id, status, comments)
          VALUES (${itemType}, ${itemId}, 'pending', ${`KI Empfehlung: ${decision.reasoning}`})
        `;
        console.log(`🤔 Manual Review: ${itemType} ${itemId}`);
      }

    } catch (error) {
      console.error('Auto-Approval Fehler:', error);
    }
  }

  // Batch-Processing für alle pendenden Items
  async processPendingItems(): Promise<void> {
    try {
      console.log('🤖 Starte KI Batch-Approval für alle pendenden Items...');
      
      // Alle pendenden Regulatory Updates
      const pendingUpdates = await sql`
        SELECT ru.* FROM regulatory_updates ru
        LEFT JOIN approvals a ON a.item_type = 'regulatory_update' AND a.item_id = ru.id
        WHERE a.id IS NULL OR a.status = 'pending'
        LIMIT 50
      `;

      for (const update of pendingUpdates) {
        await this.processAutoApproval('regulatory_update', update.id);
      }

      console.log(`✅ KI Batch-Approval abgeschlossen: ${pendingUpdates.length} Updates verarbeitet`);
      
    } catch (error) {
      console.error('Batch-Approval Fehler:', error);
    }
  }
}

export const aiApprovalService = new AIApprovalService();