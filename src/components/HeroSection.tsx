'use client'

import { motion } from 'framer-motion'
import { Upload, Star, Heart, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function HeroSection() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-50 relative overflow-hidden">
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
        <motion.div
          className="absolute bottom-32 left-1/4 w-3 h-3 bg-accent-tertiary rounded-full"
          animate={{
            y: [0, -10, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
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
            className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight"
          >
            Turn Your{' '}
            <span className="text-accent-primary relative">
              Photos
              <motion.div
                className="absolute -bottom-2 left-0 w-full h-2 bg-accent-primary/30 rounded-full"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              />
            </span>
            <br />
            Into{' '}
            <span className="text-accent-secondary">
              Coloring Books
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-xl md:text-2xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Transform your favorite memories into beautiful, personalized coloring books with our AI-powered magic. Perfect for kids, adults, and everyone in between.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
          >
            <Button
              size="lg"
              className="btn-primary text-lg px-8 py-6 min-w-[200px] group"
            >
              <Upload className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              Start Creating
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-lg px-8 py-6 min-w-[200px] border-2 border-black hover:bg-gray-50"
            >
              See Examples
            </Button>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="flex items-center justify-center gap-8 text-sm text-gray-500"
          >
            <div className="flex items-center gap-1">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="ml-2">500+ Happy Customers</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="w-4 h-4 fill-red-400 text-red-400" />
              <span>10,000+ Books Created</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}