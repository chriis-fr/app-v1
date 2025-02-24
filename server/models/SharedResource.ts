import mongoose from 'mongoose';

const sharedResourceSchema = new mongoose.Schema({
  type: String, // 'template', 'report', etc.
  name: String,
  data: mongoose.Schema.Types.Mixed,
  access: [{
    businessId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Business' 
    },
    permissions: [String] // 'view', 'edit', etc.
  }],
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Business' 
  },
  createdAt: { type: Date, default: Date.now }
});

export const SharedResource = mongoose.model('SharedResource', sharedResourceSchema); 