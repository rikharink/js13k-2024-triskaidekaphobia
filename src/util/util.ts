export function fixedIntegerDigits(i: number, digits: number, locale: string = 'en-US'): string {
  return i.toLocaleString(locale, { minimumIntegerDigits: digits, useGrouping: false });
}
