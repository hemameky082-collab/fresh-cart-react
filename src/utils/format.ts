const SYMBOLS: Record<string, string> = { USD: '$', EGP: 'EGP', EUR: '€', GBP: '£' };

// Replacement for Angular's currency pipe, e.g. fc(10, 'EGP', '1.0-2') -> "E£10"
export function fc(value: number | string | null | undefined, code = 'USD', digits = '1.2-2'): string {
  if (value === null || value === undefined || value === '') return '';
  const [min, max] = (digits.split('.')[1] ?? '2-2').split('-').map(Number);
  const formatted = Number(value).toLocaleString('en-US', { minimumFractionDigits: min, maximumFractionDigits: max });
  return `${SYMBOLS[code] ?? code}${formatted}`;
}

// Replacement for Angular's date pipe with the 'MMM d, y' format
export function fd(value: string | number | Date | null | undefined): string {
  if (!value) return '';
  const date = new Date(value);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
