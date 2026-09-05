import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _supabaseAdminInstance: SupabaseClient | null = null;

export function isSupabaseAdminConfigured(): boolean {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;
  return Boolean(supabaseUrl && supabaseSecretKey);
}

export function getSupabaseAdminSafe(): SupabaseClient | null {
  if (_supabaseAdminInstance) return _supabaseAdminInstance;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseSecretKey) {
    return null;
  }

  _supabaseAdminInstance = createClient(supabaseUrl, supabaseSecretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return _supabaseAdminInstance;
}

export function getSupabaseAdmin(): SupabaseClient {
  const client = getSupabaseAdminSafe();
  if (!client) {
    throw new Error("Database service is currently unavailable. Please check system configuration.");
  }
  return client;
}

export const supabaseAdmin: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const client = getSupabaseAdminSafe();
    if (!client) {
      throw new Error("Database service is currently unavailable. Please check system configuration.");
    }
    const val = Reflect.get(client, prop, receiver);
    return typeof val === 'function' ? val.bind(client) : val;
  },
});
