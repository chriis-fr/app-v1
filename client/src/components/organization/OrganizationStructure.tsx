import React, { useState } from 'react';
import { Box, Tabs, Tab, Paper } from '@mui/material';
import OrganizationChart from './OrganizationChart';
import PositionManagement from './PositionManagement';
import CompetencyManagement from './CompetencyManagement';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`organization-tabpanel-${index}`}
      aria-labelledby={`organization-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const OrganizationStructure: React.FC = () => {
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs
          value={value}
          onChange={handleChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Organization Chart" />
          <Tab label="Position Management" />
          <Tab label="Competency Management" />
        </Tabs>
      </Paper>

      <TabPanel value={value} index={0}>
        <OrganizationChart />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <PositionManagement />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <CompetencyManagement />
      </TabPanel>
    </Box>
  );
};

export default OrganizationStructure; 