'use client'

import { motion } from 'framer-motion'
import { 
  ShoppingBag, 
  Users, 
  Package, 
  DollarSign,
  Building2,
  Wallet,
  BarChart,
  Shield
} from 'lucide-react'

const modules = [
  {
    title: 'Point of Sale',
    description: 'Modern POS with crypto payment support',
    icon: ShoppingBag,
    color: 'bg-blue-500'
  },
  {
    title: 'HR Management',
    description: 'Smart payroll with crypto options',
    icon: Users,
    color: 'bg-green-500'
  },
  {
    title: 'Inventory',
    description: 'Real-time tracking with blockchain',
    icon: Package,
    color: 'bg-purple-500'
  },
  {
    title: 'Finance',
    description: 'Hybrid payment processing',
    icon: DollarSign,
    color: 'bg-yellow-500'
  },
  {
    title: 'Real Estate',
    description: 'Property management with NFTs',
    icon: Building2,
    color: 'bg-pink-500'
  },
  {
    title: 'Smart Wallet',
    description: 'Integrated business wallets',
    icon: Wallet,
    color: 'bg-indigo-500'
  },
  {
    title: 'Analytics',
    description: 'AI-powered business insights',
    icon: BarChart,
    color: 'bg-red-500'
  },
  {
    title: 'Security',
    description: 'Blockchain-backed data integrity',
    icon: Shield,
    color: 'bg-teal-500'
  }
]

export function ModuleShowcase() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Modular Architecture for Every Need
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
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
} 