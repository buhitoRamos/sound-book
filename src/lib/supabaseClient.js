import { createClient } from '@supabase/supabase-js'

// NOTE: For development convenience you asked to hardcode the keys here.
// Exposing your anon key in source is a security risk for production.
const NEXT_PUBLIC_SUPABASE_URL = 'https://owzpmzoqvmikdmebnxww.supabase.co'
const NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93enBtem9xdm1pa2RtZWJueHd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1MzU1MDMsImV4cCI6MjA4MDExMTUwM30.yc6Aag5cKfSim60ZyBqN8-ikca-sy2ssUskvtezPCMQ'

export const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
