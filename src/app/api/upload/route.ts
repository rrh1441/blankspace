import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin, BUCKET_NAME } from '@/lib/supabase'

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
    
    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = file.name.split('.').pop()
    const uniqueFileName = `${timestamp}_${randomString}.${fileExtension}`
    
    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    try {
      const supabase = getSupabaseAdmin()
      
      // Upload to Supabase Storage
      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(`uploads/${uniqueFileName}`, buffer, {
          contentType: file.type,
          upsert: false
        })
      
      if (error) {
        console.error('Supabase upload error:', error)
        return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
      }
      
      // Get public URL
      const { data: publicData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(`uploads/${uniqueFileName}`)
    } catch (supabaseError) {
      console.error('Supabase configuration error:', supabaseError)
      // Demo mode fallback
      return NextResponse.json({
        success: true,
        fileName: uniqueFileName,
        publicUrl: `https://via.placeholder.com/800x600/cccccc/333333?text=${encodeURIComponent(file.name)}`,
        size: file.size,
        type: file.type,
        demoMode: true
      })
    }
    
    return NextResponse.json({
      success: true,
      fileName: uniqueFileName,
      publicUrl: publicData.publicUrl,
      size: file.size,
      type: file.type
    })
    
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ 
      error: 'Failed to process upload' 
    }, { status: 500 })
  }
}