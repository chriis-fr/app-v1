"use client";
import React from 'react';
import CompactSidebar from '../layout/CompactSidebar';
import Sidebar from '../layout/Sidebar';
import Header from '../layout/Header';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';

export function DashboardLayout({ children }: React.PropsWithChildren) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  React.useEffect(() => {
    if (!isLoading && !user) {
      setLocation('/auth');
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return <div className="flex h-screen w-full items-center justify-center">Loading...</div>;
  }

  if (!user) return null;

  const isOwner = user?.role === 'owner' || user?.isOwner;

  return (
    <div className="min-h-screen flex bg-gray-50">
      {isOwner ? (
        <>
          {/* Owner: CompactSidebar + Sidebar (both fixed) */}
          <div className="fixed left-0 top-0 z-30 h-screen w-20">
            <CompactSidebar />
          </div>
          <div className="fixed left-20 top-0 z-20 h-screen w-64 overflow-hidden">
            <Sidebar />
          </div>
          <div className="flex-1 flex flex-col min-h-screen pl-[336px]">
            <Header />
            <main className="pt-16 p-8">{children}</main>
          </div>
        </>
      ) : (
        <>
          {/* Non-owner: Sidebar sits directly at the left edge (static) */}
          <div className="w-64 h-screen overflow-hidden flex-shrink-0">
            <Sidebar />
          </div>
          <div className="flex-1 flex flex-col min-h-screen">
            <Header />
            <main className="pt-16 p-8">{children}</main>
          </div>
        </>
      )}
    </div>
  );
}
