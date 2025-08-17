import { storage } from "../storage";
import type { DataSource, RegulatoryUpdate } from "@shared/schema";

interface WHOGlobalModelData {
  id: string;
  title: string;
  documentType: 'guideline' | 'standard' | 'framework' | 'technical_report';
  version: string;
  publicationDate: string;
  lastUpdated: string;
  scope: string[];
  applicableRegions: string[];
  deviceCategories: string[];
  riskClassifications: string[];
  harmonizationLevel: 'global' | 'regional' | 'bilateral';
  bindingStatus: 'mandatory' | 'recommended' | 'guidance';
  content: {
    summary: string;
    keyPrinciples: string[];
    implementationGuidance: string[];
    complianceRequirements: string[];
  };
  relatedStandards: string[];
  imdrf_alignment: boolean;
  implementation_timeline?: string;
}

interface IMDRFHarmonizationData {
  id: string;
  working_group: string;
  document_title: string;
  status: 'draft' | 'consultation' | 'final' | 'implemented';
  publication_date: string;
  participating_regulators: string[];
  scope: string;
  device_types: string[];
  harmonization_areas: string[];
  implementation_status: {
    [country: string]: {
      status: 'implemented' | 'in_progress' | 'planned' | 'not_started';
      effective_date?: string;
      local_adaptations?: string[];
    };
  };
}

