'use client'

import { Check, X } from 'lucide-react'

type FeatureStatus = boolean; 
type GlobalFeatureStatus = boolean | 'Limited' | 'Basic' | 'Partial' | 'No';

interface Feature {
  name: string;
  chainERP: FeatureStatus;
  traditional: FeatureStatus;
  description: string;
}

interface GlobalFeature {
  name: string;
  chainERP: GlobalFeatureStatus;
  traditional: GlobalFeatureStatus;
  description: string;
}

const features: Feature[] = [
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

const globalFeatures: GlobalFeature[] = [
  {
    name: 'Multi-Currency Management',
    chainERP: true,
    traditional: 'Limited',
    description: 'Seamlessly handle transactions in multiple currencies with real-time exchange rates'
  },
  {
    name: 'International Trade Compliance',
    chainERP: true,
    traditional: 'Limited',
    description: 'Automated compliance with international trade regulations and tariffs'
  },
  {
    name: 'Global Tax Automation',
    chainERP: true,
    traditional: 'Basic',
    description: 'Automated tax calculations for different countries and jurisdictions'
  },
  {
    name: 'Blockchain-Verified Documents',
    chainERP: true,
    traditional: 'No',
    description: 'Immutable verification of international shipping and trade documents'
  },
  {
    name: 'Cross-Border Supply Chain',
    chainERP: true,
    traditional: 'Basic',
    description: 'End-to-end visibility of international supply chains with blockchain verification'
  },
  {
    name: 'Multi-Language Support',
    chainERP: true,
    traditional: 'Partial',
    description: 'Full system localization for global teams and customers'
  },
  {
    name: 'Digital Currency Transactions',
    chainERP: true,
    traditional: 'No',
    description: 'Native support for cryptocurrency payments and transactions'
  },
  {
    name: 'Global Marketplace Integration',
    chainERP: true,
    traditional: 'Limited',
    description: 'Connect with international marketplaces and e-commerce platforms'
  }
]

export function ComparisonTable() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Why Chains ERP Leads the Global Market
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A comprehensive comparison with traditional ERP solutions for modern global business
          </p>
        </div>

        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Core ERP Features</h3>
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
        
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Global Business Capabilities</h3>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="grid grid-cols-4 gap-px bg-gray-200">
              <div className="bg-blue-50 p-6">
                <h3 className="text-lg font-semibold text-gray-900">Global Feature</h3>
              </div>
              <div className="bg-white p-6">
                <h3 className="text-lg font-semibold text-blue-600">Chains-ERP</h3>
              </div>
              <div className="bg-white p-6">
                <h3 className="text-lg font-semibold text-gray-600">Traditional ERP</h3>
              </div>
              <div className="bg-blue-50 p-6">
                <h3 className="text-lg font-semibold text-gray-900">Global Advantage</h3>
              </div>

              {globalFeatures.map((feature, index) => (
                <div key={feature.name} className="contents">
                  <div className="bg-blue-50 p-6 flex items-center">
                    <span className="font-medium text-gray-900">{feature.name}</span>
                  </div>
                  <div className="bg-white p-6 flex items-center justify-center">
                    {feature.chainERP === true ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : feature.chainERP === 'Limited' ? (
                      <span className="text-sm text-amber-500">Limited</span>
                    ) : (
                      <X className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <div className="bg-white p-6 flex items-center justify-center">
                    {feature.traditional === true ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : feature.traditional === 'Limited' ? (
                      <span className="text-sm text-amber-500">Limited</span>
                    ) : feature.traditional === 'Basic' ? (
                      <span className="text-sm text-amber-500">Basic</span>
                    ) : feature.traditional === 'Partial' ? (
                      <span className="text-sm text-amber-500">Partial</span>
                    ) : (
                      <X className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <div className="bg-blue-50 p-6 flex items-center">
                    <span className="text-sm text-gray-600">{feature.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">
              Our advanced global business modules make Chains-ERP the ideal solution for companies
              looking to expand internationally or optimize their existing global operations.
            </p>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Schedule a Global Business Demo
            </button>
          </div>
        </div>
      </div>
    </section>
  )
} 