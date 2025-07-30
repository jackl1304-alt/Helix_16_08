// Professional Environment Synchronization Service
// Helix Production-Development Data Synchronization

import { neon } from '@neondatabase/serverless';

interface SyncConfiguration {
  developmentDB: string;
  productionDB: string;
  syncMode: 'full' | 'incremental' | 'verify';
  batchSize: number;
  retryAttempts: number;
}

interface SyncResult {
  success: boolean;
  synchronized: number;
  skipped: number;
  errors: string[];
  duration: number;
  lastSyncTimestamp: string;
}

export class EnvironmentSyncService {
  private config: SyncConfiguration;
  private devSQL: any;
  private prodSQL: any;

  constructor(config: Partial<SyncConfiguration> = {}) {
    this.config = {
      developmentDB: process.env.DEV_DATABASE_URL || process.env.DATABASE_URL!,
      productionDB: process.env.PROD_DATABASE_URL || process.env.DATABASE_URL!,
      syncMode: 'incremental',
      batchSize: 200,
      retryAttempts: 3,
      ...config
    };

    this.devSQL = neon(this.config.developmentDB);
    this.prodSQL = neon(this.config.productionDB);
  }

  /**
   * Execute comprehensive environment synchronization
   */
  async synchronizeEnvironments(): Promise<SyncResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    let synchronized = 0;
    let skipped = 0;

