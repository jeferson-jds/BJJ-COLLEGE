import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SupabaseDatabase } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-project') &&
  !supabaseUrl.includes('placeholder') &&
  supabaseUrl.startsWith('http')
);

// Cliente oficial Supabase conectado diretamente às tabelas
export const supabase: SupabaseClient<SupabaseDatabase> = createClient<SupabaseDatabase>(
  isSupabaseConfigured ? supabaseUrl : 'https://bjj-college.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey : 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

/**
 * Utilitário de Storage: Gera Signed URL privada para fotos de alunos
 * Validade: 1 hora (3600 segundos)
 */
export async function getSignedPhotoUrl(
  pathOrFilename: string | null | undefined
): Promise<string | null> {
  if (!pathOrFilename) return null;

  // Se já for URL absoluta ou base64
  if (pathOrFilename.startsWith('http') || pathOrFilename.startsWith('data:image')) {
    return pathOrFilename;
  }

  try {
    const { data, error } = await supabase.storage
      .from('alunos-fotos')
      .createSignedUrl(pathOrFilename, 3600);

    if (error || !data?.signedUrl) {
      console.warn('Aviso ao gerar Signed URL privada:', error?.message);
      return pathOrFilename;
    }

    return data.signedUrl;
  } catch (err) {
    console.error('Falha ao obter URL assinada da foto:', err);
    return pathOrFilename;
  }
}
