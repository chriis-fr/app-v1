import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, Users, BarChart3, TrendingUp, Activity } from 'lucide-react';
import TimezoneWidget from '@/components/dashboard/TimezoneWidget';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'wouter';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back, {user?.firstName || 'User'}!
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your organization today
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">Current Time</div>
          <div className="text-lg font-mono">
            {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            <CardTitle className="text-sm font-medium">Meetings Today</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Next: Team Standup (10:00 AM)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              3 due today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productivity</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12%</div>
            <p className="text-xs text-muted-foreground">
              vs last week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Time Tracking
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-mono font-bold text-primary mb-2">
                08:45:32
              </div>
              <Badge variant="secondary">Currently Tracking</Badge>
            </div>
            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link to="/app/time-tracking">View Time Entries</Link>
              </Button>
              <Button variant="outline" className="w-full">
                Stop Tracking
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Meetings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 border rounded">
                <div>
                  <div className="font-medium">Team Standup</div>
                  <div className="text-sm text-muted-foreground">10:00 AM - 10:30 AM</div>
                </div>
                <Badge variant="outline">In 15m</Badge>
              </div>
              <div className="flex items-center justify-between p-2 border rounded">
                <div>
                  <div className="font-medium">Client Review</div>
                  <div className="text-sm text-muted-foreground">2:00 PM - 3:00 PM</div>
                </div>
                <Badge variant="outline">Virtual</Badge>
              </div>
            </div>
            <Button asChild className="w-full">
              <Link to="/meetings">View All Meetings</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 border rounded">
                <div>
                  <div className="font-medium">Update Documentation</div>
                  <div className="text-sm text-muted-foreground">Due Today</div>
                </div>
                <Badge variant="destructive">High</Badge>
              </div>
              <div className="flex items-center justify-between p-2 border rounded">
                <div>
                  <div className="font-medium">Code Review</div>
                  <div className="text-sm text-muted-foreground">Due Tomorrow</div>
                </div>
                <Badge variant="secondary">Medium</Badge>
              </div>
            </div>
            <Button asChild className="w-full">
              <Link to="/hr?tab=tasks">View All Tasks</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Timezone Widget */}
      <TimezoneWidget />

      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <div className="font-medium">Started time tracking</div>
                <div className="text-sm text-muted-foreground">Working on "Update Documentation" task</div>
              </div>
              <div className="text-sm text-muted-foreground">2 min ago</div>
            </div>
            
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <div className="font-medium">Meeting scheduled</div>
                <div className="text-sm text-muted-foreground">Team Standup for tomorrow at 10:00 AM</div>
              </div>
              <div className="text-sm text-muted-foreground">15 min ago</div>
            </div>
            
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <div className="flex-1">
                <div className="font-medium">Task completed</div>
                <div className="text-sm text-muted-foreground">"Review pull request #123" marked as done</div>
              </div>
              <div className="text-sm text-muted-foreground">1 hour ago</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 