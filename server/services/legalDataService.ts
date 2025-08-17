import { HistoricalDataRecord, ChangeDetection } from '@shared/schema';

// Legal and jurisprudence data sources for MedTech regulatory intelligence
const legalDataSources = {
  // US Federal Courts and Supreme Court
  'us_federal_courts': {
    name: 'US Federal Court Medical Device Cases',
    url: 'https://www.pacer.gov',
    country: 'USA',
    authority: 'Federal Courts',
    categories: ['court_rulings', 'appeals', 'district_court'],
    languages: ['en'],
    description: 'Federal court decisions on medical device liability, FDA authority, regulatory compliance'
  },
  'us_supreme_court': {
    name: 'US Supreme Court Medical Device Precedents',
    url: 'https://www.supremecourt.gov/opinions',
    country: 'USA',
    authority: 'Supreme Court',
    categories: ['supreme_court', 'constitutional', 'precedent'],
    languages: ['en'],
    description: 'Constitutional decisions affecting medical device regulation and FDA authority'
  },
  'fda_enforcement_cases': {
    name: 'FDA Enforcement Actions & Legal Cases',
    url: 'https://www.fda.gov/inspections-compliance-enforcement-and-criminal-investigations',
    country: 'USA',
    authority: 'FDA',
    categories: ['enforcement', 'consent_decrees', 'settlements'],
    languages: ['en'],
    description: 'FDA enforcement actions, warning letters, consent decrees for medical device companies'
  },

  // European Court of Justice (CJEU)
  'cjeu_medical_devices': {
    name: 'CJEU Medical Device Cases',
    url: 'https://curia.europa.eu/juris',
    country: 'EU',
    authority: 'Court of Justice EU',
    categories: ['court_rulings', 'mdr_cases', 'interpretation'],
    languages: ['en', 'de', 'fr', 'es', 'it'],
    description: 'European Court of Justice rulings on Medical Device Regulation (MDR) and device classification'
  },
  'eu_general_court': {
    name: 'EU General Court Medical Device Appeals',
    url: 'https://curia.europa.eu/juris',
    country: 'EU',
    authority: 'General Court EU',
    categories: ['appeals', 'regulatory_decisions', 'notified_bodies'],
    languages: ['en', 'de', 'fr'],
    description: 'General Court appeals on EMA decisions and notified body determinations'
  },

  // German Courts
  'german_federal_courts': {
    name: 'German Federal Court Medical Device Decisions',
    url: 'https://www.bundesgerichtshof.de',
    country: 'Germany',
    authority: 'Federal Court of Justice',
    categories: ['product_liability', 'civil_law', 'consumer_protection'],
    languages: ['de', 'en'],
    description: 'German federal court decisions on medical device liability and safety standards'
  },
  'german_administrative_courts': {
    name: 'German Administrative Court BfArM Cases',
    url: 'https://www.bverwg.de',
    country: 'Germany',
    authority: 'Federal Administrative Court',
    categories: ['administrative_law', 'bfarm_decisions', 'regulatory_appeals'],
    languages: ['de'],
    description: 'Administrative court decisions challenging BfArM medical device determinations'
  },

  // UK Courts
  'uk_high_court': {
    name: 'UK High Court Medical Device Litigation',
    url: 'https://www.judiciary.uk',
    country: 'UK',
    authority: 'High Court',
    categories: ['product_liability', 'class_actions', 'mhra_cases'],
    languages: ['en'],
    description: 'UK High Court decisions on medical device safety and MHRA regulatory actions'
  },
  'uk_court_of_appeal': {
    name: 'UK Court of Appeal Medical Cases',
    url: 'https://www.judiciary.uk',
    country: 'UK',
    authority: 'Court of Appeal',
    categories: ['appeals', 'precedent', 'statutory_interpretation'],
    languages: ['en'],
    description: 'Court of Appeal precedents affecting medical device regulation and liability'
  },

  // Swiss Courts
  'swiss_federal_court': {
    name: 'Swiss Federal Court Medical Device Cases',
    url: 'https://www.bger.ch',
    country: 'Switzerland',
    authority: 'Federal Supreme Court',
    categories: ['federal_law', 'swissmedic_appeals', 'product_liability'],
    languages: ['de', 'fr', 'it', 'en'],
    description: 'Swiss Federal Court decisions on Swissmedic determinations and device liability'
  },

  // International Arbitration
  'international_arbitration': {
    name: 'International Medical Device Arbitration',
    url: 'https://www.iccwbo.org',
    country: 'International',
    authority: 'ICC/ICSID/UNCITRAL',
    categories: ['arbitration', 'trade_disputes', 'intellectual_property'],
    languages: ['en', 'fr', 'es'],
    description: 'International arbitration cases involving medical device trade disputes and IP rights'
  }
};

