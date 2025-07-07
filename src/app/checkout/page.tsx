'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { loadStripe } from '@stripe/stripe-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, CreditCard, Shield, Clock, Download } from 'lucide-react'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface PreviewImage {
  id: string
  originalUrl: string
  previewUrl: string
  status: 'completed'
}

export default function CheckoutPage() {
  const [previewImages, setPreviewImages] = useState<PreviewImage[]>([])
  const [selectedTier, setSelectedTier] = useState('premium')
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Load data from localStorage
    const savedImages = typeof window !== 'undefined' ? localStorage.getItem('previewImages') : null
    const savedTier = typeof window !== 'undefined' ? localStorage.getItem('selectedTier') : null
    
    if (savedImages) {
      setPreviewImages(JSON.parse(savedImages))
    }
    
    if (savedTier) {
      setSelectedTier(savedTier)
    }
  }, [])

  const getTierInfo = () => {
    switch (selectedTier) {
      case 'basic':
        return { name: 'Basic', price: 9.99, maxPhotos: 5 }
      case 'premium':
        return { name: 'Premium', price: 19.99, maxPhotos: 15 }
      case 'deluxe':
        return { name: 'Deluxe', price: 29.99, maxPhotos: 25 }
      default:
        return { name: 'Premium', price: 19.99, maxPhotos: 15 }
    }
  }

  const tierInfo = getTierInfo()

  const handleCheckout = async () => {
    if (!email) {
      setError('Please enter your email address')
      return
    }
    
    if (previewImages.length === 0) {
      setError('No images to process')
      return
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      const stripe = await stripePromise
      
      if (!stripe) {
        throw new Error('Stripe failed to load')
      }
      
      // Create checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tier: selectedTier,
          email,
          imageCount: previewImages.length,
          images: previewImages
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }
      
      const { sessionId, demoMode } = await response.json()
      
      if (demoMode) {
        // Demo mode: redirect directly to success page
        if (typeof window !== 'undefined') {
          window.location.href = `/checkout/success?session_id=${sessionId}&demo=true`
        }
        return
      }
      
      // Redirect to Stripe checkout
      const { error } = await stripe.redirectToCheckout({
        sessionId,
      })
      
      if (error) {
        throw new Error(error.message)
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  if (previewImages.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>No Images Found</CardTitle>
            <CardDescription>
              Please go back and upload some images first.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.href = '/preview'
                }
              }}
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back to Upload
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.history.back()
              }
            }}
            className="border-2 border-black"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Complete Your Order</h1>
            <p className="text-gray-600">
              Review your coloring book and complete your purchase
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{tierInfo.name} Coloring Book</h3>
                    <p className="text-sm text-gray-600">
                      {previewImages.length} personalized coloring pages
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">${tierInfo.price}</div>
                    <div className="text-sm text-gray-600">one-time payment</div>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>${tierInfo.price}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Preview Images */}
            <Card>
              <CardHeader>
                <CardTitle>Your Coloring Pages</CardTitle>
                <CardDescription>
                  {previewImages.length} pages ready to download
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-2">
                  {previewImages.slice(0, 8).map((image, index) => (
                    <div key={image.id} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image.previewUrl}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                  {previewImages.length > 8 && (
                    <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
                      +{previewImages.length - 8} more
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Checkout Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    We&apos;ll send your coloring book download link to this email
                  </p>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700"
                  >
                    {error}
                  </motion.div>
                )}

                <Button
                  onClick={handleCheckout}
                  disabled={isLoading || !email}
                  className="w-full btn-primary text-lg py-6"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5 mr-2" />
                      Complete Purchase - ${tierInfo.price}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Security & Guarantees */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-green-600" />
                    <div>
                      <h4 className="font-semibold">Secure Payment</h4>
                      <p className="text-sm text-gray-600">
                        Your payment is protected by Stripe&apos;s industry-leading security
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <div>
                      <h4 className="font-semibold">Instant Download</h4>
                      <p className="text-sm text-gray-600">
                        Your coloring book will be ready in 5-10 minutes
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Download className="w-5 h-5 text-purple-600" />
                    <div>
                      <h4 className="font-semibold">30-Day Guarantee</h4>
                      <p className="text-sm text-gray-600">
                        Not satisfied? Get a full refund within 30 days
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}