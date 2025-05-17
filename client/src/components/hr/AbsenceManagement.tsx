import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar as CalendarIcon,
  FileText,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Upload,
  Plus,
  Search,
  Filter,
  Download,
  BarChart,
  Users,
  Clock4,
  CalendarDays,
  FileWarning,
  MessageSquare
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface AbsenceType {
  id: string;
  name: string;
  code: string;
  category: 'SICKNESS' | 'ANNUAL' | 'STUDY' | 'COMPASSIONATE' | 'DEPENDENT' | 'CAREER_BREAK' | 'UNPAID' | 'OTHER';
  requiresApproval: boolean;
  requiresDocumentation: boolean;
  maxDuration: number;
  paid: boolean;
  description: string;
}

interface SicknessType {
  id: string;
  name: string;
  code: string;
  requiresMedicalCertificate: boolean;
  maxDuration: number;
  description: string;
}

interface AbsenceRecord {
  id: string;
  employeeId: string;
  type: string;
  sicknessType?: string;
  startDate: Date;
  endDate: Date;
  duration: number;
  hours?: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  reason: string;
  documentation: Array<{
    type: string;
    url: string;
    uploadedAt: Date;
  }>;
  approvedBy?: string;
  approvedAt?: Date;
  notes: Array<{
    content: string;
    addedBy: string;
    addedAt: Date;
  }>;
}

interface LeaveEntitlement {
  id: string;
  employeeId: string;
  year: number;
  type: string;
  totalDays: number;
  usedDays: number;
  remainingDays: number;
  carriedOverDays: number;
  expiresAt?: Date;
}

interface AbsenceManagementProps {
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    department: string;
    grade: string;
    startDate: Date;
  };
  onRequestAbsence: (absence: Partial<AbsenceRecord>) => Promise<void>;
  onApproveAbsence: (absenceId: string) => Promise<void>;
  onRejectAbsence: (absenceId: string, reason: string) => Promise<void>;
  onAddNote: (absenceId: string, note: string) => Promise<void>;
  onUploadDocument: (absenceId: string, file: File) => Promise<void>;
}

