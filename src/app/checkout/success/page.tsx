'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle, Download, Mail, Home, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

function SuccessPageContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  
  const [orderStatus, setOrderStatus] = useState<'processing' | 'completed' | 'error'>('processing')
  const [orderDetails, setOrderDetails] = useState<{
    orderId: string;
    message: string;
  } | null>(null)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)

  useEffect(() => {
    if (sessionId) {
      // Create order and start processing
      createOrder()
      
      // Poll for completion (in a real app, you'd use webhooks)
      const pollInterval = setInterval(() => {
        checkOrderStatus()
      }, 5000) // Check every 5 seconds
      
      return () => clearInterval(pollInterval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId])

  const createOrder = async () => {
    try {
      const savedImages = localStorage.getItem('previewImages')
      const savedTier = localStorage.getItem('selectedTier')
      
      if (!savedImages || !savedTier) {
        setOrderStatus('error')
        return
      }
      
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          imageData: JSON.parse(savedImages),
          tier: savedTier
        }),
      })
      
      if (response.ok) {
        const data = await response.json()
        setOrderDetails(data)
        
        // Simulate processing completion after 30 seconds
        setTimeout(() => {
          setOrderStatus('completed')
          setDownloadUrl('/sample-book.pdf') // In real app, this would be the generated PDF
        }, 30000)
      } else {
        setOrderStatus('error')
      }
    } catch (error) {
      console.error('Error creating order:', error)
      setOrderStatus('error')
    }
  }

  const checkOrderStatus = async () => {
    if (!orderDetails?.orderId) return
    
    try {
      const response = await fetch(`/api/orders/${orderDetails.orderId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.status === 'completed') {
          setOrderStatus('completed')
          setDownloadUrl(data.downloadUrl)
        }
      }
    } catch (error) {
      console.error('Error checking order status:', error)
    }
  }

  const handleDownload = () => {
    if (downloadUrl) {
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = 'my-coloring-book.pdf'
      link.click()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl mx-auto"
        >
          <Card>
            <CardHeader className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mx-auto w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6"
              >
                <CheckCircle className="w-12 h-12 text-white" />
              </motion.div>
              
              <CardTitle className="text-3xl font-bold mb-2">
                Payment Successful!
              </CardTitle>
              
              <CardDescription className="text-lg">
                Thank you for your order. Your coloring book is being created.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Order Status */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center gap-4">
                  {orderStatus === 'processing' && (
                    <>
                      <div className="animate-spin w-8 h-8 border-4 border-accent-primary border-t-transparent rounded-full"></div>
                      <div>
                        <h3 className="font-semibold text-lg">Creating Your Coloring Book</h3>
                        <p className="text-gray-600">
                          We&apos;re transforming your photos into beautiful coloring pages. This usually takes 5-10 minutes.
                        </p>
                      </div>
                    </>
                  )}
                  
                  {orderStatus === 'completed' && (
                    <>
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-green-700">Your Coloring Book is Ready!</h3>
                        <p className="text-gray-600">
                          Your personalized coloring book has been created and is ready to download.
                        </p>
                      </div>
                    </>
                  )}
                  
                  {orderStatus === 'error' && (
                    <>
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">!</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-red-700">Something Went Wrong</h3>
                        <p className="text-gray-600">
                          We encountered an error processing your order. Please contact support.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Order Details */}
              {orderDetails && (
                <div className="border-t pt-6">
                  <h4 className="font-semibold mb-3">Order Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order ID:</span>
                      <span className="font-mono">{orderDetails.orderId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="capitalize">{orderStatus}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-4">
                {orderStatus === 'completed' && downloadUrl && (
                  <Button
                    onClick={handleDownload}
                    className="w-full btn-primary text-lg py-6 group"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Download Your Coloring Book
                  </Button>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    onClick={() => window.location.href = '/'}
                    className="border-2 border-black"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Back to Home
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => window.location.href = '/preview'}
                    className="border-2 border-black"
                  >
                    Create Another
                  </Button>
                </div>
              </div>

              {/* What's Next */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-700 mb-1">Check Your Email</h4>
                    <p className="text-sm text-blue-600">
                      We&apos;ve sent a confirmation email with your download link. 
                      You can also bookmark this page to access your coloring book later.
                    </p>
                  </div>
                </div>
              </div>

              {/* Processing Time Notice */}
              {orderStatus === 'processing' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-yellow-700 mb-1">Please Wait</h4>
                      <p className="text-sm text-yellow-600">
                        Keep this page open while we create your coloring book. 
                        We&apos;ll automatically refresh when it&apos;s ready.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessPageContent />
    </Suspense>
  )
}