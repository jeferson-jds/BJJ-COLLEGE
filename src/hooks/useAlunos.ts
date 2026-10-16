import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Aluno, FaixaBJJ, Graduacao } from '../types/database';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface NovoAlunoPayload {
  nome_completo: string;
  email: string;
  telefone?: string;
  data_inicio: string;
  faixa_atual: FaixaBJJ;
  graus?: number; // 0 a 4
  observacoes?: string;
}

export interface GraduarAlunoPayload {
  aluno_id: string;
  nova_faixa: FaixaBJJ;
  graus?: number;
  tipo?: 'grau' | 'faixa';
  data: string;
  observacoes?: string;
}

export function useAlunos() {
  const queryClient = useQueryClient();
  const { isAdmin, alunoData, profile } = useAuth();

  // Query: Lista todos os alunos (Exclusivo Professor / Admin)
  const alunosQuery = useQuery({
    queryKey: ['alunos'],
    enabled: isAdmin,
    queryFn: async (): Promise<Aluno[]> => {
      const { data, error } = await supabase
        .from('alunos')
        .select(`
          *,
          profile:profiles (*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar alunos no Supabase:', error.message);
        throw new Error(error.message);
      }
      return (data as unknown as Aluno[]) || [];
    },
  });

  // Query: Busca aluno por ID (restrito ao próprio aluno se não for admin)
  const useAlunoById = (id?: string) => {
    const targetId = isAdmin ? id : (id === alunoData?.id ? id : alunoData?.id);

    return useQuery({
      queryKey: ['aluno', targetId],
      queryFn: async (): Promise<Aluno | null> => {
        if (!targetId) return null;

        const { data, error } = await supabase
          .from('alunos')
          .select(`
            *,
            profile:profiles (*)
          `)
          .eq('id', targetId)
          .single();

        if (error) {
          console.error('Erro ao buscar aluno por id no Supabase:', error.message);
          throw new Error(error.message);
        }
        return (data as unknown as Aluno) || null;
      },
      enabled: Boolean(targetId),
    });
  };

  // Query: Histórico de graduações do aluno
  const useGraduacoesByAluno = (alunoId?: string) => {
    const targetId = isAdmin ? alunoId : (alunoId === alunoData?.id ? alunoId : alunoData?.id);

    return useQuery({
      queryKey: ['graduacoes', targetId],
      queryFn: async (): Promise<Graduacao[]> => {
        if (!targetId) return [];

        const { data, error } = await supabase
          .from('graduacoes')
          .select(`
            *,
            professor:profiles (*)
          `)
          .eq('aluno_id', targetId)
          .order('data', { ascending: false });

        if (error) {
          console.error('Erro ao buscar graduações no Supabase:', error.message);
          throw new Error(error.message);
        }
        return (data as unknown as Graduacao[]) || [];
      },
      enabled: Boolean(targetId),
    });
  };

  // Mutação: Cadastrar Novo Aluno + Disparar Registro no Supabase (Admin)
  const createAlunoMutation = useMutation({
    mutationFn: async (payload: NovoAlunoPayload) => {
      if (!isAdmin) {
        throw new Error('Acesso negado: apenas administradores podem cadastrar alunos.');
      }

      // 1. Inserir Profile
      const { data: newProfile, error: profileError } = await (supabase.from('profiles') as any)
        .insert({
          nome_completo: payload.nome_completo,
          email: payload.email.toLowerCase().trim(),
          telefone: payload.telefone || null,
          status_convite: 'pendente',
          invited_by: profile?.id || null,
          invited_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (profileError) {
        throw new Error(`Erro ao criar perfil do aluno: ${profileError.message}`);
      }

      // 2. Inserir Aluno
      const { data: newAluno, error: alunoError } = await (supabase.from('alunos') as any)
        .insert({
          profile_id: (newProfile as any)?.id,
          data_inicio: payload.data_inicio,
          faixa_atual: payload.faixa_atual,
          graus: payload.graus || 0,
          data_graduacao: payload.data_inicio,
          ativo: true,
          total_treinos: 0,
          observacoes: payload.observacoes || null,
        })
        .select()
        .single();

      if (alunoError) {
        throw new Error(`Erro ao matricular aluno: ${alunoError.message}`);
      }

      // 3. Registrar graduação inicial no histórico
      await (supabase.from('graduacoes') as any).insert({
        aluno_id: (newAluno as any)?.id,
        faixa: payload.faixa_atual,
        graus: payload.graus || 0,
        tipo: 'faixa',
        data: payload.data_inicio,
        professor_id: profile?.id || null,
        observacoes: 'Matrícula e graduação inicial na BJJ College',
      });

      // 4. Disparar Edge function de convite por email caso configurada
      try {
        await supabase.functions.invoke('invite-aluno', {
          body: {
            email: payload.email,
            nome_completo: payload.nome_completo,
            profile_id: (newProfile as any)?.id,
          },
        });
      } catch (invErr) {
        console.warn('Função de convite por e-mail não ativada:', invErr);
      }

      return newAluno;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alunos'] });
      toast.success('Aluno matriculado com sucesso no Supabase!');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao matricular aluno.');
    },
  });

  // Mutação: Graduar Aluno (Admin)
  const graduarAlunoMutation = useMutation({
    mutationFn: async (payload: GraduarAlunoPayload) => {
      if (!isAdmin) {
        throw new Error('Acesso negado: apenas o Professor Rogério pode graduar alunos.');
      }

      const novosGraus = payload.tipo === 'grau' ? (payload.graus ?? 1) : 0;

      // 1. Atualiza na tabela alunos
      const { error: updateError } = await (supabase.from('alunos') as any)
        .update({
          faixa_atual: payload.nova_faixa,
          graus: novosGraus,
          data_graduacao: payload.data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', payload.aluno_id);

      if (updateError) throw new Error(updateError.message);

      // 2. Insere histórico na tabela graduacoes
      const { error: histError } = await (supabase.from('graduacoes') as any).insert({
        aluno_id: payload.aluno_id,
        faixa: payload.nova_faixa,
        graus: novosGraus,
        tipo: payload.tipo || 'grau',
        data: payload.data,
        professor_id: profile?.id || null,
        observacoes: payload.observacoes || `Graduado pelo Prof. Rogério`,
      });

      if (histError) throw new Error(histError.message);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['alunos'] });
      queryClient.invalidateQueries({ queryKey: ['aluno', variables.aluno_id] });
      queryClient.invalidateQueries({ queryKey: ['graduacoes', variables.aluno_id] });
      toast.success('Graduação confirmada e registrada com sucesso no histórico!');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao registrar graduação.');
    },
  });

  // Mutação: Atualizar Cadastro do Aluno
  const updateAlunoMutation = useMutation({
    mutationFn: async ({
      aluno_id,
      ativo,
      telefone,
      observacoes,
    }: {
      aluno_id: string;
      ativo?: boolean;
      telefone?: string;
      observacoes?: string;
    }) => {
      if (!isAdmin) throw new Error('Acesso negado.');

      // Atualiza tabela alunos
      const updateData: Record<string, any> = { updated_at: new Date().toISOString() };
      if (ativo !== undefined) updateData.ativo = ativo;
      if (observacoes !== undefined) updateData.observacoes = observacoes;

      const { data: updatedAluno, error: alunoError } = await (supabase.from('alunos') as any)
        .update(updateData)
        .eq('id', aluno_id)
        .select()
        .single();

      if (alunoError) throw new Error(alunoError.message);

      // Se informou telefone, atualiza tabela profiles correspondente
      if (telefone !== undefined && updatedAluno?.profile_id) {
        await (supabase.from('profiles') as any)
          .update({ telefone, updated_at: new Date().toISOString() })
          .eq('id', updatedAluno.profile_id);
      }

      return updatedAluno;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['alunos'] });
      queryClient.invalidateQueries({ queryKey: ['aluno', variables.aluno_id] });
      toast.success('Cadastro do aluno atualizado com sucesso!');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao atualizar aluno.');
    },
  });

  return {
    alunos: alunosQuery.data || [],
    isLoading: alunosQuery.isLoading,
    useAlunoById,
    useGraduacoesByAluno,
    createAluno: createAlunoMutation.mutateAsync,
    isCreating: createAlunoMutation.isPending,
    graduarAluno: graduarAlunoMutation.mutateAsync,
    isGraduando: graduarAlunoMutation.isPending,
    updateAluno: updateAlunoMutation.mutateAsync,
    isUpdating: updateAlunoMutation.isPending,
    refetch: alunosQuery.refetch,
  };
}

export default useAlunos;
