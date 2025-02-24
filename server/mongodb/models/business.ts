import mongoose from 'mongoose';

// Transaction Schema
const transactionSchema = new mongoose.Schema({
  id: String,
  type: {
    type: String,
    enum: ['sale', 'purchase', 'payment', 'receipt', 'adjustment'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  description: String,
  reference: String,
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Organization'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  metadata: mongoose.Schema.Types.Mixed,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Blockchain Transaction Schema
const blockchainTransactionSchema = new mongoose.Schema({
  txHash: {
    type: String,
    required: true,
    unique: true
  },
  fromAddress: String,
  toAddress: String,
  amount: Number,
  currency: {
    type: String,
    default: 'ETH'
  },
  networkId: Number,
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'failed'],
    default: 'pending'
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Organization'
  },
  relatedEntityType: {
    type: String,
    enum: ['invoice', 'payment', 'contract']
  },
  relatedEntityId: mongoose.Schema.Types.ObjectId,
  createdAt: Date,
  confirmedAt: Date
});

// Invoice Schema
const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true
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
    amount: Number
  }],
  totalAmount: Number,
  status: {
    type: String,
    enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
    default: 'draft'
  },
  dueDate: Date,
  paymentTerms: String,
  notes: String,
  createdAt: Date,
  updatedAt: Date
});

// Export models
export const Transaction = mongoose.model('Transaction', transactionSchema);
export const BlockchainTransaction = mongoose.model('BlockchainTransaction', blockchainTransactionSchema);
export const Invoice = mongoose.model('Invoice', invoiceSchema); 