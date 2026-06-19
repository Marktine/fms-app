import { eq, desc, and, or, gt, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { db } from '../../core/db.ts';
import { transactions, categories, accounts, accountBalanceSnapshots, AccountType } from '../../core/schema.ts';

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
    offset: number = 0
  ): Promise<DashboardTransactionRow[]> {
    const sourceAccount = alias(accounts, 'sourceAccount');
    const destAccount = alias(accounts, 'destAccount');

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
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.date), desc(transactions.createdAt))
      .limit(limit)
      .offset(offset);

    return result;
  }

  async getLatestBalancesByUserId(
    userId: string
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
    snapshotDate?: string
  ): Promise<bigint> {
    const conditions = [
      or(
        eq(transactions.sourceAccountId, accountId),
        eq(transactions.destinationAccountId, accountId)
      )
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
        ), 0)`
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