export class LegalDataService {
  private static instance: LegalDataService;
  private legalData: Map<string, HistoricalDataRecord[]> = new Map();

  public static getInstance(): LegalDataService {
    if (!LegalDataService.instance) {
      LegalDataService.instance = new LegalDataService();
    }
    return LegalDataService.instance;
  }

  // Generate comprehensive legal case data for each jurisdiction
  async initializeLegalData(): Promise<void> {
    console.log('Initializing comprehensive MedTech legal jurisprudence database...');
    
    for (const [sourceId, source] of Object.entries(legalDataSources)) {
      console.log(`Loading legal cases for ${source.name}...`);
      
      const cases = await this.generateLegalCases(sourceId, source);
      this.legalData.set(sourceId, cases);
      
      console.log(`${source.name}: Loaded ${cases.length} legal cases`);
    }
    
    console.log('Legal jurisprudence database initialization complete.');
  }

  // ALLE MOCK-DATEN ENTFERNT - Keine automatische Legal Case Generierung
  private async generateLegalCases(sourceId: string, source: any): Promise<HistoricalDataRecord[]> {
    console.log(`[LegalDataService] MOCK DATA DELETED - No artificial legal cases for ${sourceId}`);
    return [];
  }

  private async generateLegalCase(sourceId: string, source: any, caseNumber: number, date: Date): Promise<HistoricalDataRecord> {
    const caseTypes = this.getCaseTypesBySource(sourceId);
    const selectedCaseType = caseTypes[Math.floor(Math.random() * caseTypes.length)];
    
    // Generate device classes with specific device types for filtering
    const deviceClasses = this.getDeviceClassesByType();
    const selectedDeviceClasses = this.getRandomSelection(deviceClasses, 1, 3);

    const caseTitle = this.generateCaseTitle(source, selectedCaseType, caseNumber);
    const caseContent = this.generateCaseContent(source, selectedCaseType, selectedDeviceClasses);

    return {
      id: `${sourceId}_case_${date.getFullYear()}_${caseNumber}`,
      sourceId,
      documentId: this.generateCaseId(source, date, caseNumber),
      documentTitle: caseTitle,
      documentUrl: `${source.url}/case/${caseNumber}`,
      content: caseContent,
      metadata: {
        authority: source.authority,
        caseType: selectedCaseType,
        jurisdiction: source.country,
        court: source.authority,
        fileType: 'legal_decision',
        pageCount: Math.floor(Math.random() * 50) + 10,
        language: source.languages[0],
        legalStatus: this.getRandomElement(['Final', 'Pending Appeal', 'Remanded', 'Settled']),
        precedentialValue: this.getRandomElement(['Binding', 'Persuasive', 'Limited', 'Superseded'])
      },
      originalDate: date.toISOString(),
      downloadedAt: new Date().toISOString(),
      version: 1,
      checksum: this.generateChecksum(caseTitle + caseContent),
      language: source.languages[0],
      region: source.country,
      category: selectedCaseType,
      deviceClasses: selectedDeviceClasses,
      status: 'active' as const
    };
  }

  private getCaseTypesBySource(sourceId: string): string[] {
    const caseTypeMap: Record<string, string[]> = {
      'us_federal_courts': ['Product Liability', 'FDA Authority Challenge', 'Patent Litigation', 'Class Action'],
      'us_supreme_court': ['Constitutional Challenge', 'Federal Preemption', 'Administrative Law', 'Due Process'],
      'fda_enforcement_cases': ['Consent Decree', 'Warning Letter Appeal', 'Criminal Prosecution', 'Civil Penalty'],
      'cjeu_medical_devices': ['MDR Interpretation', 'Device Classification', 'Free Movement', 'Harmonized Standards'],
      'eu_general_court': ['EMA Decision Appeal', 'Notified Body Dispute', 'Market Access', 'Conformity Assessment'],
      'german_federal_courts': ['Product Liability', 'Contract Dispute', 'Tort Claims', 'Consumer Protection'],
      'german_administrative_courts': ['BfArM Appeal', 'License Dispute', 'Administrative Penalty', 'Regulatory Review'],
      'uk_high_court': ['Product Liability', 'Class Action', 'MHRA Challenge', 'Commercial Dispute'],
      'uk_court_of_appeal': ['Liability Appeal', 'Statutory Interpretation', 'Precedent Review', 'Damages Appeal'],
      'swiss_federal_court': ['Swissmedic Appeal', 'Administrative Review', 'Constitutional Challenge', 'Civil Appeal'],
      'international_arbitration': ['Trade Dispute', 'IP Licensing', 'Contract Arbitration', 'Investment Dispute']
    };

    return caseTypeMap[sourceId] || ['General Medical Device Case', 'Regulatory Dispute', 'Civil Litigation'];
  }

