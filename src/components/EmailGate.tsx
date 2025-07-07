'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Download, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function EmailGate() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })
      
      if (response.ok) {
        setIsSubmitted(true)
        // Trigger download
        const link = document.createElement('a')
        link.href = '/sample-book.pdf'
        link.download = 'sample-coloring-book.pdf'
        link.click()
      }
    } catch (error) {
      console.error('Error subscribing:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="py-20 bg-accent-primary/5">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl mx-auto text-center"
        >
          <Card className="section-border bg-white">
            <CardHeader>
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mx-auto w-16 h-16 bg-accent-primary rounded-full flex items-center justify-center mb-6"
              >
                <Download className="w-8 h-8 text-white" />
              </motion.div>
              
              <CardTitle className="text-3xl md:text-4xl font-bold mb-4">
                Get Your Free Sample Book
              </CardTitle>
              
              <CardDescription className="text-lg text-gray-600 mb-8">
                See the magic for yourself! Download a sample coloring book and get exclusive tips on creating the perfect coloring pages.
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {!isSubmitted ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Input
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="flex-1 h-12 border-2 border-black focus:border-accent-primary"
                    />
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-primary h-12 px-8 group"
                    >
                      {isSubmitting ? (
                        'Sending...'
                      ) : (
                        <>
                          <Mail className="w-5 h-5 mr-2" />
                          Download Free Sample
                          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <p className="text-sm text-gray-500 text-center">
                    We respect your privacy. Unsubscribe at any time.
                  </p>
                </form>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6 }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Download className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Thank You!</h3>
                  <p className="text-gray-600 mb-4">
                    Your sample book should start downloading shortly. Check your email for more coloring tips!
                  </p>
                  <Button
                    onClick={() => {
                      const link = document.createElement('a')
                      link.href = '/sample-book.pdf'
                      link.download = 'sample-coloring-book.pdf'
                      link.click()
                    }}
                    variant="outline"
                    className="border-2 border-black hover:bg-gray-50"
                  >
                    Download Again
                  </Button>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}