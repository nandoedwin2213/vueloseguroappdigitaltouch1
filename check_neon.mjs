import { neon } from '@neondatabase/serverless';

const NEON_DATABASE_URL = 'postgresql://neondb_owner:npg_Cu9Mkdbqy8Hs@ep-empty-mouse-aehm9zc8-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require';
const sql = neon(NEON_DATABASE_URL);

async function check() {
  const count = await sql`SELECT COUNT(*) FROM chequeos_prevuelo`;
  console.log('TOTAL_ROWS_IN_NEON:', count[0].count);
  const rows = await sql`SELECT id, timestamp, formatted_date, formatted_time, nombres, apellidos, dictamen_final FROM chequeos_prevuelo ORDER BY timestamp DESC LIMIT 5`;
  console.table(rows);

  // Clean up test record
  await sql`DELETE FROM chequeos_prevuelo WHERE id LIKE 'VS-TEST-%'`;
  console.log('Cleaned up test record.');
}

check();