  private generateCaseTitle(source: any, caseType: string, caseNumber: number): string {
    const parties = this.generatePartyNames(source.country);
    const year = new Date().getFullYear() - Math.floor(Math.random() * 10);
    
    if (source.country === 'USA') {
      return `${parties.plaintiff} v. ${parties.defendant} - ${caseType} (Case No. ${year}-${caseNumber})`;
    } else if (source.country === 'EU') {
      return `Case C-${caseNumber}/${year.toString().slice(-2)} - ${parties.plaintiff} v ${parties.defendant}`;
    } else if (source.country === 'Germany') {
      return `${parties.plaintiff} ./. ${parties.defendant} - ${caseType} (${caseNumber} U ${year})`;
    } else if (source.country === 'UK') {
      return `${parties.plaintiff} v ${parties.defendant} [${year}] EWHC ${caseNumber}`;
    } else {
      return `${parties.plaintiff} vs. ${parties.defendant} - ${caseType} (${year}/${caseNumber})`;
    }
  }

  private generatePartyNames(country: string): { plaintiff: string; defendant: string } {
    const companies = [
      'MedTech Global Ltd', 'Precision Devices Inc', 'BioMedical Solutions', 'Advanced Therapeutics',
      'Digital Health Systems', 'CardioVascular Devices', 'Neuro Technologies', 'Surgical Innovations',
      'Diagnostic Systems Corp', 'Regenerative Medicine Ltd', 'Healthcare Robotics', 'Medical AI Solutions'
    ];

    const regulators: Record<string, string> = {
      'USA': 'Food and Drug Administration',
      'EU': 'European Medicines Agency',
      'Germany': 'Bundesinstitut für Arzneimittel und Medizinprodukte',
      'UK': 'Medicines and Healthcare Products Regulatory Agency',
      'Switzerland': 'Swissmedic'
    };

    const isRegulatoryCase = Math.random() < 0.4;
    const company = this.getRandomElement(companies);
    
    if (isRegulatoryCase && regulators[country]) {
      return Math.random() < 0.5 
        ? { plaintiff: company, defendant: regulators[country] }
        : { plaintiff: regulators[country], defendant: company };
    } else {
      const secondCompany = this.getRandomElement(companies.filter(c => c !== company));
      return { plaintiff: company, defendant: secondCompany };
    }
  }

  private generateCaseContent(source: any, caseType: string, deviceClasses: string[]): string {
    const intro = this.generateCaseIntro(source, caseType);
    const facts = this.generateCaseFacts(deviceClasses);
    const legalIssues = this.generateLegalIssues(caseType);
    const holding = this.generateHolding(caseType);
    const analysis = this.generateLegalAnalysis(source, caseType);
    const conclusion = this.generateConclusion(caseType);

    return `${intro}\n\n## FACTUAL BACKGROUND\n${facts}\n\n## LEGAL ISSUES\n${legalIssues}\n\n## HOLDING\n${holding}\n\n## LEGAL ANALYSIS\n${analysis}\n\n## CONCLUSION\n${conclusion}`;
  }

  private generateCaseIntro(source: any, caseType: string): string {
    const court = source.authority;
    const date = new Date().toLocaleDateString();
    
    return `# ${caseType} Decision\n\n**Court:** ${court}\n**Date:** ${date}\n**Jurisdiction:** ${source.country}\n\nThis case concerns ${caseType.toLowerCase()} in the medical device industry, addressing regulatory compliance, safety standards, and liability issues under applicable medical device regulations.`;
  }

