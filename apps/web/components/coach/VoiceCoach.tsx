'use client'

import { useState, useRef } from 'react'
import { Mic, Square, Loader2, Sparkles, TrendingUp } from 'lucide-react'
import { PhoenixCard, PhoenixCardHeader, PhoenixCardTitle, PhoenixCardContent } from '@/components/ui/phoenix-card'
import { PhoenixButton } from '@/components/ui/phoenix-button'
import { PhoenixBadge } from '@/components/ui/phoenix-badge'
import { useRouter } from 'next/navigation'

interface VoiceCoachProps {
  userId: string
}

export function VoiceCoach({ userId }: VoiceCoachProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [coachResponse, setCoachResponse] = useState('')
  const [error, setError] = useState('')
  const [recordingTime, setRecordingTime] = useState(0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const router = useRouter()

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' })
        await processAudio(audioBlob)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      setError('')
      setTranscript('')
      setCoachResponse('')
      setTags([])

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)

    } catch (err) {
      setError('Failed to access microphone. Please check permissions.')
      console.error('Microphone access error:', err)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)

      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', audioBlob, 'recording.webm')
      formData.append('userId', userId)

      const response = await fetch('/api/coach/transcribe', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to process audio')
      }

      const data = await response.json()

      setTranscript(data.transcript)
      setTags(data.tags || [])
      setCoachResponse(data.coachResponse || '')

    } catch (err: any) {
      setError(err.message || 'Failed to process recording')
      console.error('Processing error:', err)
    } finally {
      setIsProcessing(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-phoenix-orange to-phoenix-gold bg-clip-text text-transparent">
          Phoenix Wisdom Coach
        </h1>
        <p className="text-gray-600">
          Voice your reflections. Receive AI-powered insights.
        </p>
      </div>

      {/* Recording Interface */}
      <PhoenixCard variant="default">
        <PhoenixCardContent className="p-8">
          <div className="flex flex-col items-center space-y-6">
            {/* Recording Button */}
            <div className="relative">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing}
                className={`
                  w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300
                  ${isRecording
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                    : 'bg-gradient-to-br from-phoenix-orange to-phoenix-gold hover:scale-105'
                  }
                  ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  shadow-lg hover:shadow-xl
                `}
              >
                {isProcessing ? (
                  <Loader2 className="w-16 h-16 text-white animate-spin" />
                ) : isRecording ? (
                  <Square className="w-16 h-16 text-white" />
                ) : (
                  <Mic className="w-16 h-16 text-white" />
                )}
              </button>

              {/* Recording indicator */}
              {isRecording && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full animate-ping" />
              )}
            </div>

            {/* Status Text */}
            <div className="text-center">
              {isRecording && (
                <div className="space-y-1">
                  <p className="text-lg font-semibold text-gray-900">Recording...</p>
                  <p className="text-3xl font-mono text-phoenix-orange">
                    {formatTime(recordingTime)}
                  </p>
                </div>
              )}
              {isProcessing && (
                <p className="text-lg font-semibold text-gray-900">
                  Processing your reflection...
                </p>
              )}
              {!isRecording && !isProcessing && !transcript && (
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-gray-900">
                    Tap to start recording
                  </p>
                  <p className="text-sm text-gray-500">
                    Share your thoughts, feelings, and reflections
                  </p>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="w-full p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
          </div>
        </PhoenixCardContent>
      </PhoenixCard>

      {/* Transcript */}
      {transcript && (
        <PhoenixCard variant="default">
          <PhoenixCardHeader>
            <PhoenixCardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-phoenix-orange" />
              Your Reflection
            </PhoenixCardTitle>
          </PhoenixCardHeader>
          <PhoenixCardContent className="space-y-4">
            <p className="text-gray-700 leading-relaxed">{transcript}</p>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <PhoenixBadge key={index} variant="default">
                    {tag}
                  </PhoenixBadge>
                ))}
              </div>
            )}
          </PhoenixCardContent>
        </PhoenixCard>
      )}

      {/* Coach Response */}
      {coachResponse && (
        <PhoenixCard variant="gold">
          <PhoenixCardHeader>
            <PhoenixCardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-phoenix-gold" />
              Phoenix's Insights
            </PhoenixCardTitle>
          </PhoenixCardHeader>
          <PhoenixCardContent>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {coachResponse}
            </p>
          </PhoenixCardContent>
        </PhoenixCard>
      )}

      {/* View Analytics Button */}
      {transcript && (
        <div className="flex justify-center">
          <PhoenixButton
            onClick={() => router.push('/coach/analytics')}
            variant="default"
            className="flex items-center gap-2"
          >
            <TrendingUp className="w-4 h-4" />
            View Your Journey Analytics
          </PhoenixButton>
        </div>
      )}
    </div>
  )
}
