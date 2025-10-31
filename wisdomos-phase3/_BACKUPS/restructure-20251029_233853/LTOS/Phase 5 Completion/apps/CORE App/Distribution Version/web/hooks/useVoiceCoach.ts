'use client';

import { useState, useCallback, useEffect } from 'react';
import { useTextToSpeech } from './useTextToSpeech';
import { useSpeechToText } from './useSpeechToText';
import type { AutobiographyPrompt } from '@/lib/autobiography/types';

interface VoiceCoachOptions {
  prompt: AutobiographyPrompt;
  onTranscriptUpdate?: (text: string) => void;
  autoSpeak?: boolean;
}

export function useVoiceCoach({
  prompt,
  onTranscriptUpdate,
  autoSpeak = false,
}: VoiceCoachOptions) {
  const tts = useTextToSpeech();
  const stt = useSpeechToText();
  const [mode, setMode] = useState<'idle' | 'listening' | 'speaking'>('idle');

  // Update parent component with transcript
  useEffect(() => {
    if (stt.transcript && onTranscriptUpdate) {
      onTranscriptUpdate(stt.transcript);
    }
  }, [stt.transcript, onTranscriptUpdate]);

  // Auto-speak the prompt when component mounts (if enabled)
  useEffect(() => {
    if (autoSpeak && prompt.question) {
      speakPrompt();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Update mode based on TTS and STT state
  useEffect(() => {
    if (tts.isSpeaking) {
      setMode('speaking');
    } else if (stt.isListening) {
      setMode('listening');
    } else {
      setMode('idle');
    }
  }, [tts.isSpeaking, stt.isListening]);

  // Speak the prompt question
  const speakPrompt = useCallback(() => {
    const textToSpeak = `${prompt.question}. ${prompt.coachingTip || ''}`;
    tts.speak(textToSpeak);
  }, [prompt, tts]);

  // Speak coaching tip
  const speakCoachingTip = useCallback(() => {
    if (prompt.coachingTip) {
      tts.speak(prompt.coachingTip);
    }
  }, [prompt, tts]);

  // Speak encouragement
  const speakEncouragement = useCallback(
    (message: string) => {
      tts.speak(message);
    },
    [tts]
  );

  // Start voice recording with encouragement
  const startRecording = useCallback(() => {
    stt.startListening();
    // Optionally speak encouragement
    if (Math.random() > 0.5) {
      const encouragements = [
        "I'm listening. Take your time and share your story.",
        'Go ahead, I am here to listen.',
        'Please share your thoughts. I am ready.',
      ];
      const randomEncouragement =
        encouragements[Math.floor(Math.random() * encouragements.length)];
      tts.speak(randomEncouragement);
    }
  }, [stt, tts]);

  // Stop voice recording
  const stopRecording = useCallback(() => {
    stt.stopListening();
  }, [stt]);

  // Toggle recording
  const toggleRecording = useCallback(() => {
    if (stt.isListening) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [stt.isListening, startRecording, stopRecording]);

  // Clear transcript
  const clearTranscript = useCallback(() => {
    stt.resetTranscript();
  }, [stt]);

  // Stop all speech
  const stopAllSpeech = useCallback(() => {
    tts.stop();
    stt.stopListening();
  }, [tts, stt]);

  // Get full transcript (final + interim)
  const fullTranscript = stt.transcript + (stt.interimTranscript ? ` ${stt.interimTranscript}` : '');

  return {
    // State
    mode,
    isListening: stt.isListening,
    isSpeaking: tts.isSpeaking,
    transcript: stt.transcript,
    interimTranscript: stt.interimTranscript,
    fullTranscript,
    error: tts.error || stt.error,

    // TTS capabilities
    ttsSupported: tts.isSupported,
    sttSupported: stt.isSupported,

    // Actions
    speakPrompt,
    speakCoachingTip,
    speakEncouragement,
    startRecording,
    stopRecording,
    toggleRecording,
    clearTranscript,
    stopAllSpeech,

    // TTS controls
    pauseSpeaking: tts.pause,
    resumeSpeaking: tts.resume,
    stopSpeaking: tts.stop,
  };
}
