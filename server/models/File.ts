import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
  businessId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Business',
    required: true 
  },
  filename: String,
  path: String,
  type: String, // 'invoice', 'receipt', 'profile', etc.
  uploadedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  createdAt: { type: Date, default: Date.now }
});

export const File = mongoose.model('File', fileSchema); 