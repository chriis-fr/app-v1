import mongoose, { Schema, Document } from 'mongoose';

// Absence Types Schema
const absenceTypeSchema = new Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  category: {
    type: String,
    enum: ['SICKNESS', 'ANNUAL', 'STUDY', 'COMPASSIONATE', 'DEPENDENT', 'CAREER_BREAK', 'UNPAID', 'OTHER'],
    required: true
  },
  requiresApproval: { type: Boolean, default: true },
  requiresDocumentation: { type: Boolean, default: false },
  maxDuration: { type: Number }, // in days
  paid: { type: Boolean, default: true },
  description: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Sickness Types Schema
const sicknessTypeSchema = new Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  requiresMedicalCertificate: { type: Boolean, default: false },
  maxDuration: { type: Number }, // in days
  description: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Absence Record Schema
const absenceRecordSchema = new Schema({
  employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  type: { type: String, required: true },
  sicknessType: { type: String }, // Only for sickness absences
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  duration: { type: Number, required: true }, // in days
  hours: { type: Number }, // in hours
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'],
    default: 'PENDING'
  },
  reason: { type: String, required: true },
  documentation: [{
    type: { type: String, required: true },
    url: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now }
  }],
  approvedBy: { type: Schema.Types.ObjectId, ref: 'Employee' },
  approvedAt: { type: Date },
  notes: [{
    content: { type: String, required: true },
    addedBy: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    addedAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Leave Entitlement Schema
const leaveEntitlementSchema = new Schema({
  employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  year: { type: Number, required: true },
  type: { type: String, required: true },
  totalDays: { type: Number, required: true },
  usedDays: { type: Number, default: 0 },
  remainingDays: { type: Number, required: true },
  carriedOverDays: { type: Number, default: 0 },
  expiresAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Absence Policy Schema
const absencePolicySchema = new Schema({
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  name: { type: String, required: true },
  description: String,
  rules: [{
    grade: { type: String, required: true },
    serviceYears: { type: Number, required: true },
    annualLeaveDays: { type: Number, required: true },
    sickLeaveDays: { type: Number, required: true },
    studyLeaveDays: { type: Number, default: 0 },
    compassionateLeaveDays: { type: Number, default: 0 },
    dependentLeaveDays: { type: Number, default: 0 }
  }],
  triggers: [{
    type: { type: String, required: true },
    threshold: { type: Number, required: true },
    action: { type: String, required: true },
    notificationTemplate: { type: String, required: true }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Employee Schema
const employeeSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Organization'
  },
  employeeNumber: {
    type: String,
    required: true,
    unique: true
  },
  // Basic Information
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  shortName: String,
  dateOfBirth: Date,
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  // Family Information
  maritalStatus: {
    type: String,
    enum: ['single', 'married', 'divorced', 'widowed']
  },
  spouse: {
    name: String,
    occupation: String,
    contactNumber: String
  },
  children: [{
    name: String,
    dateOfBirth: Date,
    gender: String
  }],
  dependentPolicy: {
    maxDependents: { type: Number, default: 5 },
    maxChildAge: { type: Number, default: 18 },
    lastUpdated: { type: Date, default: Date.now },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  // Employment Information
  employmentDate: {
    type: Date,
    required: true
  },
  employmentGrade: String,
  position: String,
  designation: String,
  contractType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'temporary', 'intern']
  },
  contractExpiryDate: Date,
  department: String,
  division: String,
  workLocation: String,
  costCenter: String,
  employmentStatus: {
    type: String,
    enum: ['active', 'inactive', 'on_leave', 'terminated', 'suspended']
  },
  terminationDate: Date,
  terminationCause: String,
  // Contact Information
  addresses: [{
    type: {
      type: String,
      enum: ['current', 'permanent', 'emergency']
    },
    street: String,
    city: String,
    state: String,
    country: String,
    postalCode: String,
    isDefault: Boolean
  }],
  // Banking Information
  bankDetails: {
    bankName: String,
    branchName: String,
    accountNumber: String,
    accountType: String,
    currency: String
  },
  // Legal Documents
  documents: [{
    type: {
      type: String,
      enum: ['passport', 'visa', 'labor_card', 'driving_license', 'work_permit', 'other']
    },
    number: String,
    issueDate: Date,
    expiryDate: Date,
    issuingAuthority: String,
    documentUrl: String,
    isVerified: Boolean
  }],
  // Assets
  assets: [{
    type: String,
    serialNumber: String,
    issueDate: Date,
    returnDate: Date,
    status: {
      type: String,
      enum: ['assigned', 'returned', 'damaged', 'lost']
    }
  }],
  // Professional Information
  workExperience: [{
    company: String,
    position: String,
    startDate: Date,
    endDate: Date,
    description: String,
    isCurrent: Boolean
  }],
  competencies: [{
    category: String,
    skills: [String],
    proficiency: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert']
    }
  }],
  education: [{
    degree: String,
    institution: String,
    fieldOfStudy: String,
    startDate: Date,
    endDate: Date,
    grade: String,
    isVerified: Boolean
  }],
  languages: [{
    language: String,
    proficiency: {
      type: String,
      enum: ['basic', 'conversational', 'fluent', 'native']
    }
  }],
  // Pre-employment Checks
  preEmploymentChecks: {
    references: [{
      name: String,
      position: String,
      company: String,
      contactNumber: String,
      email: String,
      verificationStatus: {
        type: String,
        enum: ['pending', 'verified', 'failed']
      }
    }],
    medicalFitness: {
      status: {
        type: String,
        enum: ['pending', 'cleared', 'not_cleared']
      },
      expiryDate: Date,
      documentUrl: String
    },
    qualifications: [{
      type: String,
      verificationStatus: {
        type: String,
        enum: ['pending', 'verified', 'failed']
      },
      documentUrl: String
    }]
  },
  // Custom Fields
  customFields: [{
    fieldName: String,
    fieldValue: mongoose.Schema.Types.Mixed,
    fieldType: String
  }],
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  absenceHistory: [absenceRecordSchema],
  leaveEntitlements: [leaveEntitlementSchema],
  absenceNotes: [{
    content: { type: String, required: true },
    addedBy: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    addedAt: { type: Date, default: Date.now }
  }]
});

// Add indexes for common queries
employeeSchema.index({ employeeNumber: 1, organizationId: 1 });
employeeSchema.index({ firstName: 1, lastName: 1 });
employeeSchema.index({ department: 1 });
employeeSchema.index({ employmentStatus: 1 });

// Add middleware to update the updatedAt timestamp
employeeSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Attendance Schema
const attendanceSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Organization'
  },
  date: {
    type: Date,
    required: true
  },
  checkIn: Date,
  checkOut: Date,
  status: {
    type: String,
    enum: ['present', 'absent', 'half_day', 'leave'],
    default: 'present'
  },
  notes: String
});

