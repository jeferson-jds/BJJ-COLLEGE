import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Aluno, FaixaBJJ, Graduacao, Profile } from '../types/database';
import { isRealSupabaseConfigured, supabase } from '../lib/supabase';
import { localStore } from '../lib/store';
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
  // Alunos comuns não executam esta query, poupando requisições e garantindo privacidade
  const alunosQuery = useQuery({
    queryKey: ['alunos'],
    enabled: isAdmin,
    queryFn: async (): Promise<Aluno[]> => {
      if (isRealSupabaseConfigured) {
        const { data, error } = await supabase
          .from('alunos')
          .select(`
            *,
            profile:profiles (*)
          `)
          .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);
        return (data as unknown as Aluno[]) || [];
      } else {
        // Simulação local
        return localStore.getAlunos();
      }
    },
  });

  // Query: Busca aluno por ID (restrito ao próprio aluno se não for admin)
  const useAlunoById = (id?: string) => {
    const targetId = isAdmin ? id : (id === alunoData?.id ? id : undefined);

    return useQuery({
      queryKey: ['aluno', targetId],
      queryFn: async (): Promise<Aluno | null> => {
        if (!targetId) return null;
        if (isRealSupabaseConfigured) {
          const { data, error } = await supabase
            .from('alunos')
            .select(`
              *,
              profile:profiles (*)
            `)
            .eq('id', targetId)
            .single();

          if (error) throw new Error(error.message);
          return (data as unknown as Aluno) || null;
        } else {
          const alunos = localStore.getAlunos();
          return alunos.find((a) => a.id === targetId) || null;
        }
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
        if (isRealSupabaseConfigured) {
          const { data, error } = await supabase
            .from('graduacoes')
            .select(`
              *,
              professor:profiles (*)
            `)
            .eq('aluno_id', targetId)
            .order('data', { ascending: false });

          if (error) throw new Error(error.message);
          return (data as unknown as Graduacao[]) || [];
        } else {
          const grads = localStore.getGraduacoes();
          return grads
            .filter((g) => g.aluno_id === targetId)
            .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
        }
      },
      enabled: Boolean(targetId),
    });
  };

  // Mutação: Cadastrar Novo Aluno + Enviar Convite (Admin)
  const createAlunoMutation = useMutation({
    mutationFn: async (payload: NovoAlunoPayload) => {
      if (!isAdmin) {
        throw new Error('Acesso negado: apenas administradores podem cadastrar alunos.');
      }

      if (isRealSupabaseConfigured) {
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

        if (profileError) throw new Error(profileError.message);

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
            is_demo: false,
            observacoes: payload.observacoes || null,
          })
          .select()
          .single();

        if (alunoError) throw new Error(alunoError.message);

        // 3. Registrar primeira graduação no histórico
        await (supabase.from('graduacoes') as any).insert({
          aluno_id: (newAluno as any)?.id,
          faixa: payload.faixa_atual,
          graus: payload.graus || 0,
          tipo: 'faixa',
          data: payload.data_inicio,
          professor_id: profile?.id || null,
          observacoes: 'Graduação inicial no cadastro da BJJ College',
        });

        // 4. Disparar Edge function de convite por email
        try {
          await supabase.functions.invoke('invite-aluno', {
            body: {
              email: payload.email,
              nome_completo: payload.nome_completo,
              profile_id: (newProfile as any)?.id,
            },
          });
        } catch (invErr) {
          console.warn('Edge function invite-aluno não configurada ou offline:', invErr);
        }

        return newAluno;
      } else {
        // Modo local
        const profiles = localStore.getProfiles();
        const existing = profiles.find((p) => p.email.toLowerCase() === payload.email.toLowerCase());
        if (existing) {
          throw new Error('Já existe um aluno cadastrado com este e-mail.');
        }

        const newProfileId = `prof-${Date.now()}`;
        const newAlunoId = `aluno-${Date.now()}`;

        const newProf: Profile = {
          id: newProfileId,
          user_id: null,
          email: payload.email.toLowerCase().trim(),
          nome_completo: payload.nome_completo,
          telefone: payload.telefone || null,
          foto_url: null,
          status_convite: 'pendente',
          invited_by: profile?.id || 'prof-admin-01',
          invited_at: new Date().toISOString(),
          accepted_at: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        profiles.push(newProf);
        localStore.saveProfiles(profiles);

        const newAluno: Aluno = {
          id: newAlunoId,
          profile_id: newProfileId,
          data_inicio: payload.data_inicio,
          faixa_atual: payload.faixa_atual,
          graus: payload.graus || 0,
          data_graduacao: payload.data_inicio,
          ativo: true,
          total_treinos: 0,
          is_demo: false,
          observacoes: payload.observacoes || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          profile: newProf,
        };

        const alunos = localStore.getAlunos();
        alunos.unshift(newAluno);
        localStore.saveAlunos(alunos);

        // Adicionar histórico de graduação inicial
        const grads = localStore.getGraduacoes();
        grads.unshift({
          id: `grad-${Date.now()}`,
          aluno_id: newAlunoId,
          faixa: payload.faixa_atual,
          graus: payload.graus || 0,
          tipo: 'faixa',
          data: payload.data_inicio,
          professor_id: profile?.id || 'prof-admin-01',
          observacoes: 'Matrícula e graduação inicial na BJJ College',
          created_at: new Date().toISOString(),
        });
        localStore.saveGraduacoes(grads);

        return newAluno;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alunos'] });
      toast.success('Aluno cadastrado com sucesso! Matrícula ativa.');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao cadastrar aluno.');
    },
  });

  // Mutação: Graduar Aluno (Exclusivo Admin)
  const graduarAlunoMutation = useMutation({
    mutationFn: async ({ aluno_id, nova_faixa, graus, tipo = 'faixa', data, observacoes }: GraduarAlunoPayload) => {
      if (!isAdmin) {
        throw new Error('Acesso negado: apenas administradores podem graduar alunos.');
      }

      const novosGraus = graus ?? 0;

      if (isRealSupabaseConfigured) {
        // 1. Inserir na tabela de graduações
        const { error: gradError } = await (supabase.from('graduacoes') as any).insert({
          aluno_id,
          faixa: nova_faixa,
          graus: novosGraus,
          tipo,
          data,
          professor_id: profile?.id || null,
          observacoes: observacoes || null,
        });

        if (gradError) throw new Error(gradError.message);

        // 2. Atualizar tabela alunos
        const { error: alunoError } = await (supabase.from('alunos') as any)
          .update({
            faixa_atual: nova_faixa,
            graus: novosGraus,
            data_graduacao: data,
          })
          .eq('id', aluno_id);

        if (alunoError) throw new Error(alunoError.message);
      } else {
        // Modo local
        const alunos = localStore.getAlunos();
        const alunoIdx = alunos.findIndex((a) => a.id === aluno_id);
        if (alunoIdx === -1) throw new Error('Aluno não encontrado.');

        alunos[alunoIdx].faixa_atual = nova_faixa;
        alunos[alunoIdx].graus = novosGraus;
        alunos[alunoIdx].data_graduacao = data;
        alunos[alunoIdx].updated_at = new Date().toISOString();
        localStore.saveAlunos(alunos);

        const grads = localStore.getGraduacoes();
        grads.unshift({
          id: `grad-${Date.now()}`,
          aluno_id,
          faixa: nova_faixa,
          graus: novosGraus,
          tipo,
          data,
          professor_id: profile?.id || 'prof-admin-01',
          observacoes: observacoes || (tipo === 'grau' ? `Concessão do ${novosGraus}º grau` : `Promoção para a faixa ${nova_faixa}`),
          created_at: new Date().toISOString(),
        });
        localStore.saveGraduacoes(grads);
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['alunos'] });
      queryClient.invalidateQueries({ queryKey: ['aluno', variables.aluno_id] });
      queryClient.invalidateQueries({ queryKey: ['graduacoes', variables.aluno_id] });
      const msg = variables.tipo === 'grau'
        ? `Grau concedido com sucesso! (${variables.graus}º grau)`
        : `Promoção de faixa registrada com sucesso! Oss!`;
      toast.success(msg);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao graduar aluno.');
    },
  });

  // Mutação: Limpar Alunos Fictícios (Exibir apenas lista real cadastrada)
  const limparAlunosFicticiosMutation = useMutation({
    mutationFn: async () => {
      if (!isAdmin) {
        throw new Error('Apenas o Professor/Admin pode gerenciar a lista de alunos.');
      }

      if (isRealSupabaseConfigured) {
        const { error } = await supabase.from('alunos').delete().eq('is_demo', true);
        if (error) throw new Error(error.message);
      } else {
        localStore.clearDemoAlunos();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alunos'] });
      queryClient.invalidateQueries({ queryKey: ['checkins'] });
      toast.success('Alunos fictícios removidos! Exibindo apenas a lista real cadastrada.');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao limpar dados fictícios.');
    },
  });

  // Mutação: Restaurar Alunos Fictícios
  const restaurarAlunosFicticiosMutation = useMutation({
    mutationFn: async () => {
      if (!isAdmin) {
        throw new Error('Apenas o Professor/Admin pode gerenciar a lista de alunos.');
      }
      localStore.restoreDemoAlunos();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alunos'] });
      queryClient.invalidateQueries({ queryKey: ['checkins'] });
      toast.success('Alunos fictícios de demonstração restaurados.');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao restaurar dados demonstrativos.');
    },
  });

  // Mutação: Atualizar Aluno (Status ativo/inativo, observações)
  const updateAlunoMutation = useMutation({
    mutationFn: async ({ id, ativo, observacoes, telefone, nome_completo }: {
      id: string;
      ativo?: boolean;
      observacoes?: string;
      telefone?: string;
      nome_completo?: string;
    }) => {
      if (!isAdmin) {
        throw new Error('Apenas o Professor/Admin pode editar cadastro completo.');
      }

      if (isRealSupabaseConfigured) {
        if (ativo !== undefined || observacoes !== undefined) {
          const { error } = await (supabase.from('alunos') as any)
            .update({ ativo, observacoes })
            .eq('id', id);
          if (error) throw new Error(error.message);
        }
      } else {
        const alunos = localStore.getAlunos();
        const target = alunos.find((a) => a.id === id);
        if (!target) throw new Error('Aluno não encontrado.');

        if (ativo !== undefined) target.ativo = ativo;
        if (observacoes !== undefined) target.observacoes = observacoes;
        target.updated_at = new Date().toISOString();
        localStore.saveAlunos(alunos);

        if (target.profile_id && (telefone !== undefined || nome_completo !== undefined)) {
          const profiles = localStore.getProfiles();
          const prof = profiles.find((p) => p.id === target.profile_id);
          if (prof) {
            if (telefone !== undefined) prof.telefone = telefone;
            if (nome_completo !== undefined) prof.nome_completo = nome_completo;
            localStore.saveProfiles(profiles);
          }
        }
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['alunos'] });
      queryClient.invalidateQueries({ queryKey: ['aluno', variables.id] });
      toast.success('Dados do aluno atualizados com sucesso.');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao atualizar dados do aluno.');
    },
  });

  return {
    alunos: isAdmin ? (alunosQuery.data || []) : (alunoData ? [alunoData] : []),
    isLoading: isAdmin ? alunosQuery.isLoading : false,
    error: alunosQuery.error,
    refetch: alunosQuery.refetch,
    useAlunoById,
    useGraduacoesByAluno,
    createAluno: createAlunoMutation.mutateAsync,
    isCreating: createAlunoMutation.isPending,
    graduarAluno: graduarAlunoMutation.mutateAsync,
    isGraduando: graduarAlunoMutation.isPending,
    limparAlunosFicticios: limparAlunosFicticiosMutation.mutateAsync,
    isLimpando: limparAlunosFicticiosMutation.isPending,
    restaurarAlunosFicticios: restaurarAlunosFicticiosMutation.mutateAsync,
    isRestaurando: restaurarAlunosFicticiosMutation.isPending,
    updateAluno: updateAlunoMutation.mutateAsync,
    isUpdating: updateAlunoMutation.isPending,
  };
}
