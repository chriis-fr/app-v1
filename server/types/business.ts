export interface BusinessModule {
  id: string;
  name: string;
  description: string;
  category: 'core' | 'optional';
  recommended: boolean;
}

export interface BusinessKPI {
  id: string;
  name: string;
  description: string;
  category: string;
  formula?: string;
  unit?: string;
}

export interface BusinessTypePreset {
  name: string;
  description: string;
  industry: string;
  size: 'micro' | 'small' | 'medium' | 'large';
  modules: BusinessModule[];
  defaultAccounts: Array<{
    code: string;
    name: string;
    type: string;
    category: string;
    isActive: boolean;
  }>;
  keyKPIs: BusinessKPI[];
  recommendedSettings: {
    inventory?: {
      tracking: boolean;
      valuation: 'FIFO' | 'LIFO' | 'AVG';
      reorderPoint: boolean;
    };
    accounting?: {
      method: 'cash' | 'accrual';
      reporting: 'monthly' | 'quarterly';
      reconciliation: 'auto' | 'manual';
    };
    payroll?: {
      frequency: 'monthly' | 'biweekly' | 'weekly';
      deductions: boolean;
      benefits: boolean;
    };
    crm?: {
      pipeline: boolean;
      automation: boolean;
      integration: boolean;
    };
  };
}

export interface BusinessTypeConfig {
  presets: Record<string, BusinessTypePreset>;
  getPreset: (type: string) => BusinessTypePreset;
  getRecommendedModules: (type: string) => BusinessModule[];
  getDefaultAccounts: (type: string) => Array<{
    code: string;
    name: string;
    type: string;
    category: string;
    isActive: boolean;
  }>;
  getKeyKPIs: (type: string) => BusinessKPI[];
} 