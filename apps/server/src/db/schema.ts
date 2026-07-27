import { boolean, date, numeric, pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid().primaryKey().defaultRandom(),
  username: text().notNull().unique(),
  password_hash: text().notNull(), // hashed password
  email: text().notNull().unique(),
  created_at: timestamp().notNull().defaultNow(),
});

export const portfolioLogs = pgTable(
  'portfolio_logs',
  {
    id: uuid().primaryKey().defaultRandom(),
    user_id: uuid()
      .notNull()
      .references(() => users.id),
    date: date().notNull().defaultNow(),
    total_invested: numeric().notNull().default('0.0'),
    current_value: numeric().notNull().default('0.0'),
  },
  (t) => [unique().on(t.user_id, t.date)],
);

export const holdings = pgTable(
  'holdings',
  {
    id: uuid().primaryKey().defaultRandom(),
    user_id: uuid()
      .notNull()
      .references(() => users.id),
    scheme_name: text().notNull(),
    scheme_code: text().notNull(),
    units: numeric().notNull().default('0.0'),
    amount_invested: numeric().notNull().default('0.0'),
    current_value: numeric().notNull().default('0.0'),
  },
  (t) => [unique().on(t.user_id, t.scheme_code)],
);

export const pushSubscriptions = pgTable('push_subscriptions', {
  id: uuid().primaryKey().defaultRandom(),
  user_id: uuid()
    .notNull()
    .references(() => users.id),
  endpoint: text().notNull().unique(),
  keys_p256dh: text().notNull(),
  keys_auth: text().notNull(),
  device_label: text(),
  is_active: boolean().notNull().default(true),
});
