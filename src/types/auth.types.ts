import { User, Session } from '@supabase/supabase-js'

export interface UserProfile {
  id: string
  fullName: string
  email: string
  timezone: string
  createdAt: string
}

export interface AuthState {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  loading: boolean
  isMockMode: boolean
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  forgotPassword: (email: string) => Promise<{ success: boolean; message?: string; error?: string }>
  jwtToken: string | null
}
