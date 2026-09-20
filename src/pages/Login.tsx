import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { loginSchema, LoginFormData } from '../lib/validators';
import { useAuth } from '../hooks/useAuth';
import { Logo } from '../components/Logo';
import { Lock, Mail, ShieldAlert, ArrowRight, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export const Login: React.FC = () => {
  const { signIn, switchMockUser, isDemoMode } = useAuth();
  const navigate = useNavigate();
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'gorillaz@bjjcollege.com.br',
      senha: 'Admin@123password',
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
      if (data.email.includes('gorillaz') || data.email.includes('admin')) {
        navigate('/admin');
      } else {
        navigate('/aluno');
      }
    } catch {
      setAuthError('Falha ao conectar. Tente novamente.');
      toast.error('Erro no servidor.');
    }
  };

  const handleQuickDemo = (role: 'admin' | 'aluno1') => {
    switchMockUser(role);
    if (role === 'admin') {
      setValue('email', 'gorillaz@bjjcollege.com.br');
      setValue('senha', 'Admin@123password');
      toast.success('Perfil: Prof. Rogério (Admin)');
      navigate('/admin');
    } else {
      setValue('email', 'lucas.gracie@email.com');
      setValue('senha', 'Aluno@123password');
      toast.success('Perfil: Lucas Gracie (Aluno)');
      navigate('/aluno');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-950/60 via-[#0a0a0a] to-[#0a0a0a] flex flex-col items-center justify-center p-4 sm:p-6 py-12">
      {/* Topo com Logo Hero */}
      <div className="flex flex-col items-center text-center mt-8 mb-6">
        <Logo size="hero" className="animate-fade-in drop-shadow-2xl" />
        <h1 className="font-['Oswald',sans-serif] font-bold text-3xl sm:text-4xl text-white tracking-wide uppercase mt-4">
          BJJ College
        </h1>
        <p className="font-['Inter',sans-serif] font-medium text-base text-neutral-400 mt-1">
          Prof. Rogério
        </p>
        <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/20 border border-red-600/40 text-red-400 text-xs font-semibold">
          🥋 Família Gorillaz Jiu-Jitsu
        </div>
      </div>

      {/* Card Branco com Sombra Forte e Cantos Arredondados */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-neutral-100 overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-neutral-900">
              Bem-vindo à Família Gorillaz
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              Informe suas credenciais para entrar no tatame
            </p>
          </div>

          {authError && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-xs">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                E-mail de Acesso
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  placeholder="seu-email@dominio.com"
                  {...register('email')}
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all text-neutral-900 placeholder:text-neutral-400"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                  Senha
                </label>
                <Link
                  to="/recuperar-senha"
                  className="text-xs text-red-600 hover:text-red-700 font-semibold transition"
                >
                  Recuperar senha
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register('senha')}
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all text-neutral-900 placeholder:text-neutral-400"
                />
              </div>
              {errors.senha && (
                <p className="text-xs text-red-600 mt-1">{errors.senha.message}</p>
              )}
            </div>

            <button
              id="btn-login-submit"
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-3 py-3.5 px-4 bg-neutral-950 hover:bg-neutral-900 active:scale-[0.99] text-white font-bold text-sm rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Entrar no Dojo</span>
                  <ArrowRight className="w-4 h-4 text-red-500" />
                </>
              )}
            </button>
          </form>

          {/* Links Secundários */}
          <div className="mt-6 pt-5 border-t border-neutral-100 text-center">
            <p className="text-xs text-neutral-600">
              Recebeu convite do Prof. Rogério?{' '}
              <Link
                to="/primeiro-acesso"
                className="text-red-600 hover:text-red-700 font-bold hover:underline"
              >
                Primeiro Acesso
              </Link>
            </p>
          </div>

          {/* Atalhos Rápidos Demo */}
          {isDemoMode && (
            <div className="mt-6 pt-4 border-t border-neutral-100 bg-neutral-50/90 -mx-6 -mb-6 p-4 rounded-b-3xl border-dashed">
              <p className="text-[11px] font-bold text-neutral-600 uppercase tracking-wider text-center mb-2.5">
                ⚡ Acesso Rápido de Demonstração
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemo('admin')}
                  className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold shadow-xs cursor-pointer active:scale-95 transition"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-red-500" />
                  <span>Prof. Rogério</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemo('aluno1')}
                  className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-white border border-neutral-300 hover:bg-neutral-100 text-neutral-800 text-xs font-semibold shadow-xs cursor-pointer active:scale-95 transition"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Aluno Lucas</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
