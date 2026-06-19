export function formatCurrency(
  subunitAmount: bigint | number,
  currency: string = 'USD',
  locale: string = 'en-US',
): string {
  const decimalPlacesMap: Record<string, number> = {
    JPY: 0,
    BHD: 3,
  };
  const decimals = decimalPlacesMap[currency] ?? 2;
  const divisor = 10 ** decimals;

  let floatVal: number;
  if (typeof subunitAmount === 'bigint') {
    const isNegative = subunitAmount < 0n;
    const absSubunitAmount = isNegative ? -subunitAmount : subunitAmount;

    const divisorBig = BigInt(divisor);
    const integerPart = absSubunitAmount / divisorBig;
    const fractionalPart = absSubunitAmount % divisorBig;
    const formattedFraction = fractionalPart.toString().padStart(decimals, '0');

    floatVal = Number(`${isNegative ? '-' : ''}${integerPart}.${formattedFraction}`);
  } else {
    floatVal = subunitAmount;
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(floatVal);
}
