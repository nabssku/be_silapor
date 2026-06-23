import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const usersTest = pgTable('users_test', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