  private generateCaseFacts(deviceClasses: string[]): string {
    const devices = deviceClasses.join(', ');
    const scenarios = [
      `The plaintiff alleges defects in ${devices} medical devices that resulted in patient harm and regulatory non-compliance.`,
      `The defendant company's ${devices} devices were subject to recall due to safety concerns and manufacturing defects.`,
      `Regulatory authorities challenged the classification and approval pathway for ${devices} devices under current regulations.`,
      `A class action lawsuit was filed regarding the safety and efficacy of ${devices} devices in clinical use.`,
      `The case involves patent disputes and intellectual property claims related to ${devices} medical device technologies.`
    ];

    const selectedScenario = this.getRandomElement(scenarios);
    return `${selectedScenario}\n\nThe medical devices in question include advanced diagnostic and therapeutic equipment used in clinical settings. Regulatory compliance issues arose regarding premarket approval, post-market surveillance, and quality management systems. The case highlights the complex intersection of medical device regulation, patient safety, and commercial interests in the healthcare technology sector.`;
  }

  private generateLegalIssues(caseType: string): string {
    const issueMap: Record<string, string[]> = {
      'Product Liability': [
        'Whether the medical device design was unreasonably dangerous',
        'Adequacy of warnings and instructions for use',
        'Manufacturing defects and quality control failures',
        'Causation between device use and alleged injuries'
      ],
      'FDA Authority Challenge': [
        'Scope of FDA regulatory authority over medical devices',
        'Preemption of state law claims by federal regulation',
        'Adequacy of FDA review and approval processes',
        'Due process in regulatory enforcement actions'
      ],
      'MDR Interpretation': [
        'Classification of devices under Medical Device Regulation',
        'Conformity assessment and CE marking requirements',
        'Clinical evidence standards for device approval',
        'Post-market surveillance obligations'
      ]
    };

    const issues = issueMap[caseType] || [
      'Regulatory compliance and safety standards',
      'Liability and damages for device-related injuries',
      'Interpretation of applicable medical device laws',
      'Enforcement of regulatory requirements'
    ];

    return issues.map((issue, index) => `${index + 1}. ${issue}`).join('\n');
  }

  private generateHolding(caseType: string): string {
    const holdings = [
      'The court ruled in favor of the plaintiff, finding that the defendant failed to meet applicable safety standards.',
      'The defendant company was found liable for damages resulting from defective medical device design.',
      'The regulatory authority\'s decision was upheld as within its statutory authority and supported by substantial evidence.',
      'The court found that federal regulations preempt state law claims for certain categories of medical devices.',
      'The case was remanded for further proceedings on the issue of damages and remedial measures.'
    ];

    return this.getRandomElement(holdings);
  }

  private generateLegalAnalysis(source: any, caseType: string): string {
    return `The court's analysis focused on the regulatory framework governing medical devices in ${source.country}, including applicable statutes, regulations, and guidance documents. The decision examines the balance between innovation and safety in medical device development, the role of regulatory authorities in ensuring device safety and efficacy, and the legal standards for determining liability in cases involving medical device-related injuries.

The court considered precedent from similar cases involving medical device regulation and liability, international regulatory harmonization efforts, and the evolving landscape of digital health technologies. The analysis addresses the intersection of administrative law, tort liability, and commercial regulation in the medical device sector.

Key factors in the court's decision included the adequacy of clinical evidence supporting device safety and efficacy, compliance with quality management standards, and the sufficiency of risk-benefit analysis in regulatory decision-making. The court also examined the role of post-market surveillance and the responsibilities of manufacturers, regulators, and healthcare providers in ensuring ongoing device safety.`;
  }

  private generateConclusion(caseType: string): string {
    return `This decision establishes important precedent for ${caseType.toLowerCase()} cases in the medical device industry. The ruling clarifies the legal standards applicable to medical device regulation, liability, and enforcement, providing guidance for manufacturers, regulators, and practitioners in the healthcare technology sector.

The case highlights the ongoing evolution of medical device law and the need for continued adaptation of legal frameworks to address emerging technologies and evolving clinical practices. The decision will likely influence future regulatory policy and litigation strategy in the medical device industry.`;
  }

  private generateCaseId(source: any, date: Date, caseNumber: number): string {
    const year = date.getFullYear();
    const country = source.country.toLowerCase();
    return `${country}_case_${year}_${String(caseNumber).padStart(4, '0')}`;
  }

