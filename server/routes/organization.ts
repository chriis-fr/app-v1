import express from 'express';
import { isAuthenticated } from '../middleware/auth';
import { checkModuleAccess } from '../middleware/module-access';
import { AuthRequest, CountryConfig } from '../types';
import OrganizationStructure, { OrganizationStructureDocument } from '../models/OrganizationStructure';
import { UserModel } from '../models/user.model';
import mongoose from 'mongoose';
import { getCountryConfig } from '../config/countries';
import { Business } from '../models/Business';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Middleware to check if user is admin
const isAdmin = (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
  next();
};

// Define interface for hierarchical structure
interface HierarchicalStructure extends Omit<OrganizationStructureDocument, 'toObject'> {
  children: HierarchicalStructure[];
  _id: mongoose.Types.ObjectId;
}

// Get organization structure
router.get('/structure', isAuthenticated, checkModuleAccess('hr'), async (req: AuthRequest, res) => {
  try {
    const { type, category, isExecutive, isForecasted, effectiveDate } = req.query;
    
    const query: any = {};
    if (type) query.type = type;
    if (category) query.category = category;
    if (isExecutive !== undefined) query.isExecutive = isExecutive;
    if (isForecasted !== undefined) query.isForecasted = isForecasted;
    if (effectiveDate) query.effectiveDate = { $lte: new Date(effectiveDate as string) };

    const structure = await OrganizationStructure.find(query)
      .populate('parentId', 'name code')
      .populate('employeeId', 'firstName lastName email')
      .sort({ code: 1 });

    res.json(structure);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching organization structure' });
  }
});

// Get organization structure by ID
router.get('/structure/:id', isAuthenticated, checkModuleAccess('hr'), async (req: AuthRequest, res) => {
  try {
    const structure = await OrganizationStructure.findById(req.params.id)
      .populate('parentId', 'name code')
      .populate('employeeId', 'firstName lastName email');

    if (!structure) {
      return res.status(404).json({ message: 'Organization structure not found' });
    }

    res.json(structure);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching organization structure' });
  }
});

// Create organization structure
router.post('/structure', isAuthenticated, checkModuleAccess('hr'), isAdmin, async (req: AuthRequest, res) => {
  try {
    const { country, ...rest } = req.body;
    
    // Get country configuration
    const countryConfig = getCountryConfig(country);
    
    // Create structure with country-specific settings
    const structure = new OrganizationStructure({
      ...rest,
      country,
      settings: countryConfig.defaultSettings,
      createdBy: req.user?.id,
      updatedBy: req.user?.id
    });

    await structure.save();
    res.status(201).json(structure);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Configuration not found')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error creating organization structure' });
  }
});

// Update organization structure
router.put('/structure/:id', isAuthenticated, checkModuleAccess('hr'), isAdmin, async (req: AuthRequest, res) => {
  try {
    const structure = await OrganizationStructure.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        updatedBy: req.user?.id
      },
      { new: true }
    );

    if (!structure) {
      return res.status(404).json({ message: 'Organization structure not found' });
    }

    res.json(structure);
  } catch (error) {
    res.status(500).json({ message: 'Error updating organization structure' });
  }
});

// Delete organization structure
router.delete('/structure/:id', isAuthenticated, checkModuleAccess('hr'), isAdmin, async (req: AuthRequest, res) => {
  try {
    const structure = await OrganizationStructure.findByIdAndDelete(req.params.id);

    if (!structure) {
      return res.status(404).json({ message: 'Organization structure not found' });
    }

    res.json({ message: 'Organization structure deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting organization structure' });
  }
});

// Assign employee to position
router.put('/structure/:id/assign', isAuthenticated, checkModuleAccess('hr'), isAdmin, async (req: AuthRequest, res) => {
  try {
    const { employeeId } = req.body;
    
    // Check if employee exists
    const employee = await UserModel.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const structure = await OrganizationStructure.findByIdAndUpdate(
      req.params.id,
      {
        employeeId,
        status: 'Active',
        updatedBy: req.user?.id
      },
      { new: true }
    );

    if (!structure) {
      return res.status(404).json({ message: 'Organization structure not found' });
    }

    res.json(structure);
  } catch (error) {
    res.status(500).json({ message: 'Error assigning employee' });
  }
});

