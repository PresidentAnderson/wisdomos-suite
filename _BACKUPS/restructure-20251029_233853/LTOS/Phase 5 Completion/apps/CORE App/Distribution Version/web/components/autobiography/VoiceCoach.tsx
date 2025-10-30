'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, Settings, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useVoiceCoach } from '@/hooks/useVoiceCoach';
import { VoiceSettingsModal } from './VoiceSettingsModal';
import type { AutobiographyPrompt } from '@/lib/autobiography/types';

interface VoiceCoachProps {
  prompt: AutobiographyPrompt;
  onTranscriptUpdate?: (text: string) => void;
}

export function VoiceCoach({ prompt, onTranscriptUpdate }: VoiceCoachProps) {
  const [showSettings, setShowSettings] = useState(false);
  const coach = useVoiceCoach({
    prompt,
    onTranscriptUpdate,
    autoSpeak: false,
  });

  if (!coach.ttsSupported && !coach.sttSupported) {
    return null;
  }

  return (
    <>
      <Card className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border-indigo-200 dark:border-indigo-800">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100 flex items-center gap-2">
              <Volume2 className="w-5 h-5" />
              Voice Coach
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>

          {/* Status Display */}
          <AnimatePresence mode="wait">
            {coach.mode !== 'idle' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white/50 dark:bg-black/20 rounded-lg p-4"
              >
                {coach.mode === 'listening' && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      >
                        <Mic className="w-5 h-5 text-red-500" />
                      </motion.div>
                      <span className="font-medium text-indigo-800 dark:text-indigo-200">
                        Listening...
                      </span>
                    </div>
                    {coach.fullTranscript && (
                      <p className="text-sm text-indigo-700 dark:text-indigo-300 italic">
                        "{coach.fullTranscript}"
                      </p>
                    )}
                  </div>
                )}

                {coach.mode === 'speaking' && (
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                    >
                      <Volume2 className="w-5 h-5 text-blue-500" />
                    </motion.div>
                    <span className="font-medium text-indigo-800 dark:text-indigo-200">
                      Speaking...
                    </span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Display */}
          {coach.error && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-700 dark:text-red-300">{coach.error}</p>
            </div>
          )}

          {/* Controls */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Listen to Prompt */}
            {coach.ttsSupported && (
              <Button
                variant="outline"
                onClick={coach.speakPrompt}
                disabled={coach.isSpeaking}
                className="flex items-center gap-2"
              >
                <Volume2 className="w-4 h-4" />
                Read Prompt
              </Button>
            )}

            {/* Voice Recording */}
            {coach.sttSupported && (
              <Button
                variant={coach.isListening ? 'destructive' : 'default'}
                onClick={coach.toggleRecording}
                className="flex items-center gap-2"
              >
                {coach.isListening ? (
                  <>
                    <MicOff className="w-4 h-4" />
                    Stop
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" />
                    Record
                  </>
                )}
              </Button>
            )}

            {/* Pause/Resume Speaking */}
            {coach.ttsSupported && coach.isSpeaking && (
              <Button variant="outline" onClick={coach.pauseSpeaking}>
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </Button>
            )}

            {/* Clear Transcript */}
            {coach.sttSupported && coach.transcript && (
              <Button
                variant="outline"
                onClick={coach.clearTranscript}
                disabled={coach.isListening}
              >
                Clear
              </Button>
            )}
          </div>

          {/* Info Text */}
          <p className="text-sm text-indigo-600 dark:text-indigo-400">
            {coach.sttSupported && coach.ttsSupported && (
              'Use voice recording to speak your response, or have the prompt read aloud to you.'
            )}
            {coach.sttSupported && !coach.ttsSupported && (
              'Use voice recording to speak your response.'
            )}
            {!coach.sttSupported && coach.ttsSupported && (
              'Have the prompt read aloud to you.'
            )}
          </p>
        </div>
      </Card>

      {/* Settings Modal */}
      <VoiceSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </>
  );
}
