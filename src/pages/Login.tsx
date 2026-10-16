import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { loginSchema, LoginFormData } from '../lib/validators';
import { useAuth } from '../hooks/useAuth';
import { Logo } from '../components/Logo';
import { Lock, Mail, ShieldAlert, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export const Login: React.FC = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      senha: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setAuthError(null);
    try {
      const res = await signIn(data.email, data.senha);
      if (res.error) {
        setAuthError(res.error);
        toast.error(res.error);
        return;
      }
      toast.success('Login efetuado com sucesso! Bem-vindo à Família Gorillaz.');
      navigate('/');
    } catch {
      setAuthError('Falha ao conectar ao servidor Supabase. Verifique suas credenciais.');
      toast.error('Erro na autenticação.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-950/60 via-[#0a0a0a] to-[#0a0a0a] flex flex-col items-center justify-center p-4 sm:p-6 py-12 relative z-10">
      {/* Topo com Logo Hero */}
      <div className="flex flex-col items-center text-center mt-6 mb-6">
        <Logo size="hero" className="animate-fade-in drop-shadow-[0_0_35px_rgba(220,38,38,0.5)]" />
        <h1 className="font-['Oswald',sans-serif] font-bold text-3xl sm:text-4xl text-white tracking-wide uppercase mt-4">
          BJJ College
        </h1>
        <p className="font-['Inter',sans-serif] font-medium text-base text-neutral-400 mt-1">
          Prof. Rogério • Faixa Preta
        </p>
        <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/20 border border-red-600/40 text-red-400 text-xs font-semibold">
          🥋 Família Gorillaz Jiu-Jitsu
        </div>
      </div>

      {/* Card Dark Mode com Borda Vermelha */}
      <div className="w-full max-w-md bg-[#141414] rounded-3xl shadow-2xl border border-neutral-800 overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-white font-['Oswald',sans-serif] uppercase tracking-wide">
              Acesso ao Tatame
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              Informe suas credenciais registradas no Supabase
            </p>
          </div>

          {authError && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-950/60 border border-red-800/80 flex items-start gap-3 text-red-300 text-xs">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                E-mail de Acesso
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300">
                  Senha
                </label>
                <Link
                  to="/recuperar-senha"
                  className="text-xs text-red-500 hover:text-red-400 font-semibold transition"
                >
                  Recuperar senha
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register('senha')}
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-neutral-700 bg-[#0f0f0f] text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all text-white placeholder:text-neutral-500"
                />
              </div>
              {errors.senha && (
                <p className="text-xs text-red-500 mt-1">{errors.senha.message}</p>
              )}
            </div>

            <button
              id="btn-login-submit"
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-3 py-3.5 px-4 bg-red-600 hover:bg-red-700 active:scale-[0.99] text-white font-bold text-xs uppercase tracking-wider font-['Oswald',sans-serif] rounded-xl transition-all shadow-red-glow flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Entrar no Dojo</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Links Secundários */}
          <div className="mt-6 pt-5 border-t border-neutral-800 text-center">
            <p className="text-xs text-neutral-400">
              Recebeu convite do Prof. Rogério?{' '}
              <Link
                to="/primeiro-acesso"
                className="text-red-500 hover:text-red-400 font-bold hover:underline"
              >
                Primeiro Acesso
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
