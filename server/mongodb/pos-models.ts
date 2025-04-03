import mongoose from 'mongoose';

// Product Schema
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

// POS Order Schema
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
  counterId: { type: String, default: 'default' },
  notes: { type: String },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  status: { 
    type: String, 
    enum: ['draft', 'pending', 'completed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'partially_paid', 'refunded'],
    default: 'pending'
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Customer Schema
const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  address: { type: String },
  loyalty_points: { type: Number, default: 0 },
  totalPurchases: { type: Number, default: 0 },
  lastPurchaseDate: { type: Date },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Transaction Schema
const transactionSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['sale', 'refund', 'payment', 'expense'],
    required: true 
  },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  reference: { type: String },
  paymentMethod: { 
    type: String, 
    enum: ['cash', 'card', 'mobile_money', 'bank_transfer', 'crypto', 'other'],
    default: 'cash'
  },
  paymentDetails: {
    // For card payments
    cardType: { type: String },
    lastFourDigits: { type: String },
    authorizationCode: { type: String },
    
    // For mobile money
    phoneNumber: { type: String },
    transactionId: { type: String },
    
    // For crypto
    walletAddress: { type: String },
    txHash: { type: String },
    blockchain: { type: String }
  },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Category Schema
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Tax Schema
const taxSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rate: { type: Number, required: true },
  description: { type: String },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Unit Schema
const unitSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true },
  description: { type: String },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Create and export models
export const Product = mongoose.model('Product', productSchema);
export const POS = mongoose.model('POS', posSchema);
export const Customer = mongoose.model('Customer', customerSchema);
export const Transaction = mongoose.model('Transaction', transactionSchema);
export const Category = mongoose.model('Category', categorySchema);
export const Tax = mongoose.model('Tax', taxSchema);
export const Unit = mongoose.model('Unit', unitSchema); 