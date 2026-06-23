/** @jsxImportSource hono/jsx */

import { Select } from '../../../ui/components/Select.tsx';
import { DashboardFilterData, TransactionFilters } from '../dashboard.service.ts';

// Helper function to truncate text to a maximum length with a suffix of three dots '...' if it exceeds the limit
function truncateText(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  const truncateLen = Math.max(0, maxLen - 3);
  return str.slice(0, truncateLen) + '...';
}

export const DashboardFiltersSkeleton = ({ filters }: { filters?: TransactionFilters }) => {
  const params = new URLSearchParams();
  if (filters?.month) params.set('month', filters.month);
  if (filters?.category) params.set('category', filters.category);
  if (filters?.type) params.set('type', filters.type);
  const queryString = params.toString() ? `?${params.toString()}` : '';

  return (
    <div
      class='flex-1 flex gap-xs'
      id='dashboard-filters-container'
      hx-get={`/dashboard/filters${queryString}`}
      hx-trigger='load'
      hx-swap='outerHTML'
    >
      <Select disabled class='flex-1 w-0 min-w-0 truncate'>
        <option>{truncateText('Loading Months...', 20)}</option>
      </Select>
      <Select disabled class='flex-1 w-0 min-w-0 truncate'>
        <option>{truncateText('Loading Categories...', 20)}</option>
      </Select>
      <Select disabled class='flex-1 w-0 min-w-0 truncate'>
        <option>{truncateText('Loading Types...', 20)}</option>
      </Select>
    </div>
  );
};

export type DashboardFiltersProps = {
  filters: DashboardFilterData;
  selected?: TransactionFilters;
};

export const DashboardFilters = ({ filters, selected }: DashboardFiltersProps) => (
  <div class='flex-1 flex gap-xs' id='dashboard-filters-container'>
    <Select
      name='month'
      class='flex-1 w-0 min-w-0 truncate'
      hx-get='/dashboard'
      hx-target='body'
      hx-push-url='true'
      hx-include='#dashboard-filters-container select'
    >
      <option value=''>All Months</option>
      {filters.date.map((date) => (
        <option key={date} value={date} selected={selected?.month === date}>
          {date}
        </option>
      ))}
    </Select>
    <Select
      name='category'
      class='flex-1 w-0 min-w-0 truncate'
      hx-get='/dashboard'
      hx-target='body'
      hx-push-url='true'
      hx-include='#dashboard-filters-container select'
    >
      <option value=''>All Categories</option>
      {filters.categories.map((category) => (
        <option key={category} value={category} selected={selected?.category === category}>
          {category}
        </option>
      ))}
    </Select>
    <Select
      name='type'
      class='flex-1 w-0 min-w-0 truncate'
      hx-get='/dashboard'
      hx-target='body'
      hx-push-url='true'
      hx-include='#dashboard-filters-container select'
    >
      <option value=''>All Types</option>
      {filters.type.map((type) => (
        <option key={type} value={type} selected={selected?.type === type}>
          {type}
        </option>
      ))}
    </Select>
  </div>
);
