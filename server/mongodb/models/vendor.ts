import mongoose, { Schema, Document } from 'mongoose';
import { vendorTypes, vendorAccessLevels } from '@shared/schema';

export interface IVendor extends Document {
  vendorId: string;
  name: string;
  email: string;
  phone: string;
  website: string;
  type: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  organizationId: mongoose.Types.ObjectId;
  clientOrganizations: mongoose.Types.ObjectId[];
  accessLevel: string;
  vendorCode: string;
  businessCategory: string;
  specialties: string[];
  certifications?: Array<{
    name: string;
    issuer: string;
    issueDate: string;
    expiryDate: string;
    documentUrl?: string;
  }>;
  insurance?: {
    provider: string;
    policyNumber: string;
    coverage: number;
    expiryDate: string;
  };
  performance?: {
    rating: number;
    totalOrders: number;
    onTimeDelivery: number;
    qualityScore: number;
    lastReviewDate: string;
  };
  paymentTerms?: {
    netDays: number;
    earlyPaymentDiscount?: number;
    latePaymentPenalty?: number;
  };
  contactPersons?: Array<{
    name: string;
    position: string;
    email: string;
    phone: string;
    isPrimary: boolean;
  }>;
  services?: Array<{
    name: string;
    description: string;
    category: string;
    pricing: {
      type: 'fixed' | 'hourly' | 'per_unit' | 'percentage';
      amount: number;
      currency: string;
    };
  }>;
  products?: Array<{
    name: string;
    sku: string;
    category: string;
    price: number;
    currency: string;
    minOrderQuantity: number;
    leadTime: number;
  }>;
  documents?: Array<{
    type: string;
    name: string;
    url: string;
    uploadedAt: string;
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
    vatNumber?: string;
    businessLicense?: string;
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
  settings?: {
    autoApproveOrders: boolean;
    requireApproval: boolean;
    allowDirectPurchase: boolean;
    notificationPreferences: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    integrationSettings: {
      apiEnabled: boolean;
      webhookUrl?: string;
      syncFrequency: 'realtime' | 'hourly' | 'daily';
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

const vendorSchema = new Schema<IVendor>({
  vendorId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true
  },
  website: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: vendorTypes,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'suspended'],
    default: 'active'
  },
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  clientOrganizations: [{
    type: Schema.Types.ObjectId,
    ref: 'Organization'
  }],
  accessLevel: {
    type: String,
    enum: vendorAccessLevels,
    default: 'basic'
  },
  vendorCode: {
    type: String,
    required: true,
    unique: true
  },
  businessCategory: {
    type: String,
    required: true
  },
  specialties: [{
    type: String
  }],
  certifications: [{
    name: { type: String, required: true },
    issuer: { type: String, required: true },
    issueDate: { type: String, required: true },
    expiryDate: { type: String, required: true },
    documentUrl: String
  }],
  insurance: {
    provider: String,
    policyNumber: String,
    coverage: Number,
    expiryDate: String
  },
  performance: {
    rating: { type: Number, min: 0, max: 5, default: 0 },
    totalOrders: { type: Number, default: 0 },
    onTimeDelivery: { type: Number, min: 0, max: 100, default: 0 },
    qualityScore: { type: Number, min: 0, max: 100, default: 0 },
    lastReviewDate: String
  },
  paymentTerms: {
    netDays: { type: Number, default: 30 },
    earlyPaymentDiscount: Number,
    latePaymentPenalty: Number
  },
  contactPersons: [{
    name: { type: String, required: true },
    position: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    isPrimary: { type: Boolean, default: false }
  }],
  services: [{
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    pricing: {
      type: { type: String, enum: ['fixed', 'hourly', 'per_unit', 'percentage'], required: true },
      amount: { type: Number, required: true },
      currency: { type: String, required: true }
    }
  }],
  products: [{
    name: { type: String, required: true },
    sku: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    currency: { type: String, required: true },
    minOrderQuantity: { type: Number, default: 1 },
    leadTime: { type: Number, default: 7 }
  }],
  documents: [{
    type: { type: String, required: true },
    name: { type: String, required: true },
    url: { type: String, required: true },
    uploadedAt: { type: String, required: true },
    expiryDate: String
  }],
  wallet: {
    balance: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },
    bankAccounts: [{
      id: { type: String, required: true },
      bankName: { type: String, required: true },
      accountNumber: { type: String, required: true },
      accountType: { type: String, required: true },
      isDefault: { type: Boolean, default: false }
    }]
  },
  legalDetails: {
    taxId: String,
    businessType: String,
    registrationNumber: String,
    incorporationDate: String,
    vatNumber: String,
    businessLicense: String
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    postalCode: String,
    isBillingAddress: { type: Boolean, default: true },
    isShippingAddress: { type: Boolean, default: true }
  },
  settings: {
    autoApproveOrders: { type: Boolean, default: false },
    requireApproval: { type: Boolean, default: true },
    allowDirectPurchase: { type: Boolean, default: false },
    notificationPreferences: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true }
    },
    integrationSettings: {
      apiEnabled: { type: Boolean, default: false },
      webhookUrl: String,
      syncFrequency: { type: String, enum: ['realtime', 'hourly', 'daily'], default: 'daily' }
    }
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
vendorSchema.index({ vendorId: 1 });
vendorSchema.index({ organizationId: 1 });
vendorSchema.index({ clientOrganizations: 1 });
vendorSchema.index({ vendorCode: 1 });
vendorSchema.index({ type: 1 });
vendorSchema.index({ status: 1 });
vendorSchema.index({ email: 1 });

// Add middleware to update the updatedAt timestamp
vendorSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Generate vendor code automatically
vendorSchema.pre('save', function(next) {
  if (this.isNew && !this.vendorCode) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.vendorCode = `V${timestamp}${random}`.toUpperCase();
  }
  next();
});

export const Vendor = mongoose.models.Vendor || mongoose.model<IVendor>('Vendor', vendorSchema); 