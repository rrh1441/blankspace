import { Resend } from 'resend'

export const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null

export const sendEmail = async (to: string, subject: string, html: string) => {
  if (!resend) {
    console.log('Demo mode: Email would be sent to:', to, 'Subject:', subject)
    return { id: 'demo-email-id' }
  }

  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM || 'hello@blankspace.app',
    to,
    subject,
    html,
  })

  if (error) {
    throw new Error(`Failed to send email: ${error.message}`)
  }

  return data
}

export const getResendClient = () => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not defined')
  }
  return resend!
}