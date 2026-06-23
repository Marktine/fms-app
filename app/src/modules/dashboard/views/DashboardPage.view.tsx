/** @jsxImportSource hono/jsx */

import { AuthenticatedLayout } from '../../../ui/layouts/AuthenticatedLayout.tsx';
import { formatCurrency } from '../../../ui/utils/format.ts';
import { Icon } from '../../../ui/components/Icon.tsx';
import { Button } from '../../../ui/components/Button.tsx';
import { Card } from '../../../ui/components/Card.tsx';
import { Transaction, TransactionFilters } from '../dashboard.service.ts';
import { Coffee, DollarSign, Filter, type IconNode, Repeat, ShoppingBasket, Train } from 'lucide';
import { DashboardFiltersSkeleton } from './DashboardFilters.view.tsx';

const lucideIconMap: Record<string, IconNode> = {
  shopping_basket: ShoppingBasket,
  coffee: Coffee,
  payments: DollarSign,
  train: Train,
  subscriptions: Repeat,
};

export type DashboardPageProps = {
  balance: bigint;
  transactions: Transaction[];
  filters?: TransactionFilters;
};

export const DashboardPage = ({
  balance,
  transactions,
  filters,
}: DashboardPageProps) => (
  <AuthenticatedLayout title='Dashboard'>
    {/* Ledger Column / Receipt */}
    <Card class='w-full max-w-[720px] pb-xl'>
      {/* Sticky Filter Bar */}
      <div class='sticky top-[64px] z-30 bg-surface-container-lowest/95 backdrop-blur-sm border-b-[3px] border-on-surface p-md flex items-center gap-sm shadow-[0_4px_0px_rgba(27,28,26,0.05)]'>
        <DashboardFiltersSkeleton filters={filters} />
        <Button variant='outline' class='w-10 h-10 px-0 py-0'>
          <Icon icon={Filter} class='w-5 h-5' />
        </Button>
      </div>

      {/* Receipt Header / Summary Info */}
      <div class='pt-margin px-margin pb-sm text-center border-b-[3px] border-on-surface border-dashed'>
        <p class='font-label-caps text-label-caps text-outline uppercase tracking-widest mb-2'>
          Statement Balance
        </p>
        <h2 class='font-h1 text-h1 text-on-surface mb-2'>
          {formatCurrency(balance, 'USD')}
        </h2>
      </div>

      {/* Ledger Entries */}
      <div class='ledger-container overflow-y-auto max-h-[500px] relative'>
        {(() => {
          const groups: { month: string; txs: Transaction[] }[] = [];
          for (const tx of transactions) {
            let group = groups.find((g) => g.month === tx.month);
            if (!group) {
              group = { month: tx.month, txs: [] };
              groups.push(group);
            }
            group.txs.push(tx);
          }

          return groups.map((group) => (
            <div
              class='relative'
              key={`month-container-${group.month}`}
            >
              {/* Sticky Header */}
              <div class='sticky top-0 z-20 bg-surface-container-lowest border-b-[3px] border-on-surface px-margin py-xs flex items-center shadow-[0_2px_4px_rgba(0,0,0,0.05)]'>
                <h3 class='font-h3 text-h3 text-on-surface whitespace-nowrap'>
                  {group.month}
                </h3>
              </div>

              {/* Inner List */}
              <div class='flex flex-col'>
                {group.txs.map((tx) => {
                  const isCredit = tx.amount > 0n;
                  const amountStr = (isCredit ? '+' : '') + formatCurrency(tx.amount, 'USD');
                  const lucideIcon = lucideIconMap[tx.icon];

                  return (
                    <div
                      class={`flex items-center h-[80px] px-margin hover:bg-surface transition-colors cursor-pointer border-b-[3px] border-on-surface border-opacity-20 group ${
                        isCredit ? 'bg-primary-fixed-dim/20' : ''
                      }`}
                      key={`tx-${tx.id}`}
                    >
                      <div
                        class={`w-12 h-12 rounded-full border-[3px] border-on-surface flex items-center justify-center ${
                          isCredit
                            ? 'bg-primary-container text-on-primary-container group-hover:bg-primary'
                            : 'bg-surface-container-high group-hover:bg-surface-container-lowest'
                        } transition-colors flex-shrink-0`}
                      >
                        <Icon
                          icon={lucideIcon}
                          class={`w-5 h-5 ${isCredit ? '' : 'text-on-surface'}`}
                        />
                      </div>
                      <div class='ml-4 flex-1 flex flex-col justify-center'>
                        <p class='font-body-lg text-body-lg text-on-surface font-bold leading-tight'>
                          {tx.title}
                        </p>
                        <p class='font-num-data text-num-data text-on-surface-variant mt-1'>
                          {tx.date} • {tx.category}
                        </p>
                      </div>
                      <div class='text-right flex-shrink-0'>
                        <p
                          class={`font-num-xl text-[28px] leading-none tracking-tight font-semibold ${
                            isCredit ? 'text-on-surface' : 'text-secondary'
                          }`}
                        >
                          {amountStr}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ));
        })()}
      </div>

      {/* Bottom Paper Edge Details */}
      <div
        class='absolute bottom-0 left-0 w-full h-4 bg-repeat-x border-b-[3px] border-on-surface'
        style={{ backgroundImage: 'none' }}
      >
        {/* Fallback to straight thick border */}
      </div>
      <div class='w-full h-2 border-b-[3px] border-on-surface mt-auto'></div>
    </Card>
  </AuthenticatedLayout>
);
