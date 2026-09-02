import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _supabaseAdminInstance: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!_supabaseAdminInstance) {
    _supabaseAdminInstance = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    );
  }
  return _supabaseAdminInstance;
}

export const supabaseAdmin: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const client = getSupabaseAdmin();
    const val = Reflect.get(client, prop, receiver);
    return typeof val === 'function' ? val.bind(client) : val;
  },
});