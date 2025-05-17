import mongoose, { Document } from 'mongoose';

export interface UserDocument extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  department: string;
  position: string;
  employeeId: string;
  hireDate: Date;
  status: string;
  moduleAccess: string[];
  organizationId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  // Additional fields
  phoneNumber?: string;
  address?: string;
  profilePicture?: string;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  // Work Experience
  workExperience?: {
    company: string;
    position: string;
    startDate: Date;
    endDate?: Date;
    description: string;
    isCurrent?: boolean;
  }[];
  // Education
  education?: {
    institution: string;
    degree: string;
    field: string;
    startDate: Date;
    endDate?: Date;
    grade?: string;
  }[];
  // Languages
  languages?: {
    language: string;
    proficiency: 'Basic' | 'Intermediate' | 'Advanced' | 'Native';
    reading: boolean;
    writing: boolean;
    speaking: boolean;
  }[];
  // Professional Qualifications
  professionalQualifications?: {
    name: string;
    issuer: string;
    issueDate: Date;
    expiryDate?: Date;
    verified: boolean;
    blockchainHash?: string;
  }[];
  // Competencies
  competencies?: {
    category: string;
    name: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
    verified: boolean;
    verifiedBy?: string;
    verifiedDate?: Date;
  }[];
  // Contract Details
  contract?: {
    type: 'Permanent' | 'Temporary' | 'Casual' | 'Contract' | 'Other';
    startDate: Date;
    endDate?: Date;
    probationPeriod?: number;
    noticePeriod?: number;
    terms: string;
  };
  // Bank Details
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    accountType: string;
    branchCode?: string;
    swiftCode?: string;
  };
  // Disciplinary Records
  disciplinaryRecords?: {
    date: Date;
    offence: string;
    description: string;
    action: string;
    suspensionDays?: number;
    reportedBy: string;
    approvedBy: string;
    status: 'Pending' | 'Active' | 'Resolved';
  }[];
  // Document Management
  documents?: {
    type: string;
    name: string;
    url: string;
    sharepointId?: string;
    uploadedAt: Date;
    uploadedBy: string;
    isMandatory: boolean;
    status: 'Pending' | 'Approved' | 'Rejected';
    approvedBy?: string;
    approvedAt?: Date;
  }[];
  // Recruitment Integration
  recruitmentData?: {
    applicationId?: string;
    source: 'Recruitment' | 'Direct' | 'Referral' | 'Other';
    onboardingStatus: 'Pending' | 'In Progress' | 'Completed';
    onboardingApprovals: {
      hr: boolean;
      it: boolean;
      department: boolean;
      finance: boolean;
    };
    onboardingDate?: Date;
  };
  // Audit Trail
  auditTrail?: {
    field: string;
    oldValue: any;
    newValue: any;
    changedBy: string;
    changedAt: Date;
    reason?: string;
  }[];
  // Rehire Information
  rehireInfo?: {
    previousEmployeeId: string;
    rehireDate: Date;
    rehireReason: string;
    previousTerminationDate: Date;
    previousTerminationReason: string;
  };
  // Dependents Information
  maritalStatus?: 'Single' | 'Married' | 'Divorced' | 'Widowed';
  dependents?: {
    _id?: mongoose.Types.ObjectId;
    name: string;
    gender: 'Male' | 'Female' | 'Other';
    dateOfBirth: Date;
    relationship: 'Spouse' | 'Child' | 'Parent' | 'Other';
    photograph?: string;
    identificationNumber?: string;
    identificationType?: 'Birth Certificate' | 'ID Card' | 'Passport';
    documents?: {
      _id?: mongoose.Types.ObjectId;
      type: string;
      name: string;
      url: string;
      sharepointId?: string;
      uploadedAt: Date;
      uploadedBy: string;
      status: 'Pending' | 'Approved' | 'Rejected';
      approvedBy?: string;
      approvedAt?: Date;
    }[];
    status: 'Active' | 'Inactive' | 'Pending';
    lastVerifiedAt?: Date;
    verifiedBy?: string;
    notes?: string;
  }[];
  dependentEntitlements?: {
    educationalAssistance: boolean;
    housingAllowance: boolean;
    leaveTransportation: boolean;
    childAllowance: boolean;
    lastUpdated: Date;
    updatedBy: string;
  };
  dependentPolicy?: {
    maxDependents: number;
    maxChildAge: number;
    eligibleRelationships: string[];
    requiredDocuments: string[];
    lastUpdated: Date;
    updatedBy: string;
  };
}

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  department: { type: String, required: true },
  position: { type: String, required: true },
  employeeId: { type: String, required: true, unique: true },
  hireDate: { type: Date, required: true },
  status: { type: String, required: true },
  moduleAccess: [{ type: String }],
  organizationId: { type: String, required: true },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  // Additional fields
  phoneNumber: String,
  address: String,
  profilePicture: String,
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String
  },
  // Work Experience
  workExperience: [{
    company: String,
    position: String,
    startDate: Date,
    endDate: Date,
    description: String,
    isCurrent: Boolean
  }],
  // Education
  education: [{
    institution: String,
    degree: String,
    field: String,
    startDate: Date,
    endDate: Date,
    grade: String
  }],
  // Languages
  languages: [{
    language: String,
    proficiency: {
      type: String,
      enum: ['Basic', 'Intermediate', 'Advanced', 'Native']
    },
    reading: Boolean,
    writing: Boolean,
    speaking: Boolean
  }],
  // Professional Qualifications
  professionalQualifications: [{
    name: String,
    issuer: String,
    issueDate: Date,
    expiryDate: Date,
    verified: Boolean,
    blockchainHash: String
  }],
  // Competencies
  competencies: [{
    category: String,
    name: String,
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert']
    },
    verified: Boolean,
    verifiedBy: String,
    verifiedDate: Date
  }],
  // Contract Details
  contract: {
    type: {
      type: String,
      enum: ['Permanent', 'Temporary', 'Casual', 'Contract', 'Other']
    },
    startDate: Date,
    endDate: Date,
    probationPeriod: Number,
    noticePeriod: Number,
    terms: String
  },
  // Bank Details
  bankDetails: {
    bankName: String,
    accountNumber: String,
    accountType: String,
    branchCode: String,
    swiftCode: String
  },
  // Disciplinary Records
  disciplinaryRecords: [{
    date: Date,
    offence: String,
    description: String,
    action: String,
    suspensionDays: Number,
    reportedBy: String,
    approvedBy: String,
    status: {
      type: String,
      enum: ['Pending', 'Active', 'Resolved']
    }
  }],
  // Document Management
  documents: [{
    type: String,
    name: String,
    url: String,
    sharepointId: String,
    uploadedAt: Date,
    uploadedBy: String,
    isMandatory: Boolean,
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected']
    },
    approvedBy: String,
    approvedAt: Date
  }],
  // Recruitment Integration
  recruitmentData: {
    applicationId: String,
    source: {
      type: String,
      enum: ['Recruitment', 'Direct', 'Referral', 'Other']
    },
    onboardingStatus: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed']
    },
    onboardingApprovals: {
      hr: Boolean,
      it: Boolean,
      department: Boolean,
      finance: Boolean
    },
    onboardingDate: Date
  },
  // Audit Trail
  auditTrail: [{
    field: String,
    oldValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed,
    changedBy: String,
    changedAt: Date,
    reason: String
  }],
  // Rehire Information
  rehireInfo: {
    previousEmployeeId: String,
    rehireDate: Date,
    rehireReason: String,
    previousTerminationDate: Date,
    previousTerminationReason: String
  },
  // Dependents Information
  maritalStatus: {
    type: String,
    enum: ['Single', 'Married', 'Divorced', 'Widowed'],
    default: 'Single'
  },
  dependents: [{
    name: { type: String, required: true },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: true
    },
    dateOfBirth: { type: Date, required: true },
    relationship: {
      type: String,
      enum: ['Spouse', 'Child', 'Parent', 'Other'],
      required: true
    },
    photograph: String,
    identificationNumber: String,
    identificationType: {
      type: String,
      enum: ['Birth Certificate', 'ID Card', 'Passport']
    },
    documents: [{
      type: String,
      name: String,
      url: String,
      sharepointId: String,
      uploadedAt: { type: Date, default: Date.now },
      uploadedBy: String,
      status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
      },
      approvedBy: String,
      approvedAt: Date
    }],
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Pending'],
      default: 'Pending'
    },
    lastVerifiedAt: { type: Date, default: Date.now },
    verifiedBy: String,
    notes: String
  }],
  dependentEntitlements: {
    educationalAssistance: { type: Boolean, default: false },
    housingAllowance: { type: Boolean, default: false },
    leaveTransportation: { type: Boolean, default: false },
    childAllowance: { type: Boolean, default: false },
    lastUpdated: { type: Date, default: Date.now },
    updatedBy: String
  },
  dependentPolicy: {
    maxDependents: { type: Number, default: 5 },
    maxChildAge: { type: Number, default: 18 },
    eligibleRelationships: { type: [String], default: ['Spouse', 'Child'] },
    requiredDocuments: { type: [String], default: ['Birth Certificate', 'ID Card'] },
    lastUpdated: { type: Date, default: Date.now },
    updatedBy: String
  }
}, {
  timestamps: true
});

