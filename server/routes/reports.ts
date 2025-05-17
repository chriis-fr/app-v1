import express from 'express';
import { ReportService } from '../services/report.service';
import { isAuthenticated, isHR } from '../middleware/auth';

const router = express.Router();
const reportService = new ReportService();

// Middleware to check if user is authenticated and has HR role
router.use(isAuthenticated, isHR);

// Generate Absences Report
router.post('/absences', async (req, res) => {
  try {
    const workbook = await reportService.generateAbsencesReport({
      effectiveDate: new Date(req.body.effectiveDate),
      organizationUnit: req.body.organizationUnit,
      dateFrom: new Date(req.body.dateFrom),
      dateTo: new Date(req.body.dateTo),
      absenceType: req.body.absenceType
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=absences-report.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate absences report' });
  }
});

// Generate Assignment Status Report
router.post('/assignment-status', async (req, res) => {
  try {
    const workbook = await reportService.generateAssignmentStatusReport({
      effectiveDate: new Date(req.body.effectiveDate),
      organizationStructure: req.body.organizationStructure,
      version: req.body.version
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=assignment-status-report.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate assignment status report' });
  }
});

// Generate Employee Summary Report
router.post('/employee-summary', async (req, res) => {
  try {
    const workbook = await reportService.generateEmployeeSummaryReport({
      effectiveDate: new Date(req.body.effectiveDate),
      department: req.body.department
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=employee-summary-report.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate employee summary report' });
  }
});

// Generate Applicant Details Report
router.post('/applicant-details', async (req, res) => {
  try {
    const workbook = await reportService.generateApplicantDetailsReport({
      dateFrom: new Date(req.body.dateFrom),
      dateTo: new Date(req.body.dateTo),
      status: req.body.status
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=applicant-details-report.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate applicant details report' });
  }
});

// Generate Assignment Details Report
router.post('/assignment-details', async (req, res) => {
  try {
    const workbook = await reportService.generateAssignmentDetailsReport({
      effectiveDate: new Date(req.body.effectiveDate),
      assignmentType: req.body.assignmentType
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=assignment-details-report.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate assignment details report' });
  }
});

// Generate Person Details Report
router.post('/person-details', async (req, res) => {
  try {
    const workbook = await reportService.generatePersonDetailsReport({
      effectiveDate: new Date(req.body.effectiveDate),
      includeInactive: req.body.includeInactive
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=person-details-report.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate person details report' });
  }
});

// Generate Skills Matching Report
router.post('/skills-matching', async (req, res) => {
  try {
    const workbook = await reportService.generateSkillsMatchingReport({
      effectiveDate: new Date(req.body.effectiveDate),
      matchThreshold: req.body.matchThreshold
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=skills-matching-report.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate skills matching report' });
  }
});

// Generate Organization Hierarchy Report
router.post('/org-hierarchy', async (req, res) => {
  try {
    const workbook = await reportService.generateOrgHierarchyReport({
      effectiveDate: new Date(req.body.effectiveDate),
      version: req.body.version,
      showManagers: req.body.showManagers
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=org-hierarchy-report.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate organization hierarchy report' });
  }
});

// Generate Position Hierarchy Report
router.post('/position-hierarchy', async (req, res) => {
  try {
    const workbook = await reportService.generatePositionHierarchyReport({
      effectiveDate: new Date(req.body.effectiveDate),
      version: req.body.version,
      showHolders: req.body.showHolders
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=position-hierarchy-report.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate position hierarchy report' });
  }
});

// Generate Terminations Report
router.post('/terminations', async (req, res) => {
  try {
    const workbook = await reportService.generateTerminationsReport({
      dateFrom: new Date(req.body.dateFrom),
      dateTo: new Date(req.body.dateTo),
      reason: req.body.reason
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=terminations-report.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate terminations report' });
  }
});

// Generate Payroll Movements Report
router.post('/payroll-movements', async (req, res) => {
  try {
    const workbook = await reportService.generatePayrollMovementsReport({
      dateFrom: new Date(req.body.dateFrom),
      dateTo: new Date(req.body.dateTo),
      movementType: req.body.movementType
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=payroll-movements-report.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate payroll movements report' });
  }
});

// Generate Employee Count Report
router.post('/employee-count', async (req, res) => {
  try {
    const workbook = await reportService.generateEmployeeCountReport({
      effectiveDate: new Date(req.body.effectiveDate),
      groupBy: req.body.groupBy
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=employee-count-report.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate employee count report' });
  }
});

export default router; 