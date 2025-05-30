import { CountryConfig } from '../types';

// Basic country configuration template
const createBasicCountryConfig = (
  name: string,
  currency: string,
  timezone: string,
  dateFormat: string,
  language: string
): CountryConfig => ({
  name,
  code: name.toUpperCase().replace(/\s+/g, ''),
  currency,
  timezone,
  dateFormat,
  language,
  accounting: {
    standard: 'IFRS',
    fiscalYearStart: '01/01',
    reportingPeriods: ['monthly', 'quarterly', 'annual']
  },
  banking: {
    methods: ['bank_transfer'],
    defaultCurrency: currency,
    supportedCurrencies: [currency]
  },
  reportingTemplates: [],
  numberFormat: {
    decimal: '.',
    thousands: ',',
    precision: 2
  },
  taxSystem: {
    type: 'VAT',
    rates: {
      vat: {
        standard: 0,
        reduced: 0,
        zero: 0
      },
      corporate: {
        standard: 0,
        smallBusiness: 0
      },
      income: {
        progressive: [
          { threshold: 0, rate: 0 }
        ]
      },
      socialSecurity: {
        employee: 0,
        employer: 0
      },
      payroll: {
        employee: 0,
        employer: 0
      },
      capitalGains: {
        shortTerm: 0,
        longTerm: 0
      },
      dividend: 0,
      import: {
        general: 0,
        preferential: {}
      },
      export: {
        general: 0
      },
      excise: {
        alcohol: 0,
        tobacco: 0,
        fuel: 0
      }
    },
    thresholds: {
      vatRegistration: 0,
      smallBusiness: 0,
      taxFreeAllowance: 0
    },
    reportingPeriods: ['monthly', 'quarterly', 'annually'],
    filingDeadlines: {
      corporate: [],
      vat: [],
      payroll: [],
      annual: []
    },
    filingFrequency: 'quarterly',
    vatThreshold: 0
  },
  defaultSettings: {
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    workingHours: {
      start: '09:00',
      end: '17:00'
    },
    holidays: [
      { name: 'New Year\'s Day', date: '01/01' }
    ],
    accounting: {
      fiscalYearStart: '01/01',
      fiscalYearEnd: '12/31',
      taxYearStart: '01/01',
      taxYearEnd: '12/31',
      currency,
      taxRates: {},
      reportingPeriods: ['monthly', 'quarterly', 'annually'],
      taxJurisdictions: [],
      compliance: {
        requiredReports: [],
        filingDeadlines: {},
        documentation: []
      },
      chartOfAccounts: [
        {
          code: '1000',
          name: 'Cash',
          type: 'Asset',
          category: 'Current Assets',
          isActive: true
        },
        {
          code: '2000',
          name: 'Accounts Payable',
          type: 'Liability',
          category: 'Current Liabilities',
          isActive: true
        }
      ]
    },
    payroll: {
      paymentFrequency: 'monthly',
      paymentDay: 25,
      overtimeRate: 1.5,
      bonusStructure: {
        annual: 0.1,
        performance: 0.05
      },
      deductions: []
    },
    benefits: {
      mandatory: [],
      optional: []
    }
  },
  businessEnvironment: {
    minimumWage: 0,
    workingHours: {
      standard: 40,
      overtime: 1.5,
      maximum: 48
    },
    leave: {
      annual: 0,
      sick: 0,
      maternity: 0,
      paternity: 0,
      parental: 0
    },
    noticePeriods: {
      minimum: 1,
      maximum: 3
    },
    severance: {
      calculation: '1 week per year of service',
      minimum: 2
    },
    benefits: {
      mandatory: [],
      common: []
    }
  },
  compliance: {
    requiredRegistrations: [],
    requiredLicenses: [],
    reportingRequirements: [],
    dataProtection: {
      type: 'Basic',
      requirements: []
    },
    antiCorruption: {
      laws: [],
      requirements: []
    }
  }
});

