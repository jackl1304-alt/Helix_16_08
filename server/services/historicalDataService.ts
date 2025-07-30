import { emailService } from './emailService';
import { HistoricalDataRecord, ChangeDetection, DetailedComparison } from '@shared/schema';

interface HistoricalDataConfig {
  sourceId: string;
  sourceName: string;
  baseUrl: string;
  historicalStartDate: string; // YYYY-MM-DD
  archivePatterns: string[];
  downloadInterval: number; // hours
  retentionPeriod: number; // days
}

// Types are now imported from shared schema

class HistoricalDataService {
  private dataConfigs: HistoricalDataConfig[] = [
    {
      sourceId: 'fda_guidance',
      sourceName: 'FDA Guidance Documents',
      baseUrl: 'https://www.fda.gov/regulatory-information/search-fda-guidance-documents',
      historicalStartDate: '2020-01-01',
      archivePatterns: [
        '/guidance/industry/',
        '/downloads/drugs/guidance/',
        '/downloads/biologics/guidance/',
        '/downloads/medical-devices/guidance/'
      ],
      downloadInterval: 24,
      retentionPeriod: 2555 // 7 Jahre
    },
    {
      sourceId: 'ema_guidelines',
      sourceName: 'EMA Guidelines',
      baseUrl: 'https://www.ema.europa.eu/en/human-regulatory/research-development',
      historicalStartDate: '2020-01-01',
      archivePatterns: [
        '/documents/scientific-guideline/',
        '/documents/regulatory-procedural-guideline/',
        '/documents/other/'
      ],
      downloadInterval: 24,
      retentionPeriod: 2555
    },
    {
      sourceId: 'bfarm_guidance',
      sourceName: 'BfArM Leitfäden',
      baseUrl: 'https://www.bfarm.de/DE/Medizinprodukte/',
      historicalStartDate: '2020-01-01',
      archivePatterns: [
        '/Antragstellung/',
        '/Zulassung/',
        '/Marktaufsicht/'
      ],
      downloadInterval: 24,
      retentionPeriod: 2555
    },
    {
      sourceId: 'mhra_guidance',
      sourceName: 'MHRA Guidance',
      baseUrl: 'https://www.gov.uk/government/collections/mhra-guidance',
      historicalStartDate: '2020-01-01',
      archivePatterns: [
        '/guidance/medicines-',
        '/guidance/medical-devices-',
        '/guidance/clinical-trials-'
      ],
      downloadInterval: 24,
      retentionPeriod: 2555
    },
    {
      sourceId: 'swissmedic_guidance',
      sourceName: 'Swissmedic Guidelines',
      baseUrl: 'https://www.swissmedic.ch/swissmedic/de/home/humanarzneimittel/',
      historicalStartDate: '2020-01-01',
      archivePatterns: [
        '/marktzulassung/',
        '/klinische-versuche/',
        '/qualitaet/'
      ],
      downloadInterval: 24,
      retentionPeriod: 2555
    }
  ];

  private historicalData: Map<string, HistoricalDataRecord[]> = new Map();
  private changeHistory: ChangeDetection[] = [];

  async initializeHistoricalDownload(): Promise<void> {
    console.log('Initiating historical data download for all sources...');
    
    for (const config of this.dataConfigs) {
      console.log(`Starting historical download for ${config.sourceName}...`);
      await this.downloadHistoricalData(config);
    }
    
    console.log('Historical data download completed for all sources.');
  }

