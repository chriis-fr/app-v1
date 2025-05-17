import { Employee, AbsenceRecord, LeaveEntitlement, Termination, ExitInterview } from '../mongodb/models/hr';
import ExcelJS from 'exceljs';
import { format } from 'date-fns';
import { User } from '../mongodb/models/user';
import mongoose, { Document, Types } from 'mongoose';

// Define interfaces for our models
interface IAbsence extends Document {
  employeeId: Types.ObjectId;
  absenceType: string;
  startDate: Date;
  endDate: Date;
  duration: number;
  status: string;
  notes?: string;
}

interface IAssignment extends Document {
  organizationUnit: Types.ObjectId;
  job: Types.ObjectId;
  position: Types.ObjectId;
  employee?: Types.ObjectId;
  startDate: Date;
  endDate?: Date;
  status: string;
}

interface IEmployee extends Document {
  employeeId: Types.ObjectId;
  department: string;
  position: string;
  employmentDate: Date;
  employmentStatus: string;
  employmentGrade?: string;
  organizationId?: Types.ObjectId;
}

interface ITermination extends Document {
  employeeId: Types.ObjectId;
  terminationDate: Date;
  reason: string;
  status: string;
  exitInterviewId?: Types.ObjectId;
}

interface IPopulatedEmployee {
  employeeNumber: string;
  firstName: string;
  lastName: string;
  department: string;
}

interface IPopulatedOrganization {
  name: string;
}

interface IPopulatedPosition {
  name: string;
}

interface IPopulatedAbsence {
  employeeId: IPopulatedEmployee;
  absenceType: string;
  startDate: Date;
  endDate: Date;
  duration: number;
  status: string;
  notes?: string;
}

interface IPopulatedAssignment {
  organizationId: IPopulatedOrganization;
  position: IPopulatedPosition;
  firstName: string;
  lastName: string;
  employmentDate: Date;
  contractExpiryDate?: Date;
  employmentStatus: string;
}

interface IPopulatedEmployeeRecord {
  employeeId: IPopulatedEmployee;
  department: string;
  position: string;
  employmentDate: Date;
  employmentStatus: string;
}

export class ReportService {
  async generateAbsencesReport(params: {
    effectiveDate: Date;
    organizationUnit?: string;
    dateFrom?: Date;
    dateTo?: Date;
    absenceType?: string;
  }) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Absences Report');

    // Add headers
    worksheet.columns = [
      { header: 'Employee ID', key: 'employeeId', width: 15 },
      { header: 'Employee Name', key: 'employeeName', width: 30 },
      { header: 'Department', key: 'department', width: 20 },
      { header: 'Absence Type', key: 'absenceType', width: 20 },
      { header: 'Start Date', key: 'startDate', width: 15 },
      { header: 'End Date', key: 'endDate', width: 15 },
      { header: 'Duration (Days)', key: 'duration', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Notes', key: 'notes', width: 30 }
    ];

    // Query absences
    const query: any = {
      effectiveDate: { $lte: params.effectiveDate }
    };

    if (params.organizationUnit) {
      query.organizationUnit = params.organizationUnit;
    }

    if (params.dateFrom && params.dateTo) {
      query.startDate = { $gte: params.dateFrom, $lte: params.dateTo };
    }

    if (params.absenceType) {
      query.absenceType = params.absenceType;
    }

    const absences = await AbsenceRecord.find(query)
      .populate<{ employeeId: IPopulatedEmployee }>('employeeId', 'employeeNumber firstName lastName department')
      .lean();

    // Add data rows
    absences.forEach((absence: any) => {
      const employee = absence.employeeId as IPopulatedEmployee;
      worksheet.addRow({
        employeeId: employee.employeeNumber,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        department: employee.department,
        absenceType: absence.absenceType,
        startDate: format(new Date(absence.startDate), 'yyyy-MM-dd'),
        endDate: format(new Date(absence.endDate), 'yyyy-MM-dd'),
        duration: absence.duration,
        status: absence.status,
        notes: absence.notes
      });
    });

    return workbook;
  }

