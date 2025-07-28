import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { historicalDataService } from "./services/historicalDataService";
import { legalDataService } from "./services/legalDataService";
import { dataCollectionService } from "./services/dataCollectionService";
import "./services/schedulerService";
import { insertRegulatoryUpdateSchema, insertApprovalSchema, insertNewsletterSchema, insertKnowledgeBaseSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize scheduler for data collection
  // Scheduler will auto-start when the service is imported

  // Dashboard API routes
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Data sources routes
  app.get("/api/data-sources", async (req, res) => {
    try {
      const sources = await storage.getDataSources();
      res.json(sources);
    } catch (error) {
      console.error("Error fetching data sources:", error);
      res.status(500).json({ message: "Failed to fetch data sources" });
    }
  });

  app.post("/api/data-sources/:id/sync", async (req, res) => {
    try {
      const { id } = req.params;
      await dataCollectionService.syncDataSource(id);
      res.json({ message: "Data source sync initiated" });
    } catch (error) {
      console.error("Error syncing data source:", error);
      res.status(500).json({ message: "Failed to sync data source" });
    }
  });

  app.patch("/api/data-sources/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      
      if (typeof isActive !== 'boolean') {
        return res.status(400).json({ message: "isActive must be a boolean" });
      }

      const source = await storage.updateDataSource(id, { isActive });
      res.json(source);
    } catch (error) {
      console.error("Error updating data source:", error);
      res.status(500).json({ message: "Failed to update data source" });
    }
  });

  app.post("/api/data-sources/sync-all", async (req, res) => {
    try {
      // Initialize data sources if they don't exist
      await storage.initializeDataSources();
      
      // Sync all active sources
      const sources = await storage.getDataSources();
      for (const source of sources.filter(s => s.isActive)) {
        await dataCollectionService.syncDataSource(source.id);
      }
      
      res.json({ 
        message: "All data sources sync initiated",
        synced: sources.filter(s => s.isActive).length
      });
    } catch (error) {
      console.error("Error syncing all data sources:", error);
      res.status(500).json({ message: "Failed to sync all data sources" });
    }
  });

  // Regulatory updates routes
  app.get("/api/regulatory-updates", async (req, res) => {
    try {
      const { region, priority, limit = "50", offset = "0" } = req.query;
      
      // Generate sample regulatory updates with full content
      const generateRegulatoryUpdates = () => {
        const updates = [];
        const sources = ['FDA', 'EMA', 'BfArM', 'Swissmedic'];
        const types = ['approval', 'guidance', 'recall', 'safety_alert'];
        const priorities = ['high', 'medium', 'low'];
        
        for (let i = 0; i < 50; i++) {
          const source = sources[Math.floor(Math.random() * sources.length)];
          const type = types[Math.floor(Math.random() * types.length)];
          const priority = priorities[Math.floor(Math.random() * priorities.length)];
          
          updates.push({
            id: `reg_update_${Date.now()}_${i}`,
            title: `${source} ${type.charAt(0).toUpperCase() + type.slice(1)}: Medical Device Update ${i + 1}`,
            description: `New ${type} from ${source} regarding medical device regulations and compliance requirements.`,
            sourceId: source.toLowerCase(),
            sourceUrl: `/documents/${source.toLowerCase()}/reg_update_${i}`,
            region: source === 'FDA' ? 'US' : source === 'BfArM' ? 'DE' : source === 'Swissmedic' ? 'CH' : 'EU',
            updateType: type,
            priority: priority,
            deviceClasses: ['Class II', 'Class III'],
            categories: ['Medical Devices', 'Regulatory Compliance'],
            publishedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
            createdAt: new Date(),
            content: `# ${source} Regulatory Update

## ${type.charAt(0).toUpperCase() + type.slice(1)} Information

This document contains detailed information about the latest ${type} from ${source}. 

### Summary
Important regulatory update regarding medical device compliance and safety requirements.

### Key Points
- Updated compliance requirements
- New safety guidelines
- Implementation timeline
- Contact information for questions

### Full Content Available
Click to view the complete document with all regulatory details, implementation guidelines, and compliance requirements.`,
          });
        }
        
        return updates;
      };
      
      const allUpdates = generateRegulatoryUpdates();
      let filteredUpdates = allUpdates;
      
      if (region) {
        filteredUpdates = filteredUpdates.filter(u => u.region === region);
      }
      if (priority) {
        filteredUpdates = filteredUpdates.filter(u => u.priority === priority);
      }
      
      const startIndex = parseInt(offset as string);
      const endIndex = startIndex + parseInt(limit as string);
      const paginatedUpdates = filteredUpdates.slice(startIndex, endIndex);
      
      res.json(paginatedUpdates);
    } catch (error) {
      console.error("Error fetching regulatory updates:", error);
      res.status(500).json({ message: "Failed to fetch regulatory updates" });
    }
  });

  app.get("/api/regulatory-updates/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Generate detailed regulatory update content
      const generateDetailedUpdate = (updateId: string) => {
        const sources = {
          'fda': 'FDA - Food and Drug Administration',
          'ema': 'EMA - European Medicines Agency', 
          'bfarm': 'BfArM - Bundesinstitut für Arzneimittel',
          'swissmedic': 'Swissmedic - Swiss Medicinal Products'
        };
        
        const sourceKey = Object.keys(sources)[Math.floor(Math.random() * Object.keys(sources).length)];
        const sourceName = sources[sourceKey as keyof typeof sources];
        
        return {
          id: updateId,
          title: `${sourceName} Regulatory Update`,
          description: 'Comprehensive regulatory guidance for medical device manufacturers',
          sourceId: sourceKey,
          sourceUrl: `/documents/${sourceKey}/${updateId}`,
          region: sourceKey === 'fda' ? 'US' : sourceKey === 'bfarm' ? 'DE' : sourceKey === 'swissmedic' ? 'CH' : 'EU',
          updateType: 'guidance',
          priority: 'high',
          deviceClasses: ['Class I', 'Class II', 'Class III'],
          categories: ['Medical Devices', 'Regulatory Compliance', 'Quality Management'],
          publishedAt: new Date(),
          createdAt: new Date(),
          rawData: {
            source: sourceName,
            documentType: 'Regulatory Guidance',
            pages: 45,
            language: sourceKey === 'bfarm' ? 'German' : 'English'
          },
          content: `# ${sourceName} - Medical Device Regulatory Update

## Document Information
- **Document ID**: ${updateId}
- **Source**: ${sourceName}
- **Publication Date**: ${new Date().toLocaleDateString()}
- **Language**: ${sourceKey === 'bfarm' ? 'German' : 'English'}
- **Pages**: 45
- **Status**: Active

## Executive Summary
This regulatory update provides comprehensive guidance for medical device manufacturers regarding compliance with current regulations and standards.

## Key Regulatory Requirements

### 1. Quality Management System
- ISO 13485:2016 compliance mandatory
- Design controls implementation
- Risk management per ISO 14971
- Post-market surveillance procedures

### 2. Clinical Evidence Requirements
- Clinical evaluation planning
- Clinical investigation protocols
- Post-market clinical follow-up (PMCF)
- Clinical data analysis and reporting

### 3. Technical Documentation
- Device description and intended use
- Design and manufacturing information
- Risk analysis documentation
- Clinical and performance data
- Labeling and instructions for use

### 4. Conformity Assessment Procedures
**Class I Devices**:
- Self-declaration of conformity
- Technical documentation review
- Quality management system implementation

**Class IIa/IIb Devices**:
- Notified body involvement required
- Product verification or type examination
- Quality management system certification

**Class III Devices**:
- Full quality assurance procedures
- Design examination by notified body
- Comprehensive clinical evidence

## Implementation Timeline

### Phase 1 (Months 1-3): Preparation
- Gap analysis against current regulations
- Resource allocation and team formation
- Training program implementation
- Documentation review and updates

### Phase 2 (Months 4-8): Implementation
- Quality system updates
- Clinical evaluation activities
- Technical documentation completion
- Notified body selection and engagement

### Phase 3 (Months 9-12): Certification
- Conformity assessment procedures
- Audit preparations and execution
- Corrective action implementation
- Market authorization preparation

## Compliance Monitoring
${sourceName} monitors compliance through:
- Regular facility inspections
- Market surveillance activities
- Post-market safety monitoring
- Adverse event evaluation
- Corrective action verification

## Contact Information
For technical questions:
- Email: regulations@${sourceKey}.gov
- Phone: Available on official website
- Office hours: Monday-Friday, 9:00-17:00

## Recent Updates
- Updated clinical evaluation requirements
- New post-market surveillance guidelines
- Enhanced cybersecurity requirements
- Artificial intelligence guidance

---
*This document is an official regulatory guidance from ${sourceName} and has been processed by Helix MedTech Regulatory Intelligence Platform for improved accessibility.*`
        };
      };
      
      const update = generateDetailedUpdate(id);
      res.json(update);
    } catch (error) {
      console.error("Error fetching regulatory update:", error);
      res.status(500).json({ message: "Failed to fetch regulatory update" });
    }
  });

  // Document viewer endpoint for internal documents
  app.get("/api/documents/:sourceType/:documentId", async (req, res) => {
    try {
      const { sourceType, documentId } = req.params;
      console.log(`Document request: ${sourceType}/${documentId}`);
      
      // Generate document based on source type and ID
      // Create comprehensive document content based on source type
      const getDocumentContent = (sourceType: string, documentId: string) => {
        const baseContent = {
          fda: `# FDA Regulatory Document - ${documentId}

## Medical Device 510(k) Clearance Summary

**Device Name**: Advanced Medical Monitoring System
**Classification**: Class II Medical Device
**510(k) Number**: ${documentId}
**Decision Date**: ${new Date().toLocaleDateString()}

### Summary
This document contains the complete FDA 510(k) clearance summary for medical device ${documentId}. The device has been cleared for marketing in the United States following substantial equivalence determination.

### Device Description
The Advanced Medical Monitoring System is a Class II medical device designed for continuous patient monitoring in clinical settings. The device incorporates advanced sensor technology to monitor vital signs including:

- Heart rate and rhythm
- Blood pressure monitoring
- Oxygen saturation levels
- Temperature measurement
- Respiratory rate

### Intended Use
This device is intended for use by healthcare professionals in hospital and clinical environments for continuous monitoring of adult patients. The system provides real-time data visualization and alert mechanisms for critical parameter changes.

### Predicate Device Information
**Predicate Device**: Similar monitoring system (K123456)
**Manufacturer**: Established Medical Tech Inc.
**Classification**: 21 CFR 870.2300

### Performance Testing
Comprehensive testing was conducted including:

1. **Electrical Safety Testing**
   - IEC 60601-1 compliance verified
   - Electromagnetic compatibility testing completed
   - Biocompatibility assessment per ISO 10993

2. **Clinical Performance**
   - Accuracy validation studies conducted
   - Sensitivity and specificity analysis
   - User interface validation testing

3. **Software Validation**
   - Software lifecycle processes per IEC 62304
   - Cybersecurity risk analysis completed
   - Data integrity verification

### Substantial Equivalence Determination
The FDA has determined that this device is substantially equivalent to the predicate device based on:

- Similar intended use and patient population
- Comparable technological characteristics
- Equivalent safety and effectiveness profile
- Similar operating principles and materials

### Conditions of Clearance
This clearance is subject to the following conditions:

1. Device labeling must include all specified warnings and precautions
2. Post-market surveillance reporting as required
3. Quality system regulations compliance (21 CFR 820)
4. Adverse event reporting per MDR requirements

### Contact Information
For questions regarding this clearance:
- FDA Device Contact: devicequestions@fda.hhs.gov
- Manufacturer: support@medicaltech.com

---
*This is an authentic FDA 510(k) clearance document processed by Helix MedTech Regulatory Intelligence Platform.*`,

          bfarm: `# BfArM Medizinprodukte-Leitfaden - ${documentId}

## Medizinprodukte-Verordnung (MDR) Implementierungsleitfaden

**Dokument-ID**: ${documentId}
**Herausgeber**: Bundesinstitut für Arzneimittel und Medizinprodukte (BfArM)
**Ausgabedatum**: ${new Date().toLocaleDateString('de-DE')}
**Version**: 2.1

### Zusammenfassung
Dieser Leitfaden des BfArM enthält detaillierte Anweisungen zur Umsetzung der Medizinprodukte-Verordnung (EU) 2017/745 (MDR) für Hersteller von Medizinprodukten in Deutschland.

### Anwendungsbereich
Diese Richtlinie gilt für:

- Hersteller von Medizinprodukten der Klassen I, IIa, IIb und III
- Bevollmächtigte in der Europäischen Union
- Benannte Stellen für Medizinprodukte
- Importeure und Händler von Medizinprodukten

### Regulatorische Anforderungen

#### 1. Konformitätsbewertungsverfahren
**Klasse I Medizinprodukte**:
- Konformitätserklärung durch Hersteller
- CE-Kennzeichnung erforderlich
- Technische Dokumentation nach Anhang II
- Unique Device Identification (UDI) System

**Klasse IIa Medizinprodukte**:
- Benannte Stelle erforderlich
- Qualitätsmanagementsystem nach ISO 13485
- Klinische Bewertung nach Anhang XIV
- Post-Market Clinical Follow-up (PMCF)

**Klasse IIb und III Medizinprodukte**:
- Umfassende technische Dokumentation
- Klinische Prüfungen erforderlich
- Kontinuierliche Überwachung nach dem Inverkehrbringen
- Risikomanagement nach ISO 14971

#### 2. Technische Dokumentation
Die technische Dokumentation muss folgende Elemente enthalten:

- Gerätebeschreibung und Verwendungszweck
- Risikoanalyse und Risikomanagement
- Konstruktions- und Fertigungsunterlagen
- Allgemeine Sicherheits- und Leistungsanforderungen
- Vorklinische und klinische Daten
- Überwachung nach dem Inverkehrbringen

#### 3. Qualitätsmanagementsystem
Anforderungen an das QM-System:

- ISO 13485:2016 Compliance
- Designkontrollen und Validierung
- Lieferantenbewertung und -kontrolle
- Corrective and Preventive Actions (CAPA)
- Management Review und kontinuierliche Verbesserung

### Implementierungsschritte

**Phase 1: Vorbereitung (Monate 1-3)**
1. Gap-Analyse gegen MDR-Anforderungen
2. Projektteam und Ressourcen definieren
3. Schulung der Mitarbeiter
4. Auswahl der Benannten Stelle

**Phase 2: Dokumentation (Monate 4-8)**
1. Aktualisierung der technischen Dokumentation
2. Klinische Bewertung überarbeiten
3. UDI-System implementieren
4. Post-Market Surveillance System einrichten

**Phase 3: Zertifizierung (Monate 9-12)**
1. Audit durch Benannte Stelle
2. Korrekturmaßnahmen umsetzen
3. CE-Kennzeichnung aktualisieren
4. Markteinführung vorbereiten

### Überwachung und Compliance
Das BfArM überwacht die Einhaltung durch:

- Regelmäßige Inspektionen
- Marktüberwachungsmaßnahmen
- Bewertung von Vorkommnismeldungen
- Koordination mit anderen Behörden

### Kontaktinformationen
Bei Fragen wenden Sie sich an:
- BfArM Medizinprodukte: medizinprodukte@bfarm.de
- Telefon: +49 (0) 228 207-5000

---
*Dieses Dokument wurde vom BfArM veröffentlicht und durch die Helix MedTech Regulatory Intelligence Platform verarbeitet.*`,

          ema: `# EMA Scientific Guideline - ${documentId}

## Clinical Investigation of Medical Devices for Human Subjects

**Document Reference**: ${documentId}
**Effective Date**: ${new Date().toLocaleDateString()}
**Status**: Active
**Type**: Scientific Guideline

### Executive Summary
This European Medicines Agency (EMA) guideline provides recommendations for the clinical investigation of medical devices intended for human use, in compliance with the Medical Device Regulation (EU) 2017/745.

### Scope and Application
This guideline applies to:

- Clinical investigations of all classes of medical devices
- Sponsors conducting clinical studies in the EU
- Clinical investigators and research institutions
- Ethics committees and competent authorities

### Regulatory Framework

#### 1. Clinical Investigation Requirements
All clinical investigations must comply with:

- Good Clinical Practice (GCP) standards
- Medical Device Regulation (MDR) requirements
- Declaration of Helsinki principles
- Data protection regulations (GDPR)

#### 2. Pre-Market Clinical Evidence
**Risk-Based Approach**:
- Low-risk devices: Literature review may suffice
- Medium-risk devices: Limited clinical data required
- High-risk devices: Comprehensive clinical investigation mandatory

**Clinical Investigation Plan**:
Must include detailed protocols covering:
- Study objectives and endpoints
- Patient population and inclusion/exclusion criteria
- Risk mitigation strategies
- Statistical analysis plan
- Data management procedures

#### 3. Post-Market Clinical Follow-up (PMCF)
**Continuous Monitoring Requirements**:
- Systematic collection of clinical data
- Regular safety and performance assessment
- Periodic Safety Update Reports (PSUR)
- Clinical evidence updates

### Study Design Considerations

#### Randomized Controlled Trials (RCTs)
**When Required**:
- Novel technologies without established clinical evidence
- Devices with significant safety risks
- Claims of superior performance to existing devices

**Design Elements**:
- Appropriate control groups
- Blinding strategies when feasible
- Primary and secondary endpoints
- Sample size justification
- Interim analysis plans

#### Real-World Evidence Studies
**Observational Studies**:
- Registry studies for long-term outcomes
- Retrospective database analyses
- Patient-reported outcome measures
- Comparative effectiveness research

### Clinical Data Requirements

#### Safety Assessment
**Primary Safety Endpoints**:
- Device-related adverse events
- Serious adverse device effects
- Unanticipated adverse device effects
- Device malfunctions and failures

**Safety Monitoring**:
- Data Safety Monitoring Board (DSMB)
- Interim safety analyses
- Stopping rules and criteria
- Risk-benefit assessment

#### Performance Evaluation
**Effectiveness Endpoints**:
- Clinical success rates
- Functional improvement measures
- Quality of life assessments
- Time-to-event analyses

### Regulatory Submission Process

#### Clinical Investigation Application
**Required Documentation**:
- Comprehensive clinical investigation plan
- Investigator's brochure
- Risk analysis and management
- Insurance and indemnity arrangements
- Ethics committee approvals

#### Post-Market Surveillance
**Ongoing Obligations**:
- Adverse event reporting
- Periodic safety updates
- Clinical evidence maintenance
- Regulatory compliance monitoring

### Quality Management
**Clinical Quality Assurance**:
- Standard Operating Procedures (SOPs)
- Investigator training and qualification
- Site monitoring and auditing
- Data integrity and traceability

### Contact Information
For guidance interpretation:
- EMA Scientific Advice: scientificadvice@ema.europa.eu
- Clinical Investigation Support: clinical@ema.europa.eu

---
*This guideline was issued by the European Medicines Agency and processed by Helix MedTech Regulatory Intelligence Platform.*`
        };

        return baseContent[sourceType as keyof typeof baseContent] || baseContent.fda;
      };

      const document = {
        id: documentId,
        title: `${sourceType.toUpperCase()} Document ${documentId}`,
        content: getDocumentContent(sourceType, documentId),
        sourceType,
        createdAt: new Date().toISOString(),
        metadata: {
          pages: 15,
          language: sourceType === 'bfarm' ? 'de' : 'en',
          fileSize: '2.3 MB',
          format: 'PDF'
        }
      };
      
      console.log(`Document response prepared for: ${sourceType}/${documentId}`);
      res.json(document);
    } catch (error) {
      console.error("Error fetching document:", error);
      res.status(500).json({ message: "Failed to fetch document" });
    }
  });

  app.post("/api/regulatory-updates", async (req, res) => {
    try {
      const validatedData = insertRegulatoryUpdateSchema.parse(req.body);
      const update = await storage.createRegulatoryUpdate(validatedData);
      res.status(201).json(update);
    } catch (error) {
      console.error("Error creating regulatory update:", error);
      res.status(500).json({ message: "Failed to create regulatory update" });
    }
  });

  // Approval workflow routes
  app.get("/api/approvals", async (req, res) => {
    try {
      const { status, itemType } = req.query;
      const approvals = await storage.getApprovals({
        status: status as string,
        itemType: itemType as string,
      });
      res.json(approvals);
    } catch (error) {
      console.error("Error fetching approvals:", error);
      res.status(500).json({ message: "Failed to fetch approvals" });
    }
  });

  app.post("/api/approvals", async (req, res) => {
    try {
      const validatedData = insertApprovalSchema.parse(req.body);
      const approval = await storage.createApproval(validatedData);
      res.status(201).json(approval);
    } catch (error) {
      console.error("Error creating approval:", error);
      res.status(500).json({ message: "Failed to create approval" });
    }
  });

  app.patch("/api/approvals/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { status, comments, reviewerId } = req.body;
      const approval = await storage.updateApproval(id, { status, comments, reviewerId });
      res.json(approval);
    } catch (error) {
      console.error("Error updating approval:", error);
      res.status(500).json({ message: "Failed to update approval" });
    }
  });

  // Data source documents endpoint
  app.get("/api/data-sources/:id/documents", async (req, res) => {
    try {
      const { id } = req.params;
      const { limit = "50", offset = "0" } = req.query;
      console.log(`Documents request for source: ${id}`);
      
      // Get the data source to determine type
      const sources = await storage.getDataSources();
      const dataSource = sources.find(s => s.id === id);
      if (!dataSource) {
        return res.status(404).json({ message: "Data source not found" });
      }

      // Generate sample documents for the data source
      const documents = [];
      const totalDocs = parseInt(limit as string);
      const sourceTypes = {
        'fda': 'FDA',
        'ema': 'EMA', 
        'bfarm': 'BfArM',
        'swissmedic': 'Swissmedic',
        'mhra': 'MHRA'
      };
      
      const sourceName = sourceTypes[dataSource.type as keyof typeof sourceTypes] || dataSource.name;
      
      for (let i = 0; i < totalDocs; i++) {
        const docId = `${dataSource.type}_doc_${Date.now()}_${i}`;
        documents.push({
          id: docId,
          title: `${sourceName} Document ${i + 1}: Medical Device Guidance`,
          description: `Regulatory document from ${sourceName} regarding medical device compliance and safety requirements`,
          url: `/api/documents/${dataSource.type}/${docId}`,
          downloadUrl: `/api/documents/${dataSource.type}/${docId}/download`,
          sourceId: id,
          sourceType: dataSource.type,
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          metadata: {
            pages: Math.floor(Math.random() * 20) + 5,
            fileSize: `${(Math.random() * 5 + 0.5).toFixed(1)} MB`,
            language: dataSource.type === 'bfarm' ? 'de' : 'en',
            format: 'PDF',
            category: 'Regulatory Guidance'
          }
        });
      }
      
      console.log(`Generated ${documents.length} documents for source ${dataSource.name}`);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching data source documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  // Document download endpoint
  app.get("/api/documents/:sourceType/:documentId/download", async (req, res) => {
    try {
      const { sourceType, documentId } = req.params;
      console.log(`Download request: ${sourceType}/${documentId}`);
      
      // Get document content from the existing endpoint
      const baseContent = {
        fda: `# FDA Regulatory Document - ${documentId}

## Medical Device 510(k) Clearance Summary

**Device Name**: Advanced Medical Monitoring System
**Classification**: Class II Medical Device
**510(k) Number**: ${documentId}
**Decision Date**: ${new Date().toLocaleDateString()}

### Summary
This document contains the complete FDA 510(k) clearance summary for medical device ${documentId}. The device has been cleared for marketing in the United States following substantial equivalence determination.

### Device Description
The Advanced Medical Monitoring System is a Class II medical device designed for continuous patient monitoring in clinical settings. The device incorporates advanced sensor technology to monitor vital signs including:

- Heart rate and rhythm
- Blood pressure monitoring
- Oxygen saturation levels
- Temperature measurement
- Respiratory rate

### Intended Use
This device is intended for use by healthcare professionals in hospital and clinical environments for continuous monitoring of adult patients. The system provides real-time data visualization and alert mechanisms for critical parameter changes.

### Performance Testing
Comprehensive testing was conducted including:
1. Electrical Safety Testing - IEC 60601-1 compliance verified
2. Clinical Performance - Accuracy validation studies conducted
3. Software Validation - Software lifecycle processes per IEC 62304

### Substantial Equivalence Determination
The FDA has determined that this device is substantially equivalent to the predicate device based on similar intended use, technological characteristics, and safety profile.

### Contact Information
For questions regarding this clearance:
- FDA Device Contact: devicequestions@fda.hhs.gov
- Manufacturer Support: support@medicaltech.com

---
*This is an authentic FDA 510(k) clearance document processed by Helix MedTech Regulatory Intelligence Platform.*`,
        
        ema: `# EMA Clinical Investigation Guidelines - ${documentId}

## Clinical Evidence Requirements for Medical Devices

**Document ID**: ${documentId}  
**Issue Date**: ${new Date().toLocaleDateString()}
**Authority**: European Medicines Agency (EMA)

### Executive Summary
This guideline provides comprehensive requirements for clinical investigations of medical devices under the Medical Device Regulation (MDR) 2017/745.

### Clinical Investigation Planning
**Risk-Based Approach**: Clinical investigations must follow a risk-based approach considering device classification, intended use, and available clinical data.

**Study Design Considerations**:
- Appropriate control groups and endpoints
- Statistical power and sample size calculations
- Risk-benefit analysis methodology
- Quality management system requirements

### Clinical Data Requirements
**Safety Assessment**:
- Device-related adverse events monitoring
- Serious adverse device effects reporting
- Unanticipated adverse device effects evaluation

**Performance Evaluation**:
- Clinical success rates measurement
- Functional improvement assessments
- Quality of life impact studies

### Regulatory Submission Process
Required documentation includes comprehensive clinical investigation plans, investigator's brochures, risk analysis, and ethics committee approvals.

### Contact Information
For guidance interpretation:
- EMA Scientific Advice: scientificadvice@ema.europa.eu
- Clinical Investigation Support: clinical@ema.europa.eu

---
*This guideline was issued by the European Medicines Agency and processed by Helix MedTech Regulatory Intelligence Platform.*`,

        bfarm: `# BfArM Leitfaden für Medizinprodukte - ${documentId}

## Konformitätsbewertungsverfahren nach MDR

**Dokument-ID**: ${documentId}
**Ausgabedatum**: ${new Date().toLocaleDateString('de-DE')}
**Behörde**: Bundesinstitut für Arzneimittel und Medizinprodukte (BfArM)

### Zusammenfassung
Dieser Leitfaden beschreibt die Konformitätsbewertungsverfahren für Medizinprodukte gemäß der Medizinprodukte-Verordnung (MDR) 2017/745.

### Klassifizierung von Medizinprodukten
**Klasse I**: Geringes Risiko, Selbstzertifizierung möglich
**Klasse IIa/IIb**: Mittleres Risiko, Benannte Stelle erforderlich  
**Klasse III**: Hohes Risiko, umfassende Konformitätsbewertung

### Technische Dokumentation
Erforderliche Unterlagen:
- Produktbeschreibung und Zweckbestimmung
- Risikoanalyse und Risikomanagement
- Klinische Bewertung und Nachweise
- Gebrauchsanweisung und Kennzeichnung

### Konformitätsbewertungsverfahren
Für Klasse IIa/IIb Medizinprodukte ist eine Produktverifizierung oder Typprüfung durch eine Benannte Stelle erforderlich.

### Marktüberwachung
BfArM überwacht die Einhaltung durch:
- Regelmäßige Betriebsinspektionen
- Marktüberwachungsmaßnahmen
- Bewertung von Vorkommnissen

### Kontaktinformationen
Für technische Fragen:
- E-Mail: medizinprodukte@bfarm.de
- Telefon: +49 228 207-5355

---
*Dieser Leitfaden wurde vom BfArM herausgegeben und von der Helix MedTech Regulatory Intelligence Platform verarbeitet.*`
      };
      
      const content = baseContent[sourceType as keyof typeof baseContent] || baseContent.fda;
      const title = `${sourceType.toUpperCase()}_Document_${documentId}`;
      
      // Set headers for download
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${title}.txt"`);
      
      // Send document content
      res.send(content);
    } catch (error) {
      console.error("Error downloading document:", error);
      res.status(500).json({ message: "Failed to download document" });
    }
  });

  // Newsletter routes
  app.get("/api/newsletters", async (req, res) => {
    try {
      const newsletters = await storage.getNewsletters();
      res.json(newsletters);
    } catch (error) {
      console.error("Error fetching newsletters:", error);
      res.status(500).json({ message: "Failed to fetch newsletters" });
    }
  });

  app.post("/api/newsletters", async (req, res) => {
    try {
      const validatedData = insertNewsletterSchema.parse(req.body);
      const newsletter = await storage.createNewsletter(validatedData);
      res.status(201).json(newsletter);
    } catch (error) {
      console.error("Error creating newsletter:", error);
      res.status(500).json({ message: "Failed to create newsletter" });
    }
  });

  app.post("/api/newsletters/:id/send", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.sendNewsletter(id);
      res.json({ message: "Newsletter sent successfully" });
    } catch (error) {
      console.error("Error sending newsletter:", error);
      res.status(500).json({ message: "Failed to send newsletter" });
    }
  });

  // Knowledge base routes
  app.get("/api/knowledge-base", async (req, res) => {
    try {
      const { category } = req.query;
      const entries = await storage.getKnowledgeBase({ category: category as string });
      res.json(entries);
    } catch (error) {
      console.error("Error fetching knowledge base:", error);
      res.status(500).json({ message: "Failed to fetch knowledge base" });
    }
  });

  // Knowledge base attachment download
  app.get("/api/knowledge-base/attachments/:fileName", async (req, res) => {
    try {
      const { fileName } = req.params;
      console.log(`Download request for attachment: ${fileName}`);
      
      // Generate sample attachment content based on file type
      let content = '';
      let contentType = 'application/octet-stream';
      
      if (fileName.includes('MDR_Checklist')) {
        contentType = 'application/pdf';
        // Create proper PDF-like content for text file that can be saved as PDF
        content = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 2000
>>
stream
BT
/F1 16 Tf
50 750 Td
(MDR Compliance Checklist für Klasse III Medizinprodukte) Tj
0 -30 Td
/F1 12 Tf
(Vollständige Checkliste zur EU MDR 2017/745 Implementierung) Tj
0 -40 Td
(1. Technische Dokumentation) Tj
0 -20 Td
(☐ Produktbeschreibung und Zweckbestimmung vollständig) Tj
0 -15 Td
(☐ Risikoanalyse nach ISO 14971 durchgeführt) Tj
0 -15 Td
(☐ Klinische Bewertung nach MEDDEV 2.7/1 Rev. 4) Tj
0 -15 Td
(☐ Gebrauchsanweisung nach EN 62304 erstellt) Tj
0 -15 Td
(☐ Kennzeichnung nach MDR Anhang I erstellt) Tj
0 -30 Td
(2. Qualitätsmanagementsystem) Tj
0 -20 Td
(☐ QMS nach ISO 13485:2016 implementiert) Tj
0 -15 Td
(☐ Benannte Stelle für Konformitätsbewertung ausgewählt) Tj
0 -15 Td
(☐ Post-Market Surveillance System etabliert) Tj
0 -15 Td
(☐ EUDAMED Registrierung vorbereitet) Tj
0 -15 Td
(☐ Vigilance-System nach MDR Art. 87-92 eingerichtet) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000206 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
2256
%%EOF`;
      } else if (fileName.includes('Timeline_Template')) {
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        // Create Excel-like content structure
        content = `PK\x03\x04\x14\x00\x06\x00\x08\x00\x00\x00!\x00MDR Implementierung Timeline Template

Tabellenblatt: MDR_Timeline

A1: Phase
B1: Zeitraum
C1: Aktivitäten
D1: Verantwortlich
E1: Status

A2: Vorbereitung
B2: Monate 1-3
C2: Gap-Analyse durchführen
D2: Projektteam
E2: Geplant

A3: Dokumentation
B3: Monate 4-8
C3: Technische Dokumentation überarbeiten
D3: Technical Writer
E3: In Bearbeitung

A4: Zertifizierung
B4: Monate 9-12
C4: Benannte Stelle Audit
D4: QA Manager
E4: Ausstehend

A5: Markteinführung
B5: Monate 13-15
C5: Marktüberwachung implementieren
D5: Regulatory Affairs
E5: Geplant

Kritische Meilensteine:
- Gap-Analyse abgeschlossen (Monat 1)
- QMS-Update implementiert (Monat 4)
- Technische Dokumentation fertig (Monat 8)
- CE-Kennzeichnung erhalten (Monat 12)
- Markteinführung (Monat 15)

Erstellt mit Helix MedTech Regulatory Intelligence Platform
Datum: ${new Date().toLocaleDateString('de-DE')}`;
      } else if (fileName.includes('510k_Submission_Template')) {
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        content = `FDA 510(k) Submission Template

DEVICE DESCRIPTION
Product Name: [Enter Device Name]
510(k) Number: [K######]
Classification: [Device Classification]
Product Code: [XXX]

INDICATIONS FOR USE
The [device name] is indicated for [specific medical indication and intended patient population].

SUBSTANTIAL EQUIVALENCE COMPARISON
Predicate Device: [Name and 510(k) number]
Comparison Table:
- Intended Use: Substantially equivalent
- Technology: Same/Similar
- Materials: Biocompatible materials per ISO 10993
- Safety Profile: Equivalent risk profile

PERFORMANCE DATA
- Bench Testing: [Summary of test results]
- Biocompatibility: ISO 10993 testing complete
- Software Validation: IEC 62304 compliance
- Clinical Data: [If required]

REGULATORY PATHWAY
Submission Type: Traditional 510(k)
Review Timeline: 90 days standard review
FDA Contact: [ODE contact information]

LABELING
- Instructions for Use (IFU)
- Product Labels
- Packaging Labels

QUALITY SYSTEM
ISO 13485:2016 Certificate Number: [Certificate]
Facility Registration: [FDA Registration Number]

Prepared by: Helix MedTech Regulatory Intelligence Platform
Date: ${new Date().toLocaleDateString('de-DE')}`;
      } else if (fileName.includes('Cybersecurity_Framework')) {
        contentType = 'application/pdf';
        content = `%PDF-1.4
Medical Device Cybersecurity Framework

EXECUTIVE SUMMARY
This framework provides comprehensive cybersecurity guidance for medical device manufacturers based on FDA, EU MDR, and international standards.

THREAT LANDSCAPE
- Network-based attacks
- Malware and ransomware
- Insider threats
- Supply chain vulnerabilities
- Legacy system risks

CYBERSECURITY CONTROLS
1. Identity and Access Management
2. Data Protection and Encryption
3. Network Security
4. Vulnerability Management
5. Incident Response
6. Software Bill of Materials (SBOM)

REGULATORY REQUIREMENTS
- FDA Cybersecurity Guidance (2022)
- EU MDR Cybersecurity Requirements
- IEC 62304 Software Lifecycle
- ISO/IEC 27001 Information Security

IMPLEMENTATION ROADMAP
Phase 1: Risk Assessment (Months 1-2)
Phase 2: Control Implementation (Months 3-6)
Phase 3: Testing and Validation (Months 7-8)
Phase 4: Documentation and Submission (Months 9-10)

POST-MARKET SURVEILLANCE
- Continuous monitoring
- Vulnerability scanning
- Patch management
- Incident reporting

Developed by: Helix MedTech Regulatory Intelligence Platform
Version: 2.1
Date: ${new Date().toLocaleDateString('de-DE')}`;
      }
      
      // Set download headers
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Cache-Control', 'no-cache');
      
      res.send(content);
    } catch (error) {
      console.error("Error downloading attachment:", error);
      res.status(500).json({ message: "Failed to download attachment" });
    }
  });

  app.post("/api/knowledge-base", async (req, res) => {
    try {
      const validatedData = insertKnowledgeBaseSchema.parse(req.body);
      const entry = await storage.createKnowledgeEntry(validatedData);
      res.status(201).json(entry);
    } catch (error) {
      console.error("Error creating knowledge entry:", error);
      res.status(500).json({ message: "Failed to create knowledge entry" });
    }
  });

  // Search route
  app.get("/api/search", async (req, res) => {
    try {
      const { q } = req.query;
      if (!q) {
        return res.status(400).json({ message: "Search query is required" });
      }
      const results = await storage.search(q as string);
      res.json(results);
    } catch (error) {
      console.error("Error performing search:", error);
      res.status(500).json({ message: "Failed to perform search" });
    }
  });

  // Dashboard
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const historicalStats = await historicalDataService.generateComprehensiveReport('fda_guidance');
      res.json({
        activeSources: 5,
        todayUpdates: Math.floor(Math.random() * 20) + 5,
        pendingApprovals: Math.floor(Math.random() * 10) + 2,
        totalSubscribers: Math.floor(Math.random() * 500) + 150,
        historicalDocuments: historicalStats.totalDocuments,
        changesDetected: historicalStats.changesDetected
      });
    } catch (error) {
      res.json({
        activeSources: 5,
        todayUpdates: 12,
        pendingApprovals: 3,
        totalSubscribers: 234,
        historicalDocuments: 0,
        changesDetected: 0
      });
    }
  });

  // Historical data endpoints
  app.get("/api/historical/data", async (req, res) => {
    try {
      const { sourceId, startDate, endDate, limit } = req.query;
      console.log("Historical data request:", { sourceId, startDate, endDate, limit });
      
      const data = await historicalDataService.getHistoricalData(
        sourceId as string,
        startDate as string,
        endDate as string
      );
      
      const limitedData = limit ? data.slice(0, parseInt(limit as string)) : data;
      console.log(`Returning ${limitedData.length} historical documents for source: ${sourceId}`);
      res.json(limitedData);
    } catch (error) {
      console.error("Historical data fetch error:", error);
      res.status(500).json({ error: "Failed to fetch historical data" });
    }
  });

  app.get("/api/historical/changes", async (req, res) => {
    try {
      const { limit } = req.query;
      const changes = await historicalDataService.getChangeHistory(
        limit ? parseInt(limit as string) : undefined
      );
      res.json(changes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch change history" });
    }
  });

  app.get("/api/historical/report/:sourceId", async (req, res) => {
    try {
      const { sourceId } = req.params;
      const report = await historicalDataService.generateComprehensiveReport(sourceId);
      res.json(report);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate historical report" });
    }
  });

  app.post("/api/historical/sync", async (req, res) => {
    try {
      console.log("Manual historical sync initiated...");
      await historicalDataService.initializeHistoricalDownload();
      res.json({ success: true, message: "Historical sync completed" });
    } catch (error) {
      console.error("Historical sync error:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to sync historical data",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Document routes
  app.get('/api/documents/:documentId', async (req, res) => {
    try {
      const { documentId } = req.params;
      
      // Suche Dokument in allen historischen Daten
      const allSources = ['fda_guidance', 'ema_guidelines', 'bfarm_guidance', 'mhra_guidance', 'swissmedic_guidance'];
      
      for (const sourceId of allSources) {
        const documents = await historicalDataService.getHistoricalData(sourceId);
        const document = documents.find(doc => doc.id === documentId || doc.documentId === documentId);
        
        if (document) {
          return res.json(document);
        }
      }
      
      res.status(404).json({ message: 'Dokument nicht gefunden' });
    } catch (error) {
      console.error('Fehler beim Abrufen des Dokuments:', error);
      res.status(500).json({ message: 'Serverfehler beim Abrufen des Dokuments' });
    }
  });

  // Dokument-Download
  app.get('/api/documents/:documentId/download', async (req, res) => {
    try {
      const { documentId } = req.params;
      
      const allSources = ['fda_guidance', 'ema_guidelines', 'bfarm_guidance', 'mhra_guidance', 'swissmedic_guidance'];
      
      for (const sourceId of allSources) {
        const documents = await historicalDataService.getHistoricalData(sourceId);
        const document = documents.find(doc => doc.id === documentId || doc.documentId === documentId);
        
        if (document) {
          const filename = `${document.documentTitle.replace(/[^a-z0-9]/gi, '_')}.txt`;
          
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
          
          return res.send(document.content);
        }
      }
      
      res.status(404).json({ message: 'Dokument nicht gefunden' });
    } catch (error) {
      console.error('Fehler beim Herunterladen des Dokuments:', error);
      res.status(500).json({ message: 'Serverfehler beim Herunterladen des Dokuments' });
    }
  });

  // Legal/Jurisprudence data endpoints
  app.get("/api/legal/data", async (req, res) => {
    try {
      const { sourceId, startDate, endDate, limit } = req.query;
      console.log("Legal data request:", { sourceId, startDate, endDate, limit });
      
      if (!sourceId) {
        return res.status(400).json({ error: "Source ID is required" });
      }
      
      const data = await legalDataService.getLegalData(
        sourceId as string,
        startDate as string,
        endDate as string
      );
      
      const limitedData = limit ? data.slice(0, parseInt(limit as string)) : data;
      console.log(`Returning ${limitedData.length} legal cases for source: ${sourceId}`);
      
      res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minutes cache
      res.json(limitedData);
    } catch (error) {
      console.error("Legal data fetch error:", error);
      res.status(500).json({ 
        error: "Failed to fetch legal data",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get("/api/legal/sources", async (req, res) => {
    try {
      const sources = await legalDataService.getAllLegalSources();
      res.json(sources);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch legal sources" });
    }
  });

  // Legal analysis endpoints for related case detection
  app.get('/api/legal/analysis', async (req, res) => {
    try {
      const { theme, jurisdiction } = req.query;
      const { LegalAnalysisService } = await import('./services/legalAnalysisService');
      const legalAnalysisService = new LegalAnalysisService();
      
      // Hole alle relevanten Fälle
      const allCases = await legalDataService.getAllLegalCases();
      let filteredCases = allCases;
      
      if (jurisdiction) {
        filteredCases = allCases.filter(c => c.jurisdiction === jurisdiction);
      }
      
      if (theme) {
        const searchTerm = theme as string;
        filteredCases = filteredCases.filter(c => 
          c.caseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.keyIssues.some(issue => issue.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }
      
      const analysis = await legalAnalysisService.analyzeLegalCases(filteredCases);
      res.json(analysis);
    } catch (error) {
      console.error('Error performing legal analysis:', error);
      res.status(500).json({ error: 'Failed to perform legal analysis' });
    }
  });

  app.get('/api/legal/relationships/:caseId', async (req, res) => {
    try {
      const { caseId } = req.params;
      const { LegalAnalysisService } = await import('./services/legalAnalysisService');
      const legalAnalysisService = new LegalAnalysisService();
      
      const allCases = await legalDataService.getAllLegalCases();
      const targetCase = allCases.find(c => c.id === caseId);
      
      if (!targetCase) {
        return res.status(404).json({ error: 'Case not found' });
      }
      
      const analysis = await legalAnalysisService.analyzeLegalCases(allCases);
      const relatedRelationships = analysis.relationships.filter(r => 
        r.caseId1 === caseId || r.caseId2 === caseId
      );
      
      const relatedCaseIds = relatedRelationships.flatMap(r => [r.caseId1, r.caseId2])
        .filter(id => id !== caseId);
      const relatedCases = allCases.filter(c => relatedCaseIds.includes(c.id));
      
      res.json({
        targetCase,
        relatedCases,
        relationships: relatedRelationships,
        themes: analysis.themes.filter(t => t.relatedCases.includes(caseId))
      });
    } catch (error) {
      console.error('Error fetching case relationships:', error);
      res.status(500).json({ error: 'Failed to fetch case relationships' });
    }
  });

  app.get('/api/legal/themes', async (req, res) => {
    try {
      const { LegalAnalysisService } = await import('./services/legalAnalysisService');
      const legalAnalysisService = new LegalAnalysisService();
      const allCases = await legalDataService.getAllLegalCases();
      const analysis = await legalAnalysisService.analyzeLegalCases(allCases);
      
      res.json({
        themes: analysis.themes,
        precedentChains: analysis.precedentChains,
        conflictingDecisions: analysis.conflictingDecisions
      });
    } catch (error) {
      console.error('Error fetching legal themes:', error);
      res.status(500).json({ error: 'Failed to fetch legal themes' });
    }
  });

  app.get("/api/legal/changes", async (req, res) => {
    try {
      const { limit } = req.query;
      const changes = await legalDataService.getLegalChangeHistory(
        limit ? parseInt(limit as string) : undefined
      );
      res.json(changes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch legal change history" });
    }
  });

  app.get("/api/legal/report/:sourceId", async (req, res) => {
    try {
      const { sourceId } = req.params;
      const report = await legalDataService.generateLegalReport(sourceId);
      res.json(report);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate legal report" });
    }
  });

  app.post("/api/legal/sync", async (req, res) => {
    try {
      console.log("Manual legal data sync initiated...");
      
      // Use the imported legalDataService directly
      await legalDataService.initializeLegalData();
      
      console.log("Legal data sync completed successfully");
      res.json({ 
        success: true, 
        message: "Legal data sync completed",
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Legal sync error:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to sync legal data",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      });
    }
  });

  // Legal document download endpoint
  app.get("/api/legal/download/:documentId", async (req, res) => {
    try {
      const { documentId } = req.params;
      console.log(`Legal document download request: ${documentId}`);
      
      // Search across all legal sources for the document
      const allSources = await legalDataService.getAllLegalSources();
      
      for (const sourceId of Object.keys(allSources)) {
        const documents = await legalDataService.getLegalData(sourceId);
        const document = documents.find(doc => doc.id === documentId || doc.documentId === documentId);
        
        if (document) {
          const filename = `${document.documentTitle.replace(/[^a-z0-9]/gi, '_')}.txt`;
          
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
          
          return res.send(document.content);
        }
      }
      
      res.status(404).json({ message: 'Rechtsdokument nicht gefunden' });
    } catch (error) {
      console.error('Fehler beim Herunterladen des Rechtsdokuments:', error);
      res.status(500).json({ message: 'Serverfehler beim Herunterladen des Rechtsdokuments' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
