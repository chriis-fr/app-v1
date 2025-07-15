import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Globe, Users } from 'lucide-react';
import { timezones, getTimezoneDisplayName, User } from '@shared/schema';
import { useAuth } from '@/contexts/AuthContext';

interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  timezone: string;
  isOnline: boolean;
  lastSeen: string;
}

export default function TimezoneWidget() {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedTimezones, setSelectedTimezones] = useState<string[]>([
    // Use user timezone if available, otherwise default to UTC
    (user as User)?.timezone || 'UTC',
    'EST',
    'PST',
    'EAT'
  ]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    loadTeamMembers();

    return () => clearInterval(timer);
  }, []);

  const loadTeamMembers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const users = await response.json();
        const members: TeamMember[] = users.map((u: any) => ({
          id: u.id,
          firstName: u.firstName || '',
          lastName: u.lastName || '',
          timezone: u.timezone || 'UTC',
          isOnline: Math.random() > 0.3, // Mock online status
          lastSeen: new Date(Date.now() - Math.random() * 86400000).toISOString() // Mock last seen
        }));
        setTeamMembers(members);
      }
    } catch (error) {
      console.error('Error loading team members:', error);
    }
  };

  const formatTime = (date: Date, timezone: string) => {
    const ianaTimezone = getIANATimezone(timezone);
    return date.toLocaleTimeString('en-US', {
      timeZone: ianaTimezone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
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

  const getWorkingHours = (timezone: string) => {
    const ianaTimezone = getIANATimezone(timezone);
    const localTime = new Date().toLocaleString('en-US', { timeZone: ianaTimezone });
    const hour = new Date(localTime).getHours();
    
    if (hour >= 9 && hour <= 17) {
      return 'Working Hours';
    } else if (hour >= 6 && hour < 9) {
      return 'Early Morning';
    } else if (hour > 17 && hour <= 22) {
      return 'Evening';
    } else {
      return 'Off Hours';
    }
  };

  const getWorkingHoursColor = (status: string) => {
    switch (status) {
      case 'Working Hours':
        return 'bg-green-100 text-green-800';
      case 'Early Morning':
      case 'Evening':
        return 'bg-yellow-100 text-yellow-800';
      case 'Off Hours':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const addTimezone = (timezone: string) => {
    if (!selectedTimezones.includes(timezone)) {
      setSelectedTimezones(prev => [...prev, timezone]);
    }
  };

  const removeTimezone = (timezone: string) => {
    if (selectedTimezones.length > 1) {
      setSelectedTimezones(prev => prev.filter(tz => tz !== timezone));
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Time in Different Timezones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Global Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {selectedTimezones.map((timezone) => (
              <div key={timezone} className="text-center p-4 border rounded-lg">
                <div className="text-sm font-medium text-muted-foreground">
                  {getTimezoneDisplayName(timezone)}
                </div>
                <div className="text-2xl font-mono font-bold">
                  {formatTime(currentTime, timezone)}
                </div>
                <Badge className={`mt-2 ${getWorkingHoursColor(getWorkingHours(timezone))}`}>
                  {getWorkingHours(timezone)}
                </Badge>
                {selectedTimezones.length > 1 && (
                  <button
                    onClick={() => removeTimezone(timezone)}
                    className="mt-2 text-xs text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-4">
            <Select onValueChange={addTimezone}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Add timezone" />
              </SelectTrigger>
              <SelectContent>
                {timezones
                  .filter(tz => !selectedTimezones.includes(tz))
                  .map((timezone) => (
                    <SelectItem key={timezone} value={timezone}>
                      {getTimezoneDisplayName(timezone)}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Team Availability */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Availability
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {teamMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${member.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                  <div>
                    <div className="font-medium">
                      {member.firstName} {member.lastName}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {getTimezoneDisplayName(member.timezone)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono">
                    {formatTime(currentTime, member.timezone)}
                  </div>
                  <Badge className={getWorkingHoursColor(getWorkingHours(member.timezone))}>
                    {getWorkingHours(member.timezone)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border rounded-lg hover:bg-gray-50 text-left">
              <div className="font-medium">Schedule Meeting</div>
              <div className="text-sm text-muted-foreground">
                Find best time for team
              </div>
            </button>
            <button className="p-4 border rounded-lg hover:bg-gray-50 text-left">
              <div className="font-medium">Start Time Tracking</div>
              <div className="text-sm text-muted-foreground">
                Track your work hours
              </div>
            </button>
            <button className="p-4 border rounded-lg hover:bg-gray-50 text-left">
              <div className="font-medium">View Tasks</div>
              <div className="text-sm text-muted-foreground">
                Check due dates
              </div>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 