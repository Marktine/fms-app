import { and, desc, eq, gt, ne, or, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { db } from '../../core/db.ts';
import {
  accountBalanceSnapshots,
  accounts,
  AccountType,
  categories,
  transactions,
} from '../../core/schema.ts';

export type DashboardTransactionRow = {
  id: string;
  amount: bigint;
  date: string;
  note: string | null;
  categoryName: string;
  categoryIcon: string | null;
  sourceType: AccountType;
  destType: AccountType;
};

export type AccountBalanceSnapshotRow = {
  accountId: string;
  accountName: string;
  accountType: AccountType;
  currency: string;
  balance: bigint;
  snapshotDate: string;
};

export class DashboardRepository {
  constructor() {}

  async getRecentTransactionsByUserId(
    userId: string,
    limit: number = 50,
    offset: number = 0,
    filters?: {
      month?: string;
      category?: string;
      type?: string;
    },
  ): Promise<DashboardTransactionRow[]> {
    const sourceAccount = alias(accounts, 'sourceAccount');
    const destAccount = alias(accounts, 'destAccount');

    const conditions = [eq(transactions.userId, userId)];

    if (filters) {
      if (filters.month) {
        const [monthName, yearStr] = filters.month.split(' ');
        const MONTH_MAP: Record<string, number> = {
          JANUARY: 1,
          FEBRUARY: 2,
          MARCH: 3,
          APRIL: 4,
          MAY: 5,
          JUNE: 6,
          JULY: 7,
          AUGUST: 8,
          SEPTEMBER: 9,
          OCTOBER: 10,
          NOVEMBER: 11,
          DECEMBER: 12,
        };
        const monthNum = MONTH_MAP[monthName.toUpperCase()];
        if (monthNum && /^\d+$/.test(yearStr)) {
          const yearNum = parseInt(yearStr, 10);
          conditions.push(
            eq(sql`EXTRACT(MONTH FROM ${transactions.date})`, monthNum),
            eq(sql`EXTRACT(YEAR FROM ${transactions.date})`, yearNum),
          );
        }
      }

      if (filters.category) {
        conditions.push(eq(categories.name, filters.category));
      }

      if (filters.type) {
        if (filters.type === 'Debits') {
          conditions.push(
            or(
              eq(destAccount.type, 'EXPENSE'),
              and(
                eq(sourceAccount.type, 'ASSET'),
                ne(destAccount.type, 'ASSET'),
              )!,
            )!,
          );
        } else if (filters.type === 'Credits') {
          conditions.push(
            and(
              ne(destAccount.type, 'EXPENSE'),
              or(
                ne(sourceAccount.type, 'ASSET'),
                eq(destAccount.type, 'ASSET'),
              )!,
            )!,
          );
        }
      }
    }

    const result = await db
      .select({
        id: transactions.id,
        amount: transactions.amount,
        date: transactions.date,
        note: transactions.note,
        categoryName: categories.name,
        categoryIcon: categories.icon,
        sourceType: sourceAccount.type,
        destType: destAccount.type,
      })
      .from(transactions)
      .innerJoin(categories, eq(transactions.categoryId, categories.id))
      .innerJoin(sourceAccount, eq(transactions.sourceAccountId, sourceAccount.id))
      .innerJoin(destAccount, eq(transactions.destinationAccountId, destAccount.id))
      .where(and(...conditions))
      .orderBy(desc(transactions.date), desc(transactions.createdAt))
      .limit(limit)
      .offset(offset);

    return result;
  }

  async getLatestBalancesByUserId(
    userId: string,
  ): Promise<AccountBalanceSnapshotRow[]> {
    return await db
      .selectDistinctOn([accountBalanceSnapshots.accountId], {
        accountId: accountBalanceSnapshots.accountId,
        accountName: accounts.name,
        accountType: accounts.type,
        currency: accounts.currency,
        balance: accountBalanceSnapshots.balance,
        snapshotDate: accountBalanceSnapshots.snapshotDate,
      })
      .from(accountBalanceSnapshots)
      .innerJoin(accounts, eq(accountBalanceSnapshots.accountId, accounts.id))
      .where(eq(accounts.userId, userId))
      .orderBy(accountBalanceSnapshots.accountId, desc(accountBalanceSnapshots.snapshotDate));
  }

  async getTransactionDeltaSinceSnapshot(
    accountId: string,
    snapshotDate?: string,
  ): Promise<bigint> {
    const conditions = [
      or(
        eq(transactions.sourceAccountId, accountId),
        eq(transactions.destinationAccountId, accountId),
      ),
    ];

    if (snapshotDate) {
      conditions.push(gt(transactions.date, snapshotDate));
    }

    const result = await db
      .select({
        delta: sql<bigint>`COALESCE(SUM(
          CASE 
            WHEN ${transactions.destinationAccountId} = ${accountId} THEN ${transactions.amount} 
            ELSE -${transactions.amount} 
          END
        ), 0)`,
      })
      .from(transactions)
      .where(and(...conditions));

    return BigInt(result[0]?.delta ?? 0n);
  }

  async getAccountsByUserId(userId: string) {
    return await db
      .select({
        id: accounts.id,
        name: accounts.name,
        type: accounts.type,
        currency: accounts.currency,
      })
      .from(accounts)
      .where(eq(accounts.userId, userId));
  }

  async getUniqueTransactionDates(userId: string): Promise<string[]> {
    const result = await db
      .selectDistinct({
        date: transactions.date,
      })
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.date));

    return result.map((row) => row.date);
  }

  async getUniqueTransactionCategories(userId: string): Promise<string[]> {
    const result = await db
      .selectDistinct({
        name: categories.name,
      })
      .from(transactions)
      .innerJoin(categories, eq(transactions.categoryId, categories.id))
      .where(eq(transactions.userId, userId))
      .orderBy(categories.name);

    return result.map((row) => row.name);
  }

  async getTransactionTypes(_userId: string): Promise<string[]> {
    return ['Debits', 'Credits'];
  }
}
