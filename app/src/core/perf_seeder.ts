import { db } from './db.ts';
import { accountBalanceSnapshots, accounts, categories, transactions, users } from './schema.ts';
import { and, eq, like } from 'drizzle-orm';
import { hash } from '@felix/argon2';

async function seed() {
  console.log('Running performance seeder...');

  try {
    // 1. Find or create user
    const email = 'perf_user@example.com';
    let userId: string;
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (existingUser.length > 0) {
      userId = existingUser[0].id;
      console.log(`Using existing user ${email} with ID: ${userId}`);
    } else {
      const passwordHash = await hash('perfpassword123');
      const result = await db.insert(users)
        .values({
          email,
          passwordHash,
        })
        .returning();
      userId = result[0].id;
      console.log(`Created user ${email} with ID: ${userId}`);
    }

    // 2. Find or create category 'Groceries'
    let categoryId: string;
    const existingCategory = await db.select().from(categories)
      .where(and(eq(categories.userId, userId), eq(categories.name, 'Groceries')))
      .limit(1);

    if (existingCategory.length > 0) {
      categoryId = existingCategory[0].id;
      console.log(`Using existing category 'Groceries' with ID: ${categoryId}`);
    } else {
      const inserted = await db.insert(categories)
        .values({
          name: 'Groceries',
          icon: 'shopping_basket',
          userId,
        })
        .returning();
      categoryId = inserted[0].id;
      console.log(`Created category 'Groceries' with ID: ${categoryId}`);
    }

    // 3. Find or create accounts
    let checkingAccountId: string;
    const existingChecking = await db.select().from(accounts)
      .where(and(eq(accounts.userId, userId), eq(accounts.name, 'Checking')))
      .limit(1);

    if (existingChecking.length > 0) {
      checkingAccountId = existingChecking[0].id;
      console.log(`Using existing Checking account: ${checkingAccountId}`);
    } else {
      const inserted = await db.insert(accounts)
        .values({
          userId,
          name: 'Checking',
          type: 'ASSET',
          currency: 'USD',
        })
        .returning();
      checkingAccountId = inserted[0].id;
      console.log(`Created Checking account: ${checkingAccountId}`);
    }

    let groceriesExpenseAccountId: string;
    const existingExpense = await db.select().from(accounts)
      .where(and(eq(accounts.userId, userId), eq(accounts.name, 'Groceries Expense')))
      .limit(1);

    if (existingExpense.length > 0) {
      groceriesExpenseAccountId = existingExpense[0].id;
      console.log(`Using existing Groceries Expense account: ${groceriesExpenseAccountId}`);
    } else {
      const inserted = await db.insert(accounts)
        .values({
          userId,
          name: 'Groceries Expense',
          type: 'EXPENSE',
          currency: 'USD',
        })
        .returning();
      groceriesExpenseAccountId = inserted[0].id;
      console.log(`Created Groceries Expense account: ${groceriesExpenseAccountId}`);
    }

    // 4. Balance snapshot of $2000 (200000n cents) at '2026-05-01'
    const snapshotDate = '2026-05-01';
    const existingSnapshot = await db.select().from(accountBalanceSnapshots)
      .where(and(
        eq(accountBalanceSnapshots.accountId, checkingAccountId),
        eq(accountBalanceSnapshots.snapshotDate, snapshotDate),
      ))
      .limit(1);

    if (existingSnapshot.length > 0) {
      console.log('Balance snapshot already exists.');
    } else {
      await db.insert(accountBalanceSnapshots)
        .values({
          accountId: checkingAccountId,
          balance: 200000n,
          snapshotDate,
        });
      console.log(`Created Checking balance snapshot of 200000n cents at ${snapshotDate}.`);
    }

    // 5. 350 transactions with dates after the snapshot date (e.g., '2026-05-02')
    // each transferring 100n cents from 'Checking' to 'Groceries Expense'
    const txDate = '2026-05-02';
    const expectedCount = 350;

    // Get existing perf transactions
    const existingTxs = await db.select({
      idempotencyKey: transactions.idempotencyKey,
    })
      .from(transactions)
      .where(and(
        eq(transactions.userId, userId),
        like(transactions.idempotencyKey, 'perf-tx-%'),
      ));

    const existingKeys = new Set(existingTxs.map((t) => t.idempotencyKey));
    console.log(`Found ${existingKeys.size} existing performance transactions.`);

    const txsToInsert: Array<{
      userId: string;
      sourceAccountId: string;
      destinationAccountId: string;
      amount: bigint;
      idempotencyKey: string;
      categoryId: string;
      date: string;
      note: string;
    }> = [];

    for (let i = 0; i < expectedCount; i++) {
      const key = `perf-tx-${i}`;
      if (!existingKeys.has(key)) {
        txsToInsert.push({
          userId,
          sourceAccountId: checkingAccountId,
          destinationAccountId: groceriesExpenseAccountId,
          amount: 100n,
          idempotencyKey: key,
          categoryId,
          date: txDate,
          note: `Performance test transaction ${i}`,
        });
      }
    }

    if (txsToInsert.length > 0) {
      console.log(`Inserting ${txsToInsert.length} new transactions...`);
      // Insert in batches of 100 to avoid query size limits
      const batchSize = 100;
      for (let i = 0; i < txsToInsert.length; i += batchSize) {
        const batch = txsToInsert.slice(i, i + batchSize);
        await db.insert(transactions).values(batch);
      }
      console.log(`Inserted ${txsToInsert.length} transactions successfully.`);
    } else {
      console.log('All 350 transactions already exist.');
    }

    console.log('Performance seeding complete.');
  } catch (error) {
    console.error('Error running performance seeder:', error);
  } finally {
    Deno.exit(0);
  }
}

seed();
