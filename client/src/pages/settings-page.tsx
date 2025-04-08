import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userSchema } from '@shared/schema';
import { Camera, Upload, X } from 'lucide-react';
import { useState } from 'react';
import { BackButton } from '@/components/ui/back-button';
import type { User } from '@/hooks/use-auth';
import { toast } from '@/components/ui/use-toast';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  position?: string;
  department?: string;
  employeeId?: string;
  hireDate?: string;
  managerId?: string;
  team?: string;
  location?: {
    office?: string;
    floor?: string;
    deskNumber?: string;
  };
  workSchedule?: {
    startTime?: string;
    endTime?: string;
    timezone?: string;
  };
  emergencyContact?: {
    name?: string;
    relationship?: string;
    phone?: string;
  };
}

export default function SettingsPage() {
  const { user, setUser } = useAuth();
  const [, setLocation] = useLocation();
  const [profilePhoto, setProfilePhoto] = useState<string | null>(user?.avatarUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(userSchema.pick({ firstName: true, lastName: true, email: true, phoneNumber: true })),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
      position: user?.position || '',
      department: user?.department || '',
      employeeId: user?.employeeId || '',
      hireDate: user?.hireDate || '',
      managerId: user?.managerId || '',
      team: user?.team || '',
      location: user?.location || { office: '', floor: '', deskNumber: '' },
      workSchedule: user?.workSchedule || { startTime: '', endTime: '', timezone: '' },
      emergencyContact: user?.emergencyContact || { name: '', relationship: '', phone: '' },
    },
  });

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);

      const response = await fetch('/api/user/photo', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload photo');
      }

      const { url } = await response.json();
      setProfilePhoto(url);
      setUser(prev => {
        if (!prev) return null;
        return {
          ...prev,
          avatarUrl: url
        };
      });
    } catch (error) {
      console.error('Error uploading photo:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handlePhotoDelete = async () => {
    try {
      const response = await fetch('/api/user/photo', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete photo');
      }

      setProfilePhoto(null);
      setUser(prev => {
        if (!prev) return null;
        return {
          ...prev,
          avatarUrl: null
        };
      });
    } catch (error) {
      console.error('Error deleting photo:', error);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          userId: user?.id, // Include the user ID for the server to identify the user
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      
      // Show success message
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    setLocation('/auth');
    return <div>Redirecting...</div>;
  }

  const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <BackButton />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>Manage your profile information and photo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                {profilePhoto ? (
                  <img
                    src={profilePhoto}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-semibold text-primary">
                    {initials}
                  </span>
                )}
              </div>
              <div className="absolute bottom-0 right-0">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                    disabled={isUploading}
                  />
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white hover:bg-primary/90">
                    <Camera className="w-4 h-4" />
                  </div>
                </label>
              </div>
              {profilePhoto && (
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-0 right-0 w-8 h-8 rounded-full"
                  onClick={handlePhotoDelete}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            <div className="text-center sm:text-left">
              <h3 className="text-lg font-semibold">{user.firstName} {user.lastName}</h3>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" {...form.register('firstName')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" {...form.register('lastName')} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...form.register('email')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input id="phoneNumber" {...form.register('phoneNumber')} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input id="position" {...form.register('position')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input id="department" {...form.register('department')} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employeeId">Employee ID</Label>
                <Input id="employeeId" {...form.register('employeeId')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hireDate">Hire Date</Label>
                <Input id="hireDate" type="date" {...form.register('hireDate')} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="managerId">Manager ID</Label>
                <Input id="managerId" {...form.register('managerId')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="team">Team</Label>
                <Input id="team" {...form.register('team')} />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Location</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location.office">Office</Label>
                  <Input id="location.office" {...form.register('location.office')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location.floor">Floor</Label>
                  <Input id="location.floor" {...form.register('location.floor')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location.deskNumber">Desk Number</Label>
                  <Input id="location.deskNumber" {...form.register('location.deskNumber')} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Work Schedule</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="workSchedule.startTime">Start Time</Label>
                  <Input id="workSchedule.startTime" type="time" {...form.register('workSchedule.startTime')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workSchedule.endTime">End Time</Label>
                  <Input id="workSchedule.endTime" type="time" {...form.register('workSchedule.endTime')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workSchedule.timezone">Timezone</Label>
                  <Input id="workSchedule.timezone" {...form.register('workSchedule.timezone')} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Emergency Contact</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergencyContact.name">Name</Label>
                  <Input id="emergencyContact.name" {...form.register('emergencyContact.name')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyContact.relationship">Relationship</Label>
                  <Input id="emergencyContact.relationship" {...form.register('emergencyContact.relationship')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyContact.phone">Phone</Label>
                  <Input id="emergencyContact.phone" {...form.register('emergencyContact.phone')} />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 