import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { 
  Building2, 
  Users, 
  Settings, 
  Shield, 
  Database, 
  CreditCard, 
  Bell, 
  Globe, 
  FileText,
  Lock
} from 'lucide-react';
import { useState } from 'react';
import { useOrganization } from '@/contexts/OrganizationContext';

interface Permission {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

interface Role {
  id: string;
  name: string;
  permissions: string[];
}

export default function OrganizationSettingsPage() {
  const { user } = useAuth();
  const { organization } = useOrganization();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', name: 'General', icon: Building2 },
    { id: 'users', name: 'Users & Roles', icon: Users },
    { id: 'permissions', name: 'Permissions', icon: Shield },
    { id: 'integrations', name: 'Integrations', icon: Database },
    { id: 'billing', name: 'Billing', icon: CreditCard },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'regional', name: 'Regional', icon: Globe },
    { id: 'documents', name: 'Documents', icon: FileText },
    { id: 'security', name: 'Security', icon: Lock }
  ];

  const permissions: Permission[] = [
    { id: 'manage_users', name: 'Manage Users', description: 'Add, edit, and remove users', enabled: true },
    { id: 'manage_roles', name: 'Manage Roles', description: 'Create and modify user roles', enabled: true },
    { id: 'view_reports', name: 'View Reports', description: 'Access to view reports and analytics', enabled: true },
    { id: 'manage_inventory', name: 'Manage Inventory', description: 'Add, edit, and remove inventory items', enabled: false },
    { id: 'manage_sales', name: 'Manage Sales', description: 'Process sales and manage orders', enabled: true },
    { id: 'manage_purchases', name: 'Manage Purchases', description: 'Process purchases and manage suppliers', enabled: false },
    { id: 'manage_finance', name: 'Manage Finance', description: 'Access to financial data and transactions', enabled: true },
    { id: 'manage_hr', name: 'Manage HR', description: 'Access to employee data and HR functions', enabled: false }
  ];

  const roles: Role[] = [
    { id: 'admin', name: 'Administrator', permissions: ['manage_users', 'manage_roles', 'view_reports', 'manage_inventory', 'manage_sales', 'manage_purchases', 'manage_finance', 'manage_hr'] },
    { id: 'manager', name: 'Manager', permissions: ['view_reports', 'manage_inventory', 'manage_sales', 'manage_purchases'] },
    { id: 'employee', name: 'Employee', permissions: ['view_reports', 'manage_sales'] }
  ];

  if (!organization) {
    return <div>No organization found</div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Organization Settings</h1>
          <p className="text-gray-500">Manage your organization's settings and preferences</p>
        </div>
        <button
          onClick={() => setLocation('/dashboard')}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
        >
          Back to Dashboard
        </button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Navigation */}
        <div className="w-64 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-5 w-5" />
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-white rounded-lg border p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-medium mb-4">Organization Information</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Organization Name
                    </label>
                    <input
                      type="text"
                      defaultValue={organization.name}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Industry
                    </label>
                    <input
                      type="text"
                      defaultValue={organization.industry}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Organization Type
                    </label>
                    <select
                      defaultValue={organization.type}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="business">Business</option>
                      <option value="ngo">NGO</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Organization Size
                    </label>
                    <select 
                      defaultValue={organization.size || ''}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Select size</option>
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201-500">201-500 employees</option>
                      <option value="501-1000">501-1000 employees</option>
                      <option value="1000+">1000+ employees</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Created At
                    </label>
                    <input
                      type="text"
                      defaultValue={new Date(organization.createdAt).toLocaleDateString()}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Updated At
                    </label>
                    <input
                      type="text"
                      defaultValue={new Date(organization.updatedAt).toLocaleDateString()}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      disabled
                    />
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-medium mb-4">Contact Information</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      defaultValue={organization.email || ''}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      defaultValue={organization.phone || ''}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Website
                    </label>
                    <input
                      type="url"
                      defaultValue={organization.website || ''}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tax ID
                    </label>
                    <input
                      type="text"
                      defaultValue={organization.taxId || ''}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <textarea
                      defaultValue={organization.address || ''}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      defaultValue={organization.country || ''}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-medium mb-4">Modules</h2>
                <div className="grid grid-cols-3 gap-4">
                  {organization.activeModules.map((module: string) => (
                    <div key={module} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={true}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm capitalize">{module.replace('_', ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'permissions' && (
            <div className="space-y-6">
              <h2 className="text-lg font-medium mb-4">Role Permissions</h2>
              <div className="space-y-4">
                {roles.map((role) => (
                  <div key={role.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium">{role.name}</h3>
                      <button className="text-sm text-primary hover:text-primary/80">
                        Edit
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {permissions.map((permission) => (
                        <div key={permission.id} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={role.permissions.includes(permission.id)}
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <div>
                            <div className="text-sm font-medium">{permission.name}</div>
                            <div className="text-xs text-gray-500">{permission.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="space-y-6">
              <h2 className="text-lg font-medium mb-4">System Integrations</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Payment Gateway</h3>
                  <p className="text-sm text-gray-500 mb-4">Connect your payment processing system</p>
                  <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
                    Configure
                  </button>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Accounting Software</h3>
                  <p className="text-sm text-gray-500 mb-4">Sync with your accounting system</p>
                  <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
                    Configure
                  </button>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Inventory System</h3>
                  <p className="text-sm text-gray-500 mb-4">Connect your inventory management system</p>
                  <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
                    Configure
                  </button>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">CRM System</h3>
                  <p className="text-sm text-gray-500 mb-4">Connect your customer relationship management system</p>
                  <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
                    Configure
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Add other tab contents here */}
        </div>
      </div>
    </div>
  );
} 