import {
  bigint,
  check,
  date,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// --- ENUMS ---
export const connectionStatusEnum = pgEnum('connection_status', ['PENDING', 'ACCEPTED']);
export const accountTypeValues = ['ASSET', 'LIABILITY', 'INCOME', 'EXPENSE'] as const;
export type AccountType = typeof accountTypeValues[number];
export const accountTypeEnum = pgEnum('account_type', accountTypeValues);

// --- TABLES ---

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  icon: text('icon'),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('categories_user_id_idx').on(table.userId),
]);

// NEW: Accounts table to back actual ledger balances
export const accounts = pgTable('accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  type: accountTypeEnum('type').notNull(),
  currency: varchar('currency', { length: 3 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('accounts_user_id_idx').on(table.userId),
]);

export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'restrict' }),

  // Double-Entry Reference
  sourceAccountId: uuid('source_account_id').notNull().references(() => accounts.id),
  destinationAccountId: uuid('destination_account_id').notNull().references(() => accounts.id),

  amount: bigint('amount', { mode: 'bigint' }).notNull(),

  // Scope idempotency per user to prevent cross-user collisions
  idempotencyKey: varchar('idempotency_key', { length: 256 }).notNull(),

  categoryId: uuid('category_id').notNull().references(() => categories.id),
  date: date('date').notNull(),
  note: text('note'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  check('positive_amount', sql`${table.amount} >= 0`),
  index('transactions_user_id_idx').on(table.userId),
  // Idempotency constraint scoped to the individual user
  unique('user_id_idempotency_unique').on(table.userId, table.idempotencyKey),
]);

export const transactionShares = pgTable('transaction_shares', {
  id: uuid('id').primaryKey().defaultRandom(),
  transactionId: uuid('transaction_id').notNull().references(() => transactions.id, {
    onDelete: 'cascade',
  }),
  sharedWithUserId: uuid('shared_with_user_id').notNull().references(() => users.id),
  shareAmount: bigint('share_amount', { mode: 'bigint' }).notNull(),
  isSettled: text('is_settled').default('false').notNull(), // Tracks structural settlement status
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  unique().on(table.transactionId, table.sharedWithUserId),
]);

export const budgets = pgTable('budgets', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'cascade' }),
  amount: bigint('amount', { mode: 'bigint' }).notNull(),
  currency: varchar('currency', { length: 3 }).notNull(),
  monthYear: date('month_year').notNull(),
}, (table) => [
  index('budgets_user_id_idx').on(table.userId),
]);

export const connections = pgTable('connections', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  contactId: uuid('contact_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: connectionStatusEnum('status').default('PENDING').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  unique().on(table.userId, table.contactId),
]);

export const accountBalanceSnapshots = pgTable('account_balance_snapshots', {
  id: uuid('id').primaryKey().defaultRandom(),
  accountId: uuid('account_id').notNull().references(() => accounts.id, { onDelete: 'cascade' }),
  balance: bigint('balance', { mode: 'bigint' }).notNull(),
  lastTransactionId: uuid('last_transaction_id').references(() => transactions.id, {
    onDelete: 'set null',
  }),
  snapshotDate: date('snapshot_date').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  unique('account_date_snapshot_unique').on(table.accountId, table.snapshotDate),
  index('account_balance_snapshots_account_id_idx').on(table.accountId),
]);
