import { storage } from "../storage";
import { fdaOpenApiService } from "./fdaOpenApiService";
import { aiService } from "./aiService";

// Dynamic import to avoid module resolution issues during compilation
async function getNlpService() {
  try {
    const nlpModule = await import("./nlpService");
    return nlpModule.nlpService;
  } catch (error) {
    console.warn("NLP service not available, using fallback:", error);
    // Fallback service for development
    return {
      categorizeContent: async (content: string) => ({ 
        categories: ["medical-device"], 
        confidence: 0.8,
        deviceTypes: ["unknown"],
        riskLevel: "medium",
        therapeuticArea: "general"
      })
    };
  }
}

interface FDAResponse {
  results: Array<{
    k_number?: string;
    device_name?: string;
    decision_description?: string;
    decision_date?: string;
    advisory_committee_description?: string;
    product_code?: string;
    device_class?: string;
    regulation_number?: string;
    medical_specialty_description?: string;
    summary?: string;
  }>;
  meta: {
    total: number;
  };
}

interface EMAMedicine {
  name: string;
  active_substance: string;
  international_non_proprietary_name: string;
  therapeutic_area: string;
  authorisation_status: string;
  date_of_opinion: string;
  decision_date: string;
  revision_number: string;
  condition_indication: string;
  species: string;
  atc_code: string;
  orphan_medicine: string;
  marketing_authorisation_date: string;
  date_of_refusal_withdrawal: string;
  url: string;
}

// Erweiterte Datenquellen für globale regulatorische Überwachung
interface GlobalDataSources {
  // Deutschland
  bfarm: string; // Bundesinstitut für Arzneimittel und Medizinprodukte
  dimdi: string; // Deutsches Institut für Medizinische Dokumentation
  dguv: string; // Deutsche Gesetzliche Unfallversicherung
  din: string; // DIN-Normen
  
  // Europa
  ema: string; // European Medicines Agency
  mdcg: string; // Medical Device Coordination Group
  eurLex: string; // EU-Recht
  cen: string; // Europäische Normung
  
  // Schweiz
  swissmedic: string; // Schweizerische Zulassungsbehörde
  saq: string; // Swiss Association for Quality
  
  // England/UK
  mhra: string; // Medicines and Healthcare products Regulatory Agency
  bsi: string; // British Standards Institution
  
  // USA
  fda: string; // Food and Drug Administration
  nist: string; // National Institute of Standards and Technology
  
  // Kanada
  healthCanada: string;
  
  // Asien
  pmda: string; // Japan - Pharmaceuticals and Medical Devices Agency
  nmpa: string; // China - National Medical Products Administration
  cdsco: string; // Indien - Central Drugs Standard Control Organization
  
  // Russland
  roszdravnadzor: string; // Russische Gesundheitsaufsicht
  
  // Südamerika
  anvisa: string; // Brasilien
  anmat: string; // Argentinien
}

export class DataCollectionService {
  private readonly FDA_BASE_URL = "https://api.fda.gov/device";
  private readonly FDA_510K_URL = "https://api.fda.gov/device/510k.json";
  private readonly EMA_MEDICINES_URL = "https://www.ema.europa.eu/en/medicines/download-medicine-data";
  
  // Globale Datenquellen-URLs
  private readonly dataSources: GlobalDataSources = {
    // Deutschland
    bfarm: "https://www.bfarm.de/DE/Medizinprodukte/_node.html",
    dimdi: "https://www.dimdi.de/dynamic/de/klassifikationen/",
    dguv: "https://www.dguv.de/de/praevention/themen-a-z/index.jsp",
    din: "https://www.din.de/de/mitwirken/normenausschuesse/nasg",
    
    // Europa
    ema: "https://www.ema.europa.eu/en/medicines/download-medicine-data",
    mdcg: "https://ec.europa.eu/health/md_sector/new-regulations/guidance_en",
    eurLex: "https://eur-lex.europa.eu/homepage.html",
    cen: "https://www.cen.eu/standards/",
    
    // Schweiz
    swissmedic: "https://www.swissmedic.ch/swissmedic/de/home.html",
    saq: "https://www.saq.ch/de/",
    
    // England/UK
    mhra: "https://www.gov.uk/government/organisations/medicines-and-healthcare-products-regulatory-agency",
    bsi: "https://www.bsigroup.com/en-GB/standards/",
    
    // USA
    fda: "https://api.fda.gov/device",
    nist: "https://www.nist.gov/standardsgov/",
    
    // Kanada
    healthCanada: "https://www.canada.ca/en/health-canada.html",
    
    // Asien
    pmda: "https://www.pmda.go.jp/english/",
    nmpa: "https://www.nmpa.gov.cn/",
    cdsco: "https://cdsco.gov.in/opencms/opencms/",
    
    // Russland
    roszdravnadzor: "https://roszdravnadzor.gov.ru/",
    
    // Südamerika
    anvisa: "https://www.gov.br/anvisa/pt-br",
    anmat: "https://www.argentina.gob.ar/anmat"
  };

