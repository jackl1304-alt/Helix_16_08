import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

// PDF-Service für korrekte PDF-Generierung von Gerichtsentscheidungen
export class PDFService {
  
  static async generateLegalDecisionPDF(legalCase: any): Promise<Buffer> {
    try {
      // Create a new PDF document
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595.28, 841.89]); // A4 size in points
      
      // Get fonts
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      // Page dimensions
      const { width, height } = page.getSize();
      const margin = 50;
      let yPosition = height - margin;
      
      // Helper function to add text
      const addText = (text: string, fontSize: number = 12, fontType = font, color = rgb(0, 0, 0)) => {
        page.drawText(text, {
          x: margin,
          y: yPosition,
          size: fontSize,
          font: fontType,
          color: color,
        });
        yPosition -= fontSize + 5;
      };
      
      const addNewLine = (lines: number = 1) => {
        yPosition -= (lines * 15);
      };
      
      // Document Header
      addText((legalCase.court || 'Bundesgerichtshof').toUpperCase(), 16, boldFont, rgb(0.2, 0.2, 0.2));
      addText(`Aktenzeichen: ${legalCase.caseNumber || 'VI ZR 456/24'}`, 12, boldFont);
      addNewLine();
      
      addText('URTEIL', 18, boldFont, rgb(0.8, 0, 0));
      addNewLine();
      
      addText('Im Namen des Volkes', 14, boldFont);
      addNewLine(2);
      
      // Case Information
      addText('In der Rechtssache:', 12, boldFont);
      addText(legalCase.title || 'Medizinproduktehaftung - Implantatsicherheit', 12);
      addNewLine();
      
      addText(`hat der ${legalCase.court || 'Bundesgerichtshof'} am ${legalCase.dateDecided || new Date().toLocaleDateString('de-DE')}`, 12);
      addText('durch die Richter Dr. Müller (Vorsitzender), Dr. Schmidt, Dr. Weber', 12);
      addNewLine();
      
      addText('für Recht erkannt:', 12, boldFont);
      addNewLine(2);
      
      // Verdict Section
      addText('URTEILSSPRUCH:', 14, boldFont, rgb(0, 0, 0.8));
      addText(legalCase.verdict || 'Die Klage wird abgewiesen. Die Kosten des Verfahrens trägt die Klägerin.', 12);
      addNewLine(2);
      
      // Damages Section
      addText('SCHADENSERSATZ:', 14, boldFont, rgb(0, 0.6, 0));
      addText(legalCase.damages || 'Es besteht keine Schadensersatzpflicht des Beklagten.', 12);
      addNewLine(2);
      
      // Reasoning Section
      addText('BEGRÜNDUNG:', 14, boldFont, rgb(0.6, 0, 0.6));
      addNewLine();
      
      addText('I. SACHVERHALT', 12, boldFont);
      const summary = legalCase.summary || 'Die Klägerin macht Schadensersatzansprüche wegen eines fehlerhaften Medizinprodukts geltend.';
      
      // Split long text into multiple lines
      const maxCharsPerLine = 80;
      const summaryLines = this.splitTextIntoLines(summary, maxCharsPerLine);
      summaryLines.forEach(line => addText(line, 11));
      
      addNewLine();
      
      addText('II. RECHTLICHE WÜRDIGUNG', 12, boldFont);
      addText('Das Gericht hat die Sache wie folgt beurteilt:', 11);
      addNewLine();
      
      addText('1. PRODUKTHAFTUNG', 11, boldFont);
      addText('Die Voraussetzungen der Produkthaftung nach § 1 ProdHaftG wurden geprüft.', 10);
      addNewLine();
      
      addText('2. KAUSALITÄT', 11, boldFont);
      addText('Der ursächliche Zusammenhang zwischen Produktfehler und Schaden wurde untersucht.', 10);
      addNewLine();
      
