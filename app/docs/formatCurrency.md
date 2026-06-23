# `formatCurrency` Function

The `formatCurrency` function is a utility designed to convert a currency value represented in its smallest subunit (e.g., cents) into a formatted, human-readable currency string.

## How It Works

The function takes an amount in subunits (either as a `bigint` or `number`), determines the correct number of decimal places for the specified currency, and then converts the subunits into the standard monetary unit. Finally, it formats the result according to the specified locale and currency.

### Function Signature

```typescript
export function formatCurrency(
  subunitAmount: bigint | number,
  currency: string = 'USD',
  locale: string = 'en-US',
): string;
```

### Parameters

- **`subunitAmount`**: (`bigint | number`) The amount of money in its smallest subunit. For USD, this would be cents. For example, `$10.50` would be passed as `1050n`.
- **`currency`**: (`string`) The ISO 4217 currency code (e.g., `'USD'`, `'EUR'`, `'JPY'`). Defaults to `'USD'`.
- **`locale`**: (`string`) The BCP 47 language tag to use for formatting (e.g., `'en-US'`, `'de-DE'`). Defaults to `'en-US'`.

## Calculation Formula

To accurately format the amount, the function uses the following formula to convert from subunits to the standard unit:

1. **Determine Decimals (`D`)**: The number of decimal places depends on the currency. The function uses a mapping (e.g., JPY has 0 decimals, BHD has 3, and the default is 2).
2. **Calculate Divisor**:
   $$ \text{Divisor} = 10^D $$
3. **Calculate Standard Value**:
   $$ \text{Standard Value} = \frac{\text{Subunit Amount}}{\text{Divisor}} $$

For `bigint` values, this conversion avoids floating-point inaccuracies by separating the integer and fractional parts:

- **Integer Part**: `|Subunit Amount| / Divisor`
- **Fractional Part**: `|Subunit Amount| % Divisor` (padded with leading zeros to `D` places)
- **Sign**: Preserved if the original subunit amount is negative.

The combined decimal number is then formatted using JavaScript's native `Intl.NumberFormat` API with `style: 'currency'`.

## Examples

### 1. Default Usage (USD)

Formatting $12.34 (1234 cents).

```typescript
formatCurrency(1234n);
// Output: "$12.34"
```

### 2. Zero-Decimal Currency (JPY)

The Japanese Yen (JPY) does not use subunits. 1000 JPY is passed directly as 1000.

```typescript
formatCurrency(1000n, 'JPY', 'ja-JP');
// Output: "￥1,000"
```

### 3. Three-Decimal Currency (BHD)

The Bahraini Dinar (BHD) has 3 decimal places. Formatting 1.500 BHD (1500 subunits).

```typescript
formatCurrency(1500n, 'BHD', 'ar-BH');
// Output: "د.ب.‏ ١٫٥٠٠" (or standard BHD formatting based on the environment)
```

### 4. Negative Amounts

Formatting a negative balance (-$5.00).

```typescript
formatCurrency(-500n, 'USD', 'en-US');
// Output: "-$5.00"
```
