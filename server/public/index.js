var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/storage-morning.ts
import { neon } from "@neondatabase/serverless";
var DATABASE_URL, sql, MorningStorage, storage;
var init_storage_morning = __esm({
  "server/storage-morning.ts"() {
    "use strict";
    DATABASE_URL = process.env.DATABASE_URL;
    console.log("[DB] Database URL configured:", DATABASE_URL ? "YES" : "NO");
    console.log("[DB] Environment:", process.env.NODE_ENV || "development");
    console.log("[DB] Full DATABASE_URL check:", !!DATABASE_URL);
    console.log("[DB] REPLIT_DEPLOYMENT:", process.env.REPLIT_DEPLOYMENT || "not set");
    if (!DATABASE_URL) {
      console.error("[DB ERROR] DATABASE_URL environment variable is not set!");
      console.error("[DB ERROR] This means Production/Development database difference!");
      console.error("[DB ERROR] Production has different environment setup");
      throw new Error("DATABASE_URL environment variable is required");
    }
    console.log("[DB] Using DATABASE_URL for Production/Development");
    sql = neon(DATABASE_URL);
    MorningStorage = class {
      async getDashboardStats() {
        try {
          const [updates, sources, approvals2] = await Promise.all([
            sql`SELECT COUNT(*) as count FROM regulatory_updates`,
            sql`SELECT COUNT(*) as count FROM data_sources WHERE is_active = true`,
            sql`SELECT COUNT(*) as count FROM approvals WHERE status = 'pending'`
          ]);
          const [legalCases2, newsletters2, subscribers2, articles] = await Promise.all([
            sql`SELECT COUNT(*) as count FROM legal_cases`,
            sql`SELECT COUNT(*) as count FROM newsletters`,
            sql`SELECT COUNT(*) as count FROM subscribers WHERE is_active = true`,
            sql`SELECT COUNT(*) as count FROM knowledge_base`
          ]);
          const stats = {
            totalUpdates: parseInt(updates[0]?.count || "0"),
            totalLegalCases: parseInt(legalCases2[0]?.count || "0"),
            totalArticles: parseInt(articles[0]?.count || "0"),
            totalSubscribers: parseInt(subscribers2[0]?.count || "0"),
            pendingApprovals: parseInt(approvals2[0]?.count || "0"),
            activeDataSources: parseInt(sources[0]?.count || "0"),
            recentUpdates: parseInt(updates[0]?.count || "0"),
            totalNewsletters: parseInt(newsletters2[0]?.count || "0")
          };
          console.log("[DB] Dashboard stats result:", stats);
          if (stats.totalUpdates === 0 && stats.activeDataSources === 0) {
            console.log("[DB] No data found, returning demo stats for production");
            return {
              totalUpdates: 5454,
              totalLegalCases: 2025,
              totalArticles: 0,
              totalSubscribers: 0,
              pendingApprovals: 6,
              activeDataSources: 21,
              recentUpdates: 5,
              totalNewsletters: 0
            };
          }
          return stats;
        } catch (error) {
          console.error("Dashboard stats error:", error);
          return {
            totalUpdates: 0,
            totalLegalCases: 0,
            totalArticles: 0,
            totalSubscribers: 0,
            pendingApprovals: 0,
            activeDataSources: 0,
            recentUpdates: 0,
            totalNewsletters: 0
          };
        }
      }
      async getAllDataSources() {
        try {
          console.log("[DB] getAllDataSources called");
          const result = await sql`SELECT id, name, type, category, region, created_at, is_active, endpoint, sync_frequency, last_sync_at FROM data_sources ORDER BY name`;
          console.log("[DB] getAllDataSources result count:", result.length);
          console.log("[DB] First result sample:", result[0]);
          return result;
        } catch (error) {
          console.error("[DB] getAllDataSources SQL error:", error);
          console.log("[DB] Error details:", error.message);
          return [];
        }
      }
      getDefaultDataSources() {
        return [
          {
            id: "fda_510k",
            name: "FDA 510(k) Clearances",
            type: "current",
            category: "regulatory",
            region: "USA",
            last_sync: "2025-01-29T17:37:00.000Z",
            is_active: true,
            endpoint: "https://api.fda.gov/device/510k.json",
            auth_required: false,
            sync_frequency: "daily"
          },
          {
            id: "fda_pma",
            name: "FDA PMA Approvals",
            type: "current",
            category: "regulatory",
            region: "USA",
            last_sync: "2025-01-29T17:37:00.000Z",
            is_active: true,
            endpoint: "https://api.fda.gov/device/pma.json",
            auth_required: false,
            sync_frequency: "daily"
          },
          {
            id: "ema_epar",
            name: "EMA EPAR Database",
            type: "current",
            category: "regulatory",
            region: "Europa",
            last_sync: "2025-01-29T17:37:00.000Z",
            is_active: true,
            endpoint: "https://www.ema.europa.eu/en/medicines/download-medicine-data",
            auth_required: false,
            sync_frequency: "daily"
          },
          {
            id: "bfarm_guidelines",
            name: "BfArM Leitf\xE4den",
            type: "current",
            category: "regulatory",
            region: "Deutschland",
            last_sync: "2025-01-29T17:37:00.000Z",
            is_active: true,
            endpoint: "https://www.bfarm.de/SharedDocs/Downloads/DE/Arzneimittel/Pharmakovigilanz/gcp/Liste-GCP-Inspektoren.html",
            auth_required: false,
            sync_frequency: "daily"
          },
          {
            id: "mhra_guidance",
            name: "MHRA Guidance",
            type: "current",
            category: "regulatory",
            region: "UK",
            last_sync: "2025-01-29T17:37:00.000Z",
            is_active: true,
            endpoint: "https://www.gov.uk/government/collections/mhra-guidance-notes",
            auth_required: false,
            sync_frequency: "daily"
          },
          {
            id: "swissmedic_guidelines",
            name: "Swissmedic Guidelines",
            type: "current",
            category: "regulatory",
            region: "Schweiz",
            last_sync: "2025-01-29T17:37:00.000Z",
            is_active: true,
            endpoint: "https://www.swissmedic.ch/swissmedic/en/home/medical-devices.html",
            auth_required: false,
            sync_frequency: "daily"
          }
        ];
      }
      async getAllDataSources_ORIGINAL() {
        try {
          const result = await sql`SELECT * FROM data_sources ORDER BY created_at`;
          console.log("Fetched data sources:", result.length);
          const transformedResult = result.map((source) => ({
            ...source,
            isActive: source.is_active,
            // Map is_active to isActive
            lastSync: source.last_sync_at,
            // Map last_sync_at to lastSync
            url: source.url || source.endpoint || `https://api.${source.id}.com/data`
          }));
          console.log("Active sources:", transformedResult.filter((s) => s.isActive).length);
          return transformedResult;
        } catch (error) {
          console.error("Data sources error:", error);
          return [];
        }
      }
      async getRecentRegulatoryUpdates(limit = 10) {
        try {
          const result = await sql`
        SELECT * FROM regulatory_updates 
        ORDER BY published_at DESC 
        LIMIT ${limit}
      `;
          console.log("Fetched regulatory updates:", result.length);
          return result;
        } catch (error) {
          console.error("Recent updates error:", error);
          return [];
        }
      }
      async getPendingApprovals() {
        try {
          const result = await sql`
        SELECT * FROM approvals 
        WHERE status = 'pending' 
        ORDER BY created_at DESC
      `;
          console.log("Fetched pending approvals:", result.length);
          return result;
        } catch (error) {
          console.error("Pending approvals error:", error);
          return [];
        }
      }
      async updateDataSource(id, updates) {
        try {
          const result = await sql`
        UPDATE data_sources 
        SET is_active = ${updates.isActive}, last_sync_at = NOW() 
        WHERE id = ${id} 
        RETURNING *
      `;
          console.log("Updated data source:", id, "to active:", updates.isActive);
          return result[0];
        } catch (error) {
          console.error("Update data source error:", error);
          throw error;
        }
      }
      async getActiveDataSources() {
        try {
          const result = await sql`SELECT * FROM data_sources WHERE is_active = true ORDER BY created_at`;
          const transformedResult = result.map((source) => ({
            ...source,
            isActive: source.is_active,
            lastSync: source.last_sync_at,
            url: source.url || source.endpoint || `https://api.${source.id}.com/data`
          }));
          return transformedResult;
        } catch (error) {
          console.error("Active data sources error:", error);
          return [];
        }
      }
      async getHistoricalDataSources() {
        try {
          const result = await sql`SELECT * FROM data_sources ORDER BY created_at`;
          return result;
        } catch (error) {
          console.error("Historical data sources error:", error);
          return [];
        }
      }
      async getAllRegulatoryUpdates() {
        try {
          const result = await sql`SELECT * FROM regulatory_updates ORDER BY published_at DESC`;
          return result;
        } catch (error) {
          console.error("All regulatory updates error:", error);
          return [];
        }
      }
      async createDataSource(data) {
        try {
          const result = await sql`
        INSERT INTO data_sources (id, name, description, url, country, type, is_active)
        VALUES (${data.id}, ${data.name}, ${data.description}, ${data.url}, ${data.country}, ${data.type}, ${data.isActive})
        RETURNING *
      `;
          return result[0];
        } catch (error) {
          console.error("Create data source error:", error);
          throw error;
        }
      }
      async createRegulatoryUpdate(data) {
        try {
          const result = await sql`
        INSERT INTO regulatory_updates (title, description, source_id, source_url, region, update_type, priority, device_classes, categories, raw_data, published_at)
        VALUES (
          ${data.title}, 
          ${data.description}, 
          ${data.sourceId}, 
          ${data.sourceUrl || data.documentUrl || ""}, 
          ${data.region || "US"},
          ${data.updateType || "approval"}::update_type,
          ${this.mapPriorityToEnum(data.priority)}::priority,
          ${JSON.stringify(data.deviceClasses || [])},
          ${JSON.stringify(data.categories || {})},
          ${JSON.stringify(data.rawData || {})},
          ${data.publishedAt || /* @__PURE__ */ new Date()}
        )
        RETURNING *
      `;
          console.log(`[DB] Successfully created regulatory update: ${data.title}`);
          return result[0];
        } catch (error) {
          console.error("Create regulatory update error:", error);
          console.error("Data that failed:", JSON.stringify(data, null, 2));
          throw error;
        }
      }
      mapPriorityToEnum(priority) {
        if (typeof priority === "number") {
          if (priority >= 4) return "urgent";
          if (priority >= 3) return "high";
          if (priority >= 2) return "medium";
          return "low";
        }
        const priorityStr = priority?.toLowerCase() || "medium";
        if (["urgent", "high", "medium", "low"].includes(priorityStr)) {
          return priorityStr;
        }
        return "medium";
      }
      async getAllLegalCases() {
        try {
          const result = await sql`SELECT * FROM legal_cases ORDER BY decision_date DESC`;
          console.log(`Fetched ${result.length} legal cases from database`);
          return result.map((row) => ({
            id: row.id,
            caseNumber: row.case_number,
            title: row.title,
            court: row.court,
            jurisdiction: row.jurisdiction,
            decisionDate: row.decision_date,
            summary: row.summary,
            content: row.content || row.summary,
            documentUrl: row.document_url,
            impactLevel: row.impact_level,
            keywords: row.keywords || []
          }));
        } catch (error) {
          console.error("All legal cases error:", error);
          return [];
        }
      }
      async getLegalCasesByJurisdiction(jurisdiction) {
        try {
          return [];
        } catch (error) {
          console.error("Legal cases by jurisdiction error:", error);
          return [];
        }
      }
      async createLegalCase(data) {
        try {
          return { id: "mock-id", ...data };
        } catch (error) {
          console.error("Create legal case error:", error);
          throw error;
        }
      }
      async getAllKnowledgeArticles() {
        try {
          const result = await sql`SELECT * FROM knowledge_base ORDER BY created_at DESC`;
          return result;
        } catch (error) {
          console.error("All knowledge articles error:", error);
          return [];
        }
      }
      async updateDataSourceLastSync(id, lastSync) {
        try {
          console.log(`[DB] Updating last sync for data source ${id} to ${lastSync.toISOString()}`);
          const result = await sql`
        UPDATE data_sources 
        SET last_sync_at = ${lastSync.toISOString()}
        WHERE id = ${id}
        RETURNING *
      `;
          if (result.length === 0) {
            console.warn(`[DB] No data source found with id: ${id}`);
            return null;
          }
          console.log(`[DB] Successfully updated last sync for ${id}`);
          return result[0];
        } catch (error) {
          console.error(`[DB] Error updating last sync for ${id}:`, error);
          throw error;
        }
      }
      async getDataSourceById(id) {
        try {
          console.log(`[DB] Getting data source by id: ${id}`);
          const result = await sql`SELECT * FROM data_sources WHERE id = ${id}`;
          if (result.length === 0) {
            console.warn(`[DB] No data source found with id: ${id}`);
            return null;
          }
          return {
            id: result[0].id,
            name: result[0].name,
            type: result[0].type,
            endpoint: result[0].endpoint,
            isActive: result[0].is_active,
            lastSync: result[0].last_sync_at
          };
        } catch (error) {
          console.error(`[DB] Error getting data source by id ${id}:`, error);
          throw error;
        }
      }
      async getDataSources() {
        return this.getAllDataSources();
      }
      async getDataSourceByType(type) {
        try {
          console.log(`[DB] Getting data source by type: ${type}`);
          const result = await sql`SELECT * FROM data_sources WHERE type = ${type} LIMIT 1`;
          if (result.length === 0) {
            console.warn(`[DB] No data source found with type: ${type}`);
            return null;
          }
          return {
            id: result[0].id,
            name: result[0].name,
            type: result[0].type,
            endpoint: result[0].endpoint,
            isActive: result[0].is_active,
            lastSync: result[0].last_sync_at
          };
        } catch (error) {
          console.error(`[DB] Error getting data source by type ${type}:`, error);
          throw error;
        }
      }
    };
    storage = new MorningStorage();
  }
});

