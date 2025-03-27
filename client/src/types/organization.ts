import { z } from 'zod';

// Available modules enum
export const availableModules = [
  "finance",
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
] as const;

// Organization types
export const organizationTypes = ["business", "ngo"] as const;

// Define a schema for an Organization document
export const organizationSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(organizationTypes),
  industry: z.string(),
  size: z.string().optional(),
  walletAddress: z.string().optional(),
  activeModules: z.array(z.enum(availableModules)),
  maxModules: z.number(),
  address: z.string().optional(),
  country: z.string().optional(),
  taxId: z.string().optional(),
  website: z.string().url().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Type for TypeScript using the Zod schema
export type Organization = z.infer<typeof organizationSchema>;
export type AvailableModule = typeof availableModules[number];
export type OrganizationType = typeof organizationTypes[number];

// Define the Organization type
export type Organization = {
  id: string;
  name: string;
  type: typeof organizationTypes[number];
  industry: string;
  size?: string;
  walletAddress?: string;
  activeModules: typeof availableModules[number][];
  maxModules: number;
  address?: string;
  country?: string;
  taxId?: string;
  website?: string;
  email?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}; 