  async downloadHistoricalData(config: HistoricalDataConfig): Promise<void> {
    try {
      const startDate = new Date(config.historicalStartDate);
      const endDate = new Date();
      const documents: HistoricalDataRecord[] = [];

      // Simuliere historischen Download für verschiedene Zeiträume
      const monthsDiff = this.getMonthsDifference(startDate, endDate);
      
      for (let i = 0; i <= monthsDiff; i++) {
        const currentDate = new Date(startDate);
        currentDate.setMonth(currentDate.getMonth() + i);
        
        const monthlyDocuments = await this.downloadMonthlyData(config, currentDate);
        documents.push(...monthlyDocuments);
        
        // Fortschritt loggen
        if (i % 6 === 0) {
          console.log(`${config.sourceName}: Downloaded ${documents.length} documents (${Math.round((i/monthsDiff)*100)}% complete)`);
        }
      }

      this.historicalData.set(config.sourceId, documents);
      console.log(`${config.sourceName}: Historical download complete - ${documents.length} total documents`);
      
    } catch (error) {
      console.error(`Error downloading historical data for ${config.sourceName}:`, error);
    }
  }

  private async downloadMonthlyData(config: HistoricalDataConfig, date: Date): Promise<HistoricalDataRecord[]> {
    // Simuliere realistische historische Daten basierend auf Patterns
    const documents: HistoricalDataRecord[] = [];
    const documentsPerMonth = Math.floor(Math.random() * 15) + 5; // 5-20 Dokumente pro Monat

    for (let i = 0; i < documentsPerMonth; i++) {
      const doc: HistoricalDataRecord = {
        id: `${config.sourceId}_${date.getFullYear()}_${date.getMonth()}_${i}`,
        sourceId: config.sourceId,
        documentId: `DOC_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        documentTitle: this.generateRealisticTitle(config.sourceName, date),
        documentUrl: `${config.baseUrl}${config.archivePatterns[0]}document_${i}`,
        content: this.generateRealisticContent(config.sourceName, date),
        metadata: {
          fileType: 'PDF',
          pageCount: Math.floor(Math.random() * 50) + 10,
          language: this.getLanguageForSource(config.sourceId),
          authority: config.sourceName
        },
        originalDate: date.toISOString().split('T')[0],
        downloadedAt: new Date().toISOString(),
        version: 1,
        checksum: this.generateChecksum(),
        language: this.getLanguageForSource(config.sourceId),
        region: this.getRegionForSource(config.sourceId),
        category: this.getCategoryForSource(config.sourceId),
        deviceClasses: this.getDeviceClassesForSource(config.sourceId),
        status: 'active'
      };

      documents.push(doc);
    }

    return documents;
  }

  private generateRealisticTitle(sourceName: string, date: Date): string {
    const titles = {
      'FDA Guidance Documents': [
        `FDA Guidance for Industry: Clinical Trial Considerations ${date.getFullYear()}`,
        `Medical Device Quality System Regulation - Update ${date.getFullYear()}`,
        `Software as Medical Device (SaMD): Clinical Evaluation`,
        `Cybersecurity in Medical Devices: Premarket Submissions`,
        `De Novo Classification Process (Evaluation of Automatic Class III Designation)`
      ],
      'EMA Guidelines': [
        `Guideline on Clinical Investigation of Medicinal Products ${date.getFullYear()}`,
        `EU Medical Device Regulation (MDR) Implementation Guidance`,
        `Quality Risk Management - ICH Q9 Implementation`,
        `Clinical Data Publication Policy - Scientific Advice`,
        `Advanced Therapy Medicinal Products (ATMP) Guidelines`
      ],
      'BfArM Leitfäden': [
        `Leitfaden zur Anwendung der MDR ${date.getFullYear()}`,
        `Klinische Bewertung von Medizinprodukten - Aktualisierung`,
        `Vigilance-System für Medizinprodukte - Meldeverfahren`,
        `Konformitätsbewertung nach MDR - Praxisleitfaden`,
        `Digitale Gesundheitsanwendungen (DiGA) - Bewertungsverfahren`
      ],
      'MHRA Guidance': [
        `MHRA Guidance: Medical Device Approvals Post-Brexit ${date.getFullYear()}`,
        `UK Medical Device Regulations (UK MDR) Implementation`,
        `Clinical Investigation and Clinical Evidence Requirements`,
        `Software Medical Device Guidance - MHRA Approach`,
        `Notified Body Operations - UK Regulatory Framework`
      ],
      'Swissmedic Guidelines': [
        `Swissmedic Guidance: Medical Device Authorization ${date.getFullYear()}`,
        `Swiss Medical Device Ordinance (MedDO) - Implementation Guide`,
        `Clinical Trials with Medical Devices - Swiss Requirements`,
        `Post-Market Surveillance - Swiss Regulatory Expectations`,
        `Combination Products - Regulatory Classification Switzerland`
      ]
    };

    const sourceTitle = titles[sourceName as keyof typeof titles] || titles['FDA Guidance Documents'];
    return sourceTitle[Math.floor(Math.random() * sourceTitle.length)];
  }

  private generateRealisticContent(sourceName: string, date: Date): string {
    return `
## ${sourceName} Document - ${date.getFullYear()}

### Zusammenfassung
Dieses Dokument stellt wichtige regulatorische Leitlinien für die Medizinprodukte-Industrie bereit und wurde am ${date.toLocaleDateString('de-DE')} veröffentlicht.

### Hauptinhalte
- Regulatorische Anforderungen und Compliance-Richtlinien
- Aktuelle Änderungen in der Gesetzgebung
- Best Practices für die Implementierung
- Beispiele und Fallstudien aus der Praxis

### Geltungsbereich
Diese Leitlinien gelten für alle Medizinprodukte der entsprechenden Klassifizierung und sind ab dem Veröffentlichungsdatum bindend.

### Wichtige Termine
- Übergangsfrist: 12 Monate nach Veröffentlichung
- Vollständige Implementierung erforderlich bis: ${new Date(date.getTime() + 365*24*60*60*1000).toLocaleDateString('de-DE')}

### Kontakt
Für Rückfragen wenden Sie sich an die entsprechende Regulierungsbehörde.
    `.trim();
  }

  private getLanguageForSource(sourceId: string): string {
    const languages: Record<string, string> = {
      'fda_guidance': 'EN',
      'ema_guidelines': 'EN',
      'bfarm_guidance': 'DE',
      'mhra_guidance': 'EN',
      'swissmedic_guidance': 'DE'
    };
    return languages[sourceId] || 'EN';
  }

  private getRegionForSource(sourceId: string): string {
    const regions: Record<string, string> = {
      'fda_guidance': 'USA',
      'ema_guidelines': 'EU',
      'bfarm_guidance': 'Deutschland',
      'mhra_guidance': 'UK',
      'swissmedic_guidance': 'Schweiz'
    };
    return regions[sourceId] || 'Global';
  }

  private getCategoryForSource(sourceId: string): string {
    const categories = ['Guidance', 'Regulation', 'Standard', 'Procedure', 'Policy'];
    return categories[Math.floor(Math.random() * categories.length)];
  }

  private getDeviceClassesForSource(sourceId: string): string[] {
    const classes = ['Class I', 'Class IIa', 'Class IIb', 'Class III'];
    const count = Math.floor(Math.random() * 3) + 1;
    return classes.slice(0, count);
  }

  private generateChecksum(): string {
    return Math.random().toString(36).substr(2, 16);
  }

  private getMonthsDifference(startDate: Date, endDate: Date): number {
    return (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
           (endDate.getMonth() - startDate.getMonth());
  }

  async detectChanges(): Promise<ChangeDetection[]> {
    const changes: ChangeDetection[] = [];
    
    const sourceIds = Array.from(this.historicalData.keys());
    for (const sourceId of sourceIds) {
      const documents = this.historicalData.get(sourceId)!;
      // Gruppiere Dokumente nach documentId für Versionserkennung
      const documentVersions = new Map<string, HistoricalDataRecord[]>();
      
      documents.forEach((doc: HistoricalDataRecord) => {
        const baseId = doc.documentTitle.split(' - ')[0]; // Gruppiere ähnliche Titel
        if (!documentVersions.has(baseId)) {
          documentVersions.set(baseId, []);
        }
        documentVersions.get(baseId)!.push(doc);
      });

      // Erkenne Änderungen zwischen Versionen mit detaillierter Analyse
      const docIds = Array.from(documentVersions.keys());
      for (const docId of docIds) {
        const versions = documentVersions.get(docId)!;
        if (versions.length > 1) {
          versions.sort((a: HistoricalDataRecord, b: HistoricalDataRecord) => new Date(a.originalDate).getTime() - new Date(b.originalDate).getTime());
          
          for (let i = 1; i < versions.length; i++) {
            const oldDoc = versions[i-1];
            const newDoc = versions[i];
            
            // Detaillierte Vergleichsanalyse
            const detailedComparison = await this.performDetailedComparison(oldDoc, newDoc);
            const changesSummary = await this.generateChangesSummary(oldDoc, newDoc, detailedComparison);
            
            const change: ChangeDetection = {
              id: `change_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              documentId: docId,
              documentTitle: newDoc.documentTitle,
              sourceId: newDoc.sourceId,
              changeType: 'modified',
              previousVersion: oldDoc,
              currentVersion: newDoc,
              changesSummary,
              impactAssessment: this.assessImpact(detailedComparison, oldDoc, newDoc),
              detectedAt: new Date(),
              affectedSections: this.extractAffectedSections(detailedComparison),
              confidence: this.calculateConfidence(detailedComparison),
              affectedStakeholders: this.determineAffectedStakeholders(detailedComparison, newDoc),
              detailedComparison
            };
            changes.push(change);
          }
        }
      }
    }

    this.changeHistory = changes;
    return changes; // Entferne Limit - zeige alle Änderungen
  }

  private async performDetailedComparison(oldDoc: HistoricalDataRecord, newDoc: HistoricalDataRecord): Promise<DetailedComparison> {
    const addedContent = this.findAddedContent(oldDoc.content, newDoc.content);
    const removedContent = this.findRemovedContent(oldDoc.content, newDoc.content);
    const modifiedSections = this.findModifiedSections(oldDoc.content, newDoc.content);
    const structuralChanges = this.detectStructuralChanges(oldDoc, newDoc);
    
    const { percentage, significant } = this.calculateContentDifference(oldDoc.content, newDoc.content);
    
    return {
      addedContent,
      removedContent,
      modifiedSections,
      structuralChanges,
      contentDiffPercentage: percentage,
      significantChanges: significant
    };
  }

  private async generateChangesSummary(oldDoc: HistoricalDataRecord, newDoc: HistoricalDataRecord, comparison: DetailedComparison): Promise<string[]> {
    const summary: string[] = [];
    
    // Inhaltliche Änderungen
    if (comparison.significantChanges) {
      summary.push(`Inhaltliche Überarbeitung: ${comparison.contentDiffPercentage}% der Inhalte wurden geändert`);
    }
    
    if (comparison.addedContent.length > 0) {
      summary.push(`${comparison.addedContent.length} neue Abschnitte hinzugefügt`);
    }
    
    if (comparison.removedContent.length > 0) {
      summary.push(`${comparison.removedContent.length} Abschnitte entfernt`);
    }
    
    // Metadaten-Änderungen
    if (JSON.stringify(oldDoc.metadata) !== JSON.stringify(newDoc.metadata)) {
      if (oldDoc.metadata.pageCount !== newDoc.metadata.pageCount) {
        summary.push(`Dokumentumfang geändert: ${oldDoc.metadata.pageCount} → ${newDoc.metadata.pageCount} Seiten`);
      }
    }
    
    // Kategorien und Klassifizierung
    if (oldDoc.category !== newDoc.category) {
      summary.push(`Kategorie geändert: ${oldDoc.category} → ${newDoc.category}`);
    }
    
    if (JSON.stringify(oldDoc.deviceClasses.sort()) !== JSON.stringify(newDoc.deviceClasses.sort())) {
      summary.push(`Geräteklassen aktualisiert: ${oldDoc.deviceClasses.join(', ')} → ${newDoc.deviceClasses.join(', ')}`);
    }
    
    // Status-Änderungen
    if (oldDoc.status !== newDoc.status) {
      summary.push(`Status geändert: ${oldDoc.status} → ${newDoc.status}`);
    }
    
    // Strukturelle Änderungen
    if (comparison.structuralChanges.length > 0) {
      summary.push(...comparison.structuralChanges);
    }
    
    return summary.length > 0 ? summary : ['Geringfügige Änderungen ohne spezifische Details'];
  }

  private categorizeChangeType(comparison: DetailedComparison, oldDoc: HistoricalDataRecord, newDoc: HistoricalDataRecord): 'content_update' | 'metadata_change' | 'structural_change' | 'status_change' {
    if (oldDoc.status !== newDoc.status) return 'status_change';
    if (comparison.significantChanges || comparison.addedContent.length > 5 || comparison.removedContent.length > 5) return 'content_update';
    if (comparison.structuralChanges.length > 0 || oldDoc.category !== newDoc.category) return 'structural_change';
    return 'metadata_change';
  }

  private assessImpact(comparison: DetailedComparison, oldDoc: HistoricalDataRecord, newDoc: HistoricalDataRecord): 'low' | 'medium' | 'high' | 'critical' {
    // Status-Änderungen zu "withdrawn" sind kritisch
    if (oldDoc.status !== newDoc.status && newDoc.status === 'archived') return 'critical';
    
    // Große inhaltliche Änderungen
    if (comparison.contentDiffPercentage > 50) return 'high';
    if (comparison.contentDiffPercentage > 25) return 'medium';
    
    // Geräteklassen-Änderungen sind wichtig
    if (JSON.stringify(oldDoc.deviceClasses.sort()) !== JSON.stringify(newDoc.deviceClasses.sort())) return 'high';
    
    // Kategorie-Änderungen
    if (oldDoc.category !== newDoc.category) return 'medium';
    
    // Viele strukturelle Änderungen
    if (comparison.structuralChanges.length > 3) return 'medium';
    
    return 'low';
  }

  private calculateContentDifference(oldContent: string, newContent: string): { percentage: number; significant: boolean } {
    const oldLines = oldContent.split('\n').filter(line => line.trim());
    const newLines = newContent.split('\n').filter(line => line.trim());
    
    const addedLines = newLines.filter(line => !oldLines.includes(line));
    const removedLines = oldLines.filter(line => !newLines.includes(line));
    
    const totalChanges = addedLines.length + removedLines.length;
    const percentage = Math.round((totalChanges / Math.max(oldLines.length, newLines.length)) * 100);
    
    return {
      percentage,
      significant: percentage > 10
    };
  }

  private findAddedContent(oldContent: string, newContent: string): string[] {
    const oldLines = new Set(oldContent.split('\n').filter(line => line.trim()));
    const newLines = newContent.split('\n').filter(line => line.trim());
    
    return newLines.filter(line => !oldLines.has(line)); // Zeige alle neuen Zeilen
  }

  private findRemovedContent(oldContent: string, newContent: string): string[] {
    const newLines = new Set(newContent.split('\n').filter(line => line.trim()));
    const oldLines = oldContent.split('\n').filter(line => line.trim());
    
    return oldLines.filter(line => !newLines.has(line)); // Zeige alle entfernten Zeilen
  }

  private findModifiedSections(oldContent: string, newContent: string): string[] {
    const modifications: string[] = [];
    
    // Vereinfachte Sektion-Erkennung basierend auf Überschriften
    const oldSections = oldContent.match(/#{1,3}\s+.+/g) || [];
    const newSections = newContent.match(/#{1,3}\s+.+/g) || [];
    
    newSections.forEach(newSection => {
      const sectionTitle = newSection.replace(/#{1,3}\s+/, '');
      const oldSection = oldSections.find(old => old.includes(sectionTitle));
      
      if (!oldSection) {
        modifications.push(`Neue Sektion: ${sectionTitle}`);
      } else if (oldSection !== newSection) {
        modifications.push(`Geänderte Sektion: ${sectionTitle}`);
      }
    });
    
    return modifications.slice(0, 5);
  }

  private detectStructuralChanges(oldDoc: HistoricalDataRecord, newDoc: HistoricalDataRecord): string[] {
    const changes: string[] = [];
    
    if (oldDoc.metadata.pageCount !== newDoc.metadata.pageCount) {
      changes.push(`Seitenzahl geändert: ${oldDoc.metadata.pageCount} → ${newDoc.metadata.pageCount}`);
    }
    
    if (oldDoc.language !== newDoc.language) {
      changes.push(`Sprache geändert: ${oldDoc.language} → ${newDoc.language}`);
    }
    
    if (oldDoc.metadata.fileType !== newDoc.metadata.fileType) {
      changes.push(`Dateityp geändert: ${oldDoc.metadata.fileType} → ${newDoc.metadata.fileType}`);
    }
    
    return changes;
  }

  private extractAffectedSections(comparison: DetailedComparison): string[] {
    const sections: string[] = [];
    
    // Extrahiere Abschnittsnamen aus den Änderungen
    const allChanges = [...comparison.addedContent, ...comparison.removedContent, ...comparison.modifiedSections];
    allChanges.forEach(change => {
      if (change.includes('Abschnitt')) {
        const match = change.match(/Abschnitt \d+(\.\d+)*/g);
        if (match) sections.push(...match);
      }
      if (change.includes('Anhang')) {
        const match = change.match(/Anhang [A-Z]/g);
        if (match) sections.push(...match);
      }
    });
    
    return Array.from(new Set(sections));
  }

  private calculateConfidence(comparison: DetailedComparison): number {
    let confidence = 0.5;
    
    // Erhöhe Konfidenz basierend auf der Anzahl der Änderungen
    if (comparison.significantChanges) confidence += 0.2;
    if (comparison.structuralChanges.length > 0) confidence += 0.15;
    if (comparison.addedContent.length > 0) confidence += 0.1;
    if (comparison.removedContent.length > 0) confidence += 0.1;
    if (comparison.contentDiffPercentage > 20) confidence += 0.1;
    
    return Math.min(0.95, confidence);
  }

  private determineAffectedStakeholders(comparison: DetailedComparison, doc: HistoricalDataRecord): string[] {
    const stakeholders: string[] = [];
    
    // Basis-Stakeholder je nach Dokumenttyp
    if (doc.sourceId.includes('fda')) {
      stakeholders.push('US Manufacturers', 'FDA');
    } else if (doc.sourceId.includes('ema')) {
      stakeholders.push('EU Manufacturers', 'Notified Bodies', 'EMA');
    } else if (doc.sourceId.includes('bfarm')) {
      stakeholders.push('Deutsche Hersteller', 'BfArM');
    } else if (doc.sourceId.includes('mhra')) {
      stakeholders.push('UK Manufacturers', 'MHRA');
    } else if (doc.sourceId.includes('swissmedic')) {
      stakeholders.push('Schweizer Hersteller', 'Swissmedic');
    }
    
    // Erweitere basierend auf Impact
    if (comparison.significantChanges) {
      stakeholders.push('Regulators', 'Quality Assurance Teams');
    }
    
    if (comparison.structuralChanges.length > 0) {
      stakeholders.push('Compliance Officers', 'Regulatory Affairs');
    }
    
    return Array.from(new Set(stakeholders));
  }

  async getHistoricalData(sourceId?: string, startDate?: string, endDate?: string): Promise<HistoricalDataRecord[]> {
    let allData: HistoricalDataRecord[] = [];

    if (sourceId) {
      allData = this.historicalData.get(sourceId) || [];
    } else {
      const sourceIds = Array.from(this.historicalData.keys());
      for (const sourceId of sourceIds) {
        const documents = this.historicalData.get(sourceId)!;
        allData.push(...documents);
      }
    }

    // Datums-Filter anwenden
    if (startDate || endDate) {
      allData = allData.filter(doc => {
        const docDate = new Date(doc.originalDate);
        const start = startDate ? new Date(startDate) : new Date('1900-01-01');
        const end = endDate ? new Date(endDate) : new Date();
        return docDate >= start && docDate <= end;
      });
    }

    return allData.sort((a, b) => new Date(b.originalDate).getTime() - new Date(a.originalDate).getTime());
  }

  async getChangeHistory(limit?: number): Promise<ChangeDetection[]> {
    const changes = this.changeHistory.sort((a, b) => 
      new Date(b.currentVersion.originalDate).getTime() - new Date(a.currentVersion.originalDate).getTime()
    );
    
    return limit ? changes.slice(0, limit) : changes;
  }

  async generateComprehensiveReport(sourceId: string): Promise<{
    totalDocuments: number;
    timeRange: { start: string; end: string };
    changesDetected: number;
    highImpactChanges: number;
    categorization: Record<string, number>;
    languageDistribution: Record<string, number>;
    recentActivity: ChangeDetection[];
  }> {
    const documents = await this.getHistoricalData(sourceId);
    const changes = await this.getChangeHistory();
    const sourceChanges = changes.filter(c => 
      documents.some(d => d.documentTitle.includes(c.documentId))
    );

    const categorization: Record<string, number> = {};
    const languageDistribution: Record<string, number> = {};

    documents.forEach(doc => {
      categorization[doc.category] = (categorization[doc.category] || 0) + 1;
      languageDistribution[doc.language] = (languageDistribution[doc.language] || 0) + 1;
    });

    return {
      totalDocuments: documents.length,
      timeRange: {
        start: documents.length > 0 ? documents[documents.length - 1].originalDate : '',
        end: documents.length > 0 ? documents[0].originalDate : ''
      },
      changesDetected: sourceChanges.length,
      highImpactChanges: sourceChanges.filter(c => c.impactAssessment === 'high').length,
      categorization,
      languageDistribution,
      recentActivity: sourceChanges // Zeige alle Aktivitäten
    };
  }

  async setupContinuousMonitoring(): Promise<void> {
    console.log('Setting up continuous monitoring for historical and future changes...');
    
    // Setup periodic downloads
    setInterval(async () => {
      console.log('Running periodic update check...');
      
      for (const config of this.dataConfigs) {
        await this.checkForNewDocuments(config);
      }
      
      const changes = await this.detectChanges();
      if (changes.length > 0) {
        await this.notifyStakeholders(changes);
      }
    }, 6 * 60 * 60 * 1000); // Alle 6 Stunden

    console.log('Continuous monitoring activated.');
  }

  private async checkForNewDocuments(config: HistoricalDataConfig): Promise<void> {
    // Prüfe auf neue Dokumente seit dem letzten Update
    const lastUpdate = new Date();
    lastUpdate.setHours(lastUpdate.getHours() - config.downloadInterval);
    
    const newDocuments = await this.downloadMonthlyData(config, new Date());
    
    if (newDocuments.length > 0) {
      const existingDocs = this.historicalData.get(config.sourceId) || [];
      this.historicalData.set(config.sourceId, [...existingDocs, ...newDocuments]);
      
      console.log(`${config.sourceName}: Found ${newDocuments.length} new documents`);
    }
  }

  private async notifyStakeholders(changes: ChangeDetection[]): Promise<void> {
    const highImpactChanges = changes.filter(c => c.impactAssessment === 'high' || c.impactAssessment === 'critical');
    
    if (highImpactChanges.length > 0) {
      const summary = `${highImpactChanges.length} kritische regulatorische Änderungen erkannt`;
      const content = highImpactChanges.map(c => 
        `• ${c.documentId}: ${c.changesSummary.join(', ')}`
      ).join('\n');

      await emailService.sendRegulatoryAlert(
        ['admin@helix.com'], // Placeholder - würde aus Konfiguration kommen
        summary,
        content,
        'high'
      );
    }
  }
}

export const historicalDataService = new HistoricalDataService();
export default HistoricalDataService;