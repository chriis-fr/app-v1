import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, Filter } from 'lucide-react';
import { timeTrackingTypes, timezones, getTimezoneDisplayName } from '@shared/schema';
import { useAuth } from '@/contexts/AuthContext';

interface TimeEntry {
  id: string;
  description: string;
  type: string;
  status: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  timezone: string;
  billable: boolean;
  hourlyRate?: number;
  createdAt: string;
}

export default function TimeEntries() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimezone, setSelectedTimezone] = useState(user?.timezone || 'UTC');
  const [dateFilter, setDateFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    loadEntries();
  }, [selectedTimezone, dateFilter, typeFilter]);

  const loadEntries = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (dateFilter) {
        const date = new Date(dateFilter);
        const startOfDay = new Date(date.setHours(0, 0, 0, 0)).toISOString();
        const endOfDay = new Date(date.setHours(23, 59, 59, 999)).toISOString();
        params.append('startDate', startOfDay);
        params.append('endDate', endOfDay);
      }
      if (typeFilter) {
        params.append('type', typeFilter);
      }
      params.append('timezone', selectedTimezone);

      const response = await fetch(`/api/time-tracking/entries?${params}`);
      if (response.ok) {
        const data = await response.json();
        setEntries(data);
      }
    } catch (error) {
      console.error('Error loading time entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
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

  const calculateTotalHours = () => {
    return entries.reduce((total, entry) => total + (entry.duration || 0), 0) / 60;
  };

  const calculateBillableHours = () => {
    return entries
      .filter(entry => entry.billable)
      .reduce((total, entry) => total + (entry.duration || 0), 0) / 60;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading time entries...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All types</SelectItem>
                  {timeTrackingTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={selectedTimezone} onValueChange={setSelectedTimezone}>
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
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {calculateTotalHours().toFixed(1)}h
              </div>
              <div className="text-sm text-muted-foreground">Total Hours</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {calculateBillableHours().toFixed(1)}h
              </div>
              <div className="text-sm text-muted-foreground">Billable Hours</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {entries.length}
              </div>
              <div className="text-sm text-muted-foreground">Entries</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Entries List */}
      <Card>
        <CardHeader>
          <CardTitle>Time Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No time entries found
            </div>
          ) : (
            <div className="space-y-4">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{entry.description}</h4>
                      <Badge variant="outline">{entry.type}</Badge>
                      {entry.billable && (
                        <Badge variant="secondary">Billable</Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDateTime(entry.startTime, entry.timezone)}
                        </span>
                        {entry.endTime && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDateTime(entry.endTime, entry.timezone)}
                          </span>
                        )}
                      </div>
                      {entry.duration && (
                        <div className="font-medium">
                          Duration: {formatDuration(entry.duration)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">
                      {entry.status}
                    </div>
                    {entry.hourlyRate && (
                      <div className="text-sm font-medium">
                        ${entry.hourlyRate}/hr
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 