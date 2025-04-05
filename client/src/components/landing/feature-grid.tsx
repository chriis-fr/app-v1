'use client'

import { motion } from 'framer-motion'
import { 
  Shield, 
  Zap, 
  LineChart, 
  Wallet, 
  Users, 
  Globe,
  ShoppingCart,
  Package,
  Building2,
  Settings,
  BarChart2,
  FileText
} from 'lucide-react'
import chainsnobg from '@/assets/chainsnobg.png'

const features = [
  {
    icon: ShoppingCart,
    title: 'Point of Sale',
    description: 'Modern POS system with real-time inventory tracking, multiple payment methods, and customer management'
  },
  {
    icon: Users,
    title: 'HR Management',
    description: 'Comprehensive HR solution with employee records, attendance tracking, and payroll integration'
  },
  {
    icon: Package,
    title: 'Inventory Control',
    description: 'Advanced inventory management with stock tracking, warehouse management, and reorder alerts'
  },
  {
    icon: FileText,
    title: 'Accounting',
    description: 'Complete financial management with general ledger, accounts payable/receivable, and tax compliance'
  },
  {
    icon: Building2,
    title: 'Multi-tenant',
    description: 'Support for multiple businesses and NGOs with separate data isolation and management'
  },
  {
    icon: Settings,
    title: 'Customizable',
    description: 'Modular architecture allowing you to choose and implement only the features you need'
  },
  {
    icon: BarChart2,
    title: 'Analytics',
    description: 'AI-powered business insights and comprehensive reporting tools for data-driven decisions'
  },
  {
    icon: Shield,
    title: 'Security',
    description: 'Enterprise-grade security with role-based access control and blockchain integration'
  }
]

export function FeatureGrid() {
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        <img src={chainsnobg} alt="chains" className='w-[150px] h-[150px] bg-white rounded-2xl' />
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Comprehensive Business Solutions
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A complete suite of tools to manage every aspect of your business operations
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-xl border hover:border-blue-500 hover:shadow-lg transition-all duration-200"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
} 