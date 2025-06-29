import express, { Request, Response } from 'express';
import { UserModel } from '../../models/user.model';
import prisma from '../../prisma';
import { Document, Types } from 'mongoose';
import mongoose from 'mongoose';
import { Employee } from '../../mongodb/models';

interface SkillMatch {
  name: string;
  level: number;
  relevance: number;
}

interface MongooseUser {
  firstName: string;
  lastName: string;
  skills?: string[];
  experienceYears?: number;
  credentials?: Array<{
    id: string;
    blockchainHash?: string;
    verified: boolean;
  }>;
}

interface UserDocument extends Document, MongooseUser {
  _id: Types.ObjectId;
}

// Add compensation interface
interface Compensation {
  baseSalary: number;
  bonus: number;
  stockOptions: number;
  currency: string;
}

const router = express.Router();

// Skill matching endpoint
router.post('/skill-matches', async (req: Request, res: Response) => {
  try {
    const { skills, experience } = req.body;

    // Get all users with their skills
    const users = await UserModel.find({
      'skills': { $exists: true, $ne: [] }
    });

    // Calculate match scores for each user
    const matches = await Promise.all(users.map(async (user: UserDocument) => {
      const userSkills = user.skills || [];
      
      // Calculate skill match score
      const skillMatches = skills.map((requiredSkill: string) => {
        const hasSkill = userSkills.includes(requiredSkill);
        if (!hasSkill) return { name: requiredSkill, level: 0, relevance: 0 };
        
        // Calculate relevance based on experience
        const relevance = (user.experienceYears || 0) / experience;
        return {
          name: requiredSkill,
          level: 1, // Since we don't have skill levels in the model, default to 1
          relevance: Math.min(relevance, 1)
        };
      });

      // Calculate overall match score
      const matchScore = skillMatches.reduce((sum: number, skill: { relevance: number }) => sum + skill.relevance, 0) / skills.length;

      return {
        employeeId: user._id.toString(),
        name: `${user.firstName} ${user.lastName}`,
        matchScore,
        skills: skillMatches
      };
    }));

    // Sort by match score
    matches.sort((a: { matchScore: number }, b: { matchScore: number }) => b.matchScore - a.matchScore);

    res.json(matches);
  } catch (error) {
    console.error('Error in skill matching:', error);
    res.status(500).json({ message: 'Error matching skills' });
  }
});

// Blockchain credential verification endpoint
router.post('/verify-credential', async (req: Request, res: Response) => {
  try {
    const { credentialId, userId } = req.body;

    // TODO: Implement actual blockchain verification
    // For now, we'll simulate the verification process
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Simulate blockchain verification delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate a mock blockchain hash
    const blockchainHash = `0x${Math.random().toString(16).slice(2)}`;

    // Update the credential in the database
    await UserModel.updateOne(
      { _id: userId, 'credentials.id': credentialId },
      {
        $set: {
          'credentials.$.blockchainHash': blockchainHash,
          'credentials.$.verified': true
        }
      }
    );

    res.json({
      success: true,
      blockchainHash
    });
  } catch (error) {
    console.error('Error verifying credential:', error);
    res.status(500).json({ message: 'Error verifying credential' });
  }
});

// Add compensation update endpoint
router.put('/:id/compensation', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { compensation } = req.body;

    // Validate compensation data
    if (!compensation || typeof compensation !== 'object') {
      return res.status(400).json({ error: 'Invalid compensation data' });
    }

    const { baseSalary, bonus, stockOptions, currency } = compensation as Compensation;
    
    if (typeof baseSalary !== 'number' || baseSalary < 0) {
      return res.status(400).json({ error: 'Invalid base salary' });
    }
    if (typeof bonus !== 'number' || bonus < 0) {
      return res.status(400).json({ error: 'Invalid bonus' });
    }
    if (typeof stockOptions !== 'number' || stockOptions < 0) {
      return res.status(400).json({ error: 'Invalid stock options' });
    }
    if (typeof currency !== 'string' || !['USD', 'EUR', 'GBP'].includes(currency)) {
      return res.status(400).json({ error: 'Invalid currency' });
    }

    // Update user's compensation
    const updatedUser = await UserModel.findByIdAndUpdate(
      id,
      { compensation },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating compensation:', error);
    res.status(500).json({ error: 'Failed to update compensation' });
  }
});

