import { Logger } from './logger.service';
import { storage } from '../storage';
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

interface DuplicateCleanupStats {
  totalRecords: number;
  uniqueRecords: number;
  duplicatesRemoved: number;
  cleanupTime: number;
  qualityImprovement: number;
}

export class DuplicateCleanupService {
  private logger = new Logger('DuplicateCleanupService');

  /**
   * KRITISCHE DUPLIKATE-BEREINIGUNG
   * Entfernt massive Duplikate basierend auf Title-Hash
   */
  async performEmergencyDuplicateCleanup(): Promise<DuplicateCleanupStats> {
    const startTime = Date.now();
    this.logger.info('STARTING EMERGENCY DUPLICATE CLEANUP - System has 95.5% duplicates!');

    try {
      // 1. Aktuelle Situation analysieren
      const beforeStats = await this.getDuplicateStats();
      this.logger.info('Before cleanup statistics', beforeStats);

      // 2. Duplikate in Regulatory Updates bereinigen
      const regulatoryCleanup = await this.cleanupRegulatoryUpdateDuplicates();
      
      // 3. Duplikate in Legal Cases bereinigen
      const legalCleanup = await this.cleanupLegalCaseDuplicates();

      // 4. Nach-Bereinigung Statistiken
      const afterStats = await this.getDuplicateStats();
      this.logger.info('After cleanup statistics', afterStats);

      const cleanupTime = Date.now() - startTime;
      const totalRemoved = regulatoryCleanup.removed + legalCleanup.removed;
      const qualityImprovement = ((afterStats.uniquenessRatio - beforeStats.uniquenessRatio) * 100);

      const stats: DuplicateCleanupStats = {
        totalRecords: afterStats.totalRegulatory + afterStats.totalLegal,
        uniqueRecords: afterStats.uniqueRegulatory + afterStats.uniqueLegal,
        duplicatesRemoved: totalRemoved,
        cleanupTime,
        qualityImprovement
      };

      this.logger.info('EMERGENCY DUPLICATE CLEANUP COMPLETED', stats);
      return stats;

    } catch (error: any) {
      this.logger.error('Emergency duplicate cleanup failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Bereinigt Duplikate in Regulatory Updates
   */
  private async cleanupRegulatoryUpdateDuplicates(): Promise<{ kept: number; removed: number }> {
    this.logger.info('Cleaning regulatory updates duplicates...');

    // Strategie: Behalte das neueste Update pro eindeutigem Titel
    const duplicateQuery = `
      WITH duplicate_groups AS (
        SELECT 
          id,
          title,
          published_at,
          ROW_NUMBER() OVER (
            PARTITION BY LOWER(TRIM(title)) 
            ORDER BY published_at DESC, created_at DESC
          ) as row_num
        FROM regulatory_updates
        WHERE title IS NOT NULL AND TRIM(title) != ''
      ),
      duplicates_to_delete AS (
        SELECT id FROM duplicate_groups WHERE row_num > 1
      )
      DELETE FROM regulatory_updates 
      WHERE id IN (SELECT id FROM duplicates_to_delete)
    `;

    const result = await sql(duplicateQuery);
    const removed = Array.isArray(result) ? result.length : 0;

    // Aktuelle Anzahl nach Bereinigung
    const remaining = await sql`SELECT COUNT(*) as count FROM regulatory_updates`;
    const kept = parseInt(remaining[0]?.count || '0');

    this.logger.info('Regulatory updates cleanup completed', { kept, removed });
    return { kept, removed };
  }

  /**
   * Bereinigt Duplikate in Legal Cases
   */
  private async cleanupLegalCaseDuplicates(): Promise<{ kept: number; removed: number }> {
    this.logger.info('Cleaning legal cases duplicates...');

    // Strategie: Behalte den neuesten Case pro eindeutigem Titel
    const duplicateQuery = `
      WITH duplicate_groups AS (
        SELECT 
          id,
          title,
          decision_date,
          ROW_NUMBER() OVER (
            PARTITION BY LOWER(TRIM(title)) 
            ORDER BY decision_date DESC, created_at DESC
          ) as row_num
        FROM legal_cases
        WHERE title IS NOT NULL AND TRIM(title) != ''
      ),
      duplicates_to_delete AS (
        SELECT id FROM duplicate_groups WHERE row_num > 1
      )
      DELETE FROM legal_cases 
      WHERE id IN (SELECT id FROM duplicates_to_delete)
    `;

    const result = await sql(duplicateQuery);
    const removed = Array.isArray(result) ? result.length : 0;

    // Aktuelle Anzahl nach Bereinigung
    const remaining = await sql`SELECT COUNT(*) as count FROM legal_cases`;
    const kept = parseInt(remaining[0]?.count || '0');

    this.logger.info('Legal cases cleanup completed', { kept, removed });
    return { kept, removed };
  }

  /**
   * Analysiert aktuelle Duplikate-Situation
   */
  async getDuplicateStats(): Promise<{
    totalRegulatory: number;
    uniqueRegulatory: number;
    totalLegal: number;
    uniqueLegal: number;
    uniquenessRatio: number;
  }> {
    const [regulatoryStats, legalStats] = await Promise.all([
      sql`SELECT 
        COUNT(*) as total_count,
        COUNT(DISTINCT LOWER(TRIM(title))) as unique_count
      FROM regulatory_updates
      WHERE title IS NOT NULL AND TRIM(title) != ''`,
      sql`SELECT 
        COUNT(*) as total_count,
        COUNT(DISTINCT LOWER(TRIM(title))) as unique_count
      FROM legal_cases
      WHERE title IS NOT NULL AND TRIM(title) != ''`
    ]);

    const totalRegulatory = parseInt(regulatoryStats[0]?.total_count || '0');
    const uniqueRegulatory = parseInt(regulatoryStats[0]?.unique_count || '0');
    const totalLegal = parseInt(legalStats[0]?.total_count || '0');
    const uniqueLegal = parseInt(legalStats[0]?.unique_count || '0');

    const totalRecords = totalRegulatory + totalLegal;
    const uniqueRecords = uniqueRegulatory + uniqueLegal;
    const uniquenessRatio = totalRecords > 0 ? uniqueRecords / totalRecords : 0;

    return {
      totalRegulatory,
      uniqueRegulatory,
      totalLegal,
      uniqueLegal,
      uniquenessRatio
    };
  }

  /**
   * Erstellt Duplikate-Bereinigungsbericht
   */
  async generateCleanupReport(): Promise<any> {
    const stats = await this.getDuplicateStats();
    const duplicateRatio = stats.totalRegulatory > 0 ? 
      ((stats.totalRegulatory - stats.uniqueRegulatory) / stats.totalRegulatory * 100) : 0;

    return {
      currentStats: stats,
      duplicatePercentage: Math.round(duplicateRatio * 100) / 100,
      recommendedAction: duplicateRatio > 10 ? 'IMMEDIATE_CLEANUP_REQUIRED' : 'MONITORING',
      qualityScore: Math.round((stats.uniquenessRatio * 100) * 100) / 100,
      generatedAt: new Date().toISOString()
    };
  }
}

export const duplicateCleanupService = new DuplicateCleanupService();