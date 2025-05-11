import mongoose from 'mongoose';
import { connectDB } from '../db.js';
import { userRoles, departments } from '@shared/schema';

// Define the User schema with all fields
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: userRoles, required: true },
  department: { type: String, enum: departments },
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String },
  organizationId: { type: mongoose.Schema.Types.ObjectId, required: true },
  isOwner: { type: Boolean, default: false },
  status: { type: String, enum: ['active', 'inactive', 'on_leave', 'terminated'], default: 'active' },
  lastLogin: { type: Date },
  employeeId: { type: String },
  hireDate: { type: Date },
  managerId: { type: mongoose.Schema.Types.ObjectId },
  team: { type: String },
  position: { type: String },
  location: {
    office: { type: String },
    floor: { type: String },
    deskNumber: { type: String }
  },
  workSchedule: {
    startTime: { type: String },
    endTime: { type: String },
    timezone: { type: String }
  },
  emergencyContact: {
    name: { type: String },
    relationship: { type: String },
    phone: { type: String }
  },
  skills: [{ type: String }],
  certifications: [{ type: String }],
  education: [{
    degree: { type: String },
    institution: { type: String },
    graduationYear: { type: String }
  }],
  performance: {
    lastReviewDate: { type: Date },
    nextReviewDate: { type: Date },
    rating: { type: Number }
  },
  compensation: {
    baseSalary: { type: Number, default: 0 },
    bonus: { type: Number, default: 0 },
    stockOptions: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' }
  },
  benefits: {
    healthInsurance: { type: Boolean, default: false },
    dentalInsurance: { type: Boolean, default: false },
    visionInsurance: { type: Boolean, default: false },
    retirementPlan: { type: Boolean, default: false },
    lifeInsurance: { type: Boolean, default: false }
  },
  equipment: {
    laptop: { type: String },
    monitor: { type: String },
    phone: { type: String },
    accessories: [{ type: String }]
  },
  accessLevels: {
    systems: [{ type: String }],
    buildings: [{ type: String }],
    rooms: [{ type: String }]
  },
  documents: [{
    id: { type: String },
    type: { type: String },
    url: { type: String },
    expiryDate: { type: Date }
  }],
  wallet: {
    balance: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },
    bankAccounts: [{
      id: { type: String },
      bankName: { type: String },
      accountNumber: { type: String },
      accountType: { type: String },
      isDefault: { type: Boolean, default: false }
    }]
  },
  legalDetails: {
    taxId: { type: String },
    businessType: { type: String },
    registrationNumber: { type: String },
    incorporationDate: { type: Date }
  },
  address: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    postalCode: { type: String },
    isBillingAddress: { type: Boolean, default: false },
    isShippingAddress: { type: Boolean, default: false }
  },
  credentials: [{
    id: { type: String },
    type: { type: String, enum: ['education', 'certification', 'experience'] },
    title: { type: String },
    issuer: { type: String },
    date: { type: Date },
    verified: { type: Boolean, default: false },
    blockchainHash: { type: String }
  }],
  permissions: [{
    module: { type: String },
    actions: [{ type: String }]
  }],
  moduleAccess: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { collection: 'users' });

const User = mongoose.model('User', userSchema);

async function migrateUsers() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Get all users
    const users = await User.find({});
    console.log(`Found ${users.length} users to migrate`);

    // Update each user
    for (const user of users) {
      const updates: any = {};

      // Add missing fields with default values
      if (!user.status) updates.status = 'active';
      if (!user.lastLogin) updates.lastLogin = null;
      if (!user.employeeId) updates.employeeId = null;
      if (!user.hireDate) updates.hireDate = null;
      if (!user.managerId) updates.managerId = null;
      if (!user.team) updates.team = null;
      if (!user.position) updates.position = null;
      if (!user.location) updates.location = { office: null, floor: null, deskNumber: null };
      if (!user.workSchedule) updates.workSchedule = { startTime: null, endTime: null, timezone: null };
      if (!user.emergencyContact) updates.emergencyContact = { name: null, relationship: null, phone: null };
      if (!user.skills) updates.skills = [];
      if (!user.certifications) updates.certifications = [];
      if (!user.education) updates.education = [];
      if (!user.performance) updates.performance = { lastReviewDate: null, nextReviewDate: null, rating: null };
      if (!user.compensation) updates.compensation = { baseSalary: 0, bonus: 0, stockOptions: 0, currency: 'USD' };
      if (!user.benefits) updates.benefits = { healthInsurance: false, dentalInsurance: false, visionInsurance: false, retirementPlan: false, lifeInsurance: false };
      if (!user.equipment) updates.equipment = { laptop: null, monitor: null, phone: null, accessories: [] };
      if (!user.accessLevels) updates.accessLevels = { systems: [], buildings: [], rooms: [] };
      if (!user.documents) updates.documents = [];
      if (!user.wallet) updates.wallet = { balance: 0, currency: 'USD', bankAccounts: [] };
      if (!user.legalDetails) updates.legalDetails = { taxId: null, businessType: null, registrationNumber: null, incorporationDate: null };
      if (!user.address) updates.address = { street: null, city: null, state: null, country: null, postalCode: null, isBillingAddress: false, isShippingAddress: false };
      if (!user.credentials) updates.credentials = [];
      if (!user.permissions) updates.permissions = [];

      // Set module access based on role and department
      if (!user.moduleAccess) {
        updates.moduleAccess = [];
        if (user.department?.toLowerCase() === 'hr') {
          updates.moduleAccess.push('hr');
        }
        if (user.isOwner) {
          updates.moduleAccess = ['dashboard', 'hr', 'inventory', 'pos', 'finance', 'blockchain', 'accounting', 'manufacturing', 'warehouse', 'procurement', 'logistics', 'crm', 'projects', 'tasks', 'calendar', 'reports', 'analytics', 'audit', 'compliance', 'real-estate', 'security', 'workflow'];
        }
      }

      // Update user if there are any changes
      if (Object.keys(updates).length > 0) {
        await User.findByIdAndUpdate(user._id, { $set: updates });
        console.log(`Updated user ${user.username} with missing fields`);
      }
    }

    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
}

migrateUsers(); 