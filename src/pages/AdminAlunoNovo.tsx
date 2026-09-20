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
    watch,
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

  const selectedFaixa = watch('faixa_atual') as FaixaBJJ;

  const onSubmit = async (data: NovoAlunoFormData) => {
    try {
      await createAluno(data);
      navigate('/admin/alunos');
    } catch {
      // toast tratado no hook
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/alunos"
            className="p-2 rounded-xl bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-900 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-neutral-900 font-sans">
              Matrícula de Novo Aluno
            </h1>
            <p className="text-xs text-neutral-500">
              Cadastre os dados e dispare o convite de primeiro acesso para a BJJ College
            </p>
          </div>
        </div>
      </div>

      {/* Formulário Principal */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200/80 shadow-xs">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Nome Completo */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
              Nome Completo do Aluno *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Ex: Carlos Gracie Filho"
                {...register('nome_completo')}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-300 text-sm focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none text-neutral-900"
              />
            </div>
            {errors.nome_completo && (
              <p className="text-xs text-red-600 mt-1">{errors.nome_completo.message}</p>
            )}
          </div>

          {/* Email e Telefone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                E-mail (Para convite de login) *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                <input
                  type="email"
                  placeholder="aluno@email.com"
                  {...register('email')}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-300 text-sm focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none text-neutral-900"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                Telefone / WhatsApp
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="(11) 99999-9999"
                  {...register('telefone')}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-300 text-sm focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none text-neutral-900"
                />
              </div>
              {errors.telefone && (
                <p className="text-xs text-red-600 mt-1">{errors.telefone.message}</p>
              )}
            </div>
          </div>

          {/* Data Início e Faixa Inicial */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                Data de Início no Dojo *
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                <input
                  type="date"
                  {...register('data_inicio')}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-300 text-sm focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none text-neutral-900"
                />
              </div>
              {errors.data_inicio && (
                <p className="text-xs text-red-600 mt-1">{errors.data_inicio.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                Faixa Atual / Ingresso *
              </label>
              <select
                {...register('faixa_atual')}
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 text-sm focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none text-neutral-900 bg-white font-medium"
              >
                {Object.entries(FAIXAS_BJJ).map(([key, info]) => (
                  <option key={key} value={key}>
                    {info.label}
                  </option>
                ))}
              </select>
              {errors.faixa_atual && (
                <p className="text-xs text-red-600 mt-1">{errors.faixa_atual.message}</p>
              )}
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
              Observações Médicas ou Histórico
            </label>
            <textarea
              rows={3}
              placeholder="Ex: Possui lesão no ombro esquerdo, treina para competição de kimono, etc."
              {...register('observacoes')}
              className="w-full p-3 rounded-xl border border-neutral-300 text-sm focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none text-neutral-900"
            />
            {errors.observacoes && (
              <p className="text-xs text-red-600 mt-1">{errors.observacoes.message}</p>
            )}
          </div>

          {/* Aviso de Segurança e Convite */}
          <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-600 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-neutral-800">Convite Seguro com RLS</p>
              <p className="mt-0.5">
                Ao cadastrar, o perfil será criado como <span className="font-semibold">aluno</span> na tabela segura `user_roles`. O aluno receberá um link para definir sua senha e nunca terá permissão de alterar faixas ou valores financeiros.
              </p>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
            <Link
              to="/admin/alunos"
              className="px-4 py-2.5 text-xs font-bold text-neutral-600 hover:text-neutral-900 rounded-xl transition-colors"
            >
              Cancelar
            </Link>
            <button
              id="btn-submit-novo-aluno"
              type="submit"
              disabled={isCreating}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs rounded-xl transition-all shadow-md"
            >
              {isCreating ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Concluir Matrícula & Convidar</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
