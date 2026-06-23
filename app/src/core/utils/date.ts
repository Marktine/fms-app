const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const FULL_MONTH_NAMES = [
  'JANUARY',
  'FEBRUARY',
  'MARCH',
  'APRIL',
  'MAY',
  'JUNE',
  'JULY',
  'AUGUST',
  'SEPTEMBER',
  'OCTOBER',
  'NOVEMBER',
  'DECEMBER',
];

/**
 * Formats a date string or Date object into UI representations (uiDate and uiMonth).
 * Uses UTC to prevent off-by-one errors with YYYY-MM-DD date strings.
 */
export function formatTransactionDate(
  dateInput: string | Date,
): { uiDate: string; uiMonth: string } {
  const d = new Date(dateInput);
  const monthIndex = d.getUTCMonth();
  const uiDate = `${MONTH_NAMES[monthIndex]} ${d.getUTCDate()}`;
  const uiMonth = `${FULL_MONTH_NAMES[monthIndex]} ${d.getUTCFullYear()}`;
  return { uiDate, uiMonth };
}
