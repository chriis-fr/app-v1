import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import CompactSidebar from '@/components/layout/CompactSidebar';
import { ArrowLeft, Download, FileSpreadsheet, FileJson, FileText, Table2 } from 'lucide-react';

interface BaseModuleInfoProps {
  moduleName: string;
  moduleDescription: string;
  moduleIcon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  onExportData?: () => void;
  onGenerateReport?: () => void;
  onViewRawData?: () => void;
}

export default function BaseModuleInfo({
  moduleName,
  moduleDescription,
  moduleIcon: ModuleIcon,
  children,
  onExportData,
  onGenerateReport,
  onViewRawData
}: BaseModuleInfoProps) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  return (
    <div className="flex min-h-screen">
      <CompactSidebar />
      <div className="flex-1 p-8 ml-20">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation('/dashboard/modules')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Modules
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ModuleIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-2">{moduleName}</h1>
              <p className="text-gray-600">{moduleDescription}</p>
            </div>
          </div>
        </div>

        {/* Module-specific content */}
        {children}

        {/* Common actions */}
        <div className="fixed bottom-6 right-6 flex gap-2">
          {onExportData && (
            <Button variant="outline" onClick={onExportData}>
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          )}
          {onGenerateReport && (
            <Button variant="outline" onClick={onGenerateReport}>
              <FileText className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          )}
          {onViewRawData && (
            <Button variant="outline" onClick={onViewRawData}>
              <Table2 className="h-4 w-4 mr-2" />
              View Raw Data
            </Button>
          )}
        </div>
      </div>
    </div>
  );
} 