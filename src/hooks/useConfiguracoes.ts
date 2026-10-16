import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BJJCollegeConfig, DEFAULT_CONFIG } from '../types/database';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export function useConfiguracoes() {
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();

  const configQuery = useQuery({
    queryKey: ['configuracoes'],
    queryFn: async (): Promise<BJJCollegeConfig & Record<string, string>> => {
      try {
        const { data, error } = await (supabase.from('configuracoes') as any).select('chave, valor');
        if (error) {
          console.warn('Erro ao carregar configurações do Supabase, usando padrão:', error.message);
          return {
            ...DEFAULT_CONFIG,
          };
        }

        const configMap: Record<string, string> = {};
        (data as any[])?.forEach((item: any) => {
          if (item?.chave && item?.valor !== null) {
            configMap[item.chave] = item.valor;
          }
        });

        const nome = configMap['nome_professor'];
        return {
          chave_pix: configMap['chave_pix'] ?? DEFAULT_CONFIG.chave_pix,
          valor_mensalidade: configMap['valor_mensalidade'] ?? DEFAULT_CONFIG.valor_mensalidade,
          dia_vencimento: configMap['dia_vencimento'] ?? DEFAULT_CONFIG.dia_vencimento,
          nome_academia: configMap['nome_academia'] ?? DEFAULT_CONFIG.nome_academia,
          nome_professor: !nome || nome === 'Gorillaz' ? DEFAULT_CONFIG.nome_professor : nome,
          ...configMap,
        };
      } catch (err) {
        console.warn('Falha na query de configurações:', err);
        return {
          ...DEFAULT_CONFIG,
        };
      }
    },
    staleTime: 1000 * 60 * 5,
  });

  const updateConfigMutation = useMutation({
    mutationFn: async (newConfig: Partial<BJJCollegeConfig> & Record<string, any>) => {
      if (!isAdmin) {
        throw new Error('Apenas o Professor Rogério/Admin pode alterar as configurações da academia.');
      }

      const entries = Object.entries(newConfig);
      for (const [chave, valor] of entries) {
        if (valor !== undefined) {
          const { error } = await (supabase.from('configuracoes') as any)
            .upsert({ chave, valor: String(valor) }, { onConflict: 'chave' });
          if (error) throw new Error(error.message);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configuracoes'] });
      toast.success('Configurações da BJJ College salvas com sucesso no Supabase!');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao salvar configurações.');
    },
  });

  const activeConfig: BJJCollegeConfig & Record<string, string> = configQuery.data || {
    ...DEFAULT_CONFIG,
  };

  return {
    ...configQuery,
    data: activeConfig,
    config: activeConfig,
    updateConfig: updateConfigMutation.mutateAsync,
    isUpdating: updateConfigMutation.isPending,
  };
}

export default useConfiguracoes;
