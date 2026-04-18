import React, { createContext, useContext, useEffect, useState } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { Profile } from '../lib/supabase'
import bcrypt from 'bcryptjs'

type AuthState = {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, username?: string, role?: 'user' | 'admin') => Promise<{ error: Error | null }>
  signIn: (identifier: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthState | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    setProfile(data as Profile | null)
  }

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      setUser(s?.user ?? null)
      if (s?.user) fetchProfile(s.user.id)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      setUser(s?.user ?? null)
      if (s?.user) fetchProfile(s.user.id)
      else setProfile(null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, username?: string, role: 'user' | 'admin' = 'user') => {
    if (!isSupabaseConfigured) {
      return { error: new Error('Supabase not configured. Copy .env.example to .env and add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.') }
    }

    // Check if email is already registered
    const { data: existingEmail } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()
    if (existingEmail) {
      return { error: new Error('Този имейл вече е регистриран') }
    }

    // Check if username is already taken
    if (username) {
      const { data: existingUsername } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .single()
      if (existingUsername) {
        return { error: new Error('Това потребителско име вече е заето') }
      }
    }

    // Hash the password before storing in profiles
    const password_hash = await bcrypt.hash(password, 10)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username: username || email.split('@')[0], role, password_hash } }
    })
    try {
      const user = data?.user
      if (user) {
        await supabase.from('profiles').upsert({
          id: user.id,
          email: user.email,
          username: username || email.split('@')[0],
          password_hash,
          role
        }, { onConflict: 'id' })
      }
    } catch (e) {
      // ignore profile update errors here; can be handled elsewhere
    }
    return { error: error ?? null }
  }

  const signIn = async (identifier: string, password: string) => {
    if (!isSupabaseConfigured) {
      return { error: new Error('Supabase not configured. Copy .env.example to .env and add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.') }
    }
    try {
      let emailToUse = identifier
      // If identifier doesn't look like an email, try to resolve username -> email
      if (!identifier.includes('@')) {
        const { data: profile } = await supabase.from('profiles').select('email').eq('username', identifier).single()
        if (!profile || !profile.email) {
          return { error: new Error('No account found with that username') }
        }
        emailToUse = profile.email
      }
      const { error } = await supabase.auth.signInWithPassword({ email: emailToUse, password })
      return { error: error ?? null }
    } catch (e: any) {
      return { error: e instanceof Error ? e : new Error('Failed to sign in') }
    }
  }

  const signOut = async () => {
    if (isSupabaseConfigured) await supabase.auth.signOut()
    setProfile(null)
  }

  const value: AuthState = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (ctx === undefined) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
