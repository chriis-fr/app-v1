import { z } from "zod";

// ---------------------------------
// Available modules enum
// ---------------------------------
export const availableModules = [
  "accounting",  // This will be the default module
  "procurement",
  "manufacturing",
  "inventory",
  "order_management",
  "warehouse",
  "supply_chain",
  "crm",
  "project_service",
  "workforce",
  "hr",
  "ecommerce",
  "marketing",
  "pos",
  "quality",
  "maintenance",
  "project",
  "analytics",
  "global_finance",
  "international_trade",
  "customer_experience",
  "vendor_management",
  "ai_analytics",
  "ecommerce_global",
  "localization",
  "digital_currency"
] as const;

// ---------------------------------
// Organization types
// ---------------------------------
export const organizationTypes = ["business", "ngo"] as const;
export type OrganizationType = typeof organizationTypes[number];

// ---------------------------------
// User roles with different access levels
// ---------------------------------
export const userRoles = [
  'owner',
  'admin',
  'manager',
  'employee',
  'contractor'
] as const;

// ---------------------------------
// Department types
// ---------------------------------
export const departments = [
  'Executive',
  'Engineering',
  'Sales',
  'Marketing',
  'Finance',
  'HR',
  'Operations',
  'IT',
  'Customer Support',
  'Product',
  'Design'
] as const;

// ---------------------------------
// Business Partner Types
// ---------------------------------
export const partnerTypes = [
  "vendor",
  "client",
  "supplier",
  "distributor",
  "contractor"
] as const;

// ---------------------------------
// Accounting specific types
// ---------------------------------
export const accountingTypes = {
  fiscalPeriods: ['monthly', 'quarterly', 'annually'] as const,
  currencies: ['USD', 'EUR', 'GBP', 'KES'] as const,
  taxTypes: ['VAT', 'GST', 'Sales Tax', 'Income Tax'] as const
} as const;

// ---------------------------------
// Zod Schemas
// ---------------------------------

// Define a schema for a User document for MongoDB.
export const userSchema = z.object({
  id: z.string(),
  username: z.string().min(3),
  password: z.string().min(6),
  role: z.enum(userRoles),
  department: z.enum(departments),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  phoneNumber: z.string().min(10),
  organizationId: z.string(),
  isOwner: z.boolean().default(false),
  moduleAccess: z.array(z.string()).default([]),
  position: z.string().optional(),
  status: z.enum(["active", "inactive"]).default("active"),
  lastLogin: z.date().optional(),
  employeeId: z.string().optional(),
  hireDate: z.string().optional(),
  managerId: z.string().optional(),
  team: z.string().optional(),
  location: z.object({
    office: z.string().optional(),
    floor: z.string().optional(),
    deskNumber: z.string().optional()
  }).optional(),
  workSchedule: z.object({
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    timezone: z.string().optional()
  }).optional(),
  emergencyContact: z.object({
    name: z.string().optional(),
    relationship: z.string().optional(),
    phone: z.string().optional()
  }).optional(),
  skills: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
  education: z.array(z.object({
    degree: z.string().optional(),
    institution: z.string().optional(),
    graduationYear: z.string().optional()
  })).optional(),
  performance: z.object({
    lastReviewDate: z.string().optional(),
    nextReviewDate: z.string().optional(),
    rating: z.number().optional()
  }).optional(),
  compensation: z.object({
    baseSalary: z.number().optional(),
    bonus: z.number().optional(),
    stockOptions: z.number().optional(),
    currency: z.string().optional()
  }).optional(),
  benefits: z.object({
    healthInsurance: z.boolean().optional(),
    dentalInsurance: z.boolean().optional(),
    visionInsurance: z.boolean().optional(),
    retirementPlan: z.boolean().optional(),
    lifeInsurance: z.boolean().optional()
  }).optional(),
  equipment: z.object({
    laptop: z.string().optional(),
    monitor: z.string().optional(),
    phone: z.string().optional(),
    accessories: z.array(z.string()).optional()
  }).optional(),
  accessLevels: z.object({
    systems: z.array(z.string()).optional(),
    buildings: z.array(z.string()).optional(),
    rooms: z.array(z.string()).optional()
  }).optional(),
  documents: z.array(z.object({
    id: z.string().optional(),
    type: z.string().optional(),
    url: z.string().optional(),
    expiryDate: z.string().optional()
  })).optional(),
  wallet: z.object({
    balance: z.number(),
    currency: z.string(),
    bankAccounts: z.array(z.object({
      id: z.string(),
      bankName: z.string(),
      accountNumber: z.string(),
      accountType: z.string(),
      isDefault: z.boolean()
    }))
  }).optional(),
  legalDetails: z.object({
    taxId: z.string(),
    businessType: z.string(),
    registrationNumber: z.string(),
    incorporationDate: z.string()
  }).optional(),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    country: z.string(),
    postalCode: z.string(),
    isBillingAddress: z.boolean(),
    isShippingAddress: z.boolean()
  }).optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date())
});

