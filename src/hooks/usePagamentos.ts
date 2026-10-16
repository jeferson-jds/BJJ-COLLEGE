import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MetodoPagamento, Pagamento, PagamentoAuditoria, StatusPagamento } from '../types/database';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface RegistrarPagamentoPayload {
  aluno_id: string;
  mes_referencia: string;
  valor: number;
  status: StatusPagamento;
  data_vencimento: string;
  data_pagamento?: string | null;
  metodo?: MetodoPagamento | null;
}

export function usePagamentos(mesFiltro?: string, options?: { enabled?: boolean }) {
  const queryClient = useQueryClient();
  const { isAdmin, alunoData, profile } = useAuth();

  const isEnabled = options?.enabled !== undefined ? options.enabled : isAdmin;

  // Query: Lista pagamentos via Supabase
  const pagamentosQuery = useQuery({
    queryKey: ['pagamentos', mesFiltro, isAdmin, alunoData?.id],
    enabled: isEnabled,
    queryFn: async (): Promise<Pagamento[]> => {
      if (!isAdmin) {
        if (!alunoData?.id) return [];

        const { data, error } = await supabase
          .from('pagamentos')
          .select('*')
          .eq('aluno_id', alunoData.id)
          .order('mes_referencia', { ascending: false });

        if (error) throw new Error(error.message);
        return (data as unknown as Pagamento[]) || [];
      }

      // Visão do Professor (Admin)
      let query = supabase
        .from('pagamentos')
        .select(`
          *,
          aluno:alunos (
            *,
            profile:profiles (*)
          )
        `)
        .order('mes_referencia', { ascending: false });

      if (mesFiltro) {
        query = query.eq('mes_referencia', mesFiltro);
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return (data as unknown as Pagamento[]) || [];
    },
  });

  // Query: Histórico específico por aluno ID
  const usePagamentosByAlunoId = (alunoId?: string) => {
    const targetAlunoId = isAdmin ? alunoId : alunoData?.id;

    return useQuery({
      queryKey: ['pagamentos-aluno', targetAlunoId],
      queryFn: async (): Promise<Pagamento[]> => {
        if (!targetAlunoId) return [];

        const { data, error } = await supabase
          .from('pagamentos')
          .select('*')
          .eq('aluno_id', targetAlunoId)
          .order('mes_referencia', { ascending: false });

        if (error) throw new Error(error.message);
        return (data as unknown as Pagamento[]) || [];
      },
      enabled: Boolean(targetAlunoId),
    });
  };

  // Query: Logs de auditoria de pagamentos (Apenas Admin)
  const auditoriaQuery = useQuery({
    queryKey: ['pagamentos-auditoria'],
    queryFn: async (): Promise<PagamentoAuditoria[]> => {
      if (!isAdmin) return [];

      const { data, error } = await supabase
        .from('pagamentos_auditoria')
        .select(`
          *,
          perfil_autor:profiles (*)
        `)
        .order('alterado_em', { ascending: false });

      if (error) throw new Error(error.message);
      return (data as unknown as PagamentoAuditoria[]) || [];
    },
    enabled: isAdmin,
  });

  // Mutação: Marcar pagamento como Pago (Exclusivo Admin)
  const marcarComoPagoMutation = useMutation({
    mutationFn: async ({
      pagamentoId,
      metodo = 'pix',
      dataPagamento = new Date().toISOString().split('T')[0],
    }: {
      pagamentoId: string;
      metodo?: MetodoPagamento;
      dataPagamento?: string;
    }) => {
      if (!isAdmin) {
        throw new Error('Acesso negado: apenas o Prof. Rogério pode registrar pagamentos.');
      }

      // Buscar status anterior para auditoria
      const { data: atual } = await supabase
        .from('pagamentos')
        .select('status, valor')
        .eq('id', pagamentoId)
        .single();

      const { error } = await (supabase.from('pagamentos') as any)
        .update({
          status: 'pago',
          data_pagamento: dataPagamento,
          metodo,
          updated_at: new Date().toISOString(),
        })
        .eq('id', pagamentoId);

      if (error) throw new Error(error.message);

      // Registrar auditoria
      await (supabase.from('pagamentos_auditoria') as any).insert({
        pagamento_id: pagamentoId,
        alterado_por: profile?.id || null,
        status_anterior: (atual as any)?.status || 'pendente',
        status_novo: 'pago',
        valor_anterior: (atual as any)?.valor || null,
        valor_novo: (atual as any)?.valor || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pagamentos'] });
      queryClient.invalidateQueries({ queryKey: ['pagamentos-auditoria'] });
      toast.success('Mensalidade confirmada como PAGA com sucesso!');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao atualizar pagamento.');
    },
  });

  // Mutação: Registrar novo pagamento avulso ou mensalidade (Admin)
  const registrarPagamentoMutation = useMutation({
    mutationFn: async (payload: RegistrarPagamentoPayload) => {
      if (!isAdmin) {
        throw new Error('Acesso negado: apenas o Prof. Rogério pode cadastrar cobranças.');
      }

      const { data: novoPag, error } = await (supabase.from('pagamentos') as any)
        .insert({
          aluno_id: payload.aluno_id,
          mes_referencia: payload.mes_referencia,
          valor: payload.valor,
          status: payload.status,
          data_vencimento: payload.data_vencimento,
          data_pagamento: payload.data_pagamento || null,
          metodo: payload.metodo || null,
        })
        .select()
        .single();

      if (error) throw new Error(error.message);

      // Auditoria
      await (supabase.from('pagamentos_auditoria') as any).insert({
        pagamento_id: (novoPag as any)?.id,
        alterado_por: profile?.id || null,
        status_anterior: null,
        status_novo: payload.status,
        valor_anterior: null,
        valor_novo: payload.valor,
      });

      return novoPag;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pagamentos'] });
      queryClient.invalidateQueries({ queryKey: ['pagamentos-auditoria'] });
      toast.success('Cobrança registrada com sucesso no Supabase!');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao registrar cobrança.');
    },
  });

  return {
    pagamentos: pagamentosQuery.data || [],
    isLoading: pagamentosQuery.isLoading,
    usePagamentosByAlunoId,
    auditoria: auditoriaQuery.data || [],
    marcarComoPago: marcarComoPagoMutation.mutateAsync,
    isMarcandoPago: marcarComoPagoMutation.isPending,
    registrarPagamento: registrarPagamentoMutation.mutateAsync,
    isRegistrando: registrarPagamentoMutation.isPending,
    refetch: pagamentosQuery.refetch,
  };
}

export default usePagamentos;
