import fs from 'fs';
import path from 'path';
import pg from 'pg';
// Native Node.js migration runner

const { Client } = pg;

async function run() {
  const connectionString = process.env.DATABASE_URL || process.argv[2];

  if (!connectionString) {
    console.error('ERROR: No database connection string provided.');
    console.log('Usage: node scripts/apply-schema.mjs "<POSTGRES_CONNECTION_STRING>"');
    console.log('Or set DATABASE_URL in your .env.local file.');
    process.exit(1);
  }

  const sqlFile = path.resolve(process.cwd(), 'database/schema_baseera_complete.sql');
  const sql = fs.readFileSync(sqlFile, 'utf8');

  console.log('Connecting to PostgreSQL database...');
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected successfully!');
    console.log('Applying schema, tables, indexes, RLS policies, and storage buckets...');
    
    await client.query(sql);
    
    console.log('SUCCESS! All Baseera tables, RLS policies, and storage buckets have been created.');
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
