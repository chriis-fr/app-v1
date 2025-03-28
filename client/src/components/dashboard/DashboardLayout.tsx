"use client"
import React from 'react';
import CompactSidebar from '../layout/CompactSidebar';
import Sidebar from '../layout/Sidebar';
import Header from '../layout/Header';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';

export function DashboardLayout({ children }: React.PropsWithChildren) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  
  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isLoading && !user) {
      setLocation('/auth');
    }
  }, [user, isLoading, setLocation]);
  
  if (isLoading) {
    return <div className="flex h-screen w-full items-center justify-center">Loadingi...</div>;
  }
  
  if (!user) {
    return null; // Will redirect in the useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CompactSidebar />
      <Sidebar />
      <Header />
      
      <div className="pl-[336px] pt-16">
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
