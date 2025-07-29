// Production Debug Test
import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL;
console.log('DATABASE_URL exists:', !!DATABASE_URL);

if (DATABASE_URL) {
  const sql = neon(DATABASE_URL);
  try {
    const result = await sql`SELECT COUNT(*) as count FROM data_sources`;
    console.log('Database query result:', result);
  } catch (error) {
    console.error('Database error:', error);
  }
} else {
  console.error('No DATABASE_URL found');
}