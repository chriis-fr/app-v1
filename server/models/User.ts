import mongoose, { Document, Schema } from 'mongoose';

export interface UserDocument extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  position: string;
  department: string;
  status: 'active' | 'terminated' | 'on_leave';
  phoneNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  profilePicture?: string;
  emergencyContact?: {
    name: string;
    relationship: string;
    phoneNumber: string;
  };
  employeeId: string;
  organizationId: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  moduleAccess: string[];
  modulePermissions: {
    module: string;
    permissions: string[];
  }[];
  changeLog: {
    field: string;
    oldValue: any;
    newValue: any;
    changedBy: string;
    changedAt: Date;
    changeType: 'create' | 'update' | 'delete';
    department: string;
  }[];
  hireDate: Date;
  workExperience?: {
    company: string;
    position: string;
    startDate: Date;
    endDate?: Date;
    description: string;
  }[];
  education?: {
    institution: string;
    degree: string;
    field: string;
    startDate: Date;
    endDate?: Date;
  }[];
  skills?: string[];
  certifications?: {
    name: string;
    issuer: string;
    date: Date;
    expiryDate?: Date;
  }[];
  maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed';
  dependents?: Array<{
    name: string;
    dateOfBirth: Date;
    gender: string;
    relationship: string;
    status: 'Active' | 'Pending' | 'Inactive';
    lastVerifiedAt: Date;
    documents?: Array<{
      type: string;
      name: string;
      url: string;
      uploadedAt: Date;
      uploadedBy: string;
      status: 'Pending' | 'Approved' | 'Rejected';
    }>;
  }>;
  dependentPolicy?: {
    maxDependents: number;
    maxChildAge: number;
    lastUpdated: Date;
    updatedBy: string;
  };
  dependentEntitlements?: {
    medicalCoverage: boolean;
    dentalCoverage: boolean;
    visionCoverage: boolean;
    lifeInsurance: boolean;
    lastUpdated: Date;
    updatedBy: string;
  };
  canLogin: boolean;
  isOwner: boolean;
}

const userSchema = new Schema<UserDocument>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  position: { type: String, required: true },
  department: { type: String, required: true },
  status: { type: String, enum: ['active', 'terminated', 'on_leave'], default: 'active' },
  phoneNumber: String,
  address: String,
  city: String,
  state: String,
  zip: String,
  profilePicture: String,
  emergencyContact: {
    name: String,
    relationship: String,
    phoneNumber: String
  },
  employeeId: { type: String, required: true, unique: true },
  organizationId: { type: String, required: true },
  role: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  moduleAccess: [{ type: String }],
  modulePermissions: [{
    module: { type: String, required: true },
    permissions: [{ type: String, required: true }]
  }],
  changeLog: [{
    field: { type: String, required: true },
    oldValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed,
    changedBy: { type: String, required: true },
    changedAt: { type: Date, required: true },
    changeType: { 
      type: String, 
      required: true,
      enum: ['create', 'update', 'delete']
    },
    department: { type: String, required: true }
  }],
  hireDate: { type: Date, required: true },
  workExperience: [{
    company: { type: String, required: true },
    position: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: Date,
    description: String
  }],
  education: [{
    institution: { type: String, required: true },
    degree: { type: String, required: true },
    field: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: Date
  }],
  skills: [{ type: String }],
  certifications: [{
    name: { type: String, required: true },
    issuer: { type: String, required: true },
    date: { type: Date, required: true },
    expiryDate: Date
  }],
  maritalStatus: {
    type: String,
    enum: ['single', 'married', 'divorced', 'widowed']
  },
  dependents: [{
    name: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, required: true },
    relationship: { type: String, required: true },
    status: {
      type: String,
      enum: ['Active', 'Pending', 'Inactive'],
      default: 'Pending'
    },
    lastVerifiedAt: { type: Date, default: Date.now },
    documents: [{
      type: { type: String, required: true },
      name: { type: String, required: true },
      url: { type: String, required: true },
      uploadedAt: { type: Date, default: Date.now },
      uploadedBy: { type: String, required: true },
      status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
      }
    }]
  }],
  dependentPolicy: {
    maxDependents: { type: Number, default: 5 },
    maxChildAge: { type: Number, default: 18 },
    lastUpdated: { type: Date, default: Date.now },
    updatedBy: { type: String, required: true }
  },
  dependentEntitlements: {
    medicalCoverage: { type: Boolean, default: false },
    dentalCoverage: { type: Boolean, default: false },
    visionCoverage: { type: Boolean, default: false },
    lifeInsurance: { type: Boolean, default: false },
    lastUpdated: { type: Date, default: Date.now },
    updatedBy: { type: String, required: true }
  },
  canLogin: { type: Boolean, default: true },
  isOwner: { type: Boolean, default: false },
}, {
  timestamps: true
});

// Add indexes for better query performance
userSchema.index({ organizationId: 1 });
userSchema.index({ organizationId: 1, role: 1 });
userSchema.index({ status: 1 });
userSchema.index({ department: 1 });
userSchema.index({ organizationId: 1, department: 1 });

// Add middleware to ensure organization filtering
userSchema.pre(['find', 'findOne'], function(this: any) {
  if (!this.getQuery().organizationId) {
    console.warn('Query missing organizationId filter - this should not happen!');
  }
});

export default mongoose.model<UserDocument>('User', userSchema); 