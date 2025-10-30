'use client';

import { createClient } from '@supabase/supabase-js';
import type { AutobiographyEntry } from './types';

let supabase: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
  if (!supabase && typeof window !== 'undefined') {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return supabase;
}

export function subscribeToEntries(
  userId: string,
  onInsert: (entry: AutobiographyEntry) => void,
  onUpdate: (entry: AutobiographyEntry) => void,
  onDelete: (id: string) => void
) {
  const client = getSupabaseClient();
  if (!client) return () => {};

  const channel = client
    .channel('autobiography_entries')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'autobiography_entries',
        filter: `userId=eq.${userId}`,
      },
      (payload) => onInsert(payload.new as AutobiographyEntry)
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'autobiography_entries',
        filter: `userId=eq.${userId}`,
      },
      (payload) => onUpdate(payload.new as AutobiographyEntry)
    )
    .on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'autobiography_entries',
        filter: `userId=eq.${userId}`,
      },
      (payload) => onDelete((payload.old as any).id)
    )
    .subscribe();

  return () => {
    client.removeChannel(channel);
  };
}
