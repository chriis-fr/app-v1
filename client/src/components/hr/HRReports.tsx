import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Download, FileText, Users, Building2, Briefcase, GraduationCap, PersonStanding, Target, Network, Layers, UserX, DollarSign, BarChart } from 'lucide-react';
import { toast } from 'sonner';

interface ReportConfig {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  fields: {
    id: string;
    label: string;
    type: 'date' | 'select' | 'number' | 'text';
    options?: { value: string; label: string }[];
    required?: boolean;
  }[];
}

const reportConfigs: ReportConfig[] = [
  {
    id: 'absences',
    name: 'Absences Report',
    description: 'Generate a report of employee absences with detailed information',
    icon: <FileText className="h-5 w-5" />,
    fields: [
      {
        id: 'effectiveDate',
        label: 'Effective Date',
        type: 'date',
        required: true
      },
      {
        id: 'organizationUnit',
        label: 'Organization Unit',
        type: 'select',
        options: [
          { value: 'all', label: 'All Units' },
          { value: 'hr', label: 'Human Resources' },
          { value: 'it', label: 'Information Technology' },
          { value: 'finance', label: 'Finance' }
        ],
        required: true
      },
      {
        id: 'dateFrom',
        label: 'Date From',
        type: 'date',
        required: true
      },
      {
        id: 'dateTo',
        label: 'Date To',
        type: 'date',
        required: true
      },
      {
        id: 'absenceType',
        label: 'Absence Type',
        type: 'select',
        options: [
          { value: 'all', label: 'All Types' },
          { value: 'sick', label: 'Sick Leave' },
          { value: 'annual', label: 'Annual Leave' },
          { value: 'unpaid', label: 'Unpaid Leave' }
        ]
      }
    ]
  },
  {
    id: 'assignment-status',
    name: 'Assignment Status Report',
    description: 'View the current status of employee assignments and positions',
    icon: <Briefcase className="h-5 w-5" />,
    fields: [
      {
        id: 'effectiveDate',
        label: 'Effective Date',
        type: 'date',
        required: true
      },
      {
        id: 'organizationStructure',
        label: 'Organization Structure',
        type: 'select',
        options: [
          { value: 'current', label: 'Current Structure' },
          { value: 'planned', label: 'Planned Structure' }
        ],
        required: true
      },
      {
        id: 'version',
        label: 'Version',
        type: 'text',
        required: true
      },
      {
        id: 'includeManagers',
        label: 'Include Managers',
        type: 'select',
        options: [
          { value: 'true', label: 'Yes' },
          { value: 'false', label: 'No' }
        ],
        required: true
      }
    ]
  },
  {
    id: 'employee-summary',
    name: 'Employee Summary Report',
    description: 'Get a comprehensive summary of employee information',
    icon: <Users className="h-5 w-5" />,
    fields: [
      {
        id: 'effectiveDate',
        label: 'Effective Date',
        type: 'date',
        required: true
      },
      {
        id: 'department',
        label: 'Department',
        type: 'select',
        options: [
          { value: 'all', label: 'All Departments' },
          { value: 'hr', label: 'Human Resources' },
          { value: 'it', label: 'Information Technology' },
          { value: 'finance', label: 'Finance' }
        ]
      }
    ]
  },
  {
    id: 'applicant-details',
    name: 'Applicant Details Report',
    description: 'View detailed information about job applicants',
    icon: <PersonStanding className="h-5 w-5" />,
    fields: [
      {
        id: 'dateFrom',
        label: 'Date From',
        type: 'date',
        required: true
      },
      {
        id: 'dateTo',
        label: 'Date To',
        type: 'date',
        required: true
      },
      {
        id: 'status',
        label: 'Application Status',
        type: 'select',
        options: [
          { value: 'all', label: 'All Statuses' },
          { value: 'pending', label: 'Pending' },
          { value: 'interviewed', label: 'Interviewed' },
          { value: 'offered', label: 'Offered' },
          { value: 'rejected', label: 'Rejected' }
        ]
      }
    ]
  },
  {
    id: 'skills-matching',
    name: 'Skills Matching Report',
    description: 'Analyze employee skills against job requirements',
    icon: <Target className="h-5 w-5" />,
    fields: [
      {
        id: 'effectiveDate',
        label: 'Effective Date',
        type: 'date',
        required: true
      },
      {
        id: 'matchThreshold',
        label: 'Match Threshold (%)',
        type: 'number',
        required: true
      }
    ]
  },
  {
    id: 'org-hierarchy',
    name: 'Organization Hierarchy Report',
    description: 'View the organizational structure and reporting lines',
    icon: <Network className="h-5 w-5" />,
    fields: [
      {
        id: 'effectiveDate',
        label: 'Effective Date',
        type: 'date',
        required: true
      },
      {
        id: 'version',
        label: 'Version',
        type: 'text',
        required: true
      },
      {
        id: 'showManagers',
        label: 'Show Managers',
        type: 'select',
        options: [
          { value: 'true', label: 'Yes' },
          { value: 'false', label: 'No' }
        ],
        required: true
      }
    ]
  },
  {
    id: 'position-hierarchy',
    name: 'Position Hierarchy Report',
    description: 'View the hierarchy of positions and their relationships',
    icon: <Layers className="h-5 w-5" />,
    fields: [
      {
        id: 'effectiveDate',
        label: 'Effective Date',
        type: 'date',
        required: true
      },
      {
        id: 'version',
        label: 'Version',
        type: 'text',
        required: true
      },
      {
        id: 'showHolders',
        label: 'Show Position Holders',
        type: 'select',
        options: [
          { value: 'true', label: 'Yes' },
          { value: 'false', label: 'No' }
        ],
        required: true
      }
    ]
  },
  {
    id: 'terminations',
    name: 'Terminations Report',
    description: 'View information about employee terminations',
    icon: <UserX className="h-5 w-5" />,
    fields: [
      {
        id: 'dateFrom',
        label: 'Date From',
        type: 'date',
        required: true
      },
      {
        id: 'dateTo',
        label: 'Date To',
        type: 'date',
        required: true
      },
      {
        id: 'reason',
        label: 'Termination Reason',
        type: 'select',
        options: [
          { value: 'all', label: 'All Reasons' },
          { value: 'resignation', label: 'Resignation' },
          { value: 'termination', label: 'Termination' },
          { value: 'retirement', label: 'Retirement' }
        ]
      }
    ]
  },
  {
    id: 'payroll-movements',
    name: 'Payroll Movements Report',
    description: 'Track changes in employee compensation',
    icon: <DollarSign className="h-5 w-5" />,
    fields: [
      {
        id: 'dateFrom',
        label: 'Date From',
        type: 'date',
        required: true
      },
      {
        id: 'dateTo',
        label: 'Date To',
        type: 'date',
        required: true
      },
      {
        id: 'movementType',
        label: 'Movement Type',
        type: 'select',
        options: [
          { value: 'all', label: 'All Types' },
          { value: 'salary', label: 'Salary Change' },
          { value: 'bonus', label: 'Bonus' },
          { value: 'allowance', label: 'Allowance' }
        ]
      }
    ]
  },
  {
    id: 'employee-count',
    name: 'Employee Count Report',
    description: 'View employee counts by various categories',
    icon: <BarChart className="h-5 w-5" />,
    fields: [
      {
        id: 'effectiveDate',
        label: 'Effective Date',
        type: 'date',
        required: true
      },
      {
        id: 'groupBy',
        label: 'Group By',
        type: 'select',
        options: [
          { value: 'department', label: 'Department' },
          { value: 'position', label: 'Position' },
          { value: 'grade', label: 'Grade' }
        ],
        required: true
      }
    ]
  }
];

