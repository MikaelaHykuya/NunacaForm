import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error(`
DATABASE_URL belum diisi.

Cara ambil connection string:
  1. Buka Supabase Dashboard → your project → Settings → Database → Connection string
  2. Salin string "URI" (postgres://...), tambahkan password database
  3. Tempel ke .env.local sebagai DATABASE_URL=...

Contoh:
  DATABASE_URL=postgresql://postgres.cuyiktzvgsyduhtmeoor:<password>@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres

Lalu jalankan: npm run db:setup
`);
  process.exit(1);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sqlPath = path.join(__dirname, '..', 'supabase', 'schema.sql');
const sql = readFileSync(sqlPath, 'utf8');

const client = new pg.Client({ connectionString: DATABASE_URL });

try {
  await client.connect();
  await client.query('begin');
  await client.query(sql);
  await client.query('commit');
  console.log('Schema berhasil diterapkan ke Supabase.');
} catch (err) {
  await client.query('rollback').catch(() => {});
  console.error('Gagal menerapkan schema:');
  console.error(err);
  process.exit(1);
} finally {
  await client.end().catch(() => {});
}