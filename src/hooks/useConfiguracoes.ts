import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BJJCollegeConfig } from '../types/database';
import { isRealSupabaseConfigured, supabase } from '../lib/supabase';
import { localStore } from '../lib/store';
import { INITIAL_CONFIG } from '../lib/mockData';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export function useConfiguracoes() {
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();

  const configQuery = useQuery({
    queryKey: ['configuracoes'],
    queryFn: async (): Promise<BJJCollegeConfig & Record<string, string>> => {
      if (isRealSupabaseConfigured) {
        const { data, error } = await (supabase.from('configuracoes') as any).select('chave, valor');
        if (error) throw new Error(error.message);

        const configMap: Record<string, string> = {};
        (data as any[])?.forEach((item: any) => {
          if (item?.chave && item?.valor !== null) {
            configMap[item.chave] = item.valor;
          }
        });

        const nome = configMap['nome_professor'];
        return {
          chave_pix: configMap['chave_pix'] ?? INITIAL_CONFIG.chave_pix,
          valor_mensalidade: configMap['valor_mensalidade'] ?? INITIAL_CONFIG.valor_mensalidade,
          dia_vencimento: configMap['dia_vencimento'] ?? INITIAL_CONFIG.dia_vencimento,
          nome_academia: configMap['nome_academia'] ?? INITIAL_CONFIG.nome_academia,
          nome_professor: !nome || nome === 'Gorillaz' ? 'Rogério' : nome,
          ...configMap,
        };
      } else {
        const local = localStore.getConfig();
        const nome = !local.nome_professor || local.nome_professor === 'Gorillaz' ? 'Rogério' : local.nome_professor;
        return {
          ...local,
          nome_professor: nome,
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

      if (isRealSupabaseConfigured) {
        const entries = Object.entries(newConfig);
        for (const [chave, valor] of entries) {
          if (valor !== undefined) {
            const { error } = await (supabase.from('configuracoes') as any)
              .upsert({ chave, valor: String(valor) }, { onConflict: 'chave' });
            if (error) throw new Error(error.message);
          }
        }
      } else {
        const current = localStore.getConfig();
        const updated = { ...current, ...newConfig } as BJJCollegeConfig;
        localStore.saveConfig(updated);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configuracoes'] });
      toast.success('Configurações da BJJ College salvas com sucesso!');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao salvar configurações.');
    },
  });

  const activeConfig: BJJCollegeConfig & Record<string, string> = configQuery.data || {
    ...INITIAL_CONFIG,
    nome_professor: 'Rogério',
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
