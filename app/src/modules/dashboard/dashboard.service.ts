import { DashboardRepository } from './dashboard.repository.ts';
import { formatTransactionDate } from '../../core/utils/date.ts';

export interface Transaction {
  id: string;
  icon: string;
  title: string;
  date: string;
  category: string;
  amount: bigint;
  month: string;
}

export interface DashboardData {
  balance: bigint;
  transactions: Transaction[];
}

export interface DashboardFilterData {
  categories: string[];
  date: string[];
  type: string[];
}

export interface TransactionFilters {
  month?: string;
  category?: string;
  type?: string;
}

export class DashboardService {
  constructor(private readonly repo: DashboardRepository) {}

  public async getDashboardFilterData(userId: string): Promise<DashboardFilterData> {
    const dates = await this.repo.getUniqueTransactionDates(userId);
    const formattedMonths = dates.map((d) => formatTransactionDate(d).uiMonth);
    const uniqueMonths = Array.from(new Set(formattedMonths));

    const categories = await this.repo.getUniqueTransactionCategories(userId);
    const type = await this.repo.getTransactionTypes(userId);

    return {
      categories,
      date: uniqueMonths,
      type,
    };
  }

  public async getDashboardData(
    userId: string,
    filters?: TransactionFilters,
  ): Promise<DashboardData> {
    const rawTransactions = await this.repo.getRecentTransactionsByUserId(userId, 50, 0, filters);

    const transactions: Transaction[] = rawTransactions.map((row) => {
      let amount = row.amount;

      // Basic check to determine if the transaction is an expense/outgoing
      if (row.destType === 'EXPENSE' || (row.sourceType === 'ASSET' && row.destType !== 'ASSET')) {
        amount = -amount;
      }

      const { uiDate, uiMonth } = formatTransactionDate(row.date);

      return {
        id: row.id,
        icon: row.categoryIcon || 'help_circle',
        title: row.note || 'Transaction',
        date: uiDate,
        category: row.categoryName,
        amount,
        month: uiMonth,
      };
    });

    // Calculate actual total balance across user accounts using snapshots and transaction deltas
    const userAccounts = await this.repo.getAccountsByUserId(userId);
    const latestSnapshots = await this.repo.getLatestBalancesByUserId(userId);

    const latestSnapshotMap = new Map<string, typeof latestSnapshots[0]>();
    for (const snapshot of latestSnapshots) {
      latestSnapshotMap.set(snapshot.accountId, snapshot);
    }

    let totalBalanceCents = 0n;
    for (const account of userAccounts) {
      const snapshot = latestSnapshotMap.get(account.id);
      const startingBalance = snapshot ? snapshot.balance : 0n;
      const snapshotDate = snapshot ? snapshot.snapshotDate : undefined;

      const delta = await this.repo.getTransactionDeltaSinceSnapshot(account.id, snapshotDate);
      const currentAccountBalance = startingBalance + delta;

      if (account.type === 'ASSET' || account.type === 'LIABILITY') {
        totalBalanceCents += currentAccountBalance;
      }
    }

    return {
      balance: totalBalanceCents,
      transactions,
    };
  }
}
