import mongoose, { Document } from 'mongoose';
import { OrganizationSettings } from '../types';

export interface OrganizationStructureDocument extends Document {
  _id: mongoose.Types.ObjectId;
  code: string;
  name: string;
  type: 'Unit' | 'Organization' | 'Position';
  parentId?: mongoose.Types.ObjectId;
  jobTitle: string;
  postType: 'Primary' | 'Secondary' | 'Acting' | 'Temporary';
  department: string;
  country: string;
  settings: OrganizationSettings;
  salaryGrade?: string;
  jobType?: 'Full-time' | 'Part-time' | 'Contract' | 'Temporary';
  jobLocation?: string;
  approvedGrade?: string;
  evaluationRank?: number;
  evaluationScore?: number;
  gradingScale?: {
    scale: string;
    minRate: number;
    maxRate: number;
    currency: string;
    effectiveDate: Date;
    endDate?: Date;
  };
  benefits?: {
    type: string;
    description: string;
    value: number;
    currency: string;
    frequency: 'Monthly' | 'Annual' | 'One-time';
  }[];
  competencies?: {
    category: string;
    name: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
    description: string;
    isRequired: boolean;
  }[];
  assignedEmployees: {
    employeeId: mongoose.Types.ObjectId;
    assignmentType: 'Primary' | 'Secondary' | 'Acting' | 'Temporary';
    startDate: Date;
    endDate?: Date;
    status: 'Active' | 'Inactive';
    isException: boolean;
    exceptionReason?: string;
    approvedBy?: string;
    approvedAt?: Date;
  }[];
  positionHistory?: {
    date: Date;
    action: 'Created' | 'Modified' | 'Deleted';
    changes: {
      field: string;
      oldValue: any;
      newValue: any;
    }[];
    modifiedBy: string;
  }[];
  jobSpecification?: {
    description: string;
    requirements: string[];
    responsibilities: string[];
    qualifications: string[];
    skills: string[];
    attachments?: {
      name: string;
      type: string;
      url: string;
      uploadedAt: Date;
      uploadedBy: string;
    }[];
  };
  customFields?: {
    [key: string]: any;
  };
  status: 'Active' | 'Vacant' | 'Inactive';
  category?: string[];
  isExecutive?: boolean;
  effectiveDate: Date;
  endDate?: Date;
  isForecasted: boolean;
  version: number;
  translations?: {
    [key: string]: {
      [language: string]: string;
    };
  };
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const organizationStructureSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ['Unit', 'Organization', 'Position'],
    required: true
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OrganizationStructure'
  },
  jobTitle: { type: String, required: true },
  postType: {
    type: String,
    enum: ['Primary', 'Secondary', 'Acting', 'Temporary'],
    default: 'Primary'
  },
  department: { type: String, required: true },
  country: { type: String, required: true },
  settings: {
    workingDays: [String],
    workingHours: {
      start: String,
      end: String
    },
    holidays: [{
      name: String,
      date: String
    }],
    customSettings: mongoose.Schema.Types.Mixed,
    accounting: {
      fiscalYearStart: String,
      fiscalYearEnd: String,
      taxYearStart: String,
      taxYearEnd: String,
      currency: String,
      taxRates: {
        type: Map,
        of: Number
      }
    }
  },
  salaryGrade: String,
  jobType: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Temporary']
  },
  jobLocation: String,
  approvedGrade: String,
  evaluationRank: Number,
  evaluationScore: Number,
  gradingScale: {
    scale: String,
    minRate: Number,
    maxRate: Number,
    currency: String,
    effectiveDate: Date,
    endDate: Date
  },
  benefits: [{
    type: String,
    description: String,
    value: Number,
    currency: String,
    frequency: {
      type: String,
      enum: ['Monthly', 'Annual', 'One-time']
    }
  }],
  competencies: [{
    category: String,
    name: String,
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert']
    },
    description: String,
    isRequired: Boolean
  }],
  assignedEmployees: [{
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    assignmentType: {
      type: String,
      enum: ['Primary', 'Secondary', 'Acting', 'Temporary'],
      default: 'Primary'
    },
    startDate: { type: Date, required: true },
    endDate: Date,
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active'
    },
    isException: { type: Boolean, default: false },
    exceptionReason: String,
    approvedBy: String,
    approvedAt: Date
  }],
  positionHistory: [{
    date: { type: Date, default: Date.now },
    action: {
      type: String,
      enum: ['Created', 'Modified', 'Deleted']
    },
    changes: [{
      field: String,
      oldValue: mongoose.Schema.Types.Mixed,
      newValue: mongoose.Schema.Types.Mixed
    }],
    modifiedBy: String
  }],
  jobSpecification: {
    description: String,
    requirements: [String],
    responsibilities: [String],
    qualifications: [String],
    skills: [String],
    attachments: [{
      name: String,
      type: String,
      url: String,
      uploadedAt: { type: Date, default: Date.now },
      uploadedBy: String
    }]
  },
  customFields: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  status: {
    type: String,
    enum: ['Active', 'Vacant', 'Inactive'],
    default: 'Active'
  },
  category: [String],
  isExecutive: Boolean,
  effectiveDate: { type: Date, default: Date.now },
  endDate: Date,
  isForecasted: { type: Boolean, default: false },
  version: { type: Number, default: 1 },
  translations: {
    type: Map,
    of: {
      type: Map,
      of: String
    }
  },
  createdBy: String,
  updatedBy: String
}, {
  timestamps: true
});

