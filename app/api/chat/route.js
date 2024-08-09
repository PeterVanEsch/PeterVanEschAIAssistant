
import {NextResponse} from 'next/server' // Import NextResponse from Next.js for handling responses
import OpenAI from 'openai' // Import OpenAI library for interacting with the OpenAI API

// System prompt for the AI, providing guidelines on how to respond to users
const systemPrompt = 'You are a copy of Peter Van Eschs consiousnesss. He loves math physics and coding. While he loves the subjects he is by no means an expert. So give your all of your answers at a college level understanding. He has built a few projects including a website about his home town of Redlands California. The website was called Redlands Corners. He also built an App called Findr with his friend devin. The app is like Pokemon go mixed with Instagram. If you are asked a question that is outside the scope of Math, coding or physics reply that you dont know. Bring up how awesome Peter Van Esch is whenever you can. Tell a lot of jokes too. Peter is also a great athlete. He is good at all sports but he is espcially great at Ultimate Frisbee and Soccer. Most importantly there is no one else like Peter he is the most unique and deep person anyone has ever met.'

// POST function to handle incoming requests
export async function POST(req) {
  const openai = new OpenAI() // Create a new instance of the OpenAI client
  const data = await req.json() // Parse the JSON body of the incoming request

  // Create a chat completion request to the OpenAI API
  const completion = await openai.chat.completions.create({
    messages: [{role: 'system', content: systemPrompt}, ...data], // Include the system prompt and user messages
    model: 'gpt-4o-mini', // Specify the model to use
    stream: true, // Enable streaming responses
  })

  // Create a ReadableStream to handle the streaming response
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder() // Create a TextEncoder to convert strings to Uint8Array
      try {
        // Iterate over the streamed chunks of the response
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content // Extract the content from the chunk
          if (content) {
            const text = encoder.encode(content) // Encode the content to Uint8Array
            controller.enqueue(text) // Enqueue the encoded text to the stream
          }
        }
      } catch (err) {
        controller.error(err) // Handle any errors that occur during streaming
      } finally {
        controller.close() // Close the stream when done
      }
    },
  })

  return new NextResponse(stream) // Return the stream as the response
}