    try {
      console.log('🔄 Starting environment synchronization...');
      console.log(`📋 Mode: ${this.config.syncMode}`);

      // 1. Verify both database connections
      await this.verifyConnections();

      // 2. Analyze current state
      const analysis = await this.analyzeEnvironmentState();
      console.log('📊 Environment analysis:', analysis);

      // 3. Execute synchronization based on mode
      switch (this.config.syncMode) {
        case 'full':
          ({ synchronized, skipped } = await this.executeFullSync(errors));
          break;
        case 'incremental':
          ({ synchronized, skipped } = await this.executeIncrementalSync(errors));
          break;
        case 'verify':
          ({ synchronized, skipped } = await this.executeVerificationSync(errors));
          break;
      }

      // 4. Update synchronization metadata
      await this.updateSyncMetadata();

      console.log(`✅ Synchronization complete: ${synchronized} synchronized, ${skipped} skipped`);

      return {
        success: errors.length === 0,
        synchronized,
        skipped,
        errors,
        duration: Date.now() - startTime,
        lastSyncTimestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Synchronization failed:', error);
      errors.push(error instanceof Error ? error.message : String(error));

      return {
        success: false,
        synchronized,
        skipped,
        errors,
        duration: Date.now() - startTime,
        lastSyncTimestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Verify database connections
   */
  private async verifyConnections(): Promise<void> {
    try {
      await Promise.all([
        this.devSQL`SELECT 1 as dev_test`,
        this.prodSQL`SELECT 1 as prod_test`
      ]);
      console.log('✅ Database connections verified');
    } catch (error) {
      throw new Error(`Database connection verification failed: ${error}`);
    }
  }

  /**
   * Analyze current environment state
   */
  private async analyzeEnvironmentState(): Promise<{
    development: { legalCases: number; regulatoryUpdates: number };
    production: { legalCases: number; regulatoryUpdates: number };
    needsSync: boolean;
  }> {
    try {
      const [devLegalCases, devUpdates, prodLegalCases, prodUpdates] = await Promise.all([
        this.devSQL`SELECT COUNT(*) as count FROM legal_cases`,
        this.devSQL`SELECT COUNT(*) as count FROM regulatory_updates`,
        this.prodSQL`SELECT COUNT(*) as count FROM legal_cases`,
        this.prodSQL`SELECT COUNT(*) as count FROM regulatory_updates`
      ]);

      const development = {
        legalCases: parseInt(devLegalCases[0]?.count || '0'),
        regulatoryUpdates: parseInt(devUpdates[0]?.count || '0')
      };

      const production = {
        legalCases: parseInt(prodLegalCases[0]?.count || '0'),
        regulatoryUpdates: parseInt(prodUpdates[0]?.count || '0')
      };

      const needsSync = development.legalCases !== production.legalCases;

      return { development, production, needsSync };

    } catch (error) {
      throw new Error(`Environment analysis failed: ${error}`);
    }
  }

  /**
   * Execute full synchronization
   */
  private async executeFullSync(errors: string[]): Promise<{ synchronized: number; skipped: number }> {
    console.log('🔄 Executing full synchronization...');
    
    try {
      // Clear existing production legal cases
      await this.prodSQL`DELETE FROM legal_cases`;
      console.log('🗑️  Cleared existing production legal cases');

      // Copy all legal cases from development
      const devLegalCases = await this.devSQL`
        SELECT id, case_number, title, court, jurisdiction, decision_date,
               summary, content, document_url, impact_level, created_at
        FROM legal_cases
        ORDER BY created_at
      `;

      console.log(`📋 Copying ${devLegalCases.length} legal cases to production...`);

      let synchronized = 0;
      const totalBatches = Math.ceil(devLegalCases.length / this.config.batchSize);

      for (let i = 0; i < totalBatches; i++) {
        const start = i * this.config.batchSize;
        const end = Math.min(start + this.config.batchSize, devLegalCases.length);
        const batch = devLegalCases.slice(start, end);

        try {
          for (const legalCase of batch) {
            await this.prodSQL`
              INSERT INTO legal_cases (
                id, case_number, title, court, jurisdiction, decision_date,
                summary, content, document_url, impact_level, created_at
              ) VALUES (
                ${legalCase.id}, ${legalCase.case_number}, ${legalCase.title},
                ${legalCase.court}, ${legalCase.jurisdiction}, ${legalCase.decision_date},
                ${legalCase.summary}, ${legalCase.content}, ${legalCase.document_url},
                ${legalCase.impact_level}, ${legalCase.created_at}
              )
            `;
            synchronized++;
          }

          console.log(`✅ Batch ${i + 1}/${totalBatches} completed (${synchronized}/${devLegalCases.length})`);

        } catch (error) {
          const errorMsg = `Batch ${i + 1} failed: ${error}`;
          console.error('❌', errorMsg);
          errors.push(errorMsg);
        }
      }

      return { synchronized, skipped: 0 };

    } catch (error) {
      errors.push(`Full sync failed: ${error}`);
      return { synchronized: 0, skipped: 0 };
    }
  }

  /**
   * Execute incremental synchronization
   */
  private async executeIncrementalSync(errors: string[]): Promise<{ synchronized: number; skipped: number }> {
    console.log('🔄 Executing incremental synchronization...');
    
    try {
      // Get last sync timestamp from metadata
      const lastSync = await this.getLastSyncTimestamp();
      console.log(`📅 Last sync: ${lastSync || 'Never'}`);

      // Find new/updated legal cases since last sync
      const query = lastSync 
        ? this.devSQL`
            SELECT id, case_number, title, court, jurisdiction, decision_date,
                   summary, content, document_url, impact_level, created_at
            FROM legal_cases 
            WHERE created_at > ${lastSync}
            ORDER BY created_at
          `
        : this.devSQL`
            SELECT id, case_number, title, court, jurisdiction, decision_date,
                   summary, content, document_url, impact_level, created_at
            FROM legal_cases
            ORDER BY created_at
          `;

      const newCases = await query;
      console.log(`📋 Found ${newCases.length} cases to synchronize`);

      if (newCases.length === 0) {
        return { synchronized: 0, skipped: 0 };
      }

      let synchronized = 0;
      let skipped = 0;

      for (const legalCase of newCases) {
        try {
          // Check if case already exists in production
          const existing = await this.prodSQL`
            SELECT id FROM legal_cases WHERE id = ${legalCase.id}
          `;

          if (existing.length > 0) {
            skipped++;
            continue;
          }

          // Insert new case
          await this.prodSQL`
            INSERT INTO legal_cases (
              id, case_number, title, court, jurisdiction, decision_date,
              summary, content, document_url, impact_level, created_at
            ) VALUES (
              ${legalCase.id}, ${legalCase.case_number}, ${legalCase.title},
              ${legalCase.court}, ${legalCase.jurisdiction}, ${legalCase.decision_date},
              ${legalCase.summary}, ${legalCase.content}, ${legalCase.document_url},
              ${legalCase.impact_level}, ${legalCase.created_at}
            )
          `;
          synchronized++;

        } catch (error) {
          const errorMsg = `Failed to sync case ${legalCase.id}: ${error}`;
          console.error('❌', errorMsg);
          errors.push(errorMsg);
        }
      }

      return { synchronized, skipped };

    } catch (error) {
      errors.push(`Incremental sync failed: ${error}`);
      return { synchronized: 0, skipped: 0 };
    }
  }

  /**
   * Execute verification synchronization
   */
  private async executeVerificationSync(errors: string[]): Promise<{ synchronized: number; skipped: number }> {
    console.log('🔍 Executing verification synchronization...');
    
    try {
      const [devCases, prodCases] = await Promise.all([
        this.devSQL`SELECT id, case_number, created_at FROM legal_cases ORDER BY id`,
        this.prodSQL`SELECT id, case_number, created_at FROM legal_cases ORDER BY id`
      ]);

      const devIds = new Set(devCases.map(c => c.id));
      const prodIds = new Set(prodCases.map(c => c.id));

      const missingInProd = devCases.filter(c => !prodIds.has(c.id));
      const extraInProd = prodCases.filter(c => !devIds.has(c.id));

      console.log(`📊 Verification results:`);
      console.log(`   Development: ${devCases.length} cases`);
      console.log(`   Production: ${prodCases.length} cases`);
      console.log(`   Missing in production: ${missingInProd.length}`);
      console.log(`   Extra in production: ${extraInProd.length}`);

      if (missingInProd.length > 0) {
        errors.push(`${missingInProd.length} cases missing in production`);
      }

      if (extraInProd.length > 0) {
        errors.push(`${extraInProd.length} extra cases in production`);
      }

      return { 
        synchronized: 0, 
        skipped: devCases.length === prodCases.length ? prodCases.length : 0 
      };

    } catch (error) {
      errors.push(`Verification sync failed: ${error}`);
      return { synchronized: 0, skipped: 0 };
    }
  }

  /**
   * Get last synchronization timestamp
   */
  private async getLastSyncTimestamp(): Promise<string | null> {
    try {
      const result = await this.prodSQL`
        SELECT last_sync FROM sync_metadata 
        WHERE sync_type = 'legal_cases' 
        ORDER BY created_at DESC 
        LIMIT 1
      `;
      return result[0]?.last_sync || null;
    } catch (error) {
      // Table might not exist yet
      return null;
    }
  }

  /**
   * Update synchronization metadata
   */
  private async updateSyncMetadata(): Promise<void> {
    try {
      await this.prodSQL`
        INSERT INTO sync_metadata (sync_type, last_sync, created_at)
        VALUES ('legal_cases', ${new Date().toISOString()}, ${new Date().toISOString()})
        ON CONFLICT (sync_type) DO UPDATE SET
          last_sync = EXCLUDED.last_sync,
          created_at = EXCLUDED.created_at
      `;
    } catch (error) {
      // Create table if it doesn't exist
      await this.prodSQL`
        CREATE TABLE IF NOT EXISTS sync_metadata (
          sync_type VARCHAR(50) PRIMARY KEY,
          last_sync TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      
      await this.prodSQL`
        INSERT INTO sync_metadata (sync_type, last_sync, created_at)
        VALUES ('legal_cases', ${new Date().toISOString()}, ${new Date().toISOString()})
      `;
    }
  }

  /**
   * Schedule automatic synchronization
   */
  scheduleSync(intervalMinutes: number = 60): NodeJS.Timeout {
    console.log(`⏰ Scheduling synchronization every ${intervalMinutes} minutes`);
    
    return setInterval(async () => {
      console.log('🔄 Executing scheduled synchronization...');
      const result = await this.synchronizeEnvironments();
      
      if (result.success) {
        console.log(`✅ Scheduled sync completed: ${result.synchronized} synchronized`);
      } else {
        console.error(`❌ Scheduled sync failed: ${result.errors.join(', ')}`);
      }
    }, intervalMinutes * 60 * 1000);
  }
}

// Export singleton instance
export const syncService = new EnvironmentSyncService();