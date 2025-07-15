import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { 
  Plus, 
  Search, 
  Filter, 
  Briefcase, 
  Users, 
  FileText, 
  Calendar,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  ArrowLeft
} from 'lucide-react';
import ModuleLayout from '@/components/layout/ModuleLayout';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';

interface JobPosting {
  _id: string;
  title: string;
  department: string;
  location: string;
  employmentType: string;
  experienceLevel: string;
  salary: {
    min?: number;
    max?: number;
    currency?: string;
    isNegotiable?: boolean;
  };
  description: string;
  requirements: {
    skills?: string[];
    experience?: number;
    education?: string;
    certifications?: string[];
    languages?: string[];
  };
  responsibilities?: string[];
  benefits?: string[];
  applicationDeadline?: string;
  status: string;
  isPublic: boolean;
  publicId: string;
  applications: number;
  createdAt: string;
  updatedAt: string;
}

interface Candidate {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  status: string;
  appliedDate: string;
  experience?: number;
  education?: string;
  skills?: string[];
  resumeUrl?: string;
  notes?: string;
}

export default function HiringPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('postings');
  const [showJobModal, setShowJobModal] = useState(false);
  const [jobForm, setJobForm] = useState({
    title: '',
    department: '',
    location: '',
    employmentType: 'full-time',
    experienceLevel: 'entry',
    salaryMin: '',
    salaryMax: '',
    currency: 'USD',
    isNegotiable: true,
    description: '',
    requirements: '',
    responsibilities: '',
    benefits: '',
    applicationDeadline: '',
    isPublic: true
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchHiringData();
  }, []);

  const fetchHiringData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching hiring data...');
      
      // Fetch job postings from backend
      const jobPostingsResponse = await fetch('/api/hiring/job-postings', { credentials: 'include' });
      console.log('📡 Job postings response status:', jobPostingsResponse.status);
      
      if (!jobPostingsResponse.ok) {
        const errorText = await jobPostingsResponse.text();
        console.error('❌ Hiring API error:', jobPostingsResponse.status, errorText);
        throw new Error(`API Error: ${jobPostingsResponse.status} - ${errorText.substring(0, 100)}`);
      }
      
      const jobPostings: JobPosting[] = await jobPostingsResponse.json();
      console.log('📋 Received job postings:', jobPostings);
      setJobPostings(jobPostings);
      
      // Optionally, fetch candidates/applications for the first job posting
      if (jobPostings.length > 0) {
        console.log('👥 Fetching applications for job:', jobPostings[0]._id);
        const applicationsResponse = await fetch(`/api/hiring/applications?jobPostingId=${jobPostings[0]._id}`, { credentials: 'include' });
        let candidates: Candidate[] = [];
        if (applicationsResponse.ok) {
          candidates = await applicationsResponse.json();
          console.log('📄 Received applications:', candidates);
        }
        setCandidates(candidates);
      } else {
        console.log('📭 No job postings found, setting empty candidates');
      setCandidates([]);
      }
    } catch (error) {
      console.error('💥 Error fetching hiring data:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fetch hiring data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      console.log('✅ Fetching completed');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCandidateStatusColor = (status: string) => {
    switch (status) {
      case 'applied': return 'bg-blue-100 text-blue-800';
      case 'screening': return 'bg-yellow-100 text-yellow-800';
      case 'interviewed': return 'bg-purple-100 text-purple-800';
      case 'offered': return 'bg-green-100 text-green-800';
      case 'hired': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCandidateStatusIcon = (status: string) => {
    switch (status) {
      case 'applied': return <FileText className="h-4 w-4" />;
      case 'screening': return <AlertCircle className="h-4 w-4" />;
      case 'interviewed': return <Users className="h-4 w-4" />;
      case 'offered': return <CheckCircle className="h-4 w-4" />;
      case 'hired': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const handleJobFormChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setJobForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCreateJobPosting = async (e: any) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/hiring/job-postings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: jobForm.title,
          department: jobForm.department,
          location: jobForm.location,
          employmentType: jobForm.employmentType,
          experienceLevel: jobForm.experienceLevel,
          salary: {
            min: jobForm.salaryMin ? Number(jobForm.salaryMin) : undefined,
            max: jobForm.salaryMax ? Number(jobForm.salaryMax) : undefined,
            currency: jobForm.currency,
            isNegotiable: jobForm.isNegotiable
          },
          description: jobForm.description,
          requirements: {
            skills: jobForm.requirements.split(',').map((s: string) => s.trim()).filter(Boolean),
            experience: undefined,
            education: undefined,
            certifications: [],
            languages: []
          },
          responsibilities: jobForm.responsibilities.split(',').map((s: string) => s.trim()).filter(Boolean),
          benefits: jobForm.benefits.split(',').map((s: string) => s.trim()).filter(Boolean),
          applicationDeadline: jobForm.applicationDeadline || undefined,
          isPublic: jobForm.isPublic
        })
      });
      if (res.ok) {
        setShowJobModal(false);
        setJobForm({
          title: '', department: '', location: '', employmentType: 'full-time', experienceLevel: 'entry', salaryMin: '', salaryMax: '', currency: 'USD', isNegotiable: true, description: '', requirements: '', responsibilities: '', benefits: '', applicationDeadline: '', isPublic: true
        });
        fetchHiringData();
        toast({ title: 'Success', description: 'Job posting created.' });
      } else {
        const err = await res.json();
        toast({ title: 'Error', description: err.error || 'Failed to create job posting', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create job posting', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (!user || !['owner', 'admin', 'hr_admin'].includes(user.role?.toLowerCase())) {
    setLocation('/dashboard');
    return null;
  }

  return (
    <ModuleLayout>
      <div className="container mx-auto py-6">
        {/* Back Button */}
        <div className="mb-4">
          <Button 
            variant="ghost" 
            onClick={() => setLocation('/hr')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to HR Dashboard
          </Button>
        </div>
        
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Hiring Management</h1>
            <p className="text-muted-foreground">Manage job postings, candidates, and hiring process</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
            <Button onClick={() => setShowJobModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Job Posting
            </Button>
          </div>
        </div>

        <Dialog open={showJobModal} onOpenChange={setShowJobModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>New Job Posting</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateJobPosting} className="flex-1 overflow-y-auto space-y-6 pr-2">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Title *</Label>
                    <Input name="title" value={jobForm.title} onChange={handleJobFormChange} required />
                  </div>
                  <div>
                    <Label>Department *</Label>
                    <Input name="department" value={jobForm.department} onChange={handleJobFormChange} required />
                  </div>
                  <div>
                    <Label>Location *</Label>
                    <Input name="location" value={jobForm.location} onChange={handleJobFormChange} required />
                  </div>
                  <div>
                    <Label>Employment Type *</Label>
                    <Select name="employmentType" value={jobForm.employmentType} onValueChange={v => setJobForm(f => ({ ...f, employmentType: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full-time">Full-time</SelectItem>
                        <SelectItem value="part-time">Part-time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="temporary">Temporary</SelectItem>
                        <SelectItem value="intern">Intern</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Experience Level *</Label>
                    <Select name="experienceLevel" value={jobForm.experienceLevel} onValueChange={v => setJobForm(f => ({ ...f, experienceLevel: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entry">Entry</SelectItem>
                        <SelectItem value="junior">Junior</SelectItem>
                        <SelectItem value="mid">Mid</SelectItem>
                        <SelectItem value="senior">Senior</SelectItem>
                        <SelectItem value="lead">Lead</SelectItem>
                        <SelectItem value="executive">Executive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Application Deadline</Label>
                    <Input name="applicationDeadline" type="date" value={jobForm.applicationDeadline} onChange={handleJobFormChange} />
                  </div>
                </div>
              </div>

              {/* Salary Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Salary Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Salary Min</Label>
                    <Input name="salaryMin" type="number" value={jobForm.salaryMin} onChange={handleJobFormChange} min={0} placeholder="0" />
                  </div>
                  <div>
                    <Label>Salary Max</Label>
                    <Input name="salaryMax" type="number" value={jobForm.salaryMax} onChange={handleJobFormChange} min={0} placeholder="0" />
                  </div>
                  <div>
                    <Label>Currency</Label>
                    <Input name="currency" value={jobForm.currency} onChange={handleJobFormChange} placeholder="USD" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" name="isNegotiable" checked={jobForm.isNegotiable} onChange={handleJobFormChange} />
                  <Label htmlFor="isNegotiable">Salary is negotiable</Label>
                </div>
              </div>

              {/* Job Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Job Details</h3>
                <div>
                  <Label>Description *</Label>
                  <Textarea name="description" value={jobForm.description} onChange={handleJobFormChange} required rows={4} placeholder="Provide a detailed description of the role..." />
                </div>
                <div>
                  <Label>Requirements (comma separated)</Label>
                  <Textarea name="requirements" value={jobForm.requirements} onChange={handleJobFormChange} rows={3} placeholder="e.g., JavaScript, React, 3+ years experience" />
                </div>
                <div>
                  <Label>Responsibilities (comma separated)</Label>
                  <Textarea name="responsibilities" value={jobForm.responsibilities} onChange={handleJobFormChange} rows={3} placeholder="e.g., Develop features, Code review, Team collaboration" />
                </div>
                <div>
                  <Label>Benefits (comma separated)</Label>
                  <Textarea name="benefits" value={jobForm.benefits} onChange={handleJobFormChange} rows={3} placeholder="e.g., Health insurance, Remote work, Professional development" />
                </div>
              </div>

              {/* Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Settings</h3>
                <div className="flex items-center gap-2">
                  <input type="checkbox" name="isPublic" checked={jobForm.isPublic} onChange={handleJobFormChange} />
                  <Label htmlFor="isPublic">Make this job posting public</Label>
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea name="description" value={jobForm.description} onChange={handleJobFormChange} required />
              </div>
              <div>
                <Label>Requirements (comma separated)</Label>
                <Textarea name="requirements" value={jobForm.requirements} onChange={handleJobFormChange} />
              </div>
              <div>
                <Label>Responsibilities (comma separated)</Label>
                <Textarea name="responsibilities" value={jobForm.responsibilities} onChange={handleJobFormChange} />
              </div>
              <div>
                <Label>Benefits (comma separated)</Label>
                <Textarea name="benefits" value={jobForm.benefits} onChange={handleJobFormChange} />
              </div>
              <DialogFooter className="flex-shrink-0 pt-4 border-t">
                <Button type="submit" disabled={submitting}>{submitting ? 'Creating...' : 'Create'}</Button>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="postings">Job Postings</TabsTrigger>
            <TabsTrigger value="candidates">Candidates</TabsTrigger>
            <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
          </TabsList>

          <TabsContent value="postings" className="space-y-6">
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search job postings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
              </div>
            ) : jobPostings.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-8">
                  <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Job Postings</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Create your first job posting to start attracting candidates.
                  </p>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Job Posting
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {jobPostings
                  .filter(posting => 
                    posting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    posting.department.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .filter(posting => filterStatus === 'all' || posting.status === filterStatus)
                  .map((posting) => (
                    <Card key={posting._id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h3 className="text-xl font-semibold">{posting.title}</h3>
                              <Badge className={getStatusColor(posting.status)}>
                                {posting.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Briefcase className="h-4 w-4" />
                                {posting.department}
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {posting.location}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {posting.employmentType}
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {posting.applications} applications
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {posting.description}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>Posted: {new Date(posting.createdAt).toLocaleDateString()}</span>
                              <span>•</span>
                              <span>Deadline: {posting.applicationDeadline ? new Date(posting.applicationDeadline).toLocaleDateString() : 'N/A'}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              View Applications
                            </Button>
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                            <div className="flex gap-2 mt-4">
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                              {posting.isPublic && posting.status === 'published' && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => window.open(`/jobs/${posting.publicId}`, '_blank')}
                                >
                                  <ExternalLink className="h-4 w-4 mr-1" />
                                  Public Link
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="candidates" className="space-y-6">
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search candidates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="screening">Screening</SelectItem>
                  <SelectItem value="interviewed">Interviewed</SelectItem>
                  <SelectItem value="offered">Offered</SelectItem>
                  <SelectItem value="hired">Hired</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
              </div>
            ) : candidates.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-8">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Candidates</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Candidates will appear here once they apply to your job postings.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {candidates
                  .filter(candidate => 
                    `${candidate.firstName} ${candidate.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    candidate.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    candidate.email.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .filter(candidate => filterStatus === 'all' || candidate.status === filterStatus)
                  .map((candidate) => (
                    <Card key={candidate._id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h3 className="text-xl font-semibold">{candidate.firstName} {candidate.lastName}</h3>
                              <Badge className={getCandidateStatusColor(candidate.status)}>
                                {getCandidateStatusIcon(candidate.status)}
                                {candidate.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Briefcase className="h-4 w-4" />
                                {candidate.status === 'offered' ? 'Position: ' + jobPostings.find(j => j._id === candidate.status)?.title : candidate.status}
                              </div>
                              <div className="flex items-center gap-1">
                                <Mail className="h-4 w-4" />
                                {candidate.email}
                              </div>
                              <div className="flex items-center gap-1">
                                <Phone className="h-4 w-4" />
                                {candidate.phone}
                              </div>
                              <div className="flex items-center gap-1">
                                <GraduationCap className="h-4 w-4" />
                                {candidate.education}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {candidate.experience} years
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {candidate.skills?.slice(0, 5).map((skill, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                              {candidate.skills && candidate.skills.length > 5 && (
                                <Badge variant="outline" className="text-xs">
                                  +{candidate.skills.length - 5} more
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Applied: {new Date(candidate.appliedDate).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              View Profile
                            </Button>
                            <Button variant="outline" size="sm">
                              Schedule Interview
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="onboarding" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Onboarding Process</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Streamline the onboarding process for new hires with automated workflows.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Onboarding Checklist</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Document collection</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Equipment setup</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Training schedule</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Team introduction</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Automated Tasks</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Email notifications</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Account creation</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Welcome package</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Progress tracking</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ModuleLayout>
  );
} 