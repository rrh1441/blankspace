'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Star, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const tiers = [
  {
    id: 'digital',
    name: 'Digital Download',
    price: 19,
    deliveryTime: 'Instant',
    icon: Star,
    popular: true,
    features: [
      'Up to 24 photos',
      'High-quality line art conversion',
      'Instant PDF download',
      'Print-ready format (8.5" x 11")',
      'Custom cover page',
      'Ready for home printing',
      'Email support'
    ]
  },
  {
    id: 'printed',
    name: 'Printed & Shipped',
    price: 29,
    deliveryTime: '2 weeks',
    icon: Crown,
    popular: false,
    features: [
      'Up to 24 photos',
      'High-quality line art conversion',
      'Professional printing',
      'Premium paper quality',
      'Spiral-bound coloring book',
      'Custom cover page',
      'Free shipping included',
      'Email support'
    ]
  }
]

export function Pricing() {
  const [selectedTier, setSelectedTier] = useState('digital')

  const handleSelectTier = (tierId: string) => {
    setSelectedTier(tierId)
    // Navigate to upload page with selected tier
    if (typeof window !== 'undefined') {
      window.location.href = `/preview?tier=${tierId}`
    }
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Choose Your Perfect Plan
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Simple, transparent pricing. No hidden fees, no subscriptions. Pay once, create forever.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="relative"
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="bg-accent-primary text-white px-4 py-2 rounded-full text-sm font-medium border-2 border-black">
                    Most Popular
                  </div>
                </div>
              )}

              <Card className={`h-full transition-all duration-300 hover:shadow-xl ${
                tier.popular 
                  ? 'border-4 border-accent-primary shadow-lg scale-105' 
                  : 'border-2 border-black hover:border-accent-primary'
              }`}>
                <CardHeader className="text-center pb-8">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                    tier.popular ? 'bg-accent-primary' : 'bg-gray-100'
                  }`}>
                    <tier.icon className={`w-8 h-8 ${
                      tier.popular ? 'text-white' : 'text-gray-600'
                    }`} />
                  </div>
                  
                  <CardTitle className="text-2xl font-bold mb-2">
                    {tier.name}
                  </CardTitle>
                  
                  <div className="mb-4">
                    <span className="text-4xl font-bold">${tier.price}</span>
                    <span className="text-gray-600 ml-2">one-time</span>
                  </div>
                  
                  <CardDescription className="text-base">
                    Delivery: {tier.deliveryTime}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-3">
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleSelectTier(tier.id)}
                    className={`w-full py-6 text-lg font-medium transition-all ${
                      tier.popular
                        ? 'bg-accent-primary hover:bg-accent-primary/90 text-white border-2 border-accent-primary hover:shadow-lg'
                        : 'btn-primary'
                    }`}
                  >
                    {selectedTier === tier.id ? 'Selected' : 'Choose Plan'}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <div className="bg-white rounded-2xl p-8 border-2 border-black max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold mb-6">
              Frequently Asked Questions
            </h3>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div>
                <h4 className="font-semibold mb-2">What file formats do you accept?</h4>
                <p className="text-gray-600 text-sm">JPG and PNG files up to 15MB each.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">How long does processing take?</h4>
                <p className="text-gray-600 text-sm">Usually 5-10 minutes for most orders.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Can I print the coloring book?</h4>
                <p className="text-gray-600 text-sm">Yes! Our PDFs are print-ready and optimized for home printing.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">What if I&apos;m not satisfied?</h4>
                <p className="text-gray-600 text-sm">We offer a 30-day money-back guarantee.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}