export function HRReports() {
  const [selectedReport, setSelectedReport] = useState<string>('');
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isGenerating, setIsGenerating] = useState(false);

  const handleReportSelect = (reportId: string) => {
    setSelectedReport(reportId);
    setFormData({});
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleGenerateReport = async () => {
    if (!selectedReport) return;

    const report = reportConfigs.find(r => r.id === selectedReport);
    if (!report) return;

    // Validate required fields
    const missingFields = report.fields
      .filter(field => field.required && !formData[field.id])
      .map(field => field.label);

    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch(`/api/reports/${selectedReport}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedReport}-report.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Report generated successfully');
    } catch (error) {
      toast.error('Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  const renderField = (field: ReportConfig['fields'][0]) => {
    switch (field.type) {
      case 'date':
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData[field.id] ? (
                  format(new Date(formData[field.id]), 'PPP')
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData[field.id] ? new Date(formData[field.id]) : undefined}
                onSelect={(date) => handleFieldChange(field.id, date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );
      case 'select':
        return (
          <Select
            value={formData[field.id] || ''}
            onValueChange={(value) => handleFieldChange(field.id, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${field.label}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'number':
        return (
          <Input
            type="number"
            value={formData[field.id] || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={`Enter ${field.label}`}
          />
        );
      default:
        return (
          <Input
            value={formData[field.id] || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={`Enter ${field.label}`}
          />
        );
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportConfigs.map((report) => (
          <Card
            key={report.id}
            className={`cursor-pointer transition-all ${
              selectedReport === report.id
                ? 'border-primary shadow-lg'
                : 'hover:border-primary/50'
            }`}
            onClick={() => handleReportSelect(report.id)}
          >
            <CardHeader>
              <div className="flex items-center gap-2">
                {report.icon}
                <CardTitle>{report.name}</CardTitle>
              </div>
              <CardDescription>{report.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      {selectedReport && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Generate Report</CardTitle>
            <CardDescription>
              Fill in the required information to generate the report
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reportConfigs
                .find((r) => r.id === selectedReport)
                ?.fields.map((field) => (
                  <div key={field.id} className="space-y-2">
                    <Label htmlFor={field.id}>
                      {field.label}
                      {field.required && <span className="text-red-500">*</span>}
                    </Label>
                    {renderField(field)}
                  </div>
                ))}
            </div>
            <div className="mt-6">
              <Button
                onClick={handleGenerateReport}
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  'Generating...'
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Generate Report
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 