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
export const industries = [
  "retail", "healthcare", "finance", "manufacturing", "education", "technology", "logistics", "agriculture", "energy", "hospitality", "real_estate", "media", "transportation", "construction", "government", "nonprofit", "professional_services", "food_beverage", "telecommunications", "automotive", "pharmaceuticals"
] as const;
export type Industry = typeof industries[number];

export const organizationTypes = [
  "sme", "startup", "corporate", "enterprise", "ngo", "government", "business"
] as const;
export type OrganizationType = typeof organizationTypes[number];

// ---------------------------------
// User roles with different access levels
// ---------------------------------
export const userRoles = [
  'owner',
  'admin',
  'manager',
  'employee',
  'contractor',
  'vendor_admin',
  'vendor_manager',
  'vendor_employee'
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
// Department Positions (organized by department)
// ---------------------------------
export const departmentPositions = {
  'Executive': [
    'CEO',
    'CTO',
    'CFO',
    'COO',
    'VP of Operations',
    'VP of Technology',
    'VP of Sales',
    'VP of Marketing'
  ],
  'Engineering': [
    'Engineering Manager',
    'Senior Software Engineer',
    'Software Engineer',
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'DevOps Engineer',
    'QA Engineer',
    'Technical Lead',
    'Architect'
  ],
  'Sales': [
    'Sales Manager',
    'Sales Director',
    'Account Executive',
    'Sales Representative',
    'Sales Development Representative',
    'Customer Success Manager',
    'Sales Operations Manager'
  ],
  'Marketing': [
    'Marketing Manager',
    'Marketing Director',
    'Digital Marketing Specialist',
    'Content Marketing Manager',
    'SEO Specialist',
    'Social Media Manager',
    'Brand Manager',
    'Marketing Analyst'
  ],
  'Finance': [
    'Finance Manager',
    'Financial Controller',
    'Accountant',
    'Financial Analyst',
    'Accounts Payable Specialist',
    'Accounts Receivable Specialist',
    'Payroll Specialist'
  ],
  'HR': [
    'HR Manager',
    'HR Director',
    'HR Generalist',
    'Recruiter',
    'Talent Acquisition Specialist',
    'Compensation Analyst',
    'Benefits Administrator',
    'Training Coordinator'
  ],
  'Operations': [
    'Operations Manager',
    'Operations Director',
    'Process Manager',
    'Supply Chain Manager',
    'Logistics Coordinator',
    'Facilities Manager',
    'Project Manager'
  ],
  'IT': [
    'IT Manager',
    'IT Director',
    'System Administrator',
    'Network Engineer',
    'IT Support Specialist',
    'Security Analyst',
    'Database Administrator',
    'IT Project Manager'
  ],
  'Customer Support': [
    'Support Manager',
    'Customer Success Manager',
    'Support Specialist',
    'Technical Support Engineer',
    'Customer Experience Manager',
    'Support Team Lead'
  ],
  'Product': [
    'Product Manager',
    'Product Director',
    'Product Owner',
    'Product Analyst',
    'Product Marketing Manager',
    'Product Operations Manager'
  ],
  'Design': [
    'Design Manager',
    'Creative Director',
    'UI/UX Designer',
    'Graphic Designer',
    'Product Designer',
    'Visual Designer',
    'Design Systems Manager'
  ]
} as const;

// ---------------------------------
// Office Location Types
// ---------------------------------
export const officeLocations = [
  'onsite',
  'remote'
] as const;

// ---------------------------------
// Timezones (Simplified for easy selection)
// ---------------------------------
export const timezones = [
  'UTC',
  'GMT',
  'EAT', // East Africa Time (Kenya, Tanzania, Uganda, etc.)
  'WAT', // West Africa Time (Nigeria, Ghana, etc.)
  'CAT', // Central Africa Time (South Africa, Zimbabwe, etc.)
  'SAST', // South Africa Standard Time
  'EET', // Eastern European Time
  'CET', // Central European Time
  'WET', // Western European Time
  'EST', // Eastern Standard Time (US/Canada)
  'CST', // Central Standard Time (US/Canada)
  'MST', // Mountain Standard Time (US/Canada)
  'PST', // Pacific Standard Time (US/Canada)
  'AST', // Atlantic Standard Time
  'HST', // Hawaii Standard Time
  'IST', // India Standard Time
  'PKT', // Pakistan Standard Time
  'BST', // Bangladesh Standard Time
  'JST', // Japan Standard Time
  'KST', // Korea Standard Time
  'CST_CN', // China Standard Time
  'SGT', // Singapore Time
  'PHT', // Philippines Time
  'WIB', // Western Indonesian Time
  'WITA', // Central Indonesian Time
  'WIT', // Eastern Indonesian Time
  'AEST', // Australian Eastern Standard Time
  'ACST', // Australian Central Standard Time
  'AWST', // Australian Western Standard Time
  'NZST', // New Zealand Standard Time
  'FJT', // Fiji Time
  'SST', // Samoa Standard Time
  'CHST', // Chamorro Standard Time
  'GST', // Gulf Standard Time (UAE, Oman, etc.)
  'MSK', // Moscow Standard Time
  'TRT', // Turkey Time
  'IRST', // Iran Standard Time
  'AST_SA', // Saudi Arabia Standard Time
  'AST_EG', // Egypt Standard Time
  'AST_IL', // Israel Standard Time
  'AST_JO', // Jordan Standard Time
  'AST_LB', // Lebanon Standard Time
  'AST_IQ', // Iraq Standard Time
  'AST_PS', // Palestine Standard Time
  'AST_SY', // Syria Standard Time
  'AST_YE', // Yemen Standard Time
  'AST_QA', // Qatar Standard Time
  'AST_KW', // Kuwait Standard Time
  'AST_BH', // Bahrain Standard Time
  'AST_OM', // Oman Standard Time
  'AST_AE', // UAE Standard Time
  'AST_IR', // Iran Standard Time
  'AST_TR', // Turkey Standard Time
  'AST_RU', // Russia Standard Time
] as const;

// ---------------------------------
// Business Partner Types
// ---------------------------------
export const partnerTypes = [
  "vendor",
  "client",
  "supplier",
  "distributor",
  "contractor",
  "service_provider",
  "manufacturer",
  "wholesaler",
  "retailer"
] as const;

// ---------------------------------
// Vendor Types (for determining UI and operations)
// ---------------------------------
export const vendorTypes = [
  "supplier",
  "service_provider",
  "manufacturer",
  "distributor",
  "wholesaler",
  "retailer",
  "logistics",
  "consultant",
  "contractor"
] as const;

// ---------------------------------
// Vendor Access Levels
// ---------------------------------
export const vendorAccessLevels = [
  "basic",      // Basic access to their own data
  "standard",   // Standard access with some organization data
  "premium",    // Premium access with full integration
  "enterprise"  // Enterprise access with custom integrations
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
  updatedAt: z.date().default(() => new Date()),
  emailVerified: z.boolean().optional(),
  isActive: z.boolean().optional(),
  vendorId: z.string().optional(),
});

