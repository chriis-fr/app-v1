import { useState, useEffect } from 'react';
import { useEmployee } from '@/hooks/use-employee';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Search, Filter } from 'lucide-react';
import { Link, useLocation } from 'wouter';

export default function EmployeesPage() {
  const { getEmployees, searchEmployees, getEmployeesByDepartment, getEmployeesByStatus, loading, error } = useEmployee();
  const [employees, setEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState('');
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    const data = await getEmployees();
    setEmployees(data);
  };

  const handleSearch = async () => {
    if (searchQuery) {
      const results = await searchEmployees(searchQuery);
      setEmployees(results);
    } else {
      loadEmployees();
    }
  };

  const handleDepartmentFilter = async (value: string) => {
    setDepartment(value);
    if (value) {
      const results = await getEmployeesByDepartment(value);
      setEmployees(results);
    } else {
      loadEmployees();
    }
  };

  const handleStatusFilter = async (value: string) => {
    setStatus(value);
    if (value) {
      const results = await getEmployeesByStatus(value);
      setEmployees(results);
    } else {
      loadEmployees();
    }
  };

  if (error) {
    toast({
      title: 'Error',
      description: error,
      variant: 'destructive',
    });
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Employees</h1>
        <Link href="/hr/employees/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
        </Link>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <div className="flex gap-2">
            <Input
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Select value={department} onValueChange={handleDepartmentFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Departments</SelectItem>
            <SelectItem value="IT">IT</SelectItem>
            <SelectItem value="HR">HR</SelectItem>
            <SelectItem value="Finance">Finance</SelectItem>
            <SelectItem value="Marketing">Marketing</SelectItem>
            <SelectItem value="Operations">Operations</SelectItem>
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={handleStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="on_leave">On Leave</SelectItem>
            <SelectItem value="terminated">Terminated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Contract Type</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  No employees found
                </TableCell>
              </TableRow>
            ) : (
              employees.map((employee: any) => (
                <TableRow key={employee.id}>
                  <TableCell>{employee.employeeNumber}</TableCell>
                  <TableCell>{`${employee.firstName} ${employee.lastName}`}</TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>{employee.position}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      employee.employmentStatus === 'active' ? 'bg-green-100 text-green-800' :
                      employee.employmentStatus === 'inactive' ? 'bg-gray-100 text-gray-800' :
                      employee.employmentStatus === 'on_leave' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {employee.employmentStatus}
                    </span>
                  </TableCell>
                  <TableCell>{employee.contractType}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setLocation(`/hr/employees/${employee.id}`)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 