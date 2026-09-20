import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SupabaseDatabase } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Verifica se chaves reais do Supabase foram configuradas
export const isRealSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('placeholder') &&
  !supabaseUrl.includes('sua-url') &&
  supabaseUrl.startsWith('http')
);

// Cliente oficial Supabase
export const supabase: SupabaseClient<SupabaseDatabase> = isRealSupabaseConfigured
  ? createClient<SupabaseDatabase>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : (createClient<SupabaseDatabase>(
      'https://xyzcompany.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    ) as unknown as SupabaseClient<SupabaseDatabase>);

/**
 * Utilitário de Storage: Gera Signed URL privada para fotos de alunos
 * Validade solicitada: 1 hora (3600 segundos)
 */
export async function getSignedPhotoUrl(
  pathOrFilename: string | null | undefined
): Promise<string | null> {
  if (!pathOrFilename) return null;

  // Se já for uma URL completa ou base64
  if (pathOrFilename.startsWith('http') || pathOrFilename.startsWith('data:image')) {
    return pathOrFilename;
  }

  if (!isRealSupabaseConfigured) {
    // Retorna URL de avatar seguro no modo simulação
    return pathOrFilename;
  }

  try {
    const { data, error } = await supabase.storage
      .from('alunos-fotos')
      .createSignedUrl(pathOrFilename, 3600); // 1 hora de expiração conforme requisito

    if (error || !data?.signedUrl) {
      console.warn('Erro ao gerar Signed URL do storage privado:', error?.message);
      return null;
    }

    return data.signedUrl;
  } catch (err) {
    console.error('Falha ao obter URL assinada de foto:', err);
    return null;
  }
}
