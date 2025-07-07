'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Eye, Download, ArrowLeft, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import ReactCompareImage from 'react-compare-image'

interface PreviewImage {
  id: string
  originalUrl: string
  previewUrl: string
  status: 'processing' | 'completed' | 'failed'
}

interface PreviewSliderProps {
  images: PreviewImage[]
  onProceedToCheckout: () => void
}

export function PreviewSlider({ images, onProceedToCheckout }: PreviewSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const completedImages = images.filter(img => img.status === 'completed')
  const processingImages = images.filter(img => img.status === 'processing')
  const failedImages = images.filter(img => img.status === 'failed')

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : completedImages.length - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev < completedImages.length - 1 ? prev + 1 : 0))
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  if (completedImages.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-accent-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <h3 className="text-xl font-semibold mb-2">Processing Your Images</h3>
        <p className="text-gray-600">
          {processingImages.length} image{processingImages.length !== 1 ? 's' : ''} being processed...
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Status Summary */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">{completedImages.length}</div>
          <div className="text-sm text-green-600">Completed</div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-yellow-600">{processingImages.length}</div>
          <div className="text-sm text-yellow-600">Processing</div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-red-600">{failedImages.length}</div>
          <div className="text-sm text-red-600">Failed</div>
        </div>
      </div>

      {/* Main Preview */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold">
                  Preview {currentIndex + 1} of {completedImages.length}
                </h3>
                <p className="text-sm text-gray-600">
                  Drag the slider to compare original vs coloring page
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="border-2 border-black"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {isFullscreen ? 'Exit' : 'Fullscreen'}
                </Button>
              </div>
            </div>

            {/* Compare Slider */}
            <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4' : ''}`}>
              {isFullscreen && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              
              <div className={`relative ${isFullscreen ? 'max-w-4xl w-full' : ''}`}>
                <ReactCompareImage
                  leftImage={completedImages[currentIndex]?.originalUrl}
                  rightImage={completedImages[currentIndex]?.previewUrl}
                  leftImageLabel="Original"
                  rightImageLabel="Coloring Page"
                  sliderLineColor="#FF6B6B"
                  sliderLineWidth={3}
                  handleSize={40}
                  hover={true}
                />
              </div>
            </div>

            {/* Navigation */}
            {completedImages.length > 1 && (
              <div className="flex items-center justify-between mt-4">
                <Button
                  variant="outline"
                  onClick={goToPrevious}
                  disabled={completedImages.length <= 1}
                  className="border-2 border-black"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>

                <div className="flex gap-2">
                  {completedImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        index === currentIndex ? 'bg-accent-primary' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>

                <Button
                  variant="outline"
                  onClick={goToNext}
                  disabled={completedImages.length <= 1}
                  className="border-2 border-black"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Thumbnail Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
        {completedImages.map((image, index) => (
          <motion.button
            key={image.id}
            onClick={() => setCurrentIndex(index)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
              index === currentIndex ? 'border-accent-primary' : 'border-gray-200'
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.previewUrl}
              alt={`Preview ${index + 1}`}
              className="w-full h-full object-cover"
            />
            {index === currentIndex && (
              <div className="absolute inset-0 bg-accent-primary/20" />
            )}
          </motion.button>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          onClick={onProceedToCheckout}
          size="lg"
          className="btn-primary text-lg px-8 py-6 group"
          disabled={completedImages.length === 0}
        >
          <Download className="w-5 h-5 mr-2" />
          Create My Coloring Book
          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
        
        <Button
          variant="outline"
          size="lg"
          className="text-lg px-8 py-6 border-2 border-black"
        >
          Upload More Photos
        </Button>
      </div>

      {/* Processing Status */}
      <AnimatePresence>
        {processingImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
          >
            <div className="flex items-center gap-3">
              <div className="animate-spin w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full"></div>
              <div>
                <h4 className="font-semibold text-yellow-700">
                  Still Processing {processingImages.length} Image{processingImages.length !== 1 ? 's' : ''}
                </h4>
                <p className="text-sm text-yellow-600">
                  Your remaining images will appear here as they&apos;re completed.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Failed Images */}
      <AnimatePresence>
        {failedImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">!</span>
              </div>
              <div>
                <h4 className="font-semibold text-red-700">
                  {failedImages.length} Image{failedImages.length !== 1 ? 's' : ''} Failed to Process
                </h4>
                <p className="text-sm text-red-600">
                  These images couldn&apos;t be converted. Try uploading different photos.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}