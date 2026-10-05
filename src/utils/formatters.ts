import { CurrencyCode, PricePeriod, TransactionType } from '../types/property';

export function formatCurrency(
  amount: number,
  currency: CurrencyCode = 'UGX',
  short = false
): string {
  const safeAmount = Number.isFinite(amount) ? amount : 0;

  if (currency === 'USD') {
    if (short) {
      if (safeAmount >= 1_000_000) {
        const millions = safeAmount / 1_000_000;
        return `USD ${millions % 1 === 0 ? millions : millions.toFixed(2)}M`;
      }
      if (safeAmount >= 1_000) {
        const thousands = safeAmount / 1_000;
        return `USD ${thousands % 1 === 0 ? thousands : thousands.toFixed(1)}k`;
      }
    }
    return `USD ${safeAmount.toLocaleString('en-US')}`;
  }

  if (short) {
    if (safeAmount >= 1_000_000_000) {
      const billions = safeAmount / 1_000_000_000;
      return `UGX ${billions % 1 === 0 ? billions : billions.toFixed(1)}B`;
    }
    if (safeAmount >= 1_000_000) {
      const millions = safeAmount / 1_000_000;
      return `UGX ${millions % 1 === 0 ? millions : millions.toFixed(0)}M`;
    }
    if (safeAmount >= 1_000) {
      return `UGX ${(safeAmount / 1_000).toFixed(0)}k`;
    }
  }

  return `UGX ${safeAmount.toLocaleString('en-US')}`;
}

export function formatUGX(amount: number, short = false): string {
  return formatCurrency(amount, 'UGX', short);
}

export function formatPriceDisplay(
  price: number,
  transaction: TransactionType,
  period?: PricePeriod,
  currency: CurrencyCode = 'UGX'
): string {
  const formatted = formatCurrency(price, currency, true);
  if (period === 'year') {
    return `${formatted} / yr`;
  }
  if (period === 'month' || (transaction === 'rent' && period !== 'total')) {
    return `${formatted} / mo`;
  }
  return formatted;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Validates whether a string is a valid ISO YYYY-MM-DD date or parseable ISO timestamp.
 */
export function isValidIsoDateString(value: string): boolean {
  if (!value || typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}(T.*)?$/.test(trimmed)) return false;
  const parsed = new Date(trimmed);
  return !Number.isNaN(parsed.getTime());
}
