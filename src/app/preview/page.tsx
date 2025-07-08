'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { ImageUploader } from '@/components/ImageUploader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Upload, Wand2, Download } from 'lucide-react'

interface UploadedImage {
  id: string
  file: File
  url: string
  type: 'cover' | 'inside'
}

interface CoverDesign {
  id: string
  name: string
  frontTemplate: string
  backTemplate: string
  previewUrl: string
}

const coverDesigns: CoverDesign[] = [
  {
    id: 'classic',
    name: 'Classic',
    frontTemplate: '/covers/classic-front.jpg',
    backTemplate: '/covers/classic-back.jpg',
    previewUrl: '/covers/classic-preview.jpg'
  },
  {
    id: 'modern',
    name: 'Modern',
    frontTemplate: '/covers/modern-front.jpg',
    backTemplate: '/covers/modern-back.jpg',
    previewUrl: '/covers/modern-preview.jpg'
  },
  {
    id: 'playful',
    name: 'Playful',
    frontTemplate: '/covers/playful-front.jpg',
    backTemplate: '/covers/playful-back.jpg',
    previewUrl: '/covers/playful-preview.jpg'
  }
]

function PreviewPageContent() {
  const searchParams = useSearchParams()
  const tier = searchParams.get('tier') || 'digital'
  
  const [coverImages, setCoverImages] = useState<UploadedImage[]>([])
  const [insideImages, setInsideImages] = useState<UploadedImage[]>([])
  const [selectedCover, setSelectedCover] = useState<CoverDesign>(coverDesigns[0])
  const [coverTitle, setCoverTitle] = useState('My Coloring Book')
  const [currentStep, setCurrentStep] = useState<'upload' | 'covers' | 'checkout'>('upload')

  const handleCoverUpload = (files: File[]) => {
    const newCoverImages: UploadedImage[] = files.slice(0, 2).map((file, index) => ({
      id: `cover-${Date.now()}-${index}`,
      file,
      url: URL.createObjectURL(file),
      type: 'cover'
    }))
    setCoverImages(newCoverImages)
  }

  const handleInsideUpload = (files: File[]) => {
    const tierInfo = getTierInfo()
    const newInsideImages: UploadedImage[] = files.slice(0, tierInfo.maxPhotos).map((file, index) => ({
      id: `inside-${Date.now()}-${index}`,
      file,
      url: URL.createObjectURL(file),
      type: 'inside'
    }))
    setInsideImages(newInsideImages)
  }

  const handleProceedToCovers = () => {
    if (insideImages.length === 0) return
    setCurrentStep('covers')
  }

  const handleProceedToCheckout = () => {
    // Store data in localStorage for checkout
    if (typeof window !== 'undefined') {
      localStorage.setItem('coverImages', JSON.stringify(coverImages))
      localStorage.setItem('insideImages', JSON.stringify(insideImages.map(img => ({
        id: img.id,
        url: img.url
      }))))
      localStorage.setItem('selectedCover', JSON.stringify(selectedCover))
      localStorage.setItem('coverTitle', coverTitle)
      localStorage.setItem('selectedTier', tier)
    }
    
    // Navigate to checkout
    if (typeof window !== 'undefined') {
      window.location.href = '/checkout'
    }
  }

  const getTierInfo = () => {
    return { name: 'Digital Download', maxPhotos: 24, price: 19 }
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
              { step: 'covers', icon: Wand2, label: 'Design Cover' },
              { step: 'checkout', icon: Download, label: 'Complete Order' }
            ].map(({ step, icon: Icon, label }, index) => (
              <div key={step} className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    currentStep === step 
                      ? 'bg-accent-primary border-accent-primary text-white' 
                      : index < ['upload', 'covers', 'checkout'].indexOf(currentStep)
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
                    index < ['upload', 'covers', 'checkout'].indexOf(currentStep)
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
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Upload Cover Photos (Optional)</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Upload 1-2 photos for your front and back cover. Leave blank to use our template designs.
                  </p>
                  <ImageUploader
                    maxFiles={2}
                    onUpload={handleCoverUpload}
                    tier={tier}
                  />
                  {coverImages.length > 0 && (
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      {coverImages.map((img, index) => (
                        <div key={img.id} className="relative">
                          <Image src={img.url} alt={`Cover ${index + 1}`} width={200} height={128} className="w-full h-32 object-cover rounded" />
                          <span className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 text-xs rounded">
                            {index === 0 ? 'Front' : 'Back'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Upload Inside Page Photos</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Upload up to {tierInfo.maxPhotos} photos that will become coloring pages.
                  </p>
                  <ImageUploader
                    maxFiles={tierInfo.maxPhotos}
                    onUpload={handleInsideUpload}
                    tier={tier}
                  />
                  {insideImages.length > 0 && (
                    <div className="mt-6">
                      <p className="text-sm text-gray-600 mb-4">
                        {insideImages.length} photo{insideImages.length !== 1 ? 's' : ''} selected for inside pages
                      </p>
                      <div className="grid grid-cols-6 gap-2">
                        {insideImages.map((img) => (
                          <Image key={img.id} src={img.url} alt="Inside page" width={64} height={64} className="w-full h-16 object-cover rounded" />
                        ))}
                      </div>
                      <div className="mt-6 flex justify-center">
                        <Button
                          onClick={handleProceedToCovers}
                          size="lg"
                          className="btn-primary text-lg px-8 py-6 group"
                        >
                          <Wand2 className="w-5 h-5 mr-2" />
                          Design Cover ({insideImages.length} photo{insideImages.length !== 1 ? 's' : ''})
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {currentStep === 'covers' && (
            <Card>
              <CardHeader>
                <CardTitle>Design Your Cover</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Choose Cover Style</h3>
                    <div className="grid grid-cols-1 gap-4">
                      {coverDesigns.map((design) => (
                        <button
                          key={design.id}
                          onClick={() => setSelectedCover(design)}
                          className={`p-4 border-2 rounded-lg text-left transition-all ${
                            selectedCover.id === design.id
                              ? 'border-accent-primary bg-accent-primary/5'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <Image src={design.previewUrl} alt={design.name} width={64} height={80} className="w-16 h-20 object-cover rounded" />
                            <div>
                              <h4 className="font-medium">{design.name}</h4>
                              <p className="text-sm text-gray-600">Cover template style</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>

                    <div className="mt-6">
                      <label className="block text-sm font-medium mb-2">Cover Title</label>
                      <input
                        type="text"
                        value={coverTitle}
                        onChange={(e) => setCoverTitle(e.target.value)}
                        className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-accent-primary"
                        placeholder="My Coloring Book"
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Cover Preview</h3>
                    <div className="bg-gray-100 rounded-lg p-6 text-center">
                      <div className="relative inline-block">
                        <Image src={selectedCover.previewUrl} alt="Cover preview" width={192} height={240} className="w-48 h-60 object-cover rounded-lg shadow-lg" />
                        <div className="absolute bottom-4 left-4 right-4 bg-white/90 p-2 rounded">
                          <p className="font-bold text-sm">{coverTitle}</p>
                        </div>
                      </div>
                      {coverImages.length > 0 && (
                        <p className="text-sm text-gray-600 mt-4">
                          Your uploaded photos will be integrated with this design
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-center">
                  <Button
                    onClick={handleProceedToCheckout}
                    size="lg"
                    className="btn-primary text-lg px-8 py-6 group"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Complete Order
                  </Button>
                </div>
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