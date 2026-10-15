import fs from 'fs';
import path from 'path';
import pg from 'pg';

const { Client } = pg;

async function run() {
  const connectionString = process.env.DATABASE_URL || process.argv[2];

  if (!connectionString) {
    console.error('\n❌ ERROR: No database connection string provided.');
    console.log('Usage: node scripts/seed-european-cities.mjs "<POSTGRES_CONNECTION_STRING>"');
    console.log('Or ensure DATABASE_URL is set in your environment / .env.local file.\n');
    console.log('Alternatively, you can copy and paste `database/seed_european_cities.sql` directly into your Supabase SQL Editor.\n');
    process.exit(1);
  }

  const sqlFile = path.resolve(process.cwd(), 'database/seed_european_cities.sql');
  const sql = fs.readFileSync(sqlFile, 'utf8');

  console.log('Connecting to PostgreSQL / Supabase database...');
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✓ Connected successfully!');
    console.log('✓ Executing Top 10 European Countries (42 Cities) seed script (database/seed_european_cities.sql)...');

    const result = await client.query(sql);

    // If multi-statement, result might be an array of query results
    const verificationRows = Array.isArray(result) 
      ? result[result.length - 1].rows 
      : result.rows;

    console.log(`\n🎉 SUCCESS! Populated 42 cities across Germany, France, Italy, Spain, Netherlands, Sweden, Switzerland, Belgium, Austria, and Poland.`);
    if (verificationRows && verificationRows.length > 0) {
      console.log(`\n📊 European Countries Summary:`);
      console.table(verificationRows.map((r, i) => ({
        '#': i + 1,
        'Country': r.country_name,
        'Code': (r.country_code || '').toUpperCase(),
        'Active Cities': r.total_cities
      })));
    }
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
