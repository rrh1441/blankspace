import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabase } from '@/lib/supabase'
import { sendEmail } from '@/lib/resend'

export async function POST(request: NextRequest) {
  try {
    const { sessionId, imageData, tier } = await request.json()
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }
    
    // Verify Stripe session
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    
    if (!session || session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 })
    }
    
    // Create order in database
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
    
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          id: orderId,
          user_email: session.customer_email,
          tier: tier,
          status: 'processing',
          image_data: imageData,
          stripe_session_id: sessionId,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single()
    
    if (orderError) {
      console.error('Order creation error:', orderError)
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }
    
    // Send confirmation email
    try {
      await sendEmail(
        session.customer_email!,
        'Your Coloring Book Order Confirmed!',
        `
        <h2>Thank you for your order!</h2>
        <p>Your coloring book is being created and will be ready shortly.</p>
        
        <h3>Order Details:</h3>
        <ul>
          <li>Order ID: ${orderId}</li>
          <li>Plan: ${tier.charAt(0).toUpperCase() + tier.slice(1)}</li>
          <li>Images: ${imageData.length} photos</li>
          <li>Status: Processing</li>
        </ul>
        
        <p>You'll receive another email with your download link once your coloring book is ready (usually within 10 minutes).</p>
        
        <p>Questions? Reply to this email and we'll help you out!</p>
        
        <p>Happy coloring!<br>
        The Blank Space Team</p>
        `
      )
    } catch (emailError) {
      console.error('Email sending error:', emailError)
      // Don't fail the request if email fails
    }
    
    // TODO: Queue PDF generation job
    // This would typically be done with a background job queue
    // For now, we'll just return success
    
    return NextResponse.json({ 
      success: true,
      orderId,
      message: 'Order created successfully'
    })
    
  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json({ 
      error: 'Failed to process order' 
    }, { status: 500 })
  }
}