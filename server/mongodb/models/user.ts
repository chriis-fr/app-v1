import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'owner' | 'admin' | 'manager' | 'employee' | 'contractor';
  organizationId: mongoose.Types.ObjectId;
  department: string;
  position: string;
  isActive: boolean;
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
  isOwner: boolean;
  moduleAccess: string[];
  permissions: { module: string; actions: string[] }[];
  modulePermissions: Record<string, string[]>;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['owner', 'admin', 'manager', 'employee', 'contractor'],
    default: 'employee'
  },
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  department: {
    type: String,
    required: true
  },
  position: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  isOwner: {
    type: Boolean,
    default: false
  },
  moduleAccess: [{
    type: String
  }],
  permissions: [{
    module: { type: String, required: true },
    actions: [{ type: String }]
  }],
  modulePermissions: {
    type: Map,
    of: [String],
    default: {}
  }
}, {
  timestamps: true
});

// Add index for faster queries
userSchema.index({ organizationId: 1 });
userSchema.index({ role: 1 });

export const User = mongoose.models.User || mongoose.model('User', userSchema); 