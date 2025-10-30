'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useVoiceSettingsStore } from '@/stores/voiceSettingsStore';

export function useTextToSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { settings } = useVoiceSettingsStore();
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Check if speech synthesis is supported
  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // Get available voices
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (!isSupported) return;

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [isSupported]);

  // Speak text
  const speak = useCallback(
    (text: string) => {
      if (!isSupported) {
        setError('Text-to-speech is not supported in this browser');
        return;
      }

      if (!settings.enabled) {
        return;
      }

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;

      // Find the selected voice
      const selectedVoice = voices.find((v) => v.name === settings.voice) || voices[0];
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.rate = settings.rate;
      utterance.pitch = settings.pitch;
      utterance.volume = settings.volume;

      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
        setError(null);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
        utteranceRef.current = null;
      };

      utterance.onerror = (event) => {
        setError(`Speech error: ${event.error}`);
        setIsSpeaking(false);
        setIsPaused(false);
        utteranceRef.current = null;
      };

      window.speechSynthesis.speak(utterance);
    },
    [isSupported, settings, voices]
  );

  // Pause speech
  const pause = useCallback(() => {
    if (!isSupported) return;
    if (isSpeaking && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, [isSupported, isSpeaking, isPaused]);

  // Resume speech
  const resume = useCallback(() => {
    if (!isSupported) return;
    if (isSpeaking && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, [isSupported, isSpeaking, isPaused]);

  // Stop speech
  const stop = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
    utteranceRef.current = null;
  }, [isSupported]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (isSupported) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSupported]);

  return {
    speak,
    pause,
    resume,
    stop,
    isSpeaking,
    isPaused,
    error,
    isSupported,
    voices,
  };
}
