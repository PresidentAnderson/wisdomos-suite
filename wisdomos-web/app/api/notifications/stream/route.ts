import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

// Store active connections
const clients = new Map<string, ReadableStreamDefaultController>()

export async function GET(request: NextRequest) {
  try {
    // Get auth token
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return new Response('Unauthorized', { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { sub: string }
    const userId = decoded.sub

    // Create SSE stream
    const stream = new ReadableStream({
      start(controller) {
        // Store the controller for this user
        clients.set(userId, controller)

        // Send initial connection message
        const encoder = new TextEncoder()
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: 'connected', message: 'Notification stream connected' })}\n\n`)
        )

        // Send heartbeat every 30 seconds to keep connection alive
        const heartbeat = setInterval(() => {
          try {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'heartbeat', timestamp: new Date().toISOString() })}\n\n`)
            )
          } catch (error) {
            clearInterval(heartbeat)
            clients.delete(userId)
          }
        }, 30000)

        // Cleanup on close
        request.signal.addEventListener('abort', () => {
          clearInterval(heartbeat)
          clients.delete(userId)
          controller.close()
        })
      },
      cancel() {
        // Clean up when client disconnects
        clients.delete(userId)
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('SSE error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}

