import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { Termination, ExitInterview } from '../mongodb/models/hr';
import User from '../models/User';
import { sendTerminationNotification, sendTerminationApprovalNotification, sendTerminationCompletionNotification, sendTerminationRescindNotification } from '../utils/email';

// Create a new termination record
export const createTermination = async (req: Request, res: Response) => {
  try {
    const {
      employeeId,
      reason,
      terminationDate,
      documents
    } = req.body;

    const user = req.user as any;
    if (!user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const employee = await User.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const termination = new Termination({
      employeeId,
      reason,
      terminationDate,
      documents,
      createdBy: user._id,
      organizationId: user.organizationId
    });

    await termination.save();

    // Send notification to HR
    await sendTerminationNotification({
      employeeName: `${employee.firstName} ${employee.lastName}`,
      position: employee.position,
      department: employee.department,
      employeeNumber: employee.employeeId,
      terminationDate,
      reason,
      recipient: process.env.HR_EMAIL || ''
    });

    res.status(201).json(termination);
  } catch (error) {
    console.error('Error creating termination:', error);
    res.status(500).json({ message: 'Error creating termination record' });
  }
};

// Get all terminations
export const getTerminations = async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    if (!user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const terminations = await Termination.find({ organizationId: user.organizationId })
      .populate('createdBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName')
      .populate('completedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json(terminations);
  } catch (error) {
    console.error('Error fetching terminations:', error);
    res.status(500).json({ message: 'Error fetching termination records' });
  }
};

// Get a single termination
export const getTermination = async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    if (!user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const termination = await Termination.findById(req.params.id)
      .populate('createdBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName')
      .populate('completedBy', 'firstName lastName');

    if (!termination) {
      return res.status(404).json({ message: 'Termination record not found' });
    }

    if (termination.organizationId !== user.organizationId) {
      return res.status(403).json({ message: 'Not authorized to view this termination record' });
    }

    res.json(termination);
  } catch (error) {
    console.error('Error fetching termination:', error);
    res.status(500).json({ message: 'Error fetching termination record' });
  }
};

// Update termination status
export const updateTerminationStatus = async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    if (!user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const { status } = req.body;
    const termination = await Termination.findById(req.params.id);

    if (!termination) {
      return res.status(404).json({ message: 'Termination record not found' });
    }

    if (termination.organizationId !== user.organizationId) {
      return res.status(403).json({ message: 'Not authorized to update this termination record' });
    }

    const employee = await User.findOne({ employeeId: termination.employeeId });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const notificationData = {
      employeeName: `${employee.firstName} ${employee.lastName}`,
      position: employee.position,
      department: employee.department,
      employeeNumber: employee.employeeId,
      terminationDate: termination.terminationDate,
      reason: termination.reason,
      recipient: process.env.HR_EMAIL || ''
    };

    switch (status) {
      case 'approved':
        termination.status = 'approved';
        termination.approvedBy = user._id;
        await sendTerminationApprovalNotification({
          ...notificationData,
          approvedBy: `${user.firstName} ${user.lastName}`
        });
        break;

      case 'completed':
        termination.status = 'completed';
        termination.completedBy = user._id;
        await sendTerminationCompletionNotification({
          ...notificationData,
          completedBy: `${user.firstName} ${user.lastName}`
        });
        break;

      case 'rescinded':
        termination.status = 'rescinded';
        await sendTerminationRescindNotification({
          ...notificationData,
          rescindedBy: `${user.firstName} ${user.lastName}`
        });
        break;

      default:
        return res.status(400).json({ message: 'Invalid status' });
    }

    await termination.save();
    res.json(termination);
  } catch (error) {
    console.error('Error updating termination status:', error);
    res.status(500).json({ message: 'Error updating termination status' });
  }
};

// Create exit interview
export const createExitInterview = async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    if (!user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const {
      terminationId,
      reasonForLeaving,
      destination,
      feedback,
      recommendations
    } = req.body;

    const termination = await Termination.findById(terminationId);
    if (!termination) {
      return res.status(404).json({ message: 'Termination record not found' });
    }

    if (termination.organizationId !== user.organizationId) {
      return res.status(403).json({ message: 'Not authorized to create exit interview for this termination' });
    }

    const exitInterview = new ExitInterview({
      terminationId: new Types.ObjectId(terminationId),
      employeeId: termination.employeeId,
      organizationId: user.organizationId,
      date: new Date(),
      conductedBy: user._id,
      reasonForLeaving,
      destination,
      feedback,
      recommendations
    });

    await exitInterview.save();

    // Update termination with exit interview reference
    termination.exitInterviewId = exitInterview._id as Types.ObjectId;
    await termination.save();

    res.status(201).json(exitInterview);
  } catch (error) {
    console.error('Error creating exit interview:', error);
    res.status(500).json({ message: 'Error creating exit interview' });
  }
};

// Get exit interview
export const getExitInterview = async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    if (!user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const exitInterview = await ExitInterview.findById(req.params.id)
      .populate('conductedBy', 'firstName lastName');

    if (!exitInterview) {
      return res.status(404).json({ message: 'Exit interview not found' });
    }

    if (exitInterview.organizationId !== user.organizationId) {
      return res.status(403).json({ message: 'Not authorized to view this exit interview' });
    }

    res.json(exitInterview);
  } catch (error) {
    console.error('Error fetching exit interview:', error);
    res.status(500).json({ message: 'Error fetching exit interview' });
  }
}; 