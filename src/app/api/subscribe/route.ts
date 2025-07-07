import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendEmail } from '@/lib/resend'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }
    
    // Store email in Supabase
    const { error: dbError } = await supabase
      .from('email_subscribers')
      .insert([
        { 
          email, 
          subscribed_at: new Date().toISOString(),
          source: 'sample_download'
        }
      ])
    
    if (dbError && dbError.code !== '23505') { // Ignore duplicate email errors
      console.error('Database error:', dbError)
      return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 })
    }
    
    // Send welcome email
    try {
      await sendEmail(
        email,
        'Welcome to Blank Space! Your Sample Book is Ready',
        `
        <h2>Welcome to Blank Space!</h2>
        <p>Thank you for downloading our sample coloring book. We hope you love creating personalized coloring books from your photos!</p>
        
        <h3>Here are some tips for the best results:</h3>
        <ul>
          <li>Use high-contrast photos with clear subjects</li>
          <li>Avoid overly complex or busy backgrounds</li>
          <li>Portrait and landscape photos work equally well</li>
          <li>Higher resolution photos create better line art</li>
        </ul>
        
        <p>Ready to create your first coloring book? <a href="${process.env.NEXT_PUBLIC_APP_URL}">Get started here</a></p>
        
        <p>Happy coloring!<br>
        The Blank Space Team</p>
        `
      )
    } catch (emailError) {
      console.error('Email sending error:', emailError)
      // Don't fail the request if email fails
    }
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Subscribe error:', error)
    return NextResponse.json({ 
      error: 'Failed to process subscription' 
    }, { status: 500 })
  }
}