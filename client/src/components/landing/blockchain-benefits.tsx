'use client'

import { motion } from 'framer-motion'
import { 
  LockKeyhole, 
  History, 
  Banknote, 
  Network,
  ShieldCheck,
  Fingerprint
} from 'lucide-react'

const benefits = [
  {
    icon: LockKeyhole,
    title: 'Immutable Records',
    description: 'Every transaction is permanently recorded and cannot be altered'
  },
  {
    icon: History,
    title: 'Audit Trail',
    description: 'Complete history of all business operations and changes'
  },
  {
    icon: Banknote,
    title: 'Smart Payments',
    description: 'Automated payments and settlements using smart contracts'
  },
  {
    icon: Network,
    title: 'Decentralized',
    description: 'No single point of failure in data storage and processing'
  },
  {
    icon: ShieldCheck,
    title: 'Enhanced Security',
    description: 'Cryptographic security for all business transactions'
  },
  {
    icon: Fingerprint,
    title: 'Identity Management',
    description: 'Secure and verifiable digital identities for all users'
  }
]

export function BlockchainBenefits() {
  return (
    <section className="py-24 bg-gradient-to-br from-blue-900 to-blue-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">
            Blockchain-Powered Security
          </h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Enterprise-grade security and transparency with blockchain technology
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon
            return (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  {benefit.title}
                </h3>
                <p className="text-blue-100">
                  {benefit.description}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
} 