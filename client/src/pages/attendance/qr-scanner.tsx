import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, QrCode, Camera, User, CheckCircle } from 'lucide-react';

export default function QRScannerPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [scannedCode, setScannedCode] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [notes, setNotes] = useState('');
  const [workDescription, setWorkDescription] = useState('');

  const handleQRScan = async () => {
    if (!scannedCode || !employeeId) {
      toast({ title: 'Error', description: 'Please enter both QR code and employee ID', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/attendance/remote/qr-mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          qrCode: scannedCode,
          employeeId,
          employeeName,
          notes,
          workDescription
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast({ title: 'Success', description: 'Attendance marked successfully!' });
        // Reset form
        setScannedCode('');
        setEmployeeId('');
        setEmployeeName('');
        setNotes('');
        setWorkDescription('');
      } else {
        const error = await response.json();
        toast({ title: 'Error', description: error.message || 'Failed to mark attendance', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to mark attendance', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const simulateQRScan = () => {
    // Simulate scanning a QR code
    const mockQRCode = `QR${Date.now()}${Math.random().toString(36).substr(2, 6)}`;
    setScannedCode(mockQRCode);
    toast({ title: 'QR Code Scanned', description: 'QR code detected successfully!' });
  };

  return (
    <div className="container mx-auto py-6 max-w-2xl">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => setLocation('/attendance')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Attendance
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">QR Code Attendance</h1>
        <p className="text-gray-600 mt-2">Scan QR code to mark your attendance</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* QR Scanner */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              QR Code Scanner
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
              <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Point your camera at the QR code</p>
              <Button onClick={simulateQRScan} variant="outline">
                Simulate QR Scan
              </Button>
            </div>

            {scannedCode && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  <CheckCircle className="h-4 w-4 inline mr-2" />
                  QR Code detected: {scannedCode}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Employee Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Employee Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="employeeId">Employee ID *</Label>
              <Input
                id="employeeId"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="Enter your employee ID"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="employeeName">Your Name</Label>
              <Input
                id="employeeName"
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any notes about your attendance..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="workDescription">Work Description (Optional)</Label>
              <Textarea
                id="workDescription"
                value={workDescription}
                onChange={(e) => setWorkDescription(e.target.value)}
                placeholder="What work will you do today?"
                rows={3}
              />
            </div>

            <Button 
              onClick={handleQRScan} 
              disabled={isLoading || !scannedCode || !employeeId}
              className="w-full"
            >
              {isLoading ? 'Marking Attendance...' : 'Mark Attendance'}
            </Button>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>How to Use</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">1</span>
                <p>Find the QR code posted at your work location</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">2</span>
                <p>Point your phone camera at the QR code or click "Simulate QR Scan"</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">3</span>
                <p>Enter your employee ID and name</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">4</span>
                <p>Add any notes or work description (optional)</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">5</span>
                <p>Click "Mark Attendance" to complete</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 