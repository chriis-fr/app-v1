import { Termination, ITermination } from '../mongodb/models/hr';
import User from '../models/User';
import { sendTerminationNotification, sendTerminationApprovalNotification, sendTerminationCompletionNotification, sendTerminationRescindNotification } from '../utils/email';
import { generateTerminationLetter, generateExitInterviewReport } from '../utils/document-generator';
import { Types } from 'mongoose';

export class TerminationService {
  static async initiateTermination(data: {
    employeeId: string;
    reason: string;
    terminationDate: Date;
    createdBy: string;
    organizationId: string;
  }): Promise<ITermination> {
    const employee = await User.findById(data.employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }

    const termination = await Termination.create({
      ...data,
      status: 'pending',
      documents: [],
      exitInterview: null
    });

    // Generate termination letter
    const letter = await generateTerminationLetter(termination);
    termination.documents.push({
      type: 'termination_letter',
      url: letter.url,
      name: letter.filename,
      uploadedAt: new Date()
    });
    await termination.save();

    // Send notifications
    await sendTerminationNotification({
      employeeName: `${employee.firstName} ${employee.lastName}`,
      position: employee.position,
      department: employee.department,
      employeeNumber: employee.employeeId,
      terminationDate: data.terminationDate,
      reason: data.reason,
      recipient: employee.email
    });

    return termination;
  }

  static async approveTermination(terminationId: string, approvedBy: string): Promise<ITermination> {
    const termination = await Termination.findById(terminationId);
    if (!termination) {
      throw new Error('Termination not found');
    }

    if (termination.status !== 'pending') {
      throw new Error('Termination is not in pending status');
    }

    termination.status = 'approved';
    termination.approvedBy = new Types.ObjectId(approvedBy);
    termination.updatedAt = new Date();
    await termination.save();

    const employee = await User.findById(termination.employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }

    // Send approval notification
    await sendTerminationApprovalNotification({
      employeeName: `${employee.firstName} ${employee.lastName}`,
      position: employee.position,
      department: employee.department,
      employeeNumber: employee.employeeId,
      terminationDate: termination.terminationDate,
      reason: termination.reason,
      recipient: employee.email,
      approvedBy: approvedBy
    });

    return termination;
  }

  static async completeTermination(terminationId: string, completedBy: string): Promise<ITermination> {
    const termination = await Termination.findById(terminationId);
    if (!termination) {
      throw new Error('Termination not found');
    }

    if (termination.status !== 'approved') {
      throw new Error('Termination is not in approved status');
    }

    termination.status = 'completed';
    termination.completedBy = new Types.ObjectId(completedBy);
    termination.updatedAt = new Date();
    await termination.save();

    const employee = await User.findById(termination.employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }

    // Update employee status
    employee.status = 'terminated';
    await employee.save();

    // Send completion notification
    await sendTerminationCompletionNotification({
      employeeName: `${employee.firstName} ${employee.lastName}`,
      position: employee.position,
      department: employee.department,
      employeeNumber: employee.employeeId,
      terminationDate: termination.terminationDate,
      reason: termination.reason,
      recipient: employee.email,
      completedBy: completedBy
    });

    return termination;
  }

  static async rescindTermination(terminationId: string, rescindedBy: string): Promise<ITermination> {
    const termination = await Termination.findById(terminationId);
    if (!termination) {
      throw new Error('Termination not found');
    }

    if (termination.status === 'completed') {
      throw new Error('Cannot rescind a completed termination');
    }

    termination.status = 'rescinded';
    termination.updatedAt = new Date();
    await termination.save();

    const employee = await User.findById(termination.employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }

    // Send rescind notification
    await sendTerminationRescindNotification({
      employeeName: `${employee.firstName} ${employee.lastName}`,
      position: employee.position,
      department: employee.department,
      employeeNumber: employee.employeeId,
      terminationDate: termination.terminationDate,
      reason: termination.reason,
      recipient: employee.email,
      rescindedBy: rescindedBy
    });

    return termination;
  }

  static async conductExitInterview(data: {
    terminationId: string;
    conductedBy: string;
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
  }): Promise<ITermination> {
    const termination = await Termination.findById(data.terminationId);
    if (!termination) {
      throw new Error('Termination not found');
    }

    if (termination.status !== 'approved') {
      throw new Error('Cannot conduct exit interview for non-approved termination');
    }

    // Generate exit interview report
    const report = await generateExitInterviewReport({
      ...data,
      date: new Date(),
      employeeId: termination.employeeId
    });

    termination.exitInterviewId = new Types.ObjectId();
    termination.documents.push({
      type: 'exit_interview',
      url: report.url,
      name: report.filename,
      uploadedAt: new Date()
    });
    await termination.save();

    return termination;
  }

  static async getTerminationHistory(employeeId: string): Promise<ITermination[]> {
    return Termination.find({ employeeId })
      .sort({ createdAt: -1 })
      .populate('createdBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName')
      .populate('completedBy', 'firstName lastName');
  }

  static async getPendingTerminations(organizationId: string): Promise<ITermination[]> {
    return Termination.find({
      organizationId,
      status: 'pending'
    })
      .sort({ createdAt: -1 })
      .populate('employeeId', 'firstName lastName position department')
      .populate('createdBy', 'firstName lastName');
  }

  static async getTerminationAnalytics(organizationId: string): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byDepartment: Record<string, number>;
    byReason: Record<string, number>;
    monthlyTrend: Array<{
      month: string;
      count: number;
    }>;
  }> {
    const terminations = await Termination.find({ organizationId });

    const byStatus = terminations.reduce((acc, t) => {
      acc[t.status] = (acc[t.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byDepartment = await Promise.all(
      terminations.map(async (t) => {
        const employee = await User.findById(t.employeeId);
        return employee?.department || 'Unknown';
      })
    ).then((departments) =>
      departments.reduce((acc, d) => {
        acc[d] = (acc[d] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    );

    const byReason = terminations.reduce((acc, t) => {
      acc[t.reason] = (acc[t.reason] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const monthlyTrend = terminations.reduce((acc, t) => {
      const month = t.createdAt.toISOString().slice(0, 7);
      const existing = acc.find((m: { month: string }) => m.month === month);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ month, count: 1 });
      }
      return acc;
    }, [] as Array<{ month: string; count: number }>);

    return {
      total: terminations.length,
      byStatus,
      byDepartment,
      byReason,
      monthlyTrend: monthlyTrend.sort((a: { month: string }, b: { month: string }) => 
        new Date(b.month).getTime() - new Date(a.month).getTime()
      )
    };
  }
} 