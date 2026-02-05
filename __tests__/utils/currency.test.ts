import {
  getCurrencyForCountry,
  formatCurrency,
  getCurrencySymbol,
  CurrencyCode,
  RegionCode,
} from '../../utils/currency';

describe('Currency Utils', () => {
  describe('getCurrencyForCountry', () => {
    it('should return correct currency for Angola', () => {
      expect(getCurrencyForCountry('AO')).toBe('AOA');
    });

    it('should return correct currency for South Africa', () => {
      expect(getCurrencyForCountry('ZA')).toBe('ZAR');
    });

    it('should return AOA as default for unknown region', () => {
      expect(getCurrencyForCountry('XX')).toBe('AOA');
    });

    it('should return AOA as default when region is undefined', () => {
      expect(getCurrencyForCountry(undefined)).toBe('AOA');
    });
  });

  describe('formatCurrency', () => {
    it('should format USD currency correctly', () => {
      const formatted = formatCurrency(100, 'USD', 'en');
      expect(formatted).toContain('100');
    });

    it('should return empty string for invalid amount', () => {
      expect(formatCurrency(undefined, 'USD')).toBe('');
      expect(formatCurrency(null, 'USD')).toBe('');
      expect(formatCurrency(NaN, 'USD')).toBe('');
    });

    it('should handle zero amount', () => {
      const formatted = formatCurrency(0, 'USD', 'en');
      expect(formatted).toBeDefined();
    });
  });

  describe('getCurrencySymbol', () => {
    it('should return correct symbol for Angola', () => {
      expect(getCurrencySymbol('AO')).toBe('Kz');
    });

    it('should return correct symbol for South Africa', () => {
      expect(getCurrencySymbol('ZA')).toBe('R');
    });
  });
});
