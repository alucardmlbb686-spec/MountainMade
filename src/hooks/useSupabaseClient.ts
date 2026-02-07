import { useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';

// Singleton instance - created once and reused everywhere
let supabaseInstance: SupabaseClient | null = null;

function getSupabaseInstance() {
  if (!supabaseInstance) {
    supabaseInstance = createClient();
  }
  return supabaseInstance;
}

// Hook for use in client components
export function useSupabaseClient() {
  const clientRef = useRef<SupabaseClient | null>(null);

  if (!clientRef.current) {
    clientRef.current = getSupabaseInstance();
  }

  return clientRef.current;
}

// Direct singleton export for use in providers and contexts
export function getSharedSupabaseClient() {
  return getSupabaseInstance();
}

