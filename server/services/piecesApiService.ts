import fetch from 'node-fetch';

/**
 * Pieces API Service - Integration für Code/Content Sharing
 * Ermöglicht das Teilen von regulatorischen Updates, Rechtsprechungen und Newsletter-Inhalten
 */
export class PiecesApiService {
  private baseUrl: string;
  
  constructor() {
    this.baseUrl = 'http://localhost:1000';
  }
  
  /**
   * Prüft ob Pieces API verfügbar ist
   */
  async isHealthy(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/.well-known/health`);
      return response.ok;
    } catch (error) {
      console.warn('[PIECES] API nicht verfügbar:', error);
      return false;
    }
  }
  
  /**
   * Teilt ein regulatorisches Update als Piece
   */
  async shareRegulatoryUpdate(update: any): Promise<string | null> {
    try {
      const isHealthy = await this.isHealthy();
      if (!isHealthy) {
        console.warn('[PIECES] API nicht verfügbar - Regulatory Update wird nicht geteilt');
        return null;
      }
      
      const content = this.formatRegulatoryUpdateForSharing(update);
      const shareUrl = await this.createSharedPiece(content, 'regulatory-update');
      
      console.log(`[PIECES] Regulatory Update geteilt: ${shareUrl}`);
      return shareUrl;
    } catch (error) {
      console.error('[PIECES] Fehler beim Teilen des Regulatory Updates:', error);
      return null;
    }
  }
  
  /**
   * Teilt einen Rechtsfall als Piece
   */
  async shareLegalCase(legalCase: any): Promise<string | null> {
    try {
      const isHealthy = await this.isHealthy();
      if (!isHealthy) {
        console.warn('[PIECES] API nicht verfügbar - Rechtsfall wird nicht geteilt');
        return null;
      }
      
      const content = this.formatLegalCaseForSharing(legalCase);
      const shareUrl = await this.createSharedPiece(content, 'legal-case');
      
      console.log(`[PIECES] Rechtsfall geteilt: ${shareUrl}`);
      return shareUrl;
    } catch (error) {
      console.error('[PIECES] Fehler beim Teilen des Rechtsfalls:', error);
      return null;
    }
  }
  
  /**
   * Teilt Newsletter-Inhalt als Piece
   */
  async shareNewsletterContent(newsletter: any): Promise<string | null> {
    try {
      const isHealthy = await this.isHealthy();
      if (!isHealthy) {
        console.warn('[PIECES] API nicht verfügbar - Newsletter wird nicht geteilt');
        return null;
      }
      
      const content = this.formatNewsletterForSharing(newsletter);
      const shareUrl = await this.createSharedPiece(content, 'newsletter');
      
      console.log(`[PIECES] Newsletter geteilt: ${shareUrl}`);
      return shareUrl;
    } catch (error) {
      console.error('[PIECES] Fehler beim Teilen des Newsletters:', error);
      return null;
    }
  }
  
  /**
   * Erstellt einen geteilten Piece über die Pieces API
   */
  private async createSharedPiece(content: string, type: string): Promise<string> {
    // Simuliert die Pieces API - würde in echter Implementierung die tatsächliche API verwenden
    const response = await fetch(`${this.baseUrl}/pieces/share`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        content,
        type,
        metadata: {
          source: 'Helix Regulatory Intelligence',
          timestamp: new Date().toISOString()
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Pieces API Fehler: ${response.status}`);
    }
    
    const result = await response.json() as any;
    return result.shareUrl || `${this.baseUrl}/shared/${result.id}`;
  }
  
  /**
   * Formatiert ein Regulatory Update für das Teilen
   */
  private formatRegulatoryUpdateForSharing(update: any): string {
    return `# ${update.title}

## 🏛️ Regulatorische Information
- **Quelle:** ${update.jurisdiction || 'Unbekannt'}
- **Typ:** ${update.type || 'Regulation'}
- **Datum:** ${new Date(update.publishedDate || update.published_date).toLocaleDateString('de-DE')}
- **Risiko-Level:** ${update.riskLevel || update.risk_level || 'Medium'}

## 📝 Zusammenfassung
${update.summary || update.description || 'Keine Zusammenfassung verfügbar'}

## 📄 Vollständiger Inhalt
${update.content || 'Vollständiger Inhalt wird nachgeladen...'}

## 🏷️ Tags
${update.tags ? update.tags.join(', ') : 'Keine Tags'}

## 🔗 Dokumentation
${update.documentUrl || update.document_url || 'Kein Originaldokument verfügbar'}

---
*Geteilt über Helix Regulatory Intelligence Platform*
*Generiert am: ${new Date().toLocaleString('de-DE')}*`;
  }
  
  /**
   * Formatiert einen Rechtsfall für das Teilen
   */
  private formatLegalCaseForSharing(legalCase: any): string {
    return `# ⚖️ ${legalCase.title}

## 🏛️ Gerichtsinformationen
- **Gericht:** ${legalCase.court}
- **Aktenzeichen:** ${legalCase.caseNumber || legalCase.case_number}
- **Entscheidungsdatum:** ${new Date(legalCase.decisionDate || legalCase.decision_date).toLocaleDateString('de-DE')}
- **Rechtsprechung:** ${legalCase.jurisdiction}
- **Impact Level:** ${legalCase.impactLevel || legalCase.impact_level}

## 📝 Zusammenfassung
${legalCase.summary || 'Keine Zusammenfassung verfügbar'}

## ⚖️ Urteilsspruch
${legalCase.verdict || 'Urteilsspruch wird nachgeladen...'}

## 💰 Schadensersatz
${legalCase.damages || 'Schadensersatzinformationen werden nachgeladen...'}

## 📄 Vollständiger Inhalt
${legalCase.content || 'Vollständiger Inhalt wird nachgeladen...'}

## 🏷️ Schlagwörter
${legalCase.keywords ? legalCase.keywords.join(', ') : 'Keine Schlagwörter'}

## 🔗 Originaldokument
${legalCase.documentUrl || legalCase.document_url || 'Kein Originaldokument verfügbar'}

---
*Geteilt über Helix Regulatory Intelligence Platform*
*Generiert am: ${new Date().toLocaleString('de-DE')}*`;
  }
  
  /**
   * Formatiert einen Newsletter für das Teilen
   */
  private formatNewsletterForSharing(newsletter: any): string {
    return `# 📧 ${newsletter.subject}

## 📅 Newsletter-Informationen
- **Gesendet am:** ${newsletter.sentAt ? new Date(newsletter.sentAt).toLocaleDateString('de-DE') : 'Noch nicht gesendet'}
- **Status:** ${newsletter.status || 'draft'}
- **Empfänger:** ${newsletter.recipientCount || 'Unbekannt'} Abonnenten

## 📝 Inhalt
${newsletter.content || 'Newsletter-Inhalt wird nachgeladen...'}

## 🎯 Extrahierte Artikel
${newsletter.extractedArticles ? newsletter.extractedArticles.length + ' Artikel extrahiert' : 'Keine Artikel extrahiert'}

## 📊 Quellen
${newsletter.sources ? newsletter.sources.map((s: any) => `- ${s.name}: ${s.url}`).join('\n') : 'Keine Quellen definiert'}

---
*Geteilt über Helix Regulatory Intelligence Platform*
*Newsletter-System - Automatische Generierung*
*Erstellt am: ${new Date().toLocaleString('de-DE')}*`;
  }
  
  /**
   * Ruft einen geteilten Piece ab
   */
  async getSharedPiece(shareId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/?p=${shareId}`, {
        method: 'GET',
        headers: {
          'Accept': 'text/html'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Pieces API Fehler: ${response.status}`);
      }
      
      return await response.text();
    } catch (error) {
      console.error('[PIECES] Fehler beim Abrufen des geteilten Pieces:', error);
      return null;
    }
  }
  
  /**
   * Automatisches Teilen wichtiger regulatorischer Änderungen
   */
  async autoShareCriticalUpdates(updates: any[]): Promise<string[]> {
    const sharedUrls: string[] = [];
    
    for (const update of updates) {
      // Nur kritische Updates automatisch teilen
      if (this.isCriticalUpdate(update)) {
        const shareUrl = await this.shareRegulatoryUpdate(update);
        if (shareUrl) {
          sharedUrls.push(shareUrl);
        }
      }
    }
    
    return sharedUrls;
  }
  
  /**
   * Prüft ob ein Update als kritisch eingestuft wird
   */
  private isCriticalUpdate(update: any): boolean {
    const criticalKeywords = ['recall', 'safety', 'urgent', 'immediate', 'critical', 'emergency'];
    const riskLevels = ['high', 'critical'];
    
    const title = (update.title || '').toLowerCase();
    const content = (update.content || update.summary || '').toLowerCase();
    const riskLevel = (update.riskLevel || update.risk_level || '').toLowerCase();
    
    return riskLevels.includes(riskLevel) || 
           criticalKeywords.some(keyword => title.includes(keyword) || content.includes(keyword));
  }
}

// Singleton-Export
export const piecesApiService = new PiecesApiService();