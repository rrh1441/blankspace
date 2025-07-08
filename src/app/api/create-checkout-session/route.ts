import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const { tier, email, imageCount, images } = await request.json()
    
    if (!tier || !email || !imageCount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Demo mode: return a fake session ID if Stripe is not configured
    if (!stripe) {
      return NextResponse.json({ 
        sessionId: 'demo_session_' + Date.now(),
        demoMode: true 
      })
    }
    
    // Only support digital tier now
    if (tier !== 'digital') {
      return NextResponse.json({ error: 'Only digital downloads are available' }, { status: 400 })
    }
    
    // Create Stripe checkout session using your predefined price ID
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [
        {
          price: 'price_1RikRxKSaqiJUYkjSYLD93VS', // Your Stripe price ID
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout`,
      metadata: {
        tier,
        imageCount: imageCount.toString(),
        images: JSON.stringify(images)
      },
      automatic_tax: {
        enabled: true,
      },
    })
    
    return NextResponse.json({ sessionId: session.id })
    
  } catch (error) {
    console.error('Checkout session creation error:', error)
    return NextResponse.json({ 
      error: 'Failed to create checkout session' 
    }, { status: 500 })
  }
}