// Define a schema for an Organization document.
export const organizationSchema = z.object({
  id: z.string(),
  name: z.string().min(2),
  type: z.enum(organizationTypes),
  industry: z.string().min(2),
  size: z.string().optional(),
  walletAddress: z.string().optional(),
  activeModules: z.array(z.enum(availableModules)).default(["accounting"]), // Make finance default
  maxModules: z.number().default(3),
  address: z.string().optional(),
  country: z.string().optional(),
  taxId: z.string().optional(),
  website: z.string().url().optional(),
  accountingSettings: z.object({
    fiscalYearStart: z.string(),
    fiscalPeriod: z.enum(accountingTypes.fiscalPeriods),
    defaultCurrency: z.enum(accountingTypes.currencies),
    taxTypes: z.array(z.enum(accountingTypes.taxTypes)),
    chartOfAccounts: z.array(z.string()).default([])
  }).optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date())
});

// Define a schema for a Business Partner document
export const businessPartnerSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  website: z.string(),
  type: z.enum(partnerTypes),
  status: z.enum(["active", "inactive"]).default("active"),
  organizationId: z.string(),
  wallet: z.object({
    balance: z.number(),
    currency: z.string(),
    bankAccounts: z.array(z.object({
      id: z.string(),
      bankName: z.string(),
      accountNumber: z.string(),
      accountType: z.string(),
      isDefault: z.boolean()
    }))
  }).optional(),
  legalDetails: z.object({
    taxId: z.string(),
    businessType: z.string(),
    registrationNumber: z.string(),
    incorporationDate: z.string()
  }).optional(),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    country: z.string(),
    postalCode: z.string(),
    isBillingAddress: z.boolean(),
    isShippingAddress: z.boolean()
  }).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Registration schema for an organization + the first admin user
export const registerOrganizationSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  phoneNumber: z.string().min(10),
  type: z.enum(organizationTypes),
  name: z.string().min(2),
  industry: z.string().min(2),
  selectedModules: z.array(z.enum(availableModules)).max(2),
  country: z.string().optional(),
  address: z.string().optional(),
  website: z.string().url().optional(),
  accountingSettings: z.object({
    fiscalYearStart: z.string(),
    fiscalPeriod: z.enum(accountingTypes.fiscalPeriods),
    defaultCurrency: z.enum(accountingTypes.currencies),
    taxTypes: z.array(z.enum(accountingTypes.taxTypes)),
    chartOfAccounts: z.array(z.string()).default([])
  }).optional()
});

// User creation schema, based on the userSchema
export const insertUserSchema = userSchema.extend({
  organizationId: z.string().optional(),
  department: z.enum(departments).optional(),
});

// ---------------------------------
// Additional Interfaces
// ---------------------------------

