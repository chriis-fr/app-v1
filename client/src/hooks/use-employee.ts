import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';

interface Employee {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  maritalStatus: string;
  employmentDate: string;
  employmentGrade: string;
  position: string;
  department: string;
  contractType: string;
  employmentStatus: string;
  bankDetails: {
    bankName: string;
    branchName: string;
    accountNumber: string;
    accountType: string;
    currency: string;
  };
  documents: Array<{
    type: string;
    number: string;
    issueDate: string;
    expiryDate: string;
    issuingAuthority: string;
    isVerified: boolean;
  }>;
  education: Array<{
    degree: string;
    institution: string;
    fieldOfStudy: string;
    startDate: string;
    endDate: string;
    grade: string;
    isVerified: boolean;
  }>;
  competencies: Array<{
    category: string;
    skills: string[];
    proficiency: string;
  }>;
}

interface Attendance {
  id: string;
  employeeId: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: string;
}

interface Payroll {
  id: string;
  employeeId: string;
  month: string;
  year: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status: string;
}

export function useEmployee() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Employee CRUD operations
  const getEmployees = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/hr/employees');
      return response.data;
    } catch (err) {
      setError('Failed to fetch employees');
      toast({
        title: 'Error',
        description: 'Failed to fetch employees',
        variant: 'destructive',
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const getEmployee = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/hr/employees/${id}`);
      return response.data;
    } catch (err) {
      setError('Failed to fetch employee');
      toast({
        title: 'Error',
        description: 'Failed to fetch employee',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createEmployee = useCallback(async (data: Partial<Employee>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.post('/hr/employees', data);
      toast({
        title: 'Success',
        description: 'Employee created successfully',
      });
      return response.data;
    } catch (err) {
      setError('Failed to create employee');
      toast({
        title: 'Error',
        description: 'Failed to create employee',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateEmployee = useCallback(async (id: string, data: Partial<Employee>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.put(`/hr/employees/${id}`, data);
      toast({
        title: 'Success',
        description: 'Employee updated successfully',
      });
      return response.data;
    } catch (err) {
      setError('Failed to update employee');
      toast({
        title: 'Error',
        description: 'Failed to update employee',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const deleteEmployee = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await api.delete(`/hr/employees/${id}`);
      toast({
        title: 'Success',
        description: 'Employee deleted successfully',
      });
      return true;
    } catch (err) {
      setError('Failed to delete employee');
      toast({
        title: 'Error',
        description: 'Failed to delete employee',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Attendance operations
  const getEmployeeAttendance = useCallback(async (employeeId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/hr/employees/${employeeId}/attendance`);
      return response.data;
    } catch (err) {
      setError('Failed to fetch attendance records');
      toast({
        title: 'Error',
        description: 'Failed to fetch attendance records',
        variant: 'destructive',
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const recordAttendance = useCallback(async (data: Partial<Attendance>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.post('/hr/attendance', data);
      toast({
        title: 'Success',
        description: 'Attendance recorded successfully',
      });
      return response.data;
    } catch (err) {
      setError('Failed to record attendance');
      toast({
        title: 'Error',
        description: 'Failed to record attendance',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Payroll operations
  const getEmployeePayroll = useCallback(async (employeeId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/hr/employees/${employeeId}/payroll`);
      return response.data;
    } catch (err) {
      setError('Failed to fetch payroll records');
      toast({
        title: 'Error',
        description: 'Failed to fetch payroll records',
        variant: 'destructive',
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createPayrollRecord = useCallback(async (data: Partial<Payroll>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.post('/hr/payroll', data);
      toast({
        title: 'Success',
        description: 'Payroll record created successfully',
      });
      return response.data;
    } catch (err) {
      setError('Failed to create payroll record');
      toast({
        title: 'Error',
        description: 'Failed to create payroll record',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const searchEmployees = useCallback(async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/hr/employees/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (err) {
      setError('Failed to search employees');
      toast({
        title: 'Error',
        description: 'Failed to search employees',
        variant: 'destructive',
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const getEmployeesByDepartment = useCallback(async (department: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/hr/employees?department=${encodeURIComponent(department)}`);
      return response.data;
    } catch (err) {
      setError('Failed to fetch employees by department');
      toast({
        title: 'Error',
        description: 'Failed to fetch employees by department',
        variant: 'destructive',
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const getEmployeesByStatus = useCallback(async (status: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/hr/employees?status=${encodeURIComponent(status)}`);
      return response.data;
    } catch (err) {
      setError('Failed to fetch employees by status');
      toast({
        title: 'Error',
        description: 'Failed to fetch employees by status',
        variant: 'destructive',
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    loading,
    error,
    // Employee CRUD
    getEmployees,
    getEmployee,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    // Attendance
    getEmployeeAttendance,
    recordAttendance,
    // Payroll
    getEmployeePayroll,
    createPayrollRecord,
    // New methods
    searchEmployees,
    getEmployeesByDepartment,
    getEmployeesByStatus,
  };
} 