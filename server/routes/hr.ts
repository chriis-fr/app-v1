import { Router } from 'express';
import { hasModuleAccess, hasRole } from '../auth';
import { Employee, Attendance, Payroll } from '../mongodb/models';

const router = Router();

// Employee Routes
router.get('/employees',
  hasModuleAccess('hr'),
  hasRole(['admin', 'manager']),
  async (req, res) => {
    try {
      if (!req.user?.organizationId) {
        return res.status(401).json({ message: 'Unauthorized access' });
      }
      const employees = await Employee.find({
        organizationId: req.user.organizationId
      }).sort({ lastName: 1 });
      res.json(employees);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching employees' });
    }
});

router.post('/employees',
  hasModuleAccess('hr'),
  hasRole(['admin']),
  async (req, res) => {
    try {
      if (!req.user?.organizationId) {
        return res.status(401).json({ message: 'Unauthorized access' });
      }
      const employee = new Employee({
        ...req.body,
        organizationId: req.user.organizationId
      });
      await employee.save();
      res.status(201).json(employee);
    } catch (error) {
      res.status(500).json({ message: 'Error creating employee' });
    }
});

// Attendance Routes
router.post('/attendance/check-in',
  hasModuleAccess('hr'),
  async (req, res) => {
    try {
      if (!req.user?.organizationId) {
        return res.status(401).json({ message: 'Unauthorized access' });
      }
      const attendance = new Attendance({
        employeeId: req.body.employeeId,
        organizationId: req.user.organizationId,
        date: new Date(),
        checkIn: new Date(),
        status: 'present'
      });
      await attendance.save();
      res.status(201).json(attendance);
    } catch (error) {
      res.status(500).json({ message: 'Error recording check-in' });
    }
});

router.patch('/attendance/check-out/:id',
  hasModuleAccess('hr'),
  async (req, res) => {
    try {
      if (!req.user?.organizationId) {
        return res.status(401).json({ message: 'Unauthorized access' });
      }
      const attendance = await Attendance.findOneAndUpdate(
        {
          _id: req.params.id,
          organizationId: req.user.organizationId,
          checkOut: { $exists: false }
        },
        {
          checkOut: new Date()
        },
        { new: true }
      );
      if (!attendance) {
        return res.status(404).json({ message: 'Attendance record not found' });
      }
      res.json(attendance);
    } catch (error) {
      res.status(500).json({ message: 'Error recording check-out' });
    }
});

// Payroll Routes
router.get('/payroll',
  hasModuleAccess('hr'),
  hasRole(['admin', 'manager']),
  async (req, res) => {
    try {
      if (!req.user?.organizationId) {
        return res.status(401).json({ message: 'Unauthorized access' });
      }
      const payrolls = await Payroll.find({
        organizationId: req.user.organizationId
      })
      .populate('employeeId', 'firstName lastName employeeId')
      .sort({ 'period.startDate': -1 });
      res.json(payrolls);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching payroll records' });
    }
});

router.post('/payroll',
  hasModuleAccess('hr'),
  hasRole(['admin']),
  async (req, res) => {
    try {
      if (!req.user?.organizationId) {
        return res.status(401).json({ message: 'Unauthorized access' });
      }
      const payroll = new Payroll({
        ...req.body,
        organizationId: req.user.organizationId,
        status: 'draft'
      });
      await payroll.save();
      res.status(201).json(payroll);
    } catch (error) {
      res.status(500).json({ message: 'Error creating payroll record' });
    }
});

router.patch('/payroll/:id/approve',
  hasModuleAccess('hr'),
  hasRole(['admin']),
  async (req, res) => {
    try {
      if (!req.user?.organizationId) {
        return res.status(401).json({ message: 'Unauthorized access' });
      }
      const payroll = await Payroll.findOneAndUpdate(
        {
          _id: req.params.id,
          organizationId: req.user.organizationId,
          status: 'draft'
        },
        {
          status: 'approved',
          updatedAt: new Date()
        },
        { new: true }
      );
      if (!payroll) {
        return res.status(404).json({ message: 'Payroll record not found' });
      }
      res.json(payroll);
    } catch (error) {
      res.status(500).json({ message: 'Error approving payroll' });
    }
});

export default router; 