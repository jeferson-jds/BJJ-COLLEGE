import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MetodoPagamento, Pagamento, PagamentoAuditoria, StatusPagamento } from '../types/database';
import { isRealSupabaseConfigured, supabase } from '../lib/supabase';
import { localStore } from '../lib/store';
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
  const { isAdmin, isAluno, alunoData, profile } = useAuth();

  // OTIMIZAÇÃO E PRIVACIDADE:
  // Se não for Admin (Prof. Rogério), a query global da academia fica DESABILITADA por padrão.
  // Isso economiza requisições no Supabase e impede qualquer vazamento ou busca de inadimplentes.
  const isEnabled = options?.enabled !== undefined ? options.enabled : isAdmin;

  // Query: Lista pagamentos com garantia de privacidade e otimização de cotas
  const pagamentosQuery = useQuery({
    queryKey: ['pagamentos', mesFiltro, isAdmin, alunoData?.id],
    enabled: isEnabled,
    queryFn: async (): Promise<Pagamento[]> => {
      // 1. REGRA ESTRITA DE PRIVACIDADE:
      // Se não for Admin (Prof. Rogério), NUNCA busca pagamentos globais nem de outros alunos
      if (!isAdmin) {
        if (!alunoData?.id) {
          // Sem aluno vinculado, retorna vazio imediatamente SEM fazer chamada ao banco
          return [];
        }

        if (isRealSupabaseConfigured) {
          const { data, error } = await supabase
            .from('pagamentos')
            .select('*')
            .eq('aluno_id', alunoData.id)
            .order('mes_referencia', { ascending: false });

          if (error) throw new Error(error.message);
          return (data as unknown as Pagamento[]) || [];
        } else {
          // Modo local/demo seguro: filtra estritamente o próprio aluno
          const pags = localStore.getPagamentos();
          return pags
            .filter((p) => p.aluno_id === alunoData.id)
            .sort((a, b) => b.mes_referencia.localeCompare(a.mes_referencia));
        }
      }

      // 2. EXCLUSIVO PROFESSOR (ADMIN):
      // Apenas o professor visualiza o panorama financeiro de todos os alunos
      if (isRealSupabaseConfigured) {
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
      } else {
        // Modo local para o Professor
        let pags = localStore.getPagamentos();
        if (mesFiltro) {
          pags = pags.filter((p) => p.mes_referencia === mesFiltro);
        }
        return pags.sort((a, b) => b.mes_referencia.localeCompare(a.mes_referencia));
      }
    },
  });

  // Query: Histórico específico por aluno ID (protegido contra acesso indevido de terceiros)
  const usePagamentosByAlunoId = (alunoId?: string) => {
    // Aluno só pode consultar a si próprio, mesmo que passe ID diferente
    const targetAlunoId = isAdmin ? alunoId : alunoData?.id;

    return useQuery({
      queryKey: ['pagamentos-aluno', targetAlunoId],
      queryFn: async (): Promise<Pagamento[]> => {
        if (!targetAlunoId) return [];

        if (isRealSupabaseConfigured) {
          const { data, error } = await supabase
            .from('pagamentos')
            .select('*')
            .eq('aluno_id', targetAlunoId)
            .order('mes_referencia', { ascending: false });

          if (error) throw new Error(error.message);
          return (data as unknown as Pagamento[]) || [];
        } else {
          const pags = localStore.getPagamentos();
          return pags
            .filter((p) => p.aluno_id === targetAlunoId)
            .sort((a, b) => b.mes_referencia.localeCompare(a.mes_referencia));
        }
      },
      enabled: Boolean(targetAlunoId),
    });
  };

  // Query: Logs de auditoria de pagamentos (Apenas Admin)
  const auditoriaQuery = useQuery({
    queryKey: ['pagamentos-auditoria'],
    queryFn: async (): Promise<PagamentoAuditoria[]> => {
      if (!isAdmin) return [];
      if (isRealSupabaseConfigured) {
        const { data, error } = await supabase
          .from('pagamentos_auditoria')
          .select(`
            *,
            perfil_autor:profiles (*)
          `)
          .order('alterado_em', { ascending: false });

        if (error) throw new Error(error.message);
        return (data as unknown as PagamentoAuditoria[]) || [];
      } else {
        return localStore.getAuditoria();
      }
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
        throw new Error('Acesso negado: apenas o Prof. Rogério pode registrar ou alterar pagamentos.');
      }

      if (isRealSupabaseConfigured) {
        const { error } = await (supabase.from('pagamentos') as any)
          .update({
            status: 'pago',
            data_pagamento: dataPagamento,
            metodo,
          })
          .eq('id', pagamentoId);

        if (error) throw new Error(error.message);
      } else {
        // Modo local com auditoria
        const pags = localStore.getPagamentos();
        const idx = pags.findIndex((p) => p.id === pagamentoId);
        if (idx === -1) throw new Error('Pagamento não localizado.');

        const antigo = pags[idx];
        const statusAnterior = antigo.status;
        const valorAnterior = antigo.valor;

        pags[idx].status = 'pago';
        pags[idx].data_pagamento = dataPagamento;
        pags[idx].metodo = metodo;
        pags[idx].updated_at = new Date().toISOString();
        localStore.savePagamentos(pags);

        // Registrar auditoria
        localStore.addAuditoria({
          pagamento_id: pagamentoId,
          alterado_por: profile?.id || 'prof-admin-01',
          status_anterior: statusAnterior,
          status_novo: 'pago',
          valor_anterior: valorAnterior,
          valor_novo: valorAnterior,
        });
      }
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

  // Mutação: Criar ou Registrar novo Pagamento
  const registrarPagamentoMutation = useMutation({
    mutationFn: async (payload: RegistrarPagamentoPayload) => {
      if (!isAdmin) {
        throw new Error('Acesso negado: apenas administradores podem lançar cobranças.');
      }

      if (isRealSupabaseConfigured) {
        const { data, error } = await (supabase.from('pagamentos') as any)
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
        return data;
      } else {
        const pags = localStore.getPagamentos();
        const existing = pags.find(
          (p) => p.aluno_id === payload.aluno_id && p.mes_referencia === payload.mes_referencia
        );
        if (existing) {
          throw new Error('Já existe um registro de pagamento para este aluno no mês informado.');
        }

        const newId = `pag-${Date.now()}`;
        const newPagamento: Pagamento = {
          id: newId,
          aluno_id: payload.aluno_id,
          mes_referencia: payload.mes_referencia,
          valor: payload.valor,
          status: payload.status,
          data_vencimento: payload.data_vencimento,
          data_pagamento: payload.data_pagamento || null,
          metodo: payload.metodo || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        pags.unshift(newPagamento);
        localStore.savePagamentos(pags);

        // Auditoria de criação
        localStore.addAuditoria({
          pagamento_id: newId,
          alterado_por: profile?.id || 'prof-admin-01',
          status_anterior: null,
          status_novo: payload.status,
          valor_anterior: null,
          valor_novo: payload.valor,
        });

        return newPagamento;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pagamentos'] });
      queryClient.invalidateQueries({ queryKey: ['pagamentos-auditoria'] });
      toast.success('Mensalidade registrada com sucesso!');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao registrar pagamento.');
    },
  });

  return {
    pagamentos: pagamentosQuery.data || [],
    isLoading: pagamentosQuery.isLoading,
    refetch: pagamentosQuery.refetch,
    usePagamentosByAlunoId,
    auditoria: auditoriaQuery.data || [],
    isLoadingAuditoria: auditoriaQuery.isLoading,
    marcarComoPago: marcarComoPagoMutation.mutateAsync,
    isMarcandoPago: marcarComoPagoMutation.isPending,
    registrarPagamento: registrarPagamentoMutation.mutateAsync,
    isRegistrando: registrarPagamentoMutation.isPending,
  };
}
