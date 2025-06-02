import React from 'react';
import CompactSidebar from './CompactSidebar';
import { useAuth } from '@/hooks/use-auth';

interface ModuleLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export default function ModuleLayout({ children, title, description }: ModuleLayoutProps) {
  const { user } = useAuth();

  // Only show sidebar and margin for owners
  if (user?.role === 'owner' || user?.isOwner) {
    return (
      <div className="flex min-h-screen">
        <CompactSidebar />
        <div className="flex-1 ml-20">
          <div className="p-6">
            {title && (
              <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
                {description && (
                  <p className="text-sm text-gray-500 mt-1">{description}</p>
                )}
              </div>
            )}
            {children}
          </div>
        </div>
      </div>
    );
  }

  // For all other users, render full-width
  return (
    <div className="min-h-screen">
      <div className="p-6">
        {title && (
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
            {description && (
              <p className="text-sm text-gray-500 mt-1">{description}</p>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
} 