import OpenAI from 'openai'

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const generateColoring = async (imageUrl: string, prompt: string) => {
  const response = await openai.images.generate({
    model: 'gpt-image-1',
    prompt: `Convert this image into a high-contrast black and white line art suitable for coloring. Make it simple and bold with clear outlines. Focus on the main subject and simplify details. Style: coloring book page, clean lines, no shading. ${prompt}`,
    size: '1024x1024',
    quality: 'standard',
    n: 1,
  })

  return response.data?.[0]?.url || null
}

export const getOpenAIClient = () => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not defined')
  }
  return openai
}