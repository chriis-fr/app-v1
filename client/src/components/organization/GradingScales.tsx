import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
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

interface Position {
  _id: string;
  jobTitle: string;
  department: string;
  code: string;
  gradingScale?: {
    scale: string;
    currency: string;
    minRate: number;
    maxRate: number;
    effectiveDate: string;
    endDate?: string;
    benefits?: Array<{
      type: string;
      value: number;
      frequency: string;
    }>;
  };
}

const GradingScales: React.FC = () => {
  const { user } = useAuth();
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchPositions();
  }, []);

  const fetchPositions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/positions');
      setPositions(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch positions');
      console.error('Error fetching positions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (position: Position) => {
    const initialGradingScale = position.gradingScale || {
      scale: '',
      currency: 'USD',
      minRate: 0,
      maxRate: 0,
      effectiveDate: new Date().toISOString().split('T')[0]
    };
    
    setSelectedPosition({
      ...position,
      gradingScale: initialGradingScale
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setSelectedPosition(null);
    setDialogOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPosition) return;

    try {
      await api.put(`/api/positions/${selectedPosition._id}`, {
        gradingScale: selectedPosition.gradingScale
      });
      await fetchPositions();
      handleCloseDialog();
    } catch (err) {
      setError('Failed to update position');
      console.error('Error updating position:', err);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Position Grading Scales
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
              Edit Grading Scale
            </Button>
          </Box>

          {position.gradingScale && (
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Current Grading Scale
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2">
                    Scale: {position.gradingScale.scale}
                  </Typography>
                  <Typography variant="body2">
                    Range: {position.gradingScale.currency} {position.gradingScale.minRate} - {position.gradingScale.maxRate}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2">
                    Effective: {new Date(position.gradingScale.effectiveDate).toLocaleDateString()}
                  </Typography>
                  {position.gradingScale.endDate && (
                    <Typography variant="body2">
                      End: {new Date(position.gradingScale.endDate).toLocaleDateString()}
                    </Typography>
                  )}
                </Box>
              </Box>

              {position.gradingScale.benefits && position.gradingScale.benefits.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>Benefits</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {position.gradingScale.benefits.map((benefit, index) => (
                      <Box key={index} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ flex: 1 }}>
                          {benefit.type}: {benefit.value} ({benefit.frequency})
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </Paper>
      ))}

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Edit Grading Scale</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            {selectedPosition && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    label="Scale"
                    value={selectedPosition.gradingScale?.scale || ''}
                    onChange={(e) => setSelectedPosition({
                      ...selectedPosition,
                      gradingScale: {
                        scale: e.target.value,
                        currency: selectedPosition.gradingScale?.currency || 'USD',
                        minRate: selectedPosition.gradingScale?.minRate || 0,
                        maxRate: selectedPosition.gradingScale?.maxRate || 0,
                        effectiveDate: selectedPosition.gradingScale?.effectiveDate || new Date().toISOString().split('T')[0],
                        endDate: selectedPosition.gradingScale?.endDate,
                        benefits: selectedPosition.gradingScale?.benefits
                      }
                    })}
                    fullWidth
                  />
                  <TextField
                    label="Currency"
                    value={selectedPosition.gradingScale?.currency || ''}
                    onChange={(e) => setSelectedPosition({
                      ...selectedPosition,
                      gradingScale: {
                        scale: selectedPosition.gradingScale?.scale || '',
                        currency: e.target.value,
                        minRate: selectedPosition.gradingScale?.minRate || 0,
                        maxRate: selectedPosition.gradingScale?.maxRate || 0,
                        effectiveDate: selectedPosition.gradingScale?.effectiveDate || new Date().toISOString().split('T')[0],
                        endDate: selectedPosition.gradingScale?.endDate,
                        benefits: selectedPosition.gradingScale?.benefits
                      }
                    })}
                    fullWidth
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    label="Min Rate"
                    type="number"
                    value={selectedPosition.gradingScale?.minRate || ''}
                    onChange={(e) => setSelectedPosition({
                      ...selectedPosition,
                      gradingScale: {
                        scale: selectedPosition.gradingScale?.scale || '',
                        currency: selectedPosition.gradingScale?.currency || 'USD',
                        minRate: Number(e.target.value),
                        maxRate: selectedPosition.gradingScale?.maxRate || 0,
                        effectiveDate: selectedPosition.gradingScale?.effectiveDate || new Date().toISOString().split('T')[0],
                        endDate: selectedPosition.gradingScale?.endDate,
                        benefits: selectedPosition.gradingScale?.benefits
                      }
                    })}
                    fullWidth
                  />
                  <TextField
                    label="Max Rate"
                    type="number"
                    value={selectedPosition.gradingScale?.maxRate || ''}
                    onChange={(e) => setSelectedPosition({
                      ...selectedPosition,
                      gradingScale: {
                        scale: selectedPosition.gradingScale?.scale || '',
                        currency: selectedPosition.gradingScale?.currency || 'USD',
                        minRate: selectedPosition.gradingScale?.minRate || 0,
                        maxRate: Number(e.target.value),
                        effectiveDate: selectedPosition.gradingScale?.effectiveDate || new Date().toISOString().split('T')[0],
                        endDate: selectedPosition.gradingScale?.endDate,
                        benefits: selectedPosition.gradingScale?.benefits
                      }
                    })}
                    fullWidth
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    label="Effective Date"
                    type="date"
                    value={selectedPosition.gradingScale?.effectiveDate || ''}
                    onChange={(e) => setSelectedPosition({
                      ...selectedPosition,
                      gradingScale: {
                        scale: selectedPosition.gradingScale?.scale || '',
                        currency: selectedPosition.gradingScale?.currency || 'USD',
                        minRate: selectedPosition.gradingScale?.minRate || 0,
                        maxRate: selectedPosition.gradingScale?.maxRate || 0,
                        effectiveDate: e.target.value,
                        endDate: selectedPosition.gradingScale?.endDate,
                        benefits: selectedPosition.gradingScale?.benefits
                      }
                    })}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    label="End Date"
                    type="date"
                    value={selectedPosition.gradingScale?.endDate || ''}
                    onChange={(e) => setSelectedPosition({
                      ...selectedPosition,
                      gradingScale: {
                        scale: selectedPosition.gradingScale?.scale || '',
                        currency: selectedPosition.gradingScale?.currency || 'USD',
                        minRate: selectedPosition.gradingScale?.minRate || 0,
                        maxRate: selectedPosition.gradingScale?.maxRate || 0,
                        effectiveDate: selectedPosition.gradingScale?.effectiveDate || new Date().toISOString().split('T')[0],
                        endDate: e.target.value,
                        benefits: selectedPosition.gradingScale?.benefits
                      }
                    })}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              Save Changes
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default GradingScales; 