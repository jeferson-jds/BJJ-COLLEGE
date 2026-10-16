import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { novoAlunoSchema, NovoAlunoFormData } from '../lib/validators';
import { useAlunos } from '../hooks/useAlunos';
import { FaixaBJJ } from '../types/database';
import { FAIXAS_BJJ } from '../lib/utils';
import { UserPlus, ArrowLeft, Send, User, Mail, Phone, Calendar, ShieldCheck } from 'lucide-react';

export const AdminAlunoNovo: React.FC = () => {
  const navigate = useNavigate();
  const { createAluno, isCreating } = useAlunos();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NovoAlunoFormData>({
    resolver: zodResolver(novoAlunoSchema),
    defaultValues: {
      nome_completo: '',
      email: '',
      telefone: '',
      data_inicio: new Date().toISOString().split('T')[0],
      faixa_atual: 'branca',
      graus: 0,
      observacoes: '',
    },
  });

  const onSubmit = async (data: NovoAlunoFormData) => {
    try {
      await createAluno(data);
      navigate('/admin/alunos');
    } catch {
      // toast tratado no hook
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-20 md:pb-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/alunos"
            className="p-2 rounded-xl bg-[#141414] border border-neutral-800 text-neutral-400 hover:text-white transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-tight text-white font-['Oswald',sans-serif]">
              Matrícula de Novo Aluno • Família Gorillaz
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              Cadastre os dados cadastrais diretamente na base de dados oficial do Supabase
            </p>
          </div>
        </div>
      </div>

      {/* Formulário Principal em Dark Mode */}
      <div className="bg-[#141414] p-6 sm:p-8 rounded-2xl border border-neutral-800 shadow-xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Nome Completo */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
              Nome Completo do Aluno *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Ex: Carlos Gracie Filho"
                {...register('nome_completo')}
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-neutral-700 bg-[#0f0f0f] text-sm focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none text-white placeholder:text-neutral-500 font-medium"
              />
            </div>
            {errors.nome_completo && (
              <p className="text-xs text-red-500 mt-1">{errors.nome_completo.message}</p>
            )}
          </div>

          {/* Email e Telefone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                E-mail (Para acesso e cobrança) *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  placeholder="aluno@email.com"
                  {...register('email')}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-neutral-700 bg-[#0f0f0f] text-sm focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none text-white placeholder:text-neutral-500"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                Telefone / WhatsApp
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="(21) 99999-9999"
                  {...register('telefone')}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-neutral-700 bg-[#0f0f0f] text-sm focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none text-white placeholder:text-neutral-500"
                />
              </div>
              {errors.telefone && (
                <p className="text-xs text-red-500 mt-1">{errors.telefone.message}</p>
              )}
            </div>
          </div>

          {/* Data Início e Faixa Inicial */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                Data de Início no Dojo *
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
                <input
                  type="date"
                  {...register('data_inicio')}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-neutral-700 bg-[#0f0f0f] text-sm focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none text-white"
                />
              </div>
              {errors.data_inicio && (
                <p className="text-xs text-red-500 mt-1">{errors.data_inicio.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                Faixa Inicial / Graduação de Ingresso *
              </label>
              <select
                {...register('faixa_atual')}
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-700 bg-[#0f0f0f] text-sm focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none text-white font-medium"
              >
                {Object.entries(FAIXAS_BJJ).map(([key, info]) => (
                  <option key={key} value={key} className="bg-[#141414] text-white">
                    {info.label}
                  </option>
                ))}
              </select>
              {errors.faixa_atual && (
                <p className="text-xs text-red-500 mt-1">{errors.faixa_atual.message}</p>
              )}
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
              Observações Médicas ou Histórico Técnico
            </label>
            <textarea
              rows={3}
              placeholder="Ex: Histórico em outra equipe, competidor, lesões prévias..."
              {...register('observacoes')}
              className="w-full p-3 rounded-xl border border-neutral-700 bg-[#0f0f0f] text-sm focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none text-white placeholder:text-neutral-500"
            />
          </div>

          {/* Aviso de Segurança */}
          <div className="p-4 rounded-xl bg-black/40 border border-neutral-800 text-xs text-neutral-400 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white uppercase font-['Oswald',sans-serif] tracking-wide">
                Integração Direta Supabase & RLS
              </p>
              <p className="mt-0.5 text-neutral-400">
                O registro será persistido de forma segura na tabela `alunos` vinculada ao `profiles` no Supabase com isolamento de privilégios.
              </p>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
            <Link
              to="/admin/alunos"
              className="px-4 py-2.5 text-xs font-bold text-neutral-400 hover:text-white rounded-xl transition-colors"
            >
              Cancelar
            </Link>
            <button
              id="btn-submit-novo-aluno"
              type="submit"
              disabled={isCreating}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs uppercase tracking-wider font-['Oswald',sans-serif] rounded-xl transition-all shadow-red-glow cursor-pointer"
            >
              {isCreating ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Concluir Matrícula</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminAlunoNovo;
