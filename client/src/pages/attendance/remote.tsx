import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, QrCode, MessageSquare, Phone, Download, Copy, Users, Clock, Building } from 'lucide-react';

interface AttendanceCode {
  employeeId: string;
  employeeName: string;
  department: string;
  code: string;
  phoneNumber: string | null;
}

interface QRCodeData {
  type: string;
  location: string;
  organizationId: string;
  timestamp: number;
  code: string;
}

export default function RemoteAttendancePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [attendanceCodes, setAttendanceCodes] = useState<AttendanceCode[]>([]);
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([]);
  const [selectedLocation, setSelectedLocation] = useState('');

  const locations = [
    'Main Office',
    'Warehouse A',
    'Site B',
    'Remote Location 1',
    'Remote Location 2'
  ];

  const generateAttendanceCodes = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/attendance/remote/generate-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setAttendanceCodes(data.codes);
        toast({ title: 'Success', description: 'Attendance codes generated successfully!' });
      } else {
        const error = await response.json();
        toast({ title: 'Error', description: error.message || 'Failed to generate codes', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to generate attendance codes', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const generateQRCode = async () => {
    if (!selectedLocation) {
      toast({ title: 'Error', description: 'Please select a location', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/attendance/remote/generate-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          location: selectedLocation,
          organizationId: 'your-org-id' // This would come from user context
        })
      });

      if (response.ok) {
        const data = await response.json();
        setQrCodes(prev => [...prev, data.qrData]);
        toast({ title: 'Success', description: 'QR code generated successfully!' });
      } else {
        const error = await response.json();
        toast({ title: 'Error', description: error.message || 'Failed to generate QR code', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to generate QR code', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied!', description: 'Code copied to clipboard' });
  };

  const downloadCodes = () => {
    const csvContent = [
      'Employee Name,Department,Code,Phone Number',
      ...attendanceCodes.map(code => 
        `${code.employeeName},${code.department},${code.code},${code.phoneNumber || 'N/A'}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-codes-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => setLocation('/attendance')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Attendance
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Remote Attendance Management</h1>
        <p className="text-gray-600 mt-2">Manage attendance for workers without system access</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SMS/WhatsApp Codes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              SMS/WhatsApp Attendance Codes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Generate daily attendance codes that can be sent via SMS or WhatsApp to workers without login access.
            </p>
            
            <Button 
              onClick={generateAttendanceCodes} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Generating...' : 'Generate Daily Codes'}
            </Button>

            {attendanceCodes.length > 0 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Generated Codes</h3>
                  <Button variant="outline" size="sm" onClick={downloadCodes}>
                    <Download className="h-4 w-4 mr-2" />
                    Download CSV
                  </Button>
                </div>
                
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {attendanceCodes.map((code, index) => (
                    <div key={index} className="p-3 border rounded-lg bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{code.employeeName}</p>
                          <p className="text-sm text-gray-600">{code.department}</p>
                          <p className="text-sm font-mono bg-white px-2 py-1 rounded mt-1">
                            {code.code}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(code.code)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* QR Code Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              QR Code Attendance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Generate QR codes for specific locations that workers can scan to mark attendance.
            </p>
            
            <div className="space-y-2">
              <Label htmlFor="location">Select Location</Label>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={generateQRCode} 
              disabled={isLoading || !selectedLocation}
              className="w-full"
            >
              {isLoading ? 'Generating...' : 'Generate QR Code'}
            </Button>

            {qrCodes.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold">Generated QR Codes</h3>
                <div className="space-y-2">
                  {qrCodes.map((qr, index) => (
                    <div key={index} className="p-3 border rounded-lg bg-gray-50">
                      <p className="font-medium">{qr.location}</p>
                      <p className="text-sm text-gray-600">Code: {qr.code}</p>
                      <p className="text-xs text-gray-500">
                        Generated: {new Date(qr.timestamp).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Voice Call System */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Voice Call Attendance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Workers can call a toll-free number and enter their employee ID to mark attendance.
            </p>
            
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="font-medium text-blue-900">Toll-Free Number</p>
              <p className="text-2xl font-bold text-blue-600">1-800-ATTEND</p>
              <p className="text-sm text-blue-700 mt-1">
                Workers call this number and follow the voice prompts
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">How it works:</h4>
              <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                <li>Worker calls the toll-free number</li>
                <li>Enters their employee ID via keypad</li>
                <li>Confirms attendance with voice prompt</li>
                <li>Can optionally leave a voice note</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Remote Attendance Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">24</p>
                <p className="text-sm text-green-700">SMS/WhatsApp</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">12</p>
                <p className="text-sm text-blue-700">QR Code</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">8</p>
                <p className="text-sm text-purple-700">Voice Call</p>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">44</p>
                <p className="text-sm text-orange-700">Total Remote</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Today's Remote Attendance</h4>
              <div className="text-sm text-gray-600">
                <p>• 44 workers marked attendance remotely</p>
                <p>• 3 different methods used</p>
                <p>• 5 locations covered</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 