export function AbsenceManagement({
  employee,
  onRequestAbsence,
  onApproveAbsence,
  onRejectAbsence,
  onAddNote,
  onUploadDocument
}: AbsenceManagementProps) {
  const { toast } = useToast();
  const [absenceTypes, setAbsenceTypes] = useState<AbsenceType[]>([]);
  const [sicknessTypes, setSicknessTypes] = useState<SicknessType[]>([]);
  const [absenceRecords, setAbsenceRecords] = useState<AbsenceRecord[]>([]);
  const [leaveEntitlements, setLeaveEntitlements] = useState<LeaveEntitlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('request');
  const [selectedAbsenceType, setSelectedAbsenceType] = useState<string>('');
  const [selectedSicknessType, setSelectedSicknessType] = useState<string>('');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [reason, setReason] = useState('');
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [note, setNote] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch absence types
      const absenceTypesResponse = await fetch('/api/hr/absence-types');
      const absenceTypesData = await absenceTypesResponse.json();
      setAbsenceTypes(absenceTypesData);

      // Fetch sickness types
      const sicknessTypesResponse = await fetch('/api/hr/sickness-types');
      const sicknessTypesData = await sicknessTypesResponse.json();
      setSicknessTypes(sicknessTypesData);

      // Fetch absence records
      const absenceRecordsResponse = await fetch(`/api/hr/employees/${employee.id}/absences`);
      const absenceRecordsData = await absenceRecordsResponse.json();
      setAbsenceRecords(absenceRecordsData);

      // Fetch leave entitlements
      const leaveEntitlementsResponse = await fetch(`/api/hr/employees/${employee.id}/leave-entitlements`);
      const leaveEntitlementsData = await leaveEntitlementsResponse.json();
      setLeaveEntitlements(leaveEntitlementsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch absence management data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAbsence = async () => {
    if (!selectedAbsenceType || !startDate || !endDate || !reason) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      const absenceType = absenceTypes.find(type => type.id === selectedAbsenceType);
      if (!absenceType) return;

      const absence: Partial<AbsenceRecord> = {
        type: selectedAbsenceType,
        sicknessType: absenceType.category === 'SICKNESS' ? selectedSicknessType : undefined,
        startDate,
        endDate,
        duration: Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
        reason,
      };

      await onRequestAbsence(absence);
      toast({
        title: 'Success',
        description: 'Absence request submitted successfully',
      });
      fetchData();
    } catch (error) {
      console.error('Error requesting absence:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit absence request',
        variant: 'destructive',
      });
    }
  };

  const handleUploadDocument = async (absenceId: string) => {
    if (!documentFile) {
      toast({
        title: 'Error',
        description: 'Please select a file to upload',
        variant: 'destructive',
      });
      return;
    }

    try {
      await onUploadDocument(absenceId, documentFile);
      toast({
        title: 'Success',
        description: 'Document uploaded successfully',
      });
      fetchData();
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload document',
        variant: 'destructive',
      });
    }
  };

  const handleAddNote = async (absenceId: string) => {
    if (!note) {
      toast({
        title: 'Error',
        description: 'Please enter a note',
        variant: 'destructive',
      });
      return;
    }

    try {
      await onAddNote(absenceId, note);
      toast({
        title: 'Success',
        description: 'Note added successfully',
      });
      setNote('');
      fetchData();
    } catch (error) {
      console.error('Error adding note:', error);
      toast({
        title: 'Error',
        description: 'Failed to add note',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-700';
      case 'REJECTED':
        return 'bg-red-100 text-red-700';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredAbsences = absenceRecords.filter(record => {
    const matchesStatus = filterStatus === 'all' || record.status === filterStatus;
    const matchesSearch = record.reason.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="request">
            <Plus className="mr-2 h-4 w-4" />
            Request Absence
          </TabsTrigger>
          <TabsTrigger value="history">
            <Clock className="mr-2 h-4 w-4" />
            Absence History
          </TabsTrigger>
          <TabsTrigger value="entitlements">
            <CalendarDays className="mr-2 h-4 w-4" />
            Leave Entitlements
          </TabsTrigger>
          <TabsTrigger value="reports">
            <BarChart className="mr-2 h-4 w-4" />
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="request">
          <Card>
            <CardHeader>
              <CardTitle>Request Absence</CardTitle>
              <CardDescription>Submit a new absence request</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Absence Type</Label>
                    <Select value={selectedAbsenceType} onValueChange={setSelectedAbsenceType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select absence type" />
                      </SelectTrigger>
                      <SelectContent>
                        {absenceTypes.map(type => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedAbsenceType && absenceTypes.find(t => t.id === selectedAbsenceType)?.category === 'SICKNESS' && (
                    <div className="space-y-2">
                      <Label>Sickness Type</Label>
                      <Select value={selectedSicknessType} onValueChange={setSelectedSicknessType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select sickness type" />
                        </SelectTrigger>
                        <SelectContent>
                          {sicknessTypes.map(type => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !startDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !endDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Reason</Label>
                  <Textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Enter the reason for absence"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Documentation</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
                    />
                    <Button variant="outline" size="icon">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Button onClick={handleRequestAbsence} className="w-full">
                  Submit Request
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Absence History</CardTitle>
              <CardDescription>View and manage absence records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search absences..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="APPROVED">Approved</SelectItem>
                      <SelectItem value="REJECTED">Rejected</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  {filteredAbsences.map((absence) => (
                    <Card key={absence.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">
                                {absenceTypes.find(t => t.id === absence.type)?.name}
                              </h3>
                              <Badge variant="outline" className={getStatusColor(absence.status)}>
                                {absence.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(absence.startDate), "PPP")} - {format(new Date(absence.endDate), "PPP")}
                            </p>
                            <p className="text-sm">{absence.reason}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {absence.status === 'PENDING' && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => onApproveAbsence(absence.id)}
                                >
                                  <CheckCircle2 className="mr-2 h-4 w-4" />
                                  Approve
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => onRejectAbsence(absence.id, rejectionReason)}
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </div>

                        {absence.documentation.length > 0 && (
                          <div className="mt-4">
                            <h4 className="text-sm font-medium mb-2">Documentation</h4>
                            <div className="flex items-center gap-2">
                              {absence.documentation.map((doc, index) => (
                                <Button
                                  key={index}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(doc.url, '_blank')}
                                >
                                  <FileText className="mr-2 h-4 w-4" />
                                  {doc.type}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}

                        {absence.notes.length > 0 && (
                          <div className="mt-4">
                            <h4 className="text-sm font-medium mb-2">Notes</h4>
                            <div className="space-y-2">
                              {absence.notes.map((note, index) => (
                                <div key={index} className="text-sm text-muted-foreground">
                                  <p>{note.content}</p>
                                  <p className="text-xs">
                                    Added by {note.addedBy} on {format(new Date(note.addedAt), "PPP")}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="mt-4 flex items-center gap-2">
                          <Input
                            placeholder="Add a note..."
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddNote(absence.id)}
                          >
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Add Note
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="entitlements">
          <Card>
            <CardHeader>
              <CardTitle>Leave Entitlements</CardTitle>
              <CardDescription>View and manage leave balances</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {leaveEntitlements.map((entitlement) => (
                  <div key={entitlement.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{entitlement.type}</h3>
                        <p className="text-sm text-muted-foreground">
                          Year {entitlement.year}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {entitlement.remainingDays} days remaining
                      </Badge>
                    </div>
                    <Progress
                      value={(entitlement.usedDays / entitlement.totalDays) * 100}
                      className="h-2"
                    />
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{entitlement.usedDays} days used</span>
                      <span>{entitlement.totalDays} days total</span>
                    </div>
                    {entitlement.carriedOverDays > 0 && (
                      <p className="text-sm text-muted-foreground">
                        {entitlement.carriedOverDays} days carried over from previous year
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Absence Reports</CardTitle>
              <CardDescription>Generate and view absence reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total Absences</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {absenceRecords.length}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        All time
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Sick Days</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {absenceRecords
                          .filter(r => r.type === 'SICKNESS')
                          .reduce((acc, curr) => acc + curr.duration, 0)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Days taken
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Annual Leave</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {absenceRecords
                          .filter(r => r.type === 'ANNUAL')
                          .reduce((acc, curr) => acc + curr.duration, 0)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Days taken
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex justify-end">
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 