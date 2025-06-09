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
  Calendar,
  Globe,
  Ship,
  HeartHandshake,
  Factory,
  Truck,
  Brain,
  ShoppingBag,
  Languages,
  Bitcoin,
  Database,
  Workflow,
  PieChart,
  Wrench
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
  },
  {
    title: 'Global Finance',
    description: 'Navigate international financial challenges with ease',
    icon: Globe,
    color: 'bg-emerald-500',
    features: ['Multi-currency support', 'Global tax compliance', 'Exchange rate management', 'International payment gateways']
  },
  {
    title: 'International Trade',
    description: 'Simplify import/export operations and compliance',
    icon: Ship,
    color: 'bg-sky-500',
    features: ['Customs documentation', 'Tariff management', 'Trade compliance', 'International shipping']
  },
  {
    title: 'Customer Experience',
    description: 'Enhance customer satisfaction across global markets',
    icon: HeartHandshake,
    color: 'bg-rose-500',
    features: ['Feedback analysis', 'Sentiment tracking', 'Cultural adaptations', 'Service quality monitoring']
  },
  {
    title: 'Manufacturing',
    description: 'Optimize production planning and factory operations',
    icon: Factory,
    color: 'bg-amber-500',
    features: ['Production planning', 'Quality control', 'Material requirements', 'Work order management']
  },
  {
    title: 'Supply Chain & Vendor',
    description: 'Manage global suppliers and optimize logistics',
    icon: Truck,
    color: 'bg-cyan-500',
    features: ['Supplier networks', 'Logistics optimization', 'Vendor performance', 'Supply chain visibility']
  },
  {
    title: 'AI Analytics',
    description: 'Leverage artificial intelligence for advanced business insights',
    icon: Brain,
    color: 'bg-violet-500',
    features: ['Predictive algorithms', 'Machine learning', 'Decision support', 'Pattern recognition']
  },
  {
    title: 'Global E-commerce',
    description: 'Expand your online retail presence worldwide',
    icon: ShoppingBag,
    color: 'bg-fuchsia-500',
    features: ['Marketplace integration', 'Local payment methods', 'Cross-border selling', 'Global inventory sync']
  },
  {
    title: 'Localization',
    description: 'Adapt your business for different markets and languages',
    icon: Languages,
    color: 'bg-orange-500',
    features: ['Multi-language support', 'Cultural adaptation', 'Regional compliance', 'Localized user experience']
  },
  {
    title: 'Digital Currency',
    description: 'Embrace the future of money with cryptocurrency integration',
    icon: Bitcoin,
    color: 'bg-amber-400',
    features: ['Crypto payments', 'Blockchain receipts', 'Digital wallets', 'Transaction transparency']
  },
  {
    title: 'Warehouse Management',
    description: 'Optimize your warehouse operations and inventory placement',
    icon: Database,
    color: 'bg-blue-600',
    features: ['Location tracking', 'Picking optimization', 'Inventory layout', 'Warehouse efficiency']
  },
  {
    title: 'Project Service',
    description: 'Comprehensive tools for service project management',
    icon: Workflow,
    color: 'bg-lime-500',
    features: ['Service delivery', 'Project timelines', 'Resource allocation', 'Client collaboration']
  },
  {
    title: 'Procurement',
    description: 'Streamline purchasing processes and supplier relationships',
    icon: Briefcase,
    color: 'bg-slate-500',
    features: ['Purchase orders', 'Requisition management', 'Vendor negotiations', 'Cost control']
  },
  {
    title: 'Quality Management',
    description: 'Ensure consistent product quality and regulatory compliance',
    icon: Shield,
    color: 'bg-green-600',
    features: ['Quality control', 'Inspection protocols', 'Compliance tracking', 'Defect management']
  },
  {
    title: 'Maintenance',
    description: 'Keep equipment running efficiently with preventive maintenance',
    icon: Wrench,
    color: 'bg-zinc-500',
    features: ['Equipment maintenance', 'Work orders', 'Asset tracking', 'Scheduled servicing']
  },
  {
    title: 'Marketing',
    description: 'Effective tools for campaign management and lead generation',
    icon: PieChart,
    color: 'bg-red-600',
    features: ['Campaign tracking', 'Lead management', 'Marketing analytics', 'Audience targeting']
  }
]

export function ModuleShowcase() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Powerful Modules for Every Business Need
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the modules that fit your business and scale as you grow. Our comprehensive suite covers 
            both local operations and global expansion needs.
          </p>
        </div>

        <div className="mb-12 bg-white rounded-xl p-8 shadow-md">
          <h3 className="text-2xl font-bold text-blue-600 mb-4">Why Choose Our Modular Approach?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-4 border border-gray-100 rounded-lg bg-blue-50">
              <h4 className="font-semibold text-lg mb-2">Tailored to Your Needs</h4>
              <p className="text-gray-700">Only pay for what you need. Start with core modules and add more as your business grows.</p>
            </div>
            <div className="p-4 border border-gray-100 rounded-lg bg-green-50">
              <h4 className="font-semibold text-lg mb-2">Seamless Integration</h4>
              <p className="text-gray-700">All modules work together in perfect harmony, sharing data and providing comprehensive insights.</p>
            </div>
            <div className="p-4 border border-gray-100 rounded-lg bg-purple-50">
              <h4 className="font-semibold text-lg mb-2">Global Ready</h4>
              <p className="text-gray-700">From day one, your business can operate globally with our international-focused modules.</p>
            </div>
          </div>
        </div>

        <div className="mb-10">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Core Business Modules</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {modules.slice(0, 8).map((module, index) => (
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

        <div className="mb-10">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Global Business Expansion Modules</h3>
          <p className="text-gray-600 mb-6">Expand your business globally with these specialized modules designed for international operations.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {modules.slice(8, 16).map((module, index) => (
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

        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Specialized Industry Modules</h3>
          <p className="text-gray-600 mb-6">Tailored solutions for specific industries and operational needs.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {modules.slice(16).map((module, index) => (
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

        <div className="mt-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Ready to transform your business?</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Our modular ERP system adapts to your business needs today while preparing you for global expansion tomorrow.
            </p>
            <button className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
              Start Your Free Trial
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  )
} 