// Add middleware to validate dependent age
userSchema.pre('save', function(next) {
  if (this.isModified('dependents')) {
    const maxChildAge = this.dependentPolicy?.maxChildAge || 18;
    const today = new Date();
    
    this.dependents?.forEach(dependent => {
      if (dependent.relationship === 'Child') {
        const age = today.getFullYear() - new Date(dependent.dateOfBirth).getFullYear();
        if (age > maxChildAge) {
          dependent.status = 'Inactive';
        }
      }
    });
  }
  next();
});

// Add middleware for audit trail
userSchema.pre('save', function(next) {
  if (this.isModified()) {
    const changes = this.modifiedPaths();
    changes.forEach(field => {
      // Get the old value from the document's current state
      const oldValue = this.get(field);
      // Get the new value from the modified state
      const newValue = this.modifiedPaths().includes(field) ? this.get(field) : oldValue;
      
      // Only add to audit trail if values are different
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        // Initialize auditTrail if it doesn't exist using Mongoose's DocumentArray
        if (!this.auditTrail) {
          this.set('auditTrail', []);
        }
        
        // Create new audit trail entry
        const auditEntry = {
          field,
          oldValue,
          newValue,
          changedBy: this.get('updatedBy') || 'system',
          changedAt: new Date()
        };
        
        // Push to audit trail using Mongoose's DocumentArray methods
        this.auditTrail.push(auditEntry);
      }
    });
  }
  next();
});

// Add index for faster queries
userSchema.index({ 'dependents.status': 1 });
userSchema.index({ 'dependents.relationship': 1 });
userSchema.index({ maritalStatus: 1 });

export default mongoose.model<UserDocument>('User', userSchema); 