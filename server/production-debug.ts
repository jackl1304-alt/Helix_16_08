// Production Database Debug - Direct Connection Test

export async function debugProductionDatabase() {
  console.log("🔍 PRODUCTION DATABASE DEBUG:");
  console.log(`Database URL exists: ${!!process.env.DATABASE_URL}`);
  console.log(`Database URL type: ${process.env.DATABASE_URL?.includes("neondb") ? "Neon Production" : "Other"}`);
  
  try {
    // Test direct database connection
    const { neon } = await import('@neondatabase/serverless');
    const sql = neon(process.env.DATABASE_URL!);
    
    // Count legal cases directly
    const legalCasesCount = await sql`SELECT COUNT(*) as count FROM legal_cases`;
    console.log(`Direct SQL: Legal cases count = ${legalCasesCount[0]?.count || 0}`);
    
    // Count regulatory updates directly  
    const updatesCount = await sql`SELECT COUNT(*) as count FROM regulatory_updates`;
    console.log(`Direct SQL: Regulatory updates count = ${updatesCount[0]?.count || 0}`);
    
    // Check if tables exist
    const tablesQuery = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('legal_cases', 'regulatory_updates', 'data_sources')
    `;
    console.log(`Database tables: ${tablesQuery.map(t => t.table_name).join(', ')}`);
    
    return {
      legalCases: parseInt(legalCasesCount[0]?.count || '0'),
      regulatoryUpdates: parseInt(updatesCount[0]?.count || '0'),
      tables: tablesQuery.map(t => t.table_name)
    };
    
  } catch (error) {
    console.error("❌ Production database debug error:", error);
    return {
      error: error instanceof Error ? error.message : String(error),
      legalCases: 0,
      regulatoryUpdates: 0,
      tables: []
    };
  }
}