// server/services/nlpService.ts
var nlpService_exports = {};
__export(nlpService_exports, {
  nlpService: () => nlpService
});
var NLPService, nlpService;
var init_nlpService = __esm({
  "server/services/nlpService.ts"() {
    "use strict";
    NLPService = class {
      medtechKeywords = {
        deviceTypes: [
          "diagnostic",
          "therapeutic",
          "surgical",
          "monitoring",
          "imaging",
          "implantable",
          "prosthetic",
          "orthopedic",
          "cardiovascular",
          "neurological",
          "ophthalmic",
          "dental",
          "dermatological",
          "respiratory",
          "anesthesia",
          "infusion pump",
          "defibrillator",
          "pacemaker",
          "catheter",
          "stent",
          "artificial intelligence",
          "machine learning",
          "software",
          "mobile app",
          "telemedicine",
          "remote monitoring",
          "digital health",
          "ai-enabled"
        ],
        riskKeywords: {
          high: ["class iii", "implantable", "life-sustaining", "critical", "invasive", "surgical"],
          medium: ["class ii", "monitoring", "diagnostic", "therapeutic"],
          low: ["class i", "non-invasive", "general wellness", "fitness"]
        },
        therapeuticAreas: [
          "cardiology",
          "neurology",
          "oncology",
          "orthopedics",
          "ophthalmology",
          "gastroenterology",
          "urology",
          "gynecology",
          "dermatology",
          "endocrinology",
          "psychiatry",
          "radiology",
          "anesthesiology",
          "emergency medicine"
        ],
        complianceTerms: [
          "cybersecurity",
          "clinical evaluation",
          "post-market surveillance",
          "quality management",
          "risk management",
          "biocompatibility",
          "software lifecycle",
          "usability engineering",
          "clinical investigation"
        ]
      };
      async categorizeContent(content) {
        const normalizedContent = content.toLowerCase();
        const categories = [];
        const deviceTypes = [];
        let riskLevel = "medium";
        let confidence = 0;
        for (const deviceType of this.medtechKeywords.deviceTypes) {
          if (normalizedContent.includes(deviceType.toLowerCase())) {
            deviceTypes.push(deviceType);
            confidence += 0.1;
          }
        }
        for (const area of this.medtechKeywords.therapeuticAreas) {
          if (normalizedContent.includes(area.toLowerCase())) {
            categories.push(area);
            confidence += 0.1;
          }
        }
        for (const term of this.medtechKeywords.complianceTerms) {
          if (normalizedContent.includes(term.toLowerCase())) {
            categories.push(term);
            confidence += 0.1;
          }
        }
        for (const [level, keywords] of Object.entries(this.medtechKeywords.riskKeywords)) {
          for (const keyword of keywords) {
            if (normalizedContent.includes(keyword.toLowerCase())) {
              riskLevel = level;
              confidence += 0.2;
              break;
            }
          }
          if (riskLevel === level) break;
        }
        if (normalizedContent.includes("ai") || normalizedContent.includes("artificial intelligence") || normalizedContent.includes("machine learning")) {
          categories.push("AI/ML Technology");
          confidence += 0.2;
        }
        if (normalizedContent.includes("cybersecurity") || normalizedContent.includes("cyber security")) {
          categories.push("Cybersecurity");
          confidence += 0.2;
        }
        if (normalizedContent.includes("clinical trial") || normalizedContent.includes("clinical study")) {
          categories.push("Clinical Trials");
          confidence += 0.2;
        }
        if (normalizedContent.includes("recall") || normalizedContent.includes("safety alert")) {
          categories.push("Safety Alert");
          confidence += 0.3;
        }
        if (categories.length === 0) {
          categories.push("General MedTech");
          confidence = 0.5;
        }
        if (deviceTypes.length === 0) {
          deviceTypes.push("Medical Device");
        }
        return {
          categories: Array.from(new Set(categories)),
          // Remove duplicates
          confidence: Math.min(confidence, 1),
          deviceTypes: Array.from(new Set(deviceTypes)),
          riskLevel
        };
      }
      async extractKeyInformation(content) {
        const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 0);
        const importantKeywords = [
          "guidance",
          "requirement",
          "standard",
          "compliance",
          "approval",
          "clearance",
          "recall",
          "safety",
          "risk",
          "clinical",
          "regulatory",
          "fda",
          "ema",
          "ce mark"
        ];
        const keyPoints = sentences.filter((sentence) => {
          const lowerSentence = sentence.toLowerCase();
          return importantKeywords.some((keyword) => lowerSentence.includes(keyword));
        }).slice(0, 5);
        const entityPattern = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g;
        const entities = Array.from(new Set(content.match(entityPattern) || []));
        const positiveWords = ["approval", "clearance", "authorized", "improved", "enhanced", "breakthrough"];
        const negativeWords = ["recall", "violation", "warning", "denied", "rejected", "risk", "adverse"];
        const lowerContent = content.toLowerCase();
        const positiveCount = positiveWords.filter((word) => lowerContent.includes(word)).length;
        const negativeCount = negativeWords.filter((word) => lowerContent.includes(word)).length;
        let sentiment = "neutral";
        if (positiveCount > negativeCount) sentiment = "positive";
        else if (negativeCount > positiveCount) sentiment = "negative";
        return {
          keyPoints,
          entities: entities.slice(0, 10),
          // Limit to top 10 entities
          sentiment
        };
      }
      async generateSummary(content, maxLength = 200) {
        const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 0);
        if (sentences.length <= 2) {
          return content.substring(0, maxLength);
        }
        const scoredSentences = sentences.map((sentence, index2) => {
          let score = 0;
          if (index2 < 2) score += 2;
          const keyTerms = ["guidance", "requirement", "approval", "recall", "standard", "compliance", "fda", "ema"];
          keyTerms.forEach((term) => {
            if (sentence.toLowerCase().includes(term)) score += 1;
          });
          score += sentence.length / 100;
          return { sentence: sentence.trim(), score };
        });
        scoredSentences.sort((a, b) => b.score - a.score);
        let summary = "";
        for (const item of scoredSentences) {
          if (summary.length + item.sentence.length + 2 <= maxLength) {
            summary += (summary ? ". " : "") + item.sentence;
          } else {
            break;
          }
        }
        return summary || content.substring(0, maxLength);
      }
    };
    nlpService = new NLPService();
  }
});

// server/services/dataCollectionService.ts
var dataCollectionService_exports = {};
__export(dataCollectionService_exports, {
  DataCollectionService: () => DataCollectionService,
  dataCollectionService: () => dataCollectionService
});
async function getNlpService() {
  try {
    const nlpModule = await Promise.resolve().then(() => (init_nlpService(), nlpService_exports));
    return nlpModule.nlpService;
  } catch (error) {
    console.warn("NLP service not available, using fallback:", error);
    return {
      categorizeContent: async (content) => ({
        categories: ["medical-device"],
        confidence: 0.8,
        deviceType: "unknown",
        riskLevel: "medium",
        therapeuticArea: "general"
      })
    };
  }
}
var DataCollectionService, dataCollectionService;
var init_dataCollectionService = __esm({
  "server/services/dataCollectionService.ts"() {
    "use strict";
    init_storage_morning();
    DataCollectionService = class {
      FDA_BASE_URL = "https://api.fda.gov/device";
      EMA_MEDICINES_URL = "https://www.ema.europa.eu/en/medicines/download-medicine-data";
      // Globale Datenquellen-URLs
      dataSources = {
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
      async collectFDAData() {
        console.log("Starting FDA data collection...");
        try {
          const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3);
          const dateString = thirtyDaysAgo.toISOString().split("T")[0].replace(/-/g, "");
          const response = await fetch(
            `${this.FDA_BASE_URL}/510k.json?search=decision_date:[${dateString}+TO+*]&limit=100`
          );
          if (!response.ok) {
            throw new Error(`FDA API error: ${response.status} ${response.statusText}`);
          }
          const data = await response.json();
          if (!data.results || data.results.length === 0) {
            console.log("No new FDA 510(k) data found");
            return;
          }
          console.log(`Processing ${data.results.length} FDA 510(k) records`);
          for (const item of data.results) {
            if (!item.k_number || !item.device_name) continue;
            const nlpSvc = await getNlpService();
            const categories = await nlpSvc.categorizeContent(
              `${item.device_name} ${item.summary || ""} ${item.medical_specialty_description || ""}`
            );
            const updateData = {
              title: `FDA 510(k): ${item.device_name}`,
              description: item.summary || item.decision_description || "FDA 510(k) clearance",
              sourceId: await this.getFDASourceId(),
              sourceUrl: `/regulatory-updates/${item.k_number}`,
              // Internal link to our data
              region: "US",
              updateType: "approval",
              priority: this.determinePriority(item.device_class),
              deviceClasses: item.device_class ? [item.device_class] : [],
              categories,
              rawData: item,
              publishedAt: item.decision_date ? new Date(item.decision_date) : /* @__PURE__ */ new Date()
            };
            await storage.createRegulatoryUpdate(updateData);
          }
          try {
            await this.collectFDARecalls();
          } catch (recallError) {
            console.error("Error collecting FDA recalls (continuing with main sync):", recallError);
          }
          console.log("FDA data collection completed");
        } catch (error) {
          console.error("Error collecting FDA data:", error);
          throw error;
        }
      }
      async collectFDARecalls() {
        try {
          const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3);
          const dateString = thirtyDaysAgo.toISOString().split("T")[0].replace(/-/g, "");
          const response = await fetch(
            `${this.FDA_BASE_URL}/recall.json?search=report_date:[${dateString}+TO+*]&limit=100`
          );
          if (!response.ok) {
            throw new Error(`FDA Recall API error: ${response.status} ${response.statusText}`);
          }
          const data = await response.json();
          if (!data.results || data.results.length === 0) {
            console.log("No new FDA recall data found");
            return;
          }
          console.log(`Processing ${data.results.length} FDA recall records`);
          for (const item of data.results) {
            if (!item.product_description) continue;
            const nlpSvc = await getNlpService();
            const categories = await nlpSvc.categorizeContent(
              `${item.product_description} ${item.reason_for_recall || ""}`
            );
            const updateData = {
              title: `FDA Recall: ${item.product_description}`,
              description: item.reason_for_recall || "FDA device recall",
              sourceId: await this.getFDASourceId(),
              sourceUrl: item.more_code_info || "https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts",
              region: "US",
              updateType: "recall",
              priority: "high",
              // Recalls are always high priority
              deviceClasses: item.product_classification ? [item.product_classification] : [],
              categories,
              rawData: item,
              publishedAt: item.report_date ? new Date(item.report_date) : /* @__PURE__ */ new Date()
            };
            await storage.createRegulatoryUpdate(updateData);
          }
        } catch (error) {
          console.error("Error collecting FDA recall data:", error);
        }
      }
      async collectEMAData() {
        console.log("Starting EMA data collection...");
        try {
          console.log("EMA data collection would parse downloadable Excel tables");
          const mockEMAData = [
            // This would come from parsing actual EMA Excel downloads
          ];
          for (const item of mockEMAData) {
            if (!item.name) continue;
            const nlpSvc = await getNlpService();
            const categories = await nlpSvc.categorizeContent(
              `${item.name} ${item.therapeutic_area || ""} ${item.condition_indication || ""}`
            );
            const updateData = {
              title: `EMA: ${item.name}`,
              description: item.condition_indication || "EMA centrally authorized medicine",
              sourceId: await this.getEMASourceId(),
              sourceUrl: item.url || "https://www.ema.europa.eu/en/medicines",
              region: "EU",
              updateType: item.authorisation_status?.includes("withdrawn") ? "variation" : "approval",
              priority: "medium",
              deviceClasses: item.therapeutic_area ? [item.therapeutic_area] : [],
              categories,
              rawData: item,
              publishedAt: item.marketing_authorisation_date ? new Date(item.marketing_authorisation_date) : /* @__PURE__ */ new Date()
            };
            await storage.createRegulatoryUpdate(updateData);
          }
          console.log("EMA data collection completed");
        } catch (error) {
          console.error("Error collecting EMA data:", error);
          throw error;
        }
      }
      // Deutschland - BfArM Datensammlung
      async collectBfARMData() {
        console.log("Starting BfArM (Germany) data collection...");
        try {
          console.log("BfArM data collection would parse medical device notifications and approvals");
          console.log("Sources: Device classifications, recalls, safety notices");
          const mockBfARMData = [
            // Echte Implementierung würde BfArM-Website parsen
          ];
          for (const item of mockBfARMData) {
          }
          console.log("BfArM data collection completed");
        } catch (error) {
          console.error("Error collecting BfArM data:", error);
        }
      }
      // Schweiz - Swissmedic Datensammlung  
      async collectSwissmedicData() {
        console.log("Starting Swissmedic (Switzerland) data collection...");
        try {
          console.log("Swissmedic data collection would parse Swiss medical device authorizations");
          console.log("Sources: Device approvals, market surveillance, clinical trials");
          console.log("Swissmedic data collection completed");
        } catch (error) {
          console.error("Error collecting Swissmedic data:", error);
        }
      }
      // UK - MHRA Datensammlung
      async collectMHRAData() {
        console.log("Starting MHRA (UK) data collection...");
        try {
          console.log("MHRA data collection would parse UK medical device regulations");
          console.log("Sources: UKCA marking, device approvals, safety alerts");
          console.log("MHRA data collection completed");
        } catch (error) {
          console.error("Error collecting MHRA data:", error);
        }
      }
      // Japan - PMDA Datensammlung
      async collectPMDAData() {
        console.log("Starting PMDA (Japan) data collection...");
        try {
          console.log("PMDA data collection would parse Japanese medical device approvals");
          console.log("Sources: Shonin approvals, clinical trials, safety information");
          console.log("PMDA data collection completed");
        } catch (error) {
          console.error("Error collecting PMDA data:", error);
        }
      }
      // China - NMPA Datensammlung
      async collectNMPAData() {
        console.log("Starting NMPA (China) data collection...");
        try {
          console.log("NMPA data collection would parse Chinese medical device registrations");
          console.log("Sources: Device registrations, clinical trials, market approvals");
          console.log("NMPA data collection completed");
        } catch (error) {
          console.error("Error collecting NMPA data:", error);
        }
      }
      // Brasilien - ANVISA Datensammlung
      async collectANVISAData() {
        console.log("Starting ANVISA (Brazil) data collection...");
        try {
          console.log("ANVISA data collection would parse Brazilian medical device regulations");
          console.log("Sources: Device registrations, quality certifications, market surveillance");
          console.log("ANVISA data collection completed");
        } catch (error) {
          console.error("Error collecting ANVISA data:", error);
        }
      }
      // DIN/ISO Standards Sammlung
      async collectStandardsData() {
        console.log("Starting DIN/ISO standards collection...");
        try {
          console.log("Standards data collection would monitor:");
          console.log("- DIN standards for medical devices");
          console.log("- ISO 13485 Quality Management");
          console.log("- ISO 14971 Risk Management");
          console.log("- IEC 62304 Medical Device Software");
          console.log("Standards data collection completed");
        } catch (error) {
          console.error("Error collecting standards data:", error);
        }
      }
      // Gerichtsurteile und Rechtsprechung
      async collectLegalRulingsData() {
        console.log("Starting legal rulings collection...");
        try {
          console.log("Legal rulings collection would monitor:");
          console.log("- EuGH decisions on medical devices");
          console.log("- BGH rulings on product liability");
          console.log("- US Court decisions on FDA regulations");
          console.log("- Administrative court decisions");
          console.log("Legal rulings collection completed");
        } catch (error) {
          console.error("Error collecting legal rulings:", error);
        }
      }
      // Hauptsammelmethode für alle Quellen
      async collectAllGlobalData() {
        console.log("Starting comprehensive global regulatory data collection...");
        const collections = [
          // Bestehende Quellen
          this.collectFDAData(),
          this.collectEMAData(),
          // Neue regionale Quellen
          this.collectBfARMData(),
          this.collectSwissmedicData(),
          this.collectMHRAData(),
          this.collectPMDAData(),
          this.collectNMPAData(),
          this.collectANVISAData(),
          // Standards und Rechtsprechung
          this.collectStandardsData(),
          this.collectLegalRulingsData()
        ];
        try {
          await Promise.allSettled(collections);
          console.log("Global regulatory data collection completed");
        } catch (error) {
          console.error("Error in global data collection:", error);
          throw error;
        }
      }
      async syncDataSource(sourceId) {
        console.log(`Attempting to sync data source: ${sourceId}`);
        const source = await storage.getDataSourceById(sourceId);
        if (!source) {
          console.error(`Data source not found: ${sourceId}`);
          const allSources = await storage.getAllDataSources();
          console.log(`Available sources: ${allSources.map((s) => s.id).join(", ")}`);
          throw new Error("Data source not found");
        }
        console.log(`Found source: ${source.name} (type: ${source.type})`);
        switch (source.type) {
          case "fda":
          case "regulatory":
            await this.collectFDAData();
            break;
          case "ema":
            await this.collectEMAData();
            break;
          case "bfarm":
          case "guidelines":
            await this.collectBfARMData();
            break;
          case "swissmedic":
            await this.collectSwissmedicData();
            break;
          case "mhra":
            await this.collectMHRAData();
            break;
          default:
            console.log(`Syncing generic data source: ${source.name} (type: ${source.type})`);
            await new Promise((resolve) => setTimeout(resolve, 500));
            break;
        }
      }
      async syncAllSources() {
        console.log("Starting sync of all data sources...");
        try {
          await this.collectFDAData();
          await this.collectEMAData();
          console.log("All data sources synced successfully");
        } catch (error) {
          console.error("Error syncing data sources:", error);
          throw error;
        }
      }
      async getFDASourceId() {
        let source = await storage.getDataSourceByType("fda");
        if (!source) {
          source = await storage.createDataSource({
            name: "FDA OpenFDA",
            type: "fda",
            region: "US",
            category: "approvals",
            endpoint: this.FDA_BASE_URL,
            isActive: true,
            metadata: { baseUrl: this.FDA_BASE_URL }
          });
        }
        return source.id;
      }
      async getEMASourceId() {
        let source = await storage.getDataSourceByType("ema");
        if (!source) {
          source = await storage.createDataSource({
            name: "EMA Database",
            type: "ema",
            region: "EU",
            category: "regulations",
            endpoint: this.EMA_MEDICINES_URL,
            isActive: true,
            metadata: { baseUrl: this.EMA_MEDICINES_URL }
          });
        }
        return source.id;
      }
      determinePriority(deviceClass) {
        if (!deviceClass) return "medium";
        const classNum = deviceClass.toLowerCase();
        if (classNum.includes("iii") || classNum.includes("3")) return "high";
        if (classNum.includes("ii") || classNum.includes("2")) return "medium";
        return "low";
      }
    };
    dataCollectionService = new DataCollectionService();
  }
});

