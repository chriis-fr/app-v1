import { Schema, model, models, Model } from 'mongoose';
import { z } from 'zod';
import { businessPartnerSchema } from '@shared/schema';

type BusinessPartner = z.infer<typeof businessPartnerSchema>;

const businessPartnerMongooseSchema = new Schema<BusinessPartner>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  website: { type: String, required: true },
  type: { type: String, required: true, enum: ['vendor', 'client', 'supplier', 'distributor', 'contractor'] },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  organizationId: { type: String, required: true },
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

export const BusinessPartnerModel: Model<BusinessPartner> = models.BusinessPartner || model<BusinessPartner>('BusinessPartner', businessPartnerMongooseSchema); 