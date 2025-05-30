import { BusinessTypeConfig, BusinessTypePreset } from '../types/business';

const businessTypePresets: Record<string, BusinessTypePreset> = {
  tech_sme: {
    name: 'Technology SME',
    description: 'Small to medium-sized technology companies, software development, IT services',
    industry: 'Technology',
    size: 'small',
    modules: [
      {
        id: 'accounting',
        name: 'Accounting',
        description: 'Financial management and reporting',
        category: 'core',
        recommended: true
      },
      {
        id: 'crm',
        name: 'Customer Relationship Management',
        description: 'Manage customer interactions and sales pipeline',
        category: 'core',
        recommended: true
      },
      {
        id: 'hr',
        name: 'Human Resources',
        description: 'Employee management and payroll',
        category: 'core',
        recommended: true
      },
      {
        id: 'project',
        name: 'Project Management',
        description: 'Track projects, tasks, and resources',
        category: 'core',
        recommended: true
      },
      {
        id: 'inventory',
        name: 'Inventory Management',
        description: 'Track hardware and software licenses',
        category: 'optional',
        recommended: false
      }
    ],
    defaultAccounts: [
      {
        code: '4000',
        name: 'Software Development Revenue',
        type: 'Income',
        category: 'Operating Revenue',
        isActive: true
      },
      {
        code: '4100',
        name: 'Consulting Revenue',
        type: 'Income',
        category: 'Operating Revenue',
        isActive: true
      },
      {
        code: '5000',
        name: 'Hosting Expenses',
        type: 'Expense',
        category: 'Operating Expenses',
        isActive: true
      },
      {
        code: '5100',
        name: 'Software Licenses',
        type: 'Expense',
        category: 'Operating Expenses',
        isActive: true
      },
      {
        code: '5200',
        name: 'Freelancer Expenses',
        type: 'Expense',
        category: 'Operating Expenses',
        isActive: true
      }
    ],
    keyKPIs: [
      {
        id: 'mrr',
        name: 'Monthly Recurring Revenue',
        description: 'Total predictable revenue generated each month',
        category: 'Financial',
        formula: 'Sum of all recurring revenue',
        unit: 'currency'
      },
      {
        id: 'churn',
        name: 'Customer Churn Rate',
        description: 'Rate at which customers stop using the service',
        category: 'Customer',
        formula: 'Lost customers / Total customers',
        unit: 'percentage'
      },
      {
        id: 'burn_rate',
        name: 'Burn Rate',
        description: 'Rate at which company spends cash',
        category: 'Financial',
        formula: 'Monthly expenses - Monthly revenue',
        unit: 'currency'
      }
    ],
    recommendedSettings: {
      accounting: {
        method: 'accrual',
        reporting: 'monthly',
        reconciliation: 'auto'
      },
      payroll: {
        frequency: 'monthly',
        deductions: true,
        benefits: true
      },
      crm: {
        pipeline: true,
        automation: true,
        integration: true
      }
    }
  },
  agri_sme: {
    name: 'Agricultural SME',
    description: 'Small to medium-sized agricultural businesses, farms, and agribusinesses',
    industry: 'Agriculture',
    size: 'small',
    modules: [
      {
        id: 'inventory',
        name: 'Inventory Management',
        description: 'Track crops, livestock, and supplies',
        category: 'core',
        recommended: true
      },
      {
        id: 'supply_chain',
        name: 'Supply Chain',
        description: 'Manage suppliers and logistics',
        category: 'core',
        recommended: true
      },
      {
        id: 'accounting',
        name: 'Accounting',
        description: 'Financial management and reporting',
        category: 'core',
        recommended: true
      },
      {
        id: 'quality',
        name: 'Quality Control',
        description: 'Track product quality and certifications',
        category: 'optional',
        recommended: true
      },
      {
        id: 'maintenance',
        name: 'Equipment Maintenance',
        description: 'Track farm equipment and maintenance',
        category: 'optional',
        recommended: true
      }
    ],
    defaultAccounts: [
      {
        code: '4000',
        name: 'Crop Sales',
        type: 'Income',
        category: 'Operating Revenue',
        isActive: true
      },
      {
        code: '4100',
        name: 'Livestock Sales',
        type: 'Income',
        category: 'Operating Revenue',
        isActive: true
      },
      {
        code: '5000',
        name: 'Fertilizer Expenses',
        type: 'Expense',
        category: 'Operating Expenses',
        isActive: true
      },
      {
        code: '5100',
        name: 'Farm Equipment',
        type: 'Expense',
        category: 'Operating Expenses',
        isActive: true
      },
      {
        code: '5200',
        name: 'Labor Expenses',
        type: 'Expense',
        category: 'Operating Expenses',
        isActive: true
      }
    ],
    keyKPIs: [
      {
        id: 'yield',
        name: 'Harvest Yield',
        description: 'Total crop production per unit area',
        category: 'Production',
        formula: 'Total harvest / Area planted',
        unit: 'tons/hectare'
      },
      {
        id: 'margin',
        name: 'Operating Margin',
        description: 'Profitability of operations',
        category: 'Financial',
        formula: '(Revenue - Operating Expenses) / Revenue',
        unit: 'percentage'
      },
      {
        id: 'input_cost',
        name: 'Input Cost Percentage',
        description: 'Cost of inputs relative to revenue',
        category: 'Financial',
        formula: 'Input costs / Revenue',
        unit: 'percentage'
      }
    ],
    recommendedSettings: {
      inventory: {
        tracking: true,
        valuation: 'FIFO',
        reorderPoint: true
      },
      accounting: {
        method: 'accrual',
        reporting: 'monthly',
        reconciliation: 'manual'
      }
    }
  },
  retail_sme: {
    name: 'Retail SME',
    description: 'Small to medium-sized retail businesses, shops, and stores',
    industry: 'Retail',
    size: 'small',
    modules: [
      {
        id: 'pos',
        name: 'Point of Sale',
        description: 'Process sales and manage inventory',
        category: 'core',
        recommended: true
      },
      {
        id: 'inventory',
        name: 'Inventory Management',
        description: 'Track stock levels and reordering',
        category: 'core',
        recommended: true
      },
      {
        id: 'accounting',
        name: 'Accounting',
        description: 'Financial management and reporting',
        category: 'core',
        recommended: true
      },
      {
        id: 'crm',
        name: 'Customer Relationship Management',
        description: 'Manage customer data and loyalty',
        category: 'optional',
        recommended: true
      },
      {
        id: 'hr',
        name: 'Human Resources',
        description: 'Employee management and payroll',
        category: 'optional',
        recommended: true
      }
    ],
    defaultAccounts: [
      {
        code: '4000',
        name: 'Retail Sales',
        type: 'Income',
        category: 'Operating Revenue',
        isActive: true
      },
      {
        code: '4100',
        name: 'Service Revenue',
        type: 'Income',
        category: 'Operating Revenue',
        isActive: true
      },
      {
        code: '5000',
        name: 'Cost of Goods Sold',
        type: 'Expense',
        category: 'Operating Expenses',
        isActive: true
      },
      {
        code: '5100',
        name: 'Rent Expense',
        type: 'Expense',
        category: 'Operating Expenses',
        isActive: true
      },
      {
        code: '5200',
        name: 'Utilities',
        type: 'Expense',
        category: 'Operating Expenses',
        isActive: true
      }
    ],
    keyKPIs: [
      {
        id: 'gross_margin',
        name: 'Gross Margin',
        description: 'Profit after cost of goods sold',
        category: 'Financial',
        formula: '(Revenue - COGS) / Revenue',
        unit: 'percentage'
      },
      {
        id: 'inventory_turnover',
        name: 'Inventory Turnover',
        description: 'How quickly inventory is sold',
        category: 'Operations',
        formula: 'COGS / Average Inventory',
        unit: 'times'
      },
      {
        id: 'sales_per_sqft',
        name: 'Sales per Square Foot',
        description: 'Revenue generated per square foot of retail space',
        category: 'Operations',
        formula: 'Total Sales / Square Footage',
        unit: 'currency'
      }
    ],
    recommendedSettings: {
      inventory: {
        tracking: true,
        valuation: 'FIFO',
        reorderPoint: true
      },
      accounting: {
        method: 'accrual',
        reporting: 'monthly',
        reconciliation: 'auto'
      },
      payroll: {
        frequency: 'biweekly',
        deductions: true,
        benefits: true
      }
    }
  }
};

export const businessTypeConfig: BusinessTypeConfig = {
  presets: businessTypePresets,
  getPreset: (type: string) => {
    const preset = businessTypePresets[type];
    if (!preset) {
      throw new Error(`Business type preset not found: ${type}`);
    }
    return preset;
  },
  getRecommendedModules: (type: string) => {
    const preset = businessTypeConfig.getPreset(type);
    return preset.modules.filter(module => module.recommended);
  },
  getDefaultAccounts: (type: string) => {
    const preset = businessTypeConfig.getPreset(type);
    return preset.defaultAccounts;
  },
  getKeyKPIs: (type: string) => {
    const preset = businessTypeConfig.getPreset(type);
    return preset.keyKPIs;
  }
}; 