// Payroll Schema
const payrollSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Organization'
  },
  period: {
    startDate: Date,
    endDate: Date
  },
  basicSalary: Number,
  deductions: [{
    type: String,
    amount: Number,
    description: String
  }],
  allowances: [{
    type: String,
    amount: Number,
    description: String
  }],
  netPay: Number,
  status: {
    type: String,
    enum: ['draft', 'approved', 'paid'],
    default: 'draft'
  },
  paidAt: Date,
  createdAt: Date,
  updatedAt: Date
});

// Check if the model already exists before compiling
export const Employee = mongoose.models.Employee || mongoose.model('Employee', employeeSchema);
export const Attendance = mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema);
export const Payroll = mongoose.models.Payroll || mongoose.model('Payroll', payrollSchema);
export const AbsenceType = mongoose.models.AbsenceType || mongoose.model('AbsenceType', absenceTypeSchema);
export const SicknessType = mongoose.models.SicknessType || mongoose.model('SicknessType', sicknessTypeSchema);
export const AbsenceRecord = mongoose.models.AbsenceRecord || mongoose.model('AbsenceRecord', absenceRecordSchema);
export const LeaveEntitlement = mongoose.models.LeaveEntitlement || mongoose.model('LeaveEntitlement', leaveEntitlementSchema);
export const AbsencePolicy = mongoose.models.AbsencePolicy || mongoose.model('AbsencePolicy', absencePolicySchema);

export interface ITermination extends Document {
  employeeId: string;
  reason: string;
  terminationDate: Date;
  status: 'pending' | 'approved' | 'completed' | 'rescinded';
  createdBy: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
  completedBy?: mongoose.Types.ObjectId;
  organizationId: string;
  documents: Array<{
    type: string;
    name: string;
    url: string;
    uploadedAt: Date;
  }>;
  exitInterviewId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IExitInterview extends Document {
  terminationId: mongoose.Types.ObjectId;
  employeeId: string;
  organizationId: string;
  date: Date;
  conductedBy: mongoose.Types.ObjectId;
  reasonForLeaving: string;
  destination: {
    type: string;
    details?: string;
  };
  feedback: Array<{
    category: string;
    rating: number;
    comments: string;
  }>;
  recommendations: string[];
  createdAt: Date;
  updatedAt: Date;
}

const terminationSchema = new Schema<ITermination>({
  employeeId: { type: String, required: true },
  reason: { type: String, required: true },
  terminationDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'completed', 'rescinded'],
    default: 'pending'
  },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  completedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  organizationId: { type: String, required: true },
  documents: [{
    type: { type: String, required: true },
    name: { type: String, required: true },
    url: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now }
  }],
  exitInterviewId: { type: Schema.Types.ObjectId, ref: 'ExitInterview' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const exitInterviewSchema = new Schema<IExitInterview>({
  terminationId: { type: Schema.Types.ObjectId, ref: 'Termination', required: true },
  employeeId: { type: String, required: true },
  organizationId: { type: String, required: true },
  date: { type: Date, required: true },
  conductedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  reasonForLeaving: { type: String, required: true },
  destination: {
    type: { type: String, required: true },
    details: String
  },
  feedback: [{
    category: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comments: { type: String, required: true }
  }],
  recommendations: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add indexes for better query performance
terminationSchema.index({ employeeId: 1, organizationId: 1 });
terminationSchema.index({ status: 1 });
exitInterviewSchema.index({ employeeId: 1, organizationId: 1 });
exitInterviewSchema.index({ terminationId: 1 });

export const Termination = mongoose.models.Termination || mongoose.model('Termination', terminationSchema);
export const ExitInterview = mongoose.models.ExitInterview || mongoose.model('ExitInterview', exitInterviewSchema); 