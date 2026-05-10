/**
 * Script para aplicar a migration do Gymfy no Supabase.
 *
 * Uso: node scripts/migrate.js
 *
 * Requer DIRECT_URL configurada em apps/api/.env com a connection string do Supabase.
 *
 * Alternativa: copie o conteúdo de apps/api/prisma/migrations/001_gymfy_initial_schema.sql
 * e execute diretamente no Supabase SQL Editor (https://supabase.com/dashboard).
 */

const fs = require('fs');
const path = require('path');

const envFile = fs.readFileSync(path.join(__dirname, '../apps/api/.env'), 'utf8');
const envVars = {};
envFile.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if (key && val.length) envVars[key.trim()] = val.join('=').trim();
});

const dbUrl = envVars['DIRECT_URL'] || envVars['DATABASE_URL'];
if (!dbUrl || dbUrl.includes('[PASSWORD]')) {
  console.error('Configure a senha do banco em apps/api/.env (DIRECT_URL ou DATABASE_URL)');
  console.error('Ou aplique o SQL manualmente no Supabase SQL Editor:');
  console.error('  Arquivo: apps/api/prisma/migrations/001_gymfy_initial_schema.sql');
  process.exit(1);
}

async function run() {
  let Client;
  try {
    Client = require('pg').Client;
  } catch {
    console.error('Instale o pg: npm install pg');
    process.exit(1);
  }

  const sql = fs.readFileSync(
    path.join(__dirname, '../apps/api/prisma/migrations/001_gymfy_initial_schema.sql'),
    'utf8'
  );

  const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log('Conectado ao Supabase');
  try {
    await client.query(sql);
    console.log('Migration aplicada com sucesso!');
  } catch (err) {
    console.error('Erro:', err.message);
  } finally {
    await client.end();
  }
}

run();
