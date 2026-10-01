export function formatUGX(amount: number, short = false): string {
  if (short) {
    if (amount >= 1_000_000_000) {
      const billions = amount / 1_000_000_000;
      return `UGX ${billions % 1 === 0 ? billions : billions.toFixed(1)}B`;
    }
    if (amount >= 1_000_000) {
      const millions = amount / 1_000_000;
      return `UGX ${millions % 1 === 0 ? millions : millions.toFixed(1)}M`;
    }
    if (amount >= 1_000) {
      return `UGX ${(amount / 1_000).toFixed(0)}k`;
    }
  }

  return `UGX ${amount.toLocaleString('en-US')}`;
}

export function formatPriceDisplay(price: number, transaction: 'buy' | 'rent', pricePeriod?: 'month' | 'total'): string {
  const formatted = formatUGX(price);
  if (transaction === 'rent' || pricePeriod === 'month') {
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
