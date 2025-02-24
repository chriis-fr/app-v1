'use client'

import { Check, X } from 'lucide-react'

const features = [
  {
    name: 'Blockchain Integration',
    chainERP: true,
    traditional: false,
    description: 'Built-in blockchain security and smart contracts'
  },
  {
    name: 'Crypto Payments',
    chainERP: true,
    traditional: false,
    description: 'Accept and process cryptocurrency payments'
  },
  {
    name: 'Smart Contracts',
    chainERP: true,
    traditional: false,
    description: 'Automated business logic and payments'
  },
  {
    name: 'AI-Powered Analytics',
    chainERP: true,
    traditional: false,
    description: 'Intelligent business insights and predictions'
  },
  {
    name: 'Modular Architecture',
    chainERP: true,
    traditional: true,
    description: 'Customizable business modules'
  },
  {
    name: 'Global Payments',
    chainERP: true,
    traditional: true,
    description: 'International payment processing'
  },
  {
    name: 'Real-time Updates',
    chainERP: true,
    traditional: true,
    description: 'Instant data synchronization'
  },
  {
    name: 'Audit Trail',
    chainERP: true,
    traditional: true,
    description: 'Track all business operations'
  },
  {
    name: 'Role-based Security',
    chainERP: true,
    traditional: true,
    description: 'Authorized access control for sensitive operations'
  }
]

export function ComparisonTable() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Why Chains ERP Leads the Market
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A comprehensive comparison with traditional ERP solutions
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-4 gap-px bg-gray-200">
            <div className="bg-gray-50 p-6">
              <h3 className="text-lg font-semibold text-gray-900">Features</h3>
            </div>
            <div className="bg-white p-6">
              <h3 className="text-lg font-semibold text-blue-600">Chains-ERP</h3>
            </div>
            <div className="bg-white p-6">
              <h3 className="text-lg font-semibold text-gray-600">Traditional ERP</h3>
            </div>
            <div className="bg-gray-50 p-6">
              <h3 className="text-lg font-semibold text-gray-900">Details</h3>
            </div>

            {features.map((feature, index) => (
              <div key={feature.name} className="contents">
                <div className="bg-gray-50 p-6 flex items-center">
                  <span className="font-medium text-gray-900">{feature.name}</span>
                </div>
                <div className="bg-white p-6 flex items-center justify-center">
                  {feature.chainERP ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <X className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <div className="bg-white p-6 flex items-center justify-center">
                  {feature.traditional ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <X className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <div className="bg-gray-50 p-6 flex items-center">
                  <span className="text-sm text-gray-600">{feature.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
} 