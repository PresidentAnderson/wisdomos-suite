'use client'

import { useState, useRef, useEffect } from 'react'

interface VoiceRecorderProps {
  onTranscription: (text: string) => void
  onAudioBlob?: (blob: Blob) => void
}

export default function VoiceRecorder({ onTranscription, onAudioBlob }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [duration, setDuration] = useState(0)
  const [audioLevel, setAudioLevel] = useState(0)
  const [isTranscribing, setIsTranscribing] = useState(false)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current)
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // Set up audio context for visualization
      audioContextRef.current = new AudioContext()
      const source = audioContextRef.current.createMediaStreamSource(stream)
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 256
      source.connect(analyserRef.current)
      
      // Start visualization
      visualizeAudio()
      
      // Set up media recorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      })
      
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        
        // Send blob to parent if needed
        if (onAudioBlob) {
          onAudioBlob(audioBlob)
        }
        
        // Transcribe audio
        await transcribeAudio(audioBlob)
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
        
        // Cleanup
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
        }
        if (durationIntervalRef.current) {
          clearInterval(durationIntervalRef.current)
        }
        setAudioLevel(0)
      }
      
      mediaRecorder.start(100) // Collect data every 100ms
      setIsRecording(true)
      setIsPaused(false)
      
      // Start duration timer
      startTimeRef.current = Date.now()
      durationIntervalRef.current = setInterval(() => {
        if (!isPaused && startTimeRef.current) {
          setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000))
        }
      }, 100)
      
    } catch (error) {
      console.error('Failed to start recording:', error)
      alert('Failed to access microphone. Please check your permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)
      setDuration(0)
    }
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause()
      setIsPaused(true)
    }
  }

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume()
      setIsPaused(false)
    }
  }

  const visualizeAudio = () => {
    if (!analyserRef.current) return
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
    
    const animate = () => {
      if (!analyserRef.current) return
      
      analyserRef.current.getByteFrequencyData(dataArray)
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length
      setAudioLevel(average / 255)
      
      animationFrameRef.current = requestAnimationFrame(animate)
    }
    
    animate()
  }

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true)
    
    try {
      // Using Web Speech API for transcription
      // In production, you might want to use a service like Whisper API
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
        const recognition = new SpeechRecognition()
        
        recognition.continuous = false
        recognition.interimResults = false
        recognition.lang = 'en-US'
        
        // Convert blob to audio for recognition
        const audioUrl = URL.createObjectURL(audioBlob)
        const audio = new Audio(audioUrl)
        
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript
          onTranscription(transcript)
          setIsTranscribing(false)
        }
        
        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error)
          // Fallback: Let user know to type manually
          onTranscription('[Audio recorded - please type your journal entry]')
          setIsTranscribing(false)
        }
        
        // Start recognition
        recognition.start()
        
        // Play audio to trigger recognition (muted)
        audio.volume = 0
        audio.play()
        
      } else {
        // Fallback for browsers without speech recognition
        console.log('Speech recognition not supported')
        onTranscription('[Audio recorded - transcription not available in this browser]')
        setIsTranscribing(false)
      }
    } catch (error) {
      console.error('Transcription error:', error)
      onTranscription('[Transcription failed - please type your entry]')
      setIsTranscribing(false)
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
      <div className="flex flex-col items-center gap-4">
        {/* Audio Visualizer */}
        <div className="w-full h-24 bg-black/20 rounded-lg flex items-center justify-center relative overflow-hidden">
          {isRecording && (
            <div className="flex items-center gap-1 h-full">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 bg-cyan-400 rounded-full transition-all duration-100"
                  style={{
                    height: `${Math.max(10, audioLevel * 100 * (0.5 + Math.random()))}%`,
                    opacity: 0.8 + audioLevel * 0.2
                  }}
                />
              ))}
            </div>
          )}
          
          {!isRecording && !isTranscribing && (
            <div className="text-gray-400">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" 
                />
              </svg>
            </div>
          )}
          
          {isTranscribing && (
            <div className="text-cyan-400">
              <div className="animate-pulse">Transcribing...</div>
            </div>
          )}
        </div>

        {/* Duration Display */}
        {isRecording && (
          <div className="text-2xl font-mono text-white">
            {formatDuration(duration)}
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-4">
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-full transition-colors"
              disabled={isTranscribing}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="8" />
              </svg>
            </button>
          ) : (
            <>
              {!isPaused ? (
                <button
                  onClick={pauseRecording}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white p-4 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="6" y="4" width="4" height="16" />
                    <rect x="14" y="4" width="4" height="16" />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={resumeRecording}
                  className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
              )}
              
              <button
                onClick={stopRecording}
                className="bg-gray-500 hover:bg-gray-600 text-white p-4 rounded-full transition-colors"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="6" width="12" height="12" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Instructions */}
        <div className="text-center text-gray-300 text-sm">
          {!isRecording && !isTranscribing && (
            <p>Click the red button to start recording your journal entry</p>
          )}
          {isRecording && !isPaused && (
            <p>Recording... Speak clearly into your microphone</p>
          )}
          {isRecording && isPaused && (
            <p>Recording paused. Click play to resume</p>
          )}
          {isTranscribing && (
            <p>Processing your voice recording...</p>
          )}
        </div>
      </div>
    </div>
  )
}