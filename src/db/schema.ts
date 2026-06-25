import { pgTable, serial, text, varchar, timestamp, pgEnum, uuid, integer } from 'drizzle-orm/pg-core';

// 1. Enums
export const roleEnum = pgEnum('user_role', ['mahasiswa', 'dosen', 'admin', 'teknisi']);
export const statusEnum = pgEnum('report_status', ['pending', 'in_progress', 'resolved', 'rejected']);
export const priorityEnum = pgEnum('report_priority', ['rendah', 'sedang', 'tinggi']);

// 2. Users Table
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  nimNidn: varchar('nim_nidn', { length: 50 }).unique().notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  pic: text('pic').notNull(),
  role: roleEnum('role').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 3. Categories Table
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).unique().notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 4. Locations Table
export const locations = pgTable('locations', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).unique().notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 5. Reports Table
export const reports = pgTable('reports', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  photoUrl: text('photo_url'),
  status: statusEnum('status').default('pending').notNull(),
  priority: priorityEnum('priority').default('sedang').notNull(),
  technicianId: uuid('technician_id').references(() => users.id, { onDelete: 'set null' }),
  notes: text('notes'),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  categoryId: integer('category_id').references(() => categories.id, { onDelete: 'restrict' }).notNull(),
  locationId: integer('location_id').references(() => locations.id, { onDelete: 'restrict' }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 6. Report Feedbacks Table
export const reportFeedbacks = pgTable('report_feedbacks', {
  id: serial('id').primaryKey(),
  reportId: uuid('report_id').references(() => reports.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  comment: text('comment').notNull(),
  rating: integer('rating').notNull(), // rating 1 s.d. 5
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
