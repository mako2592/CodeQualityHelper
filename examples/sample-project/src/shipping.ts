// Moduł celowo bez testów: jego mutanty mają w raporcie status NoCoverage.

export type Country = 'PL' | 'DE' | 'US';

const BASE_COST: Record<Country, number> = { PL: 12, DE: 25, US: 60 };
const FREE_SHIPPING_FROM = 200;

export function shippingCost(total: number, country: Country, express = false): number {
  if (country === 'PL' && total >= FREE_SHIPPING_FROM) {
    return 0;
  }
  const base = BASE_COST[country];
  return express ? base * 2 : base;
}

export function estimatedDays(country: Country, express = false): number {
  const days = country === 'PL' ? 2 : country === 'DE' ? 4 : 10;
  return express ? Math.ceil(days / 2) : days;
}
