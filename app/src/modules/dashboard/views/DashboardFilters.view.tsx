/** @jsxImportSource hono/jsx */

import { Select } from '../../../ui/components/Select.tsx';
import { DashboardFilterData } from '../dashboard.service.ts';

// Helper function to truncate text to a maximum length with a suffix of three dots '...' if it exceeds the limit
function truncateText(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  const truncateLen = Math.max(0, maxLen - 3);
  return str.slice(0, truncateLen) + '...';
}

export const DashboardFiltersSkeleton = () => (
  <div
    class='flex-1 flex gap-xs'
    id='dashboard-filters-container'
    hx-get='/dashboard/filters'
    hx-trigger='load'
    hx-swap='outerHTML'
  >
    <Select disabled class='flex-1 w-0 min-w-0 truncate'>
      <option>{truncateText('Loading Months...', 20)}</option>
    </Select>
    <Select disabled class='flex-1 w-0 min-w-0 truncate'>
      <option>{truncateText('Loading Categories...', 20)}</option>
    </Select>
  </div>
);

export type DashboardFiltersProps = {
  filters: DashboardFilterData;
};

export const DashboardFilters = ({ filters }: DashboardFiltersProps) => (
  <div class='flex-1 flex gap-xs' id='dashboard-filters-container'>
    <Select class='flex-1 w-0 min-w-0 truncate'>
      <option value=''>All Months</option>
      {filters.date.map((date) => (
        <option key={date} value={date}>
          {date}
        </option>
      ))}
    </Select>
    <Select class='flex-1 w-0 min-w-0 truncate'>
      <option value=''>All Categories</option>
      {filters.categories.map((category) => (
        <option key={category} value={category}>
          {category}
        </option>
      ))}
    </Select>
  </div>
);
