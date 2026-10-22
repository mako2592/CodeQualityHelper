// Stryker disable all: stary kod wyłączony z testów mutacyjnych (w raporcie: Ignored).

export function formatPrice(value: number): string {
  return value.toFixed(2).replace('.', ',') + ' zł';
}

export function legacyTax(total: number): number {
  return total > 1000 ? total * 0.23 : total * 0.08;
}
