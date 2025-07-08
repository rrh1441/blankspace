'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Upload, ArrowRight, Sparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useDropzone } from 'react-dropzone'
import ReactCompareImage from 'react-compare-image'

export function HeroSection() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [convertedImage, setConvertedImage] = useState<string | null>(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [imagesLoaded, setImagesLoaded] = useState(false)

  // Default demo images - same image for both sides
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

  // Preload images and check if they exist
  useEffect(() => {
    const loadImages = async () => {
      try {
        const originalImg = new Image()
        const convertedImg = new Image()
        
        originalImg.onload = () => console.log('Original image loaded:', defaultOriginal)
        originalImg.onerror = () => console.error('Failed to load original image:', defaultOriginal)
        
        convertedImg.onload = () => {
          console.log('Converted image loaded:', defaultConverted)
          setImagesLoaded(true)
        }
        convertedImg.onerror = () => console.error('Failed to load converted image:', defaultConverted)
        
        originalImg.src = defaultOriginal
        convertedImg.src = defaultConverted
      } catch (error) {
        console.error('Error loading images:', error)
      }
    }
    
    loadImages()
  }, [])

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
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-accent-primary/10 border-2 border-accent-primary/20 px-4 py-2 rounded-full mb-8"
            >
              <Sparkles className="w-4 h-4 text-accent-primary" />
              <span className="text-sm font-medium text-accent-primary">
                AI-Powered Magic
              </span>
            </motion.div>

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

                <div className="relative aspect-[2/3] rounded-lg overflow-hidden max-w-md mx-auto">
                  {isProcessing ? (
                    <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                      <div className="text-center">
                        <div className="animate-spin w-8 h-8 border-4 border-accent-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-sm text-gray-600">Converting to coloring page...</p>
                      </div>
                    </div>
                  ) : !imagesLoaded ? (
                    <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                      <div className="text-center">
                        <div className="animate-spin w-8 h-8 border-4 border-accent-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-sm text-gray-600">Loading demo images...</p>
                        <p className="text-xs text-gray-500 mt-2">
                          Original: {currentOriginal}<br/>
                          Converted: {currentConverted}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full">
                      <ReactCompareImage
                        leftImage={currentOriginal}
                        rightImage={currentConverted}
                        leftImageLabel="Original"
                        rightImageLabel="Coloring Page"
                        sliderLineColor="#FF6B6B"
                        sliderLineWidth={3}
                        handleSize={40}
                        hover={true}
                        onSliderPositionChange={(position) => {
                          console.log('Slider position:', position)
                        }}
                        onError={(error) => {
                          console.error('ReactCompareImage error:', error)
                        }}
                      />
                    </div>
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