import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { primeiroAcessoSchema, PrimeiroAcessoFormData } from '../lib/validators';
import { supabase } from '../lib/supabase';
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
      email: '',
      novaSenha: '',
      confirmarSenha: '',
    },
  });

  const onSubmit = async (data: PrimeiroAcessoFormData) => {
    try {
      // 1. Tenta atualizar senha se já estiver autenticado via token de convite
      const { data: sessionData } = await supabase.auth.getSession();

      if (sessionData.session) {
        const { error } = await supabase.auth.updateUser({
          password: data.novaSenha,
        });
        if (error) throw error;
      } else {
        // Tenta signUp com o e-mail convidado
        const { error: signUpError } = await supabase.auth.signUp({
          email: data.email.trim(),
          password: data.novaSenha,
        });

        if (signUpError) {
          // Se o usuário já existe no Auth, tenta redefinir
          const { error: resetError } = await supabase.auth.resetPasswordForEmail(data.email.trim());
          if (resetError) throw signUpError;
          toast.info('Um link de confirmação foi enviado para seu e-mail.');
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

      <div className="w-full max-w-md bg-[#141414] rounded-3xl shadow-2xl border border-neutral-800 overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="mb-6 p-3.5 rounded-2xl bg-black/60 text-neutral-200 text-xs border border-neutral-800 text-center">
            🥋 <strong>Você foi convidado para fazer parte da Família Gorillaz!</strong>
            <p className="text-[11px] text-neutral-400 mt-1">
              Complete a ativação da sua conta definindo uma senha segura.
            </p>
          </div>

          {successMessage ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center shadow-inner">
                <CheckCircle className="w-7 h-7" />
              </div>
              <h2 className="text-lg font-bold text-white">Acesso Liberado!</h2>
              <p className="text-xs text-neutral-300 leading-relaxed">{successMessage}</p>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs uppercase tracking-wider font-['Oswald',sans-serif] rounded-xl transition shadow-red-glow cursor-pointer"
              >
                Acessar Tatame Agora
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                  E-mail Convidado
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    placeholder="seu-email@dominio.com"
                    {...register('email')}
                    className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-neutral-700 bg-[#0f0f0f] text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all text-white placeholder:text-neutral-500"
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Nova Senha
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    {...register('novaSenha')}
                    className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-neutral-700 bg-[#0f0f0f] text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all text-white placeholder:text-neutral-500"
                  />
                </div>
                {errors.novaSenha && (
                  <p className="text-xs text-red-500 mt-1">{errors.novaSenha.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Confirmar Nova Senha
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    {...register('confirmarSenha')}
                    className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-neutral-700 bg-[#0f0f0f] text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all text-white placeholder:text-neutral-500"
                  />
                </div>
                {errors.confirmarSenha && (
                  <p className="text-xs text-red-500 mt-1">{errors.confirmarSenha.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3.5 px-4 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs uppercase tracking-wider font-['Oswald',sans-serif] rounded-xl transition shadow-red-glow flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Cadastrar Senha & Ativar Conta</span>
                )}
              </button>

              <div className="pt-4 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Voltar para tela de Login</span>
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
