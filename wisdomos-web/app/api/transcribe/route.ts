import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'

const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY

export async function POST(req: NextRequest) {
  try {
    const user = await getUser(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!DEEPGRAM_API_KEY) {
      return NextResponse.json(
        { error: 'Deepgram API key not configured' },
        { status: 500 }
      )
    }

    const formData = await req.formData()
    const audioFile = formData.get('audio') as File
    
    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const arrayBuffer = await audioFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Call Deepgram API
    const response = await fetch('https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${DEEPGRAM_API_KEY}`,
        'Content-Type': audioFile.type || 'audio/wav'
      },
      body: buffer
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Deepgram error:', error)
      return NextResponse.json(
        { error: 'Transcription failed' },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    // Extract transcript
    const transcript = data.results?.channels?.[0]?.alternatives?.[0]?.transcript || ''
    
    return NextResponse.json({
      transcript,
      confidence: data.results?.channels?.[0]?.alternatives?.[0]?.confidence || 0,
      duration: data.metadata?.duration || 0,
      words: data.results?.channels?.[0]?.alternatives?.[0]?.words || []
    })
  } catch (error) {
    console.error('Error transcribing audio:', error)
    return NextResponse.json(
      { error: 'Failed to transcribe audio' },
      { status: 500 }
    )
  }
}