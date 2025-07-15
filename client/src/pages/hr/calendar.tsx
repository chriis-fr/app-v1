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
  Calendar, 
  Clock, 
  Users, 
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Settings,
  BarChart3,
  Video,
  Phone,
  Building
} from 'lucide-react';
import ModuleLayout from '@/components/layout/ModuleLayout';

interface CalendarEvent {
  id: string;
  title: string;
  type: 'meeting' | 'interview' | 'training' | 'holiday' | 'birthday' | 'anniversary' | 'other';
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  location?: string;
  attendees: string[];
  organizer: string;
  description?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'postponed';
  priority: 'low' | 'medium' | 'high';
  isRecurring: boolean;
  recurrencePattern?: string;
  notes?: string;
}

interface MeetingRoom {
  id: string;
  name: string;
  capacity: number;
  location: string;
  facilities: string[];
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  currentBooking?: CalendarEvent;
}

export default function CalendarPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [meetingRooms, setMeetingRooms] = useState<MeetingRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState('events');

  useEffect(() => {
    fetchCalendarData();
  }, [selectedDate]);

  const fetchCalendarData = async () => {
    try {
      setLoading(true);
      
      // TODO: Replace with actual API calls
      // const eventsResponse = await fetch(`/api/hr/calendar/events?date=${selectedDate}`);
      // const meetingRoomsResponse = await fetch('/api/hr/calendar/meeting-rooms');
      
      // For now, using empty arrays
      setEvents([]);
      setMeetingRooms([]);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch calendar data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'meeting': return 'bg-blue-100 text-blue-800';
      case 'interview': return 'bg-purple-100 text-purple-800';
      case 'training': return 'bg-green-100 text-green-800';
      case 'holiday': return 'bg-red-100 text-red-800';
      case 'birthday': return 'bg-pink-100 text-pink-800';
      case 'anniversary': return 'bg-indigo-100 text-indigo-800';
      case 'other': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'postponed': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return <CheckCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      case 'postponed': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
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
            <h1 className="text-3xl font-bold">HR Calendar</h1>
            <p className="text-muted-foreground">Manage events, meetings, and scheduling</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Calendar
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Event
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="meeting-rooms">Meeting Rooms</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="space-y-4">
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-48"
              />
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="interview">Interview</SelectItem>
                  <SelectItem value="training">Training</SelectItem>
                  <SelectItem value="holiday">Holiday</SelectItem>
                  <SelectItem value="birthday">Birthday</SelectItem>
                  <SelectItem value="anniversary">Anniversary</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="postponed">Postponed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
              </div>
            ) : events.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Events</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Create events to start managing your HR calendar.
                  </p>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Event
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {events
                  .filter(event => 
                    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    event.organizer.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .filter(event => filterType === 'all' || event.type === filterType)
                  .filter(event => filterStatus === 'all' || event.status === filterStatus)
                  .map((event) => (
                    <Card key={event.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h3 className="text-xl font-semibold">{event.title}</h3>
                              <Badge className={getTypeColor(event.type)}>
                                {event.type}
                              </Badge>
                              <Badge className={getStatusColor(event.status)}>
                                {getStatusIcon(event.status)}
                                {event.status}
                              </Badge>
                              <Badge className={getPriorityColor(event.priority)}>
                                {event.priority}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {new Date(event.startDate).toLocaleDateString()}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {event.startTime} - {event.endTime}
                              </div>
                              {event.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {event.location}
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {event.attendees.length} attendees
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <span>Organizer: {event.organizer}</span>
                              </div>
                              {event.isRecurring && (
                                <div className="flex items-center gap-1">
                                  <span>Recurring: {event.recurrencePattern}</span>
                                </div>
                              )}
                            </div>
                            {event.description && (
                              <p className="text-sm text-muted-foreground">
                                {event.description}
                              </p>
                            )}
                            {event.notes && (
                              <p className="text-sm text-muted-foreground">
                                <strong>Notes:</strong> {event.notes}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {event.status === 'scheduled' && (
                              <>
                                <Button variant="outline" size="sm">
                                  Join
                                </Button>
                                <Button variant="outline" size="sm">
                                  Reschedule
                                </Button>
                              </>
                            )}
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="meeting-rooms" className="space-y-4">
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search meeting rooms..."
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
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="occupied">Occupied</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
              </div>
            ) : meetingRooms.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-8">
                  <Building className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Meeting Rooms</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Add meeting rooms to start managing room bookings.
                  </p>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Meeting Room
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {meetingRooms
                  .filter(room => 
                    room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    room.location.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .filter(room => filterStatus === 'all' || room.status === filterStatus)
                  .map((room) => (
                    <Card key={room.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h3 className="text-xl font-semibold">{room.name}</h3>
                              <Badge className={getStatusColor(room.status)}>
                                {room.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {room.location}
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                Capacity: {room.capacity}
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {room.facilities.map((facility, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {facility}
                                </Badge>
                              ))}
                            </div>
                            {room.currentBooking && (
                              <div className="text-sm text-muted-foreground">
                                <strong>Current Booking:</strong> {room.currentBooking.title} ({room.currentBooking.startTime} - {room.currentBooking.endTime})
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {room.status === 'available' && (
                              <Button variant="outline" size="sm">
                                Book Room
                              </Button>
                            )}
                            <Button variant="outline" size="sm">
                              View Schedule
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

          <TabsContent value="schedule" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Calendar Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Interactive calendar view with drag-and-drop scheduling will be implemented here.
                </p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Monthly/weekly/daily views</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Drag and drop event scheduling</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Conflict detection</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Recurring event support</span>
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