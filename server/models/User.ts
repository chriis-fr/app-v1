import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  businessId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Business',
    required: true 
  },
  role: {
    type: String,
    enum: ['owner', 'admin', 'manager', 'employee'],
    required: true
  },
  permissions: [{
    module: String, // 'pos', 'inventory', 'hr', etc.
    actions: [String] // 'create', 'read', 'update', 'delete'
  }],
  department: String,
  createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.model('User', userSchema); 