import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { CheckIn } from '../types/database';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export function useCheckIn(dataSelecionada?: string) {
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();
  const hoje = dataSelecionada || new Date().toISOString().split('T')[0];

  // Query: Busca presenças para uma data específica no Supabase
  const checkInsQuery = useQuery({
    queryKey: ['checkins', hoje],
    enabled: isAdmin,
    queryFn: async (): Promise<CheckIn[]> => {
      const { data, error } = await supabase
        .from('checkins')
        .select('*')
        .eq('data', hoje);

      if (error) {
        console.error('Erro ao buscar check-ins no Supabase:', error.message);
        throw new Error(error.message);
      }
      return (data as unknown as CheckIn[]) || [];
    },
    staleTime: 1000 * 30, // 30s cache
  });

  // Mutação: 1-Clique para Marcar / Desmarcar Presença (Admin)
  const toggleCheckInMutation = useMutation({
    mutationFn: async ({ aluno_id, dataTreino }: { aluno_id: string; dataTreino?: string }) => {
      if (!isAdmin) {
        throw new Error('Apenas o Professor/Admin pode registrar presença no tatame.');
      }

      const targetData = dataTreino || hoje;

      // Verifica se já possui check-in nesta data
      const { data: existing, error: checkErr } = await (supabase
        .from('checkins') as any)
        .select('id')
        .eq('aluno_id', aluno_id)
        .eq('data', targetData)
        .maybeSingle();

      if (checkErr) throw new Error(checkErr.message);

      if (existing) {
        // Desmarcar presença
        const { error: delErr } = await (supabase
          .from('checkins') as any)
          .delete()
          .eq('id', existing.id);
        if (delErr) throw new Error(delErr.message);

        // Decrementa total_treinos no aluno
        const { data: alunoData } = await supabase
          .from('alunos')
          .select('total_treinos')
          .eq('id', aluno_id)
          .single();

        const currentTotal = (alunoData as any)?.total_treinos || 1;
        await (supabase.from('alunos') as any)
          .update({
            total_treinos: Math.max(0, currentTotal - 1),
            updated_at: new Date().toISOString(),
          })
          .eq('id', aluno_id);

        return { checkedIn: false, aluno_id };
      } else {
        // Marcar presença
        const { error: insErr } = await (supabase.from('checkins') as any).insert({
          aluno_id,
          data: targetData,
        });
        if (insErr) throw new Error(insErr.message);

        // Incrementa total_treinos no aluno
        const { data: alunoData } = await supabase
          .from('alunos')
          .select('total_treinos')
          .eq('id', aluno_id)
          .single();

        const currentTotal = (alunoData as any)?.total_treinos || 0;
        await (supabase.from('alunos') as any)
          .update({
            total_treinos: currentTotal + 1,
            updated_at: new Date().toISOString(),
          })
          .eq('id', aluno_id);

        return { checkedIn: true, aluno_id };
      }
    },
    onSuccess: (result, variables) => {
      const targetData = variables.dataTreino || hoje;
      queryClient.invalidateQueries({ queryKey: ['checkins', targetData] });
      queryClient.invalidateQueries({ queryKey: ['alunos'] });
      queryClient.invalidateQueries({ queryKey: ['aluno', variables.aluno_id] });

      if (result.checkedIn) {
        toast.success('Presença confirmada no tatame! +1 treino registrado. Oss!');
      } else {
        toast.info('Presença desmarcada no tatame.');
      }
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao registrar check-in.');
    },
  });

  // Helper para verificar se aluno tem presença na data
  const isAlunoPresente = (alunoId: string): boolean => {
    if (!checkInsQuery.data) return false;
    return checkInsQuery.data.some((c) => c.aluno_id === alunoId);
  };

  return {
    checkIns: checkInsQuery.data || [],
    isLoading: checkInsQuery.isLoading,
    totalPresentes: (checkInsQuery.data || []).length,
    toggleCheckIn: toggleCheckInMutation.mutateAsync,
    isToggling: toggleCheckInMutation.isPending,
    isAlunoPresente,
    refetch: checkInsQuery.refetch,
    hoje,
  };
}

// Hook para o Aluno consultar seus próprios check-ins e assiduidade
export function useCheckInsDoAluno(alunoId?: string) {
  const { alunoData, isAdmin } = useAuth();
  const targetId = isAdmin ? alunoId : alunoData?.id;

  return useQuery({
    queryKey: ['checkins-aluno-history', targetId],
    enabled: Boolean(targetId),
    queryFn: async (): Promise<CheckIn[]> => {
      if (!targetId) return [];

      const { data, error } = await supabase
        .from('checkins')
        .select('*')
        .eq('aluno_id', targetId)
        .order('data', { ascending: false });

      if (error) {
        console.error('Erro ao buscar histórico de check-ins:', error.message);
        throw new Error(error.message);
      }
      return (data as unknown as CheckIn[]) || [];
    },
    staleTime: 1000 * 60, // 1 min cache
  });
}

export default useCheckIn;
