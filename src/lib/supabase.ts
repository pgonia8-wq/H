import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vtjqfzpfehfofamhowjz.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0anFmenBmZWhmb2ZhbWhvd2p6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2NDMxMTgsImV4cCI6MjA4NzIxOTExOH0.XShaoDlgVKT2LHk0fYOT5TWGgwkfn3bQQbuV2pcw_HM'

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL or ANON Key is missing! Check .env or Vercel settings.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
