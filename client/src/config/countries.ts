import { CountryConfig } from '@/types/country';

export const COUNTRY_PRESETS: Record<string, CountryConfig> = {
  US: {
    name: 'United States',
    code: 'US',
    currency: 'USD',
    taxSystem: {
      type: 'SalesTax',
      rates: {
        federal: 0,
        state: {
          default: 0,
          // Add state-specific rates
        }
      },
      filingFrequency: 'quarterly',
      vatThreshold: 0
    },
    accounting: {
      standard: 'GAAP',
      fiscalYearStart: '01-01',
      reportingPeriods: ['monthly', 'quarterly', 'annual']
    },
    banking: {
      methods: ['ACH', 'Wire', 'Check'],
      defaultCurrency: 'USD',
      supportedCurrencies: ['USD']
    },
    reportingTemplates: [
      'Income Statement',
      'Balance Sheet',
      'Cash Flow Statement',
      '1099',
      'W-2',
      'Sales Tax Return'
    ],
    timezone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY',
    numberFormat: {
      decimal: '.',
      thousands: ',',
      precision: 2
    }
  },
  GB: {
    name: 'United Kingdom',
    code: 'GB',
    currency: 'GBP',
    taxSystem: {
      type: 'VAT',
      rates: {
        standard: 0.20,
        reduced: 0.05,
        zero: 0
      },
      filingFrequency: 'quarterly',
      vatThreshold: 85000
    },
    accounting: {
      standard: 'IFRS',
      fiscalYearStart: '04-01',
      reportingPeriods: ['monthly', 'quarterly', 'annual']
    },
    banking: {
      methods: ['BACS', 'Faster Payments', 'CHAPS'],
      defaultCurrency: 'GBP',
      supportedCurrencies: ['GBP', 'EUR', 'USD']
    },
    reportingTemplates: [
      'VAT Return',
      'Corporation Tax Return',
      'Annual Accounts',
      'P11D',
      'P60'
    ],
    timezone: 'Europe/London',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: {
      decimal: '.',
      thousands: ',',
      precision: 2
    }
  },
  KE: {
    name: 'Kenya',
    code: 'KE',
    currency: 'KES',
    taxSystem: {
      type: 'VAT',
      rates: {
        standard: 0.16,
        zero: 0
      },
      filingFrequency: 'monthly',
      vatThreshold: 5000000
    },
    accounting: {
      standard: 'IFRS',
      fiscalYearStart: '01-01',
      reportingPeriods: ['monthly', 'quarterly', 'annual']
    },
    banking: {
      methods: ['M-Pesa', 'Bank Transfer', 'Cheque'],
      defaultCurrency: 'KES',
      supportedCurrencies: ['KES', 'USD', 'EUR', 'GBP']
    },
    reportingTemplates: [
      'VAT Return',
      'Income Tax Return',
      'Annual Financial Statements',
      'PAYE Return'
    ],
    timezone: 'Africa/Nairobi',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: {
      decimal: '.',
      thousands: ',',
      precision: 2
    }
  },
  // Add more countries as needed
};

export const DEFAULT_COUNTRY = 'US';

export const getCountryConfig = (countryCode: string): CountryConfig => {
  return COUNTRY_PRESETS[countryCode] || COUNTRY_PRESETS[DEFAULT_COUNTRY];
};

export const getAvailableCountries = () => {
  return Object.values(COUNTRY_PRESETS).map(country => ({
    name: country.name,
    code: country.code,
    currency: country.currency
  }));
}; 