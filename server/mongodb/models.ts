import mongoose from 'mongoose';
import { availableModules, organizationTypes, userRoles, departments, OrganizationSettings, Role } from '@shared/schema';

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
  moduleAccess: { type: [String], enum: availableModules, default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const organizationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: organizationTypes, required: true },
  industry: { type: String, required: true },
  size: String,
  walletAddress: { type: String, unique: true },
  activeModules: { type: [String], enum: availableModules, default: ['accounting'] },
  maxModules: { type: Number, default: 2 },
  address: String,
  country: String,
  taxId: String,
  website: String,
  settings: { type: Object, default: {} },
  roles: [{ type: Object, default: [] }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['sale', 'refund', 'payment', 'expense'],
    required: true
  },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  description: { type: String, required: true },
  reference: { type: String },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  metadata: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const employeeSchema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  employeeId: { type: String, required: true },
  firstName: String,
  lastName: String,
  email: { type: String, required: true },
  phone: String,
  department: String,
  position: String,
  startDate: Date,
  salary: {
    amount: Number,
    currency: String
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'on_leave', 'terminated'],
    default: 'active'
  },
  documents: [{
    type: String,
    documentType: String,
    url: String,
    uploadedAt: Date
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const attendanceSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  organizationId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Organization' },
  date: { type: Date, required: true },
  checkIn: Date,
  checkOut: Date,
  status: {
    type: String,
    enum: ['present', 'absent', 'half_day', 'leave'],
    default: 'present'
  },
  notes: String
});

const blockchainTransactionSchema = new mongoose.Schema({
  txHash: { type: String, required: true, unique: true },
  fromAddress: String,
  toAddress: String,
  amount: Number,
  currency: { type: String, default: 'ETH' },
  networkId: Number,
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'failed'],
    default: 'pending'
  },
  organizationId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Organization' },
  relatedEntityType: {
    type: String,
    enum: ['invoice', 'payment', 'contract']
  },
  relatedEntityId: mongoose.Schema.Types.ObjectId,
  createdAt: { type: Date, default: Date.now },
  confirmedAt: Date
});

const customerSchema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  address: { type: String },
  type: { type: String, enum: ['individual', 'business'] },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  totalPurchases: { type: Number, default: 0 },
  lastPurchaseDate: { type: Date },
  notes: String,
  loyalty_points: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const posSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    taxRate: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true }
  }],
  subtotal: { type: Number, required: true },
  tax: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  paymentMethod: { type: String, required: true },
  notes: { type: String },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'partially_paid', 'refunded'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Organization'
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  },
  items: [{
    description: String,
    quantity: Number,
    unitPrice: Number,
    amount: Number,
    tax: Number
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
    default: 'draft'
  },
  dueDate: Date,
  paymentTerms: String,
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const payrollSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  period: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true }
  },
  basicSalary: {
    type: Number,
    required: true
  },
  deductions: [{
    type: { type: String },
    amount: Number,
    description: String
  }],
  allowances: [{
    type: { type: String },
    amount: Number,
    description: String
  }],
  netPay: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'approved', 'paid'],
    default: 'draft'
  },
  paidAt: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sku: { type: String, required: true, unique: true },
  barcode: { type: String },
  price: { type: Number, required: true },
  cost: { type: Number, required: true },
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  stock_quantity: { type: Number, required: true, default: 0 },
  low_stock_threshold: { type: Number, default: 10 },
  tax_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Tax' },
  tax_type: { type: String, enum: ['inclusive', 'exclusive'], default: 'inclusive' },
  unit_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit' },
  description: { type: String },
  image_url: { type: String },
  status: { type: String, enum: ['available', 'unavailable'], default: 'available' },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

const taxSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rate: { type: Number, required: true },
  description: { type: String },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

const unitSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true },
  description: { type: String },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

userSchema.virtual('id').get(function () {
  return this._id.toString();
});

userSchema.set('toJSON', { virtuals: true });

export const User = mongoose.model('User', userSchema);
export const Organization = mongoose.model('Organization', organizationSchema);
export const Transaction = mongoose.model('Transaction', transactionSchema);
export const Employee = mongoose.model('Employee', employeeSchema);
export const Attendance = mongoose.model('Attendance', attendanceSchema);
export const BlockchainTransaction = mongoose.model('BlockchainTransaction', blockchainTransactionSchema);
export const Customer = mongoose.model('Customer', customerSchema);
export const POS = mongoose.model('POS', posSchema);
export const Invoice = mongoose.model('Invoice', invoiceSchema);
export const Payroll = mongoose.model('Payroll', payrollSchema);
export const Product = mongoose.model('Product', productSchema);
export const Category = mongoose.model('Category', categorySchema);
export const Tax = mongoose.model('Tax', taxSchema);
export const Unit = mongoose.model('Unit', unitSchema);