// Upload job specification document
router.post('/structure/:id/specification/upload', isAuthenticated, checkModuleAccess('hr'), isAdmin, async (req: AuthRequest, res) => {
  try {
    const structure = await OrganizationStructure.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          'jobSpecification.attachments': {
            ...req.body,
            uploadedAt: new Date(),
            uploadedBy: req.user?.id
          }
        },
        updatedBy: req.user?.id
      },
      { new: true }
    );

    if (!structure) {
      return res.status(404).json({ message: 'Organization structure not found' });
    }

    res.json(structure);
  } catch (error) {
    res.status(500).json({ message: 'Error uploading document' });
  }
});

// Get organization chart
router.get('/chart', isAuthenticated, checkModuleAccess('hr'), async (req: AuthRequest, res) => {
  try {
    const { effectiveDate, isForecasted } = req.query;
    
    const query: any = {};
    if (effectiveDate) query.effectiveDate = { $lte: new Date(effectiveDate as string) };
    if (isForecasted !== undefined) query.isForecasted = isForecasted;

    const structure = await OrganizationStructure.find(query)
      .populate('parentId', 'name code')
      .populate('employeeId', 'firstName lastName email')
      .sort({ code: 1 });

    // Build hierarchical structure with proper type annotations
    const buildHierarchy = (
      items: OrganizationStructureDocument[],
      parentId: string | null = null
    ): HierarchicalStructure[] => {
      return items
        .filter(item => item.parentId?.toString() === parentId)
        .map(item => {
          const itemObj = item.toObject();
          return {
            ...itemObj,
            _id: item._id,
            children: buildHierarchy(items, item._id.toString())
          } as HierarchicalStructure;
        });
    };

    const hierarchy = buildHierarchy(structure);
    res.json(hierarchy);
  } catch (error) {
    res.status(500).json({ message: 'Error generating organization chart' });
  }
});

