'use client'

import { motion } from 'framer-motion'
import { Upload, Wand2, Download, ArrowRight } from 'lucide-react'

const steps = [
  {
    icon: Upload,
    title: "Upload Your Photos",
    description: "Choose up to 24 of your favorite photos. We support JPG and PNG formats up to 15MB each.",
    color: "accent-primary"
  },
  {
    icon: Wand2,
    title: "AI Magic Happens",
    description: "Our advanced AI transforms your photos into beautiful black and white line art perfect for coloring.",
    color: "accent-secondary"
  },
  {
    icon: Download,
    title: "Download Your Book",
    description: "Get your personalized coloring book as a high-quality PDF, ready to print and enjoy.",
    color: "accent-tertiary"
  }
]

export function HowItWorks() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Creating your personalized coloring book is as easy as 1-2-3. No design skills required!
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="relative"
            >
              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-24 left-full w-12 h-px bg-gray-300 z-10">
                  <ArrowRight className="absolute -top-2 -right-2 w-4 h-4 text-gray-400" />
                </div>
              )}

              <div className="section-border text-center group hover:shadow-lg transition-shadow duration-300">
                {/* Step Number */}
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-white border-2 border-black rounded-full flex items-center justify-center font-bold text-lg">
                  {index + 1}
                </div>

                {/* Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 + 0.3 }}
                  className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ${
                    step.color === 'accent-primary' ? 'bg-accent-primary' :
                    step.color === 'accent-secondary' ? 'bg-accent-secondary' :
                    'bg-accent-tertiary'
                  }`}
                >
                  <step.icon className="w-10 h-10 text-white" />
                </motion.div>

                {/* Content */}
                <h3 className="text-2xl font-bold mb-4">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-accent-primary/10 to-accent-secondary/10 rounded-2xl p-8 border-2 border-black">
            <h3 className="text-2xl font-bold mb-4">
              Ready to Create Your First Coloring Book?
            </h3>
            <p className="text-gray-600 mb-6">
              Join thousands of happy customers who have transformed their photos into beautiful coloring books.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary text-lg px-8 py-4 group"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.href = '/preview'
                }
              }}
            >
              Get Started Now
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </div>
        </motion.div>

        {/* Sample Download Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center mt-16"
          id="download-section"
        >
          <div className="bg-gray-50 rounded-2xl p-8 border-2 border-gray-200">
            <h3 className="text-2xl font-bold mb-4">
              See What You'll Get
            </h3>
            <p className="text-gray-600 mb-6">
              Download our sample coloring book to see the amazing quality and detail of our AI-generated line art.
            </p>
            <motion.a
              href="/sample-book.pdf"
              download="sample-coloring-book.pdf"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center btn-primary text-lg px-8 py-4 group"
            >
              <Download className="w-5 h-5 mr-2" />
              Download Sample Book
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}