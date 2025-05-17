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

interface Competency {
  _id: string;
  name: string;
  description: string;
  category: string;
  level: number;
  status: string;
}

interface FormData {
  name: string;
  description: string;
  category: string;
  level: number;
  status: string;
}

const CompetencyManagement: React.FC = () => {
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCompetency, setSelectedCompetency] = useState<Competency | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    category: '',
    level: 1,
    status: 'Active'
  });

  const { user } = useAuth();

  useEffect(() => {
    fetchCompetencies();
  }, []);

  const fetchCompetencies = async () => {
    try {
      const response = await api.get('/organization/competencies');
      setCompetencies(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load competencies');
      console.error('Error fetching competencies:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (competency?: Competency) => {
    if (competency) {
      setSelectedCompetency(competency);
      setFormData({
        name: competency.name,
        description: competency.description,
        category: competency.category,
        level: competency.level,
        status: competency.status
      });
    } else {
      setSelectedCompetency(null);
      setFormData({
        name: '',
        description: '',
        category: '',
        level: 1,
        status: 'Active'
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCompetency(null);
  };

  const handleSubmit = async () => {
    try {
      if (selectedCompetency) {
        await api.put(`/organization/competencies/${selectedCompetency._id}`, formData);
      } else {
        await api.post('/organization/competencies', formData);
      }
      fetchCompetencies();
      handleCloseDialog();
    } catch (err) {
      setError('Failed to save competency');
      console.error('Error saving competency:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this competency?')) {
      try {
        await api.delete(`/organization/competencies/${id}`);
        fetchCompetencies();
      } catch (err) {
        setError('Failed to delete competency');
        console.error('Error deleting competency:', err);
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
        <Typography variant="h6">Competency Management</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenDialog()}
        >
          Add New Competency
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Level</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {competencies.map((competency) => (
              <TableRow key={competency._id}>
                <TableCell>{competency.name}</TableCell>
                <TableCell>{competency.description}</TableCell>
                <TableCell>{competency.category}</TableCell>
                <TableCell>{competency.level}</TableCell>
                <TableCell>{competency.status}</TableCell>
                <TableCell>
                  <Tooltip title="Edit">
                    <IconButton onClick={() => handleOpenDialog(competency)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton onClick={() => handleDelete(competency._id)}>
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
          {selectedCompetency ? 'Edit Competency' : 'Add New Competency'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Level"
              type="number"
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: Number(e.target.value) })}
              fullWidth
              required
              inputProps={{ min: 1, max: 5 }}
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
            {selectedCompetency ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CompetencyManagement; 