export interface OrganizationSettings {
  theme: {
    primaryColor: string;
    secondaryColor: string;
    darkMode: boolean;
  };
  branding: {
    logo: string | null;
    favicon: string | null;
    companyName: string;
    tagline?: string;
    website?: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  modules: {
    enabled: string[];
    defaultModule?: string;
  };
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  security: {
    twoFactorAuth: boolean;
    sessionTimeout: number;
    passwordPolicy: {
      minLength: number;
      requireSpecialChars: boolean;
      requireNumbers: boolean;
    };
  };
  integrations: {
    paymentGateways: string[];
    emailService?: string;
    smsService?: string;
  };
  backup: {
    frequency: 'daily' | 'weekly' | 'monthly';
    retention: number;
    autoBackup: boolean;
  };
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
  action: "view" | "create" | "edit" | "delete" | "manage";
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[]; // Array of permission IDs
  isSystem: boolean;
}

// ---------------------------------
// Merged Organization type
// ---------------------------------
/**
 * Combines zod-inferred fields from organizationSchema
 * with any additional fields (like plan, roles, settings).
 * Also can override Date fields with string if needed.
 */
export type Organization = Omit<z.infer<typeof organizationSchema>, "createdAt" | "updatedAt"> & {
  // If you store createdAt/updatedAt as strings in your DB or JSON:
  createdAt: string;
  updatedAt: string;

  // If you need these extra fields that your code references:
  plan?: string;
  roles?: Role[];
  settings?: OrganizationSettings;
};

// ---------------------------------
// Merged "User" Type
// ---------------------------------
/**
 * We merge the fields from the zod userSchema
 * with extra fields we need (avatarUrl, organization, etc.).
 * We also override some fields to match the shape we want
 * (e.g., createdAt/updatedAt as strings, role as a string).
 */
export type User = Omit<z.infer<typeof userSchema>, "role" | "createdAt" | "updatedAt" | "lastLogin"> & {
  // We override role from z.enum(...) to a string or role ID
  role: string;

  // We override createdAt/updatedAt to strings (instead of Date)
  createdAt: string;
  updatedAt: string;

  // We override lastLogin to be a string (instead of Date)
  lastLogin?: string;

  // Additional fields from the old interface
  avatarUrl?: string | null;

  // Reference the merged Organization type
  organization?: Organization;

  // We also keep the "permissions" field we had before
  permissions: { module: string; actions: string[] }[];
  
  // Additional fields for user profile
  employeeId?: string;
  hireDate?: string;
  managerId?: string;
  team?: string;
  location?: {
    office?: string;
    floor?: string;
    deskNumber?: string;
  };
  workSchedule?: {
    startTime?: string;
    endTime?: string;
    timezone?: string;
  };
  emergencyContact?: {
    name?: string;
    relationship?: string;
    phone?: string;
  };
};

// ---------------------------------
// Merged "Business Partner" Type
// ---------------------------------
export type BusinessPartner = Omit<z.infer<typeof businessPartnerSchema>, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
  organization?: Organization;
};

// ---------------------------------
// Other Types
// ---------------------------------
export type InsertUser = z.infer<typeof insertUserSchema>;
export type RegisterOrganization = z.infer<typeof registerOrganizationSchema>;
export type AvailableModule = typeof availableModules[number];
export type UserRole = typeof userRoles[number];
export type Department = typeof departments[number];

export interface LoginData {
  username: string;
  password: string;
}

// Add these to your existing API endpoints
export interface UpdateOrganizationSettingsRequest {
  settings: Partial<OrganizationSettings>;
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  permissions?: string[];
}

export interface CreateRoleRequest {
  name: string;
  description: string;
  permissions: string[];
}

// ---------------------------------
// Organization Settings Schema
// ---------------------------------
export const organizationSettingsSchema = z.object({
  theme: z.object({
    primaryColor: z.string().default('#282881'),
    secondaryColor: z.string().default('#ffffff'),
    darkMode: z.boolean().default(false),
  }),
  branding: z.object({
    logo: z.string().nullable(),
    favicon: z.string().nullable(),
    companyName: z.string(),
    tagline: z.string().optional(),
    website: z.string().url().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
  }),
  modules: z.object({
    enabled: z.array(z.string()),
    defaultModule: z.string().optional(),
  }),
  notifications: z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(true),
    sms: z.boolean().default(false),
  }),
  security: z.object({
    twoFactorAuth: z.boolean().default(false),
    sessionTimeout: z.number().default(30), // minutes
    passwordPolicy: z.object({
      minLength: z.number().default(8),
      requireSpecialChars: z.boolean().default(true),
      requireNumbers: z.boolean().default(true),
    }),
  }),
  integrations: z.object({
    paymentGateways: z.array(z.string()).default([]),
    emailService: z.string().optional(),
    smsService: z.string().optional(),
  }),
  backup: z.object({
    frequency: z.enum(['daily', 'weekly', 'monthly']).default('daily'),
    retention: z.number().default(30), // days
    autoBackup: z.boolean().default(true),
  }),
});