// When fetching users for HR, exclude owners
router.get('/employees', async (req: Request, res: Response) => {
  console.log('Fetching employees----------------------------------');
  try {
    // Exclude owners from employee list and filter by organizationId
    const orgId = req.user?.organizationId;
    if (!orgId) {
      return res.status(401).json({ message: 'No organization context' });
    }

    // Fetch employees with login access from User collection
    const usersWithLogin = await UserModel.find({ 
      role: { $ne: 'owner' }, 
      organizationId: orgId 
    });

    // Fetch basic employees from Employee collection
    const basicEmployees = await Employee.find({ organizationId: orgId });

    // Format users with login access (they have login credentials)
    const formattedUsersWithLogin = usersWithLogin.map(user => ({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      department: user.department,
      position: user.position,
      role: user.role,
      status: user.status || 'active',
      isActive: (user as any).isActive ?? true,
      canLogin: (user as any).canLogin ?? true,
      username: user.username,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }));

    // Format basic employees to match user structure
    const formattedBasicEmployees = basicEmployees.map(emp => ({
      _id: emp._id,
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.email,
      department: emp.department,
      position: emp.position,
      role: 'employee', // Default role for basic employees
      status: emp.status || 'active',
      isActive: emp.status === 'active',
      canLogin: (emp as any).canLogin ?? false,
      employeeId: emp.employeeId,
      startDate: emp.startDate,
      salary: emp.salary,
      phone: emp.phone,
      documents: emp.documents,
      createdAt: emp.createdAt,
      updatedAt: emp.updatedAt
    }));

    // Combine both arrays
    const allEmployees = [...formattedUsersWithLogin, ...formattedBasicEmployees];

    console.log(`Found ${usersWithLogin.length} users with login and ${basicEmployees.length} basic employees`);
    res.json(allEmployees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: 'Error fetching employees' });
  }
});

// When creating a new user/employee, allow canLogin to be set (default false for non-login roles)
router.post('/employees', async (req: Request, res: Response) => {
  try {
    console.log('HR router: Creating employee with data:', req.body);
    
    // Validate required fields
    if (!req.body.firstName || !req.body.lastName || !req.body.department || !req.body.organizationId) {
      return res.status(400).json({ 
        message: 'Missing required fields: firstName, lastName, department, organizationId' 
      });
    }

    // For basic employees, position can be custom or from department positions
    const position = req.body.position || req.body.customPosition;
    if (!position) {
      return res.status(400).json({ message: 'Position is required' });
    }

    const canLogin = req.body.canLogin ?? false;

    if (canLogin) {
      // Create user account for employees who need login
      const userData = {
        ...req.body,
        position: position,
        role: req.body.role || 'employee',
        isActive: true,
        status: 'active'
      };

      console.log('HR router: Creating user account:', userData);

      const user = new UserModel(userData);
      await user.save();
      
      console.log('HR router: User account created successfully:', user._id);
      res.status(201).json(user);
    } else {
      // Create employee record for basic employees (no login)
      
      // Convert organizationId to ObjectId
      const organizationId = new mongoose.Types.ObjectId(req.body.organizationId);
      
      // Generate employee number and employeeId
      const employeeCount = await Employee.countDocuments({ organizationId });
      const employeeNumber = `EMP${String(employeeCount + 1).padStart(3, '0')}`;
      const employeeId = `EMP${String(employeeCount + 1).padStart(6, '0')}`;

      const employeeData = {
        organizationId,
        employeeId,
        employeeNumber,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: `${req.body.firstName.toLowerCase()}.${req.body.lastName.toLowerCase()}@company.com`, // Generate a default email
        department: req.body.department,
        position: position,
        employmentDate: new Date(),
        employmentStatus: 'active',
        canLogin: false,
        role: req.body.role || 'employee',
        contractType: req.body.employmentType,
        employmentGrade: req.body.employmentGrade,
        // Additional fields that might be expected
        isActive: true,
        status: 'active',
        lastLogin: null,
        createdBy: req.user?.id,
        updatedBy: req.user?.id
      };

      console.log('HR router: Creating employee record:', employeeData);

      const employee = await Employee.create(employeeData);
      
      console.log('HR router: Employee record created successfully:', employee._id);
      res.status(201).json(employee);
    }
  } catch (error: any) {
    console.error('HR router: Error creating employee:', error);
    console.error('HR router: Error details:', {
      name: error.name,
      message: error.message,
      code: error.code
    });
    res.status(500).json({ 
      message: 'Error creating employee',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// When updating an employee, allow canLogin to be updated
router.put('/employees/:id', async (req: Request, res: Response) => {
  try {
    const user = await UserModel.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating employee' });
  }
});

export default router; 