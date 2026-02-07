/**
 * Utility to safely handle Supabase errors
 * Filters out abort errors and formats error messages
 */

export interface SafeError {
  message: string;
  code?: string;
  isAbortError: boolean;
}

export function isSafeError(error: any): boolean {
  if (!error) return false;
  const message = error?.message || error?.toString() || '';
  return !message.includes('AbortError') && !message.includes('abort');
}

export function formatSupabaseError(error: any): SafeError {
  const message = error?.message || error?.toString() || 'Unknown error';
  const isAbort = message.includes('AbortError') || message.includes('abort');

  return {
    message: isAbort ? 'Request cancelled' : message,
    code: error?.code,
    isAbortError: isAbort,
  };
}

export function logSupabaseError(context: string, error: any) {
  const formattedError = formatSupabaseError(error);
  
  // Don't log abort errors - they're expected during cleanup
  if (!formattedError.isAbortError) {
    console.error(`${context}:`, formattedError.message);
  }
}

export function suppressAbortError(error: any): boolean {
  const message = error?.message || error?.toString() || '';
  return message.includes('AbortError') || message.includes('abort');
}
