'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Shield, BarChart2, Users, Settings } from 'lucide-react'
import { Link } from 'wouter'
// import chainsnobg from '@/assets/chainsnobg.png'

const heroFeatures = [
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Blockchain-powered security reducing the $4.7T annual fraud losses'
  },
  {
    icon: BarChart2,
    title: 'Real-time Analytics',
    description: 'AI-powered insights and comprehensive business analytics'
  },
  {
    icon: Users,
    title: 'Multi-tenant Architecture',
    description: 'Perfect for businesses of all sizes and NGOs'
  },
  {
    icon: Settings,
    title: 'Modular Design',
    description: 'Customize your ERP with only the modules you need'
  }
]

export function MainHero() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br flex flex-col items-center from-blue-900 to-blue-950">
      {/* <img 
        src={chainsnobg} 
        alt="ChainsERP" 
        className="w-[150px] h-[150px] bg-white mt-4 rounded-2xl" 
      /> */}
      
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:60px_60px]" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Transform Your Business with{' '}
            <span className="bg-gradient-to-r from-blue-400 to-blue-200 bg-clip-text text-transparent">
              Next-Gen ERP
            </span>
          </h1>
          
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Streamline operations, boost productivity, and drive growth with our comprehensive ERP solution. 
            From POS, HR, CRM, accounting, blockchain, asset growth, and so much more! - everything you need in ONE platform.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <Link href="https://forms.gle/ABRUTcqUXt93vvAF8">
              <a className="inline-flex items-center px-6 py-3 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Link>
            <Link href="/auth">
              <a className="inline-flex items-center px-6 py-3 rounded-lg bg-white/10 text-white font-medium hover:bg-white/20 transition-colors">
                Request Demo
              </a>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {heroFeatures.map((feature) => (
              <div 
                key={feature.title}
                className="flex flex-col items-center p-6 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200"
              >
                <feature.icon className="h-8 w-8 text-blue-400 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-blue-200 text-sm text-center">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Add statistics section */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: 'Businesses Served', value: '10,000+' },
              { label: 'Fraud Prevention', value: '$4.7T' },
              { label: 'Cost Reduction', value: '60%' },
              { label: 'Customer Satisfaction', value: '98%' }
            ].map((stat) => (
              <div key={stat.label} className="bg-white/5 p-4 rounded-lg">
                <div className="text-3xl font-bold text-blue-400 mb-2">
                  {stat.value}
                </div>
                <div className="text-blue-100 text-sm">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
} 