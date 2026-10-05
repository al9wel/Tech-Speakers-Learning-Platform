import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

export function createAdminClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY

    if (!supabaseUrl || !supabaseSecretKey) {
        throw new Error('Missing Supabase admin environment variables')
    }

    return createClient<Database>(supabaseUrl, supabaseSecretKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    })
}
