'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_VOICE_SETTINGS } from '@/lib/autobiography/constants';
import type { VoiceSettings } from '@/lib/autobiography/types';

interface VoiceSettingsStore {
  settings: VoiceSettings;
  updateSettings: (settings: Partial<VoiceSettings>) => void;
  resetSettings: () => void;
}

export const useVoiceSettingsStore = create<VoiceSettingsStore>()(
  persist(
    (set) => ({
      settings: DEFAULT_VOICE_SETTINGS,

      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      resetSettings: () =>
        set({
          settings: DEFAULT_VOICE_SETTINGS,
        }),
    }),
    {
      name: 'wisdomos-voice-settings',
    }
  )
);
