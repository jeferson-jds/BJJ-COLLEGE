import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Aviso } from '../types/database';
import { isRealSupabaseConfigured, supabase } from '../lib/supabase';
import { localStore } from '../lib/store';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface NovoAvisoPayload {
  titulo: string;
  conteudo: string;
  ativo?: boolean;
  expira_em?: string | null;
}

export function useAvisos() {
  const queryClient = useQueryClient();
  const { isAdmin, profile } = useAuth();

  // Query: Busca avisos
  const avisosQuery = useQuery({
    queryKey: ['avisos', isAdmin],
    queryFn: async (): Promise<Aviso[]> => {
      if (isRealSupabaseConfigured) {
        let query = supabase
          .from('avisos')
          .select(`
            *,
            autor:profiles (*)
          `)
          .order('created_at', { ascending: false });

        if (!isAdmin) {
          // Filtrar apenas avisos ativos e não expirados para alunos
          query = query.eq('ativo', true);
        }

        const { data, error } = await query;
        if (error) throw new Error(error.message);

        const list = (data as unknown as Aviso[]) || [];
        if (!isAdmin) {
          const now = new Date().getTime();
          return list.filter((av) => !av.expira_em || new Date(av.expira_em).getTime() > now);
        }
        return list;
      } else {
        // Local
        const avisos = localStore.getAvisos();
        if (isAdmin) return avisos;
        const now = new Date().getTime();
        return avisos.filter(
          (av) => av.ativo && (!av.expira_em || new Date(av.expira_em).getTime() > now)
        );
      }
    },
  });

  // Criar aviso (Admin)
  const createAvisoMutation = useMutation({
    mutationFn: async (payload: NovoAvisoPayload) => {
      if (!isAdmin) throw new Error('Acesso negado: apenas o Prof. Rogério/Admin pode publicar avisos.');

      if (isRealSupabaseConfigured) {
        const { data, error } = await (supabase.from('avisos') as any)
          .insert({
            titulo: payload.titulo,
            conteudo: payload.conteudo,
            ativo: payload.ativo ?? true,
            expira_em: payload.expira_em || null,
            autor_id: profile?.id || null,
          })
          .select()
          .single();

        if (error) throw new Error(error.message);
        return data;
      } else {
        const avisos = localStore.getAvisos();
        const newAviso: Aviso = {
          id: `aviso-${Date.now()}`,
          titulo: payload.titulo,
          conteudo: payload.conteudo,
          ativo: payload.ativo ?? true,
          expira_em: payload.expira_em || null,
          autor_id: profile?.id || 'prof-admin-01',
          created_at: new Date().toISOString(),
          autor: profile || undefined,
        };
        avisos.unshift(newAviso);
        localStore.saveAvisos(avisos);
        return newAviso;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['avisos'] });
      toast.success('Aviso publicado no mural da BJJ College com sucesso!');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao publicar aviso.');
    },
  });

  // Alternar ativo/inativo aviso (Admin)
  const toggleAtivoAvisoMutation = useMutation({
    mutationFn: async ({ id, ativo }: { id: string; ativo: boolean }) => {
      if (!isAdmin) throw new Error('Apenas o Prof. Rogério pode alterar o status do aviso.');

      if (isRealSupabaseConfigured) {
        const { error } = await (supabase.from('avisos') as any)
          .update({ ativo })
          .eq('id', id);
        if (error) throw new Error(error.message);
      } else {
        const avisos = localStore.getAvisos();
        const av = avisos.find((a) => a.id === id);
        if (av) {
          av.ativo = ativo;
          localStore.saveAvisos(avisos);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['avisos'] });
      toast.success('Status do comunicado atualizado.');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao atualizar aviso.');
    },
  });

  // Excluir aviso (Admin)
  const deleteAvisoMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!isAdmin) throw new Error('Apenas o Prof. Rogério pode excluir avisos.');

      if (isRealSupabaseConfigured) {
        const { error } = await supabase.from('avisos').delete().eq('id', id);
        if (error) throw new Error(error.message);
      } else {
        const avisos = localStore.getAvisos();
        const filtered = avisos.filter((a) => a.id !== id);
        localStore.saveAvisos(filtered);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['avisos'] });
      toast.success('Aviso removido do mural.');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao remover aviso.');
    },
  });

  return {
    avisos: avisosQuery.data || [],
    isLoading: avisosQuery.isLoading,
    createAviso: createAvisoMutation.mutateAsync,
    isCreating: createAvisoMutation.isPending,
    deleteAviso: deleteAvisoMutation.mutateAsync,
    isDeleting: deleteAvisoMutation.isPending,
    toggleAtivoAviso: toggleAtivoAvisoMutation.mutateAsync,
  };
}