  async generateAssignmentStatusReport(params: {
    effectiveDate: Date;
    organizationStructure?: string;
    version?: string;
    parentOrganization?: string;
    group?: string;
    job?: string;
    position?: string;
    grade?: string;
    payroll?: string;
    primaryPersonType?: string;
  }) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Assignment Status Report');

    // Add headers
    worksheet.columns = [
      { header: 'Organization Unit', key: 'orgUnit', width: 30 },
      { header: 'Job', key: 'job', width: 30 },
      { header: 'Position', key: 'position', width: 30 },
      { header: 'Employee', key: 'employee', width: 30 },
      { header: 'Start Date', key: 'startDate', width: 15 },
      { header: 'End Date', key: 'endDate', width: 15 },
      { header: 'Status', key: 'status', width: 15 }
    ];

    // Query assignments
    const query: any = {
      effectiveDate: { $lte: params.effectiveDate }
    };

    if (params.organizationStructure) {
      query.organizationStructure = params.organizationStructure;
    }

    if (params.version) {
      query.version = params.version;
    }

    const assignments = await Employee.find(query)
      .populate<{ organizationId: IPopulatedOrganization }>('organizationId', 'name')
      .populate<{ position: IPopulatedPosition }>('position', 'name')
      .lean();

    // Add data rows
    assignments.forEach((assignment: any) => {
      let orgUnitName = 'N/A';
      let positionName = 'N/A';
      if (assignment.organizationId && typeof assignment.organizationId === 'object' && 'name' in assignment.organizationId) {
        orgUnitName = assignment.organizationId.name;
      }
      if (assignment.position && typeof assignment.position === 'object' && 'name' in assignment.position) {
        positionName = assignment.position.name;
      }
      worksheet.addRow({
        orgUnit: orgUnitName,
        job: positionName,
        position: positionName,
        employee: `${assignment.firstName} ${assignment.lastName}`,
        startDate: format(new Date(assignment.employmentDate), 'yyyy-MM-dd'),
        endDate: assignment.contractExpiryDate ? format(new Date(assignment.contractExpiryDate), 'yyyy-MM-dd') : 'N/A',
        status: assignment.employmentStatus
      });
    });