  private generateChecksum(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  private getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  private getRandomSelection<T>(array: T[], min: number, max: number): T[] {
    const count = Math.floor(Math.random() * (max - min + 1)) + min;
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  private getDeviceClassesByType(): string[] {
    const deviceTypes = [
      // Mobile/Handheld devices
      'Mobile Health Monitor', 'Handheld Ultrasound', 'Portable ECG Device', 'Mobile Diagnostic Tool',
      'Wearable Glucose Monitor', 'Smartphone-based Analyzer', 'Portable Blood Pressure Monitor',
      
      // Desktop/Stationary devices  
      'Desktop MRI System', 'Stationary CT Scanner', 'Console-based Ventilator', 'Desktop Lab Analyzer',
      'Workstation Imaging System', 'Server-based PACS', 'Desktop Surgical Navigation',
      
      // Tablet/Touchscreen devices
      'Tablet-based Ultrasound', 'Touchscreen Patient Monitor', 'Slate-style EHR Terminal',
      'Pad-based Diagnostic Interface', 'Touchscreen Surgical Display',
      
      // General classifications
      'Class I Device', 'Class II Device', 'Class III Device', 'IVD System', 'Software as Medical Device'
    ];
    
    return deviceTypes;
  }

  // API methods for frontend integration
  async getLegalData(sourceId: string, startDate?: string, endDate?: string): Promise<HistoricalDataRecord[]> {
    let data = this.legalData.get(sourceId) || [];
    
    if (startDate || endDate) {
      data = data.filter(record => {
        const recordDate = new Date(record.originalDate);
        if (startDate && recordDate < new Date(startDate)) return false;
        if (endDate && recordDate > new Date(endDate)) return false;
        return true;
      });
    }
    
    return data;
  }

  async getAllLegalSources(): Promise<typeof legalDataSources> {
    return legalDataSources;
  }

  async getLegalChangeHistory(limit?: number): Promise<ChangeDetection[]> {
    // Simulate change detection for legal cases (appeals, reversals, etc.)
    const changes: ChangeDetection[] = [];
    const changeTypes = ['appeal_filed', 'decision_reversed', 'settlement_reached', 'precedent_overruled'];
    
    for (let i = 0; i < (limit || 10000); i++) { // Entferne Limit für vollständige Anzeige
      const sourceIds = Object.keys(legalDataSources);
      const sourceId = this.getRandomElement(sourceIds);
      const sourceData = this.legalData.get(sourceId) || [];
      
      if (sourceData.length > 0) {
        const randomCase = this.getRandomElement(sourceData);
        const changeType = this.getRandomElement(changeTypes);
        
        changes.push({
          id: `legal_change_${Date.now()}_${i}`,
          documentId: randomCase.documentId,
          documentTitle: randomCase.documentTitle,
          changeType: 'content_update',
          previousVersion: i + 1,
          currentVersion: randomCase,
          changesSummary: [`${changeType} detected in legal case`, 'Court decision updated', 'Legal precedent modified'],
          impactAssessment: this.getRandomElement(['low', 'medium', 'high', 'critical']),
          affectedStakeholders: ['Legal Practitioners', 'Medical Device Companies', 'Regulatory Authorities', 'Healthcare Providers'],
          detectedAt: new Date().toISOString(),
          confidence: 0.8 + Math.random() * 0.2
        });
      }
    }
    
    return changes;
  }

  async generateLegalReport(sourceId: string): Promise<any> {
    const data = this.legalData.get(sourceId) || [];
    const source = legalDataSources[sourceId as keyof typeof legalDataSources];
    
    if (!source) {
      throw new Error(`Legal source not found: ${sourceId}`);
    }
    
    const caseTypes = data.reduce((acc, record) => {
      acc[record.category] = (acc[record.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const languageDistribution = data.reduce((acc, record) => {
      acc[record.language] = (acc[record.language] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalCases: data.length,
      timeRange: {
        start: data.length > 0 ? data[data.length - 1].originalDate : new Date().toISOString(),
        end: data.length > 0 ? data[0].originalDate : new Date().toISOString()
      },
      changesDetected: Math.floor(data.length * 0.1),
      highImpactChanges: Math.floor(data.length * 0.02),
      caseTypes,
      languageDistribution,
      recentActivity: await this.getLegalChangeHistory(5)
    };
  }
}

export const legalDataService = LegalDataService.getInstance();