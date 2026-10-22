export interface Discount {
  code: string;
  percent: number;
  minTotal: number;
}

const CODE_PATTERN = /^[A-Z0-9]{4,12}$/;

export function isValidCode(code: string): boolean {
  return CODE_PATTERN.test(code.trim().toUpperCase());
}

export function applyDiscount(total: number, discount?: Discount): number {
  if (!discount) {
    return total;
  }
  if (total < discount.minTotal) {
    return total;
  }

  const percent = Math.min(Math.max(discount.percent, 0), 100);
  const discounted = total * (1 - percent / 100);
  return Math.round(discounted * 100) / 100;
}

export function bestDiscount(total: number, discounts: Discount[]): Discount | undefined {
  let best: Discount | undefined;
  for (const discount of discounts) {
    if (applyDiscount(total, discount) < applyDiscount(total, best)) {
      best = discount;
    }
  }
  return best;
}
