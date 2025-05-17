import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { 
  User,
  Briefcase,
  GraduationCap,
  Languages,
  FileText,
  Building,
  CreditCard,
  Shield,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Plus,
  Save
} from 'lucide-react';

interface EmployeeProfileProps {
  employee: any; // Replace with proper type from your schema
  onUpdate: (employeeId: string, data: any) => Promise<void>;
}

export function EmployeeProfile({ employee, onUpdate }: EmployeeProfileProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('basic');

  const handleSave = async (section: string, data: any) => {
    try {
      await onUpdate(employee.id, { [section]: data });
      toast({
        title: 'Success',
        description: 'Employee information updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update employee information',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
          <TabsTrigger value="basic">
            <User className="mr-2 h-4 w-4" />
            Basic Info
          </TabsTrigger>
          <TabsTrigger value="employment">
            <Briefcase className="mr-2 h-4 w-4" />
            Employment
          </TabsTrigger>
          <TabsTrigger value="education">
            <GraduationCap className="mr-2 h-4 w-4" />
            Education
          </TabsTrigger>
          <TabsTrigger value="skills">
            <Languages className="mr-2 h-4 w-4" />
            Skills
          </TabsTrigger>
          <TabsTrigger value="documents">
            <FileText className="mr-2 h-4 w-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="banking">
            <CreditCard className="mr-2 h-4 w-4" />
            Banking
          </TabsTrigger>
        </TabsList>

        {/* Basic Information */}
        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Employee Number</Label>
                  <Input value={employee.employeeNumber} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input value={`${employee.firstName} ${employee.lastName}`} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <Input type="date" value={employee.dateOfBirth} />
                </div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select value={employee.gender}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Marital Status</Label>
                  <Select value={employee.maritalStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="married">Married</SelectItem>
                      <SelectItem value="divorced">Divorced</SelectItem>
                      <SelectItem value="widowed">Widowed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Employment Information */}
        <TabsContent value="employment">
          <Card>
            <CardHeader>
              <CardTitle>Employment Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Employment Date</Label>
                  <Input type="date" value={employee.employmentDate} />
                </div>
                <div className="space-y-2">
                  <Label>Employment Grade</Label>
                  <Input value={employee.employmentGrade} />
                </div>
                <div className="space-y-2">
                  <Label>Position</Label>
                  <Input value={employee.position} />
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Input value={employee.department} />
                </div>
                <div className="space-y-2">
                  <Label>Contract Type</Label>
                  <Select value={employee.contractType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select contract type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full Time</SelectItem>
                      <SelectItem value="part-time">Part Time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="temporary">Temporary</SelectItem>
                      <SelectItem value="intern">Intern</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Contract Expiry Date</Label>
                  <Input type="date" value={employee.contractExpiryDate} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Education */}
        <TabsContent value="education">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Education History</CardTitle>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Education
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {employee.education?.map((edu: any, index: number) => (
                <div key={index} className="border rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Degree</Label>
                      <Input value={edu.degree} />
                    </div>
                    <div className="space-y-2">
                      <Label>Institution</Label>
                      <Input value={edu.institution} />
                    </div>
                    <div className="space-y-2">
                      <Label>Field of Study</Label>
                      <Input value={edu.fieldOfStudy} />
                    </div>
                    <div className="space-y-2">
                      <Label>Grade</Label>
                      <Input value={edu.grade} />
                    </div>
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Input type="date" value={edu.startDate} />
                    </div>
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Input type="date" value={edu.endDate} />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Skills */}
        <TabsContent value="skills">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Skills & Competencies</CardTitle>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Skill
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {employee.competencies?.map((comp: any, index: number) => (
                <div key={index} className="border rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Input value={comp.category} />
                    </div>
                    <div className="space-y-2">
                      <Label>Proficiency</Label>
                      <Select value={comp.proficiency}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select proficiency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                          <SelectItem value="expert">Expert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label>Skills</Label>
                      <Textarea value={comp.skills.join(', ')} />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents */}
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Legal Documents</CardTitle>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Document
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {employee.documents?.map((doc: any, index: number) => (
                <div key={index} className="border rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Document Type</Label>
                      <Select value={doc.type}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select document type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="passport">Passport</SelectItem>
                          <SelectItem value="visa">Visa</SelectItem>
                          <SelectItem value="labor_card">Labor Card</SelectItem>
                          <SelectItem value="driving_license">Driving License</SelectItem>
                          <SelectItem value="work_permit">Work Permit</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Document Number</Label>
                      <Input value={doc.number} />
                    </div>
                    <div className="space-y-2">
                      <Label>Issue Date</Label>
                      <Input type="date" value={doc.issueDate} />
                    </div>
                    <div className="space-y-2">
                      <Label>Expiry Date</Label>
                      <Input type="date" value={doc.expiryDate} />
                    </div>
                    <div className="space-y-2">
                      <Label>Issuing Authority</Label>
                      <Input value={doc.issuingAuthority} />
                    </div>
                    <div className="space-y-2">
                      <Label>Verification Status</Label>
                      <Select value={doc.isVerified ? 'verified' : 'pending'}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="verified">Verified</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Banking Information */}
        <TabsContent value="banking">
          <Card>
            <CardHeader>
              <CardTitle>Banking Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Bank Name</Label>
                  <Input value={employee.bankDetails?.bankName} />
                </div>
                <div className="space-y-2">
                  <Label>Branch Name</Label>
                  <Input value={employee.bankDetails?.branchName} />
                </div>
                <div className="space-y-2">
                  <Label>Account Number</Label>
                  <Input value={employee.bankDetails?.accountNumber} />
                </div>
                <div className="space-y-2">
                  <Label>Account Type</Label>
                  <Input value={employee.bankDetails?.accountType} />
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Input value={employee.bankDetails?.currency} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 