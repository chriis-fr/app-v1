import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Play, Square, Pause, Clock } from 'lucide-react';
import { timeTrackingTypes, timezones, getTimezoneDisplayName } from '@shared/schema';
import { useAuth } from '@/contexts/AuthContext';

interface TimeEntry {
  id: string;
  description: string;
  type: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  status: string;
  timezone: string;
}

export default function TimeTracker() {
  const { user } = useAuth();
  const [activeEntry, setActiveEntry] = useState<TimeEntry | null>(null);
  const [description, setDescription] = useState('');
  const [type, setType] = useState('task');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [userTimezone, setUserTimezone] = useState(user?.timezone || 'UTC');

  useEffect(() => {
    // Load active time entry on component mount
    loadActiveEntry();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeEntry) {
      interval = setInterval(() => {
        const start = new Date(activeEntry.startTime).getTime();
        const now = new Date().getTime();
        setElapsedTime(Math.floor((now - start) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeEntry]);

  const loadActiveEntry = async () => {
    try {
      const response = await fetch('/api/time-tracking/entries?status=active');
      const entries = await response.json();
      if (entries.length > 0) {
        setActiveEntry(entries[0]);
        const start = new Date(entries[0].startTime).getTime();
        const now = new Date().getTime();
        setElapsedTime(Math.floor((now - start) / 1000));
      }
    } catch (error) {
      console.error('Error loading active entry:', error);
    }
  };

  const startTracking = async () => {
    if (!description.trim()) {
      alert('Please enter a description');
      return;
    }

    try {
      const response = await fetch('/api/time-tracking/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: description.trim(),
          type,
          timezone: userTimezone,
        }),
      });

      if (response.ok) {
        const entry = await response.json();
        setActiveEntry(entry);
        setElapsedTime(0);
        setDescription('');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to start tracking');
      }
    } catch (error) {
      console.error('Error starting time tracking:', error);
      alert('Failed to start time tracking');
    }
  };

  const stopTracking = async () => {
    if (!activeEntry) return;

    try {
      const response = await fetch(`/api/time-tracking/stop/${activeEntry.id}`, {
        method: 'POST',
      });

      if (response.ok) {
        setActiveEntry(null);
        setElapsedTime(0);
        // Optionally refresh the time entries list
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to stop tracking');
      }
    } catch (error) {
      console.error('Error stopping time tracking:', error);
      alert('Failed to stop time tracking');
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Time Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeEntry ? (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-mono font-bold text-primary">
                {formatTime(elapsedTime)}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {activeEntry.description}
              </p>
              <Badge variant="secondary" className="mt-2">
                {activeEntry.type}
              </Badge>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p>Started: {new Date(activeEntry.startTime).toLocaleString()}</p>
              <p>Timezone: {getTimezoneDisplayName(activeEntry.timezone)}</p>
            </div>

            <Button 
              onClick={stopTracking} 
              className="w-full"
              variant="destructive"
            >
              <Square className="h-4 w-4 mr-2" />
              Stop Tracking
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">What are you working on?</Label>
              <Textarea
                id="description"
                placeholder="Enter task description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeTrackingTypes.map((trackingType) => (
                    <SelectItem key={trackingType} value={trackingType}>
                      {trackingType.charAt(0).toUpperCase() + trackingType.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={userTimezone} onValueChange={setUserTimezone}>
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

            <Button 
              onClick={startTracking} 
              className="w-full"
              disabled={!description.trim()}
            >
              <Play className="h-4 w-4 mr-2" />
              Start Tracking
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 