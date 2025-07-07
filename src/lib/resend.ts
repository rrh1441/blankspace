import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)

export const sendEmail = async (to: string, subject: string, html: string) => {
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
  return resend
}