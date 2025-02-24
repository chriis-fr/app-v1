'use client'

import { motion } from 'framer-motion'
import { 
  Shield, 
  Zap, 
  LineChart, 
  Wallet, 
  Users, 
  Globe 
} from 'lucide-react'
import chainsnobg from '@/assets/chainsnobg.png'

const features = [
  {
    icon: Shield,
    title: 'Fraud Prevention',
    description: 'Reduce fraud risks with blockchain-powered transparency and real-time auditing'
  },
  {
    icon: Zap,
    title: 'Modular Architecture',
    description: 'Select and implement specific modules as your business grows - from POS to HR'
  },
  {
    icon: LineChart,
    title: 'Cost Savings',
    description: 'Subscription-based pricing and reduced operational errors save millions annually'
  },
  {
    icon: Wallet,
    title: 'Smart Payments',
    description: 'Support for both traditional and cryptocurrency transactions across B2B, B2C, and C2B'
  },
  {
    icon: Users,
    title: 'Employee Empowerment',
    description: 'Flexible payment options and smart wallets for international teams'
  },
  {
    icon: Globe,
    title: 'Global Operations',
    description: 'Simplified international payments and multi-currency support for global expansion'
  }
]

export function FeatureGrid() {
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        <img src={chainsnobg} alt="chains" className='w-[150px] h-[150px] bg-white rounded-2xl' />
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Why Choose Chains ERP?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A complete solution for businesses of all sizes, combining traditional ERP features with cutting-edge technology
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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