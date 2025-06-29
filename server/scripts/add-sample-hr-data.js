const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chains-erp');

// Import models
const { Employee, AbsenceRecord, LeaveEntitlement, Payroll, Attendance } = require('../mongodb/models/hr');

async function addSampleHRData() {
  try {
    console.log('Adding sample HR data...');
    
    // Get the first organization (assuming it exists)
    const Organization = require('../models/Organization').default;
    const organization = await Organization.findOne();
    
    if (!organization) {
      console.log('No organization found. Please create an organization first.');
      return;
    }
    
    const organizationId = organization._id;
    
    // Add sample employees if they don't exist
    const sampleEmployees = [
      {
        organizationId,
        employeeNumber: 'EMP001',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date('1990-05-15'),
        employmentDate: new Date('2020-03-01'),
        department: 'Engineering',
        position: 'Senior Developer',
        employmentStatus: 'active',
        role: 'employee'
      },
      {
        organizationId,
        employeeNumber: 'EMP002',
        firstName: 'Jane',
        lastName: 'Smith',
        dateOfBirth: new Date('1988-12-10'),
        employmentDate: new Date('2019-06-15'),
        department: 'Marketing',
        position: 'Marketing Manager',
        employmentStatus: 'active',
        role: 'employee'
      },
      {
        organizationId,
        employeeNumber: 'EMP003',
        firstName: 'Mike',
        lastName: 'Johnson',
        dateOfBirth: new Date('1992-08-22'),
        employmentDate: new Date('2021-01-10'),
        department: 'Sales',
        position: 'Sales Representative',
        employmentStatus: 'active',
        role: 'employee'
      }
    ];
    
    for (const employeeData of sampleEmployees) {
      const existingEmployee = await Employee.findOne({ 
        organizationId, 
        employeeNumber: employeeData.employeeNumber 
      });
      
      if (!existingEmployee) {
        const employee = new Employee(employeeData);
        await employee.save();
        console.log(`Added employee: ${employeeData.firstName} ${employeeData.lastName}`);
      }
    }
    
    // Get employees for creating related data
    const employees = await Employee.find({ organizationId });
    
    // Add sample leave requests
    for (const employee of employees) {
      const existingLeave = await AbsenceRecord.findOne({ employeeId: employee._id });
      
      if (!existingLeave) {
        const leaveRequest = new AbsenceRecord({
          employeeId: employee._id,
          organizationId,
          type: 'ANNUAL',
          startDate: new Date('2024-02-01'),
          endDate: new Date('2024-02-03'),
          duration: 3,
          status: 'PENDING',
          reason: 'Personal vacation'
        });
        await leaveRequest.save();
        console.log(`Added leave request for: ${employee.firstName} ${employee.lastName}`);
      }
    }
    
    // Add sample leave entitlements
    for (const employee of employees) {
      const existingEntitlement = await LeaveEntitlement.findOne({ 
        employeeId: employee._id, 
        year: 2024 
      });
      
      if (!existingEntitlement) {
        const entitlement = new LeaveEntitlement({
          employeeId: employee._id,
          organizationId,
          year: 2024,
          type: 'ANNUAL',
          totalDays: 20,
          usedDays: 5,
          remainingDays: 15
        });
        await entitlement.save();
        console.log(`Added leave entitlement for: ${employee.firstName} ${employee.lastName}`);
      }
    }
    
    // Add sample payroll data
    for (const employee of employees) {
      const existingPayroll = await Payroll.findOne({ employeeId: employee._id });
      
      if (!existingPayroll) {
        const payroll = new Payroll({
          employeeId: employee._id,
          organizationId,
          amount: 5000 + Math.floor(Math.random() * 3000),
          currency: 'USD',
          status: 'PAID',
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear()
        });
        await payroll.save();
        console.log(`Added payroll for: ${employee.firstName} ${employee.lastName}`);
      }
    }
    
    // Add sample attendance data
    for (const employee of employees) {
      const existingAttendance = await Attendance.findOne({ employeeId: employee._id });
      
      if (!existingAttendance) {
        const attendance = new Attendance({
          employeeId: employee._id,
          organizationId,
          date: new Date(),
          checkInTime: new Date(new Date().setHours(9, 0, 0, 0)),
          checkOutTime: new Date(new Date().setHours(17, 0, 0, 0)),
          status: 'present'
        });
        await attendance.save();
        console.log(`Added attendance for: ${employee.firstName} ${employee.lastName}`);
      }
    }
    
    console.log('Sample HR data added successfully!');
    
  } catch (error) {
    console.error('Error adding sample HR data:', error);
  } finally {
    mongoose.disconnect();
  }
}

addSampleHRData(); 