export const countryConfigs: Record<string, CountryConfig> = {
  US: {
    name: 'United States',
    code: 'US',
    currency: 'USD',
    timezone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY',
    language: 'en',
    accounting: {
      standard: 'GAAP',
      fiscalYearStart: '01/01',
      reportingPeriods: ['monthly', 'quarterly', 'annual']
    },
    banking: {
      methods: ['bank_transfer', 'ach', 'wire'],
      defaultCurrency: 'USD',
      supportedCurrencies: ['USD']
    },
    reportingTemplates: ['Form 1120', 'Form 941', 'Form 940'],
    numberFormat: {
      decimal: '.',
      thousands: ',',
      precision: 2
    },
    defaultSettings: {
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      workingHours: {
        start: '09:00',
        end: '17:00'
      },
      holidays: [
        { name: 'New Year\'s Day', date: '01/01' },
        { name: 'Martin Luther King Jr. Day', date: '01/15' },
        { name: 'Presidents\' Day', date: '02/19' },
        { name: 'Memorial Day', date: '05/27' },
        { name: 'Independence Day', date: '07/04' },
        { name: 'Labor Day', date: '09/02' },
        { name: 'Columbus Day', date: '10/14' },
        { name: 'Veterans Day', date: '11/11' },
        { name: 'Thanksgiving Day', date: '11/28' },
        { name: 'Christmas Day', date: '12/25' }
      ],
      accounting: {
        fiscalYearStart: '10/01',
        fiscalYearEnd: '09/30',
        taxYearStart: '01/01',
        taxYearEnd: '12/31',
        currency: 'USD',
        taxRates: {
          federal: 0.21,
          state: 0.05,
          local: 0.02
        },
        chartOfAccounts: [
          {
            code: '1000',
            name: 'Cash',
            type: 'Asset',
            category: 'Current Assets',
            isActive: true
          },
          {
            code: '2000',
            name: 'Accounts Payable',
            type: 'Liability',
            category: 'Current Liabilities',
            isActive: true
          }
        ],
        reportingPeriods: ['monthly', 'quarterly', 'annually'],
        taxJurisdictions: [
          {
            name: 'Federal',
            type: 'Federal',
            rates: { corporate: 0.21 },
            filingDeadlines: ['04/15', '06/15', '09/15', '12/15']
          },
          {
            name: 'State',
            type: 'State',
            rates: { corporate: 0.05 },
            filingDeadlines: ['04/15', '06/15', '09/15', '12/15']
          }
        ],
        compliance: {
          requiredReports: ['Form 1120', 'Form 941', 'Form 940'],
          filingDeadlines: {
            'Form 1120': ['04/15'],
            'Form 941': ['04/30', '07/31', '10/31', '01/31'],
            'Form 940': ['01/31']
          },
          documentation: ['Income Statements', 'Balance Sheets', 'Tax Returns']
        }
      },
      payroll: {
        paymentFrequency: 'biweekly',
        paymentDay: 15,
        overtimeRate: 1.5,
        bonusStructure: {
          annual: 0.1,
          performance: 0.05
        },
        deductions: [
          {
            type: 'Federal Income Tax',
            rate: 0.22,
            threshold: 50000
          },
          {
            type: 'Social Security',
            rate: 0.062
          },
          {
            type: 'Medicare',
            rate: 0.0145
          }
        ]
      },
      benefits: {
        mandatory: [
          {
            type: 'Social Security',
            provider: 'Federal Government',
            coverage: 'Retirement, Disability, Survivor Benefits',
            cost: {
              employee: 0.062,
              employer: 0.062
            }
          },
          {
            type: 'Medicare',
            provider: 'Federal Government',
            coverage: 'Health Insurance for 65+',
            cost: {
              employee: 0.0145,
              employer: 0.0145
            }
          }
        ],
        optional: [
          {
            type: 'Health Insurance',
            provider: 'Private',
            coverage: 'Medical, Dental, Vision',
            cost: {
              employee: 0.2,
              employer: 0.8
            }
          },
          {
            type: '401(k)',
            provider: 'Private',
            coverage: 'Retirement Savings',
            cost: {
              employee: 0.06,
              employer: 0.03
            }
          }
        ]
      }
    },
    taxSystem: {
      type: 'Federal-State-Local',
      rates: {
        corporate: {
          standard: 0.21,
          smallBusiness: 0.15
        },
        vat: {
          standard: 0.0,
          reduced: 0.0,
          zero: 0.0
        },
        income: {
          progressive: [
            { threshold: 0, rate: 0.10 },
            { threshold: 11000, rate: 0.12 },
            { threshold: 44725, rate: 0.22 },
            { threshold: 95375, rate: 0.24 },
            { threshold: 182100, rate: 0.32 },
            { threshold: 231250, rate: 0.35 },
            { threshold: 578125, rate: 0.37 }
          ]
        },
        socialSecurity: {
          employee: 0.062,
          employer: 0.062
        },
        payroll: {
          employee: 0.0765,
          employer: 0.0765
        },
        capitalGains: {
          shortTerm: 0.37,
          longTerm: 0.20
        },
        dividend: 0.20,
        import: {
          general: 0.02,
          preferential: {
            'NAFTA': 0.0,
            'GSP': 0.0
          }
        },
        export: {
          general: 0.0
        },
        excise: {
          alcohol: 0.13,
          tobacco: 0.50,
          fuel: 0.184
        }
      },
      thresholds: {
        vatRegistration: 0,
        smallBusiness: 500000,
        taxFreeAllowance: 12950
      },
      reportingPeriods: ['monthly', 'quarterly', 'annually'],
      filingDeadlines: {
        corporate: ['04/15', '06/15', '09/15', '12/15'],
        vat: ['04/30', '07/31', '10/31', '01/31'],
        payroll: ['04/30', '07/31', '10/31', '01/31'],
        annual: ['04/15']
      },
      filingFrequency: 'quarterly',
      vatThreshold: 0
    },
    businessEnvironment: {
      minimumWage: 7.25,
      workingHours: {
        standard: 40,
        overtime: 1.5,
        maximum: 60
      },
      leave: {
        annual: 10,
        sick: 0,
        maternity: 0,
        paternity: 0,
        parental: 0
      },
      noticePeriods: {
        minimum: 2,
        maximum: 4
      },
      severance: {
        calculation: '1 week per year of service',
        minimum: 2
      },
      benefits: {
        mandatory: ['Social Security', 'Medicare', 'Unemployment Insurance'],
        common: ['Health Insurance', '401(k)', 'Paid Time Off']
      }
    },
    compliance: {
      requiredRegistrations: [
        'EIN',
        'State Business License',
        'Sales Tax Permit',
        'Employer Identification'
      ],
      requiredLicenses: [
        'Business License',
        'Professional License',
        'Industry-specific Permits'
      ],
      reportingRequirements: [
        'Annual Reports',
        'Tax Returns',
        'Payroll Reports',
        'Sales Tax Reports'
      ],
      dataProtection: {
        type: 'State-specific',
        requirements: [
          'CCPA',
          'GDPR (if applicable)',
          'Data Breach Notification',
          'Privacy Policy'
        ]
      },
      antiCorruption: {
        laws: ['FCPA', 'State Anti-corruption Laws'],
        requirements: [
          'Anti-corruption Policy',
          'Employee Training',
          'Due Diligence Procedures'
        ]
      }
    }
  },
  UK: {
    name: 'United Kingdom',
    code: 'UK',
    currency: 'GBP',
    timezone: 'Europe/London',
    dateFormat: 'DD/MM/YYYY',
    language: 'en',
    accounting: {
      standard: 'IFRS',
      fiscalYearStart: '04/01',
      reportingPeriods: ['monthly', 'quarterly', 'annual']
    },
    banking: {
      methods: ['bank_transfer', 'faster_payments', 'bacs'],
      defaultCurrency: 'GBP',
      supportedCurrencies: ['GBP', 'EUR', 'USD']
    },
    reportingTemplates: ['CT600', 'VAT Return', 'P35'],
    numberFormat: {
      decimal: '.',
      thousands: ',',
      precision: 2
    },
    defaultSettings: {
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      workingHours: {
        start: '09:00',
        end: '17:00'
      },
      holidays: [
        { name: 'New Year\'s Day', date: '01/01' },
        { name: 'Good Friday', date: '04/07' },
        { name: 'Easter Monday', date: '04/10' },
        { name: 'Early May Bank Holiday', date: '05/01' },
        { name: 'Spring Bank Holiday', date: '05/29' },
        { name: 'Summer Bank Holiday', date: '08/28' },
        { name: 'Christmas Day', date: '12/25' },
        { name: 'Boxing Day', date: '12/26' }
      ],
      accounting: {
        fiscalYearStart: '04/01',
        fiscalYearEnd: '03/31',
        taxYearStart: '04/06',
        taxYearEnd: '04/05',
        currency: 'GBP',
        taxRates: {
          corporation: 0.19,
          vat: 0.20,
          nationalInsurance: 0.12
        },
        chartOfAccounts: [
          {
            code: '1000',
            name: 'Cash',
            type: 'Asset',
            category: 'Current Assets',
            isActive: true
          },
          {
            code: '2000',
            name: 'Accounts Payable',
            type: 'Liability',
            category: 'Current Liabilities',
            isActive: true
          }
        ],
        reportingPeriods: ['monthly', 'quarterly', 'annually'],
        taxJurisdictions: [
          {
            name: 'HMRC',
            type: 'National',
            rates: { corporation: 0.19 },
            filingDeadlines: ['01/31', '07/31']
          }
        ],
        compliance: {
          requiredReports: ['CT600', 'VAT Return', 'P35'],
          filingDeadlines: {
            'CT600': ['01/31'],
            'VAT Return': ['04/30', '07/31', '10/31', '01/31'],
            'P35': ['05/19']
          },
          documentation: ['Financial Statements', 'Tax Returns', 'VAT Records']
        }
      },
      payroll: {
        paymentFrequency: 'monthly',
        paymentDay: 25,
        overtimeRate: 1.25,
        bonusStructure: {
          annual: 0.1,
          performance: 0.05
        },
        deductions: [
          {
            type: 'Income Tax',
            rate: 0.20,
            threshold: 12570
          },
          {
            type: 'National Insurance',
            rate: 0.12,
            threshold: 12570
          },
          {
            type: 'Student Loan',
            rate: 0.09,
            threshold: 27295
          }
        ]
      },
      benefits: {
        mandatory: [
          {
            type: 'National Insurance',
            provider: 'HMRC',
            coverage: 'State Pension, Healthcare, Benefits',
            cost: {
              employee: 0.12,
              employer: 0.138
            }
          }
        ],
        optional: [
          {
            type: 'Private Healthcare',
            provider: 'Private',
            coverage: 'Medical, Dental, Vision',
            cost: {
              employee: 0.1,
              employer: 0.9
            }
          },
          {
            type: 'Pension',
            provider: 'Private',
            coverage: 'Retirement Savings',
            cost: {
              employee: 0.05,
              employer: 0.03
            }
          }
        ]
      }
    },
    taxSystem: {
      type: 'Unitary',
      rates: {
        corporate: {
          standard: 0.19,
          smallBusiness: 0.15
        },
        vat: {
          standard: 0.20,
          reduced: 0.05,
          zero: 0.0
        },
        income: {
          progressive: [
            { threshold: 0, rate: 0.20 },
            { threshold: 12570, rate: 0.40 },
            { threshold: 50270, rate: 0.45 }
          ]
        },
        socialSecurity: {
          employee: 0.12,
          employer: 0.138
        },
        payroll: {
          employee: 0.12,
          employer: 0.138
        },
        capitalGains: {
          shortTerm: 0.20,
          longTerm: 0.10
        },
        dividend: 0.20,
        import: {
          general: 0.0,
          preferential: {
            'EU': 0.0
          }
        },
        export: {
          general: 0.0
        },
        excise: {
          alcohol: 0.20,
          tobacco: 0.30,
          fuel: 0.20
        }
      },
      thresholds: {
        vatRegistration: 85000,
        smallBusiness: 500000,
        taxFreeAllowance: 12570
      },
      reportingPeriods: ['monthly', 'quarterly', 'annually'],
      filingDeadlines: {
        corporate: ['01/31', '07/31'],
        vat: ['04/30', '07/31', '10/31', '01/31'],
        payroll: ['05/19'],
        annual: ['01/31']
      },
      filingFrequency: 'quarterly',
      vatThreshold: 85000
    },
    businessEnvironment: {
      minimumWage: 10.42,
      workingHours: {
        standard: 37.5,
        overtime: 1.25,
        maximum: 48
      },
      leave: {
        annual: 28,
        sick: 28,
        maternity: 52,
        paternity: 2,
        parental: 52
      },
      noticePeriods: {
        minimum: 1,
        maximum: 3
      },
      severance: {
        calculation: '1 week per year of service',
        minimum: 2
      },
      benefits: {
        mandatory: ['National Insurance', 'Statutory Sick Pay', 'Statutory Maternity Pay'],
        common: ['Private Healthcare', 'Pension', 'Life Insurance']
      }
    },
    compliance: {
      requiredRegistrations: [
        'Companies House',
        'HMRC',
        'VAT Registration',
        'PAYE Registration'
      ],
      requiredLicenses: [
        'Business License',
        'Industry-specific Permits',
        'Trading Standards'
      ],
      reportingRequirements: [
        'Annual Accounts',
        'Tax Returns',
        'VAT Returns',
        'Payroll Reports'
      ],
      dataProtection: {
        type: 'GDPR',
        requirements: [
          'Data Protection Policy',
          'Privacy Notice',
          'Data Processing Agreements',
          'Data Breach Procedures'
        ]
      },
      antiCorruption: {
        laws: ['Bribery Act 2010', 'Criminal Finances Act 2017'],
        requirements: [
          'Anti-bribery Policy',
          'Employee Training',
          'Due Diligence Procedures'
        ]
      }
    }
  },
  DE: {
    name: 'Germany',
    code: 'DE',
    currency: 'EUR',
    timezone: 'Europe/Berlin',
    dateFormat: 'DD.MM.YYYY',
    language: 'de',
    accounting: {
      standard: 'IFRS',
      fiscalYearStart: '01/01',
      reportingPeriods: ['monthly', 'quarterly', 'annual']
    },
    banking: {
      methods: ['bank_transfer', 'sepa'],
      defaultCurrency: 'EUR',
      supportedCurrencies: ['EUR']
    },
    reportingTemplates: ['Einkommensteuererklärung', 'Umsatzsteuervoranmeldung', 'Lohnsteueranmeldung'],
    numberFormat: {
      decimal: ',',
      thousands: '.',
      precision: 2
    },
    defaultSettings: {
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      workingHours: {
        start: '09:00',
        end: '17:00'
      },
      holidays: [
        { name: 'Neujahr', date: '01/01' },
        { name: 'Karfreitag', date: '04/07' },
        { name: 'Ostermontag', date: '04/10' },
        { name: 'Tag der Arbeit', date: '05/01' },
        { name: 'Christi Himmelfahrt', date: '05/18' },
        { name: 'Pfingstmontag', date: '05/29' },
        { name: 'Tag der Deutschen Einheit', date: '10/03' },
        { name: 'Erster Weihnachtstag', date: '12/25' },
        { name: 'Zweiter Weihnachtstag', date: '12/26' }
      ],
      accounting: {
        fiscalYearStart: '01/01',
        fiscalYearEnd: '12/31',
        taxYearStart: '01/01',
        taxYearEnd: '12/31',
        currency: 'EUR',
        taxRates: {
          corporation: 0.15,
          vat: 0.19,
          solidarity: 0.055
        },
        chartOfAccounts: [
          {
            code: '1000',
            name: 'Bargeld',
            type: 'Asset',
            category: 'Current Assets',
            isActive: true
          },
          {
            code: '2000',
            name: 'Verbindlichkeiten',
            type: 'Liability',
            category: 'Current Liabilities',
            isActive: true
          }
        ],
        reportingPeriods: ['monthly', 'quarterly', 'annually'],
        taxJurisdictions: [
          {
            name: 'Finanzamt',
            type: 'National',
            rates: { corporation: 0.15 },
            filingDeadlines: ['05/31', '11/30']
          }
        ],
        compliance: {
          requiredReports: ['Einkommensteuererklärung', 'Umsatzsteuervoranmeldung', 'Lohnsteueranmeldung'],
          filingDeadlines: {
            'Einkommensteuererklärung': ['05/31'],
            'Umsatzsteuervoranmeldung': ['04/10', '07/10', '10/10', '01/10'],
            'Lohnsteueranmeldung': ['05/10']
          },
          documentation: ['Jahresabschluss', 'Steuererklärungen', 'Umsatzsteueraufzeichnungen']
        }
      },
      payroll: {
        paymentFrequency: 'monthly',
        paymentDay: 25,
        overtimeRate: 1.25,
        bonusStructure: {
          annual: 0.1,
          performance: 0.05
        },
        deductions: [
          {
            type: 'Income Tax',
            rate: 0.14,
            threshold: 10908
          },
          {
            type: 'Social Security',
            rate: 0.093,
            threshold: 87600
          },
          {
            type: 'Health Insurance',
            rate: 0.073,
            threshold: 56250
          }
        ]
      },
      benefits: {
        mandatory: [
          {
            type: 'Social Security',
            provider: 'Deutsche Rentenversicherung',
            coverage: 'Pension, Disability, Survivor Benefits',
            cost: {
              employee: 0.093,
              employer: 0.093
            }
          },
          {
            type: 'Health Insurance',
            provider: 'Public/Private',
            coverage: 'Medical, Dental, Vision',
            cost: {
              employee: 0.073,
              employer: 0.073
            }
          }
        ],
        optional: [
          {
            type: 'Private Health Insurance',
            provider: 'Private',
            coverage: 'Enhanced Medical Coverage',
            cost: {
              employee: 0.1,
              employer: 0.9
            }
          },
          {
            type: 'Company Pension',
            provider: 'Private',
            coverage: 'Retirement Savings',
            cost: {
              employee: 0.04,
              employer: 0.02
            }
          }
        ]
      }
    },
    taxSystem: {
      type: 'Federal',
      rates: {
        corporate: {
          standard: 0.15,
          smallBusiness: 0.15
        },
        vat: {
          standard: 0.19,
          reduced: 0.07,
          zero: 0.0
        },
        income: {
          progressive: [
            { threshold: 0, rate: 0.14 },
            { threshold: 10908, rate: 0.14 },
            { threshold: 15999, rate: 0.24 },
            { threshold: 62809, rate: 0.42 },
            { threshold: 277825, rate: 0.45 }
          ]
        },
        socialSecurity: {
          employee: 0.093,
          employer: 0.093
        },
        payroll: {
          employee: 0.093,
          employer: 0.093
        },
        capitalGains: {
          shortTerm: 0.25,
          longTerm: 0.25
        },
        dividend: 0.25,
        import: {
          general: 0.0,
          preferential: {
            'EU': 0.0,
            'EFTA': 0.0
          }
        },
        export: {
          general: 0.0
        },
        excise: {
          alcohol: 0.13,
          tobacco: 0.30,
          fuel: 0.6547
        }
      },
      thresholds: {
        vatRegistration: 22000,
        smallBusiness: 17500,
        taxFreeAllowance: 10908
      },
      reportingPeriods: ['monthly', 'quarterly', 'annually'],
      filingDeadlines: {
        corporate: ['05/31', '11/30'],
        vat: ['04/10', '07/10', '10/10', '01/10'],
        payroll: ['05/10'],
        annual: ['05/31']
      },
      filingFrequency: 'quarterly',
      vatThreshold: 22000
    },
    businessEnvironment: {
      minimumWage: 12.00,
      workingHours: {
        standard: 40,
        overtime: 1.25,
        maximum: 48
      },
      leave: {
        annual: 20,
        sick: 6,
        maternity: 14,
        paternity: 2,
        parental: 14
      },
      noticePeriods: {
        minimum: 1,
        maximum: 7
      },
      severance: {
        calculation: '0.5 month per year of service',
        minimum: 3
      },
      benefits: {
        mandatory: ['Social Security', 'Health Insurance', 'Unemployment Insurance'],
        common: ['Private Health Insurance', 'Company Pension', 'Life Insurance']
      }
    },
    compliance: {
      requiredRegistrations: [
        'Handelsregister',
        'Finanzamt',
        'Umsatzsteuer-ID',
        'Gewerbeanmeldung'
      ],
      requiredLicenses: [
        'Gewerbeschein',
        'Industry-specific Permits',
        'Trading Standards'
      ],
      reportingRequirements: [
        'Jahresabschluss',
        'Steuererklärungen',
        'Umsatzsteuervoranmeldungen',
        'Lohnsteueranmeldungen'
      ],
      dataProtection: {
        type: 'GDPR',
        requirements: [
          'Datenschutzerklärung',
          'Datenschutzbeauftragter',
          'Verarbeitungsverzeichnis',
          'Datenschutz-Folgenabschätzung'
        ]
      },
      antiCorruption: {
        laws: ['Korruptionsstrafrecht', 'Geldwäschegesetz'],
        requirements: [
          'Compliance-Richtlinien',
          'Mitarbeiterschulung',
          'Due-Diligence-Verfahren'
        ]
      }
    }
  },
  // Add basic configurations for all other countries
  EG: createBasicCountryConfig('Egypt', 'EGP', 'Africa/Cairo', 'DD/MM/YYYY', 'ar'),
  AE: createBasicCountryConfig('United Arab Emirates', 'AED', 'Asia/Dubai', 'DD/MM/YYYY', 'ar'),
  SA: createBasicCountryConfig('Saudi Arabia', 'SAR', 'Asia/Riyadh', 'DD/MM/YYYY', 'ar'),
  IN: createBasicCountryConfig('India', 'INR', 'Asia/Kolkata', 'DD/MM/YYYY', 'hi'),
  CN: createBasicCountryConfig('China', 'CNY', 'Asia/Shanghai', 'YYYY-MM-DD', 'zh'),
  JP: createBasicCountryConfig('Japan', 'JPY', 'Asia/Tokyo', 'YYYY/MM/DD', 'ja'),
  KR: createBasicCountryConfig('South Korea', 'KRW', 'Asia/Seoul', 'YYYY-MM-DD', 'ko'),
  SG: createBasicCountryConfig('Singapore', 'SGD', 'Asia/Singapore', 'DD/MM/YYYY', 'en'),
  AU: createBasicCountryConfig('Australia', 'AUD', 'Australia/Sydney', 'DD/MM/YYYY', 'en'),
  NZ: createBasicCountryConfig('New Zealand', 'NZD', 'Pacific/Auckland', 'DD/MM/YYYY', 'en'),
  CA: createBasicCountryConfig('Canada', 'CAD', 'America/Toronto', 'YYYY-MM-DD', 'en'),
  MX: createBasicCountryConfig('Mexico', 'MXN', 'America/Mexico_City', 'DD/MM/YYYY', 'es'),
  BR: createBasicCountryConfig('Brazil', 'BRL', 'America/Sao_Paulo', 'DD/MM/YYYY', 'pt'),
  AR: createBasicCountryConfig('Argentina', 'ARS', 'America/Argentina/Buenos_Aires', 'DD/MM/YYYY', 'es'),
  ZA: createBasicCountryConfig('South Africa', 'ZAR', 'Africa/Johannesburg', 'YYYY-MM-DD', 'en'),
  NG: createBasicCountryConfig('Nigeria', 'NGN', 'Africa/Lagos', 'DD/MM/YYYY', 'en'),
  KE: {
    name: 'Kenya',
    code: 'KE',
    currency: 'KES',
    timezone: 'Africa/Nairobi',
    dateFormat: 'DD/MM/YYYY',
    language: 'en',
    accounting: {
      standard: 'IFRS',
      fiscalYearStart: '01/01',
      reportingPeriods: ['monthly', 'quarterly', 'annual']
    },
    banking: {
      methods: ['bank_transfer', 'mpesa'],
      defaultCurrency: 'KES',
      supportedCurrencies: ['KES', 'USD']
    },
    reportingTemplates: ['IT2C', 'VAT Return', 'PAYE Return'],
    numberFormat: {
      decimal: '.',
      thousands: ',',
      precision: 2
    },
    defaultSettings: {
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      workingHours: {
        start: '09:00',
        end: '17:00'
      },
      holidays: [
        { name: 'New Year\'s Day', date: '01/01' },
        { name: 'Good Friday', date: '04/07' },
        { name: 'Easter Monday', date: '04/10' },
        { name: 'Labour Day', date: '05/01' },
        { name: 'Madaraka Day', date: '06/01' },
        { name: 'Huduma Day', date: '10/10' },
        { name: 'Mashujaa Day', date: '10/20' },
        { name: 'Jamhuri Day', date: '12/12' },
        { name: 'Christmas Day', date: '12/25' },
        { name: 'Boxing Day', date: '12/26' }
      ],
      accounting: {
        fiscalYearStart: '01/01',
        fiscalYearEnd: '12/31',
        taxYearStart: '01/01',
        taxYearEnd: '12/31',
        currency: 'KES',
        taxRates: {
          corporation: 0.30,
          vat: 0.16,
          nhif: 0.0175
        },
        chartOfAccounts: [
          {
            code: '1000',
            name: 'Cash',
            type: 'Asset',
            category: 'Current Assets',
            isActive: true
          },
          {
            code: '2000',
            name: 'Accounts Payable',
            type: 'Liability',
            category: 'Current Liabilities',
            isActive: true
          }
        ],
        reportingPeriods: ['monthly', 'quarterly', 'annually'],
        taxJurisdictions: [
          {
            name: 'KRA',
            type: 'National',
            rates: { corporation: 0.30 },
            filingDeadlines: ['04/30', '07/31', '10/31', '01/31']
          }
        ],
        compliance: {
          requiredReports: ['IT2C', 'VAT Return', 'PAYE Return'],
          filingDeadlines: {
            'IT2C': ['04/30'],
            'VAT Return': ['04/20', '07/20', '10/20', '01/20'],
            'PAYE Return': ['05/09']
          },
          documentation: ['Financial Statements', 'Tax Returns', 'VAT Records']
        }
      },
      payroll: {
        paymentFrequency: 'monthly',
        paymentDay: 25,
        overtimeRate: 1.5,
        bonusStructure: {
          annual: 0.1,
          performance: 0.05
        },
        deductions: [
          {
            type: 'PAYE',
            rate: 0.30,
            threshold: 38892
          },
          {
            type: 'NHIF',
            rate: 0.0175
          },
          {
            type: 'NSSF',
            rate: 0.06
          }
        ]
      },
      benefits: {
        mandatory: [
          {
            type: 'NHIF',
            provider: 'National Hospital Insurance Fund',
            coverage: 'Health Insurance',
            cost: {
              employee: 0.0175,
              employer: 0.0175
            }
          },
          {
            type: 'NSSF',
            provider: 'National Social Security Fund',
            coverage: 'Pension',
            cost: {
              employee: 0.06,
              employer: 0.06
            }
          }
        ],
        optional: [
          {
            type: 'Private Health Insurance',
            provider: 'Private',
            coverage: 'Enhanced Medical Coverage',
            cost: {
              employee: 0.1,
              employer: 0.9
            }
          },
          {
            type: 'Company Pension',
            provider: 'Private',
            coverage: 'Retirement Savings',
            cost: {
              employee: 0.04,
              employer: 0.02
            }
          }
        ]
      }
    },
    taxSystem: {
      type: 'Federal',
      rates: {
        corporate: {
          standard: 0.30,
          smallBusiness: 0.25
        },
        vat: {
          standard: 0.16,
          reduced: 0.0,
          zero: 0.0
        },
        income: {
          progressive: [
            { threshold: 0, rate: 0.10 },
            { threshold: 24000, rate: 0.25 },
            { threshold: 32333, rate: 0.30 },
            { threshold: 500000, rate: 0.325 },
            { threshold: 800000, rate: 0.35 }
          ]
        },
        socialSecurity: {
          employee: 0.06,
          employer: 0.06
        },
        payroll: {
          employee: 0.30,
          employer: 0.0
        },
        capitalGains: {
          shortTerm: 0.30,
          longTerm: 0.30
        },
        dividend: 0.05,
        import: {
          general: 0.0,
          preferential: {
            'EAC': 0.0
          }
        },
        export: {
          general: 0.0
        },
        excise: {
          alcohol: 0.20,
          tobacco: 0.30,
          fuel: 0.20
        }
      },
      thresholds: {
        vatRegistration: 5000000,
        smallBusiness: 50000000,
        taxFreeAllowance: 24000
      },
      reportingPeriods: ['monthly', 'quarterly', 'annually'],
      filingDeadlines: {
        corporate: ['04/30', '07/31', '10/31', '01/31'],
        vat: ['04/20', '07/20', '10/20', '01/20'],
        payroll: ['05/09'],
        annual: ['04/30']
      },
      filingFrequency: 'monthly',
      vatThreshold: 5000000
    },
    businessEnvironment: {
      minimumWage: 15000,
      workingHours: {
        standard: 40,
        overtime: 1.5,
        maximum: 48
      },
      leave: {
        annual: 21,
        sick: 14,
        maternity: 90,
        paternity: 14,
        parental: 90
      },
      noticePeriods: {
        minimum: 1,
        maximum: 3
      },
      severance: {
        calculation: '1 month per year of service',
        minimum: 2
      },
      benefits: {
        mandatory: ['NHIF', 'NSSF', 'Work Injury Benefits'],
        common: ['Private Health Insurance', 'Company Pension', 'Life Insurance']
      }
    },
    compliance: {
      requiredRegistrations: [
        'KRA PIN',
        'Business Registration',
        'VAT Registration',
        'NHIF Registration',
        'NSSF Registration'
      ],
      requiredLicenses: [
        'Business License',
        'Industry-specific Permits',
        'Trading License'
      ],
      reportingRequirements: [
        'Annual Returns',
        'Tax Returns',
        'VAT Returns',
        'PAYE Returns'
      ],
      dataProtection: {
        type: 'Data Protection Act 2019',
        requirements: [
          'Data Protection Policy',
          'Privacy Notice',
          'Data Processing Agreements',
          'Data Breach Procedures'
        ]
      },
      antiCorruption: {
        laws: ['Anti-Corruption and Economic Crimes Act'],
        requirements: [
          'Anti-corruption Policy',
          'Employee Training',
          'Due Diligence Procedures'
        ]
      }
    }
  },
  FR: createBasicCountryConfig('France', 'EUR', 'Europe/Paris', 'DD/MM/YYYY', 'fr'),
  IT: createBasicCountryConfig('Italy', 'EUR', 'Europe/Rome', 'DD/MM/YYYY', 'it'),
  ES: createBasicCountryConfig('Spain', 'EUR', 'Europe/Madrid', 'DD/MM/YYYY', 'es'),
  PT: createBasicCountryConfig('Portugal', 'EUR', 'Europe/Lisbon', 'DD/MM/YYYY', 'pt'),
  NL: createBasicCountryConfig('Netherlands', 'EUR', 'Europe/Amsterdam', 'DD-MM-YYYY', 'nl'),
  BE: createBasicCountryConfig('Belgium', 'EUR', 'Europe/Brussels', 'DD/MM/YYYY', 'nl'),
  SE: createBasicCountryConfig('Sweden', 'SEK', 'Europe/Stockholm', 'YYYY-MM-DD', 'sv'),
  NO: createBasicCountryConfig('Norway', 'NOK', 'Europe/Oslo', 'DD.MM.YYYY', 'no'),
  DK: createBasicCountryConfig('Denmark', 'DKK', 'Europe/Copenhagen', 'DD-MM-YYYY', 'da'),
  FI: createBasicCountryConfig('Finland', 'EUR', 'Europe/Helsinki', 'DD.MM.YYYY', 'fi'),
  PL: createBasicCountryConfig('Poland', 'PLN', 'Europe/Warsaw', 'DD.MM.YYYY', 'pl'),
  CZ: createBasicCountryConfig('Czech Republic', 'CZK', 'Europe/Prague', 'DD.MM.YYYY', 'cs'),
  AT: createBasicCountryConfig('Austria', 'EUR', 'Europe/Vienna', 'DD.MM.YYYY', 'de'),
  CH: createBasicCountryConfig('Switzerland', 'CHF', 'Europe/Zurich', 'DD.MM.YYYY', 'de'),
  RU: createBasicCountryConfig('Russia', 'RUB', 'Europe/Moscow', 'DD.MM.YYYY', 'ru'),
  TR: createBasicCountryConfig('Turkey', 'TRY', 'Europe/Istanbul', 'DD.MM.YYYY', 'tr'),
  IL: createBasicCountryConfig('Israel', 'ILS', 'Asia/Jerusalem', 'DD/MM/YYYY', 'he'),
  // Add more countries as needed...
};

export const getCountryConfig = (countryCode: string): CountryConfig => {
  const config = countryConfigs[countryCode.toUpperCase()];
  if (!config) {
    throw new Error(`Configuration not found for country code: ${countryCode}`);
  }
  return config;
}; 