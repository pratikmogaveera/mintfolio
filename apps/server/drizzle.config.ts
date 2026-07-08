import { defineConfig } from 'drizzle-kit';

const config = defineConfig({
  dialect: 'postgresql',
  dbCredentials: {
    host: 'localhost',
    port: 5432,
    user: 'root',
    password: 'root',
    database: 'mintfolio',
  },
  schema: './src/db/schema.ts',
  out: './drizzle',
});

export default config;
