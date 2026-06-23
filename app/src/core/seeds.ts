import { db } from './db.ts';
import { accountBalanceSnapshots, accounts, categories, transactions, users } from './schema.ts';
import { and, eq } from 'drizzle-orm';
import { hash } from '@felix/argon2';

async function seed() {
  console.log('Seeding database...');

  try {
    // 1. Find or create the user
    let userId: string;
    const existingUser = await db.select().from(users).where(eq(users.email, 'test@example.com'))
      .limit(1);

    if (existingUser.length > 0) {
      userId = existingUser[0].id;
      console.log(`Using existing user test@example.com with ID: ${userId}`);
    } else {
      const passwordHash = await hash('password123');
      const result = await db.insert(users)
        .values({
          email: 'test@example.com',
          passwordHash: passwordHash,
        })
        .returning();
      userId = result[0].id;
      console.log(`Created user test@example.com with ID: ${userId}`);
    }

    // 2. Seed Categories
    const categoriesToSeed = [
      { name: 'Groceries', icon: 'shopping_basket' },
      { name: 'Dining', icon: 'coffee' },
      { name: 'Income', icon: 'payments' },
      { name: 'Transport', icon: 'train' },
      { name: 'Software', icon: 'subscriptions' },
    ];

    const categoryMap: Record<string, string> = {};

    for (const cat of categoriesToSeed) {
      const existing = await db.select().from(categories)
        .where(and(eq(categories.userId, userId), eq(categories.name, cat.name)))
        .limit(1);

      if (existing.length > 0) {
        categoryMap[cat.name] = existing[0].id;
      } else {
        const inserted = await db.insert(categories)
          .values({
            name: cat.name,
            icon: cat.icon,
            userId: userId,
          })
          .returning();
        categoryMap[cat.name] = inserted[0].id;
        console.log(`Created category: ${cat.name}`);
      }
    }

    // 3. Seed Accounts
    const accountsToSeed = [
      { name: 'Checking', type: 'ASSET' as const, currency: 'USD' },
      { name: 'Savings', type: 'ASSET' as const, currency: 'USD' },
      { name: 'Credit Card', type: 'LIABILITY' as const, currency: 'USD' },
      { name: 'Salary', type: 'INCOME' as const, currency: 'USD' },
      { name: 'Groceries Expense', type: 'EXPENSE' as const, currency: 'USD' },
      { name: 'Dining Expense', type: 'EXPENSE' as const, currency: 'USD' },
      { name: 'Transport Expense', type: 'EXPENSE' as const, currency: 'USD' },
      { name: 'Software Expense', type: 'EXPENSE' as const, currency: 'USD' },
    ];

    const accountMap: Record<string, string> = {};

    for (const acc of accountsToSeed) {
      const existing = await db.select().from(accounts)
        .where(and(eq(accounts.userId, userId), eq(accounts.name, acc.name)))
        .limit(1);

      if (existing.length > 0) {
        accountMap[acc.name] = existing[0].id;
      } else {
        const inserted = await db.insert(accounts)
          .values({
            userId: userId,
            name: acc.name,
            type: acc.type,
            currency: acc.currency,
          })
          .returning();
        accountMap[acc.name] = inserted[0].id;
        console.log(`Created account: ${acc.name}`);
      }
    }

    // 4. Seed Transactions
    const transactionsToSeed = [
      {
        note: 'Mitsuwa Marketplace',
        sourceAccount: 'Checking',
        destinationAccount: 'Groceries Expense',
        amount: 14250n,
        categoryName: 'Groceries',
        date: '2023-10-28',
        idempotencyKey: 'mitsuwa-marketplace-oct-28',
      },
      {
        note: 'Seymour Coffee',
        sourceAccount: 'Checking',
        destinationAccount: 'Dining Expense',
        amount: 675n,
        categoryName: 'Dining',
        date: '2023-10-27',
        idempotencyKey: 'seymour-coffee-oct-27',
      },
      {
        note: 'Design Contract - Alpha',
        sourceAccount: 'Salary',
        destinationAccount: 'Checking',
        amount: 420000n,
        categoryName: 'Income',
        date: '2023-10-25',
        idempotencyKey: 'design-contract-alpha-oct-25',
      },
      {
        note: 'Metro Transit Pass',
        sourceAccount: 'Checking',
        destinationAccount: 'Transport Expense',
        amount: 8500n,
        categoryName: 'Transport',
        date: '2023-10-24',
        idempotencyKey: 'metro-transit-pass-oct-24',
      },
      {
        note: 'Cloud Storage Inc.',
        sourceAccount: 'Credit Card',
        destinationAccount: 'Software Expense',
        amount: 1299n,
        categoryName: 'Software',
        date: '2023-09-30',
        idempotencyKey: 'cloud-storage-inc-sep-30',
      },
      {
        note: 'Whole Foods Market',
        sourceAccount: 'Checking',
        destinationAccount: 'Groceries Expense',
        amount: 8740n,
        categoryName: 'Groceries',
        date: '2023-10-20',
        idempotencyKey: 'whole-foods-oct-20',
      },
      {
        note: 'Sweetgreen Salad',
        sourceAccount: 'Checking',
        destinationAccount: 'Dining Expense',
        amount: 1650n,
        categoryName: 'Dining',
        date: '2023-10-18',
        idempotencyKey: 'sweetgreen-oct-18',
      },
      {
        note: 'Uber Ride',
        sourceAccount: 'Credit Card',
        destinationAccount: 'Transport Expense',
        amount: 2450n,
        categoryName: 'Transport',
        date: '2023-10-15',
        idempotencyKey: 'uber-oct-15',
      },
      {
        note: 'Netflix Subscription',
        sourceAccount: 'Credit Card',
        destinationAccount: 'Software Expense',
        amount: 1549n,
        categoryName: 'Software',
        date: '2023-10-12',
        idempotencyKey: 'netflix-oct-12',
      },
      {
        note: 'Spotify Premium',
        sourceAccount: 'Credit Card',
        destinationAccount: 'Software Expense',
        amount: 999n,
        categoryName: 'Software',
        date: '2023-10-10',
        idempotencyKey: 'spotify-oct-10',
      },
      {
        note: 'Weekly Grocery Haul',
        sourceAccount: 'Checking',
        destinationAccount: 'Groceries Expense',
        amount: 11230n,
        categoryName: 'Groceries',
        date: '2023-10-05',
        idempotencyKey: 'weekly-grocery-oct-05',
      },
      {
        note: 'Blue Bottle Coffee',
        sourceAccount: 'Checking',
        destinationAccount: 'Dining Expense',
        amount: 550n,
        categoryName: 'Dining',
        date: '2023-10-02',
        idempotencyKey: 'blue-bottle-oct-02',
      },
      {
        note: 'Design Retainer - Beta',
        sourceAccount: 'Salary',
        destinationAccount: 'Checking',
        amount: 350000n,
        categoryName: 'Income',
        date: '2023-09-28',
        idempotencyKey: 'design-retainer-sep-28',
      },
      {
        note: 'Gas Station Fuel',
        sourceAccount: 'Checking',
        destinationAccount: 'Transport Expense',
        amount: 4500n,
        categoryName: 'Transport',
        date: '2023-09-22',
        idempotencyKey: 'gas-station-sep-22',
      },
      {
        note: 'Trader Joes',
        sourceAccount: 'Checking',
        destinationAccount: 'Groceries Expense',
        amount: 6720n,
        categoryName: 'Groceries',
        date: '2023-09-15',
        idempotencyKey: 'trader-joes-sep-15',
      },
      {
        note: 'GitHub Copilot Subscription',
        sourceAccount: 'Credit Card',
        destinationAccount: 'Software Expense',
        amount: 1000n,
        categoryName: 'Software',
        date: '2023-09-10',
        idempotencyKey: 'github-copilot-sep-10',
      },
      {
        note: 'Local Pizzeria',
        sourceAccount: 'Checking',
        destinationAccount: 'Dining Expense',
        amount: 2850n,
        categoryName: 'Dining',
        date: '2023-09-08',
        idempotencyKey: 'local-pizzeria-sep-08',
      },
      {
        note: 'Lyft Trip',
        sourceAccount: 'Credit Card',
        destinationAccount: 'Transport Expense',
        amount: 1820n,
        categoryName: 'Transport',
        date: '2023-09-02',
        idempotencyKey: 'lyft-sep-02',
      },
      {
        note: 'Freelance Coding Work',
        sourceAccount: 'Salary',
        destinationAccount: 'Checking',
        amount: 250000n,
        categoryName: 'Income',
        date: '2023-08-25',
        idempotencyKey: 'freelance-coding-aug-25',
      },
      {
        note: 'Target Superstore',
        sourceAccount: 'Checking',
        destinationAccount: 'Groceries Expense',
        amount: 9410n,
        categoryName: 'Groceries',
        date: '2023-08-20',
        idempotencyKey: 'target-aug-20',
      },
      {
        note: 'Ramen Ichiran',
        sourceAccount: 'Checking',
        destinationAccount: 'Dining Expense',
        amount: 2150n,
        categoryName: 'Dining',
        date: '2023-08-18',
        idempotencyKey: 'ramen-ichiran-aug-18',
      },
      {
        note: 'Subway Ticket',
        sourceAccount: 'Checking',
        destinationAccount: 'Transport Expense',
        amount: 275n,
        categoryName: 'Transport',
        date: '2023-08-14',
        idempotencyKey: 'subway-ticket-aug-14',
      },
      {
        note: 'Figma Pro Subscription',
        sourceAccount: 'Credit Card',
        destinationAccount: 'Software Expense',
        amount: 1500n,
        categoryName: 'Software',
        date: '2023-08-10',
        idempotencyKey: 'figma-pro-aug-10',
      },
    ];

    for (const tx of transactionsToSeed) {
      const sourceAccountId = accountMap[tx.sourceAccount];
      const destinationAccountId = accountMap[tx.destinationAccount];
      const categoryId = categoryMap[tx.categoryName];

      if (!sourceAccountId || !destinationAccountId || !categoryId) {
        console.error(
          `Skipping transaction ${tx.note} due to missing account/category references.`,
        );
        continue;
      }

      const existing = await db.select().from(transactions)
        .where(
          and(eq(transactions.userId, userId), eq(transactions.idempotencyKey, tx.idempotencyKey)),
        )
        .limit(1);

      if (existing.length > 0) {
        console.log(`Transaction already exists (skipped conflict): ${tx.note}`);
      } else {
        const inserted = await db.insert(transactions)
          .values({
            userId: userId,
            sourceAccountId,
            destinationAccountId,
            amount: tx.amount,
            idempotencyKey: tx.idempotencyKey,
            categoryId,
            date: tx.date,
            note: tx.note,
          })
          .returning();
        console.log(`Created transaction: ${tx.note} (${inserted[0].id})`);
      }
    }

    // 5. Seed Account Balance Snapshots
    const checkingAccountId = accountMap['Checking'];
    if (checkingAccountId) {
      const existingSnapshot = await db.select().from(accountBalanceSnapshots)
        .where(and(
          eq(accountBalanceSnapshots.accountId, checkingAccountId),
          eq(accountBalanceSnapshots.snapshotDate, '2023-10-01'),
        ))
        .limit(1);

      if (existingSnapshot.length > 0) {
        console.log('Snapshot already exists (skipped conflict).');
      } else {
        await db.insert(accountBalanceSnapshots)
          .values({
            accountId: checkingAccountId,
            balance: 1000000n, // $10,000.00
            snapshotDate: '2023-10-01',
          });
        console.log('Created checking account balance snapshot for 2023-10-01.');
      }
    }

    console.log('Seeding complete.');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    Deno.exit(0);
  }
}

seed();
