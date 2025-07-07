'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ImageUploader } from '@/components/ImageUploader'
import { PreviewSlider } from '@/components/PreviewSlider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Upload, Wand2, Download } from 'lucide-react'

interface PreviewImage {
  id: string
  originalUrl: string
  previewUrl: string
  status: 'processing' | 'completed' | 'failed'
}

function PreviewPageContent() {
  const searchParams = useSearchParams()
  const tier = searchParams.get('tier') || 'premium'
  
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [previewImages, setPreviewImages] = useState<PreviewImage[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentStep, setCurrentStep] = useState<'upload' | 'preview' | 'checkout'>('upload')

  const handleFileUpload = (files: File[]) => {
    setUploadedFiles(files)
  }

  const handleStartProcessing = async () => {
    if (uploadedFiles.length === 0) return
    
    setIsProcessing(true)
    setCurrentStep('preview')
    
    // Initialize preview images with processing status
    const initialPreviews: PreviewImage[] = uploadedFiles.map((file, index) => ({
      id: `preview-${index}`,
      originalUrl: URL.createObjectURL(file),
      previewUrl: '',
      status: 'processing' as const
    }))
    
    setPreviewImages(initialPreviews)
    
    // Process each image
    for (let i = 0; i < uploadedFiles.length; i++) {
      try {
        const file = uploadedFiles[i]
        const formData = new FormData()
        formData.append('file', file)
        
        const response = await fetch('/api/preview', {
          method: 'POST',
          body: formData,
        })
        
        if (response.ok) {
          const { previewUrl } = await response.json()
          
          setPreviewImages(prev => prev.map((img, index) => 
            index === i ? { ...img, previewUrl, status: 'completed' } : img
          ))
        } else {
          setPreviewImages(prev => prev.map((img, index) => 
            index === i ? { ...img, status: 'failed' } : img
          ))
        }
      } catch (error) {
        console.error('Error processing image:', error)
        setPreviewImages(prev => prev.map((img, index) => 
          index === i ? { ...img, status: 'failed' } : img
        ))
      }
    }
    
    setIsProcessing(false)
  }

  const handleProceedToCheckout = () => {
    const completedImages = previewImages.filter(img => img.status === 'completed')
    if (completedImages.length === 0) return
    
    // Store preview data in localStorage for checkout
    if (typeof window !== 'undefined') {
      localStorage.setItem('previewImages', JSON.stringify(completedImages))
      localStorage.setItem('selectedTier', tier)
    }
    
    // Navigate to checkout
    if (typeof window !== 'undefined') {
      window.location.href = '/checkout'
    }
  }

  const getTierInfo = () => {
    switch (tier) {
      case 'basic':
        return { name: 'Basic', maxPhotos: 5, price: 9.99 }
      case 'premium':
        return { name: 'Premium', maxPhotos: 15, price: 19.99 }
      case 'deluxe':
        return { name: 'Deluxe', maxPhotos: 25, price: 29.99 }
      default:
        return { name: 'Premium', maxPhotos: 15, price: 19.99 }
    }
  }

  const tierInfo = getTierInfo()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
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
              <h1 className="text-3xl font-bold">Create Your Coloring Book</h1>
              <p className="text-gray-600">
                {tierInfo.name} Plan • Up to {tierInfo.maxPhotos} photos • ${tierInfo.price}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-8">
            {[
              { step: 'upload', icon: Upload, label: 'Upload Photos' },
              { step: 'preview', icon: Wand2, label: 'Preview & Edit' },
              { step: 'checkout', icon: Download, label: 'Download Book' }
            ].map(({ step, icon: Icon, label }, index) => (
              <div key={step} className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    currentStep === step 
                      ? 'bg-accent-primary border-accent-primary text-white' 
                      : index < ['upload', 'preview', 'checkout'].indexOf(currentStep)
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-gray-300 text-gray-400'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`font-medium ${
                    currentStep === step ? 'text-accent-primary' : 'text-gray-600'
                  }`}>
                    {label}
                  </span>
                </div>
                {index < 2 && (
                  <div className={`w-16 h-px ${
                    index < ['upload', 'preview', 'checkout'].indexOf(currentStep)
                      ? 'bg-green-500'
                      : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          {currentStep === 'upload' && (
            <Card>
              <CardHeader>
                <CardTitle>Upload Your Photos</CardTitle>
              </CardHeader>
              <CardContent>
                <ImageUploader
                  maxFiles={tierInfo.maxPhotos}
                  onUpload={handleFileUpload}
                  tier={tier}
                />
                
                {uploadedFiles.length > 0 && (
                  <div className="mt-6 flex justify-center">
                    <Button
                      onClick={handleStartProcessing}
                      disabled={isProcessing}
                      size="lg"
                      className="btn-primary text-lg px-8 py-6 group"
                    >
                      {isProcessing ? (
                        <>
                          <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-5 h-5 mr-2" />
                          Start Creating ({uploadedFiles.length} photo{uploadedFiles.length !== 1 ? 's' : ''})
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {currentStep === 'preview' && (
            <Card>
              <CardHeader>
                <CardTitle>Preview Your Coloring Pages</CardTitle>
              </CardHeader>
              <CardContent>
                <PreviewSlider
                  images={previewImages}
                  onProceedToCheckout={handleProceedToCheckout}
                />
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default function PreviewPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PreviewPageContent />
    </Suspense>
  )
}