import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'root',
  password: 'root',
  database: 'mintfolio',
});

const db = drizzle(pool);

migrate(db, { migrationsFolder: './drizzle' })
  .then(() => {
    console.log('Migrations applied successfully');
    pool.end();
  })
  .catch((err) => {
    console.error('Migration failed:', err);
    pool.end();
    process.exit(1);
  });
