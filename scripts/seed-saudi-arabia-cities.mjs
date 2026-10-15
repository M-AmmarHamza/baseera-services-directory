import fs from 'fs';
import path from 'path';
import pg from 'pg';

const { Client } = pg;

async function run() {
  const connectionString = process.env.DATABASE_URL || process.argv[2];

  if (!connectionString) {
    console.error('\n❌ ERROR: No database connection string provided.');
    console.log('Usage: node scripts/seed-saudi-arabia-cities.mjs "<POSTGRES_CONNECTION_STRING>"');
    console.log('Or ensure DATABASE_URL is set in your environment / .env.local file.\n');
    console.log('Alternatively, you can copy and paste `database/seed_saudi_arabia_cities.sql` directly into your Supabase SQL Editor.\n');
    process.exit(1);
  }

  const sqlFile = path.resolve(process.cwd(), 'database/seed_saudi_arabia_cities.sql');
  const sql = fs.readFileSync(sqlFile, 'utf8');

  console.log('Connecting to PostgreSQL / Supabase database...');
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✓ Connected successfully!');
    console.log('✓ Executing Top 16 Saudi Arabia cities seed script (database/seed_saudi_arabia_cities.sql)...');

    const result = await client.query(sql);

    // If multi-statement, result might be an array of query results
    const verificationRows = Array.isArray(result) 
      ? result[result.length - 1].rows 
      : result.rows;

    console.log(`\n🎉 SUCCESS! Populated Saudi Arabia cities in database.`);
    if (verificationRows && verificationRows.length > 0) {
      console.log(`✓ Total Saudi cities found: ${verificationRows.length}`);
      console.table(verificationRows.map((r, i) => ({
        '#': i + 1,
        'City Name': r.city_name || r.name,
        'Slug': r.city_slug || r.slug,
        'Country': r.country_name || 'Saudi Arabia'
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
