import { MainHero } from '@/components/landing/main-hero'
import { FeatureGrid } from '@/components/landing/feature-grid'
import { ModuleShowcase } from '@/components/landing/module-showcase'
import { BlockchainBenefits } from '@/components/landing/blockchain-benefits'
import { ComparisonTable } from '@/components/landing/comparison-table'
import { CTASection } from '@/components/landing/cta-section'

export default function Home() {
  return (
    <div className="bg-white">
      <MainHero />
      <FeatureGrid />
      <ModuleShowcase />
      <BlockchainBenefits />
      <ComparisonTable />
      <CTASection />
    </div>
  )
}