// Define a schema for an Organization document.
export const organizationSchema = z.object({
  id: z.string(),
  name: z.string().min(2),
  type: z.enum(organizationTypes),
  industry: z.enum(industries),
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

// Define a schema for a Vendor document (extends Business Partner)
export const vendorSchema = z.object({
  id: z.string(),
  vendorId: z.string(), // Unique vendor ID for the organization
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  website: z.string(),
  type: z.enum(vendorTypes),
  status: z.enum(["active", "inactive", "pending", "suspended"]).default("active"),
  organizationId: z.string(), // The organization this vendor belongs to
  clientOrganizations: z.array(z.string()), // Organizations this vendor can work with
  accessLevel: z.enum(vendorAccessLevels).default("basic"),
  vendorCode: z.string(), // Unique code for this vendor
  businessCategory: z.string(),
  specialties: z.array(z.string()),
  certifications: z.array(z.object({
    name: z.string(),
    issuer: z.string(),
    issueDate: z.string(),
    expiryDate: z.string(),
    documentUrl: z.string().optional()
  })).optional(),
  insurance: z.object({
    provider: z.string(),
    policyNumber: z.string(),
    coverage: z.number(),
    expiryDate: z.string()
  }).optional(),
  performance: z.object({
    rating: z.number().min(0).max(5),
    totalOrders: z.number(),
    onTimeDelivery: z.number(), // percentage
    qualityScore: z.number().min(0).max(100),
    lastReviewDate: z.string()
  }).optional(),
  paymentTerms: z.object({
    netDays: z.number(),
    earlyPaymentDiscount: z.number().optional(),
    latePaymentPenalty: z.number().optional()
  }).optional(),
  contactPersons: z.array(z.object({
    name: z.string(),
    position: z.string(),
    email: z.string(),
    phone: z.string(),
    isPrimary: z.boolean()
  })).optional(),
  services: z.array(z.object({
    name: z.string(),
    description: z.string(),
    category: z.string(),
    pricing: z.object({
      type: z.enum(["fixed", "hourly", "per_unit", "percentage"]),
      amount: z.number(),
      currency: z.string()
    })
  })).optional(),
  products: z.array(z.object({
    name: z.string(),
    sku: z.string(),
    category: z.string(),
    price: z.number(),
    currency: z.string(),
    minOrderQuantity: z.number(),
    leadTime: z.number() // in days
  })).optional(),
  documents: z.array(z.object({
    type: z.string(),
    name: z.string(),
    url: z.string(),
    uploadedAt: z.string(),
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
    incorporationDate: z.string(),
    vatNumber: z.string().optional(),
    businessLicense: z.string().optional()
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
  settings: z.object({
    autoApproveOrders: z.boolean().default(false),
    requireApproval: z.boolean().default(true),
    allowDirectPurchase: z.boolean().default(false),
    notificationPreferences: z.object({
      email: z.boolean().default(true),
      sms: z.boolean().default(false),
      push: z.boolean().default(true)
    }),
    integrationSettings: z.object({
      apiEnabled: z.boolean().default(false),
      webhookUrl: z.string().optional(),
      syncFrequency: z.enum(["realtime", "hourly", "daily"]).default("daily")
    })
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
  industry: z.enum(industries),
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
  department: string;
  modulePermissions?: any[];
  emailVerified?: boolean;
  isActive?: boolean;
  vendorId?: string;
  timezone?: string; // Direct timezone property for easier access
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
// Merged "Vendor" Type
// ---------------------------------
export type Vendor = Omit<z.infer<typeof vendorSchema>, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
  organization?: Organization;
  clientOrganizations?: Organization[];
};

// ---------------------------------
// Other Types
// ---------------------------------
export type InsertUser = z.infer<typeof insertUserSchema>;
export type RegisterOrganization = z.infer<typeof registerOrganizationSchema>;
export type AvailableModule = typeof availableModules[number];
export type UserRole = typeof userRoles[number];
export type Department = typeof departments[number];
export type VendorType = typeof vendorTypes[number];
export type VendorAccessLevel = typeof vendorAccessLevels[number];
export type PartnerType = typeof partnerTypes[number];
export type OfficeLocation = typeof officeLocations[number];
export type Timezone = typeof timezones[number];
export type DepartmentPosition = typeof departmentPositions[Department][number];
export type TimeTrackingStatus = typeof timeTrackingStatuses[number];
export type TimeTrackingType = typeof timeTrackingTypes[number];
export type MeetingStatus = typeof meetingStatuses[number];
export type MeetingType = typeof meetingTypes[number];
export type TaskStatus = typeof taskStatuses[number];
export type TaskPriority = typeof taskPriorities[number];

// Type exports for the new schemas
export type TimeTrackingEntry = z.infer<typeof timeTrackingEntrySchema>;
export type TimeTrackingSummary = z.infer<typeof timeTrackingSummarySchema>;
export type Meeting = z.infer<typeof meetingSchema>;
export type Task = z.infer<typeof taskSchema>;

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
    sessionTimeout: z.number().default(30),
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
    retention: z.number().default(30),
    autoBackup: z.boolean().default(true),
  }),
  workingDays: z.array(z.string()).default([]),
  workingHours: z.object({
    start: z.string(),
    end: z.string(),
  }).default({ start: '09:00', end: '17:00' }),
  holidays: z.array(z.object({
    name: z.string(),
    date: z.string(),
  })).default([]),
  customSettings: z.record(z.any()).optional(),
  accounting: z.object({
    fiscalYearStart: z.string(),
    fiscalYearEnd: z.string(),
    taxYearStart: z.string(),
    taxYearEnd: z.string(),
    currency: z.string(),
    taxRates: z.record(z.number()),
    chartOfAccounts: z.array(z.object({
      code: z.string(),
      name: z.string(),
      type: z.string(),
      category: z.string(),
      isActive: z.boolean(),
    })).optional(),
    reportingPeriods: z.array(z.string()),
    taxJurisdictions: z.array(z.object({
      name: z.string(),
      type: z.string(),
      rates: z.record(z.number()),
      filingDeadlines: z.array(z.string()),
    })),
    compliance: z.object({
      requiredReports: z.array(z.string()),
      filingDeadlines: z.record(z.array(z.string())),
      documentation: z.array(z.string()),
    }),
  }).optional(),
  payroll: z.object({
    paymentFrequency: z.enum(['weekly', 'biweekly', 'monthly']),
    paymentDay: z.number(),
    overtimeRate: z.number(),
    bonusStructure: z.record(z.number()).optional(),
    deductions: z.array(z.object({
      type: z.string(),
      rate: z.number(),
      threshold: z.number().optional(),
    })),
  }).optional(),
  benefits: z.object({
    mandatory: z.array(z.object({
      type: z.string(),
      provider: z.string(),
      coverage: z.string(),
      cost: z.object({
        employee: z.number(),
        employer: z.number(),
      }),
    })),
    optional: z.array(z.object({
      type: z.string(),
      provider: z.string(),
      coverage: z.string(),
      cost: z.object({
        employee: z.number(),
        employer: z.number(),
      }),
    })),
  }).optional(),
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

// --- Types matching MongoDB organization object ---

export type MongoOrganization = {
  _id: string;
  name: string;
  type: string;
  industry: string;
  walletAddress?: string;
  activeModules: string[];
  maxModules: number;
  settings?: MongoOrganizationSettings;
  roles?: MongoRole[];
  createdAt: string;
  updatedAt: string;
};

export type MongoRole = {
  name: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
  moduleAccess: { module: string; access: string }[];
};

export type MongoOrganizationSettings = {
  theme?: Record<string, any>;
  branding?: Record<string, any>;
  modules?: Record<string, any>;
  notifications?: Record<string, any>;
  security?: Record<string, any>;
  integrations?: Record<string, any>;
  backup?: Record<string, any>;
  legalCompliance?: Record<string, any>;
  recommendedModules?: string[];
  primaryModule?: string;
};

// ---------------------------------
// Timezone Utilities
// ---------------------------------

// Convert simplified timezone codes to IANA timezone identifiers
export const getIANATimezone = (timezoneCode: string): string => {
  const timezoneMap: Record<string, string> = {
    'UTC': 'UTC',
    'GMT': 'GMT',
    'EST': 'America/New_York',
    'CST': 'America/Chicago',
    'MST': 'America/Denver',
    'PST': 'America/Los_Angeles',
    'EAT': 'Africa/Nairobi',
    'CAT': 'Africa/Harare',
    'WAT': 'Africa/Lagos',
    'SAST': 'Africa/Johannesburg',
    'IST': 'Asia/Kolkata',
    'JST': 'Asia/Tokyo',
    'CST_CN': 'Asia/Shanghai',
    'AEST': 'Australia/Sydney',
    'NZST': 'Pacific/Auckland'
  };
  return timezoneMap[timezoneCode] || 'UTC';
};

export const getTimezoneDisplayName = (timezoneCode: string): string => {
  const displayNames: Record<string, string> = {
    'UTC': 'UTC (UTC+0)',
    'GMT': 'GMT (UTC+0)',
    'EST': 'EST (UTC-5)',
    'CST': 'CST (UTC-6)',
    'MST': 'MST (UTC-7)',
    'PST': 'PST (UTC-8)',
    'EAT': 'EAT (UTC+3)',
    'CAT': 'CAT (UTC+2)',
    'WAT': 'WAT (UTC+1)',
    'SAST': 'SAST (UTC+2)',
    'IST': 'IST (UTC+5:30)',
    'JST': 'JST (UTC+9)',
    'CST_CN': 'CST China (UTC+8)',
    'AEST': 'AEST (UTC+10)',
    'NZST': 'NZST (UTC+12)'
  };
  return displayNames[timezoneCode] || `${timezoneCode} (UTC+0)`;
};

// Get timezone offset in hours for display
export const getTimezoneOffset = (timezoneCode: string): string => {
  const offsetMap: Record<string, string> = {
    'UTC': 'UTC+0',
    'GMT': 'UTC+0',
    'EST': 'UTC-5',
    'CST': 'UTC-6',
    'MST': 'UTC-7',
    'PST': 'UTC-8',
    'EAT': 'UTC+3',
    'CAT': 'UTC+2',
    'WAT': 'UTC+1',
    'SAST': 'UTC+2',
    'IST': 'UTC+5:30',
    'JST': 'UTC+9',
    'CST_CN': 'UTC+8',
    'AEST': 'UTC+10',
    'NZST': 'UTC+12'
  };
  return offsetMap[timezoneCode] || 'UTC+0';
};

// ---------------------------------
// Time Tracking Types
// ---------------------------------
export const timeTrackingStatuses = [
  'active',
  'paused',
  'completed',
  'stopped'
] as const;

export const timeTrackingTypes = [
  'task',
  'project',
  'meeting',
  'break',
  'training',
  'other'
] as const;

// Time tracking entry schema
export const timeTrackingEntrySchema = z.object({
  id: z.string(),
  userId: z.string(),
  organizationId: z.string(),
  projectId: z.string().optional(),
  taskId: z.string().optional(),
  description: z.string(),
  type: z.enum(timeTrackingTypes),
  status: z.enum(timeTrackingStatuses),
  startTime: z.date(),
  endTime: z.date().optional(),
  duration: z.number().optional(), // in minutes
  timezone: z.string(), // user's timezone when tracking
  location: z.string().optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
  billable: z.boolean().default(false),
  hourlyRate: z.number().optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

// Time tracking summary schema
export const timeTrackingSummarySchema = z.object({
  id: z.string(),
  userId: z.string(),
  organizationId: z.string(),
  date: z.date(),
  totalHours: z.number(),
  billableHours: z.number(),
  timezone: z.string(),
  entries: z.array(z.string()), // array of entry IDs
  breaks: z.number().default(0),
  overtime: z.number().default(0),
  createdAt: z.date(),
  updatedAt: z.date()
});

// ---------------------------------
// Meeting Scheduling Types
// ---------------------------------
export const meetingStatuses = [
  'scheduled',
  'in_progress',
  'completed',
  'cancelled',
  'rescheduled'
] as const;

export const meetingTypes = [
  'one_on_one',
  'team_meeting',
  'client_meeting',
  'training',
  'review',
  'other'
] as const;

// Meeting schema
export const meetingSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  organizerId: z.string(),
  organizationId: z.string(),
  type: z.enum(meetingTypes),
  status: z.enum(meetingStatuses),
  startTime: z.date(),
  endTime: z.date(),
  timezone: z.string(), // organizer's timezone
  location: z.string().optional(),
  isVirtual: z.boolean().default(false),
  meetingUrl: z.string().optional(),
  attendees: z.array(z.object({
    userId: z.string(),
    timezone: z.string(),
    status: z.enum(['accepted', 'declined', 'pending', 'tentative']),
    responseTime: z.date().optional()
  })),
  recurring: z.object({
    isRecurring: z.boolean(),
    frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional(),
    interval: z.number().optional(),
    endDate: z.date().optional()
  }).optional(),
  reminders: z.array(z.object({
    type: z.enum(['email', 'push', 'sms']),
    minutesBefore: z.number()
  })).optional(),
  notes: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

// ---------------------------------
// Task Management Types
// ---------------------------------
export const taskStatuses = [
  'todo',
  'in_progress',
  'review',
  'completed',
  'cancelled',
  'on_hold'
] as const;

export const taskPriorities = [
  'low',
  'medium',
  'high',
  'urgent'
] as const;

// Task schema
export const taskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  assigneeId: z.string(),
  assignerId: z.string(),
  organizationId: z.string(),
  projectId: z.string().optional(),
  status: z.enum(taskStatuses),
  priority: z.enum(taskPriorities),
  estimatedHours: z.number().optional(),
  actualHours: z.number().optional(),
  dueDate: z.date().optional(),
  timezone: z.string(), // assignee's timezone
  tags: z.array(z.string()).optional(),
  attachments: z.array(z.object({
    id: z.string(),
    name: z.string(),
    url: z.string(),
    type: z.string()
  })).optional(),
  comments: z.array(z.object({
    id: z.string(),
    userId: z.string(),
    content: z.string(),
    timestamp: z.date(),
    timezone: z.string()
  })).optional(),
  timeTracking: z.array(z.string()).optional(), // array of time tracking entry IDs
  dependencies: z.array(z.string()).optional(), // array of task IDs
  createdAt: z.date(),
  updatedAt: z.date()
});
