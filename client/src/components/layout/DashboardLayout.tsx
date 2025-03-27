import React from 'react';
import CompactSidebar from './CompactSidebar';
import Sidebar from './Sidebar';
import Header from './Header';

type DashboardLayoutProps = {
  children: React.ReactNode;
  title?: string;
  description?: string;
};

export default function DashboardLayout({ 
  children, 
  title = "Dashboard", 
  description = "Welcome to your Enterprise Resource Planning system" 
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <CompactSidebar />
      <Sidebar />
      <Header />
      
      <div className="pl-[336px] pt-16">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-semibold mb-1">{title}</h1>
              <p className="text-gray-500">{description}</p>
            </div>
          </div>
          
          {children}
        </div>
      </div>
    </div>
  );
} 