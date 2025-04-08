import { Schema, model, Model } from 'mongoose';

interface UserPermission {
  module: string;
  actions: string[];
}

type Department = 'Executive' | 'Engineering' | 'Sales' | 'Marketing' | 'Finance' | 'HR' | 'Operations' | 'IT' | 'Customer Support' | 'Product' | 'Design';

// Define the User interface directly
interface MongooseUser {
  id: string;
  username: string;
  password: string;
  role: 'owner' | 'admin' | 'manager' | 'employee' | 'contractor';
  department: Department;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  organizationId: string;
  isOwner: boolean;
  moduleAccess: string[];
  permissions: UserPermission[];
  position?: string;
  status: 'active' | 'inactive';
  lastLogin?: Date;
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
  skills?: string[];
  certifications?: string[];
  education?: Array<{
    degree?: string;
    institution?: string;
    graduationYear?: string;
  }>;
  performance?: {
    lastReviewDate?: string;
    nextReviewDate?: string;
    rating?: number;
  };
  compensation?: {
    baseSalary?: number;
    bonus?: number;
    stockOptions?: number;
    currency?: string;
  };
  benefits?: {
    healthInsurance?: boolean;
    dentalInsurance?: boolean;
    visionInsurance?: boolean;
    retirementPlan?: boolean;
    lifeInsurance?: boolean;
  };
  equipment?: {
    laptop?: string;
    monitor?: string;
    phone?: string;
    accessories?: string[];
  };
  accessLevels?: {
    systems?: string[];
    buildings?: string[];
    rooms?: string[];
  };
  documents?: Array<{
    id?: string;
    type?: string;
    url?: string;
    expiryDate?: string;
  }>;
  wallet?: {
    balance: number;
    currency: string;
    bankAccounts: Array<{
      id: string;
      bankName: string;
      accountNumber: string;
      accountType: string;
      isDefault: boolean;
    }>;
  };
  legalDetails?: {
    taxId: string;
    businessType: string;
    registrationNumber: string;
    incorporationDate: string;
  };
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    isBillingAddress: boolean;
    isShippingAddress: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const userMongooseSchema = new Schema<MongooseUser>({
  id: { type: String, required: true, unique: true },
  username: { type: String, required: true, minlength: 3 },
  password: { type: String, required: true, minlength: 8 },
  role: { type: String, required: true, enum: ['owner', 'admin', 'manager', 'employee', 'contractor'] },
  department: { type: String, required: true, enum: ['Executive', 'Engineering', 'Sales', 'Marketing', 'Finance', 'HR', 'Operations', 'IT', 'Customer Support', 'Product', 'Design'] },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String },
  organizationId: { type: String, required: true },
  isOwner: { type: Boolean, required: true },
  moduleAccess: { type: [String], default: [] },
  permissions: [{
    module: { type: String, required: true },
    actions: { type: [String], default: [] }
  }],
  position: { type: String },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  lastLogin: { type: Date },
  employeeId: { type: String },
  hireDate: { type: String },
  managerId: { type: String },
  team: { type: String },
  location: {
    office: { type: String },
    floor: { type: String },
    deskNumber: { type: String }
  },
  workSchedule: {
    startTime: { type: String },
    endTime: { type: String },
    timezone: { type: String }
  },
  emergencyContact: {
    name: { type: String },
    relationship: { type: String },
    phone: { type: String }
  },
  skills: { type: [String] },
  certifications: { type: [String] },
  education: [{
    degree: { type: String },
    institution: { type: String },
    graduationYear: { type: String }
  }],
  performance: {
    lastReviewDate: { type: String },
    nextReviewDate: { type: String },
    rating: { type: Number }
  },
  compensation: {
    baseSalary: { type: Number },
    bonus: { type: Number },
    stockOptions: { type: Number },
    currency: { type: String }
  },
  benefits: {
    healthInsurance: { type: Boolean },
    dentalInsurance: { type: Boolean },
    visionInsurance: { type: Boolean },
    retirementPlan: { type: Boolean },
    lifeInsurance: { type: Boolean }
  },
  equipment: {
    laptop: { type: String },
    monitor: { type: String },
    phone: { type: String },
    accessories: { type: [String] }
  },
  accessLevels: {
    systems: { type: [String] },
    buildings: { type: [String] },
    rooms: { type: [String] }
  },
  documents: [{
    id: { type: String },
    type: { type: String },
    url: { type: String },
    expiryDate: { type: String }
  }],
  wallet: {
    balance: { type: Number },
    currency: { type: String },
    bankAccounts: [{
      id: { type: String },
      bankName: { type: String },
      accountNumber: { type: String },
      accountType: { type: String },
      isDefault: { type: Boolean }
    }]
  },
  legalDetails: {
    taxId: { type: String },
    businessType: { type: String },
    registrationNumber: { type: String },
    incorporationDate: { type: String }
  },
  address: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    postalCode: { type: String },
    isBillingAddress: { type: Boolean },
    isShippingAddress: { type: Boolean }
  },
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date, required: true }
}, {
  timestamps: true
});

// Use a singleton pattern to prevent model recompilation
let UserModel: Model<MongooseUser>;
try {
  // Try to get the existing model
  UserModel = model<MongooseUser>('User');
} catch {
  // If it doesn't exist, create it
  UserModel = model<MongooseUser>('User', userMongooseSchema);
}

export { UserModel };
export type { MongooseUser }; 