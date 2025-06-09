'use client'

import { motion } from 'framer-motion'
import { 
  Building2, 
  ShoppingBag, 
  Truck, 
  Factory,
  Hospital,
  Store
} from 'lucide-react'

const industries = [
  {
    icon: Building2,
    title: 'Real Estate',
    description: 'Tokenized property management and automated rental payments',
    benefits: ['Smart contracts for leases', 'Automated payment processing', 'Property tokenization']
  },
  {
    icon: ShoppingBag,
    title: 'Retail',
    description: 'Integrated POS with crypto payment support and inventory tracking',
    benefits: ['Multi-currency payments', 'Real-time inventory', 'Customer insights']
  },
  {
    icon: Truck,
    title: 'Logistics',
    description: 'End-to-end supply chain transparency and tracking',
    benefits: ['Shipment tracking', 'Smart contracts', 'Automated payments']
  },
  {
    icon: Factory,
    title: 'Manufacturing',
    description: 'Blockchain-verified supply chain and production tracking',
    benefits: ['Quality assurance', 'Supplier management', 'Production tracking']
  },
  {
    icon: Hospital,
    title: 'Healthcare',
    description: 'Secure patient records and payment processing',
    benefits: ['HIPAA compliance', 'Insurance processing', 'Patient records']
  },
  {
    icon: Store,
    title: 'Wholesale',
    description: 'B2B payment solutions and inventory management',
    benefits: ['B2B payments', 'Order management', 'Supplier portal']
  }
]

export function IndustrySolutions() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Industry-Specific Solutions
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tailored solutions for every industry, powered by blockchain technology
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {industries.map((industry, index) => (
            <motion.div
              key={industry.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center mb-4">
                <div className="p-3 rounded-lg bg-blue-100">
                  <industry.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold ml-4">{industry.title}</h3>
              </div>
              <p className="text-gray-600 mb-4">{industry.description}</p>
              <ul className="space-y-2">
                {industry.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center text-sm text-gray-500">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                    {benefit}
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