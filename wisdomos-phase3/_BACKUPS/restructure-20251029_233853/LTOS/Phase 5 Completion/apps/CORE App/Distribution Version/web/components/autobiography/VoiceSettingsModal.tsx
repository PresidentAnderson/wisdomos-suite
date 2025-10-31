'use client';

import { useEffect, useState } from 'react';
import { X, Volume2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useVoiceSettingsStore } from '@/stores/voiceSettingsStore';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';

interface VoiceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VoiceSettingsModal({ isOpen, onClose }: VoiceSettingsModalProps) {
  const { settings, updateSettings, resetSettings } = useVoiceSettingsStore();
  const { voices } = useTextToSpeech();
  const [testText] = useState('Hello! This is how I will sound with these settings.');

  // Test voice with current settings
  const testVoice = () => {
    const utterance = new SpeechSynthesisUtterance(testText);
    const selectedVoice = voices.find((v) => v.name === settings.voice);
    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.rate = settings.rate;
    utterance.pitch = settings.pitch;
    utterance.volume = settings.volume;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Volume2 className="w-5 h-5" />
            Voice Settings
          </DialogTitle>
          <DialogDescription>
            Customize how the voice coach sounds and behaves.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Enable/Disable */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="enabled" className="font-semibold">
                Enable Voice Coach
              </Label>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Turn on voice features
              </p>
            </div>
            <Switch
              id="enabled"
              checked={settings.enabled}
              onCheckedChange={(enabled) => updateSettings({ enabled })}
            />
          </div>

          {/* Voice Selection */}
          {voices.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="voice">Voice</Label>
              <Select
                value={settings.voice}
                onValueChange={(voice) => updateSettings({ voice })}
              >
                <SelectTrigger id="voice">
                  <SelectValue placeholder="Select a voice" />
                </SelectTrigger>
                <SelectContent>
                  {voices.map((voice) => (
                    <SelectItem key={voice.name} value={voice.name}>
                      {voice.name} ({voice.lang})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Rate */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="rate">Speaking Rate</Label>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {settings.rate.toFixed(1)}x
              </span>
            </div>
            <Slider
              id="rate"
              min={0.5}
              max={2.0}
              step={0.1}
              value={[settings.rate]}
              onValueChange={([rate]) => updateSettings({ rate })}
            />
          </div>

          {/* Pitch */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="pitch">Pitch</Label>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {settings.pitch.toFixed(1)}
              </span>
            </div>
            <Slider
              id="pitch"
              min={0.5}
              max={2.0}
              step={0.1}
              value={[settings.pitch]}
              onValueChange={([pitch]) => updateSettings({ pitch })}
            />
          </div>

          {/* Volume */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="volume">Volume</Label>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {Math.round(settings.volume * 100)}%
              </span>
            </div>
            <Slider
              id="volume"
              min={0}
              max={1.0}
              step={0.1}
              value={[settings.volume]}
              onValueChange={([volume]) => updateSettings({ volume })}
            />
          </div>

          {/* Auto-play */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="autoPlay" className="font-semibold">
                Auto-play Prompts
              </Label>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Automatically read prompts aloud
              </p>
            </div>
            <Switch
              id="autoPlay"
              checked={settings.autoPlay}
              onCheckedChange={(autoPlay) => updateSettings({ autoPlay })}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 pt-4 border-t">
          <Button variant="outline" onClick={resetSettings}>
            Reset to Default
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={testVoice}>
              <Volume2 className="w-4 h-4 mr-2" />
              Test Voice
            </Button>
            <Button onClick={onClose}>Done</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
