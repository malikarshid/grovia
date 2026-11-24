const fs = require('fs');
const path = require('path');

/**
 * GROVIA Prisma Configuration & Datasource Switcher
 * Ensures Prisma Client is generated with the correct database provider (PostgreSQL on Vercel/Production,
 * SQLite for local offline development), using the standard DATABASE_URL environment variable.
 */

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
const envPath = path.join(__dirname, '..', '.env');

// Resolve DATABASE_URL from process.env or .env file
let dbUrl = process.env.DATABASE_URL || process.env.POSTGRESQL_URL;

if (!dbUrl && fs.existsSync(envPath)) {
  try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/^DATABASE_URL=["']?([^"'\r\n]+)["']?/m);
    if (match) {
      dbUrl = match[1];
    }
  } catch (err) {
    // Ignore error reading .env
  }
}

const isVercel = process.env.VERCEL === '1' || Boolean(process.env.VERCEL_ENV);
const isProduction = process.env.NODE_ENV === 'production';
const isPostgresUrl = dbUrl && (dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://'));

// Determine target provider:
// Vercel and production deployments MUST use PostgreSQL.
// Local development with file:./dev.db uses SQLite.
let targetProvider = 'postgresql';
if (!isVercel && !isProduction && dbUrl && (dbUrl.startsWith('file:') || dbUrl.startsWith('sqlite:'))) {
  targetProvider = 'sqlite';
}

// Fallback for Vercel/CI builds where DATABASE_URL might be unset in secondary projects
if ((isVercel || isProduction) && !process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://placeholder:placeholder@localhost:5432/grovia?schema=public';
}

console.log(`[prepare-prisma] Environment: Vercel=${isVercel}, NodeEnv=${process.env.NODE_ENV || 'development'}`);
console.log(`[prepare-prisma] Selected database provider: ${targetProvider}`);

if (fs.existsSync(schemaPath)) {
  let schemaContent = fs.readFileSync(schemaPath, 'utf8');

  if (targetProvider === 'postgresql') {
    schemaContent = schemaContent.replace(/provider\s*=\s*"sqlite"/g, 'provider = "postgresql"');
    schemaContent = schemaContent.replace(/url\s*=\s*env\("POSTGRESQL_URL"\)/g, 'url = env("DATABASE_URL")');
  } else {
    schemaContent = schemaContent.replace(/provider\s*=\s*"postgresql"/g, 'provider = "sqlite"');
  }

  fs.writeFileSync(schemaPath, schemaContent, 'utf8');
  console.log(`[prepare-prisma] Updated ${schemaPath} to provider="${targetProvider}".`);
}