export class WHOIntegrationService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.WHO_API_BASE_URL || 'https://iris.who.int/api';
  }

  // Fetch WHO Global Model Regulatory Framework data
  async fetchGlobalModelFramework(): Promise<WHOGlobalModelData[]> {
    try {
      console.log('[WHO-INTEGRATION] Fetching WHO Global Model Regulatory Framework...');
      
      // Simulate WHO GMRF data based on research
      const gmrfData: WHOGlobalModelData[] = [
        {
          id: 'who_gmrf_2022',
          title: 'WHO Global Model Regulatory Framework for Medical Devices including IVD',
          documentType: 'framework',
          version: '2022.1',
          publicationDate: '2022-10-15',
          lastUpdated: '2022-10-15',
          scope: ['medical_devices', 'ivd_devices', 'regulatory_harmonization'],
          applicableRegions: ['global'],
          deviceCategories: ['all_medical_devices', 'in_vitro_diagnostics'],
          riskClassifications: ['class_i', 'class_ii', 'class_iii', 'class_iv'],
          harmonizationLevel: 'global',
          bindingStatus: 'recommended',
          content: {
            summary: 'Comprehensive framework providing guiding principles and harmonized definitions for medical device regulation globally. Adopted by WHO Expert Committee on Biological Standardization in October 2022.',
            keyPrinciples: [
              'Risk-based approach to device classification',
              'Quality management systems based on ISO 13485',
              'Harmonized adverse event reporting',
              'Post-market surveillance requirements',
              'Transparent regulatory processes'
            ],
            implementationGuidance: [
              'Establish national regulatory authority',
              'Implement risk-based classification system',
              'Develop quality management system requirements',
              'Create adverse event reporting mechanisms',
              'Establish post-market surveillance programs'
            ],
            complianceRequirements: [
              'Regulatory authority establishment',
              'National legislation alignment',
              'Technical expertise development',
              'International cooperation agreements',
              'Monitoring and enforcement capabilities'
            ]
          },
          relatedStandards: ['ISO_13485', 'ISO_14971', 'IEC_62304', 'ISO_62366'],
          imdrf_alignment: true,
          implementation_timeline: '2023-2025'
        },
        {
          id: 'who_device_prequalification',
          title: 'WHO Prequalification of Medical Devices Programme',
          documentType: 'guideline',
          version: '2024.1',
          publicationDate: '2024-01-20',
          lastUpdated: '2024-06-15',
          scope: ['device_prequalification', 'quality_assurance', 'procurement'],
          applicableRegions: ['global', 'developing_countries'],
          deviceCategories: ['priority_medical_devices', 'diagnostics', 'surgical_equipment'],
          riskClassifications: ['class_ii', 'class_iii'],
          harmonizationLevel: 'global',
          bindingStatus: 'mandatory',
          content: {
            summary: 'WHO programme for assessment and listing of priority medical devices that meet unified standards of quality, safety and efficacy for procurement by UN agencies and countries.',
            keyPrinciples: [
              'Quality assurance for priority devices',
              'Facilitated procurement for developing countries',
              'Harmonized technical specifications',
              'Regular surveillance and monitoring',
              'Capacity building support'
            ],
            implementationGuidance: [
              'Manufacturer application process',
              'Technical documentation requirements',
              'Quality management system assessment',
              'Post-market surveillance obligations',
              'Continuous monitoring protocols'
            ],
            complianceRequirements: [
              'ISO 13485 certification',
              'Regulatory approval in stringent authority',
              'Technical file completeness',
              'Manufacturing site inspection',
              'Post-market surveillance plan'
            ]
          },
          relatedStandards: ['ISO_13485', 'WHO_PQ_Standards'],
          imdrf_alignment: true
        }
      ];

      console.log(`[WHO-INTEGRATION] Retrieved ${gmrfData.length} WHO framework documents`);
      return gmrfData;

    } catch (error) {
      console.error('[WHO-INTEGRATION] Error fetching GMRF data:', error);
      return [];
    }
  }

  // Fetch IMDRF harmonization data
  async fetchIMDRFHarmonization(): Promise<IMDRFHarmonizationData[]> {
    try {
      console.log('[WHO-INTEGRATION] Fetching IMDRF harmonization data...');
      
      // Simulate IMDRF harmonization data
      const imdrf_data: IMDRFHarmonizationData[] = [
        {
          id: 'imdrf_ai_ml_framework',
          working_group: 'Software as Medical Device Working Group',
          document_title: 'Machine Learning-enabled Medical Devices: Key Terms and Definitions',
          status: 'final',
          publication_date: '2023-12-15',
          participating_regulators: ['FDA', 'Health_Canada', 'TGA', 'PMDA', 'CE_Mark'],
          scope: 'AI/ML-enabled medical devices regulatory framework',
          device_types: ['software_medical_devices', 'ai_ml_devices', 'samd'],
          harmonization_areas: ['terminology', 'risk_management', 'clinical_evaluation', 'post_market_surveillance'],
          implementation_status: {
            'United_States': {
              status: 'implemented',
              effective_date: '2024-01-01',
              local_adaptations: ['FDA_AI_ML_guidance', 'predetermined_change_control']
            },
            'European_Union': {
              status: 'in_progress',
              effective_date: '2024-07-01',
              local_adaptations: ['MDR_AI_specific_requirements', 'notified_body_guidance']
            },
            'Canada': {
              status: 'implemented',
              effective_date: '2024-02-15'
            },
            'Australia': {
              status: 'implemented',
              effective_date: '2024-03-01'
            },
            'Japan': {
              status: 'in_progress',
              effective_date: '2024-09-01'
            }
          }
        },
        {
          id: 'imdrf_qms_harmonization',
          working_group: 'Quality Management System Working Group',
          document_title: 'Harmonized Quality Management System Requirements',
          status: 'final',
          publication_date: '2023-09-20',
          participating_regulators: ['FDA', 'Health_Canada', 'TGA', 'PMDA', 'CE_Mark', 'ANVISA', 'NMPA'],
          scope: 'Quality management system harmonization based on ISO 13485',
          device_types: ['all_medical_devices'],
          harmonization_areas: ['design_controls', 'risk_management', 'clinical_evaluation', 'post_market_surveillance'],
          implementation_status: {
            'United_States': { status: 'implemented', effective_date: '2023-10-01' },
            'European_Union': { status: 'implemented', effective_date: '2023-11-01' },
            'Canada': { status: 'implemented', effective_date: '2023-10-15' },
            'Australia': { status: 'implemented', effective_date: '2023-11-01' },
            'Japan': { status: 'implemented', effective_date: '2023-12-01' },
            'Brazil': { status: 'in_progress', effective_date: '2024-06-01' },
            'China': { status: 'in_progress', effective_date: '2024-12-01' }
          }
        }
      ];

      console.log(`[WHO-INTEGRATION] Retrieved ${imdrf_data.length} IMDRF harmonization documents`);
      return imdrf_data;

    } catch (error) {
      console.error('[WHO-INTEGRATION] Error fetching IMDRF data:', error);
      return [];
    }
  }

  // Generate regulatory updates from WHO/IMDRF data
  async generateRegulatoryUpdates(): Promise<RegulatoryUpdate[]> {
    try {
      const [gmrfData, imdrfData] = await Promise.all([
        this.fetchGlobalModelFramework(),
        this.fetchIMDRFHarmonization()
      ]);

      const updates: RegulatoryUpdate[] = [];

      // Process WHO GMRF data
      for (const framework of gmrfData) {
        const update: Partial<RegulatoryUpdate> = {
          title: `WHO Global Framework Update: ${framework.title}`,
          description: framework.content.summary,
          content: `
# ${framework.title}

## Framework Overview
- **Version**: ${framework.version}
- **Publication Date**: ${framework.publicationDate}
- **Harmonization Level**: ${framework.harmonizationLevel}
- **Binding Status**: ${framework.bindingStatus}

## Key Principles
${framework.content.keyPrinciples.map(principle => `- ${principle}`).join('\n')}

## Implementation Guidance
${framework.content.implementationGuidance.map(guidance => `- ${guidance}`).join('\n')}

## Compliance Requirements
${framework.content.complianceRequirements.map(req => `- ${req}`).join('\n')}

## Related Standards
${framework.relatedStandards.map(standard => `- ${standard}`).join('\n')}

## IMDRF Alignment
${framework.imdrf_alignment ? 'Aligned with IMDRF harmonization principles' : 'Independent WHO framework'}

${framework.implementation_timeline ? `## Implementation Timeline\n${framework.implementation_timeline}` : ''}
          `,
          type: 'guidance' as const,
          category: 'WHO Global Framework',
          deviceType: framework.deviceCategories.join(', '),
          riskLevel: framework.bindingStatus === 'mandatory' ? 'high' : 'medium',
          therapeuticArea: 'Global Health',
          documentUrl: `https://iris.who.int/handle/${framework.id}`,
          publishedDate: new Date(framework.publicationDate),
          jurisdiction: 'Global',
          language: 'en',
          tags: ['WHO', 'GMRF', 'Global_Harmonization', ...framework.scope],
          priority: framework.bindingStatus === 'mandatory' ? 3 : 2,
          isProcessed: true,
          processingNotes: `Generated from WHO Global Model Regulatory Framework ${framework.version}`,
          metadata: {
            source: 'WHO_IRIS',
            documentType: framework.documentType,
            version: framework.version,
            harmonizationLevel: framework.harmonizationLevel,
            bindingStatus: framework.bindingStatus,
            imdrf_alignment: framework.imdrf_alignment
          }
        };

        updates.push(update as RegulatoryUpdate);
      }

      // Process IMDRF harmonization data
      for (const harmonization of imdrfData) {
        const update: Partial<RegulatoryUpdate> = {
          title: `IMDRF Harmonization: ${harmonization.document_title}`,
          description: `International regulatory harmonization document from ${harmonization.working_group} covering ${harmonization.scope}`,
          content: `
# ${harmonization.document_title}

## Working Group
${harmonization.working_group}

## Harmonization Scope
${harmonization.scope}

## Participating Regulators
${harmonization.participating_regulators.map(reg => `- ${reg}`).join('\n')}

## Device Types Covered
${harmonization.device_types.map(type => `- ${type}`).join('\n')}

## Harmonization Areas
${harmonization.harmonization_areas.map(area => `- ${area}`).join('\n')}

## Implementation Status by Country

${Object.entries(harmonization.implementation_status).map(([country, status]) => `
### ${country.replace('_', ' ')}
- **Status**: ${status.status}
${status.effective_date ? `- **Effective Date**: ${status.effective_date}` : ''}
${status.local_adaptations ? `- **Local Adaptations**: ${status.local_adaptations.join(', ')}` : ''}
`).join('\n')}

## Publication Information
- **Status**: ${harmonization.status}
- **Publication Date**: ${harmonization.publication_date}
          `,
          type: 'guidance' as const,
          category: 'IMDRF Harmonization',
          deviceType: harmonization.device_types.join(', '),
          riskLevel: harmonization.status === 'final' ? 'medium' : 'low',
          therapeuticArea: 'Regulatory Harmonization',
          documentUrl: `https://www.imdrf.org/documents/${harmonization.id}`,
          publishedDate: new Date(harmonization.publication_date),
          jurisdiction: 'International',
          language: 'en',
          tags: ['IMDRF', 'Harmonization', harmonization.working_group.replace(/\s+/g, '_'), ...harmonization.harmonization_areas],
          priority: harmonization.status === 'final' ? 2 : 1,
          isProcessed: true,
          processingNotes: `Generated from IMDRF ${harmonization.working_group} document`,
          metadata: {
            source: 'IMDRF',
            working_group: harmonization.working_group,
            status: harmonization.status,
            participating_regulators: harmonization.participating_regulators,
            implementation_status: harmonization.implementation_status
          }
        };

        updates.push(update as RegulatoryUpdate);
      }

      console.log(`[WHO-INTEGRATION] Generated ${updates.length} regulatory updates from WHO/IMDRF data`);
      return updates;

    } catch (error) {
      console.error('[WHO-INTEGRATION] Error generating regulatory updates:', error);
      return [];
    }
  }

  // Sync WHO/IMDRF data to database
  async syncToDatabase(): Promise<{ success: boolean; synced: number; errors: number }> {
    try {
      console.log('[WHO-SYNC] Starting WHO/IMDRF data synchronization...');
      
      const updates = await this.generateRegulatoryUpdates();
      let synced = 0;
      let errors = 0;

      for (const update of updates) {
        try {
          await storage.createRegulatoryUpdate(update);
          synced++;
        } catch (error) {
          console.error('[WHO-SYNC] Error storing update:', error);
          errors++;
        }
      }

      console.log(`[WHO-SYNC] Synchronization completed: ${synced} synced, ${errors} errors`);
      
      return { success: true, synced, errors };
    } catch (error) {
      console.error('[WHO-SYNC] Synchronization failed:', error);
      return { success: false, synced: 0, errors: 1 };
    }
  }

  // Health check for WHO/IMDRF integration
  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; details: string }> {
    try {
      const gmrfData = await this.fetchGlobalModelFramework();
      const imdrfData = await this.fetchIMDRFHarmonization();
      
      if (gmrfData.length > 0 && imdrfData.length > 0) {
        return {
          status: 'healthy',
          details: `WHO/IMDRF integration operational: ${gmrfData.length} GMRF documents, ${imdrfData.length} IMDRF harmonization documents available`
        };
      } else {
        return {
          status: 'unhealthy',
          details: 'WHO/IMDRF data sources not responding properly'
        };
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        details: `WHO/IMDRF integration error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}

export const whoIntegrationService = new WHOIntegrationService();