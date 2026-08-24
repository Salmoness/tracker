import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, isConfiguredSupabase } from '@/lib/supabase'
import { AuthContextType, UserProfile } from '@/types/auth.types'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const MOCK_STORAGE_KEY = 'tracker_mock_auth_user'
const MOCK_USERS_KEY = 'tracker_registered_users_db'

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [jwtToken, setJwtToken] = useState<string | null>(null)

  // 1. Initial Session Load & Listener
  useEffect(() => {
    let isMounted = true

    const initAuth = async () => {
      if (isConfiguredSupabase) {
        try {
          const { data: { session: initialSession } } = await supabase.auth.getSession()
          if (isMounted) {
            if (initialSession) {
              setSession(initialSession)
              setUser(initialSession.user)
              setJwtToken(initialSession.access_token)
              fetchProfile(initialSession.user.id)
            }
            setLoading(false)
          }
        } catch (err) {
          console.error('Error fetching Supabase session:', err)
          if (isMounted) setLoading(false)
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
          if (isMounted) {
            setSession(currentSession)
            setUser(currentSession?.user ?? null)
            setJwtToken(currentSession?.access_token ?? null)
            if (currentSession?.user) {
              fetchProfile(currentSession.user.id)
            } else {
              setProfile(null)
            }
            setLoading(false)
          }
        })

        return () => {
          subscription.unsubscribe()
        }
      } else {
        // Mock Auth Storage for demonstration/local testing
        const storedMock = localStorage.getItem(MOCK_STORAGE_KEY)
        if (storedMock) {
          try {
            const parsed = JSON.parse(storedMock)
            const mockUser = {
              id: parsed.id,
              email: parsed.email,
              app_metadata: {},
              user_metadata: { full_name: parsed.fullName },
              aud: 'authenticated',
              created_at: parsed.createdAt,
            } as unknown as User

            setUser(mockUser)
            setProfile(parsed)
            setJwtToken(`mock-jwt-token-${parsed.id}-${Date.now()}`)
          } catch (e) {
            console.error('Error loading mock auth session', e)
          }
        }
        setLoading(false)
      }
    }

    initAuth()

    return () => {
      isMounted = false
    }
  }, [])

  // Helper to fetch user profile from Supabase
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (!error && data) {
        setProfile({
          id: data.id,
          fullName: data.full_name || '',
          email: user?.email || '',
          timezone: data.timezone || 'America/New_York',
          createdAt: data.created_at,
        })
      } else {
        setProfile({
          id: userId,
          fullName: user?.user_metadata?.full_name || 'Tracker User',
          email: user?.email || '',
          timezone: 'America/New_York',
          createdAt: new Date().toISOString(),
        })
      }
    } catch {
      setProfile({
        id: userId,
        fullName: user?.user_metadata?.full_name || 'Tracker User',
        email: user?.email || '',
        timezone: 'America/New_York',
        createdAt: new Date().toISOString(),
      })
    }
  }

  // 2. Login Handler
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase()

    if (isConfiguredSupabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      if (data.session) {
        setSession(data.session)
        setUser(data.user)
        setJwtToken(data.session.access_token)
        fetchProfile(data.user.id)
      }

      return { success: true }
    } else {
      // Mock Auth Login
      const registeredUsersRaw = localStorage.getItem(MOCK_USERS_KEY)
      const registeredUsers = registeredUsersRaw ? JSON.parse(registeredUsersRaw) : []
      const foundUser = registeredUsers.find((u: { email: string }) => u.email.toLowerCase() === cleanEmail)

      if (!foundUser) {
        return { success: false, error: 'No user account found with this email address. Please register first.' }
      }

      if (foundUser.password !== password) {
        return { success: false, error: 'Invalid password. Please check your credentials and try again.' }
      }

      const userProfile: UserProfile = {
        id: foundUser.id,
        fullName: foundUser.fullName,
        email: foundUser.email,
        timezone: 'America/New_York',
        createdAt: foundUser.createdAt,
      }

      const mockUser = {
        id: foundUser.id,
        email: foundUser.email,
        app_metadata: {},
        user_metadata: { full_name: foundUser.fullName },
        aud: 'authenticated',
        created_at: foundUser.createdAt,
      } as unknown as User

      setUser(mockUser)
      setProfile(userProfile)
      setJwtToken(`mock-jwt-token-${foundUser.id}-${Date.now()}`)
      localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(userProfile))

      return { success: true }
    }
  }

  // 3. Register Handler (Duplicate Email Handling, No email confirmation needed)
  const register = async (
    email: string,
    password: string,
    fullName: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase()

    if (isConfiguredSupabase) {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: { full_name: fullName },
        },
      })

      if (error) {
        if (error.message.includes('already registered') || error.status === 400) {
          return { success: false, error: 'An account with this email address already exists. Please log in.' }
        }
        return { success: false, error: error.message }
      }

      // Check if Supabase returned a user that already existed (Supabase obfuscates existing users in some configs)
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        return { success: false, error: 'An account with this email address already exists. Please log in.' }
      }

      if (data.session && data.user) {
        setSession(data.session)
        setUser(data.user)
        setJwtToken(data.session.access_token)
        fetchProfile(data.user.id)
      }

      return { success: true }
    } else {
      // Mock Register with duplicate email detection
      const registeredUsersRaw = localStorage.getItem(MOCK_USERS_KEY)
      const registeredUsers = registeredUsersRaw ? JSON.parse(registeredUsersRaw) : []

      const existingUser = registeredUsers.find((u: { email: string }) => u.email.toLowerCase() === cleanEmail)
      if (existingUser) {
        return { success: false, error: 'An account with this email address already exists. Please log in.' }
      }

      const newUserId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
      const newRecord = {
        id: newUserId,
        email: cleanEmail,
        password,
        fullName,
        createdAt: new Date().toISOString(),
      }

      registeredUsers.push(newRecord)
      localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(registeredUsers))

      const userProfile: UserProfile = {
        id: newUserId,
        fullName,
        email: cleanEmail,
        timezone: 'America/New_York',
        createdAt: newRecord.createdAt,
      }

      const mockUser = {
        id: newUserId,
        email: cleanEmail,
        app_metadata: {},
        user_metadata: { full_name: fullName },
        aud: 'authenticated',
        created_at: newRecord.createdAt,
      } as unknown as User

      setUser(mockUser)
      setProfile(userProfile)
      setJwtToken(`mock-jwt-token-${newUserId}-${Date.now()}`)
      localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(userProfile))

      return { success: true }
    }
  }

  // 4. Logout Handler
  const logout = async () => {
    if (isConfiguredSupabase) {
      await supabase.auth.signOut()
    }
    localStorage.removeItem(MOCK_STORAGE_KEY)
    setUser(null)
    setSession(null)
    setProfile(null)
    setJwtToken(null)
  }

  // 5. Forgot Password Handler (Matching Email Check)
  const forgotPassword = async (email: string): Promise<{ success: boolean; message?: string; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase()

    if (isConfiguredSupabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail)
      if (error) {
        return { success: false, error: error.message }
      }
      return { success: true, message: 'Password reset link sent to your email.' }
    } else {
      const registeredUsersRaw = localStorage.getItem(MOCK_USERS_KEY)
      const registeredUsers = registeredUsersRaw ? JSON.parse(registeredUsersRaw) : []
      const foundUser = registeredUsers.find((u: { email: string }) => u.email.toLowerCase() === cleanEmail)

      if (!foundUser) {
        return { success: false, error: 'No account found matching this email address.' }
      }

      return {
        success: true,
        message: `Password reset request verified for ${cleanEmail}. In demo mode, your password is: "${foundUser.password}".`,
      }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        isMockMode: !isConfiguredSupabase,
        login,
        register,
        logout,
        forgotPassword,
        jwtToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
