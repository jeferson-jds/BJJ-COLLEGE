import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { primeiroAcessoSchema, PrimeiroAcessoFormData } from '../lib/validators';
import { isRealSupabaseConfigured, supabase } from '../lib/supabase';
import { localStore } from '../lib/store';
import { Logo } from '../components/Logo';
import { Lock, Mail, CheckCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export const PrimeiroAcesso: React.FC = () => {
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PrimeiroAcessoFormData>({
    resolver: zodResolver(primeiroAcessoSchema),
    defaultValues: {
      email: 'marcos.rocha@email.com',
      novaSenha: '',
      confirmarSenha: '',
    },
  });

  const onSubmit = async (data: PrimeiroAcessoFormData) => {
    try {
      if (isRealSupabaseConfigured) {
        const { error } = await supabase.auth.updateUser({
          password: data.novaSenha,
        });

        if (error) {
          throw error;
        }
      } else {
        const profiles = localStore.getProfiles();
        const prof = profiles.find((p) => p.email.toLowerCase() === data.email.toLowerCase());

        if (!prof) {
          toast.error('Nenhum cadastro pendente encontrado com este e-mail.');
          return;
        }

        prof.status_convite = 'aceito';
        prof.accepted_at = new Date().toISOString();
        prof.user_id = prof.user_id || `usr-${Date.now()}`;
        localStore.saveProfiles(profiles);

        const roles = localStore.getRoles();
        if (!roles.some((r) => r.user_id === prof.user_id)) {
          roles.push({
            id: `role-${Date.now()}`,
            user_id: prof.user_id,
            role: 'aluno',
            created_at: new Date().toISOString(),
          });
          localStore.saveRoles(roles);
        }
      }

      setSuccessMessage('Senha cadastrada com sucesso! Seu acesso à Família Gorillaz foi ativado.');
      toast.success('Conta ativada com sucesso!');
    } catch (err) {
      toast.error((err as Error).message || 'Erro ao cadastrar senha.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-950/60 via-[#0a0a0a] to-[#0a0a0a] flex flex-col items-center justify-center p-4 sm:p-6 py-12">
      {/* Topo com Logo LG */}
      <div className="flex flex-col items-center text-center mt-4 mb-6">
        <Logo size="lg" className="animate-fade-in drop-shadow-2xl" />
        <h1 className="font-['Oswald',sans-serif] font-bold text-2xl sm:text-3xl text-white tracking-wide uppercase mt-4">
          Bem-vindo à Família Gorillaz
        </h1>
        <p className="font-['Inter',sans-serif] font-normal text-sm text-neutral-400 mt-1">
          Crie sua senha para acessar o sistema BJJ College
        </p>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-neutral-100 overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="mb-6 p-3.5 rounded-2xl bg-neutral-900 text-neutral-200 text-xs border border-neutral-800 text-center">
            🥋 <strong>Você foi convidado para fazer parte da Família Gorillaz!</strong>
            <p className="text-[11px] text-neutral-400 mt-1">
              Complete a ativação da sua conta definindo uma senha segura.
            </p>
          </div>

          {successMessage ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
                <CheckCircle className="w-7 h-7" />
              </div>
              <h2 className="text-lg font-bold text-neutral-900">Acesso Liberado!</h2>
              <p className="text-xs text-neutral-600 leading-relaxed">{successMessage}</p>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full py-3 bg-neutral-950 hover:bg-neutral-900 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
              >
                Ir para Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                  E-mail do Convite
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    placeholder="seu.email@exemplo.com"
                    {...register('email')}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none text-neutral-900"
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                  Criar Nova Senha
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    placeholder="Mínimo 8 caracteres (1 maiúscula + 1 número)"
                    {...register('novaSenha')}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none text-neutral-900"
                  />
                </div>
                {errors.novaSenha && (
                  <p className="text-xs text-red-600 mt-1">{errors.novaSenha.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                  Confirmar Nova Senha
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    placeholder="Repita a nova senha"
                    {...register('confirmarSenha')}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none text-neutral-900"
                  />
                </div>
                {errors.confirmarSenha && (
                  <p className="text-xs text-red-600 mt-1">{errors.confirmarSenha.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3.5 px-4 bg-red-600 hover:bg-red-700 active:scale-[0.99] text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Ativar Minha Conta</span>
                )}
              </button>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 font-semibold"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Voltar para o Login</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrimeiroAcesso;
