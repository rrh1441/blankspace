# Blank Space - Next.js Project Requirements

**App Name:** Blank Space  
**Framework:** Next.js 14 (App Router)  
**Deployment:** Vercel  
**Purpose:** Convert user photos into personalized coloring books

## Project Structure

```
blank-space/
├── app/
│   ├── (marketing)/
│   │   ├── layout.tsx
│   │   └── page.tsx              # Landing page
│   ├── preview/
│   │   └── page.tsx              # Preview experience
│   ├── checkout/
│   │   ├── page.tsx              # Order review
│   │   └── success/page.tsx      # Order confirmation
│   ├── api/
│   │   ├── preview/route.ts      # Image processing endpoint
│   │   ├── upload/route.ts       # S3 signed URLs
│   │   ├── orders/route.ts       # Order creation
│   │   ├── webhook/stripe/route.ts
│   │   └── subscribe/route.ts    # Email capture
│   ├── layout.tsx                # Root layout
│   ├── globals.css
│   └── fonts.ts
├── components/
│   ├── ui/                       # Shadcn/ui components
│   ├── ImageUploader.tsx         # Client component
│   ├── PreviewSlider.tsx         # Client component
│   ├── EmailGate.tsx             # Client component
│   ├── CheckoutForm.tsx          # Client component
│   └── AnimatedButton.tsx        # Client component
├── lib/
│   ├── openai.ts                 # OpenAI client
│   ├── stripe.ts                 # Stripe config
│   ├── aws.ts                    # S3 client
│   ├── db.ts                     # DynamoDB client
│   └── email.ts                  # Email service
├── public/
│   └── sample-book.pdf           # Gated download
└── types/
    └── index.ts
```

## Environment Variables

```env
# .env.local
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

OPENAI_API_KEY=

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1

S3_UPLOAD_BUCKET=blank-space-uploads
S3_PROCESSED_BUCKET=blank-space-processed
S3_FINAL_BUCKET=blank-space-finals

DYNAMODB_TABLE_NAME=blank-space-orders

EMAIL_FROM=hello@blankspace.app
RESEND_API_KEY=

NEXT_PUBLIC_APP_URL=https://blankspace.app
```

## Core Components

### 1. Root Layout (app/layout.tsx)
```typescript
import { Inter, Amatic_SC } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const amatic = Amatic_SC({ 
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-amatic'
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${amatic.variable}`}>
        {children}
      </body>
    </html>
  )
}
```

### 2. Landing Page (app/(marketing)/page.tsx)
```typescript
// Server Component
import { HeroSection } from '@/components/HeroSection'
import { EmailGate } from '@/components/EmailGate'
import { HowItWorks } from '@/components/HowItWorks'
import { Pricing } from '@/components/Pricing'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <HeroSection />
      <EmailGate />
      <HowItWorks />
      <Pricing />
    </main>
  )
}
```

### 3. Image Uploader Component
```typescript
'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X } from 'lucide-react'

interface ImageUploaderProps {
  maxFiles?: number
  onUpload: (files: File[]) => void
}

export function ImageUploader({ maxFiles = 24, onUpload }: ImageUploaderProps) {
  const [files, setFiles] = useState<File[]>([])
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Implementation
  }, [])
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxSize: 15 * 1024 * 1024, // 15MB
    maxFiles
  })
  
  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          border-3 border-dashed border-black bg-white p-12
          transition-all cursor-pointer relative
          hover:shadow-[4px_4px_0_0_#000]
          ${isDragActive ? 'border-accent-primary' : ''}
        `}
      >
        <input {...getInputProps()} />
        <div className="text-center">
          <Upload className="w-12 h-12 mx-auto mb-4" />
          <p className="font-amatic text-2xl">
            Drop photos here or click to browse
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Up to {maxFiles} photos • JPG or PNG • Max 15MB each
          </p>
        </div>
      </div>
      
      {/* Preview Grid */}
      <div className="grid grid-cols-6 gap-4">
        {files.map((file, index) => (
          <PhotoPreview key={index} file={file} onRemove={() => {}} />
        ))}
      </div>
    </div>
  )
}
```

### 4. API Routes

#### Preview Route (app/api/preview/route.ts)
```typescript
import { NextRequest } from 'next/server'
import { openai } from '@/lib/openai'
import { s3 } from '@/lib/aws'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.ip ?? 'unknown'
    const { success } = await rateLimit.check(ip, 1, '24h')
    if (!success) {
      return new Response('Preview limit reached', { status: 429 })
    }
    
    // Process image
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    // Validate file
    if (!file || file.size > 15 * 1024 * 1024) {
      return new Response('Invalid file', { status: 400 })
    }
    
    // Convert to line art using OpenAI
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: `Convert to high contrast black and white line art suitable for coloring: ${await getImageDescription(file)}`,
      size: '1024x1024',
      quality: 'standard',
      style: 'natural'
    })
    
    // Upload to S3
    const key = `previews/${Date.now()}.png`
    await s3.putObject({
      Bucket: process.env.S3_PROCESSED_BUCKET!,
      Key: key,
      Body: response.data[0].url,
      ContentType: 'image/png'
    })
    
    return Response.json({ 
      previewUrl: `https://${process.env.S3_PROCESSED_BUCKET}.s3.amazonaws.com/${key}`
    })
  } catch (error) {
    console.error('Preview error:', error)
    return new Response('Processing failed', { status: 500 })
  }
}
```

#### Orders Route (app/api/orders/route.ts)
```typescript
import { NextRequest } from 'next/server'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import { generatePDF } from '@/lib/pdf-generator'