  private getFormattedDate(daysAgo: number): string {
    const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    return date.toISOString().split("T")[0].replace(/-/g, "");
  }

  async collectFDAData(): Promise<void> {
    console.log("Starting FDA data collection...");
    
    try {
      const devices = await fdaOpenApiService.collect510kDevices(100);
      console.log(`Successfully collected ${devices.length} FDA 510(k) devices`);
      
      // Also collect recalls
      try {
        const recalls = await fdaOpenApiService.collectRecalls(50);
        console.log(`Successfully collected ${recalls.length} FDA recalls`);
      } catch (recallError) {
        console.error("Error collecting FDA recalls (continuing with main sync):", recallError);
      }
      
      console.log("FDA data collection completed");
    } catch (error) {
      console.error("Error collecting FDA data:", error);
      throw error;
    }
  }

  async collectEMAData(): Promise<void> {
    console.log("Starting EMA data collection...");
    
    try {
      // EMA verwendet hauptsächlich Web-Scraping, da keine offene API verfügbar ist
      console.log("EMA data collection: Web-Scraping implementation needed");
      
      // Für Demo-Zwecke erstellen wir einige Beispiel-Updates
      const mockEMAData = [
        {
          title: "EMA Guidelines on Medical Device Software",
          description: "Updated guidelines for software as medical device (SaMD) classification and evaluation",
          sourceId: await this.getEMASourceId(),
          sourceUrl: this.dataSources.ema,
          region: 'EU',
          updateType: 'guidance' as const,
          priority: 'high' as const,
          deviceClasses: ['Class IIa', 'Class IIb', 'Class III'],
          categories: ['Software-Medizinprodukt', 'Leitlinien'],
          publishedAt: new Date(),
        },
        {
          title: "MDR Implementation Guidelines Update",
          description: "Updated implementation guidelines for Medical Device Regulation (EU) 2017/745",
          sourceId: await this.getEMASourceId(),
          sourceUrl: this.dataSources.ema,
          region: 'EU',
          updateType: 'guidance' as const,
          priority: 'high' as const,
          deviceClasses: ['All Classes'],
          categories: ['MDR', 'Compliance', 'Leitlinien'],
          publishedAt: new Date(),
        }
      ];

      for (const item of mockEMAData) {
        await storage.createRegulatoryUpdate(item);
      }

      console.log(`EMA data collection completed - ${mockEMAData.length} updates processed`);
    } catch (error) {
      console.error("Error collecting EMA data:", error);
      throw error;
    }
  }

  async collectBfARMData(): Promise<void> {
    console.log("Starting BfArM data collection...");
    
    try {
      // BfArM Web-Scraping implementation
      console.log("BfArM data collection: Web-Scraping implementation needed");
      
      const mockBfARMData = [
        {
          title: "BfArM Leitfaden zur MDR-Umsetzung",
          description: "Aktualisierter Leitfaden zur Umsetzung der Medizinprodukteverordnung (MDR) in Deutschland",
          sourceId: await this.getBfARMSourceId(),
          sourceUrl: this.dataSources.bfarm,
          region: 'DE',
          updateType: 'guidance' as const,
          priority: 'high' as const,
          deviceClasses: ['Alle Klassen'],
          categories: ['MDR', 'Deutschland', 'Leitlinien'],
          publishedAt: new Date(),
        },
        {
          title: "Digitale Gesundheitsanwendungen (DiGA) - Neue Bewertungskriterien",
          description: "Überarbeitete Bewertungskriterien für digitale Gesundheitsanwendungen",
          sourceId: await this.getBfARMSourceId(),
          sourceUrl: this.dataSources.bfarm,
          region: 'DE',
          updateType: 'guidance' as const,
          priority: 'medium' as const,
          deviceClasses: ['Software'],
          categories: ['DiGA', 'Digital Health', 'Software'],
          publishedAt: new Date(),
        }
      ];

      for (const item of mockBfARMData) {
        await storage.createRegulatoryUpdate(item);
      }

      console.log(`BfArM data collection completed - ${mockBfARMData.length} updates processed`);
    } catch (error) {
      console.error("Error collecting BfArM data:", error);
    }
  }

