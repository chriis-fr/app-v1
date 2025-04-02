'use client'

import { motion } from 'framer-motion'
import { 
  ShoppingCart, 
  Users, 
  Package, 
  DollarSign,
  Building2,
  Wallet,
  BarChart2,
  Shield,
  FileText,
  Settings,
  Briefcase,
  Calendar
} from 'lucide-react'

const modules = [
  {
    title: 'Point of Sale',
    description: 'Streamline your retail operations with our comprehensive POS system',
    icon: ShoppingCart,
    color: 'bg-blue-500',
    features: ['Real-time inventory', 'Multiple payment methods', 'Customer management', 'Receipt generation']
  },
  {
    title: 'HR Management',
    description: 'Efficient workforce management with smart payroll and attendance tracking',
    icon: Users,
    color: 'bg-green-500',
    features: ['Employee records', 'Attendance tracking', 'Payroll integration', 'Performance reviews']
  },
  {
    title: 'Inventory',
    description: 'Advanced inventory control with real-time tracking and management',
    icon: Package,
    color: 'bg-purple-500',
    features: ['Stock tracking', 'Warehouse management', 'Reorder alerts', 'Barcode scanning']
  },
  {
    title: 'Accounting',
    description: 'Complete financial management for your business',
    icon: DollarSign,
    color: 'bg-yellow-500',
    features: ['General ledger', 'Accounts payable/receivable', 'Financial reporting', 'Tax compliance']
  },
  {
    title: 'Multi-tenant',
    description: 'Support for multiple businesses and organizations',
    icon: Building2,
    color: 'bg-pink-500',
    features: ['Data isolation', 'Role-based access', 'Custom branding', 'Independent settings']
  },
  {
    title: 'Blockchain',
    description: 'Secure transactions with blockchain technology',
    icon: Wallet,
    color: 'bg-indigo-500',
    features: ['Smart contracts', 'Digital assets', 'Transaction tracking', 'Security protocols']
  },
  {
    title: 'Analytics',
    description: 'AI-powered business insights and reporting',
    icon: BarChart2,
    color: 'bg-red-500',
    features: ['Real-time dashboards', 'Custom reports', 'Predictive analytics', 'Data visualization']
  },
  {
    title: 'Security',
    description: 'Enterprise-grade security and compliance',
    icon: Shield,
    color: 'bg-teal-500',
    features: ['Role-based access', 'Audit trails', 'Data encryption', 'Compliance management']
  }
]

export function ModuleShowcase() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Powerful Modules for Every Need
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the modules that fit your business and scale as you grow
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {modules.map((module, index) => (
            <motion.div
              key={module.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-6 rounded-xl bg-white shadow-md hover:shadow-lg transition-shadow cursor-pointer group"
            >
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-xl ${module.color} text-white group-hover:scale-110 transition-transform`}>
                  <module.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {module.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {module.description}
                  </p>
                </div>
              </div>
              <ul className="mt-4 space-y-2">
                {module.features.map((feature, i) => (
                  <li key={i} className="flex items-center text-sm text-gray-600">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
} 