import { createClient } from '@supabase/supabase-js'

// WARNING: Uses anon key in code for convenience (as requested).
const SUPABASE_URL = 'https://owzpmzoqvmikdmebnxww.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93enBtem9xdm1pa2RtZWJueHd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1MzU1MDMsImV4cCI6MjA4MDExMTUwM30.yc6Aag5cKfSim60ZyBqN8-ikca-sy2ssUskvtezPCMQ'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function seed() {
  try {
    const users = [
      {
        user: 'cc',
        pass: 'cc',
        created_at: '2025-11-30T21:49:30.313411+00'
      }
    ]

    console.log('Inserting users:', users)

    const { data, error } = await supabase
      .from('users')
      .upsert(users, { onConflict: 'user' })

    if (error) {
      console.error('Error inserting users:', error)
      process.exit(1)
    }

    console.log('Seed result:', data)
    process.exit(0)
  } catch (err) {
    console.error('Unexpected error:', err)
    process.exit(2)
  }
}

seed()
