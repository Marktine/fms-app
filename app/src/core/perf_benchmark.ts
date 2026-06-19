import { db } from './db.ts';
import { users } from './schema.ts';
import { eq } from 'drizzle-orm';
import { DashboardRepository } from '../modules/dashboard/dashboard.repository.ts';
import { DashboardService } from '../modules/dashboard/dashboard.service.ts';
import { formatCurrency } from '../ui/utils/format.ts';

async function main() {
  console.log('Running performance benchmark...');

  try {
    const email = 'perf_user@example.com';
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (existingUser.length === 0) {
      throw new Error(`Performance user ${email} not found. Please run the seeder first.`);
    }

    const userId = existingUser[0].id;
    console.log(`Found user ${email} (ID: ${userId})`);

    const repo = new DashboardRepository();
    const service = new DashboardService(repo);

    console.log('Fetching dashboard data...');
    console.time('dashboard_fetch');
    const data = await service.getDashboardData(userId);
    console.timeEnd('dashboard_fetch');

    console.log('Dashboard Data Summary:');
    console.log(`- Balance: ${formatCurrency(data.balance, 'USD')}`);
    console.log(`- Recent Transactions Count: ${data.transactions.length}`);
  } catch (error) {
    console.error('Benchmark failed:', error);
  } finally {
    Deno.exit(0);
  }
}

main();
