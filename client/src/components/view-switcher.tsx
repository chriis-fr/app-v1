import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Eye, User, Shield } from 'lucide-react';
import { useLocation } from 'wouter';

export type ViewType = 'admin' | 'user';

interface ViewSwitcherProps {
  moduleId: string;
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export default function ViewSwitcher({ moduleId, currentView, onViewChange }: ViewSwitcherProps) {
  const [, setLocation] = useLocation();

  const handleViewChange = (view: ViewType) => {
    onViewChange(view);
    // Navigate to appropriate route based on view
    if (view === 'user') {
      setLocation(`/${moduleId}`);
    } else {
      setLocation(`/dashboard/${moduleId}/info`);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          View As: {currentView === 'admin' ? 'Admin' : 'User'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleViewChange('admin')}>
          <Shield className="h-4 w-4 mr-2" />
          Admin View
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleViewChange('user')}>
          <User className="h-4 w-4 mr-2" />
          User View
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 