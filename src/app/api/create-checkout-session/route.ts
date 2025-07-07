import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const { tier, email, imageCount, images } = await request.json()
    
    if (!tier || !email || !imageCount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    // Define pricing
    const pricing = {
      basic: { price: 999, name: 'Basic Plan' }, // $9.99 in cents
      premium: { price: 1999, name: 'Premium Plan' }, // $19.99 in cents
      deluxe: { price: 2999, name: 'Deluxe Plan' } // $29.99 in cents
    }
    
    const selectedPlan = pricing[tier as keyof typeof pricing]
    
    if (!selectedPlan) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })
    }
    
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${selectedPlan.name} - Coloring Book`,
              description: `${imageCount} personalized coloring pages`,
              images: ['https://your-domain.com/logo.png'], // Add your logo URL
            },
            unit_amount: selectedPlan.price,
          },
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