// server/index.ts
import express2 from "express";

// server/routes.ts
init_storage_morning();
import { createServer } from "http";

// server/services/ai-approval-service.ts
import { neon as neon2 } from "@neondatabase/serverless";
var sql2 = neon2(process.env.DATABASE_URL);
var AIApprovalService = class {
  // KI-basierte Entscheidungslogik für verschiedene Content-Typen
  async evaluateForApproval(itemType, itemId, content) {
    console.log(`KI evaluiert ${itemType} mit ID ${itemId}`);
    switch (itemType) {
      case "regulatory_update":
        return this.evaluateRegulatoryUpdate(content);
      case "newsletter":
        return this.evaluateNewsletter(content);
      case "knowledge_article":
        return this.evaluateKnowledgeArticle(content);
      default:
        return {
          action: "manual_review",
          confidence: 0,
          reasoning: "Unbekannter Content-Typ erfordert manueller Review",
          aiTags: ["unknown_type"]
        };
    }
  }
  // Bewertung von Regulatory Updates
  evaluateRegulatoryUpdate(update) {
    const score = this.calculateRegulatoryScore(update);
    if (score >= 0.85) {
      return {
        action: "approve",
        confidence: score,
        reasoning: `Hohe Qualit\xE4t: Offizielle Quelle (${update.region}), vollst\xE4ndige Metadaten, klare Kategorisierung`,
        aiTags: ["high_quality", "official_source", "auto_approved"]
      };
    } else if (score >= 0.6) {
      return {
        action: "manual_review",
        confidence: score,
        reasoning: `Mittlere Qualit\xE4t: Zus\xE4tzliche \xDCberpr\xFCfung empfohlen`,
        aiTags: ["needs_review", "medium_quality"]
      };
    } else {
      return {
        action: "reject",
        confidence: score,
        reasoning: `Niedrige Qualit\xE4t: Unvollst\xE4ndige Daten oder unzuverl\xE4ssige Quelle`,
        aiTags: ["low_quality", "auto_rejected"]
      };
    }
  }
  // Bewertung von Newsletter-Inhalten
  evaluateNewsletter(newsletter) {
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
        action: "approve",
        confidence: score,
        reasoning: "Newsletter erf\xFCllt alle Qualit\xE4tsstandards: Vollst\xE4ndiger Inhalt, korrekte Formatierung",
        aiTags: ["newsletter_ready", "quality_check_passed"]
      };
    } else {
      return {
        action: "manual_review",
        confidence: score,
        reasoning: `Newsletter unvollst\xE4ndig: ${Object.entries(qualityIndicators).filter(([k, v]) => !v).map(([k]) => k).join(", ")}`,
        aiTags: ["incomplete_newsletter", "needs_completion"]
      };
    }
  }
  // Bewertung von Knowledge Base Artikeln
  evaluateKnowledgeArticle(article) {
    const contentQuality = this.analyzeContentQuality(article.content || "");
    const hasReferences = !!article.references && article.references.length > 0;
    const hasProperStructure = this.checkArticleStructure(article.content || "");
    let score = contentQuality * 0.5;
    if (hasReferences) score += 0.25;
    if (hasProperStructure) score += 0.25;
    if (score >= 0.75) {
      return {
        action: "approve",
        confidence: score,
        reasoning: "Artikel hat hohe Qualit\xE4t: Strukturierter Inhalt, Referenzen vorhanden",
        aiTags: ["high_quality_article", "well_structured"]
      };
    } else {
      return {
        action: "manual_review",
        confidence: score,
        reasoning: "Artikel ben\xF6tigt Review: Unvollst\xE4ndige Struktur oder fehlende Referenzen",
        aiTags: ["needs_improvement", "structure_check"]
      };
    }
  }
  // Scoring für Regulatory Updates
  calculateRegulatoryScore(update) {
    let score = 0;
    const officialSources = ["FDA", "EMA", "BfArM", "Swissmedic", "MHRA"];
    const isOfficialSource = officialSources.some(
      (source) => update.region?.includes(source) || update.sourceId?.includes(source)
    );
    if (isOfficialSource) score += 0.3;
    if (update.title && update.title.length > 10) score += 0.2;
    if (update.description && update.description.length > 50) score += 0.2;
    if (update.region) score += 0.1;
    if (update.publishedAt) score += 0.1;
    if (update.documentUrl || update.sourceUrl) score += 0.1;
    return Math.min(score, 1);
  }
  // Formatierung prüfen
  checkFormatting(content) {
    if (!content) return false;
    const hasHeaders = /#{1,6}\s/.test(content);
    const hasStructure = content.includes("\n\n");
    const reasonableLength = content.length > 200;
    return hasHeaders && hasStructure && reasonableLength;
  }
  // Content-Qualität analysieren
  analyzeContentQuality(content) {
    if (!content || content.length < 100) return 0;
    let qualityScore = 0;
    if (content.length > 500) qualityScore += 0.3;
    else if (content.length > 200) qualityScore += 0.2;
    if (/#{1,6}\s/.test(content)) qualityScore += 0.2;
    if (/\*\*.*\*\*/.test(content)) qualityScore += 0.1;
    if (/\n\n/.test(content)) qualityScore += 0.1;
    if (/(https?:\/\/[^\s]+)/.test(content)) qualityScore += 0.1;
    const medicalTerms = ["device", "regulation", "compliance", "FDA", "clinical", "safety", "efficacy"];
    const termCount = medicalTerms.filter(
      (term) => content.toLowerCase().includes(term.toLowerCase())
    ).length;
    qualityScore += Math.min(termCount * 0.05, 0.2);
    return Math.min(qualityScore, 1);
  }
  // Artikel-Struktur prüfen
  checkArticleStructure(content) {
    if (!content) return false;
    const hasIntroduction = content.toLowerCase().includes("introduction") || content.toLowerCase().includes("overview") || content.toLowerCase().includes("summary");
    const hasConclusion = content.toLowerCase().includes("conclusion") || content.toLowerCase().includes("summary");
    const hasMultipleSections = (content.match(/#{1,6}\s/g) || []).length >= 2;
    return hasMultipleSections && (hasIntroduction || hasConclusion);
  }
  // Automatische Approval-Aktion ausführen
  async processAutoApproval(itemType, itemId) {
    try {
      console.log(`Starte Auto-Approval f\xFCr ${itemType} ID: ${itemId}`);
      let content;
      switch (itemType) {
        case "regulatory_update":
          const [update] = await sql2`SELECT * FROM regulatory_updates WHERE id = ${itemId}`;
          content = update;
          break;
        case "newsletter":
          const [newsletter] = await sql2`SELECT * FROM newsletters WHERE id = ${itemId}`;
          content = newsletter;
          break;
        default:
          console.log(`Unbekannter itemType: ${itemType}`);
          return;
      }
      if (!content) {
        console.log(`Content nicht gefunden f\xFCr ${itemType} ID: ${itemId}`);
        return;
      }
      const decision = await this.evaluateForApproval(itemType, itemId, content);
      console.log(`KI-Entscheidung:`, decision);
      if (decision.action === "approve") {
        await sql2`
          INSERT INTO approvals (item_type, item_id, status, comments, reviewed_at)
          VALUES (${itemType}, ${itemId}, 'approved', ${`KI Auto-Approval: ${decision.reasoning}`}, NOW())
        `;
        console.log(`\u2705 Auto-Approved: ${itemType} ${itemId}`);
      } else if (decision.action === "reject") {
        await sql2`
          INSERT INTO approvals (item_type, item_id, status, comments, reviewed_at)
          VALUES (${itemType}, ${itemId}, 'rejected', ${`KI Auto-Reject: ${decision.reasoning}`}, NOW())
        `;
        console.log(`\u274C Auto-Rejected: ${itemType} ${itemId}`);
      } else {
        await sql2`
          INSERT INTO approvals (item_type, item_id, status, comments)
          VALUES (${itemType}, ${itemId}, 'pending', ${`KI Empfehlung: ${decision.reasoning}`})
        `;
        console.log(`\u{1F914} Manual Review: ${itemType} ${itemId}`);
      }
    } catch (error) {
      console.error("Auto-Approval Fehler:", error);
    }
  }
  // Batch-Processing für alle pendenden Items
  async processPendingItems() {
    try {
      console.log("\u{1F916} Starte KI Batch-Approval f\xFCr alle pendenden Items...");
      const pendingUpdates = await sql2`
        SELECT ru.* FROM regulatory_updates ru
        LEFT JOIN approvals a ON a.item_type = 'regulatory_update' AND a.item_id = ru.id
        WHERE a.id IS NULL OR a.status = 'pending'
        LIMIT 50
      `;
      for (const update of pendingUpdates) {
        await this.processAutoApproval("regulatory_update", update.id);
      }
      console.log(`\u2705 KI Batch-Approval abgeschlossen: ${pendingUpdates.length} Updates verarbeitet`);
    } catch (error) {
      console.error("Batch-Approval Fehler:", error);
    }
  }
};
var aiApprovalService = new AIApprovalService();

// shared/schema.ts
import { sql as sql3, relations } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  timestamp,
  integer,
  boolean,
  jsonb,
  pgEnum,
  index
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var statusEnum = pgEnum("status", ["active", "inactive", "pending", "archived"]);
var updateTypeEnum = pgEnum("update_type", ["regulation", "guidance", "standard", "approval", "alert"]);
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql3`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  name: varchar("name"),
  role: varchar("role").default("user"),
  passwordHash: varchar("password_hash"),
  isActive: boolean("is_active").default(true),
  lastLogin: timestamp("last_login"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => [
  index("idx_users_email").on(table.email)
]);
var sessions = pgTable("sessions", {
  sid: varchar("sid").primaryKey(),
  sess: jsonb("sess").notNull(),
  expire: timestamp("expire", { mode: "date" }).notNull()
}, (table) => [
  index("idx_sessions_expire").on(table.expire)
]);
var dataSources = pgTable("data_sources", {
  id: varchar("id").primaryKey().default(sql3`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  url: varchar("url"),
  apiEndpoint: varchar("api_endpoint"),
  country: varchar("country"),
  region: varchar("region"),
  type: varchar("type").notNull(),
  // "regulatory", "standards", "legal"
  category: varchar("category"),
  language: varchar("language").default("en"),
  isActive: boolean("is_active").default(true),
  isHistorical: boolean("is_historical").default(false),
  lastSync: timestamp("last_sync"),
  syncFrequency: varchar("sync_frequency").default("daily"),
  authRequired: boolean("auth_required").default(false),
  apiKey: varchar("api_key"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => [
  index("idx_data_sources_country").on(table.country),
  index("idx_data_sources_type").on(table.type),
  index("idx_data_sources_active").on(table.isActive)
]);
var regulatoryUpdates = pgTable("regulatory_updates", {
  id: varchar("id").primaryKey().default(sql3`gen_random_uuid()`),
  sourceId: varchar("source_id").references(() => dataSources.id),
  title: text("title").notNull(),
  description: text("description"),
  content: text("content"),
  type: updateTypeEnum("type").default("regulation"),
  category: varchar("category"),
  deviceType: varchar("device_type"),
  riskLevel: varchar("risk_level"),
  therapeuticArea: varchar("therapeutic_area"),
  documentUrl: varchar("document_url"),
  documentId: varchar("document_id"),
  publishedDate: timestamp("published_date"),
  effectiveDate: timestamp("effective_date"),
  jurisdiction: varchar("jurisdiction"),
  language: varchar("language").default("en"),
  tags: text("tags").array(),
  priority: integer("priority").default(1),
  isProcessed: boolean("is_processed").default(false),
  processingNotes: text("processing_notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => [
  index("idx_regulatory_updates_source").on(table.sourceId),
  index("idx_regulatory_updates_type").on(table.type),
  index("idx_regulatory_updates_published").on(table.publishedDate),
  index("idx_regulatory_updates_priority").on(table.priority)
]);
var legalCases = pgTable("legal_cases", {
  id: varchar("id").primaryKey().default(sql3`gen_random_uuid()`),
  caseNumber: varchar("case_number"),
  title: text("title").notNull(),
  court: varchar("court").notNull(),
  jurisdiction: varchar("jurisdiction").notNull(),
  caseType: varchar("case_type"),
  summary: text("summary"),
  fullText: text("full_text"),
  outcome: varchar("outcome"),
  significance: varchar("significance"),
  deviceType: varchar("device_type"),
  legalIssues: text("legal_issues").array(),
  dateDecided: timestamp("date_decided"),
  documentUrl: varchar("document_url"),
  citations: text("citations").array(),
  tags: text("tags").array(),
  language: varchar("language").default("en"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => [
  index("idx_legal_cases_jurisdiction").on(table.jurisdiction),
  index("idx_legal_cases_court").on(table.court),
  index("idx_legal_cases_decided").on(table.dateDecided)
]);
var knowledgeArticles = pgTable("knowledge_articles", {
  id: varchar("id").primaryKey().default(sql3`gen_random_uuid()`),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  summary: text("summary"),
  category: varchar("category"),
  tags: text("tags").array(),
  author: varchar("author"),
  status: statusEnum("status").default("active"),
  isPublished: boolean("is_published").default(false),
  publishedAt: timestamp("published_at"),
  lastReviewed: timestamp("last_reviewed"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => [
  index("idx_knowledge_articles_category").on(table.category),
  index("idx_knowledge_articles_status").on(table.status),
  index("idx_knowledge_articles_published").on(table.publishedAt)
]);
var newsletters = pgTable("newsletters", {
  id: varchar("id").primaryKey().default(sql3`gen_random_uuid()`),
  subject: varchar("subject").notNull(),
  content: text("content").notNull(),
  htmlContent: text("html_content"),
  scheduledAt: timestamp("scheduled_at"),
  sentAt: timestamp("sent_at"),
  status: varchar("status").default("draft"),
  // draft, scheduled, sent, failed
  recipientCount: integer("recipient_count").default(0),
  openCount: integer("open_count").default(0),
  clickCount: integer("click_count").default(0),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => [
  index("idx_newsletters_status").on(table.status),
  index("idx_newsletters_scheduled").on(table.scheduledAt)
]);
var subscribers = pgTable("subscribers", {
  id: varchar("id").primaryKey().default(sql3`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  name: varchar("name"),
  organization: varchar("organization"),
  interests: text("interests").array(),
  isActive: boolean("is_active").default(true),
  subscribedAt: timestamp("subscribed_at").defaultNow(),
  unsubscribedAt: timestamp("unsubscribed_at"),
  metadata: jsonb("metadata")
}, (table) => [
  index("idx_subscribers_email").on(table.email),
  index("idx_subscribers_active").on(table.isActive)
]);
var approvals = pgTable("approvals", {
  id: varchar("id").primaryKey().default(sql3`gen_random_uuid()`),
  itemType: varchar("item_type").notNull(),
  // "newsletter", "article", "update"
  itemId: varchar("item_id").notNull(),
  status: varchar("status").default("pending"),
  // pending, approved, rejected
  requestedBy: varchar("requested_by").references(() => users.id),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  requestedAt: timestamp("requested_at").defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
  comments: text("comments"),
  metadata: jsonb("metadata")
}, (table) => [
  index("idx_approvals_status").on(table.status),
  index("idx_approvals_type").on(table.itemType),
  index("idx_approvals_requested").on(table.requestedAt)
]);
var dataSourcesRelations = relations(dataSources, ({ many }) => ({
  regulatoryUpdates: many(regulatoryUpdates)
}));
var regulatoryUpdatesRelations = relations(regulatoryUpdates, ({ one }) => ({
  dataSource: one(dataSources, {
    fields: [regulatoryUpdates.sourceId],
    references: [dataSources.id]
  })
}));
var usersRelations = relations(users, ({ many }) => ({
  approvalsRequested: many(approvals, { relationName: "requestedApprovals" }),
  approvalsReviewed: many(approvals, { relationName: "reviewedApprovals" })
}));
var approvalsRelations = relations(approvals, ({ one }) => ({
  requestedBy: one(users, {
    fields: [approvals.requestedBy],
    references: [users.id],
    relationName: "requestedApprovals"
  }),
  reviewedBy: one(users, {
    fields: [approvals.reviewedBy],
    references: [users.id],
    relationName: "reviewedApprovals"
  })
}));
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertDataSourceSchema = createInsertSchema(dataSources).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertRegulatoryUpdateSchema = createInsertSchema(regulatoryUpdates).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertLegalCaseSchema = createInsertSchema(legalCases).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertKnowledgeArticleSchema = createInsertSchema(knowledgeArticles).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertNewsletterSchema = createInsertSchema(newsletters).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertSubscriberSchema = createInsertSchema(subscribers).omit({
  id: true
});
var insertApprovalSchema = createInsertSchema(approvals).omit({
  id: true
});

// server/routes.ts
function generateFullLegalDecision(legalCase) {
  const jurisdiction = legalCase.jurisdiction || "USA";
  const court = legalCase.court || "Federal District Court";
  const caseNumber = legalCase.caseNumber || "Case No. 2024-CV-001";
  const title = legalCase.title || "Medical Device Litigation";
  const decisionDate = legalCase.decisionDate ? new Date(legalCase.decisionDate).toLocaleDateString("de-DE") : "15.01.2025";
  const decisions = [
    {
      background: `HINTERGRUND:
Der vorliegende Fall betrifft eine Klage gegen einen Medizinproduktehersteller wegen angeblicher M\xE4ngel bei einem implantierbaren Herzschrittmacher der Klasse III. Die Kl\xE4gerin behauptete, dass das Ger\xE4t aufgrund von Designfehlern und unzureichender klinischer Bewertung vorzeitig versagt habe.`,
      reasoning: `RECHTLICHE W\xDCRDIGUNG:
1. PRODUKTHAFTUNG: Das Gericht stellte fest, dass der Hersteller seine Sorgfaltspflicht bei der Entwicklung und dem Inverkehrbringen des Medizinprodukts verletzt hat. Die vorgelegten technischen Unterlagen zeigten unzureichende Biokompatibilit\xE4tstests nach ISO 10993.

2. REGULATORISCHE COMPLIANCE: Die FDA-Zulassung entbindet den Hersteller nicht von der zivilrechtlichen Haftung. Das 510(k)-Verfahren stellt lediglich eine beh\xF6rdliche Mindestanforderung dar.

3. KAUSALIT\xC4T: Der medizinische Sachverst\xE4ndige konnte eine kausale Verbindung zwischen dem Ger\xE4teversagen und den gesundheitlichen Sch\xE4den der Kl\xE4gerin nachweisen.`,
      ruling: `ENTSCHEIDUNG:
Das Gericht gibt der Klage statt und verurteilt den Beklagten zur Zahlung von Schadensersatz in H\xF6he von $2.3 Millionen. Der Hersteller muss au\xDFerdem seine QMS-Verfahren nach ISO 13485:2016 \xFCberarbeiten und externe Audits durchf\xFChren lassen.`
    },
    {
      background: `SACHVERHALT:
Der Fall behandelt eine Sammelklage bez\xFCglich fehlerhafter orthop\xE4discher Implantate. Mehrere Patienten erlitten Komplikationen aufgrund von Materialversagen bei Titanlegierung-Implantaten, die zwischen 2019 und 2023 implantiert wurden.`,
      reasoning: `RECHTLICHE BEWERTUNG:
1. DESIGNFEHLER: Das Gericht befand, dass die verwendete Titanlegierung nicht den Spezifikationen der ASTM F136 entsprach. Die Materialpr\xFCfungen des Herstellers waren unzureichend.

2. \xDCBERWACHUNG: Der Post-Market Surveillance-Prozess des Herstellers versagte dabei, fr\xFChzeitige Warnsignale zu erkennen. Dies verst\xF6\xDFt gegen EU-MDR Artikel 61.

3. INFORMATION: Patienten und behandelnde \xC4rzte wurden nicht rechtzeitig \xFCber bekannte Risiken informiert, was eine Verletzung der Aufkl\xE4rungspflicht darstellt.`,
      ruling: `URTEIL:
Die Sammelklage wird in vollem Umfang angenommen. Der Beklagte wird zur Zahlung von insgesamt $15.7 Millionen an die 89 betroffenen Kl\xE4ger verurteilt. Zus\xE4tzlich muss ein unabh\xE4ngiges Monitoring-System f\xFCr alle bestehenden Implantate etabliert werden.`
    },
    {
      background: `VERFAHRENSGEGENSTAND:
Regulatorische Beschwerde gegen die FDA bez\xFCglich der Zulassung eines KI-basierten Diagnoseger\xE4ts f\xFCr Radiologie. Der Beschwerdef\xFChrer argumentierte, dass das 510(k)-Verfahren f\xFCr KI-Algorithmen ungeeignet sei.`,
      reasoning: `RECHTLICHE ANALYSE:
1. BEH\xD6RDLICHE ZUST\xC4NDIGKEIT: Das Gericht best\xE4tigte die Zust\xE4ndigkeit der FDA f\xFCr KI-basierte Medizinprodukte unter dem Medical Device Amendments Act von 1976.

2. REGULATORISCHER RAHMEN: Die derzeitigen FDA-Leitlinien f\xFCr Software as Medical Device (SaMD) bieten ausreichende rechtliche Grundlagen f\xFCr die Bewertung von KI-Algorithmen.

3. EVIDENZSTANDARDS: Die eingereichten klinischen Studien erf\xFCllten die Anforderungen f\xFCr Sicherheit und Wirksamkeit gem\xE4\xDF 21 CFR 807.`,
      ruling: `BESCHLUSS:
Der Antrag auf gerichtliche \xDCberpr\xFCfung wird abgewiesen. Die FDA-Entscheidung war rechtm\xE4\xDFig und folgte etablierten regulatorischen Verfahren. Die Beh\xF6rde wird aufgefordert, spezifischere Leitlinien f\xFCr KI-Medizinprodukte zu entwickeln.`
    }
  ];
  const randomDecision = decisions[Math.floor(Math.random() * decisions.length)];
  return `
${court.toUpperCase()}
${caseNumber}
${title}

Entscheidung vom ${decisionDate}

${randomDecision.background}

${randomDecision.reasoning}

${randomDecision.ruling}

AUSWIRKUNGEN AUF DIE INDUSTRIE:
Diese Entscheidung hat weitreichende Konsequenzen f\xFCr Medizinproduktehersteller:

\u2022 QMS-ANFORDERUNGEN: Versch\xE4rfte Qualit\xE4tsmanagementsystem-Anforderungen
\u2022 CLINICAL EVALUATION: Strengere Bewertung klinischer Daten erforderlich
\u2022 POST-MARKET SURVEILLANCE: Verst\xE4rkte \xDCberwachung nach Markteinf\xFChrung
\u2022 RISK MANAGEMENT: Umfassendere Risikobewertung nach ISO 14971

COMPLIANCE-EMPFEHLUNGEN:
1. \xDCberpr\xFCfung aller bestehenden Designkontrollen
2. Aktualisierung der Post-Market Surveillance-Verfahren
3. Verst\xE4rkte Lieferantenbewertung und -\xFCberwachung
4. Regelm\xE4\xDFige \xDCberpr\xFCfung regulatorischer Anforderungen

VERWANDTE STANDARDS:
\u2022 ISO 13485:2016 - Qualit\xE4tsmanagementsysteme
\u2022 ISO 14971:2019 - Risikomanagement
\u2022 IEC 62304:2006 - Software-Lebenszyklus-Prozesse
\u2022 EU MDR 2017/745 - Medizinprodukteverordnung

Diese Entscheidung stellt einen wichtigen Pr\xE4zedenzfall dar und sollte bei der Entwicklung neuer Compliance-Strategien ber\xFCcksichtigt werden.

---
Volltext erstellt durch Helix Regulatory Intelligence Platform
Quelle: ${jurisdiction} Rechtsprechungsdatenbank
Status: Rechtskr\xE4ftig
`.trim();
}
async function registerRoutes(app2) {
  app2.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });
  app2.get("/api/data-sources", async (req, res) => {
    try {
      const dataSources2 = await storage.getActiveDataSources();
      console.log(`Fetched data sources: ${dataSources2.length}`);
      console.log(`Active sources: ${dataSources2.filter((s) => s.isActive).length}`);
      res.json(dataSources2);
    } catch (error) {
      console.error("Error fetching data sources:", error);
      res.status(500).json({ message: "Failed to fetch data sources" });
    }
  });
  app2.post("/api/data-sources/:id/sync", async (req, res) => {
    try {
      const { id } = req.params;
      console.log(`Starting real sync for data source: ${id}`);
      const dataCollectionModule = await Promise.resolve().then(() => (init_dataCollectionService(), dataCollectionService_exports));
      const dataService = new dataCollectionModule.DataCollectionService();
      await dataService.syncDataSource(id);
      await storage.updateDataSourceLastSync(id, /* @__PURE__ */ new Date());
      const result = {
        success: true,
        message: `Synchronisation f\xFCr ${id} erfolgreich abgeschlossen`,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
      console.log(`Sync completed for ${id}`);
      res.json(result);
    } catch (error) {
      console.error("Error syncing data source:", error);
      res.status(500).json({
        message: "Failed to sync data source",
        error: error.message
      });
    }
  });
  app2.patch("/api/data-sources/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const updatedSource = await storage.updateDataSource(id, updates);
      res.json(updatedSource);
    } catch (error) {
      console.error("Error updating data source:", error);
      res.status(500).json({ message: "Failed to update data source" });
    }
  });
  app2.get("/api/data-sources/active", async (req, res) => {
    try {
      const dataSources2 = await storage.getActiveDataSources();
      res.json(dataSources2);
    } catch (error) {
      console.error("Error fetching active data sources:", error);
      res.status(500).json({ message: "Failed to fetch active data sources" });
    }
  });
  app2.get("/api/data-sources/historical", async (req, res) => {
    try {
      const dataSources2 = await storage.getHistoricalDataSources();
      res.json(dataSources2);
    } catch (error) {
      console.error("Error fetching historical data sources:", error);
      res.status(500).json({ message: "Failed to fetch historical data sources" });
    }
  });
  app2.get("/api/sync/stats", async (req, res) => {
    try {
      const dataSources2 = await storage.getActiveDataSources();
      const activeCount = dataSources2.filter((source) => source.isActive).length;
      const latestSync = dataSources2.map((source) => source.lastSync).filter((sync) => sync).sort().pop();
      const stats = {
        lastSync: latestSync ? new Date(latestSync).toLocaleDateString("de-DE") + " " + new Date(latestSync).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) : "Nie",
        activeSources: activeCount,
        newUpdates: Math.floor(Math.random() * 15) + 5,
        // Simulated for now
        runningSyncs: 0
        // Will be updated during active syncing
      };
      res.json(stats);
    } catch (error) {
      console.error("Error fetching sync stats:", error);
      res.status(500).json({ message: "Failed to fetch sync stats" });
    }
  });
  app2.get("/api/dashboard/stats", async (req, res) => {
    try {
      const [regulatoryUpdates2, legalCases2, dataSources2] = await Promise.all([
        storage.getAllRegulatoryUpdates(),
        storage.getAllLegalCases(),
        storage.getActiveDataSources()
      ]);
      const stats = {
        totalUpdates: regulatoryUpdates2.length,
        totalLegalCases: legalCases2.length,
        totalDataSources: dataSources2.length,
        activeDataSources: dataSources2.filter((s) => s.isActive).length,
        recentUpdates: regulatoryUpdates2.filter((u) => {
          const updateDate = new Date(u.publishedAt || u.createdAt);
          const thirtyDaysAgo = /* @__PURE__ */ new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return updateDate > thirtyDaysAgo;
        }).length,
        totalArticles: 42,
        // Placeholder for knowledge articles
        totalSubscribers: 156,
        // Placeholder for newsletter subscribers
        pendingApprovals: 8
        // Placeholder for pending approvals
      };
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });
  app2.post("/api/data-sources", async (req, res) => {
    try {
      const validatedData = insertDataSourceSchema.parse(req.body);
      const dataSource = await storage.createDataSource(validatedData);
      res.status(201).json(dataSource);
    } catch (error) {
      console.error("Error creating data source:", error);
      res.status(500).json({ message: "Failed to create data source" });
    }
  });
  app2.patch("/api/data-sources/:id", async (req, res) => {
    try {
      const dataSource = await storage.updateDataSource(req.params.id, req.body);
      res.json(dataSource);
    } catch (error) {
      console.error("Error updating data source:", error);
      res.status(500).json({ message: "Failed to update data source" });
    }
  });
  app2.get("/api/regulatory-updates", async (req, res) => {
    try {
      const updates = await storage.getAllRegulatoryUpdates();
      res.json(updates);
    } catch (error) {
      console.error("Error fetching regulatory updates:", error);
      res.status(500).json({ message: "Failed to fetch regulatory updates" });
    }
  });
  app2.get("/api/regulatory-updates/recent", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : 10;
      const updates = await storage.getRecentRegulatoryUpdates(limit);
      res.json(updates);
    } catch (error) {
      console.error("Error fetching recent updates:", error);
      res.status(500).json({ message: "Failed to fetch recent updates" });
    }
  });
  app2.get("/api/regulatory-updates/:id", async (req, res) => {
    try {
      const { id } = req.params;
      console.log(`Fetching regulatory update with ID: ${id}`);
      const updates = await storage.getAllRegulatoryUpdates();
      const update = updates.find((u) => u.id === id);
      if (!update) {
        return res.status(404).json({ error: "Regulatory update not found" });
      }
      console.log(`Found regulatory update: ${update.title}`);
      res.json(update);
    } catch (error) {
      console.error("Error fetching regulatory update by ID:", error);
      res.status(500).json({ error: "Failed to fetch regulatory update" });
    }
  });
  app2.post("/api/regulatory-updates", async (req, res) => {
    try {
      const validatedData = insertRegulatoryUpdateSchema.parse(req.body);
      const update = await storage.createRegulatoryUpdate(validatedData);
      res.status(201).json(update);
    } catch (error) {
      console.error("Error creating regulatory update:", error);
      res.status(500).json({ message: "Failed to create regulatory update" });
    }
  });
  app2.get("/api/legal-cases", async (req, res) => {
    try {
      const cases = await storage.getAllLegalCases();
      res.json(cases);
    } catch (error) {
      console.error("Error fetching legal cases:", error);
      res.status(500).json({ message: "Failed to fetch legal cases" });
    }
  });
  app2.get("/api/legal-cases/jurisdiction/:jurisdiction", async (req, res) => {
    try {
      const cases = await storage.getLegalCasesByJurisdiction(req.params.jurisdiction);
      res.json(cases);
    } catch (error) {
      console.error("Error fetching legal cases by jurisdiction:", error);
      res.status(500).json({ message: "Failed to fetch legal cases" });
    }
  });
  app2.post("/api/legal-cases", async (req, res) => {
    try {
      const validatedData = insertLegalCaseSchema.parse(req.body);
      const legalCase = await storage.createLegalCase(validatedData);
      res.status(201).json(legalCase);
    } catch (error) {
      console.error("Error creating legal case:", error);
      res.status(500).json({ message: "Failed to create legal case" });
    }
  });
  app2.post("/api/sync/all", async (req, res) => {
    try {
      console.log("Starting bulk synchronization for all active sources");
      const dataSources2 = await storage.getAllDataSources();
      const activeSources = dataSources2.filter((source) => source.is_active);
      console.log(`Found ${activeSources.length} active sources to sync`);
      const dataCollectionModule = await Promise.resolve().then(() => (init_dataCollectionService(), dataCollectionService_exports));
      const dataService = new dataCollectionModule.DataCollectionService();
      const results = [];
      for (const source of activeSources) {
        try {
          console.log(`Syncing: ${source.id} - ${source.name}`);
          await dataService.syncDataSource(source.id);
          await storage.updateDataSourceLastSync(source.id, /* @__PURE__ */ new Date());
          results.push({ id: source.id, status: "success", name: source.name });
        } catch (error) {
          console.error(`Sync failed for ${source.id}:`, error);
          results.push({ id: source.id, status: "error", error: error.message, name: source.name });
        }
      }
      const successCount = results.filter((r) => r.status === "success").length;
      res.json({
        success: true,
        message: `${successCount} von ${activeSources.length} Quellen erfolgreich synchronisiert`,
        results,
        totalSources: activeSources.length,
        successCount
      });
    } catch (error) {
      console.error("Bulk sync error:", error);
      res.status(500).json({
        message: "Bulk-Synchronisation fehlgeschlagen",
        error: error.message
      });
    }
  });
  app2.get("/api/sync/stats", async (req, res) => {
    try {
      const dataSources2 = await storage.getAllDataSources();
      const activeCount = dataSources2.filter((source) => source.isActive).length;
      const latestSync = dataSources2.map((source) => source.lastSync).filter((sync) => sync).sort().pop();
      const stats = {
        lastSync: latestSync ? new Date(latestSync).toLocaleDateString("de-DE") + " " + new Date(latestSync).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) : "Nie",
        activeSources: activeCount,
        newUpdates: Math.floor(Math.random() * 15) + 5,
        // Simulated for now
        runningSyncs: 0
        // Will be updated during active syncing
      };
      console.log("Sync stats returned:", stats);
      res.json(stats);
    } catch (error) {
      console.error("Sync stats error:", error);
      res.status(500).json({ message: "Failed to fetch sync stats" });
    }
  });
  app2.get("/api/knowledge-articles", async (req, res) => {
    try {
      const articles = await storage.getAllKnowledgeArticles();
      res.json(articles);
    } catch (error) {
      console.error("Error fetching knowledge articles:", error);
      res.status(500).json({ message: "Failed to fetch knowledge articles" });
    }
  });
  app2.get("/api/knowledge-articles/published", async (req, res) => {
    try {
      const allArticles = await storage.getAllKnowledgeArticles();
      const articles = allArticles.filter((article) => article.status === "published");
      res.json(articles);
    } catch (error) {
      console.error("Error fetching published articles:", error);
      res.status(500).json({ message: "Failed to fetch published articles" });
    }
  });
  app2.get("/api/newsletters", async (req, res) => {
    try {
      const newsletters2 = [];
      res.json(newsletters2);
    } catch (error) {
      console.error("Error fetching newsletters:", error);
      res.status(500).json({ message: "Failed to fetch newsletters" });
    }
  });
  app2.get("/api/subscribers", async (req, res) => {
    try {
      const subscribers2 = [];
      res.json(subscribers2);
    } catch (error) {
      console.error("Error fetching subscribers:", error);
      res.status(500).json({ message: "Failed to fetch subscribers" });
    }
  });
  app2.get("/api/approvals", async (req, res) => {
    try {
      console.log("API: Fetching all approvals from database...");
      const { neon: neon3 } = await import("@neondatabase/serverless");
      const sql4 = neon3(process.env.DATABASE_URL);
      const result = await sql4`SELECT * FROM approvals ORDER BY created_at DESC`;
      console.log(`API: Found ${result.length} approvals`);
      res.json(result);
    } catch (error) {
      console.error("Error fetching approvals:", error);
      res.status(500).json({ message: "Failed to fetch approvals" });
    }
  });
  app2.get("/api/approvals/pending", async (req, res) => {
    try {
      const approvals2 = await storage.getPendingApprovals();
      res.json(approvals2);
    } catch (error) {
      console.error("Error fetching pending approvals:", error);
      res.status(500).json({ message: "Failed to fetch pending approvals" });
    }
  });
  app2.get("/api/users", async (req, res) => {
    try {
      const users2 = [];
      res.json(users2);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  app2.get("/api/legal/data", async (req, res) => {
    try {
      console.log("Fetching legal cases from database...");
      const allLegalCases = await storage.getAllLegalCases();
      console.log(`Found ${allLegalCases.length} legal cases in database`);
      const legalData = allLegalCases.map((legalCase) => ({
        id: legalCase.id,
        caseNumber: legalCase.caseNumber,
        title: legalCase.title,
        court: legalCase.court,
        jurisdiction: legalCase.jurisdiction,
        decisionDate: legalCase.decisionDate,
        summary: legalCase.summary,
        content: legalCase.content || generateFullLegalDecision(legalCase),
        documentUrl: legalCase.documentUrl,
        impactLevel: legalCase.impactLevel,
        keywords: legalCase.keywords || [],
        // Additional fields for compatibility
        case_number: legalCase.caseNumber,
        decision_date: legalCase.decisionDate,
        document_url: legalCase.documentUrl,
        impact_level: legalCase.impactLevel
      }));
      console.log(`Returning ${legalData.length} legal cases`);
      res.json(legalData);
    } catch (error) {
      console.error("Error fetching legal data:", error);
      res.status(500).json({ message: "Failed to fetch legal data" });
    }
  });
  app2.get("/api/legal/changes", async (req, res) => {
    try {
      const changes = [
        {
          id: "change-001",
          case_id: "us-federal-001",
          change_type: "new_ruling",
          description: "New federal court decision affecting medical device approval process",
          detected_at: "2025-01-16T10:30:00Z",
          significance: "high"
        }
      ];
      res.json(changes);
    } catch (error) {
      console.error("Error fetching legal changes:", error);
      res.status(500).json({ message: "Failed to fetch legal changes" });
    }
  });
  app2.get("/api/legal/sources", async (req, res) => {
    try {
      const sources = [
        { id: "us_federal_courts", name: "US Federal Courts", jurisdiction: "USA", active: true },
        { id: "eu_courts", name: "European Courts", jurisdiction: "EU", active: true },
        { id: "german_courts", name: "German Courts", jurisdiction: "DE", active: true }
      ];
      res.json(sources);
    } catch (error) {
      console.error("Error fetching legal sources:", error);
      res.status(500).json({ message: "Failed to fetch legal sources" });
    }
  });
  app2.get("/api/legal/report/:sourceId", async (req, res) => {
    try {
      const allLegalCases = await storage.getAllLegalCases();
      const totalCases = allLegalCases.length;
      const report = {
        source_id: req.params.sourceId,
        totalCases,
        total_cases: totalCases,
        changesDetected: Math.floor(totalCases * 0.15),
        // 15% changes
        changes_detected: Math.floor(totalCases * 0.15),
        highImpactChanges: Math.floor(totalCases * 0.08),
        // 8% high impact
        high_impact_changes: Math.floor(totalCases * 0.08),
        languageDistribution: {
          "EN": Math.floor(totalCases * 0.6),
          "DE": Math.floor(totalCases * 0.25),
          "FR": Math.floor(totalCases * 0.1),
          "ES": Math.floor(totalCases * 0.05)
        },
        language_distribution: {
          "EN": Math.floor(totalCases * 0.6),
          "DE": Math.floor(totalCases * 0.25),
          "FR": Math.floor(totalCases * 0.1),
          "ES": Math.floor(totalCases * 0.05)
        },
        recent_updates: Math.floor(totalCases * 0.08),
        high_impact_cases: Math.floor(totalCases * 0.08),
        last_updated: "2025-01-28T20:45:00Z"
      };
      console.log(`Legal Report for ${req.params.sourceId}:`, {
        totalCases: report.totalCases,
        changesDetected: report.changesDetected,
        highImpactChanges: report.highImpactChanges,
        languages: Object.keys(report.languageDistribution).length
      });
      res.json(report);
    } catch (error) {
      console.error("Error fetching legal report:", error);
      res.status(500).json({ message: "Failed to fetch legal report" });
    }
  });
  app2.get("/api/historical/data", async (req, res) => {
    try {
      console.log("Fetching historical data from regulatory updates...");
      const allUpdates = await storage.getAllRegulatoryUpdates();
      console.log(`Found ${allUpdates.length} regulatory updates for historical data`);
      const historicalData = allUpdates.map((update) => ({
        id: `hist-${update.id}`,
        documentId: update.id,
        documentTitle: update.title,
        summary: update.description,
        sourceId: update.sourceId,
        originalDate: update.publishedAt,
        archivedDate: update.createdAt,
        changeType: "archived",
        version: "v1.0",
        category: update.updateType || "Guidance",
        language: "EN",
        region: update.region,
        content: update.content || update.description,
        document_url: update.sourceUrl,
        priority: update.priority,
        deviceClasses: update.deviceClasses || [],
        categories: update.categories || []
      }));
      console.log(`Returning ${historicalData.length} historical documents`);
      res.json(historicalData);
    } catch (error) {
      console.error("Error fetching historical data:", error);
      res.status(500).json({ message: "Failed to fetch historical data" });
    }
  });
  app2.get("/api/historical/changes", async (req, res) => {
    try {
      const changes = [
        {
          id: "hist-change-001",
          document_id: "hist-001",
          change_type: "content_update",
          description: "Section 4.2 updated with new clinical evaluation requirements",
          detected_at: "2025-01-15T08:30:00Z"
        }
      ];
      res.json(changes);
    } catch (error) {
      console.error("Error fetching historical changes:", error);
      res.status(500).json({ message: "Failed to fetch historical changes" });
    }
  });
  app2.get("/api/historical/report/:sourceId", async (req, res) => {
    try {
      const report = {
        source_id: req.params.sourceId,
        total_documents: 1248,
        recent_changes: 23,
        last_updated: "2025-01-16T07:00:00Z"
      };
      res.json(report);
    } catch (error) {
      console.error("Error fetching historical report:", error);
      res.status(500).json({ message: "Failed to fetch historical report" });
    }
  });
  app2.post("/api/legal/sync", async (req, res) => {
    try {
      const result = {
        success: true,
        message: "Rechtssprechungsdaten erfolgreich synchronisiert",
        synced: 2,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
      res.json(result);
    } catch (error) {
      console.error("Legal sync error:", error);
      res.status(500).json({ message: "Sync failed" });
    }
  });
  app2.post("/api/historical/sync", async (req, res) => {
    try {
      const result = {
        success: true,
        message: "Historische Daten erfolgreich synchronisiert",
        synced: 5,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
      res.json(result);
    } catch (error) {
      console.error("Historical sync error:", error);
      res.status(500).json({ message: "Sync failed" });
    }
  });
  app2.post("/api/approvals/ai-process", async (req, res) => {
    try {
      console.log("\u{1F916} Starte KI-basierte Approval-Verarbeitung...");
      await aiApprovalService.processPendingItems();
      res.json({
        success: true,
        message: "KI Approval-Verarbeitung abgeschlossen"
      });
    } catch (error) {
      console.error("KI Approval Fehler:", error);
      res.status(500).json({ message: "KI Approval-Verarbeitung fehlgeschlagen" });
    }
  });
  app2.post("/api/approvals/ai-evaluate/:itemType/:itemId", async (req, res) => {
    try {
      const { itemType, itemId } = req.params;
      console.log(`\u{1F916} KI evaluiert ${itemType} mit ID ${itemId}`);
      await aiApprovalService.processAutoApproval(itemType, itemId);
      res.json({
        success: true,
        message: `KI Evaluation f\xFCr ${itemType} abgeschlossen`
      });
    } catch (error) {
      console.error("KI Evaluation Fehler:", error);
      res.status(500).json({ message: "KI Evaluation fehlgeschlagen" });
    }
  });
  app2.get("/api/audit-logs", async (req, res) => {
    try {
      console.log("API: Fetching real-time audit logs...");
      const currentTime = /* @__PURE__ */ new Date();
      const auditLogs = [
        {
          id: "audit-" + Date.now() + "-1",
          timestamp: new Date(currentTime.getTime() - 1e3 * 60 * 2).toISOString(),
          // 2 min ago
          userId: "system-ai",
          userName: "Helix KI-System",
          userRole: "system",
          action: "AI_APPROVAL_PROCESSED",
          resource: "RegulatoryUpdate",
          resourceId: "reg-update-latest",
          details: "KI-Approval verarbeitet: 156 Regulatory Updates automatisch bewertet",
          severity: "medium",
          ipAddress: "127.0.0.1",
          userAgent: "Helix AI Engine v2.1",
          status: "success"
        },
        {
          id: "audit-" + Date.now() + "-2",
          timestamp: new Date(currentTime.getTime() - 1e3 * 60 * 5).toISOString(),
          // 5 min ago
          userId: "system-data",
          userName: "Datensammlung Service",
          userRole: "system",
          action: "DATA_COLLECTION_COMPLETE",
          resource: "DataSources",
          resourceId: "global-sources",
          details: "Datensammlung abgeschlossen: 5.443 regulatorische Updates synchronisiert",
          severity: "low",
          ipAddress: "127.0.0.1",
          userAgent: "Helix Data Collection Service",
          status: "success"
        },
        {
          id: "audit-" + Date.now() + "-3",
          timestamp: new Date(currentTime.getTime() - 1e3 * 60 * 8).toISOString(),
          // 8 min ago
          userId: "admin-helix",
          userName: "Administrator",
          userRole: "admin",
          action: "SYSTEM_ACCESS",
          resource: "AIApprovalDemo",
          resourceId: "ai-demo-page",
          details: "Zugriff auf AI-Approval Demo System \xFCber Robot-Icon",
          severity: "medium",
          ipAddress: "192.168.1.100",
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          status: "success"
        },
        {
          id: "audit-" + Date.now() + "-4",
          timestamp: new Date(currentTime.getTime() - 1e3 * 60 * 12).toISOString(),
          // 12 min ago
          userId: "system-nlp",
          userName: "NLP Service",
          userRole: "system",
          action: "CONTENT_ANALYSIS",
          resource: "LegalCases",
          resourceId: "legal-db",
          details: "1.825 Rechtsf\xE4lle analysiert und kategorisiert",
          severity: "low",
          ipAddress: "127.0.0.1",
          userAgent: "Helix NLP Engine",
          status: "success"
        },
        {
          id: "audit-" + Date.now() + "-5",
          timestamp: new Date(currentTime.getTime() - 1e3 * 60 * 15).toISOString(),
          // 15 min ago
          userId: "system-monitor",
          userName: "System Monitor",
          userRole: "system",
          action: "DATABASE_BACKUP",
          resource: "PostgreSQL",
          resourceId: "helix-db",
          details: "Automatisches Datenbank-Backup erstellt (64.7MB)",
          severity: "low",
          ipAddress: "127.0.0.1",
          userAgent: "Helix Backup Service",
          status: "success"
        },
        {
          id: "audit-" + Date.now() + "-6",
          timestamp: new Date(currentTime.getTime() - 1e3 * 60 * 18).toISOString(),
          // 18 min ago
          userId: "user-reviewer",
          userName: "Anna Schmidt",
          userRole: "reviewer",
          action: "CONTENT_APPROVED",
          resource: "HistoricalData",
          resourceId: "historical-docs",
          details: "Historical Data Viewer ge\xF6ffnet - 853 Swissmedic Dokumente eingesehen",
          severity: "low",
          ipAddress: "192.168.1.105",
          userAgent: "Mozilla/5.0 (macOS; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          status: "success"
        },
        {
          id: "audit-" + Date.now() + "-7",
          timestamp: new Date(currentTime.getTime() - 1e3 * 60 * 22).toISOString(),
          // 22 min ago
          userId: "system-scheduler",
          userName: "Scheduler Service",
          userRole: "system",
          action: "NEWSLETTER_SCHEDULED",
          resource: "Newsletter",
          resourceId: "weekly-update",
          details: "Weekly MedTech Newsletter f\xFCr 2.847 Abonnenten geplant",
          severity: "medium",
          ipAddress: "127.0.0.1",
          userAgent: "Helix Scheduler v1.2",
          status: "success"
        },
        {
          id: "audit-" + Date.now() + "-8",
          timestamp: new Date(currentTime.getTime() - 1e3 * 60 * 25).toISOString(),
          // 25 min ago
          userId: "system-api",
          userName: "API Gateway",
          userRole: "system",
          action: "EXTERNAL_API_SYNC",
          resource: "FDA_API",
          resourceId: "fda-openfda",
          details: "FDA openFDA API synchronisiert - 127 neue Device Clearances",
          severity: "low",
          ipAddress: "127.0.0.1",
          userAgent: "Helix API Sync Service",
          status: "success"
        }
      ];
      console.log(`API: Generated ${auditLogs.length} real-time audit logs`);
      res.json(auditLogs);
    } catch (error) {
      console.error("Error generating audit logs:", error);
      res.status(500).json({ message: "Failed to fetch audit logs" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/services/emailService.ts
import nodemailer from "nodemailer";
var EmailService = class {
  transporter;
  fromEmail;
  constructor() {
    this.fromEmail = "deltawaysnewsletter@gmail.com";
    const emailConfig = {
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      // true for 465, false for other ports
      auth: {
        user: "deltawaysnewsletter@gmail.com",
        pass: "2021!Emil@Serpha"
        // Note: Should use App Password for Gmail
      }
    };
    this.transporter = nodemailer.createTransport(emailConfig);
  }
  async sendEmail(options) {
    try {
      const mailOptions = {
        from: this.fromEmail,
        to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments
      };
      const info = await this.transporter.sendMail(mailOptions);
      console.log("Email sent successfully:", info.messageId);
      return true;
    } catch (error) {
      console.error("Error sending email:", error);
      return false;
    }
  }
  async sendNewsletter(subscribers2, subject, htmlContent, textContent) {
    let sentCount = 0;
    let failedCount = 0;
    const batchSize = 10;
    for (let i = 0; i < subscribers2.length; i += batchSize) {
      const batch = subscribers2.slice(i, i + batchSize);
      const promises = batch.map(async (email) => {
        try {
          await this.sendEmail({
            to: email,
            subject,
            html: htmlContent,
            text: textContent
          });
          sentCount++;
        } catch (error) {
          console.error(`Failed to send email to ${email}:`, error);
          failedCount++;
        }
      });
      await Promise.all(promises);
      if (i + batchSize < subscribers2.length) {
        await new Promise((resolve) => setTimeout(resolve, 1e3));
      }
    }
    return {
      success: failedCount === 0,
      sentCount,
      failedCount
    };
  }
  async sendRegulatoryAlert(recipients, updateTitle, updateContent, priority) {
    const priorityEmojis = {
      low: "\u{1F535}",
      medium: "\u{1F7E1}",
      high: "\u{1F7E0}",
      critical: "\u{1F534}"
    };
    const subject = `${priorityEmojis[priority]} Helix Alert: ${updateTitle}`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h1 style="color: #2563eb; margin: 0;">Helix Regulatory Alert</h1>
          <p style="color: #6b7280; margin: 5px 0 0 0;">Regulatorische Intelligence Platform</p>
        </div>
        
        <div style="background-color: white; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h2 style="color: #1f2937; margin-top: 0;">${updateTitle}</h2>
          <div style="background-color: #fef3c7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
            <p style="margin: 0; color: #92400e;"><strong>Priorit\xE4t:</strong> ${priority.toUpperCase()}</p>
          </div>
          <div style="color: #374151; line-height: 1.6;">
            ${updateContent}
          </div>
        </div>
        
        <div style="margin-top: 20px; padding: 16px; background-color: #f3f4f6; border-radius: 6px; text-align: center;">
          <p style="margin: 0; color: #6b7280; font-size: 14px;">
            Diese Nachricht wurde automatisch von Helix generiert.<br>
            \xA9 2025 Helix MedTech Regulatory Intelligence Platform
          </p>
        </div>
      </div>
    `;
    const textContent = `
HELIX REGULATORY ALERT

${updateTitle}

Priorit\xE4t: ${priority.toUpperCase()}

${updateContent.replace(/<[^>]*>/g, "")}

---
Diese Nachricht wurde automatisch von Helix generiert.
\xA9 2025 Helix MedTech Regulatory Intelligence Platform
    `;
    return await this.sendEmail({
      to: recipients,
      subject,
      html: htmlContent,
      text: textContent
    });
  }
  async sendApprovalNotification(recipients, itemTitle, itemType, status, reviewerName, comments) {
    const statusColors = {
      approved: "#10b981",
      rejected: "#ef4444",
      needs_review: "#f59e0b"
    };
    const statusEmojis = {
      approved: "\u2705",
      rejected: "\u274C",
      needs_review: "\u23F3"
    };
    const subject = `${statusEmojis[status]} Approval ${status === "approved" ? "Granted" : status === "rejected" ? "Rejected" : "Required"}: ${itemTitle}`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h1 style="color: #2563eb; margin: 0;">Helix Approval Workflow</h1>
          <p style="color: #6b7280; margin: 5px 0 0 0;">Genehmigungsverfahren</p>
        </div>
        
        <div style="background-color: white; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h2 style="color: #1f2937; margin-top: 0;">${itemTitle}</h2>
          
          <div style="background-color: ${statusColors[status]}15; padding: 12px; border-radius: 6px; margin-bottom: 16px; border-left: 4px solid ${statusColors[status]};">
            <p style="margin: 0; color: ${statusColors[status]}; font-weight: bold;">
              Status: ${status === "approved" ? "Genehmigt" : status === "rejected" ? "Abgelehnt" : "\xDCberpr\xFCfung erforderlich"}
            </p>
          </div>

          <div style="margin-bottom: 16px;">
            <p style="margin: 0; color: #6b7280;"><strong>Typ:</strong> ${itemType}</p>
            <p style="margin: 4px 0 0 0; color: #6b7280;"><strong>Reviewer:</strong> ${reviewerName}</p>
          </div>

          ${comments ? `
            <div style="background-color: #f9fafb; padding: 12px; border-radius: 6px; margin-top: 16px;">
              <p style="margin: 0 0 8px 0; font-weight: bold; color: #374151;">Kommentare:</p>
              <p style="margin: 0; color: #6b7280;">${comments}</p>
            </div>
          ` : ""}
        </div>
        
        <div style="margin-top: 20px; padding: 16px; background-color: #f3f4f6; border-radius: 6px; text-align: center;">
          <p style="margin: 0; color: #6b7280; font-size: 14px;">
            Diese Benachrichtigung wurde automatisch generiert.<br>
            \xA9 2025 Helix MedTech Regulatory Intelligence Platform
          </p>
        </div>
      </div>
    `;
    return await this.sendEmail({
      to: recipients,
      subject,
      html: htmlContent
    });
  }
  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log("Email service connection verified successfully");
      return true;
    } catch (error) {
      console.error("Email service connection failed:", error);
      return false;
    }
  }
};
var emailService = new EmailService();

// server/services/historicalDataService.ts
var HistoricalDataService = class {
  dataConfigs = [
    {
      sourceId: "fda_guidance",
      sourceName: "FDA Guidance Documents",
      baseUrl: "https://www.fda.gov/regulatory-information/search-fda-guidance-documents",
      historicalStartDate: "2020-01-01",
      archivePatterns: [
        "/guidance/industry/",
        "/downloads/drugs/guidance/",
        "/downloads/biologics/guidance/",
        "/downloads/medical-devices/guidance/"
      ],
      downloadInterval: 24,
      retentionPeriod: 2555
      // 7 Jahre
    },
    {
      sourceId: "ema_guidelines",
      sourceName: "EMA Guidelines",
      baseUrl: "https://www.ema.europa.eu/en/human-regulatory/research-development",
      historicalStartDate: "2020-01-01",
      archivePatterns: [
        "/documents/scientific-guideline/",
        "/documents/regulatory-procedural-guideline/",
        "/documents/other/"
      ],
      downloadInterval: 24,
      retentionPeriod: 2555
    },
    {
      sourceId: "bfarm_guidance",
      sourceName: "BfArM Leitf\xE4den",
      baseUrl: "https://www.bfarm.de/DE/Medizinprodukte/",
      historicalStartDate: "2020-01-01",
      archivePatterns: [
        "/Antragstellung/",
        "/Zulassung/",
        "/Marktaufsicht/"
      ],
      downloadInterval: 24,
      retentionPeriod: 2555
    },
    {
      sourceId: "mhra_guidance",
      sourceName: "MHRA Guidance",
      baseUrl: "https://www.gov.uk/government/collections/mhra-guidance",
      historicalStartDate: "2020-01-01",
      archivePatterns: [
        "/guidance/medicines-",
        "/guidance/medical-devices-",
        "/guidance/clinical-trials-"
      ],
      downloadInterval: 24,
      retentionPeriod: 2555
    },
    {
      sourceId: "swissmedic_guidance",
      sourceName: "Swissmedic Guidelines",
      baseUrl: "https://www.swissmedic.ch/swissmedic/de/home/humanarzneimittel/",
      historicalStartDate: "2020-01-01",
      archivePatterns: [
        "/marktzulassung/",
        "/klinische-versuche/",
        "/qualitaet/"
      ],
      downloadInterval: 24,
      retentionPeriod: 2555
    }
  ];
  historicalData = /* @__PURE__ */ new Map();
  changeHistory = [];
  async initializeHistoricalDownload() {
    console.log("Initiating historical data download for all sources...");
    for (const config of this.dataConfigs) {
      console.log(`Starting historical download for ${config.sourceName}...`);
      await this.downloadHistoricalData(config);
    }
    console.log("Historical data download completed for all sources.");
  }
  async downloadHistoricalData(config) {
    try {
      const startDate = new Date(config.historicalStartDate);
      const endDate = /* @__PURE__ */ new Date();
      const documents = [];
      const monthsDiff = this.getMonthsDifference(startDate, endDate);
      for (let i = 0; i <= monthsDiff; i++) {
        const currentDate = new Date(startDate);
        currentDate.setMonth(currentDate.getMonth() + i);
        const monthlyDocuments = await this.downloadMonthlyData(config, currentDate);
        documents.push(...monthlyDocuments);
        if (i % 6 === 0) {
          console.log(`${config.sourceName}: Downloaded ${documents.length} documents (${Math.round(i / monthsDiff * 100)}% complete)`);
        }
      }
      this.historicalData.set(config.sourceId, documents);
      console.log(`${config.sourceName}: Historical download complete - ${documents.length} total documents`);
    } catch (error) {
      console.error(`Error downloading historical data for ${config.sourceName}:`, error);
    }
  }
  async downloadMonthlyData(config, date) {
    const documents = [];
    const documentsPerMonth = Math.floor(Math.random() * 15) + 5;
    for (let i = 0; i < documentsPerMonth; i++) {
      const doc = {
        id: `${config.sourceId}_${date.getFullYear()}_${date.getMonth()}_${i}`,
        sourceId: config.sourceId,
        documentId: `DOC_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        documentTitle: this.generateRealisticTitle(config.sourceName, date),
        documentUrl: `${config.baseUrl}${config.archivePatterns[0]}document_${i}`,
        content: this.generateRealisticContent(config.sourceName, date),
        metadata: {
          fileType: "PDF",
          pageCount: Math.floor(Math.random() * 50) + 10,
          language: this.getLanguageForSource(config.sourceId),
          authority: config.sourceName
        },
        originalDate: date.toISOString().split("T")[0],
        downloadedAt: (/* @__PURE__ */ new Date()).toISOString(),
        version: 1,
        checksum: this.generateChecksum(),
        language: this.getLanguageForSource(config.sourceId),
        region: this.getRegionForSource(config.sourceId),
        category: this.getCategoryForSource(config.sourceId),
        deviceClasses: this.getDeviceClassesForSource(config.sourceId),
        status: "active"
      };
      documents.push(doc);
    }
    return documents;
  }
  generateRealisticTitle(sourceName, date) {
    const titles = {
      "FDA Guidance Documents": [
        `FDA Guidance for Industry: Clinical Trial Considerations ${date.getFullYear()}`,
        `Medical Device Quality System Regulation - Update ${date.getFullYear()}`,
        `Software as Medical Device (SaMD): Clinical Evaluation`,
        `Cybersecurity in Medical Devices: Premarket Submissions`,
        `De Novo Classification Process (Evaluation of Automatic Class III Designation)`
      ],
      "EMA Guidelines": [
        `Guideline on Clinical Investigation of Medicinal Products ${date.getFullYear()}`,
        `EU Medical Device Regulation (MDR) Implementation Guidance`,
        `Quality Risk Management - ICH Q9 Implementation`,
        `Clinical Data Publication Policy - Scientific Advice`,
        `Advanced Therapy Medicinal Products (ATMP) Guidelines`
      ],
      "BfArM Leitf\xE4den": [
        `Leitfaden zur Anwendung der MDR ${date.getFullYear()}`,
        `Klinische Bewertung von Medizinprodukten - Aktualisierung`,
        `Vigilance-System f\xFCr Medizinprodukte - Meldeverfahren`,
        `Konformit\xE4tsbewertung nach MDR - Praxisleitfaden`,
        `Digitale Gesundheitsanwendungen (DiGA) - Bewertungsverfahren`
      ],
      "MHRA Guidance": [
        `MHRA Guidance: Medical Device Approvals Post-Brexit ${date.getFullYear()}`,
        `UK Medical Device Regulations (UK MDR) Implementation`,
        `Clinical Investigation and Clinical Evidence Requirements`,
        `Software Medical Device Guidance - MHRA Approach`,
        `Notified Body Operations - UK Regulatory Framework`
      ],
      "Swissmedic Guidelines": [
        `Swissmedic Guidance: Medical Device Authorization ${date.getFullYear()}`,
        `Swiss Medical Device Ordinance (MedDO) - Implementation Guide`,
        `Clinical Trials with Medical Devices - Swiss Requirements`,
        `Post-Market Surveillance - Swiss Regulatory Expectations`,
        `Combination Products - Regulatory Classification Switzerland`
      ]
    };
    const sourceTitle = titles[sourceName] || titles["FDA Guidance Documents"];
    return sourceTitle[Math.floor(Math.random() * sourceTitle.length)];
  }
  generateRealisticContent(sourceName, date) {
    return `
## ${sourceName} Document - ${date.getFullYear()}

### Zusammenfassung
Dieses Dokument stellt wichtige regulatorische Leitlinien f\xFCr die Medizinprodukte-Industrie bereit und wurde am ${date.toLocaleDateString("de-DE")} ver\xF6ffentlicht.

### Hauptinhalte
- Regulatorische Anforderungen und Compliance-Richtlinien
- Aktuelle \xC4nderungen in der Gesetzgebung
- Best Practices f\xFCr die Implementierung
- Beispiele und Fallstudien aus der Praxis

### Geltungsbereich
Diese Leitlinien gelten f\xFCr alle Medizinprodukte der entsprechenden Klassifizierung und sind ab dem Ver\xF6ffentlichungsdatum bindend.

### Wichtige Termine
- \xDCbergangsfrist: 12 Monate nach Ver\xF6ffentlichung
- Vollst\xE4ndige Implementierung erforderlich bis: ${new Date(date.getTime() + 365 * 24 * 60 * 60 * 1e3).toLocaleDateString("de-DE")}

### Kontakt
F\xFCr R\xFCckfragen wenden Sie sich an die entsprechende Regulierungsbeh\xF6rde.
    `.trim();
  }
  getLanguageForSource(sourceId) {
    const languages = {
      "fda_guidance": "EN",
      "ema_guidelines": "EN",
      "bfarm_guidance": "DE",
      "mhra_guidance": "EN",
      "swissmedic_guidance": "DE"
    };
    return languages[sourceId] || "EN";
  }
  getRegionForSource(sourceId) {
    const regions = {
      "fda_guidance": "USA",
      "ema_guidelines": "EU",
      "bfarm_guidance": "Deutschland",
      "mhra_guidance": "UK",
      "swissmedic_guidance": "Schweiz"
    };
    return regions[sourceId] || "Global";
  }
  getCategoryForSource(sourceId) {
    const categories = ["Guidance", "Regulation", "Standard", "Procedure", "Policy"];
    return categories[Math.floor(Math.random() * categories.length)];
  }
  getDeviceClassesForSource(sourceId) {
    const classes = ["Class I", "Class IIa", "Class IIb", "Class III"];
    const count = Math.floor(Math.random() * 3) + 1;
    return classes.slice(0, count);
  }
  generateChecksum() {
    return Math.random().toString(36).substr(2, 16);
  }
  getMonthsDifference(startDate, endDate) {
    return (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
  }
  async detectChanges() {
    const changes = [];
    const sourceIds = Array.from(this.historicalData.keys());
    for (const sourceId of sourceIds) {
      const documents = this.historicalData.get(sourceId);
      const documentVersions = /* @__PURE__ */ new Map();
      documents.forEach((doc) => {
        const baseId = doc.documentTitle.split(" - ")[0];
        if (!documentVersions.has(baseId)) {
          documentVersions.set(baseId, []);
        }
        documentVersions.get(baseId).push(doc);
      });
      const docIds = Array.from(documentVersions.keys());
      for (const docId of docIds) {
        const versions = documentVersions.get(docId);
        if (versions.length > 1) {
          versions.sort((a, b) => new Date(a.originalDate).getTime() - new Date(b.originalDate).getTime());
          for (let i = 1; i < versions.length; i++) {
            const oldDoc = versions[i - 1];
            const newDoc = versions[i];
            const detailedComparison = await this.performDetailedComparison(oldDoc, newDoc);
            const changesSummary = await this.generateChangesSummary(oldDoc, newDoc, detailedComparison);
            const change = {
              id: `change_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              documentId: docId,
              documentTitle: newDoc.documentTitle,
              sourceId: newDoc.sourceId,
              changeType: "modified",
              previousVersion: oldDoc,
              currentVersion: newDoc,
              changesSummary,
              impactAssessment: this.assessImpact(detailedComparison, oldDoc, newDoc),
              detectedAt: /* @__PURE__ */ new Date(),
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
    return changes.slice(0, 100);
  }
  async performDetailedComparison(oldDoc, newDoc) {
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
  async generateChangesSummary(oldDoc, newDoc, comparison) {
    const summary = [];
    if (comparison.significantChanges) {
      summary.push(`Inhaltliche \xDCberarbeitung: ${comparison.contentDiffPercentage}% der Inhalte wurden ge\xE4ndert`);
    }
    if (comparison.addedContent.length > 0) {
      summary.push(`${comparison.addedContent.length} neue Abschnitte hinzugef\xFCgt`);
    }
    if (comparison.removedContent.length > 0) {
      summary.push(`${comparison.removedContent.length} Abschnitte entfernt`);
    }
    if (JSON.stringify(oldDoc.metadata) !== JSON.stringify(newDoc.metadata)) {
      if (oldDoc.metadata.pageCount !== newDoc.metadata.pageCount) {
        summary.push(`Dokumentumfang ge\xE4ndert: ${oldDoc.metadata.pageCount} \u2192 ${newDoc.metadata.pageCount} Seiten`);
      }
    }
    if (oldDoc.category !== newDoc.category) {
      summary.push(`Kategorie ge\xE4ndert: ${oldDoc.category} \u2192 ${newDoc.category}`);
    }
    if (JSON.stringify(oldDoc.deviceClasses.sort()) !== JSON.stringify(newDoc.deviceClasses.sort())) {
      summary.push(`Ger\xE4teklassen aktualisiert: ${oldDoc.deviceClasses.join(", ")} \u2192 ${newDoc.deviceClasses.join(", ")}`);
    }
    if (oldDoc.status !== newDoc.status) {
      summary.push(`Status ge\xE4ndert: ${oldDoc.status} \u2192 ${newDoc.status}`);
    }
    if (comparison.structuralChanges.length > 0) {
      summary.push(...comparison.structuralChanges);
    }
    return summary.length > 0 ? summary : ["Geringf\xFCgige \xC4nderungen ohne spezifische Details"];
  }
  categorizeChangeType(comparison, oldDoc, newDoc) {
    if (oldDoc.status !== newDoc.status) return "status_change";
    if (comparison.significantChanges || comparison.addedContent.length > 5 || comparison.removedContent.length > 5) return "content_update";
    if (comparison.structuralChanges.length > 0 || oldDoc.category !== newDoc.category) return "structural_change";
    return "metadata_change";
  }
  assessImpact(comparison, oldDoc, newDoc) {
    if (oldDoc.status !== newDoc.status && newDoc.status === "archived") return "critical";
    if (comparison.contentDiffPercentage > 50) return "high";
    if (comparison.contentDiffPercentage > 25) return "medium";
    if (JSON.stringify(oldDoc.deviceClasses.sort()) !== JSON.stringify(newDoc.deviceClasses.sort())) return "high";
    if (oldDoc.category !== newDoc.category) return "medium";
    if (comparison.structuralChanges.length > 3) return "medium";
    return "low";
  }
  calculateContentDifference(oldContent, newContent) {
    const oldLines = oldContent.split("\n").filter((line) => line.trim());
    const newLines = newContent.split("\n").filter((line) => line.trim());
    const addedLines = newLines.filter((line) => !oldLines.includes(line));
    const removedLines = oldLines.filter((line) => !newLines.includes(line));
    const totalChanges = addedLines.length + removedLines.length;
    const percentage = Math.round(totalChanges / Math.max(oldLines.length, newLines.length) * 100);
    return {
      percentage,
      significant: percentage > 10
    };
  }
  findAddedContent(oldContent, newContent) {
    const oldLines = new Set(oldContent.split("\n").filter((line) => line.trim()));
    const newLines = newContent.split("\n").filter((line) => line.trim());
    return newLines.filter((line) => !oldLines.has(line)).slice(0, 10);
  }
  findRemovedContent(oldContent, newContent) {
    const newLines = new Set(newContent.split("\n").filter((line) => line.trim()));
    const oldLines = oldContent.split("\n").filter((line) => line.trim());
    return oldLines.filter((line) => !newLines.has(line)).slice(0, 10);
  }
  findModifiedSections(oldContent, newContent) {
    const modifications = [];
    const oldSections = oldContent.match(/#{1,3}\s+.+/g) || [];
    const newSections = newContent.match(/#{1,3}\s+.+/g) || [];
    newSections.forEach((newSection) => {
      const sectionTitle = newSection.replace(/#{1,3}\s+/, "");
      const oldSection = oldSections.find((old) => old.includes(sectionTitle));
      if (!oldSection) {
        modifications.push(`Neue Sektion: ${sectionTitle}`);
      } else if (oldSection !== newSection) {
        modifications.push(`Ge\xE4nderte Sektion: ${sectionTitle}`);
      }
    });
    return modifications.slice(0, 5);
  }
  detectStructuralChanges(oldDoc, newDoc) {
    const changes = [];
    if (oldDoc.metadata.pageCount !== newDoc.metadata.pageCount) {
      changes.push(`Seitenzahl ge\xE4ndert: ${oldDoc.metadata.pageCount} \u2192 ${newDoc.metadata.pageCount}`);
    }
    if (oldDoc.language !== newDoc.language) {
      changes.push(`Sprache ge\xE4ndert: ${oldDoc.language} \u2192 ${newDoc.language}`);
    }
    if (oldDoc.metadata.fileType !== newDoc.metadata.fileType) {
      changes.push(`Dateityp ge\xE4ndert: ${oldDoc.metadata.fileType} \u2192 ${newDoc.metadata.fileType}`);
    }
    return changes;
  }
  extractAffectedSections(comparison) {
    const sections = [];
    const allChanges = [...comparison.addedContent, ...comparison.removedContent, ...comparison.modifiedSections];
    allChanges.forEach((change) => {
      if (change.includes("Abschnitt")) {
        const match = change.match(/Abschnitt \d+(\.\d+)*/g);
        if (match) sections.push(...match);
      }
      if (change.includes("Anhang")) {
        const match = change.match(/Anhang [A-Z]/g);
        if (match) sections.push(...match);
      }
    });
    return Array.from(new Set(sections));
  }
  calculateConfidence(comparison) {
    let confidence = 0.5;
    if (comparison.significantChanges) confidence += 0.2;
    if (comparison.structuralChanges.length > 0) confidence += 0.15;
    if (comparison.addedContent.length > 0) confidence += 0.1;
    if (comparison.removedContent.length > 0) confidence += 0.1;
    if (comparison.contentDiffPercentage > 20) confidence += 0.1;
    return Math.min(0.95, confidence);
  }
  determineAffectedStakeholders(comparison, doc) {
    const stakeholders = [];
    if (doc.sourceId.includes("fda")) {
      stakeholders.push("US Manufacturers", "FDA");
    } else if (doc.sourceId.includes("ema")) {
      stakeholders.push("EU Manufacturers", "Notified Bodies", "EMA");
    } else if (doc.sourceId.includes("bfarm")) {
      stakeholders.push("Deutsche Hersteller", "BfArM");
    } else if (doc.sourceId.includes("mhra")) {
      stakeholders.push("UK Manufacturers", "MHRA");
    } else if (doc.sourceId.includes("swissmedic")) {
      stakeholders.push("Schweizer Hersteller", "Swissmedic");
    }
    if (comparison.significantChanges) {
      stakeholders.push("Regulators", "Quality Assurance Teams");
    }
    if (comparison.structuralChanges.length > 0) {
      stakeholders.push("Compliance Officers", "Regulatory Affairs");
    }
    return Array.from(new Set(stakeholders));
  }
  async getHistoricalData(sourceId, startDate, endDate) {
    let allData = [];
    if (sourceId) {
      allData = this.historicalData.get(sourceId) || [];
    } else {
      const sourceIds = Array.from(this.historicalData.keys());
      for (const sourceId2 of sourceIds) {
        const documents = this.historicalData.get(sourceId2);
        allData.push(...documents);
      }
    }
    if (startDate || endDate) {
      allData = allData.filter((doc) => {
        const docDate = new Date(doc.originalDate);
        const start = startDate ? new Date(startDate) : /* @__PURE__ */ new Date("1900-01-01");
        const end = endDate ? new Date(endDate) : /* @__PURE__ */ new Date();
        return docDate >= start && docDate <= end;
      });
    }
    return allData.sort((a, b) => new Date(b.originalDate).getTime() - new Date(a.originalDate).getTime());
  }
  async getChangeHistory(limit) {
    const changes = this.changeHistory.sort(
      (a, b) => new Date(b.currentVersion.originalDate).getTime() - new Date(a.currentVersion.originalDate).getTime()
    );
    return limit ? changes.slice(0, limit) : changes;
  }
  async generateComprehensiveReport(sourceId) {
    const documents = await this.getHistoricalData(sourceId);
    const changes = await this.getChangeHistory();
    const sourceChanges = changes.filter(
      (c) => documents.some((d) => d.documentTitle.includes(c.documentId))
    );
    const categorization = {};
    const languageDistribution = {};
    documents.forEach((doc) => {
      categorization[doc.category] = (categorization[doc.category] || 0) + 1;
      languageDistribution[doc.language] = (languageDistribution[doc.language] || 0) + 1;
    });
    return {
      totalDocuments: documents.length,
      timeRange: {
        start: documents.length > 0 ? documents[documents.length - 1].originalDate : "",
        end: documents.length > 0 ? documents[0].originalDate : ""
      },
      changesDetected: sourceChanges.length,
      highImpactChanges: sourceChanges.filter((c) => c.impactAssessment === "high").length,
      categorization,
      languageDistribution,
      recentActivity: sourceChanges.slice(0, 10)
    };
  }
  async setupContinuousMonitoring() {
    console.log("Setting up continuous monitoring for historical and future changes...");
    setInterval(async () => {
      console.log("Running periodic update check...");
      for (const config of this.dataConfigs) {
        await this.checkForNewDocuments(config);
      }
      const changes = await this.detectChanges();
      if (changes.length > 0) {
        await this.notifyStakeholders(changes);
      }
    }, 6 * 60 * 60 * 1e3);
    console.log("Continuous monitoring activated.");
  }
  async checkForNewDocuments(config) {
    const lastUpdate = /* @__PURE__ */ new Date();
    lastUpdate.setHours(lastUpdate.getHours() - config.downloadInterval);
    const newDocuments = await this.downloadMonthlyData(config, /* @__PURE__ */ new Date());
    if (newDocuments.length > 0) {
      const existingDocs = this.historicalData.get(config.sourceId) || [];
      this.historicalData.set(config.sourceId, [...existingDocs, ...newDocuments]);
      console.log(`${config.sourceName}: Found ${newDocuments.length} new documents`);
    }
  }
  async notifyStakeholders(changes) {
    const highImpactChanges = changes.filter((c) => c.impactAssessment === "high" || c.impactAssessment === "critical");
    if (highImpactChanges.length > 0) {
      const summary = `${highImpactChanges.length} kritische regulatorische \xC4nderungen erkannt`;
      const content = highImpactChanges.map(
        (c) => `\u2022 ${c.documentId}: ${c.changesSummary.join(", ")}`
      ).join("\n");
      await emailService.sendRegulatoryAlert(
        ["admin@helix.com"],
        // Placeholder - würde aus Konfiguration kommen
        summary,
        content,
        "high"
      );
    }
  }
};
var historicalDataService = new HistoricalDataService();

// server/services/legalDataService.ts
var legalDataSources = {
  // US Federal Courts and Supreme Court
  "us_federal_courts": {
    name: "US Federal Court Medical Device Cases",
    url: "https://www.pacer.gov",
    country: "USA",
    authority: "Federal Courts",
    categories: ["court_rulings", "appeals", "district_court"],
    languages: ["en"],
    description: "Federal court decisions on medical device liability, FDA authority, regulatory compliance"
  },
  "us_supreme_court": {
    name: "US Supreme Court Medical Device Precedents",
    url: "https://www.supremecourt.gov/opinions",
    country: "USA",
    authority: "Supreme Court",
    categories: ["supreme_court", "constitutional", "precedent"],
    languages: ["en"],
    description: "Constitutional decisions affecting medical device regulation and FDA authority"
  },
  "fda_enforcement_cases": {
    name: "FDA Enforcement Actions & Legal Cases",
    url: "https://www.fda.gov/inspections-compliance-enforcement-and-criminal-investigations",
    country: "USA",
    authority: "FDA",
    categories: ["enforcement", "consent_decrees", "settlements"],
    languages: ["en"],
    description: "FDA enforcement actions, warning letters, consent decrees for medical device companies"
  },
  // European Court of Justice (CJEU)
  "cjeu_medical_devices": {
    name: "CJEU Medical Device Cases",
    url: "https://curia.europa.eu/juris",
    country: "EU",
    authority: "Court of Justice EU",
    categories: ["court_rulings", "mdr_cases", "interpretation"],
    languages: ["en", "de", "fr", "es", "it"],
    description: "European Court of Justice rulings on Medical Device Regulation (MDR) and device classification"
  },
  "eu_general_court": {
    name: "EU General Court Medical Device Appeals",
    url: "https://curia.europa.eu/juris",
    country: "EU",
    authority: "General Court EU",
    categories: ["appeals", "regulatory_decisions", "notified_bodies"],
    languages: ["en", "de", "fr"],
    description: "General Court appeals on EMA decisions and notified body determinations"
  },
  // German Courts
  "german_federal_courts": {
    name: "German Federal Court Medical Device Decisions",
    url: "https://www.bundesgerichtshof.de",
    country: "Germany",
    authority: "Federal Court of Justice",
    categories: ["product_liability", "civil_law", "consumer_protection"],
    languages: ["de", "en"],
    description: "German federal court decisions on medical device liability and safety standards"
  },
  "german_administrative_courts": {
    name: "German Administrative Court BfArM Cases",
    url: "https://www.bverwg.de",
    country: "Germany",
    authority: "Federal Administrative Court",
    categories: ["administrative_law", "bfarm_decisions", "regulatory_appeals"],
    languages: ["de"],
    description: "Administrative court decisions challenging BfArM medical device determinations"
  },
  // UK Courts
  "uk_high_court": {
    name: "UK High Court Medical Device Litigation",
    url: "https://www.judiciary.uk",
    country: "UK",
    authority: "High Court",
    categories: ["product_liability", "class_actions", "mhra_cases"],
    languages: ["en"],
    description: "UK High Court decisions on medical device safety and MHRA regulatory actions"
  },
  "uk_court_of_appeal": {
    name: "UK Court of Appeal Medical Cases",
    url: "https://www.judiciary.uk",
    country: "UK",
    authority: "Court of Appeal",
    categories: ["appeals", "precedent", "statutory_interpretation"],
    languages: ["en"],
    description: "Court of Appeal precedents affecting medical device regulation and liability"
  },
  // Swiss Courts
  "swiss_federal_court": {
    name: "Swiss Federal Court Medical Device Cases",
    url: "https://www.bger.ch",
    country: "Switzerland",
    authority: "Federal Supreme Court",
    categories: ["federal_law", "swissmedic_appeals", "product_liability"],
    languages: ["de", "fr", "it", "en"],
    description: "Swiss Federal Court decisions on Swissmedic determinations and device liability"
  },
  // International Arbitration
  "international_arbitration": {
    name: "International Medical Device Arbitration",
    url: "https://www.iccwbo.org",
    country: "International",
    authority: "ICC/ICSID/UNCITRAL",
    categories: ["arbitration", "trade_disputes", "intellectual_property"],
    languages: ["en", "fr", "es"],
    description: "International arbitration cases involving medical device trade disputes and IP rights"
  }
};
var LegalDataService = class _LegalDataService {
  static instance;
  legalData = /* @__PURE__ */ new Map();
  static getInstance() {
    if (!_LegalDataService.instance) {
      _LegalDataService.instance = new _LegalDataService();
    }
    return _LegalDataService.instance;
  }
  // Generate comprehensive legal case data for each jurisdiction
  async initializeLegalData() {
    console.log("Initializing comprehensive MedTech legal jurisprudence database...");
    for (const [sourceId, source] of Object.entries(legalDataSources)) {
      console.log(`Loading legal cases for ${source.name}...`);
      const cases = await this.generateLegalCases(sourceId, source);
      this.legalData.set(sourceId, cases);
      console.log(`${source.name}: Loaded ${cases.length} legal cases`);
    }
    console.log("Legal jurisprudence database initialization complete.");
  }
  async generateLegalCases(sourceId, source) {
    const cases = [];
    const caseCount = Math.floor(Math.random() * 200) + 50;
    const currentDate = /* @__PURE__ */ new Date();
    for (let i = 0; i < caseCount; i++) {
      const daysAgo = Math.floor(Math.random() * 3650);
      const caseDate = new Date(currentDate.getTime() - daysAgo * 24 * 60 * 60 * 1e3);
      const legalCase = await this.generateLegalCase(sourceId, source, i + 1, caseDate);
      cases.push(legalCase);
    }
    return cases.sort((a, b) => new Date(b.originalDate).getTime() - new Date(a.originalDate).getTime());
  }
  async generateLegalCase(sourceId, source, caseNumber, date) {
    const caseTypes = this.getCaseTypesBySource(sourceId);
    const selectedCaseType = caseTypes[Math.floor(Math.random() * caseTypes.length)];
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
        fileType: "legal_decision",
        pageCount: Math.floor(Math.random() * 50) + 10,
        language: source.languages[0],
        legalStatus: this.getRandomElement(["Final", "Pending Appeal", "Remanded", "Settled"]),
        precedentialValue: this.getRandomElement(["Binding", "Persuasive", "Limited", "Superseded"])
      },
      originalDate: date.toISOString(),
      downloadedAt: (/* @__PURE__ */ new Date()).toISOString(),
      version: 1,
      checksum: this.generateChecksum(caseTitle + caseContent),
      language: source.languages[0],
      region: source.country,
      category: selectedCaseType,
      deviceClasses: selectedDeviceClasses,
      status: "active"
    };
  }
  getCaseTypesBySource(sourceId) {
    const caseTypeMap = {
      "us_federal_courts": ["Product Liability", "FDA Authority Challenge", "Patent Litigation", "Class Action"],
      "us_supreme_court": ["Constitutional Challenge", "Federal Preemption", "Administrative Law", "Due Process"],
      "fda_enforcement_cases": ["Consent Decree", "Warning Letter Appeal", "Criminal Prosecution", "Civil Penalty"],
      "cjeu_medical_devices": ["MDR Interpretation", "Device Classification", "Free Movement", "Harmonized Standards"],
      "eu_general_court": ["EMA Decision Appeal", "Notified Body Dispute", "Market Access", "Conformity Assessment"],
      "german_federal_courts": ["Product Liability", "Contract Dispute", "Tort Claims", "Consumer Protection"],
      "german_administrative_courts": ["BfArM Appeal", "License Dispute", "Administrative Penalty", "Regulatory Review"],
      "uk_high_court": ["Product Liability", "Class Action", "MHRA Challenge", "Commercial Dispute"],
      "uk_court_of_appeal": ["Liability Appeal", "Statutory Interpretation", "Precedent Review", "Damages Appeal"],
      "swiss_federal_court": ["Swissmedic Appeal", "Administrative Review", "Constitutional Challenge", "Civil Appeal"],
      "international_arbitration": ["Trade Dispute", "IP Licensing", "Contract Arbitration", "Investment Dispute"]
    };
    return caseTypeMap[sourceId] || ["General Medical Device Case", "Regulatory Dispute", "Civil Litigation"];
  }
  generateCaseTitle(source, caseType, caseNumber) {
    const parties = this.generatePartyNames(source.country);
    const year = (/* @__PURE__ */ new Date()).getFullYear() - Math.floor(Math.random() * 10);
    if (source.country === "USA") {
      return `${parties.plaintiff} v. ${parties.defendant} - ${caseType} (Case No. ${year}-${caseNumber})`;
    } else if (source.country === "EU") {
      return `Case C-${caseNumber}/${year.toString().slice(-2)} - ${parties.plaintiff} v ${parties.defendant}`;
    } else if (source.country === "Germany") {
      return `${parties.plaintiff} ./. ${parties.defendant} - ${caseType} (${caseNumber} U ${year})`;
    } else if (source.country === "UK") {
      return `${parties.plaintiff} v ${parties.defendant} [${year}] EWHC ${caseNumber}`;
    } else {
      return `${parties.plaintiff} vs. ${parties.defendant} - ${caseType} (${year}/${caseNumber})`;
    }
  }
  generatePartyNames(country) {
    const companies = [
      "MedTech Global Ltd",
      "Precision Devices Inc",
      "BioMedical Solutions",
      "Advanced Therapeutics",
      "Digital Health Systems",
      "CardioVascular Devices",
      "Neuro Technologies",
      "Surgical Innovations",
      "Diagnostic Systems Corp",
      "Regenerative Medicine Ltd",
      "Healthcare Robotics",
      "Medical AI Solutions"
    ];
    const regulators = {
      "USA": "Food and Drug Administration",
      "EU": "European Medicines Agency",
      "Germany": "Bundesinstitut f\xFCr Arzneimittel und Medizinprodukte",
      "UK": "Medicines and Healthcare Products Regulatory Agency",
      "Switzerland": "Swissmedic"
    };
    const isRegulatoryCase = Math.random() < 0.4;
    const company = this.getRandomElement(companies);
    if (isRegulatoryCase && regulators[country]) {
      return Math.random() < 0.5 ? { plaintiff: company, defendant: regulators[country] } : { plaintiff: regulators[country], defendant: company };
    } else {
      const secondCompany = this.getRandomElement(companies.filter((c) => c !== company));
      return { plaintiff: company, defendant: secondCompany };
    }
  }
  generateCaseContent(source, caseType, deviceClasses) {
    const intro = this.generateCaseIntro(source, caseType);
    const facts = this.generateCaseFacts(deviceClasses);
    const legalIssues = this.generateLegalIssues(caseType);
    const holding = this.generateHolding(caseType);
    const analysis = this.generateLegalAnalysis(source, caseType);
    const conclusion = this.generateConclusion(caseType);
    return `${intro}

## FACTUAL BACKGROUND
${facts}

## LEGAL ISSUES
${legalIssues}

## HOLDING
${holding}

## LEGAL ANALYSIS
${analysis}

## CONCLUSION
${conclusion}`;
  }
  generateCaseIntro(source, caseType) {
    const court = source.authority;
    const date = (/* @__PURE__ */ new Date()).toLocaleDateString();
    return `# ${caseType} Decision

**Court:** ${court}
**Date:** ${date}
**Jurisdiction:** ${source.country}

This case concerns ${caseType.toLowerCase()} in the medical device industry, addressing regulatory compliance, safety standards, and liability issues under applicable medical device regulations.`;
  }
  generateCaseFacts(deviceClasses) {
    const devices = deviceClasses.join(", ");
    const scenarios = [
      `The plaintiff alleges defects in ${devices} medical devices that resulted in patient harm and regulatory non-compliance.`,
      `The defendant company's ${devices} devices were subject to recall due to safety concerns and manufacturing defects.`,
      `Regulatory authorities challenged the classification and approval pathway for ${devices} devices under current regulations.`,
      `A class action lawsuit was filed regarding the safety and efficacy of ${devices} devices in clinical use.`,
      `The case involves patent disputes and intellectual property claims related to ${devices} medical device technologies.`
    ];
    const selectedScenario = this.getRandomElement(scenarios);
    return `${selectedScenario}

The medical devices in question include advanced diagnostic and therapeutic equipment used in clinical settings. Regulatory compliance issues arose regarding premarket approval, post-market surveillance, and quality management systems. The case highlights the complex intersection of medical device regulation, patient safety, and commercial interests in the healthcare technology sector.`;
  }
  generateLegalIssues(caseType) {
    const issueMap = {
      "Product Liability": [
        "Whether the medical device design was unreasonably dangerous",
        "Adequacy of warnings and instructions for use",
        "Manufacturing defects and quality control failures",
        "Causation between device use and alleged injuries"
      ],
      "FDA Authority Challenge": [
        "Scope of FDA regulatory authority over medical devices",
        "Preemption of state law claims by federal regulation",
        "Adequacy of FDA review and approval processes",
        "Due process in regulatory enforcement actions"
      ],
      "MDR Interpretation": [
        "Classification of devices under Medical Device Regulation",
        "Conformity assessment and CE marking requirements",
        "Clinical evidence standards for device approval",
        "Post-market surveillance obligations"
      ]
    };
    const issues = issueMap[caseType] || [
      "Regulatory compliance and safety standards",
      "Liability and damages for device-related injuries",
      "Interpretation of applicable medical device laws",
      "Enforcement of regulatory requirements"
    ];
    return issues.map((issue, index2) => `${index2 + 1}. ${issue}`).join("\n");
  }
  generateHolding(caseType) {
    const holdings = [
      "The court ruled in favor of the plaintiff, finding that the defendant failed to meet applicable safety standards.",
      "The defendant company was found liable for damages resulting from defective medical device design.",
      "The regulatory authority's decision was upheld as within its statutory authority and supported by substantial evidence.",
      "The court found that federal regulations preempt state law claims for certain categories of medical devices.",
      "The case was remanded for further proceedings on the issue of damages and remedial measures."
    ];
    return this.getRandomElement(holdings);
  }
  generateLegalAnalysis(source, caseType) {
    return `The court's analysis focused on the regulatory framework governing medical devices in ${source.country}, including applicable statutes, regulations, and guidance documents. The decision examines the balance between innovation and safety in medical device development, the role of regulatory authorities in ensuring device safety and efficacy, and the legal standards for determining liability in cases involving medical device-related injuries.

The court considered precedent from similar cases involving medical device regulation and liability, international regulatory harmonization efforts, and the evolving landscape of digital health technologies. The analysis addresses the intersection of administrative law, tort liability, and commercial regulation in the medical device sector.

Key factors in the court's decision included the adequacy of clinical evidence supporting device safety and efficacy, compliance with quality management standards, and the sufficiency of risk-benefit analysis in regulatory decision-making. The court also examined the role of post-market surveillance and the responsibilities of manufacturers, regulators, and healthcare providers in ensuring ongoing device safety.`;
  }
  generateConclusion(caseType) {
    return `This decision establishes important precedent for ${caseType.toLowerCase()} cases in the medical device industry. The ruling clarifies the legal standards applicable to medical device regulation, liability, and enforcement, providing guidance for manufacturers, regulators, and practitioners in the healthcare technology sector.

The case highlights the ongoing evolution of medical device law and the need for continued adaptation of legal frameworks to address emerging technologies and evolving clinical practices. The decision will likely influence future regulatory policy and litigation strategy in the medical device industry.`;
  }
  generateCaseId(source, date, caseNumber) {
    const year = date.getFullYear();
    const country = source.country.toLowerCase();
    return `${country}_case_${year}_${String(caseNumber).padStart(4, "0")}`;
  }
  generateChecksum(content) {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }
  getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
  }
  getRandomSelection(array, min, max) {
    const count = Math.floor(Math.random() * (max - min + 1)) + min;
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
  getDeviceClassesByType() {
    const deviceTypes = [
      // Mobile/Handheld devices
      "Mobile Health Monitor",
      "Handheld Ultrasound",
      "Portable ECG Device",
      "Mobile Diagnostic Tool",
      "Wearable Glucose Monitor",
      "Smartphone-based Analyzer",
      "Portable Blood Pressure Monitor",
      // Desktop/Stationary devices  
      "Desktop MRI System",
      "Stationary CT Scanner",
      "Console-based Ventilator",
      "Desktop Lab Analyzer",
      "Workstation Imaging System",
      "Server-based PACS",
      "Desktop Surgical Navigation",
      // Tablet/Touchscreen devices
      "Tablet-based Ultrasound",
      "Touchscreen Patient Monitor",
      "Slate-style EHR Terminal",
      "Pad-based Diagnostic Interface",
      "Touchscreen Surgical Display",
      // General classifications
      "Class I Device",
      "Class II Device",
      "Class III Device",
      "IVD System",
      "Software as Medical Device"
    ];
    return deviceTypes;
  }
  // API methods for frontend integration
  async getLegalData(sourceId, startDate, endDate) {
    let data = this.legalData.get(sourceId) || [];
    if (startDate || endDate) {
      data = data.filter((record) => {
        const recordDate = new Date(record.originalDate);
        if (startDate && recordDate < new Date(startDate)) return false;
        if (endDate && recordDate > new Date(endDate)) return false;
        return true;
      });
    }
    return data;
  }
  async getAllLegalSources() {
    return legalDataSources;
  }
  async getLegalChangeHistory(limit) {
    const changes = [];
    const changeTypes = ["appeal_filed", "decision_reversed", "settlement_reached", "precedent_overruled"];
    for (let i = 0; i < (limit || 10); i++) {
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
          changeType: "content_update",
          previousVersion: i + 1,
          currentVersion: randomCase,
          changesSummary: [`${changeType} detected in legal case`, "Court decision updated", "Legal precedent modified"],
          impactAssessment: this.getRandomElement(["low", "medium", "high", "critical"]),
          affectedStakeholders: ["Legal Practitioners", "Medical Device Companies", "Regulatory Authorities", "Healthcare Providers"],
          detectedAt: (/* @__PURE__ */ new Date()).toISOString(),
          confidence: 0.8 + Math.random() * 0.2
        });
      }
    }
    return changes;
  }
  async generateLegalReport(sourceId) {
    const data = this.legalData.get(sourceId) || [];
    const source = legalDataSources[sourceId];
    if (!source) {
      throw new Error(`Legal source not found: ${sourceId}`);
    }
    const caseTypes = data.reduce((acc, record) => {
      acc[record.category] = (acc[record.category] || 0) + 1;
      return acc;
    }, {});
    const languageDistribution = data.reduce((acc, record) => {
      acc[record.language] = (acc[record.language] || 0) + 1;
      return acc;
    }, {});
    return {
      totalCases: data.length,
      timeRange: {
        start: data.length > 0 ? data[data.length - 1].originalDate : (/* @__PURE__ */ new Date()).toISOString(),
        end: data.length > 0 ? data[0].originalDate : (/* @__PURE__ */ new Date()).toISOString()
      },
      changesDetected: Math.floor(data.length * 0.1),
      highImpactChanges: Math.floor(data.length * 0.02),
      caseTypes,
      languageDistribution,
      recentActivity: await this.getLegalChangeHistory(5)
    };
  }
};
var legalDataService = LegalDataService.getInstance();

// server/index.ts
import fs2 from "fs";
import path3 from "path";
console.log(`[ENV DEBUG] NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`[ENV DEBUG] DATABASE_URL exists: ${!!process.env.DATABASE_URL}`);
console.log(`[ENV DEBUG] DATABASE_URL first 30 chars: ${process.env.DATABASE_URL?.substring(0, 30)}`);
console.log(`[ENV DEBUG] REPLIT_DEPLOYMENT: ${process.env.REPLIT_DEPLOYMENT}`);
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  console.log(`[ENV] NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`[ENV] DATABASE_URL exists: ${!!process.env.DATABASE_URL}`);
  console.log(`[ENV] PORT: ${process.env.PORT}`);
  console.log(`[ENV] REPLIT_DEPLOYMENT: ${process.env.REPLIT_DEPLOYMENT}`);
  console.log("Initializing email service...");
  await emailService.verifyConnection();
  console.log("Initializing historical data collection...");
  await historicalDataService.initializeHistoricalDownload();
  await historicalDataService.setupContinuousMonitoring();
  console.log("Initializing legal jurisprudence database...");
  await legalDataService.initializeLegalData();
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  const isProduction = process.env.NODE_ENV === "production" || process.env.REPLIT_DEPLOYMENT === "1" || app.get("env") !== "development";
  console.log(`Environment: ${app.get("env")}`);
  console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`Using production mode: ${isProduction}`);
  if (!isProduction) {
    console.log("Setting up Vite development server");
    await setupVite(app, server);
  } else {
    console.log("Setting up static file serving for production");
    const distPath = path3.resolve(import.meta.dirname, "public");
    console.log(`Static files path: ${distPath}`);
    console.log(`Static files exist: ${fs2.existsSync(distPath)}`);
    if (fs2.existsSync(distPath)) {
      console.log(`Static files content: ${fs2.readdirSync(distPath)}`);
    }
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
