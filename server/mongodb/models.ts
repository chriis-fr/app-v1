
import mongoose from 'mongoose';
import { availableModules, organizationTypes, userRoles, departments } from '@shared/schema';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: userRoles, default: 'employee' },
  department: { type: String, enum: departments, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: String,
  organizationId: { type: mongoose.Schema.Types.ObjectId, required: true },
  isOwner: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const organizationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: organizationTypes, required: true },
  industry: { type: String, required: true },
  size: String,
  walletAddress: { type: String, unique: true },
  activeModules: { type: [String], enum: availableModules, default: ['dashboard'] },
  maxModules: { type: Number, default: 2 },
  address: String,
  country: String,
  taxId: String,
  website: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const User = mongoose.model('User', userSchema);
export const Organization = mongoose.model('Organization', organizationSchema);
