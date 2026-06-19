import { assertEquals } from 'jsr:@std/assert@^1.0.8';
import { DashboardService } from '../src/modules/dashboard/dashboard.service.ts';
import { DashboardRepository } from '../src/modules/dashboard/dashboard.repository.ts';

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
