import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import MeetingScheduler from '@/components/meetings/MeetingScheduler';
import CompactSidebar from '@/components/layout/CompactSidebar';
import { Calendar, Clock, Users, Video, MapPin, Plus, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useRoleAccess } from '@/hooks/use-role-access';
import { useLocation } from 'wouter';
import { timezones, getTimezoneDisplayName } from '@shared/schema';

interface Meeting {
  id: string;
  title: string;
  description?: string;
  type: string;
  status: string;
  startTime: string;
  endTime: string;
  timezone: string;
  location?: string;
  isVirtual: boolean;
  meetingUrl?: string;
  attendees: Array<{
    userId: string;
    timezone: string;
    status: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      timezone: string;
    };
  }>;
  organizer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function MeetingsPage() {
  const { user } = useAuth();
  const { isOwner, isAdmin } = useRoleAccess();
  const [, setLocation] = useLocation();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScheduler, setShowScheduler] = useState(false);
  const [selectedTimezone, setSelectedTimezone] = useState(user?.timezone || 'UTC');

  useEffect(() => {
    loadMeetings();
    
    // Auto-open scheduler if URL contains schedule=1
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('schedule') === '1') {
      setShowScheduler(true);
      // Clean up the URL
      window.history.replaceState({}, '', '/meetings');
    }
  }, [selectedTimezone]);

  const loadMeetings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('timezone', selectedTimezone);

      const response = await fetch(`/api/meetings?${params}`);
      if (response.ok) {
        const data = await response.json();
        setMeetings(data);
      }
    } catch (error) {
      console.error('Error loading meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string, timezone: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      timeZone: getIANATimezone(timezone),
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getIANATimezone = (timezoneCode: string) => {
    const timezoneMap: Record<string, string> = {
      'UTC': 'UTC',
      'GMT': 'GMT',
      'EST': 'America/New_York',
      'CST': 'America/Chicago',
      'MST': 'America/Denver',
      'PST': 'America/Los_Angeles',
      'EAT': 'Africa/Nairobi',
      'CAT': 'Africa/Harare',
      'WAT': 'Africa/Lagos',
      'SAST': 'Africa/Johannesburg',
      'IST': 'Asia/Kolkata',
      'JST': 'Asia/Tokyo',
      'CST_CN': 'Asia/Shanghai',
      'AEST': 'Australia/Sydney',
      'NZST': 'Pacific/Auckland'
    };
    return timezoneMap[timezoneCode] || 'UTC';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'one_on_one':
        return <Users className="h-4 w-4" />;
      case 'team_meeting':
        return <Users className="h-4 w-4" />;
      case 'client_meeting':
        return <Users className="h-4 w-4" />;
      case 'training':
        return <Clock className="h-4 w-4" />;
      case 'review':
        return <Clock className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const upcomingMeetings = meetings.filter(meeting => 
    new Date(meeting.startTime) > new Date()
  ).slice(0, 5);

  const todayMeetings = meetings.filter(meeting => {
    const meetingDate = new Date(meeting.startTime);
    const today = new Date();
    return meetingDate.toDateString() === today.toDateString();
  });

  if (loading) {
    return (
      <>
        {/* Compact Sidebar for Executives (Owners) */}
        {isOwner() && <CompactSidebar />}
        
        <div className={`${isOwner() ? 'ml-20' : ''} container mx-auto p-6`}>
          <div className="text-center">Loading meetings...</div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Compact Sidebar for Executives (Owners) */}
      {isOwner() && <CompactSidebar />}
      
      <div className={`${isOwner() ? 'ml-20' : ''} container mx-auto p-6 space-y-6`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Back Button for Admins */}
            {isAdmin() && !isOwner() && (
              <Button
                variant="ghost"
                onClick={() => setLocation('/dashboard')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            )}
            <div>
              <h1 className="text-3xl font-bold">Meetings</h1>
              <p className="text-muted-foreground">
                Schedule and manage your meetings
              </p>
            </div>
          </div>
          <Dialog open={showScheduler} onOpenChange={setShowScheduler}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Meeting
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Schedule New Meeting</DialogTitle>
              </DialogHeader>
              <MeetingScheduler />
            </DialogContent>
          </Dialog>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Meetings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{meetings.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayMeetings.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingMeetings.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Virtual</CardTitle>
              <Video className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {meetings.filter(m => m.isVirtual).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Meetings */}
        {todayMeetings.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Today's Meetings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {todayMeetings.map((meeting) => (
                  <div
                    key={meeting.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      {getTypeIcon(meeting.type)}
                      <div>
                        <h4 className="font-medium">{meeting.title}</h4>
                        <div className="text-sm text-muted-foreground">
                          {formatDateTime(meeting.startTime, meeting.timezone)} - {formatDateTime(meeting.endTime, meeting.timezone)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(meeting.status)}>
                        {meeting.status.replace('_', ' ')}
                      </Badge>
                      {meeting.isVirtual ? (
                        <Video className="h-4 w-4 text-blue-600" />
                      ) : (
                        <MapPin className="h-4 w-4 text-gray-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Meetings */}
        <Card>
          <CardHeader>
            <CardTitle>All Meetings</CardTitle>
          </CardHeader>
          <CardContent>
            {meetings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No meetings scheduled
              </div>
            ) : (
              <div className="space-y-4">
                {meetings.map((meeting) => (
                  <div
                    key={meeting.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      {getTypeIcon(meeting.type)}
                      <div>
                        <h4 className="font-medium">{meeting.title}</h4>
                        <div className="text-sm text-muted-foreground">
                          {formatDateTime(meeting.startTime, meeting.timezone)} - {formatDateTime(meeting.endTime, meeting.timezone)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Organized by {meeting.organizer.firstName} {meeting.organizer.lastName}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(meeting.status)}>
                        {meeting.status.replace('_', ' ')}
                      </Badge>
                      {meeting.isVirtual ? (
                        <Video className="h-4 w-4 text-blue-600" />
                      ) : (
                        <MapPin className="h-4 w-4 text-gray-600" />
                      )}
                      <div className="text-sm text-muted-foreground">
                        {meeting.attendees.length} attendees
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
} 