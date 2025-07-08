'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Upload, ArrowRight, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useDropzone } from 'react-dropzone'

interface CustomImageSliderProps {
  beforeImage: string
  afterImage: string
  beforeLabel: string
  afterLabel: string
}

function CustomImageSlider({ beforeImage, afterImage, beforeLabel, afterLabel }: CustomImageSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50)
  const [isDragging, setIsDragging] = useState(false)

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    updateSliderPosition(e)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      updateSliderPosition(e)
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true)
    updateSliderPositionTouch(e)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging) {
      e.preventDefault()
      updateSliderPositionTouch(e)
    }
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  const updateSliderPosition = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = (x / rect.width) * 100
    setSliderPosition(Math.max(0, Math.min(100, percentage)))
  }

  const updateSliderPositionTouch = (e: React.TouchEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const touch = e.touches[0]
    const x = touch.clientX - rect.left
    const percentage = (x / rect.width) * 100
    setSliderPosition(Math.max(0, Math.min(100, percentage)))
  }

  return (
    <div
      className="relative w-full h-full cursor-ew-resize select-none touch-pan-x"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* After image (background) */}
      <div className="absolute inset-0">
        <Image
          src={afterImage}
          alt={afterLabel}
          fill
          className="object-cover"
          draggable={false}
        />
      </div>

      {/* Before image (foreground with clip) */}
      <div 
        className="absolute inset-0 overflow-hidden"
        style={{
          clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`
        }}
      >
        <Image
          src={beforeImage}
          alt={beforeLabel}
          fill
          className="object-cover"
          draggable={false}
        />
      </div>

      {/* Slider line */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white shadow-lg"
        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
      >
        {/* Slider handle */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg border-2 border-accent-primary flex items-center justify-center">
          <div className="w-1 h-4 bg-accent-primary rounded-full"></div>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
        {beforeLabel}
      </div>
      <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
        {afterLabel}
      </div>
    </div>
  )
}

export function HeroSection() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [convertedImage, setConvertedImage] = useState<string | null>(null)
  const [showUploadModal, setShowUploadModal] = useState(false)

  // Default demo images
  const defaultOriginal = '/y2o.JPG'
  const defaultConverted = '/y2.png'

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return
    
    const file = acceptedFiles[0]
    const imageUrl = URL.createObjectURL(file)
    setUploadedImage(imageUrl)
    setIsProcessing(true)
    setShowUploadModal(false)
    
    // Simulate processing
    setTimeout(() => {
      setConvertedImage('/y2.png')
      setIsProcessing(false)
    }, 3000)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxSize: 15 * 1024 * 1024,
    maxFiles: 1
  })

  const currentOriginal = uploadedImage || defaultOriginal
  const currentConverted = convertedImage || defaultConverted

  return (
    <section className="min-h-screen bg-gradient-to-br from-white to-gray-50 py-20 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-20 w-4 h-4 bg-accent-primary rounded-full"
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-40 right-32 w-6 h-6 bg-accent-secondary rounded-full"
          animate={{
            y: [0, 15, 0],
            x: [0, -15, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-left"
          >

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
            >
              Make Coloring Books from Your{' '}
              <span className="text-accent-primary relative">
                Camera Roll
                <motion.div
                  className="absolute -bottom-2 left-0 w-full h-2 bg-accent-primary/30 rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                />
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-2xl md:text-3xl text-gray-600 mb-8 leading-relaxed"
            >
              Because your pictures deserve more than cloud storage
            </motion.h2>


            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="flex justify-center sm:justify-start"
            >
              <Button
                size="lg"
                className="btn-primary text-lg px-8 py-4 group"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.location.href = '/preview'
                  }
                }}
              >
                Create Full Coloring Book
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </motion.div>

          {/* Right Side - Image Converter */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative"
          >
            <Card className="border-2 border-black shadow-lg">
              <CardContent className="p-6">
                <div className="mb-4 text-center">
                  <h3 className="text-xl font-bold mb-2">Live Demo</h3>
                  <p className="text-sm text-gray-600">
                    {uploadedImage ? 'Your photo' : 'Sample photo'} → Coloring page
                  </p>
                </div>

                <div className="relative w-full max-w-sm mx-auto rounded-lg overflow-hidden" style={{ aspectRatio: '3/4' }}>
                  {isProcessing ? (
                    <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                      <div className="text-center">
                        <div className="animate-spin w-8 h-8 border-4 border-accent-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-sm text-gray-600">Converting to coloring page...</p>
                      </div>
                    </div>
                  ) : (
                    <CustomImageSlider
                      beforeImage={currentOriginal}
                      afterImage={currentConverted}
                      beforeLabel="Original"
                      afterLabel="Coloring Page"
                    />
                  )}
                </div>

                <div className="mt-4 flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowUploadModal(true)}
                    className="border-2 border-black hover:bg-accent-primary hover:text-white"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Try with your own photo
                  </Button>
                  <p className="text-xs text-gray-500 text-center">
                    Drag the slider to compare original vs coloring page
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Upload Modal */}
            {showUploadModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg p-6 max-w-md w-full">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">Upload Your Photo</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowUploadModal(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div
                    {...getRootProps()}
                    className={`
                      border-3 border-dashed border-gray-300 bg-white p-8 rounded-xl
                      transition-all cursor-pointer relative
                      hover:border-accent-primary hover:bg-accent-primary/5
                      ${isDragActive ? 'border-accent-primary bg-accent-primary/10' : ''}
                    `}
                  >
                    <input {...getInputProps()} />
                    <div className="text-center">
                      <Upload className="w-8 h-8 mx-auto mb-4 text-gray-400" />
                      <p className="text-lg font-medium mb-2">
                        {isDragActive ? 'Drop your photo here!' : 'Drop photo here or click to browse'}
                      </p>
                      <p className="text-sm text-gray-500">
                        JPG or PNG • Max 15MB
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Floating Elements */}
            <motion.div
              className="absolute -top-4 -right-4 w-8 h-8 bg-accent-secondary rounded-full"
              animate={{
                y: [0, -10, 0],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="absolute -bottom-4 -left-4 w-6 h-6 bg-accent-tertiary rounded-full"
              animate={{
                y: [0, 10, 0],
                x: [0, 5, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  )
}