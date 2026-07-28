import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import path from 'path';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://root:root@127.0.0.1:5432/mintfolio',
});

const db = drizzle(pool);

migrate(db, { migrationsFolder: path.join(__dirname, '../../../drizzle') })
  .then(() => {
    console.log('Migrations applied successfully');
    pool.end();
  })
  .catch((err) => {
    console.error('Migration failed:', err);
    pool.end();
    process.exit(1);
  });
