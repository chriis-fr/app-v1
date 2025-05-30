import express from 'express';
import { isAuthenticated } from '../middleware/auth';
import { checkModuleAccess } from '../middleware/module-access';
import { AuthRequest, CountryConfig } from '../types';
import OrganizationStructure, { OrganizationStructureDocument } from '../models/OrganizationStructure';
import User from '../models/User';
import mongoose from 'mongoose';
import { getCountryConfig } from '../config/countries';

const router = express.Router();

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
    const employee = await User.findById(employeeId);
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
    const employee = await User.findById(employeeId);
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

// Update organization settings
router.put('/settings', isAuthenticated, async (req: AuthRequest, res) => {
  try {
    const { settings } = req.body;
    const organization = await OrganizationStructure.findById(req.user?.organizationId);

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // If country is being changed, update accounting settings
    if (settings.country && settings.country !== organization.country) {
      const countryConfig = getCountryConfig(settings.country);
      settings.accounting = {
        ...organization.settings?.accounting,
        fiscalYearStart: countryConfig.defaultSettings.accounting?.fiscalYearStart,
        fiscalYearEnd: countryConfig.defaultSettings.accounting?.fiscalYearEnd,
        taxYearStart: countryConfig.defaultSettings.accounting?.taxYearStart,
        taxYearEnd: countryConfig.defaultSettings.accounting?.taxYearEnd,
        currency: countryConfig.currency,
        taxRates: countryConfig.taxSystem?.rates || {},
        chartOfAccounts: organization.settings?.accounting?.chartOfAccounts || countryConfig.defaultSettings.accounting?.chartOfAccounts || []
      };
    }

    // Update organization settings
    organization.settings = {
      ...organization.settings,
      ...settings
    };

    await organization.save();

    res.json(organization);
  } catch (error) {
    console.error('Error updating organization settings:', error);
    res.status(500).json({ message: 'Error updating organization settings' });
  }
});

export default router; 