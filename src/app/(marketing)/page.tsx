'use client'

import { HeroSection } from '@/components/HeroSection'
import { EmailGate } from '@/components/EmailGate'
import { HowItWorks } from '@/components/HowItWorks'
import { Pricing } from '@/components/Pricing'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <HeroSection />
      <EmailGate />
      <HowItWorks />
      <Pricing />
    </main>
  )
}