export async function POST(request: NextRequest) {
  const { sessionId, imageKeys } = await request.json()
  
  // Verify Stripe session
  const session = await stripe.checkout.sessions.retrieve(sessionId)
  if (!session.payment_status === 'paid') {
    return new Response('Payment not completed', { status: 400 })
  }
  
  // Create order in DynamoDB
  const orderId = `order_${Date.now()}`
  await db.putItem({
    TableName: process.env.DYNAMODB_TABLE_NAME!,
    Item: {
      orderId,
      userEmail: session.customer_email,
      tier: session.metadata.tier,
      status: 'processing',
      imageKeys,
      createdAt: new Date().toISOString()
    }
  })
  
  // Queue PDF generation
  await generatePDF(orderId, imageKeys)
  
  return Response.json({ orderId })
}
```

### 5. Styling (app/globals.css)
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --font-inter: 'Inter', sans-serif;
    --font-amatic: 'Amatic SC', cursive;
    
    /* Colors */
    --black: #000000;
    --white: #FFFFFF;
    --gray-light: #F5F5F5;
    --gray-medium: #E0E0E0;
    --accent-primary: #FF6B6B;
    --accent-secondary: #4ECDC4;
    --accent-tertiary: #FFE66D;
  }
  
  body {
    @apply font-sans bg-white text-black;
  }
  
  h1, h2, h3 {
    @apply font-amatic;
  }
}

@layer components {
  .btn-primary {
    @apply 
      px-6 py-3 
      border-2 border-black 
      bg-white 
      font-medium 
      transition-all 
      hover:bg-accent-primary 
      hover:-translate-y-0.5 
      hover:shadow-[4px_4px_0_0_#000]
      active:translate-y-0
      active:shadow-none;
  }
  
  .section-border {
    @apply 
      border-2 border-black 
      bg-white 
      p-8 
      relative
      before:content-['']
      before:absolute
      before:inset-[-8px]
      before:border
      before:border-black
      before:opacity-20;
  }
}

/* Animations */
@keyframes draw-line {
  to {
    stroke-dashoffset: 0;
  }
}

.animate-draw {
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  animation: draw-line 2s ease-out forwards;
}
```

### 6. Middleware (middleware.ts)
```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Add security headers
  const response = NextResponse.next()
  
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  return response
}

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
}
```

### 7. Package.json Dependencies
```json
{
  "dependencies": {
    "next": "14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@stripe/stripe-js": "^2.0.0",
    "stripe": "^13.0.0",
    "@aws-sdk/client-s3": "^3.0.0",
    "@aws-sdk/client-dynamodb": "^3.0.0",
    "@aws-sdk/lib-dynamodb": "^3.0.0",
    "openai": "^4.0.0",
    "resend": "^2.0.0",
    "react-dropzone": "^14.0.0",
    "react-compare-image": "^3.0.0",
    "lucide-react": "^0.0.0",
    "class-variance-authority": "^0.0.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    "framer-motion": "^10.0.0",
    "zod": "^3.0.0",
    "@tanstack/react-query": "^5.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.0.0",
    "postcss": "^8.0.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "14.0.0"
  }
}
```

## Deployment Instructions

### Vercel Configuration
```json
// vercel.json
{
  "functions": {
    "app/api/preview/route.ts": {
      "maxDuration": 30
    },
    "app/api/orders/route.ts": {
      "maxDuration": 60
    }
  }
}
```

### Build Command
```bash
npm run build
```

### Environment Setup
1. Add all environment variables to Vercel dashboard
2. Configure AWS IAM roles for S3 and DynamoDB access
3. Set up Stripe webhooks pointing to `/api/webhook/stripe`
4. Configure custom domain in Vercel

## Development Workflow

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run type checking
npm run type-check

# Run linting
npm run lint

# Build for production
npm run build

# Run production server locally
npm run start
```

## Key Implementation Notes

1. **Image Processing**: Use OpenAI's DALL-E 3 for line art conversion
2. **State Management**: Use React Query for server state, Zustand for client state
3. **Animations**: Framer Motion for complex animations, CSS for simple ones
4. **Error Handling**: Implement error boundaries and proper API error responses
5. **SEO**: Use Next.js metadata API for dynamic meta tags
6. **Performance**: Implement image optimization with next/image
7. **Analytics**: Add Vercel Analytics and custom event tracking

This structure is optimized for Next.js 14 with App Router, ready for immediate implementation.