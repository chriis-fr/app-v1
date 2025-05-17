import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, CircularProgress, Alert } from '@mui/material';
import { TreeView, TreeItem } from '@mui/lab';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

interface OrganizationNode {
  _id: string;
  name: string;
  code: string;
  type: string;
  jobTitle?: string;
  department?: string;
  status: string;
  assignedEmployees: Array<{
    employeeId: {
      firstName: string;
      lastName: string;
      email: string;
    };
    assignmentType: string;
    status: string;
  }>;
  children: OrganizationNode[];
}

const OrganizationChart: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orgData, setOrgData] = useState<OrganizationNode[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchOrgChart = async () => {
      try {
        const response = await api.get('/organization/chart');
        setOrgData(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to load organization chart');
        console.error('Error fetching organization chart:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrgChart();
  }, []);

  const renderTree = (nodes: OrganizationNode) => {
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'Active':
          return 'success.main';
        case 'Vacant':
          return 'warning.main';
        case 'Inactive':
          return 'error.main';
        default:
          return 'text.primary';
      }
    };

    const getEmployeeInfo = (employees: OrganizationNode['assignedEmployees']) => {
      if (!employees || employees.length === 0) return 'Vacant';
      
      const primaryEmployee = employees.find(emp => emp.assignmentType === 'Primary' && emp.status === 'Active');
      if (primaryEmployee) {
        return `${primaryEmployee.employeeId.firstName} ${primaryEmployee.employeeId.lastName}`;
      }
      
      return `${employees.length} employee(s) assigned`;
    };

    return (
      <TreeItem
        key={nodes._id}
        nodeId={nodes._id}
        label={
          <Box sx={{ p: 1 }}>
            <Typography variant="subtitle1" component="div">
              {nodes.name}
            </Typography>
            {nodes.type === 'Position' && (
              <>
                <Typography variant="body2" color="text.secondary">
                  {nodes.jobTitle}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {nodes.department}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: getStatusColor(nodes.status) }}
                >
                  {getEmployeeInfo(nodes.assignedEmployees)}
                </Typography>
              </>
            )}
          </Box>
        }
      >
        {Array.isArray(nodes.children)
          ? nodes.children.map((node) => renderTree(node))
          : null}
      </TreeItem>
    );
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
    <Paper sx={{ p: 2, height: 'calc(100vh - 200px)', overflow: 'auto' }}>
      <TreeView
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
        sx={{ height: '100%', flexGrow: 1, maxWidth: '100%', overflowY: 'auto' }}
      >
        {orgData.map((node) => renderTree(node))}
      </TreeView>
    </Paper>
  );
};

export default OrganizationChart; 