import { assertEquals } from 'jsr:@std/assert@^1.0.8';
import { DashboardService } from '../src/modules/dashboard/dashboard.service.ts';
import { DashboardRepository } from '../src/modules/dashboard/dashboard.repository.ts';
import { db } from '../src/core/db.ts';
import { accounts, categories, transactions, users } from '../src/core/schema.ts';
import { eq } from 'drizzle-orm';

Deno.test('DashboardService.getDashboardFilterData - should format, deduplicate and return filter data correctly', async () => {
  const mockRepo = {
    getUniqueTransactionDates: () => Promise.resolve(['2026-06-18', '2026-05-12', '2026-06-01']),
    getUniqueTransactionCategories: () => Promise.resolve(['Groceries', 'Dining']),
    getTransactionTypes: () => Promise.resolve(['Debits', 'Credits']),
  } as unknown as DashboardRepository;

  const service = new DashboardService(mockRepo);
  const filterData = await service.getDashboardFilterData('user-123');

  assertEquals(filterData.type, ['Debits', 'Credits']);
  assertEquals(filterData.categories, ['Groceries', 'Dining']);
  assertEquals(filterData.date, ['JUNE 2026', 'MAY 2026']);
});

Deno.test('DashboardService.getDashboardData - should pass filters to repo', async () => {
  let passedFilters: any = null;
  const mockRepo = {
    getRecentTransactionsByUserId: (
      _userId: string,
      _limit: number,
      _offset: number,
      filters?: any,
    ) => {
      passedFilters = filters;
      return Promise.resolve([]);
    },
    getAccountsByUserId: () => Promise.resolve([]),
    getLatestBalancesByUserId: () => Promise.resolve([]),
  } as unknown as DashboardRepository;

  const service = new DashboardService(mockRepo);
  const filters = { month: 'JUNE 2026', category: 'Dining', type: 'Credits' };
  await service.getDashboardData('user-123', filters);

  assertEquals(passedFilters, filters);
});

Deno.test({
  name: 'DashboardRepository.getRecentTransactionsByUserId - database level integration filters',
  sanitizeResources: false,
  sanitizeOps: false,
  fn: async () => {
    const testEmail = `test-filter-${Date.now()}@example.com`;

    // 1. Insert user
    const [user] = await db.insert(users).values({
      email: testEmail,
      passwordHash: 'dummy',
    }).returning();

    // 2. Insert accounts
    const [checking] = await db.insert(accounts).values({
      userId: user.id,
      name: 'Test Checking',
      type: 'ASSET',
      currency: 'USD',
    }).returning();

    const [expense] = await db.insert(accounts).values({
      userId: user.id,
      name: 'Test Expense',
      type: 'EXPENSE',
      currency: 'USD',
    }).returning();

    // 3. Insert category
    const [category] = await db.insert(categories).values({
      userId: user.id,
      name: 'Test Category',
    }).returning();

    // 4. Insert transaction (Debit)
    const [txDebit] = await db.insert(transactions).values({
      userId: user.id,
      sourceAccountId: checking.id,
      destinationAccountId: expense.id,
      amount: 1000n,
      idempotencyKey: 'key-debit',
      categoryId: category.id,
      date: '2026-06-15',
    }).returning();

    // 5. Insert transaction (Credit) - asset to asset type where dest is asset type, and source is income type
    const [income] = await db.insert(accounts).values({
      userId: user.id,
      name: 'Test Income',
      type: 'INCOME',
      currency: 'USD',
    }).returning();

    const [txCredit] = await db.insert(transactions).values({
      userId: user.id,
      sourceAccountId: income.id,
      destinationAccountId: checking.id,
      amount: 5000n,
      idempotencyKey: 'key-credit',
      categoryId: category.id,
      date: '2026-05-10',
    }).returning();

    const repo = new DashboardRepository();

    try {
      // Test Month Filter (June matches txDebit, May matches txCredit)
      const juneTxs = await repo.getRecentTransactionsByUserId(user.id, 50, 0, {
        month: 'JUNE 2026',
      });
      assertEquals(juneTxs.length, 1);
      assertEquals(juneTxs[0].id, txDebit.id);

      const mayTxs = await repo.getRecentTransactionsByUserId(user.id, 50, 0, {
        month: 'MAY 2026',
      });
      assertEquals(mayTxs.length, 1);
      assertEquals(mayTxs[0].id, txCredit.id);

      // Test Category Filter
      const wrongCategoryTxs = await repo.getRecentTransactionsByUserId(user.id, 50, 0, {
        category: 'Nonexistent',
      });
      assertEquals(wrongCategoryTxs.length, 0);

      const correctCategoryTxs = await repo.getRecentTransactionsByUserId(user.id, 50, 0, {
        category: 'Test Category',
      });
      assertEquals(correctCategoryTxs.length, 2);

      // Test Type Filter (Debits)
      const debitTxs = await repo.getRecentTransactionsByUserId(user.id, 50, 0, { type: 'Debits' });
      assertEquals(debitTxs.length, 1);
      assertEquals(debitTxs[0].id, txDebit.id);

      // Test Type Filter (Credits)
      const creditTxs = await repo.getRecentTransactionsByUserId(user.id, 50, 0, {
        type: 'Credits',
      });
      assertEquals(creditTxs.length, 1);
      assertEquals(creditTxs[0].id, txCredit.id);
    } finally {
      // Clean up
      await db.delete(transactions).where(eq(transactions.userId, user.id));
      await db.delete(categories).where(eq(categories.userId, user.id));
      await db.delete(accounts).where(eq(accounts.userId, user.id));
      await db.delete(users).where(eq(users.id, user.id));
    }
  },
});
