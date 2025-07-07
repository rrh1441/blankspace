import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const sig = request.headers.get('stripe-signature')
    
    if (!sig) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }
    
    let event
    
    try {
      event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }
    
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object
        
        // Update order status
        const { error: updateError } = await supabase
          .from('orders')
          .update({ 
            status: 'paid',
            stripe_payment_intent_id: session.payment_intent 
          })
          .eq('stripe_session_id', session.id)
        
        if (updateError) {
          console.error('Failed to update order status:', updateError)
        }
        
        break
        
      case 'payment_intent.succeeded':
        // Handle successful payment
        console.log('Payment succeeded:', event.data.object.id)
        break
        
      case 'payment_intent.payment_failed':
        // Handle failed payment
        const paymentIntent = event.data.object
        
        // Update order status to failed
        const { error: failError } = await supabase
          .from('orders')
          .update({ status: 'failed' })
          .eq('stripe_payment_intent_id', paymentIntent.id)
        
        if (failError) {
          console.error('Failed to update order status:', failError)
        }
        
        break
        
      default:
        console.log('Unhandled event type:', event.type)
    }
    
    return NextResponse.json({ received: true })
    
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ 
      error: 'Webhook handler failed' 
    }, { status: 500 })
  }
}