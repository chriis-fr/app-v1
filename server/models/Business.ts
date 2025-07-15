import mongoose from 'mongoose';

const businessSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subdomain: { type: String, required: true, unique: true },
  settings: {
    theme: { type: String, default: 'light' },
    currency: { type: String, default: 'USD' },
    timezone: { type: String, default: 'UTC' },
    modules: [{
      name: String, // 'pos', 'inventory', 'hr', etc.
      enabled: Boolean,
      settings: mongoose.Schema.Types.Mixed
    }],
    notifications: {
      email: Boolean,
      slack: Boolean,
      webhook: String
    },
    customFields: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  subscription: {
    plan: String,
    status: String,
    validUntil: Date
  },
  createdAt: { type: Date, default: Date.now }
});

export const Business = mongoose.model('Business', businessSchema); 