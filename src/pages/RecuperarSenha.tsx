import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { recuperarSenhaSchema, RecuperarSenhaFormData } from '../lib/validators';
import { supabase } from '../lib/supabase';
import { Mail, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export const RecuperarSenha: React.FC = () => {
  const [isSent, setIsSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RecuperarSenhaFormData>({
    resolver: zodResolver(recuperarSenhaSchema),
  });

  const onSubmit = async (data: RecuperarSenhaFormData) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email.trim(), {
        redirectTo: `${window.location.origin}/primeiro-acesso`,
      });
      if (error) throw error;

      setIsSent(true);
      toast.success('Instruções de recuperação enviadas para o seu e-mail!');
    } catch (err) {
      toast.error((err as Error).message || 'Erro ao solicitar recuperação.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-950/60 via-[#0a0a0a] to-[#0a0a0a] flex flex-col items-center justify-center p-4 sm:p-6 py-12">
      {/* Topo com Logo LG */}
      <div className="flex flex-col items-center text-center mt-4 mb-6">
        <Logo size="lg" className="animate-fade-in drop-shadow-2xl" />
        <h1 className="font-['Oswald',sans-serif] font-bold text-2xl sm:text-3xl text-white tracking-wide uppercase mt-4">
          Recuperar Acesso
        </h1>
        <p className="font-['Inter',sans-serif] font-normal text-sm text-neutral-400 mt-1">
          Enviaremos um link de redefinição para o seu e-mail
        </p>
      </div>

      <div className="w-full max-w-md bg-[#141414] rounded-3xl shadow-2xl border border-neutral-800 overflow-hidden">
        <div className="p-6 sm:p-8">
          {isSent ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h2 className="text-lg font-bold text-white">E-mail Enviado!</h2>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Verifique sua caixa de entrada e siga as instruções para redefinir a senha do seu acesso à Família Gorillaz.
              </p>
              <Link
                to="/login"
                className="w-full inline-block py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider font-['Oswald',sans-serif] rounded-xl transition shadow-red-glow text-center"
              >
                Voltar para o Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Seu E-mail Cadastrado
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

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3.5 px-4 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs uppercase tracking-wider font-['Oswald',sans-serif] rounded-xl transition shadow-red-glow flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Enviar Link de Recuperação</span>
                    <Send className="w-4 h-4" />
                  </>
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

export default RecuperarSenha;