// Add indexes for common queries
organizationStructureSchema.index({ parentId: 1 });
organizationStructureSchema.index({ type: 1 });
organizationStructureSchema.index({ status: 1 });
organizationStructureSchema.index({ category: 1 });
organizationStructureSchema.index({ isExecutive: 1 });
organizationStructureSchema.index({ effectiveDate: 1 });
organizationStructureSchema.index({ isForecasted: 1 });
organizationStructureSchema.index({ 'assignedEmployees.employeeId': 1 });
organizationStructureSchema.index({ 'assignedEmployees.status': 1 });
organizationStructureSchema.index({ jobTitle: 1 });
organizationStructureSchema.index({ department: 1 });

// Add middleware to track position history
organizationStructureSchema.pre('save', function(next) {
  if (this.isModified()) {
    const changes = this.modifiedPaths()
      .filter(path => !path.startsWith('positionHistory'))
      .map(path => ({
        field: path,
        oldValue: this.get(path),
        newValue: this.modifiedPaths().includes(path) ? this.get(path) : this.get(path)
      }));

    if (changes.length > 0) {
      // Initialize positionHistory if it doesn't exist using Mongoose's DocumentArray
      if (!this.positionHistory) {
        this.set('positionHistory', []);
      }

      // Create new history entry
      const historyEntry = {
        date: new Date(),
        action: this.isNew ? 'Created' : 'Modified',
        changes,
        modifiedBy: this.get('updatedBy') || 'system'
      };

      // Push to position history using Mongoose's DocumentArray methods
      this.positionHistory.push(historyEntry);

      // Increment version number
      this.version += 1;
    }
  }
  next();
});

// Add middleware to handle multiple employee assignments
organizationStructureSchema.pre('save', function(next) {
  if (this.isModified('assignedEmployees')) {
    const newAssignments = this.get('assignedEmployees');
    const oldAssignments = this.modifiedPaths().includes('assignedEmployees') 
      ? this.get('assignedEmployees')
      : [];

    // Check for multiple primary assignments
    const primaryAssignments = newAssignments.filter(
      (assignment: any) => assignment.assignmentType === 'Primary' && assignment.status === 'Active'
    );

    if (primaryAssignments.length > 1) {
      // Mark all but the first primary assignment as exceptions
      primaryAssignments.slice(1).forEach((assignment: any) => {
        assignment.isException = true;
        assignment.exceptionReason = 'Multiple primary assignments detected';
      });
    }

    // Update status based on assignments
    if (newAssignments.length === 0) {
      this.status = 'Vacant';
    } else if (newAssignments.some((assignment: any) => assignment.status === 'Active')) {
      this.status = 'Active';
    }
  }
  next();
});

export default mongoose.model<OrganizationStructureDocument>('OrganizationStructure', organizationStructureSchema); 