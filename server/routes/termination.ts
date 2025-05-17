import express, { Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { checkModuleAccess } from '../middleware/module-access';
import { TerminationService } from '../services/termination.service';

const router = express.Router();

// Initiate termination process
router.post('/', authenticateToken, checkModuleAccess('hr'), async (req: Request, res: Response) => {
  try {
    if (!req.user?.id || !req.user?.organizationId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const termination = await TerminationService.initiateTermination({
      ...req.body,
      createdBy: req.user.id,
      organizationId: req.user.organizationId
    });
    res.status(201).json(termination);
  } catch (error) {
    res.status(500).json({ message: 'Error initiating termination process' });
  }
});

// Approve termination
router.put('/:id/approve', authenticateToken, checkModuleAccess('hr'), async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const termination = await TerminationService.approveTermination(
      req.params.id,
      req.user.id
    );
    res.json(termination);
  } catch (error) {
    res.status(500).json({ message: 'Error approving termination' });
  }
});

// Complete termination process
router.put('/:id/complete', authenticateToken, checkModuleAccess('hr'), async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const termination = await TerminationService.completeTermination(
      req.params.id,
      req.user.id
    );
    res.json(termination);
  } catch (error) {
    res.status(500).json({ message: 'Error completing termination process' });
  }
});

// Rescind termination
router.put('/:id/rescind', authenticateToken, checkModuleAccess('hr'), async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const termination = await TerminationService.rescindTermination(
      req.params.id,
      req.user.id
    );
    res.json(termination);
  } catch (error) {
    res.status(500).json({ message: 'Error rescinding termination' });
  }
});

// Conduct exit interview
router.post('/:id/exit-interview', authenticateToken, checkModuleAccess('hr'), async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const exitInterview = await TerminationService.conductExitInterview({
      ...req.body,
      terminationId: req.params.id,
      conductedBy: req.user.id
    });
    res.status(201).json(exitInterview);
  } catch (error) {
    res.status(500).json({ message: 'Error conducting exit interview' });
  }
});

// Get termination history for an employee
router.get('/employee/:employeeId', authenticateToken, checkModuleAccess('hr'), async (req: Request, res: Response) => {
  try {
    const history = await TerminationService.getTerminationHistory(req.params.employeeId);
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching termination history' });
  }
});

// Get pending terminations
router.get('/pending', authenticateToken, checkModuleAccess('hr'), async (req: Request, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const pending = await TerminationService.getPendingTerminations(req.user.organizationId);
    res.json(pending);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pending terminations' });
  }
});

// Get termination analytics
router.get('/analytics', authenticateToken, checkModuleAccess('hr'), async (req: Request, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const analytics = await TerminationService.getTerminationAnalytics(req.user.organizationId);
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching termination analytics' });
  }
});

export default router; 