// Get vacant positions
router.get('/vacant-positions', isAuthenticated, checkModuleAccess('hr'), async (req: AuthRequest, res) => {
  try {
    const vacantPositions = await OrganizationStructure.find({
      status: 'Vacant',
      type: 'Position'
    })
      .populate('parentId', 'name code')
      .sort({ code: 1 });

    res.json(vacantPositions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching vacant positions' });
  }
});

// Get position history
router.get('/structure/:id/history', isAuthenticated, checkModuleAccess('hr'), async (req: AuthRequest, res) => {
  try {
    const structure = await OrganizationStructure.findById(req.params.id)
      .select('positionHistory');

    if (!structure) {
      return res.status(404).json({ message: 'Organization structure not found' });
    }

    res.json(structure.positionHistory || []);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching position history' });
  }
});

// Get positions by category
router.get('/positions/category/:category', isAuthenticated, checkModuleAccess('hr'), async (req: AuthRequest, res) => {
  try {
    const positions = await OrganizationStructure.find({
      type: 'Position',
      category: req.params.category
    })
      .populate('parentId', 'name code')
      .populate('employeeId', 'firstName lastName email')
      .sort({ code: 1 });

    res.json(positions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching positions by category' });
  }
});

// Add new routes for managing multiple employees and additional features
router.post('/structure/:id/assign-employee', isAuthenticated, checkModuleAccess('hr'), isAdmin, async (req: AuthRequest, res) => {
  try {
    const { employeeId, assignmentType, startDate, endDate, isException, exceptionReason } = req.body;
    
    // Check if employee exists
    const employee = await UserModel.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const structure = await OrganizationStructure.findById(req.params.id);
    if (!structure) {
      return res.status(404).json({ message: 'Organization structure not found' });
    }

    // Check for existing primary assignment if this is a primary assignment
    if (assignmentType === 'Primary') {
      const existingPrimary = structure.assignedEmployees.find(
        (assignment: any) => assignment.assignmentType === 'Primary' && assignment.status === 'Active'
      );
      if (existingPrimary) {
        return res.status(400).json({ 
          message: 'Position already has a primary employee. Please mark this as an exception if needed.' 
        });
      }
    }

    // Add new assignment
    structure.assignedEmployees.push({
      employeeId,
      assignmentType,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
      status: 'Active',
      isException: isException || false,
      exceptionReason,
      approvedBy: req.user?.id,
      approvedAt: new Date()
    });

    await structure.save();
    res.json(structure);
  } catch (error) {
    res.status(500).json({ message: 'Error assigning employee' });
  }
});

// Update employee assignment
router.put('/structure/:id/assignments/:assignmentId', isAuthenticated, checkModuleAccess('hr'), isAdmin, async (req: AuthRequest, res) => {
  try {
    const { status, endDate } = req.body;
    
    const structure = await OrganizationStructure.findById(req.params.id);
    if (!structure) {
      return res.status(404).json({ message: 'Organization structure not found' });
    }

    const assignment = structure.assignedEmployees.find(
      (assignment: any) => assignment._id.toString() === req.params.assignmentId
    );
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    assignment.status = status;
    if (endDate) {
      assignment.endDate = new Date(endDate);
    }

    await structure.save();
    res.json(structure);
  } catch (error) {
    res.status(500).json({ message: 'Error updating assignment' });
  }
});

// Update grading scale
router.put('/structure/:id/grading-scale', isAuthenticated, checkModuleAccess('hr'), isAdmin, async (req: AuthRequest, res) => {
  try {
    const { scale, minRate, maxRate, currency, effectiveDate, endDate } = req.body;
    
    const structure = await OrganizationStructure.findByIdAndUpdate(
      req.params.id,
      {
        gradingScale: {
          scale,
          minRate,
          maxRate,
          currency,
          effectiveDate: new Date(effectiveDate),
          endDate: endDate ? new Date(endDate) : undefined
        },
        updatedBy: req.user?.id
      },
      { new: true }
    );

    if (!structure) {
      return res.status(404).json({ message: 'Organization structure not found' });
    }

    res.json(structure);
  } catch (error) {
    res.status(500).json({ message: 'Error updating grading scale' });
  }
});

// Update benefits
router.put('/structure/:id/benefits', isAuthenticated, checkModuleAccess('hr'), isAdmin, async (req: AuthRequest, res) => {
  try {
    const structure = await OrganizationStructure.findByIdAndUpdate(
      req.params.id,
      {
        benefits: req.body.benefits,
        updatedBy: req.user?.id
      },
      { new: true }
    );

    if (!structure) {
      return res.status(404).json({ message: 'Organization structure not found' });
    }

    res.json(structure);
  } catch (error) {
    res.status(500).json({ message: 'Error updating benefits' });
  }
});

// Update competencies
router.put('/structure/:id/competencies', isAuthenticated, checkModuleAccess('hr'), isAdmin, async (req: AuthRequest, res) => {
  try {
    const structure = await OrganizationStructure.findByIdAndUpdate(
      req.params.id,
      {
        competencies: req.body.competencies,
        updatedBy: req.user?.id
      },
      { new: true }
    );

    if (!structure) {
      return res.status(404).json({ message: 'Organization structure not found' });
    }

    res.json(structure);
  } catch (error) {
    res.status(500).json({ message: 'Error updating competencies' });
  }
});

// Update translations
router.put('/structure/:id/translations', isAuthenticated, checkModuleAccess('hr'), isAdmin, async (req: AuthRequest, res) => {
  try {
    const structure = await OrganizationStructure.findByIdAndUpdate(
      req.params.id,
      {
        translations: req.body.translations,
        updatedBy: req.user?.id
      },
      { new: true }
    );

    if (!structure) {
      return res.status(404).json({ message: 'Organization structure not found' });
    }

    res.json(structure);
  } catch (error) {
    res.status(500).json({ message: 'Error updating translations' });
  }
});

// Get position by title
router.get('/positions/title/:title', isAuthenticated, checkModuleAccess('hr'), async (req: AuthRequest, res) => {
  try {
    const positions = await OrganizationStructure.find({
      type: 'Position',
      jobTitle: req.params.title
    })
      .populate('parentId', 'name code')
      .populate('assignedEmployees.employeeId', 'firstName lastName email')
      .sort({ code: 1 });

    res.json(positions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching positions by title' });
  }
});

// Get positions by department
router.get('/positions/department/:department', isAuthenticated, checkModuleAccess('hr'), async (req: AuthRequest, res) => {
  try {
    const positions = await OrganizationStructure.find({
      type: 'Position',
      department: req.params.department
    })
      .populate('parentId', 'name code')
      .populate('assignedEmployees.employeeId', 'firstName lastName email')
      .sort({ code: 1 });

    res.json(positions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching positions by department' });
  }
});

// Get positions with multiple employees
router.get('/positions/multiple-employees', isAuthenticated, checkModuleAccess('hr'), async (req: AuthRequest, res) => {
  try {
    const positions = await OrganizationStructure.find({
      type: 'Position',
      'assignedEmployees.1': { $exists: true }
    })
      .populate('parentId', 'name code')
      .populate('assignedEmployees.employeeId', 'firstName lastName email')
      .sort({ code: 1 });

    res.json(positions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching positions with multiple employees' });
  }
});

// Get positions by evaluation score range
router.get('/positions/evaluation-score', isAuthenticated, checkModuleAccess('hr'), async (req: AuthRequest, res) => {
  try {
    const { minScore, maxScore } = req.query;
    
    const query: any = {
      type: 'Position',
      evaluationScore: {}
    };

    if (minScore) query.evaluationScore.$gte = Number(minScore);
    if (maxScore) query.evaluationScore.$lte = Number(maxScore);

    const positions = await OrganizationStructure.find(query)
      .populate('parentId', 'name code')
      .populate('assignedEmployees.employeeId', 'firstName lastName email')
      .sort({ evaluationScore: 1 });

    res.json(positions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching positions by evaluation score' });
  }
});

// Get organization settings
router.get('/settings', isAuthenticated, async (req, res) => {
  try {
    const user = (req as any).user;
    
    if (!user || !user.organizationId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const organization = await prisma.organization.findUnique({
      where: { id: user.organizationId }
    });

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    console.log('Current organization settings type:', typeof organization.settings);
    console.log('Current organization settings:', organization.settings);
    
    // Return settings as proper JSON object
    res.json(organization.settings || {});
  } catch (error) {
    console.error('Error fetching organization settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update organization settings
router.put('/settings', isAuthenticated, async (req, res) => {
  try {
    console.log('Organization settings update request received');
    const { settings } = req.body;
    console.log('Settings data type:', typeof settings);
    console.log('Settings data:', settings);
    
    // Get the user from the request
    const user = (req as any).user;
    console.log('User from request:', user);
    console.log('User organizationId:', user?.organizationId);
    console.log('User isOwner:', user?.isOwner);

    if (!user) {
      console.log('Unauthorized - no user');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // For owners, allow them to update their organization settings
    if (user.isOwner && user.organizationId) {
      console.log('Owner updating organization with ID:', user.organizationId);
      
      // Ensure settings is a proper JSON object, not a string
      let settingsToSave = settings;
      if (typeof settings === 'string') {
        try {
          settingsToSave = JSON.parse(settings);
          console.log('Parsed settings from string:', settingsToSave);
        } catch (e) {
          console.error('Failed to parse settings string:', e);
          return res.status(400).json({ error: 'Invalid settings format' });
        }
      }
      
      // Validate that settings is an object
      if (typeof settingsToSave !== 'object' || settingsToSave === null) {
        console.error('Settings is not a valid object:', typeof settingsToSave);
        return res.status(400).json({ error: 'Settings must be a valid object' });
      }
      
      console.log('Final settings to save:', JSON.stringify(settingsToSave, null, 2));
      
      // Update the organization settings in Prisma
      const updatedOrganization = await prisma.organization.update({
        where: { id: user.organizationId },
        data: {
          settings: settingsToSave // Store as proper JSON object
        }
      });
      
      console.log('Organization updated successfully');
      console.log('Updated organization settings:', updatedOrganization.settings);
      res.json(updatedOrganization);
    } else {
      console.log('User is not owner or missing organizationId');
      return res.status(403).json({ error: 'Access denied. Owner privileges required.' });
    }
  } catch (error) {
    console.error('Error updating organization settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Fix corrupted organization settings
router.post('/settings/fix', isAuthenticated, async (req, res) => {
  try {
    const user = (req as any).user;
    
    if (!user || !user.organizationId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!user.isOwner) {
      return res.status(403).json({ error: 'Access denied. Owner privileges required.' });
    }

    const organization = await prisma.organization.findUnique({
      where: { id: user.organizationId }
    });

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    console.log('Current settings before fix:', organization.settings);
    
    // Create default settings structure
    const defaultSettings = {
      theme: {
        primaryColor: '#282881',
        secondaryColor: '#ffffff',
        darkMode: false,
        fontFamily: 'Inter',
        borderRadius: '0.5rem',
        spacing: '1rem'
      },
      branding: {
        logo: null,
        favicon: null,
        companyName: organization.name || 'Your Company',
        tagline: '',
        website: '',
        email: '',
        phone: '',
        address: '',
        socialMedia: {
          facebook: '',
          twitter: '',
          linkedin: '',
          instagram: ''
        }
      },
      modules: {
        enabled: organization.activeModules || ['accounting'],
        defaultModule: 'accounting'
      },
      notifications: {
        email: true,
        push: true,
        sms: false
      },
      security: {
        twoFactorAuth: false,
        sessionTimeout: 30,
        passwordPolicy: {
          minLength: 8,
          requireSpecialChars: true,
          requireNumbers: true
        }
      },
      integrations: {
        paymentGateways: [],
        emailService: '',
        smsService: ''
      },
      backup: {
        frequency: 'daily',
        retention: 30,
        autoBackup: true
      },
      workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      workingHours: {
        start: '09:00',
        end: '17:00'
      },
      holidays: [],
      ai: {
        isEnabled: true,
        allowPersonalAI: true,
        allowOrganizationAI: true,
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        maxTokens: 1000,
        moduleSettings: {
          hr: {
            enabled: true,
            canAccessEmployeeData: true,
            canAccessPayrollData: true,
            canAccessHiringData: true,
            canAccessPerformanceData: true
          },
          finance: {
            enabled: true,
            canAccessFinancialData: true,
            canAccessAccountingData: true,
            canAccessBudgetData: true,
            canAccessTaxData: true
          },
          inventory: {
            enabled: true,
            canAccessStockData: true,
            canAccessWarehouseData: true,
            canAccessSupplyChainData: true
          },
          sales: {
            enabled: true,
            canAccessCustomerData: true,
            canAccessSalesData: true,
            canAccessCRMData: true
          },
          general: {
            enabled: true,
            canAccessGeneralData: true,
            canAccessAnalyticsData: true
          }
        }
      }
    };

    // Update the organization with proper settings
    const updatedOrganization = await prisma.organization.update({
      where: { id: user.organizationId },
      data: {
        settings: defaultSettings
      }
    });

    console.log('Settings fixed successfully');
    res.json({ 
      message: 'Settings fixed successfully',
      settings: updatedOrganization.settings 
    });
  } catch (error) {
    console.error('Error fixing organization settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get organization by ID
router.get('/:id', isAuthenticated, async (req: AuthRequest, res) => {
  try {
    const org = await Business.findById(req.params.id);
    if (!org) {
      return res.status(404).json({ message: 'Organization not found' });
    }
    res.json(org);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching organization' });
  }
});

// Get custom field definitions for a module
router.get('/custom-fields/:module', isAuthenticated, async (req: AuthRequest, res) => {
  try {
    const orgId = req.user?.organizationId;
    if (!orgId) return res.status(401).json({ message: 'No organization found' });
    const org = await Business.findOne({ _id: orgId });
    if (!org) return res.status(404).json({ message: 'Organization not found' });
    const module = req.params.module;
    const customFields = org.settings?.customFields?.[module] || [];
    res.json(customFields);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching custom fields' });
  }
});

// Set custom field definitions for a module
router.post('/custom-fields/:module', isAuthenticated, isAdmin, async (req: AuthRequest, res) => {
  try {
    const orgId = req.user?.organizationId;
    if (!orgId) return res.status(401).json({ message: 'No organization found' });
    const org = await Business.findOne({ _id: orgId });
    if (!org) return res.status(404).json({ message: 'Organization not found' });
    const module = req.params.module;
    const customFields = req.body.customFields || [];
    if (!org.settings) org.settings = {
      customFields: {},
      currency: 'USD',
      theme: 'light',
      timezone: 'UTC',
      modules: [] as any,
      notifications: { email: false, slack: false, webhook: '' }
    };
    org.settings = org.settings as NonNullable<typeof org.settings>;
    if (!org.settings.customFields) org.settings.customFields = {};
    org.settings.customFields[module] = customFields;
    await org.save();
    res.json({ success: true, customFields });
  } catch (error) {
    res.status(500).json({ message: 'Error saving custom fields' });
  }
});

// Organization Roles Routes
router.get('/roles', async (_req, res) => {
  try {
    // Mock organization roles data for testing
    const roles = [
      {
        id: '1',
        name: 'Admin',
        description: 'Full access to all features',
        permissions: ['all'],
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        name: 'Manager',
        description: 'Access to most features except sensitive data',
        permissions: ['dashboard', 'order_management', 'inventory', 'hr'],
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3',
        name: 'Employee',
        description: 'Basic access to required features',
        permissions: ['dashboard', 'order_management'],
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    res.json(roles);
  } catch (error) {
    console.error('Error fetching organization roles:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/roles', async (req, res) => {
  try {
    const roleData = req.body;
    
    // Mock role creation response
    const role = {
      id: Math.random().toString(36).substring(7),
      ...roleData,
      isSystem: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    res.status(201).json(role);
  } catch (error) {
    console.error('Error creating organization role:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/roles/:roleId', async (req, res) => {
  try {
    const roleId = req.params.roleId;
    const roleData = req.body;
    
    // Mock role update response
    const role = {
      id: roleId,
      ...roleData,
      isSystem: false,
      updatedAt: new Date()
    };
    
    res.json(role);
  } catch (error) {
    console.error('Error updating organization role:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 