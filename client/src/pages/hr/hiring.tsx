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
  AlertCircle
} from 'lucide-react';
import ModuleLayout from '@/components/layout/ModuleLayout';

interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'intern';
  status: 'open' | 'closed' | 'draft';
  applications: number;
  postedDate: string;
  deadline: string;
  description: string;
  requirements: string[];
}

interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  status: 'applied' | 'screening' | 'interviewed' | 'offered' | 'hired' | 'rejected';
  appliedDate: string;
  experience: number;
  education: string;
  skills: string[];
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

  useEffect(() => {
    fetchHiringData();
  }, []);

  const fetchHiringData = async () => {
    try {
      setLoading(true);
      
      // TODO: Replace with actual API calls
      // const jobPostingsResponse = await fetch('/api/hr/hiring/job-postings');
      // const candidatesResponse = await fetch('/api/hr/hiring/candidates');
      
      // For now, using empty arrays
      setJobPostings([]);
      setCandidates([]);
    } catch (error) {
      console.error('Error fetching hiring data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch hiring data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
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

  if (!user || !['owner', 'admin', 'hr_admin'].includes(user.role?.toLowerCase())) {
    setLocation('/dashboard');
    return null;
  }

  return (
    <ModuleLayout>
      <div className="container mx-auto py-6">
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
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Job Posting
            </Button>
          </div>
        </div>

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
                    <Card key={posting.id} className="hover:shadow-md transition-shadow">
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
                                {posting.type}
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
                              <span>Posted: {new Date(posting.postedDate).toLocaleDateString()}</span>
                              <span>•</span>
                              <span>Deadline: {new Date(posting.deadline).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              View Applications
                            </Button>
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
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
                    candidate.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    candidate.email.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .filter(candidate => filterStatus === 'all' || candidate.status === filterStatus)
                  .map((candidate) => (
                    <Card key={candidate.id} className="hover:shadow-md transition-shadow">
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
                                {candidate.position}
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
                              {candidate.skills.slice(0, 5).map((skill, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                              {candidate.skills.length > 5 && (
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