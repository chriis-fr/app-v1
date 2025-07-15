import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, MapPin, Video, Repeat } from 'lucide-react';
import { meetingTypes, timezones, getTimezoneDisplayName } from '@shared/schema';
import { useAuth } from '@/hooks/use-auth';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  timezone: string;
}

interface Meeting {
  id: string;
  title: string;
  description?: string;
  type: string;
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
  }>;
  recurring?: {
    isRecurring: boolean;
    frequency?: string;
    interval?: number;
    endDate?: string;
  };
}

export default function MeetingScheduler() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'team_meeting',
    startTime: '',
    endTime: '',
    timezone: user?.timezone || 'UTC',
    location: '',
    isVirtual: false,
    meetingUrl: '',
    selectedAttendees: [] as string[],
    recurring: {
      isRecurring: false,
      frequency: 'weekly',
      interval: 1,
      endDate: ''
    }
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const meetingData = {
        ...formData,
        attendees: formData.selectedAttendees.map(userId => {
          const user = users.find(u => u.id === userId);
          return {
            userId,
            timezone: user?.timezone || 'UTC',
            status: 'pending'
          };
        })
      };

      const response = await fetch('/api/meetings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(meetingData),
      });

      if (response.ok) {
        const meeting = await response.json();
        alert('Meeting scheduled successfully!');
        // Reset form
        setFormData({
          title: '',
          description: '',
          type: 'team_meeting',
          startTime: '',
          endTime: '',
          timezone: user?.timezone || 'UTC',
          location: '',
          isVirtual: false,
          meetingUrl: '',
          selectedAttendees: [],
          recurring: {
            isRecurring: false,
            frequency: 'weekly',
            interval: 1,
            endDate: ''
          }
        });
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to schedule meeting');
      }
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      alert('Failed to schedule meeting');
    } finally {
      setLoading(false);
    }
  };

  const handleAttendeeToggle = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedAttendees: prev.selectedAttendees.includes(userId)
        ? prev.selectedAttendees.filter(id => id !== userId)
        : [...prev.selectedAttendees, userId]
    }));
  };

  const formatTimeForTimezone = (time: string, timezone: string) => {
    if (!time) return '';
    const date = new Date(`2000-01-01T${time}`);
    return date.toLocaleTimeString('en-US', {
      timeZone: getIANATimezone(timezone),
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getIANATimezone = (timezoneCode: string) => {
    const timezoneMap: Record<string, string> = {
      'UTC': 'UTC',
      'GMT': 'GMT',
      'EST': 'America/New_York',
      'CST': 'Asia/Shanghai',
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

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Schedule Meeting
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Meeting Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Meeting Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter meeting title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Meeting description"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Meeting Type</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {meetingTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date and Time */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Date & Time
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={formData.timezone} onValueChange={(value) => setFormData(prev => ({ ...prev, timezone: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {getTimezoneDisplayName(tz)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location
            </h3>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="isVirtual"
                checked={formData.isVirtual}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isVirtual: checked }))}
              />
              <Label htmlFor="isVirtual">Virtual Meeting</Label>
            </div>

            {formData.isVirtual ? (
              <div className="space-y-2">
                <Label htmlFor="meetingUrl">Meeting URL</Label>
                <Input
                  id="meetingUrl"
                  value={formData.meetingUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, meetingUrl: e.target.value }))}
                  placeholder="https://meet.google.com/..."
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Meeting room or address"
                />
              </div>
            )}
          </div>

          {/* Attendees */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Attendees
            </h3>
            
            <div className="space-y-2">
              {users.map((user) => (
                <div key={user.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <input
                    type="checkbox"
                    id={`user-${user.id}`}
                    checked={formData.selectedAttendees.includes(user.id)}
                    onChange={() => handleAttendeeToggle(user.id)}
                    className="rounded"
                  />
                  <div className="flex-1">
                    <Label htmlFor={`user-${user.id}`} className="font-medium">
                      {user.firstName} {user.lastName}
                    </Label>
                    <div className="text-sm text-muted-foreground">
                      {user.email} • {getTimezoneDisplayName(user.timezone)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recurring */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Repeat className="h-4 w-4" />
              Recurring
            </h3>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="isRecurring"
                checked={formData.recurring.isRecurring}
                onCheckedChange={(checked) => setFormData(prev => ({ 
                  ...prev, 
                  recurring: { ...prev.recurring, isRecurring: checked }
                }))}
              />
              <Label htmlFor="isRecurring">Make this a recurring meeting</Label>
            </div>

            {formData.recurring.isRecurring && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select 
                    value={formData.recurring.frequency} 
                    onValueChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      recurring: { ...prev.recurring, frequency: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interval">Interval</Label>
                  <Input
                    id="interval"
                    type="number"
                    min="1"
                    value={formData.recurring.interval}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      recurring: { ...prev.recurring, interval: parseInt(e.target.value) }
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.recurring.endDate}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      recurring: { ...prev.recurring, endDate: e.target.value }
                    }))}
                  />
                </div>
              </div>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Scheduling...' : 'Schedule Meeting'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 