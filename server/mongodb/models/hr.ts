import mongoose from 'mongoose';

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
  }
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

export const Employee = mongoose.model('Employee', employeeSchema);
export const Attendance = mongoose.model('Attendance', attendanceSchema);
export const Payroll = mongoose.model('Payroll', payrollSchema); 