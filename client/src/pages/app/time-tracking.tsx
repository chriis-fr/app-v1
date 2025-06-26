import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import TimeTracker from '@/components/time-tracking/TimeTracker';
import TimeEntries from '@/components/time-tracking/TimeEntries';
import { Clock, BarChart3, Calendar } from 'lucide-react';

export default function TimeTrackingPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Time Tracking</h1>
          <p className="text-muted-foreground">
            Track your work hours and manage time entries
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Time Tracker */}
        <div className="lg:col-span-1">
          <TimeTracker />
        </div>

        {/* Time Entries */}
        <div className="lg:col-span-2">
          <TimeEntries />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8.5h</div>
            <p className="text-xs text-muted-foreground">
              +2.5h from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42.5h</div>
            <p className="text-xs text-muted-foreground">
              +5.2h from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Billable Hours</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">38.0h</div>
            <p className="text-xs text-muted-foreground">
              89% of total hours
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 