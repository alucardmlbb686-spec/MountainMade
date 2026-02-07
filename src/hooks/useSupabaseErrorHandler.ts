'use client';

import { useEffect } from 'react';

/**
 * Suppress unhandled AbortError rejections from Supabase auth-js
 * These are expected behavior when:
 * - Auth requests overlap
 * - Supabase's internal locks release pending requests
 * - Components unmount during fetch operations
 */
export function useSupabaseErrorHandler() {
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason;
      const message = error?.message || error?.toString() || '';
      
      // Suppress Supabase AbortErrors - these are expected and not real failures
      if (
        message.includes('AbortError') ||
        message.includes('signal is aborted') ||
        message.includes('Request was aborted')
      ) {
        // Prevent the error from being logged to console
        event.preventDefault();
        return;
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);
}
