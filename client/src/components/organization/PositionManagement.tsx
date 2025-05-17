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
  IconButton,
  Tooltip,
  CircularProgress,
  Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

interface Position {
  _id: string;
  title: string;
  department: string;
  grade: string;
  reportingTo: string;
  status: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
}

interface FormData {
  title: string;
  department: string;
  grade: string;
  reportingTo: string;
  status: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
}

const PositionManagement: React.FC = () => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    department: '',
    grade: '',
    reportingTo: '',
    status: 'Active',
    description: '',
    requirements: [],
    responsibilities: []
  });

  const { user } = useAuth();

  useEffect(() => {
    fetchPositions();
  }, []);

  const fetchPositions = async () => {
    try {
      const response = await api.get('/organization/positions');
      setPositions(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load positions');
      console.error('Error fetching positions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (position?: Position) => {
    if (position) {
      setSelectedPosition(position);
      setFormData({
        title: position.title,
        department: position.department,
        grade: position.grade,
        reportingTo: position.reportingTo,
        status: position.status,
        description: position.description,
        requirements: position.requirements,
        responsibilities: position.responsibilities
      });
    } else {
      setSelectedPosition(null);
      setFormData({
        title: '',
        department: '',
        grade: '',
        reportingTo: '',
        status: 'Active',
        description: '',
        requirements: [],
        responsibilities: []
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPosition(null);
  };

  const handleSubmit = async () => {
    try {
      if (selectedPosition) {
        await api.put(`/organization/positions/${selectedPosition._id}`, formData);
      } else {
        await api.post('/organization/positions', formData);
      }
      fetchPositions();
      handleCloseDialog();
    } catch (err) {
      setError('Failed to save position');
      console.error('Error saving position:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this position?')) {
      try {
        await api.delete(`/organization/positions/${id}`);
        fetchPositions();
      } catch (err) {
        setError('Failed to delete position');
        console.error('Error deleting position:', err);
      }
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

      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h6">Position Management</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenDialog()}
        >
          Add New Position
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Grade</TableCell>
              <TableCell>Reporting To</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {positions.map((position) => (
              <TableRow key={position._id}>
                <TableCell>{position.title}</TableCell>
                <TableCell>{position.department}</TableCell>
                <TableCell>{position.grade}</TableCell>
                <TableCell>{position.reportingTo}</TableCell>
                <TableCell>{position.status}</TableCell>
                <TableCell>
                  <Tooltip title="Edit">
                    <IconButton onClick={() => handleOpenDialog(position)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton onClick={() => handleDelete(position._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedPosition ? 'Edit Position' : 'Add New Position'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Department"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Grade"
              value={formData.grade}
              onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Reporting To"
              value={formData.reportingTo}
              onChange={(e) => setFormData({ ...formData, reportingTo: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
              required
            />
            <TextField
              label="Requirements"
              value={formData.requirements.join('\n')}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value.split('\n') })}
              fullWidth
              multiline
              rows={3}
              required
            />
            <TextField
              label="Responsibilities"
              value={formData.responsibilities.join('\n')}
              onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value.split('\n') })}
              fullWidth
              multiline
              rows={3}
              required
            />
            <TextField
              label="Status"
              select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              fullWidth
              required
            >
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedPosition ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PositionManagement; 