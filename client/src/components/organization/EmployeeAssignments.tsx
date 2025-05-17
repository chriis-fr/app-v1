import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Assignment {
  _id: string;
  employeeId: Employee;
  assignmentType: string;
  startDate: string;
  endDate?: string;
  status: string;
  isException: boolean;
  exceptionReason?: string;
}

interface Position {
  _id: string;
  code: string;
  name: string;
  jobTitle: string;
  department: string;
  assignedEmployees: Assignment[];
}

const EmployeeAssignments: React.FC = () => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [formData, setFormData] = useState({
    employeeId: '',
    assignmentType: 'Primary',
    startDate: '',
    endDate: '',
    isException: false,
    exceptionReason: ''
  });

  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [positionsRes, employeesRes] = await Promise.all([
        api.get('/organization/structure?type=Position'),
        api.get('/users?role=Employee')
      ]);
      setPositions(positionsRes.data);
      setEmployees(employeesRes.data);
      setError(null);
    } catch (err) {
      setError('Failed to load data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (position: Position) => {
    setSelectedPosition(position);
    setFormData({
      employeeId: '',
      assignmentType: 'Primary',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      isException: false,
      exceptionReason: ''
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPosition(null);
  };

  const handleSubmit = async () => {
    if (!selectedPosition) return;

    try {
      await api.post(`/organization/structure/${selectedPosition._id}/assign-employee`, formData);
      fetchData();
      handleCloseDialog();
    } catch (err) {
      setError('Failed to assign employee');
      console.error('Error assigning employee:', err);
    }
  };

  const handleUpdateAssignment = async (positionId: string, assignmentId: string, status: string) => {
    try {
      await api.put(`/organization/structure/${positionId}/assignments/${assignmentId}`, { status });
      fetchData();
    } catch (err) {
      setError('Failed to update assignment');
      console.error('Error updating assignment:', err);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Typography variant="h6" sx={{ mb: 2 }}>
        Employee Assignments
      </Typography>

      {positions.map((position) => (
        <Paper key={position._id} sx={{ mb: 2, p: 2 }}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6">{position.jobTitle}</Typography>
              <Typography variant="body2" color="text.secondary">
                {position.department} - {position.code}
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleOpenDialog(position)}
            >
              Assign Employee
            </Button>
          </Box>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Employee</TableCell>
                  <TableCell>Assignment Type</TableCell>
                  <TableCell>Start Date</TableCell>
                  <TableCell>End Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Exception</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {position.assignedEmployees.map((assignment) => (
                  <TableRow key={assignment._id}>
                    <TableCell>
                      {assignment.employeeId.firstName} {assignment.employeeId.lastName}
                    </TableCell>
                    <TableCell>{assignment.assignmentType}</TableCell>
                    <TableCell>{new Date(assignment.startDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {assignment.endDate ? new Date(assignment.endDate).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={assignment.status}
                        color={assignment.status === 'Active' ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {assignment.isException && (
                        <Tooltip title={assignment.exceptionReason || 'Exception'}>
                          <Chip label="Exception" color="warning" size="small" />
                        </Tooltip>
                      )}
                    </TableCell>
                    <TableCell>
                      <Tooltip title={assignment.status === 'Active' ? 'Deactivate' : 'Activate'}>
                        <IconButton
                          onClick={() =>
                            handleUpdateAssignment(
                              position._id,
                              assignment._id,
                              assignment.status === 'Active' ? 'Inactive' : 'Active'
                            )
                          }
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      ))}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Assign Employee to {selectedPosition?.jobTitle}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Box>
              <TextField
                fullWidth
                select
                label="Employee"
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              >
                {employees.map((employee) => (
                  <MenuItem key={employee._id} value={employee._id}>
                    {employee.firstName} {employee.lastName}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  select
                  label="Assignment Type"
                  value={formData.assignmentType}
                  onChange={(e) => setFormData({ ...formData, assignmentType: e.target.value })}
                >
                  <MenuItem value="Primary">Primary</MenuItem>
                  <MenuItem value="Secondary">Secondary</MenuItem>
                  <MenuItem value="Acting">Acting</MenuItem>
                  <MenuItem value="Temporary">Temporary</MenuItem>
                </TextField>
              </Box>
              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  type="date"
                  label="Start Date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  type="date"
                  label="End Date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  select
                  label="Is Exception"
                  value={formData.isException}
                  onChange={(e) => setFormData({ ...formData, isException: e.target.value === 'true' })}
                >
                  <MenuItem value="false">No</MenuItem>
                  <MenuItem value="true">Yes</MenuItem>
                </TextField>
              </Box>
            </Box>
            {formData.isException && (
              <Box>
                <TextField
                  fullWidth
                  label="Exception Reason"
                  value={formData.exceptionReason}
                  onChange={(e) => setFormData({ ...formData, exceptionReason: e.target.value })}
                />
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Assign
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeeAssignments; 