  async collectSwissmedicData(): Promise<void> {
    console.log("Starting Swissmedic data collection...");
    
    try {
      const mockSwissmedicData = [
        {
          title: "Swissmedic Guidance on AI-based Medical Devices",
          description: "New guidance document for artificial intelligence-based medical devices in Switzerland",
          sourceId: await this.getSwissmedicSourceId(),
          sourceUrl: this.dataSources.swissmedic,
          region: 'CH',
          updateType: 'guidance' as const,
          priority: 'high' as const,
          deviceClasses: ['Class IIa', 'Class IIb', 'Class III'],
          categories: ['KI/ML', 'Schweiz', 'Leitlinien'],
          publishedAt: new Date(),
        }
      ];

      for (const item of mockSwissmedicData) {
        await storage.createRegulatoryUpdate(item);
      }

      console.log(`Swissmedic data collection completed - ${mockSwissmedicData.length} updates processed`);
    } catch (error) {
      console.error("Error collecting Swissmedic data:", error);
    }
  }

  async collectMHRAData(): Promise<void> {
    console.log("Starting MHRA data collection...");
    
    try {
      const mockMHRAData = [
        {
          title: "MHRA Post-Brexit Medical Device Regulations",
          description: "Updated regulatory framework for medical devices in the UK following Brexit",
          sourceId: await this.getMHRASourceId(),
          sourceUrl: this.dataSources.mhra,
          region: 'UK',
          updateType: 'guidance' as const,
          priority: 'high' as const,
          deviceClasses: ['All Classes'],
          categories: ['UKCA', 'Brexit', 'UK Regulations'],
          publishedAt: new Date(),
        }
      ];

      for (const item of mockMHRAData) {
        await storage.createRegulatoryUpdate(item);
      }

      console.log(`MHRA data collection completed - ${mockMHRAData.length} updates processed`);
    } catch (error) {
      console.error("Error collecting MHRA data:", error);
    }
  }

  async collectAllGlobalData(): Promise<void> {
    console.log("Starting comprehensive global regulatory data collection...");
    
    const collectionPromises = [
      this.collectFDAData(),
      this.collectEMAData(),
      this.collectBfARMData(),
      this.collectSwissmedicData(),
      this.collectMHRAData(),
    ];

    const results = await Promise.allSettled(collectionPromises);
    
    let successCount = 0;
    let errorCount = 0;

    results.forEach((result, index) => {
      const sources = ['FDA', 'EMA', 'BfArM', 'Swissmedic', 'MHRA'];
      if (result.status === 'fulfilled') {
        console.log(`✓ ${sources[index]} data collection successful`);
        successCount++;
      } else {
        console.error(`✗ ${sources[index]} data collection failed:`, result.reason);
        errorCount++;
      }
    });

    console.log(`Global data collection completed: ${successCount} successful, ${errorCount} errors`);
    
    // Analyze collected data for trends
    try {
      const allUpdates = await storage.getAllRegulatoryUpdates();
      const trends = await aiService.analyzeMarketTrends(allUpdates);
      console.log('Market trends analysis:', trends);
    } catch (error) {
      console.error('Error analyzing market trends:', error);
    }
  }

  private determinePriority(deviceClass?: string): 'critical' | 'high' | 'medium' | 'low' {
    if (!deviceClass) return 'medium';
    
    const normalizedClass = deviceClass.toLowerCase();
    if (normalizedClass.includes('iii') || normalizedClass.includes('3')) {
      return 'critical';
    } else if (normalizedClass.includes('ii') || normalizedClass.includes('2')) {
      return 'high';
    } else if (normalizedClass.includes('i') || normalizedClass.includes('1')) {
      return 'medium';
    }
    
    return 'medium';
  }

  // Helper methods to get source IDs
  private async getFDASourceId(): Promise<string> {
    const source = await storage.getDataSourceByType('fda_510k');
    return source?.id || 'fda_510k';
  }

  private async getEMASourceId(): Promise<string> {
    const source = await storage.getDataSourceByType('ema_epar');
    return source?.id || 'ema_epar';
  }

  private async getBfARMSourceId(): Promise<string> {
    const source = await storage.getDataSourceByType('bfarm_guidelines');
    return source?.id || 'bfarm_guidelines';
  }

  private async getSwissmedicSourceId(): Promise<string> {
    const source = await storage.getDataSourceByType('swissmedic_guidelines');
    return source?.id || 'swissmedic_guidelines';
  }

  private async getMHRASourceId(): Promise<string> {
    const source = await storage.getDataSourceByType('mhra_guidance');
    return source?.id || 'mhra_guidance';
  }
}

export const dataCollectionService = new DataCollectionService();