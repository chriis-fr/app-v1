import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Users, 
  Calendar,
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Edit,
  Trash2,
  Eye,
  Download,
  Filter,
  Search,
  Building2,
  UserPlus,
  UserMinus,
  MessageSquare,
  FileText,
  Target,
  TrendingUp,
  Gavel,
  Vote
} from 'lucide-react';
import { api } from '@/lib/api';

interface CommitteeMember {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: string;
  joinDate: string;
  status: string;
  votingPower: number;
  expertise: string[];
}

interface CommitteeMeeting {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  duration: number;
  status: string;
  attendees: CommitteeMember[];
  agenda: MeetingAgendaItem[];
  decisions: CommitteeDecision[];
}

interface MeetingAgendaItem {
  id: string;
  title: string;
  description: string;
  presenter: string;
  duration: number;
  status: string;
}

interface CommitteeDecision {
  id: string;
  title: string;
  description: string;
  meetingId: string;
  decision: string;
  votes: DecisionVote[];
  approvedBy: string;
  approvedAt: string;
  implementationDate?: string;
}

interface DecisionVote {
  memberId: string;
  memberName: string;
  vote: 'approve' | 'reject' | 'abstain';
  comment?: string;
}

export default function ProcurementCommitteeManager() {
  const [members, setMembers] = useState<CommitteeMember[]>([]);
  const [meetings, setMeetings] = useState<CommitteeMeeting[]>([]);
  const [decisions, setDecisions] = useState<CommitteeDecision[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showCreateMeeting, setShowCreateMeeting] = useState(false);
  const [activeTab, setActiveTab] = useState('members');

  // Form states
  const [newMember, setNewMember] = useState({
    userId: '',
    role: '',
    department: '',
    votingPower: '1',
    expertise: [] as string[]
  });

  const [newMeeting, setNewMeeting] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: '60',
    attendees: [] as string[]
  });

  useEffect(() => {
    fetchCommitteeData();
  }, []);

  const fetchCommitteeData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/procurement/committee');
      setMembers(response.data.members);
      setMeetings(response.data.meetings);
      setDecisions(response.data.decisions);
    } catch (error) {
      console.error('Error fetching committee data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    try {
      await api.post('/procurement/committee/members', newMember);
      setShowAddMember(false);
      setNewMember({
        userId: '',
        role: '',
        department: '',
        votingPower: '1',
        expertise: []
      });
      fetchCommitteeData();
    } catch (error) {
      console.error('Error adding member:', error);
    }
  };

  const handleCreateMeeting = async () => {
    try {
      await api.post('/procurement/committee/meetings', newMeeting);
      setShowCreateMeeting(false);
      setNewMeeting({
        title: '',
        description: '',
        date: '',
        time: '',
        duration: '60',
        attendees: []
      });
      fetchCommitteeData();
    } catch (error) {
      console.error('Error creating meeting:', error);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      await api.delete(`/procurement/committee/members/${memberId}`);
      fetchCommitteeData();
    } catch (error) {
      console.error('Error removing member:', error);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'Chair':
        return <Badge className="bg-purple-100 text-purple-800">Chair</Badge>;
      case 'Vice Chair':
        return <Badge className="bg-blue-100 text-blue-800">Vice Chair</Badge>;
      case 'Secretary':
        return <Badge className="bg-green-100 text-green-800">Secretary</Badge>;
      case 'Member':
        return <Badge className="bg-gray-100 text-gray-800">Member</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const getMeetingStatusBadge = (status: string) => {
    switch (status) {
      case 'Scheduled':
        return <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>;
      case 'In Progress':
        return <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>;
      case 'Completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'Cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDecisionStatusBadge = (decision: string) => {
    switch (decision) {
      case 'Approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'Rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case 'Pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge variant="outline">{decision}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Procurement Committee</h1>
          <p className="text-muted-foreground">
            Manage committee members, meetings, and decision-making processes
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowAddMember(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Add Member
          </Button>
          <Button variant="outline" onClick={() => setShowCreateMeeting(true)}>
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Meeting
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="meetings">Meetings</TabsTrigger>
          <TabsTrigger value="decisions">Decisions</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-4">
          <div className="grid gap-4">
            {members.map((member) => (
              <Card key={member.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{member.firstName} {member.lastName}</CardTitle>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                    </div>
                    <div className="flex gap-2">
                      {getRoleBadge(member.role)}
                      <Badge variant="outline">Voting Power: {member.votingPower}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Department:</span> {member.department}
                    </div>
                    <div>
                      <span className="font-medium">Join Date:</span> {new Date(member.joinDate).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium">Status:</span> {member.status}
                    </div>
                    <div>
                      <span className="font-medium">Expertise:</span> {member.expertise.join(', ')}
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" size="sm">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Contact
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleRemoveMember(member.id)}
                    >
                      <UserMinus className="w-4 h-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="meetings" className="space-y-4">
          <div className="grid gap-4">
            {meetings.map((meeting) => (
              <Card key={meeting.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{meeting.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{meeting.description}</p>
                    </div>
                    {getMeetingStatusBadge(meeting.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Date:</span> {new Date(meeting.date).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium">Time:</span> {meeting.time}
                    </div>
                    <div>
                      <span className="font-medium">Duration:</span> {meeting.duration} minutes
                    </div>
                    <div>
                      <span className="font-medium">Attendees:</span> {meeting.attendees.length}
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="font-medium">Agenda Items:</span>
                    <div className="mt-2 space-y-2">
                      {meeting.agenda.map((item) => (
                        <div key={item.id} className="flex justify-between items-center text-sm">
                          <span>{item.title}</span>
                          <span>{item.duration} min</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </Button>
                    <Button variant="outline" size="sm">
                      <FileText className="w-4 h-4 mr-1" />
                      Minutes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="decisions" className="space-y-4">
          <div className="grid gap-4">
            {decisions.map((decision) => (
              <Card key={decision.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{decision.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{decision.description}</p>
                    </div>
                    {getDecisionStatusBadge(decision.decision)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Meeting:</span> {decision.meetingId}
                    </div>
                    <div>
                      <span className="font-medium">Approved By:</span> {decision.approvedBy}
                    </div>
                    <div>
                      <span className="font-medium">Approved At:</span> {new Date(decision.approvedAt).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium">Votes:</span> {decision.votes.length}
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="font-medium">Voting Results:</span>
                    <div className="mt-2 space-y-2">
                      {decision.votes.map((vote) => (
                        <div key={vote.memberId} className="flex justify-between items-center text-sm">
                          <span>{vote.memberName}</span>
                          <Badge variant="outline">{vote.vote}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-1" />
                      Export
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Member Dialog */}
      <Dialog open={showAddMember} onOpenChange={setShowAddMember}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Committee Member</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div>
              <Label htmlFor="member-user">User</Label>
              <Select value={newMember.userId} onValueChange={(value) => setNewMember({ ...newMember, userId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user1">John Doe</SelectItem>
                  <SelectItem value="user2">Jane Smith</SelectItem>
                  <SelectItem value="user3">Bob Johnson</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="member-role">Role</Label>
                <Select value={newMember.role} onValueChange={(value) => setNewMember({ ...newMember, role: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Chair">Chair</SelectItem>
                    <SelectItem value="Vice Chair">Vice Chair</SelectItem>
                    <SelectItem value="Secretary">Secretary</SelectItem>
                    <SelectItem value="Member">Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="member-department">Department</Label>
                <Input
                  id="member-department"
                  value={newMember.department}
                  onChange={(e) => setNewMember({ ...newMember, department: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="member-voting-power">Voting Power</Label>
                <Input
                  id="member-voting-power"
                  type="number"
                  value={newMember.votingPower}
                  onChange={(e) => setNewMember({ ...newMember, votingPower: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="member-expertise">Expertise</Label>
                <Input
                  id="member-expertise"
                  value={newMember.expertise.join(', ')}
                  onChange={(e) => setNewMember({ ...newMember, expertise: e.target.value.split(',').map(s => s.trim()) })}
                  placeholder="e.g., IT, Finance, Legal"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddMember(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddMember}>
                Add Member
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Meeting Dialog */}
      <Dialog open={showCreateMeeting} onOpenChange={setShowCreateMeeting}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Schedule Committee Meeting</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div>
              <Label htmlFor="meeting-title">Title</Label>
              <Input
                id="meeting-title"
                value={newMeeting.title}
                onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="meeting-description">Description</Label>
              <Textarea
                id="meeting-description"
                value={newMeeting.description}
                onChange={(e) => setNewMeeting({ ...newMeeting, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="meeting-date">Date</Label>
                <Input
                  id="meeting-date"
                  type="date"
                  value={newMeeting.date}
                  onChange={(e) => setNewMeeting({ ...newMeeting, date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="meeting-time">Time</Label>
                <Input
                  id="meeting-time"
                  type="time"
                  value={newMeeting.time}
                  onChange={(e) => setNewMeeting({ ...newMeeting, time: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="meeting-duration">Duration (minutes)</Label>
              <Input
                id="meeting-duration"
                type="number"
                value={newMeeting.duration}
                onChange={(e) => setNewMeeting({ ...newMeeting, duration: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateMeeting(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateMeeting}>
                Schedule Meeting
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 