import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const usersTable = pgTable('users', {
  id: uuid().primaryKey().defaultRandom(),
  username: text().notNull().unique(),
  password_hash: text().notNull(), // hashed password
  email: text().notNull().unique(),
  created_at: timestamp().notNull().defaultNow(),
});
