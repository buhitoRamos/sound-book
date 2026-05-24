import { describe, it, expect, vi } from 'vitest'
import * as supabaseModule from '../lib/supabaseClient'

describe('supabaseClient', () => {
  it('exports supabase as a client object', () => {
    expect(supabaseModule.supabase).toBeDefined()
    expect(typeof supabaseModule.supabase).toBe('object')
  })

  it('has from method on supabase client', () => {
    expect(typeof supabaseModule.supabase.from).toBe('function')
  })

  it('can call from with a table name', () => {
    const query = supabaseModule.supabase.from('users')
    expect(query).toBeDefined()
    expect(typeof query.select).toBe('function')
  })
})