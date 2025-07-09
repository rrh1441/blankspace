'use client'

import { useState, useCallback } from 'react'
import { useDropzone, FileRejection } from 'react-dropzone'
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { motion, AnimatePresence } from 'framer-motion'

interface ImageFile extends File {
  preview: string
}

interface ImageUploaderProps {
  maxFiles?: number
  onUpload: (files: File[]) => void
  tier?: string
}

export function ImageUploader({ maxFiles = 24, onUpload, tier }: ImageUploaderProps) {
  const [files, setFiles] = useState<ImageFile[]>([])
  const [uploadError, setUploadError] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
    setUploadError(null)
    
    if (rejectedFiles.length > 0) {
      const error = rejectedFiles[0].errors[0]
      if (error.code === 'file-too-large') {
        setUploadError('File is too large. Maximum size is 15MB.')
      } else if (error.code === 'file-invalid-type') {
        setUploadError('Invalid file type. Please upload JPG or PNG files.')
      } else {
        setUploadError('Error uploading file. Please try again.')
      }
      return
    }

    const newFiles = acceptedFiles.map(file => 
      Object.assign(file, {
        preview: URL.createObjectURL(file)
      })
    )

    setFiles(currentFiles => {
      const totalFiles = [...currentFiles, ...newFiles]
      if (totalFiles.length > maxFiles) {
        setUploadError(`You can only upload up to ${maxFiles} files.`)
        return currentFiles
      }

      // Call onUpload with the new files
      onUpload(totalFiles)
      return totalFiles
    })
  }, [maxFiles, onUpload])

  const removeFile = (index: number) => {
    setFiles(currentFiles => {
      const newFiles = currentFiles.filter((_, i) => i !== index)
      onUpload(newFiles)
      return newFiles
    })
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxSize: 15 * 1024 * 1024, // 15MB
    maxFiles
  })

  const getTierLimit = () => {
    switch (tier) {
      case 'digital': return 24
      case 'printed': return 24
      default: return maxFiles
    }
  }

  const tierLimit = getTierLimit()

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardContent className="p-0">
          <div
            {...getRootProps()}
            className={`
              border-3 border-dashed border-gray-300 bg-gray-50 p-12
              transition-all cursor-pointer relative overflow-hidden
              hover:border-accent-primary hover:bg-accent-primary/5
              ${isDragActive ? 'border-accent-primary bg-accent-primary/10' : ''}
            `}
          >
            <input {...getInputProps()} />
            
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="grid grid-cols-8 gap-4 h-full">
                {[...Array(32)].map((_, i) => (
                  <div key={i} className="bg-gray-400 rounded-full w-2 h-2" />
                ))}
              </div>
            </div>

            <div className="text-center relative z-10">
              <motion.div
                animate={{ 
                  scale: isDragActive ? 1.1 : 1,
                  rotate: isDragActive ? 5 : 0
                }}
                transition={{ duration: 0.2 }}
                className="mx-auto mb-4"
              >
                <div className="w-16 h-16 mx-auto bg-accent-primary rounded-full flex items-center justify-center mb-4">
                  <Upload className="w-8 h-8 text-white" />
                </div>
              </motion.div>

              <h3 className="text-2xl font-bold mb-2">
                {isDragActive ? 'Drop your photos here!' : 'Upload Your Photos'}
              </h3>
              
              <p className="text-gray-600 mb-4">
                Drop photos here or click to browse
              </p>
              
              <div className="text-sm text-gray-500 space-y-1">
                <p>Up to {tierLimit} photos • JPG or PNG • Max 15MB each</p>
                <p>{files.length} of {tierLimit} photos uploaded</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      <AnimatePresence>
        {uploadError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{uploadError}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* File Preview Grid */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
          >
            {files.map((file, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="relative group"
              >
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-accent-primary transition-colors">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={file.preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <Button
                      onClick={() => removeFile(index)}
                      variant="destructive"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-accent-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {index + 1}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Summary */}
      {files.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent-primary rounded-full flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold">
                  {files.length} Photo{files.length !== 1 ? 's' : ''} Ready
                </h4>
                <p className="text-sm text-gray-600">
                  Total size: {(files.reduce((acc, file) => acc + file.size, 0) / 1024 / 1024).toFixed(1)} MB
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-gray-600">
                {tierLimit - files.length} remaining
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}