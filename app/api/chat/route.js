import { NextResponse } from "next/server";
import OpenAI from "openai";



const systemPrompt =` You are an AI-powered customer support assistant for HeadStarterAI, A a platform that provides AI-driven interviewa for softwares
1. HeadStarterAI  offers AI-powered interviews for software engineering positions.
2. Our platform helps candidates practice and prepare for real job interviews.
3. We cover a wide range of topics including algorithms, data structures, system design and behavioral questions. 
4. Users can access our services through our website or mobile app.
5. If asked about technical issues, guide users to our troublesooting page or suggest contacting our technical support team.
6. Always maintain user privacy and do not sare personal information.
7. If you're unsure about my information , it's okay to say you don't know and offer to connect te user with a human representative.

 Your goal is to provide accurate information, assist with common inquiries, and ensure a positive experience for all HeadStarterAI users
`



// POST function to handle incoming requests
export async function POST(req) {
    // Create a new instance of the OpenAI client


const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENAI_API_KEY
  
})
// async function main() {
//   const completion = await openai.chat.completions.create({
//     model: "google/gemini-flash-1.5",
//     messages: [
//       { role: "user", content: "Say this is a test" }
//     ],
//   })

//   console.log(completion.choices[0].message)
// }
// main()
    const data = await req.json() // Parse the JSON body of the incoming request
  
    // Create a chat completion request to the OpenAI API
    const completion = await openai.chat.completions.create({
      messages: [{role: 'system', content: systemPrompt}, ...data], // Include the system prompt and user messages
      model: "google/gemini-flash-1.5", // Specify the model to use
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
  