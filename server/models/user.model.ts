import { Schema, model, models, Model } from 'mongoose';
import { z } from 'zod';
import { userSchema } from '@shared/schema';

type User = z.infer<typeof userSchema>;

const userMongooseSchema = new Schema<User>({
  id: { type: String, required: true, unique: true },
  username: { type: String, required: true, minlength: 3 },
  password: { type: String, required: true, minlength: 8 },
  role: { type: String, required: true, enum: ['owner', 'admin', 'manager', 'employee'] },
  department: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String },
  organizationId: { type: String, required: true },
  isOwner: { type: Boolean, required: true },
  position: { type: String },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  lastLogin: { type: Date },
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

export const UserModel: Model<User> = models.User || model<User>('User', userMongooseSchema); 