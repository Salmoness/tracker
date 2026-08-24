import { createClient, SupabaseClient } from '@supabase/supabase-js'

const dataBackend = import.meta.env.VITE_DATA_BACKEND || 'supabase'
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Check if credentials are real production Supabase credentials or placeholders
export const isConfiguredSupabase = Boolean(
  dataBackend !== 'local' &&
    supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('your-project-id') &&
    !supabaseAnonKey.includes('your-anon-key')
)

export const supabase: SupabaseClient = createClient(
  isConfiguredSupabase ? supabaseUrl : 'https://placeholder.supabase.co',
  isConfiguredSupabase ? supabaseAnonKey : 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'tracker-auth-token',
    },
  }
)
