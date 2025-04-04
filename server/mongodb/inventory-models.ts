import mongoose from 'mongoose';

// Stock Item Schema (represents current inventory levels)
const stockSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  warehouseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  quantity: { type: Number, required: true, default: 0 },
  availableQuantity: { type: Number, required: true, default: 0 }, // Accounts for reserved items
  minimumStockLevel: { type: Number, default: 10 },
  reorderPoint: { type: Number, default: 20 },
  reorderQuantity: { type: Number, default: 50 },
  location: { type: String }, // Location within warehouse (e.g., "Shelf A-12")
  costPerUnit: { type: Number, required: true },
  totalValue: { type: Number, required: true }, // quantity * costPerUnit
  batchNumber: { type: String },
  expiryDate: { type: Date },
  lastStockTake: { type: Date },
  status: { 
    type: String, 
    enum: ['in_stock', 'low_stock', 'out_of_stock', 'discontinued'], 
    default: 'in_stock' 
  },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Warehouse Schema
const warehouseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true },
  address: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    postalCode: { type: String }
  },
  contactPerson: { type: String },
  contactEmail: { type: String },
  contactPhone: { type: String },
  capacity: { type: Number }, // Total capacity in cubic meters or similar unit
  capacityUsed: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  notes: { type: String },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Stock Movement Schema (tracks inventory changes)
const stockMovementSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  fromWarehouseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
  toWarehouseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
  quantity: { type: Number, required: true },
  type: { 
    type: String, 
    enum: [
      'purchase', 'sale', 'transfer', 'adjustment', 
      'return', 'write_off', 'production', 'consumption'
    ], 
    required: true 
  },
  referenceNumber: { type: String }, // Reference to PO, SO, etc.
  referenceType: { 
    type: String, 
    enum: ['purchase_order', 'sales_order', 'transfer_order', 'adjustment', 'production_order'] 
  },
  reason: { type: String },
  cost: { type: Number }, // Cost of this movement
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  verified: { type: Boolean, default: false },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: { type: String },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  // Blockchain verification fields
  blockchainVerified: { type: Boolean, default: false },
  blockchainTxHash: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Inventory Audit Schema
const inventoryAuditSchema = new mongoose.Schema({
  auditNumber: { type: String, required: true, unique: true },
  warehouseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  status: { 
    type: String, 
    enum: ['planned', 'in_progress', 'completed', 'cancelled'], 
    default: 'planned' 
  },
  auditType: { 
    type: String, 
    enum: ['full', 'partial', 'cycle_count'], 
    default: 'full' 
  },
  auditItems: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    expectedQuantity: { type: Number, required: true },
    actualQuantity: { type: Number },
    discrepancy: { type: Number },
    notes: { type: String },
    adjustmentMade: { type: Boolean, default: false },
    adjustmentMovementId: { type: mongoose.Schema.Types.ObjectId, ref: 'StockMovement' }
  }],
  conductedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: { type: String },
  // Blockchain verification for audit integrity
  blockchainVerified: { type: Boolean, default: false },
  blockchainTxHash: { type: String },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Supply Chain Source Schema (for ethical sourcing and tracking)
const supplyChainSourceSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  sourceType: { 
    type: String, 
    enum: ['raw_material', 'manufactured_good', 'packaging', 'service'], 
    required: true 
  },
  supplierName: { type: String, required: true },
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'BusinessPartner' },
  country: { type: String },
  region: { type: String },
  certifications: [{ type: String }], // e.g., "Fair Trade", "Organic", "FSC"
  ethicalRating: { type: Number }, // Scale from 1-10
  sustainabilityScore: { type: Number }, // Scale from 1-10
  carbonFootprint: { type: Number }, // CO2 equivalent
  materials: [{ type: String }],
  sourcingNotes: { type: String },
  // Supply chain verification
  verificationMethod: { 
    type: String, 
    enum: ['self_reported', 'third_party', 'blockchain_verified', 'unverified'], 
    default: 'unverified' 
  },
  lastVerificationDate: { type: Date },
  verificationDocuments: [{ type: String }], // URLs to documents
  blockchainTxHash: { type: String },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Re-order Request Schema (for automatic reordering)
const reorderRequestSchema = new mongoose.Schema({
  requestNumber: { type: String, required: true, unique: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  warehouseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  requestedQuantity: { type: Number, required: true },
  currentStockLevel: { type: Number, required: true },
  reorderPoint: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'ordered', 'completed', 'cancelled'], 
    default: 'pending' 
  },
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // System or User
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isAutoGenerated: { type: Boolean, default: false },
  purchaseOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseOrder' },
  // Smart contract automation
  smartContractEnabled: { type: Boolean, default: false },
  smartContractTriggered: { type: Boolean, default: false },
  smartContractTransactionId: { type: String },
  notes: { type: String },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Barcode/QR Code Schema
const barcodeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  type: { 
    type: String, 
    enum: ['barcode_1d', 'qr_code', 'data_matrix', 'rfid'], 
    default: 'barcode_1d' 
  },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  batchNumber: { type: String },
  serialNumber: { type: String },
  isActive: { type: Boolean, default: true },
  lastScanned: { type: Date },
  scanCount: { type: Number, default: 0 },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Create and export models
export const Stock = mongoose.model('Stock', stockSchema);
export const Warehouse = mongoose.model('Warehouse', warehouseSchema);
export const StockMovement = mongoose.model('StockMovement', stockMovementSchema);
export const InventoryAudit = mongoose.model('InventoryAudit', inventoryAuditSchema);
export const SupplyChainSource = mongoose.model('SupplyChainSource', supplyChainSourceSchema);
export const ReorderRequest = mongoose.model('ReorderRequest', reorderRequestSchema);
export const Barcode = mongoose.model('Barcode', barcodeSchema); 