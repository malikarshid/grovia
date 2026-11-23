const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
const pgSchemaPath = path.join(__dirname, '..', 'prisma', 'schema.postgresql.prisma');
const migrationsDir = path.join(__dirname, '..', 'prisma', 'migrations', '0_init_postgresql');

let content = fs.readFileSync(schemaPath, 'utf8');
content = content.replace(/provider\s*=\s*"sqlite"/, 'provider = "postgresql"');
content = content.replace(/url\s*=\s*env\("DATABASE_URL"\)/, 'url = env("POSTGRESQL_URL")');

fs.writeFileSync(pgSchemaPath, content, 'utf8');
console.log('Successfully wrote synchronized PostgreSQL schema to', pgSchemaPath);

if (!fs.existsSync(migrationsDir)) {
  fs.mkdirSync(migrationsDir, { recursive: true });
}

// Generate DDL script using prisma migrate diff
try {
  const ddl = execSync(
    'npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.postgresql.prisma --script',
    {
      env: {
        ...process.env,
        POSTGRESQL_URL: 'postgresql://grovia_admin:grovia_secure_password_2026@localhost:5432/groviadb?schema=public',
      },
      encoding: 'utf8',
    }
  );
  const sqlPath = path.join(migrationsDir, 'migration.sql');
  fs.writeFileSync(sqlPath, ddl, 'utf8');
  console.log('Successfully generated PostgreSQL initial migration DDL to', sqlPath);
} catch (err) {
  console.error('Error generating migration DDL:', err.message);
}
