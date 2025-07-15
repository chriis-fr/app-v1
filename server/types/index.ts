// This file is intentionally empty as we're using Express.User type
// and extending Express.Request directly in express.d.ts 

import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: Express.User;
} 

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    organizationId: string;
    role: string;
    email: string;
    isOwner: boolean;
    moduleAccess: string[];
    permissions: {
      module: string;
      actions: string[];
    }[];
    modulePermissions: {
      module: string;
      permissions: string[];
    }[];
  };
}

export interface TaxSystem {
  type: 'VAT' | 'GST' | 'SalesTax' | 'Federal-State-Local' | 'Unitary' | 'Federal';
  rates: {
    standard?: number;
    reduced?: number;
    zero?: number;
    federal?: number;
    vat?: number | {
      standard: number;
      reduced: number;
      zero: number;
    };
    corporate?: {
      standard: number;
      smallBusiness: number;
    };
    state?: {
      default: number;
      [key: string]: number;
    };
    income?: {
      progressive: Array<{
        threshold: number;
        rate: number;
      }>;
    };
    socialSecurity?: {
      employee: number;
      employer: number;
    };
    payroll?: {
      employee: number;
      employer: number;
    };
    capitalGains?: {
      shortTerm: number;
      longTerm: number;
    };
    dividend?: number;
    import?: {
      general: number;
      preferential: Record<string, number>;
    };
    export?: {
      general: number;
    };
    excise?: {
      alcohol: number;
      tobacco: number;
      fuel: number;
    };
  };
  thresholds?: {
    vatRegistration: number;
    smallBusiness: number;
    taxFreeAllowance: number;
  };
  reportingPeriods?: string[];
  filingDeadlines?: {
    corporate: string[];
    vat: string[];
    payroll: string[];
    annual: string[];
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
  language: string;
  defaultSettings: {
    workingDays: string[];
    workingHours: {
      start: string;
      end: string;
    };
    holidays: Array<{
      name: string;
      date: string;
    }>;
    accounting: {
      fiscalYearStart: string;
      fiscalYearEnd: string;
      taxYearStart: string;
      taxYearEnd: string;
      reportingPeriods: string[];
      currency: string;
      taxRates: Record<string, number>;
      taxJurisdictions: Array<{
        name: string;
        type: string;
        rates: Record<string, number>;
        filingDeadlines: string[];
      }>;
      compliance: {
        requiredReports: string[];
        filingDeadlines: Record<string, string[]>;
        documentation: string[];
      };
      chartOfAccounts: Array<{
        code: string;
        name: string;
        type: string;
        category: string;
        isActive: boolean;
      }>;
    };
    payroll?: {
      paymentFrequency: 'weekly' | 'biweekly' | 'monthly';
      paymentDay: number;
      overtimeRate: number;
      bonusStructure?: Record<string, number>;
      deductions: Array<{
        type: string;
        rate: number;
        threshold?: number;
      }>;
    };
    benefits?: {
      mandatory: Array<{
        type: string;
        provider: string;
        coverage: string;
        cost: {
          employee: number;
          employer: number;
        };
      }>;
      optional: Array<{
        type: string;
        provider: string;
        coverage: string;
        cost: {
          employee: number;
          employer: number;
        };
      }>;
    };
  };
  businessEnvironment?: {
    minimumWage: number;
    workingHours: {
      standard: number;
      overtime: number;
      maximum: number;
    };
    leave: {
      annual: number;
      sick: number;
      maternity: number;
      paternity: number;
      parental: number;
    };
    noticePeriods: {
      minimum: number;
      maximum: number;
    };
    severance: {
      calculation: string;
      minimum: number;
    };
    benefits: {
      mandatory: string[];
      common: string[];
    };
  };
  compliance?: {
    requiredRegistrations: string[];
    requiredLicenses: string[];
    reportingRequirements: string[];
    dataProtection: {
      type: string;
      requirements: string[];
    };
    antiCorruption: {
      laws: string[];
      requirements: string[];
    };
  };
}

export interface OrganizationSettings {
  workingDays: string[];
  workingHours: {
    start: string;
    end: string;
  };
  holidays: Array<{
    name: string;
    date: string;
  }>;
  customSettings?: Record<string, any>;
  accounting?: {
    fiscalYearStart: string;
    fiscalYearEnd: string;
    taxYearStart: string;
    taxYearEnd: string;
    currency: string;
    taxRates: Record<string, number>;
    chartOfAccounts?: Array<{
      code: string;
      name: string;
      type: string;
      category: string;
      isActive: boolean;
    }>;
    reportingPeriods: string[];
    taxJurisdictions: Array<{
      name: string;
      type: string;
      rates: Record<string, number>;
      filingDeadlines: string[];
    }>;
    compliance: {
      requiredReports: string[];
      filingDeadlines: Record<string, string[]>;
      documentation: string[];
    };
  };
  payroll?: {
    paymentFrequency: 'weekly' | 'biweekly' | 'monthly';
    paymentDay: number;
    overtimeRate: number;
    bonusStructure?: Record<string, number>;
    deductions: Array<{
      type: string;
      rate: number;
      threshold?: number;
    }>;
  };
  benefits?: {
    mandatory: Array<{
      type: string;
      provider: string;
      coverage: string;
      cost: {
        employee: number;
        employer: number;
      };
    }>;
    optional: Array<{
      type: string;
      provider: string;
      coverage: string;
      cost: {
        employee: number;
        employer: number;
      };
    }>;
  };
} 