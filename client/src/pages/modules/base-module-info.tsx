import { ReactNode } from 'react';
import { TimeRange } from '@/components/analytics/analytics-dashboard';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, FileText, Database, RefreshCw } from 'lucide-react';
import { useLocation } from 'wouter';

interface BaseModuleInfoProps {
  moduleName: string;
  description: string;
  icon: string;
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
  onExportData: () => void;
  onGenerateReport: () => void;
  onViewRawData: () => void;
  onRefreshData: () => void;
  children: ReactNode;
}

export default function BaseModuleInfo({
  moduleName,
  description,
  icon,
  timeRange,
  onTimeRangeChange,
  onExportData,
  onGenerateReport,
  onViewRawData,
  onRefreshData,
  children
}: BaseModuleInfoProps) {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="ml-20">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation('/dashboard')}
              className="hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{moduleName}</h1>
              <p className="text-sm text-gray-500">{description}</p>
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Button
                variant={timeRange === 'day' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onTimeRangeChange('day')}
              >
                Day
              </Button>
              <Button
                variant={timeRange === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onTimeRangeChange('week')}
              >
                Week
              </Button>
              <Button
                variant={timeRange === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onTimeRangeChange('month')}
              >
                Month
              </Button>
              <Button
                variant={timeRange === 'quarter' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onTimeRangeChange('quarter')}
              >
                Quarter
              </Button>
              <Button
                variant={timeRange === 'year' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onTimeRangeChange('year')}
              >
                Year
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onExportData}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onGenerateReport}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Report
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onViewRawData}
                className="flex items-center gap-2"
              >
                <Database className="h-4 w-4" />
                Raw Data
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onRefreshData}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
} 