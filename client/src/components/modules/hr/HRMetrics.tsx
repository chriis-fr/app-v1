import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { Employee } from '@/pages/hr/columns';

interface DepartmentStats {
  name: string;
  count: number;
  percentage: number;
}

interface HRMetricsData {
  totalEmployees: number;
  activeEmployees: number;
  onLeave: number;
  departmentDistribution: DepartmentStats[];
  averageTenure: number;
}

export default function HRMetrics() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<HRMetricsData>({
    totalEmployees: 0,
    activeEmployees: 0,
    onLeave: 0,
    departmentDistribution: [],
    averageTenure: 0,
  });

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/mongodb/users');
      if (!response.ok) throw new Error('Failed to fetch employee data');
      const employees: Employee[] = await response.json();

      // Calculate metrics
      const totalEmployees = employees.length;
      const activeEmployees = employees.filter(emp => emp.status === 'active').length;
      const onLeave = employees.filter(emp => emp.status === 'on_leave').length;

      // Calculate department distribution
      const departmentCounts = employees.reduce((acc, emp) => {
        acc[emp.department] = (acc[emp.department] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const departmentDistribution = Object.entries(departmentCounts).map(([name, count]) => ({
        name,
        count,
        percentage: (count / totalEmployees) * 100,
      }));

      // Calculate average tenure
      const now = new Date();
      const totalTenure = employees.reduce((acc, emp) => {
        const joinDate = new Date(emp.joinDate);
        const tenureInMonths = (now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
        return acc + tenureInMonths;
      }, 0);
      const averageTenure = totalTenure / totalEmployees;

      setMetrics({
        totalEmployees,
        activeEmployees,
        onLeave,
        departmentDistribution,
        averageTenure,
      });
    } catch (error) {
      console.error('Error fetching metrics:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch HR metrics',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderLoadingState = () => (
    <div className="flex items-center justify-center p-4">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <span className="ml-2 text-muted-foreground">Loading metrics...</span>
    </div>
  );

  if (loading) {
    return renderLoadingState();
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalEmployees}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeEmployees}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>On Leave</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.onLeave}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Department Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.departmentDistribution.map((dept) => (
              <div key={dept.name} className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">{dept.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {dept.count} employees ({dept.percentage.toFixed(1)}%)
                  </span>
                </div>
                <Progress value={dept.percentage} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Average Tenure</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {metrics.averageTenure.toFixed(1)} months
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 