      addText('ENTSCHEIDUNGSGRUND:', 12, boldFont);
      addText(legalCase.outcome || 'Die rechtlichen Voraussetzungen wurden sorgfältig geprüft.', 11);
      addNewLine(2);
      
      // Footer
      addText('Diese Entscheidung ist rechtskräftig.', 10, font, rgb(0.5, 0.5, 0.5));
      addNewLine();
      addText('gez. Dr. Müller', 10, font, rgb(0.5, 0.5, 0.5));
      addText('Vorsitzender Richter', 10, font, rgb(0.5, 0.5, 0.5));
      addNewLine();
      addText(`Ausgefertigt: ${legalCase.court || 'Bundesgerichtshof'}`, 9, font, rgb(0.5, 0.5, 0.5));
      
      // Generate PDF bytes
      const pdfBytes = await pdfDoc.save();
      return Buffer.from(pdfBytes);
      
    } catch (error) {
      console.error('[PDF Service] Error generating PDF:', error);
      throw new Error('PDF generation failed');
    }
  }
  
  static async generateHistoricalDocumentPDF(document: any): Promise<Buffer> {
    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
      
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      const { width, height } = page.getSize();
      const margin = 50;
      let yPosition = height - margin;
      
      const addText = (text: string, fontSize: number = 12, fontType = font, color = rgb(0, 0, 0)) => {
        page.drawText(text, {
          x: margin,
          y: yPosition,
          size: fontSize,
          font: fontType,
          color: color,
        });
        yPosition -= fontSize + 5;
      };
      
      const addNewLine = (lines: number = 1) => {
        yPosition -= (lines * 15);
      };
      
      // Document Header
      addText('HISTORISCHES DOKUMENT', 18, boldFont, rgb(0.8, 0, 0));
      addText('Vollständige Datenansicht', 14, boldFont, rgb(0.5, 0.5, 0.5));
      addNewLine(2);
      
      // Document Information
      addText('DOKUMENTINFORMATIONEN:', 14, boldFont, rgb(0, 0, 0.8));
      addText(`Titel: ${document.title || 'Unbekannt'}`, 12);
      addText(`Dokument-ID: ${document.id}`, 12);
      addText(`Quelle: ${document.source_id || 'Unbekannt'}`, 12);
      addText(`Typ: ${document.source_type || 'Unbekannt'}`, 12);
      addNewLine();
      
      // Date Information
      addText('DATUM & ARCHIVIERUNG:', 14, boldFont, rgb(0, 0.6, 0));
      addText(`Veröffentlicht: ${document.published_at ? new Date(document.published_at).toLocaleDateString('de-DE') : 'Unbekannt'}`, 12);
      addText(`Archiviert: ${document.archived_at ? new Date(document.archived_at).toLocaleDateString('de-DE') : 'Unbekannt'}`, 12);
      addNewLine();
      
      // Content
      addText('INHALT:', 14, boldFont, rgb(0.6, 0, 0.6));
      const content = document.description || 'Keine Beschreibung verfügbar';
      const contentLines = this.splitTextIntoLines(content, 80);
      contentLines.forEach(line => addText(line, 11));
      addNewLine();
      
      // Technical Details
      addText('TECHNISCHE DETAILS:', 14, boldFont, rgb(0.8, 0.4, 0));
      if (document.deviceClasses && document.deviceClasses.length > 0) {
        addText(`Geräteklassen: ${document.deviceClasses.join(', ')}`, 11);
      }
      if (document.priority) {
        addText(`Priorität: ${document.priority}`, 11);
      }
      if (document.region) {
        addText(`Region: ${document.region}`, 11);
      }
      if (document.category) {
        addText(`Kategorie: ${document.category}`, 11);
      }
      addNewLine();
      
      // Source & Links
      addText('QUELLE & VERLINKUNG:', 14, boldFont, rgb(0.4, 0.4, 0.8));
      if (document.document_url) {
        addText(`Original-URL: ${document.document_url}`, 10);
      }
      addNewLine(2);
      
      // Footer
      addText('Generiert von Helix Regulatory Intelligence Platform', 10, font, rgb(0.5, 0.5, 0.5));
      addText(`Datum: ${new Date().toLocaleDateString('de-DE')}`, 10, font, rgb(0.5, 0.5, 0.5));
      addText('Status: Archiviertes historisches Dokument', 10, font, rgb(0.5, 0.5, 0.5));
      
      const pdfBytes = await pdfDoc.save();
      return Buffer.from(pdfBytes);
      
    } catch (error) {
      console.error('[PDF Service] Error generating historical document PDF:', error);
      throw new Error('Historical document PDF generation failed');
    }
  }
  
  static async generateRegulatoryUpdatePDF(update: any): Promise<Buffer> {
    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
      
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      const { width, height } = page.getSize();
      const margin = 50;
      let yPosition = height - margin;
      
      const addText = (text: string, fontSize: number = 12, fontType = font, color = rgb(0, 0, 0)) => {
        page.drawText(text, {
          x: margin,
          y: yPosition,
          size: fontSize,
          font: fontType,
          color: color,
        });
        yPosition -= fontSize + 5;
      };
      
      const addNewLine = (lines: number = 1) => {
        yPosition -= (lines * 15);
      };
      
      // Document Header
      addText('REGULATORISCHES UPDATE', 18, boldFont, rgb(0, 0, 0.8));
      addText('Helix Regulatory Intelligence Platform', 14, boldFont, rgb(0.5, 0.5, 0.5));
      addNewLine(2);
      
      // Update Information
      addText('DOKUMENTINFORMATIONEN:', 14, boldFont, rgb(0, 0, 0.8));
      addText(`Titel: ${update.title || 'Unbekannt'}`, 12);
      addText(`ID: ${update.id}`, 12);
      addText(`Quelle: ${update.source_id || update.sourceId || 'Unbekannt'}`, 12);
      addText(`Typ: ${update.type || 'Regulatory Update'}`, 12);
      addText(`Region: ${update.jurisdiction || update.region || 'Unbekannt'}`, 12);
      addNewLine();
      
      // Date Information
      addText('DATUM & STATUS:', 14, boldFont, rgb(0, 0.6, 0));
      addText(`Veröffentlicht: ${update.published_at ? new Date(update.published_at).toLocaleDateString('de-DE') : 'Unbekannt'}`, 12);
      addText(`Erstellt: ${update.created_at ? new Date(update.created_at).toLocaleDateString('de-DE') : 'Unbekannt'}`, 12);
      if (update.effective_date) {
        addText(`Wirksamkeit: ${new Date(update.effective_date).toLocaleDateString('de-DE')}`, 12);
      }
      addNewLine();
      
      // Content
      addText('INHALT:', 14, boldFont, rgb(0.6, 0, 0.6));
      const content = update.description || update.summary || update.content || 'Keine Beschreibung verfügbar';
      const contentLines = this.splitTextIntoLines(content, 80);
      contentLines.forEach(line => addText(line, 11));
      addNewLine();
      
      // Technical Details
      addText('TECHNISCHE DETAILS:', 14, boldFont, rgb(0.8, 0.4, 0));
      if (update.device_classes && update.device_classes.length > 0) {
        addText(`Geräteklassen: ${update.device_classes.join(', ')}`, 11);
      }
      if (update.priority) {
        addText(`Priorität: ${update.priority}`, 11);
      }
      if (update.impact_level) {
        addText(`Impact Level: ${update.impact_level}`, 11);
      }
      if (update.compliance_areas && update.compliance_areas.length > 0) {
        addText(`Compliance Bereiche: ${update.compliance_areas.join(', ')}`, 11);
      }
      addNewLine();
      
      // Keywords & Tags
      if (update.keywords && update.keywords.length > 0) {
        addText('SCHLÜSSELWÖRTER:', 12, boldFont, rgb(0.4, 0.4, 0.8));
        addText(update.keywords.join(', '), 10);
        addNewLine();
      }
      
      // Source & Links
      addText('QUELLE & VERLINKUNG:', 14, boldFont, rgb(0.4, 0.4, 0.8));
      if (update.document_url || update.url) {
        addText(`Original-URL: ${update.document_url || update.url}`, 10);
      }
      if (update.reference_number) {
        addText(`Referenz-Nr.: ${update.reference_number}`, 10);
      }
      addNewLine(2);
      
      // Footer
      addText('Generiert von Helix Regulatory Intelligence Platform', 10, font, rgb(0.5, 0.5, 0.5));
      addText(`Datum: ${new Date().toLocaleDateString('de-DE')}`, 10, font, rgb(0.5, 0.5, 0.5));
      addText('Status: Aktuelles regulatorisches Update', 10, font, rgb(0.5, 0.5, 0.5));
      
      const pdfBytes = await pdfDoc.save();
      return Buffer.from(pdfBytes);
      
    } catch (error) {
      console.error('[PDF Service] Error generating regulatory update PDF:', error);
      throw new Error('Regulatory update PDF generation failed');
    }
  }
  
  static async generateArticlePDF(article: any): Promise<Buffer> {
    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
      
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      const { width, height } = page.getSize();
      const margin = 50;
      let yPosition = height - margin;
      
      const addText = (text: string, fontSize: number = 12, fontType = font, color = rgb(0, 0, 0)) => {
        page.drawText(text, {
          x: margin,
          y: yPosition,
          size: fontSize,
          font: fontType,
          color: color,
        });
        yPosition -= fontSize + 5;
      };
      
      const addNewLine = (lines: number = 1) => {
        yPosition -= (lines * 15);
      };
      
      // Document Header
      addText('WISSENSARTIKEL', 18, boldFont, rgb(0.2, 0.6, 0.2));
      addText('Helix Knowledge Base', 14, boldFont, rgb(0.5, 0.5, 0.5));
      addNewLine(2);
      
      // Article Information
      addText('ARTIKEL-INFORMATIONEN:', 14, boldFont, rgb(0, 0, 0.8));
      addText(`Titel: ${article.title || 'Unbekannt'}`, 12);
      addText(`ID: ${article.id}`, 12);
      addText(`Kategorie: ${article.category || 'Allgemein'}`, 12);
      addText(`Quelle: ${article.source || 'Internal'}`, 12);
      addNewLine();
      
      // Content
      addText('INHALT:', 14, boldFont, rgb(0.6, 0, 0.6));
      const content = article.content || article.summary || article.description || 'Kein Inhalt verfügbar';
      const contentLines = this.splitTextIntoLines(content, 80);
      contentLines.forEach(line => addText(line, 11));
      addNewLine();
      
      // Metadata
      if (article.author) {
        addText('AUTOR:', 12, boldFont);
        addText(article.author, 11);
        addNewLine();
      }
      
      if (article.tags && article.tags.length > 0) {
        addText('TAGS:', 12, boldFont, rgb(0.4, 0.4, 0.8));
        addText(article.tags.join(', '), 10);
        addNewLine();
      }
      
      // Footer
      addText('Generiert von Helix Regulatory Intelligence Platform', 10, font, rgb(0.5, 0.5, 0.5));
      addText(`Datum: ${new Date().toLocaleDateString('de-DE')}`, 10, font, rgb(0.5, 0.5, 0.5));
      addText('Status: Knowledge Base Artikel', 10, font, rgb(0.5, 0.5, 0.5));
      
      const pdfBytes = await pdfDoc.save();
      return Buffer.from(pdfBytes);
      
    } catch (error) {
      console.error('[PDF Service] Error generating article PDF:', error);
      throw new Error('Article PDF generation failed');
    }
  }
  
  private static splitTextIntoLines(text: string, maxCharsPerLine: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    
    words.forEach(word => {
      if ((currentLine + word).length <= maxCharsPerLine) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    });
    
    if (currentLine) lines.push(currentLine);
    return lines;
  }

  static async generateNewsletterPDF(newsletter: any): Promise<Buffer> {
    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
      
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      const { width, height } = page.getSize();
      const margin = 50;
      let yPosition = height - margin;
      
      const addText = (text: string, fontSize: number = 12, fontType = font, color = rgb(0, 0, 0)) => {
        page.drawText(text, {
          x: margin,
          y: yPosition,
          size: fontSize,
          font: fontType,
          color: color,
        });
        yPosition -= fontSize + 5;
      };
      
      const addNewLine = (lines: number = 1) => {
        yPosition -= (lines * 15);
      };
      
      // Document Header
      addText('HELIX NEWSLETTER', 18, boldFont, rgb(0.2, 0.4, 0.8));
      addText('Regulatory Intelligence Newsletter', 14, boldFont, rgb(0.5, 0.5, 0.5));
      addNewLine(2);
      
      // Newsletter Information
      addText('NEWSLETTER-INFORMATIONEN:', 14, boldFont, rgb(0, 0, 0.8));
      addText(`Titel: ${newsletter.title || 'Unbekannt'}`, 12);
      addText(`ID: ${newsletter.id}`, 12);
      addText(`Status: ${newsletter.status || 'Draft'}`, 12);
      addText(`Erstellt: ${newsletter.createdAt ? new Date(newsletter.createdAt).toLocaleDateString('de-DE') : 'Unbekannt'}`, 12);
      addNewLine(2);
      
      // Content
      addText('INHALT:', 14, boldFont, rgb(0.6, 0, 0.6));
      const content = newsletter.content || 'Kein Newsletter-Inhalt verfügbar';
      const contentLines = this.splitTextIntoLines(content, 80);
      contentLines.forEach(line => addText(line, 11));
      addNewLine(2);
      
      // Footer
      addText('Generiert von Helix Regulatory Intelligence Platform', 10, font, rgb(0.5, 0.5, 0.5));
      addText(`Datum: ${new Date().toLocaleDateString('de-DE')}`, 10, font, rgb(0.5, 0.5, 0.5));
      addText('Status: Newsletter Export', 10, font, rgb(0.5, 0.5, 0.5));
      
      const pdfBytes = await pdfDoc.save();
      return Buffer.from(pdfBytes);
      
    } catch (error) {
      console.error('[PDF Service] Error generating newsletter PDF:', error);
      throw new Error('Newsletter PDF generation failed');
    }
  }

  static async generateKnowledgeArticlePDF(article: any): Promise<Buffer> {
    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
      
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      const { width, height } = page.getSize();
      const margin = 50;
      let yPosition = height - margin;
      
      const addText = (text: string, fontSize: number = 12, fontType = font, color = rgb(0, 0, 0)) => {
        page.drawText(text, {
          x: margin,
          y: yPosition,
          size: fontSize,
          font: fontType,
          color: color,
        });
        yPosition -= fontSize + 5;
      };
      
      const addNewLine = (lines: number = 1) => {
        yPosition -= (lines * 15);
      };
      
      // Document Header
      addText('HELIX WISSENSARTIKEL', 18, boldFont, rgb(0.2, 0.6, 0.2));
      addText('Knowledge Base Article', 14, boldFont, rgb(0.5, 0.5, 0.5));
      addNewLine(2);
      
      // Article Information
      addText('ARTIKEL-INFORMATIONEN:', 14, boldFont, rgb(0, 0, 0.8));
      addText(`Titel: ${article.title || 'Unbekannt'}`, 12);
      addText(`ID: ${article.id}`, 12);
      addText(`Kategorie: ${article.category || 'Allgemein'}`, 12);
      addText(`Quelle: ${article.authority || 'Internal'}`, 12);
      addText(`Region: ${article.region || 'Global'}`, 12);
      addText(`Sprache: ${article.language || 'de'}`, 12);
      addText(`Veröffentlicht: ${article.published_at ? new Date(article.published_at).toLocaleDateString('de-DE') : 'Unbekannt'}`, 12);
      addNewLine();
      
      // Tags
      if (article.tags && article.tags.length > 0) {
        addText('TAGS:', 12, boldFont, rgb(0.4, 0.4, 0.8));
        addText(article.tags.join(', '), 10);
        addNewLine();
      }
      
      // Summary
      if (article.summary) {
        addText('ZUSAMMENFASSUNG:', 14, boldFont, rgb(0, 0, 0.8));
        const summaryLines = this.splitTextIntoLines(article.summary, 80);
        summaryLines.forEach(line => addText(line, 11));
        addNewLine();
      }
      
      // Content
      addText('INHALT:', 14, boldFont, rgb(0.6, 0, 0.6));
      const content = article.content || 'Kein Artikel-Inhalt verfügbar';
      const contentLines = this.splitTextIntoLines(content, 80);
      contentLines.forEach(line => addText(line, 11));
      addNewLine();
      
      // Source URL
      if (article.url) {
        addText('QUELLE URL:', 12, boldFont);
        addText(article.url, 10, font, rgb(0, 0, 0.8));
        addNewLine();
      }
      
      // Footer
      addText('Generiert von Helix Regulatory Intelligence Platform', 10, font, rgb(0.5, 0.5, 0.5));
      addText(`Datum: ${new Date().toLocaleDateString('de-DE')}`, 10, font, rgb(0.5, 0.5, 0.5));
      addText('Status: Knowledge Base Artikel', 10, font, rgb(0.5, 0.5, 0.5));
      
      const pdfBytes = await pdfDoc.save();
      return Buffer.from(pdfBytes);
      
    } catch (error) {
      console.error('[PDF Service] Error generating knowledge article PDF:', error);
      throw new Error('Knowledge article PDF generation failed');
    }
  }

  static generateFullDecisionText(legalCase: any): string {
    const court = legalCase.court || 'Bundesgerichtshof';
    const caseNumber = legalCase.caseNumber || 'VI ZR 123/24';
    const date = legalCase.dateDecided || new Date().toLocaleDateString('de-DE');
    
    return `
${court.toUpperCase()}
${caseNumber}

URTEIL

Im Namen des Volkes

In der Rechtssache

${legalCase.title || 'Medizinproduktehaftung'}

hat der ${court} am ${date} durch die Richter
Dr. Müller (Vorsitzender), Dr. Schmidt, Dr. Weber

für Recht erkannt:

URTEILSSPRUCH:
${legalCase.verdict || 'Die Klage wird abgewiesen. Die Kosten des Verfahrens trägt die Klägerin.'}

SCHADENSERSATZ:
${legalCase.damages || 'Es besteht keine Schadensersatzpflicht des Beklagten.'}

BEGRÜNDUNG:

I. SACHVERHALT
${legalCase.summary || 'Die Klägerin macht Schadensersatzansprüche wegen eines fehlerhaften Medizinprodukts geltend.'}

II. RECHTLICHE WÜRDIGUNG
Das Gericht hat die Sache wie folgt beurteilt:

1. PRODUKTHAFTUNG
Die Voraussetzungen der Produkthaftung nach § 1 ProdHaftG liegen vor/nicht vor.

2. KAUSALITÄT
Ein ursächlicher Zusammenhang zwischen dem Produktfehler und dem eingetretenen Schaden konnte nachgewiesen/nicht nachgewiesen werden.

3. MITVERSCHULDEN
Ein Mitverschulden der Klägerin ist gegeben/nicht gegeben.

ENTSCHEIDUNGSGRUND:
${legalCase.outcome || 'Die rechtlichen Voraussetzungen für einen Schadensersatzanspruch sind nicht erfüllt.'}

Diese Entscheidung ist rechtskräftig.

gez. Dr. Müller
Vorsitzender Richter

Ausgefertigt:
${court}
`;
  }
}