    return workbook;
  }

  async generateEmployeeSummaryReport(params: {
    effectiveDate: Date;
    department?: string;
  }) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Employee Summary');

    // Add headers
    worksheet.columns = [
      { header: 'Employee ID', key: 'employeeId', width: 15 },
      { header: 'Name', key: 'name', width: 30 },
      { header: 'Department', key: 'department', width: 20 },
      { header: 'Position', key: 'position', width: 20 },
      { header: 'Employment Date', key: 'employmentDate', width: 15 },
      { header: 'Status', key: 'status', width: 15 }
    ];

    // Query employees
    const query: any = {
      effectiveDate: { $lte: params.effectiveDate }
    };

    if (params.department) {
      query.department = params.department;
    }

    const employees = await Employee.find(query)
      .populate<{ employeeId: IPopulatedEmployee }>('employeeId', 'employeeNumber firstName lastName')
      .lean();

    // Add data rows
    employees.forEach((employee: any) => {
      let employeeNumber = '';
      let firstName = '';
      let lastName = '';
      if (employee.employeeId && typeof employee.employeeId === 'object' && 'employeeNumber' in employee.employeeId) {
        employeeNumber = employee.employeeId.employeeNumber;
        firstName = employee.employeeId.firstName;
        lastName = employee.employeeId.lastName;
      }
      worksheet.addRow({
        employeeId: employeeNumber,
        name: `${firstName} ${lastName}`,
        department: employee.department,
        position: employee.position,
        employmentDate: format(new Date(employee.employmentDate), 'yyyy-MM-dd'),
        status: employee.employmentStatus
      });
    });

    return workbook;
  }

  async generateEmployeeCountReport(params: {
    effectiveDate: Date;
    groupBy: 'department' | 'position' | 'grade' | 'status';
  }) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Employee Count Report');

    // Add headers
    worksheet.columns = [
      { header: 'Category', key: 'category', width: 30 },
      { header: 'Count', key: 'count', width: 15 },
      { header: 'Percentage', key: 'percentage', width: 15 }
    ];

    // Query employees
    const employees = await Employee.find({
      effectiveDate: { $lte: params.effectiveDate }
    }).lean();

    // Group and count
    const groupedData = employees.reduce((acc: Record<string, number>, employee: any) => {
      const category = employee[params.groupBy] || 'Unspecified';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    // Calculate total and percentages
    const total = Object.values(groupedData).reduce((sum: number, count: number) => sum + count, 0);

    // Add data rows
    Object.entries(groupedData).forEach(([category, count]) => {
      const percentage = ((count as number) / total * 100).toFixed(2);
      worksheet.addRow({
        category,
        count,
        percentage: `${percentage}%`
      });
    });

    return workbook;
  }

  async generateApplicantDetailsReport(params: {
    dateFrom: Date;
    dateTo: Date;
    status?: string;
  }) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Applicant Details');

    worksheet.columns = [
      { header: 'Application ID', key: 'applicationId', width: 15 },
      { header: 'Applicant Name', key: 'name', width: 30 },
      { header: 'Position', key: 'position', width: 20 },
      { header: 'Department', key: 'department', width: 20 },
      { header: 'Application Date', key: 'applicationDate', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Experience', key: 'experience', width: 15 },
      { header: 'Education', key: 'education', width: 30 }
    ];

    // Query applicants (you'll need to create an Applicant model)
    // This is a placeholder for the actual implementation
    const applicants = await Employee.find({
      employmentStatus: 'applicant',
      createdAt: {
        $gte: params.dateFrom,
        $lte: params.dateTo
      }
    });

    applicants.forEach(applicant => {
      worksheet.addRow({
        applicationId: applicant.employeeNumber,
        name: `${applicant.firstName} ${applicant.lastName}`,
        position: applicant.position,
        department: applicant.department,
        applicationDate: format(new Date(applicant.createdAt), 'yyyy-MM-dd'),
        status: applicant.employmentStatus,
        experience: applicant.workExperience?.length || 0,
        education: applicant.education?.map((edu: { degree: string }) => edu.degree).join(', ')
      });
    });

    return workbook;
  }

  async generateAssignmentDetailsReport(params: {
    effectiveDate: Date;
    assignmentType?: string;
  }) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Assignment Details');

    worksheet.columns = [
      { header: 'Employee ID', key: 'employeeId', width: 15 },
      { header: 'Employee Name', key: 'employeeName', width: 30 },
      { header: 'Assignment Type', key: 'assignmentType', width: 20 },
      { header: 'Department', key: 'department', width: 20 },
      { header: 'Position', key: 'position', width: 20 },
      { header: 'Start Date', key: 'startDate', width: 15 },
      { header: 'End Date', key: 'endDate', width: 15 },
      { header: 'Status', key: 'status', width: 15 }
    ];

    const query: any = {};
    if (params.assignmentType && params.assignmentType !== 'all') {
      query.assignmentType = params.assignmentType;
    }

    const employees = await Employee.find(query);

    employees.forEach(employee => {
      worksheet.addRow({
        employeeId: employee.employeeNumber,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        assignmentType: employee.contractType,
        department: employee.department,
        position: employee.position,
        startDate: format(new Date(employee.employmentDate), 'yyyy-MM-dd'),
        endDate: employee.contractExpiryDate ? format(new Date(employee.contractExpiryDate), 'yyyy-MM-dd') : 'N/A',
        status: employee.employmentStatus
      });
    });

    return workbook;
  }

  async generatePersonDetailsReport(params: {
    effectiveDate: Date;
    includeInactive: boolean;
  }) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Person Details');

    worksheet.columns = [
      { header: 'Employee ID', key: 'employeeId', width: 15 },
      { header: 'Name', key: 'name', width: 30 },
      { header: 'Date of Birth', key: 'dob', width: 15 },
      { header: 'Gender', key: 'gender', width: 10 },
      { header: 'Marital Status', key: 'maritalStatus', width: 15 },
      { header: 'Contact', key: 'contact', width: 30 },
      { header: 'Education', key: 'education', width: 30 },
      { header: 'Experience', key: 'experience', width: 30 }
    ];

    const query: any = {};
    if (!params.includeInactive) {
      query.employmentStatus = 'active';
    }

    const employees = await Employee.find(query);

    employees.forEach(employee => {
      worksheet.addRow({
        employeeId: employee.employeeNumber,
        name: `${employee.firstName} ${employee.lastName}`,
        dob: employee.dateOfBirth ? format(new Date(employee.dateOfBirth), 'yyyy-MM-dd') : 'N/A',
        gender: employee.gender,
        maritalStatus: employee.maritalStatus,
        contact: employee.addresses?.find((addr: { type: string; street?: string }) => addr.type === 'current')?.street,
        education: employee.education?.map((edu: { degree: string; institution: string }) => `${edu.degree} - ${edu.institution}`).join(', '),
        experience: employee.workExperience?.map((exp: { position: string; company: string }) => `${exp.position} at ${exp.company}`).join(', ')
      });
    });

    return workbook;
  }

  async generateSkillsMatchingReport(params: {
    effectiveDate: Date;
    matchThreshold: number;
  }) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Skills Matching');

    worksheet.columns = [
      { header: 'Position', key: 'position', width: 30 },
      { header: 'Required Skills', key: 'requiredSkills', width: 40 },
      { header: 'Employee', key: 'employee', width: 30 },
      { header: 'Matching Skills', key: 'matchingSkills', width: 40 },
      { header: 'Match Percentage', key: 'matchPercentage', width: 15 }
    ];

    const employees = await Employee.find({
      employmentStatus: 'active'
    });

    employees.forEach(employee => {
      const competencies = employee.competencies || [];
      const matchingSkills = competencies.filter((comp: { proficiency: string }) => 
        comp.proficiency === 'expert' || comp.proficiency === 'advanced'
      );

      const matchPercentage = (matchingSkills.length / competencies.length) * 100;

      if (matchPercentage >= params.matchThreshold) {
        worksheet.addRow({
          position: employee.position,
          requiredSkills: competencies.map((comp: { skills: string[] }) => comp.skills.join(', ')).join('; '),
          employee: `${employee.firstName} ${employee.lastName}`,
          matchingSkills: matchingSkills.map((comp: { skills: string[] }) => comp.skills.join(', ')).join('; '),
          matchPercentage: `${matchPercentage.toFixed(1)}%`
        });
      }
    });

    return workbook;
  }

  async generateOrgHierarchyReport(params: {
    effectiveDate: Date;
    version: string;
    showManagers: boolean;
  }) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Organization Hierarchy');

    worksheet.columns = [
      { header: 'Organization Unit', key: 'orgUnit', width: 30 },
      { header: 'Parent Organization', key: 'parentOrg', width: 30 },
      { header: 'Manager', key: 'manager', width: 30 },
      { header: 'Level', key: 'level', width: 10 },
      { header: 'Status', key: 'status', width: 15 }
    ];

    const employees = await Employee.find({
      employmentStatus: 'active'
    }).populate('organizationId');

    employees.forEach(employee => {
      let parentOrg = '';
      if (employee.organizationId && typeof employee.organizationId === 'object' && 'name' in employee.organizationId) {
        parentOrg = (employee.organizationId as any).name;
      }
      worksheet.addRow({
        orgUnit: employee.department,
        parentOrg: parentOrg,
        manager: params.showManagers ? `${employee.firstName} ${employee.lastName}` : 'N/A',
        level: employee.employmentGrade,
        status: employee.employmentStatus
      });
    });

    return workbook;
  }

  async generatePositionHierarchyReport(params: {
    effectiveDate: Date;
    version: string;
    showHolders: boolean;
  }) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Position Hierarchy');

    worksheet.columns = [
      { header: 'Position', key: 'position', width: 30 },
      { header: 'Parent Position', key: 'parentPosition', width: 30 },
      { header: 'Position Holder', key: 'holder', width: 30 },
      { header: 'Grade', key: 'grade', width: 15 },
      { header: 'Department', key: 'department', width: 20 }
    ];

    const employees = await Employee.find({
      employmentStatus: 'active'
    });

    employees.forEach(employee => {
      worksheet.addRow({
        position: employee.position,
        parentPosition: employee.designation,
        holder: params.showHolders ? `${employee.firstName} ${employee.lastName}` : 'N/A',
        grade: employee.employmentGrade,
        department: employee.department
      });
    });

    return workbook;
  }

  async generateTerminationsReport(params: {
    dateFrom: Date;
    dateTo: Date;
    reason?: string;
  }) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Terminations');

    worksheet.columns = [
      { header: 'Employee ID', key: 'employeeId', width: 15 },
      { header: 'Employee Name', key: 'employeeName', width: 30 },
      { header: 'Termination Date', key: 'terminationDate', width: 15 },
      { header: 'Reason', key: 'reason', width: 40 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Exit Interview', key: 'exitInterview', width: 15 }
    ];

    const query: any = {
      terminationDate: {
        $gte: params.dateFrom,
        $lte: params.dateTo
      }
    };

    if (params.reason && params.reason !== 'all') {
      query.reason = params.reason;
    }

    const terminations = await Termination.find(query)
      .populate('employeeId', 'employeeNumber firstName lastName')
      .populate('exitInterviewId');

    terminations.forEach(termination => {
      let employeeNumber = '';
      let firstName = '';
      let lastName = '';
      if (termination.employeeId && typeof termination.employeeId === 'object' && 'employeeNumber' in termination.employeeId) {
        employeeNumber = (termination.employeeId as any).employeeNumber;
        firstName = (termination.employeeId as any).firstName;
        lastName = (termination.employeeId as any).lastName;
      }
      worksheet.addRow({
        employeeId: employeeNumber,
        employeeName: `${firstName} ${lastName}`,
        terminationDate: format(new Date(termination.terminationDate), 'yyyy-MM-dd'),
        reason: termination.reason,
        status: termination.status,
        exitInterview: termination.exitInterviewId ? 'Yes' : 'No'
      });
    });

    return workbook;
  }

  async generatePayrollMovementsReport(params: {
    dateFrom: Date;
    dateTo: Date;
    movementType?: string;
  }) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Payroll Movements');

    worksheet.columns = [
      { header: 'Employee ID', key: 'employeeId', width: 15 },
      { header: 'Employee Name', key: 'employeeName', width: 30 },
      { header: 'Movement Type', key: 'movementType', width: 20 },
      { header: 'Effective Date', key: 'effectiveDate', width: 15 },
      { header: 'Previous Value', key: 'previousValue', width: 20 },
      { header: 'New Value', key: 'newValue', width: 20 },
      { header: 'Department', key: 'department', width: 20 }
    ];

    // Query payroll movements (you'll need to create a PayrollMovement model)
    // This is a placeholder for the actual implementation
    const employees = await Employee.find({
      employmentStatus: 'active'
    });

    employees.forEach(employee => {
      worksheet.addRow({
        employeeId: employee.employeeNumber,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        movementType: 'Salary Change',
        effectiveDate: format(new Date(employee.updatedAt), 'yyyy-MM-dd'),
        previousValue: 'N/A',
        newValue: employee.bankDetails?.currency,
        department: employee.department
      });
    });

    return workbook;
  }
} 