export const modules = [
  {
    id: 'inventory',
    name: 'Inventory Management',
    description: 'Track and manage inventory levels, stock movements, and warehouse operations'
  },
  {
    id: 'procurement',
    name: 'Procurement',
    description: 'Manage purchase orders, supplier relationships, and procurement processes'
  },
  {
    id: 'sales',
    name: 'Sales Management',
    description: 'Handle sales orders, customer management, and sales analytics'
  },
  {
    id: 'manufacturing',
    name: 'Manufacturing',
    description: 'Production planning, work orders, and manufacturing operations'
  },
  {
    id: 'accounting',
    name: 'Accounting',
    description: 'Financial management, accounting, and financial reporting'
  },
  {
    id: 'crm',
    name: 'Customer Relationship Management',
    description: 'Customer data, interactions, and relationship management'
  },
  {
    id: 'hr',
    name: 'Human Resources',
    description: 'Employee management, payroll, and HR processes'
  },
  {
    id: 'supply_chain',
    name: 'Supply Chain',
    description: 'Supply chain planning, logistics, and distribution management'
  },
  {
    id: 'quality',
    name: 'Quality Management',
    description: 'Quality control, inspections, and compliance management'
  },
  {
    id: 'maintenance',
    name: 'Maintenance Management',
    description: 'Equipment maintenance, work orders, and asset management'
  },
  {
    id: 'project',
    name: 'Project Management',
    description: 'Project planning, tracking, and resource management'
  },
  {
    id: 'analytics',
    name: 'Business Analytics',
    description: 'Business intelligence, reporting, and data analytics'
  },
  {
    id: 'order_management',
    name: 'Order Management',
    description: 'Order processing, fulfillment, and tracking'
  },
  {
    id: 'warehouse',
    name: 'Warehouse Management',
    description: 'Warehouse operations, layout, and inventory placement'
  },
  {
    id: 'project_service',
    name: 'Project Service',
    description: 'Service project planning, execution, and delivery'
  },
  {
    id: 'workforce',
    name: 'Workforce Management',
    description: 'Staff scheduling, time tracking, and capacity planning'
  },
  {
    id: 'ecommerce',
    name: 'E-Commerce',
    description: 'Online store management, product listings, and order processing'
  },
  {
    id: 'marketing',
    name: 'Marketing',
    description: 'Campaign management, lead generation, and marketing analytics'
  },
  {
    id: 'pos',
    name: 'Point of Sale',
    description: 'Retail transactions, receipts, and in-store sales management'
  },
  {
    id: 'global_finance',
    name: 'Global Financial Management',
    description: 'Multi-currency handling, international tax compliance, and regional financial regulations'
  },
  {
    id: 'international_trade',
    name: 'International Trade & Compliance',
    description: 'Import/export regulations, tariffs, customs procedures, and trade compliance'
  },
  {
    id: 'customer_experience',
    name: 'Customer Experience Management',
    description: 'Customer feedback, sentiment analysis, and service quality tracking across regions'
  },
  {
    id: 'vendor_management',
    name: 'Supply Chain & Vendor Management',
    description: 'Global supplier networks, international logistics, and supply chain optimization'
  },
  {
    id: 'ai_analytics',
    name: 'AI and Analytics Integration',
    description: 'Predictive insights, AI-driven decision making, and advanced data analytics'
  },
  {
    id: 'ecommerce_global',
    name: 'Global E-commerce Integration',
    description: 'Integration with global marketplaces and localized payment gateways'
  },
  {
    id: 'localization',
    name: 'Localization & Multi-language Support',
    description: 'Multiple languages, currencies, and region-specific compliance'
  },
  {
    id: 'digital_currency',
    name: 'Digital Currency and Blockchain',
    description: 'Blockchain for secure transactions and digital currency payment options'
  }
] as const;
