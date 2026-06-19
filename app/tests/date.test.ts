import { assertEquals } from 'jsr:@std/assert@^1.0.8';
import { formatTransactionDate } from '../src/core/utils/date.ts';

Deno.test('formatTransactionDate - should format YYYY-MM-DD string correctly in UTC', () => {
  const result = formatTransactionDate('2026-06-11');
  assertEquals(result.uiDate, 'Jun 11');
  assertEquals(result.uiMonth, 'JUNE 2026');
});

Deno.test('formatTransactionDate - should handle Date objects correctly in UTC', () => {
  const dateObj = new Date(Date.UTC(2026, 11, 25)); // Dec 25, 2026
  const result = formatTransactionDate(dateObj);
  assertEquals(result.uiDate, 'Dec 25');
  assertEquals(result.uiMonth, 'DECEMBER 2026');
});

Deno.test('formatTransactionDate - should handle single-digit day and month correctly', () => {
  const result = formatTransactionDate('2026-01-05'); // Jan 5, 2026
  assertEquals(result.uiDate, 'Jan 5');
  assertEquals(result.uiMonth, 'JANUARY 2026');
});
