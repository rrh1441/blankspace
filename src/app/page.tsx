'use client'

import { HeroSection } from '@/components/HeroSection'
import { HowItWorks } from '@/components/HowItWorks'
import { Pricing } from '@/components/Pricing'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <HeroSection />
      <HowItWorks />
      <Pricing />
    </main>
  )
}