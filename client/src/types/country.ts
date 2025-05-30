export interface TaxSystem {
  type: 'VAT' | 'SalesTax' | 'GST';
  rates: {
    standard?: number;
    reduced?: number;
    zero?: number;
    federal?: number;
    state?: {
      default: number;
      [key: string]: number;
    };
  };
  filingFrequency: 'monthly' | 'quarterly' | 'annual';
  vatThreshold: number;
}

export interface AccountingConfig {
  standard: 'IFRS' | 'GAAP' | 'Other';
  fiscalYearStart: string; // MM-DD format
  reportingPeriods: ('monthly' | 'quarterly' | 'annual')[];
}

export interface BankingConfig {
  methods: string[];
  defaultCurrency: string;
  supportedCurrencies: string[];
}

export interface NumberFormat {
  decimal: string;
  thousands: string;
  precision: number;
}

export interface CountryConfig {
  name: string;
  code: string;
  currency: string;
  taxSystem: TaxSystem;
  accounting: AccountingConfig;
  banking: BankingConfig;
  reportingTemplates: string[];
  timezone: string;
  dateFormat: string;
  numberFormat: NumberFormat;
}

export interface CountryOption {
  name: string;
  code: string;
  currency: string;
} 