import { NextRequest, NextResponse } from 'next/server'
import { generateColoring } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    
    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
    }
    
    if (file.size > 15 * 1024 * 1024) { // 15MB limit
      return NextResponse.json({ error: 'File too large' }, { status: 400 })
    }
    
    // Convert file to base64 for OpenAI
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const mimeType = file.type
    const dataUrl = `data:${mimeType};base64,${base64}`
    
    // Generate coloring page using OpenAI gpt-image-1
    const coloringUrl = await generateColoring(dataUrl, 'Create a coloring book page')
    
    if (!coloringUrl) {
      return NextResponse.json({ error: 'Failed to generate coloring page' }, { status: 500 })
    }
    
    return NextResponse.json({ 
      previewUrl: coloringUrl,
      originalUrl: dataUrl
    })
    
  } catch (error) {
    console.error('Preview generation error:', error)
    return NextResponse.json({ 
      error: 'Failed to process image' 
    }, { status: 500 })
  }
}