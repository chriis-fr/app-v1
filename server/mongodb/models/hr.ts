import mongoose from 'mongoose';

// Employee Schema
const employeeSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Organization'
  },
  employeeId: {
    type: String,
    required: true
  },
  firstName: String,
  lastName: String,
  email: {
    type: String,
    required: true
  },
  phone: String,
  department: String,
  position: String,
  startDate: Date,
  salary: {
    amount: Number,
    currency: String
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'on_leave', 'terminated'],
    default: 'active'
  },
  documents: [{
    type: String,
    documentType: String,
    url: String,
    uploadedAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
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