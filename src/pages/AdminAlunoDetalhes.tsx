import React, { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAlunos } from '../hooks/useAlunos';
import { usePagamentos } from '../hooks/usePagamentos';
import { FaixaBadge } from '../components/FaixaBadge';
import { StatusIndicator } from '../components/StatusIndicator';
import { Modal } from '../components/Modal';
import { SkeletonCard } from '../components/SkeletonLoader';
import { GraduacaoModal } from '../components/GraduacaoModal';
import { useCheckIn } from '../hooks/useCheckIn';
import { MetodoPagamento, StatusPagamento } from '../types/database';
import { formatCurrencyBRL, formatDateBR } from '../lib/utils';
import {
  ArrowLeft,
  Award,
  CreditCard,
  Edit,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  Check,
  Flame,
} from 'lucide-react';

const AdminAlunoDetalhesView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { useAlunoById, useGraduacoesByAluno, graduarAluno, isGraduando, updateAluno, isUpdating } = useAlunos();
  const { usePagamentosByAlunoId, marcarComoPago, registrarPagamento, isRegistrando } = usePagamentos();
  const { isAlunoPresente, toggleCheckIn, isToggling } = useCheckIn();

  const { data: aluno, isLoading: loadingAluno, refetch: refetchAluno } = useAlunoById(id);
  const { data: graduacoes = [], refetch: refetchGraduacoes } = useGraduacoesByAluno(id);
  const { data: pagamentos = [], refetch: refetchPagamentos } = usePagamentosByAlunoId(id);

  const presenteHoje = id ? isAlunoPresente(id) : false;

  // Modais de Ação
  const [modalGraduar, setModalGraduar] = useState(false);
  const [modalPagamento, setModalPagamento] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);

  // Formulário Pagamento
  const [mesRef, setMesRef] = useState(new Date().toISOString().slice(0, 7));
  const [valorPag, setValorPag] = useState('180.00');
  const [statusPag, setStatusPag] = useState<StatusPagamento>('pago');
  const [metodoPag, setMetodoPag] = useState<MetodoPagamento>('pix');
  const [vencimentoPag, setVencimentoPag] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 10).toISOString().split('T')[0]
  );

  // Formulário Editar Cadastro
  const [editAtivo, setEditAtivo] = useState(true);
  const [editTelefone, setEditTelefone] = useState('');
  const [editObs, setEditObs] = useState('');

  // Sincroniza estado de edição ao carregar aluno
  React.useEffect(() => {
    if (aluno) {
      setEditAtivo(aluno.ativo);
      setEditTelefone(aluno.profile?.telefone || '');
      setEditObs(aluno.observacoes || '');
    }
  }, [aluno]);

  if (loadingAluno) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <SkeletonCard rows={4} />
      </div>
    );
  }

  if (!aluno) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h2 className="text-lg font-bold text-white font-['Oswald',sans-serif] uppercase">
          Aluno não encontrado no Supabase
        </h2>
        <Link to="/admin/alunos" className="text-sm text-red-500 font-bold mt-2 inline-block hover:underline">
          Voltar para listagem de alunos
        </Link>
      </div>
    );
  }

  const profile = aluno.profile;

  const handlePagamentoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await registrarPagamento({
        aluno_id: id,
        mes_referencia: mesRef,
        valor: parseFloat(valorPag) || 180,
        status: statusPag,
        data_vencimento: vencimentoPag,
        data_pagamento: statusPag === 'pago' ? new Date().toISOString().split('T')[0] : null,
        metodo: statusPag === 'pago' ? metodoPag : null,
      });
      setModalPagamento(false);
      refetchPagamentos();
    } catch {
      // Toast disparado no hook
    }
  };

  const handleEditarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await updateAluno({
        aluno_id: id,
        ativo: editAtivo,
        telefone: editTelefone,
        observacoes: editObs,
      });
      setModalEditar(false);
      refetchAluno();
    } catch {
      // Toast disparado no hook
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-20 md:pb-6">
      {/* Top Bar com Voltar e Ações Rápidas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/alunos"
            className="p-2 rounded-xl bg-[#141414] border border-neutral-800 text-neutral-400 hover:text-white transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white uppercase tracking-tight font-['Oswald',sans-serif]">
                {profile?.nome_completo}
              </h1>
              <span
                className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                  aluno.ativo
                    ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                    : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                }`}
              >
                {aluno.ativo ? 'Ativo' : 'Inativo'}
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Matriculado desde {formatDateBR(aluno.data_inicio)} • Sincronizado no Supabase
            </p>
          </div>
        </div>

        {/* 4 Ações Principais: Check-in, Graduar, Lançar Mensalidade, Editar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Botão de Check-in Hoje */}
          <button
            type="button"
            id="btn-detalhes-checkin"
            disabled={isToggling}
            onClick={() => id && toggleCheckIn({ aluno_id: id })}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border shadow-xs cursor-pointer ${
              presenteHoje
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500'
                : 'bg-[#141414] hover:bg-[#1a1a1a] text-neutral-200 border-neutral-700'
            }`}
          >
            {presenteHoje ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Presente Hoje (Oss!)</span>
              </>
            ) : (
              <>
                <Flame className="w-4 h-4 text-red-500" />
                <span>Marcar Presença</span>
              </>
            )}
          </button>

          <button
            type="button"
            id="btn-detalhes-graduar"
            onClick={() => setModalGraduar(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-bold uppercase font-['Oswald',sans-serif] tracking-wider rounded-xl transition-all shadow-red-glow cursor-pointer"
          >
            <Award className="w-4 h-4" />
            <span>Graduar Aluno</span>
          </button>
          <button
            type="button"
            onClick={() => setModalPagamento(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold uppercase font-['Oswald',sans-serif] tracking-wider rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            <span>Lançar Mensalidade</span>
          </button>
          <button
            type="button"
            onClick={() => setModalEditar(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#1a1a1a] border border-neutral-700 hover:bg-[#222] text-neutral-300 hover:text-white text-xs font-semibold rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Edit className="w-3.5 h-3.5 text-neutral-400" />
            <span>Editar</span>
          </button>
        </div>
      </div>

      {/* Card Principal: Perfil e Faixa Atual */}
      <div className="bg-[#141414] p-6 rounded-2xl border border-neutral-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={
                profile?.foto_url ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80'
              }
              alt={profile?.nome_completo || 'Foto do Aluno'}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-red-600/60 shadow-red-glow"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-3 mb-1">
                <FaixaBadge faixa={aluno.faixa_atual} graus={aluno.graus || 0} size="md" showGrausText />
              </div>
              <p className="text-xs text-neutral-400 flex items-center gap-1 mt-1 font-mono">
                <Mail className="w-3.5 h-3.5 text-neutral-500" />
                <span>{profile?.email}</span>
              </p>
              {profile?.telefone && (
                <p className="text-xs text-neutral-400 flex items-center gap-1 mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-neutral-500" />
                  <span>{profile.telefone}</span>
                </p>
              )}
            </div>
          </div>

          <div className="bg-[#0f0f0f] p-4 rounded-xl border border-neutral-800 text-xs space-y-2 md:w-80">
            <div className="flex justify-between">
              <span className="text-neutral-400">Total de Treinos:</span>
              <span className="font-bold text-red-500 inline-flex items-center gap-1">
                <Flame className="w-3.5 h-3.5" />
                {aluno.total_treinos || 0} presenças
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Última Graduação:</span>
              <span className="font-bold text-white">
                {formatDateBR(aluno.data_graduacao || aluno.data_inicio)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Status do Convite:</span>
              <span className="font-bold text-white capitalize">
                {profile?.status_convite}
              </span>
            </div>
            {aluno.observacoes && (
              <div className="pt-2 mt-1 border-t border-neutral-800">
                <p className="text-neutral-400 italic">"{aluno.observacoes}"</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Histórico de Graduações e Histórico de Mensalidades */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Histórico de Graduações */}
        <div className="bg-[#141414] p-6 rounded-2xl border border-neutral-800 shadow-xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-red-500" />
              <h2 className="text-base font-bold text-white font-['Oswald',sans-serif] uppercase tracking-wide">
                Histórico de Graduações (BJJ)
              </h2>
            </div>
            <span className="text-xs text-neutral-400 font-mono">{graduacoes.length} registros</span>
          </div>

          {graduacoes.length === 0 ? (
            <p className="text-xs text-neutral-500 py-6 text-center">
              Nenhuma graduação registrada além da matrícula inicial.
            </p>
          ) : (
            <div className="relative pl-6 border-l-2 border-neutral-800 space-y-6 my-2">
              {graduacoes.map((grad) => (
                <div key={grad.id} className="relative group">
                  <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-red-600 border-2 border-black" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FaixaBadge faixa={grad.faixa} graus={grad.graus || 0} size="sm" showGrausText />
                      {grad.tipo && (
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300">
                          {grad.tipo === 'grau' ? 'Grau' : 'Faixa'}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-neutral-400 font-mono">
                      {formatDateBR(grad.data)}
                    </span>
                  </div>
                  {grad.observacoes && (
                    <p className="text-xs text-neutral-400 mt-1 italic">{grad.observacoes}</p>
                  )}
                  <p className="text-[10px] text-neutral-500 mt-0.5">
                    Professor: {grad.professor?.nome_completo || 'Prof. Rogério'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Histórico de Mensalidades */}
        <div className="bg-[#141414] p-6 rounded-2xl border border-neutral-800 shadow-xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-red-500" />
              <h2 className="text-base font-bold text-white font-['Oswald',sans-serif] uppercase tracking-wide">
                Mensalidades & Cobranças
              </h2>
            </div>
            <span className="text-xs text-neutral-400 font-mono">{pagamentos.length} registros</span>
          </div>

          {pagamentos.length === 0 ? (
            <p className="text-xs text-neutral-500 py-6 text-center">
              Nenhuma mensalidade lançada para este aluno ainda.
            </p>
          ) : (
            <div className="divide-y divide-neutral-800/80">
              {pagamentos.map((pag) => (
                <div
                  key={pag.id}
                  className="py-3 flex items-center justify-between gap-2 first:pt-0 last:pb-0"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white font-mono">
                        {pag.mes_referencia}
                      </span>
                      <StatusIndicator status={pag.status} size="sm" />
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      Venceu em: {formatDateBR(pag.data_vencimento)}
                      {pag.data_pagamento && ` • Pago em ${formatDateBR(pag.data_pagamento)}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-white font-mono">
                      {formatCurrencyBRL(pag.valor)}
                    </span>
                    {pag.status !== 'pago' ? (
                      <button
                        type="button"
                        onClick={async () => {
                          await marcarComoPago({ pagamentoId: pag.id });
                          refetchPagamentos();
                        }}
                        className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors cursor-pointer"
                      >
                        Baixar
                      </button>
                    ) : (
                      <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 font-mono">
                        <Check className="w-3.5 h-3.5" />
                        {pag.metodo?.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODAL: GRADUAR ALUNO COM GRAUS OU FAIXA */}
      <GraduacaoModal
        aluno={aluno}
        isOpen={modalGraduar}
        onClose={() => setModalGraduar(false)}
        onGraduar={async (data) => {
          await graduarAluno(data);
          setModalGraduar(false);
          refetchAluno();
          refetchGraduacoes();
        }}
        isSubmitting={isGraduando}
      />

      {/* MODAL: LANÇAR MENSALIDADE */}
      <Modal
        isOpen={modalPagamento}
        onClose={() => setModalPagamento(false)}
        title="Lançar Mensalidade"
        description="Gera uma cobrança para o aluno registrada no Supabase com auditoria."
      >
        <form onSubmit={handlePagamentoSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-neutral-300 mb-1">
                Mês Referência (AAAA-MM) *
              </label>
              <input
                type="month"
                value={mesRef}
                onChange={(e) => setMesRef(e.target.value)}
                className="w-full p-2.5 text-sm rounded-xl border border-neutral-700 bg-[#0f0f0f] text-white outline-none focus:ring-2 focus:ring-red-600"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-neutral-300 mb-1">
                Valor (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                value={valorPag}
                onChange={(e) => setValorPag(e.target.value)}
                className="w-full p-2.5 text-sm rounded-xl border border-neutral-700 bg-[#0f0f0f] text-white outline-none focus:ring-2 focus:ring-red-600 font-bold"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-neutral-300 mb-1">
                Data Vencimento *
              </label>
              <input
                type="date"
                value={vencimentoPag}
                onChange={(e) => setVencimentoPag(e.target.value)}
                className="w-full p-2.5 text-sm rounded-xl border border-neutral-700 bg-[#0f0f0f] text-white outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-neutral-300 mb-1">
                Status Inicial *
              </label>
              <select
                value={statusPag}
                onChange={(e) => setStatusPag(e.target.value as StatusPagamento)}
                className="w-full p-2.5 text-sm rounded-xl border border-neutral-700 bg-[#0f0f0f] text-white font-medium outline-none"
              >
                <option value="pago">Pago Imediatamente</option>
                <option value="pendente">Pendente</option>
                <option value="atrasado">Atrasado</option>
              </select>
            </div>
          </div>

          {statusPag === 'pago' && (
            <div>
              <label className="block text-xs font-bold uppercase text-neutral-300 mb-1">
                Método de Recebimento
              </label>
              <select
                value={metodoPag}
                onChange={(e) => setMetodoPag(e.target.value as MetodoPagamento)}
                className="w-full p-2.5 text-sm rounded-xl border border-neutral-700 bg-[#0f0f0f] text-white font-medium outline-none"
              >
                <option value="pix">PIX</option>
                <option value="dinheiro">Dinheiro</option>
                <option value="cartao">Cartão</option>
                <option value="transferencia">Transferência</option>
              </select>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
            <button
              type="button"
              onClick={() => setModalPagamento(false)}
              className="px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isRegistrando}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs cursor-pointer"
            >
              {isRegistrando ? 'Salvando...' : 'Lançar Pagamento'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: EDITAR CADASTRO */}
      <Modal
        isOpen={modalEditar}
        onClose={() => setModalEditar(false)}
        title="Editar Cadastro do Aluno"
        description="Alterações cadastrais e observações salvas no Supabase."
      >
        <form onSubmit={handleEditarSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-neutral-300 mb-1">
              Telefone / WhatsApp
            </label>
            <input
              type="text"
              value={editTelefone}
              onChange={(e) => setEditTelefone(e.target.value)}
              className="w-full p-2.5 text-sm rounded-xl border border-neutral-700 bg-[#0f0f0f] text-white outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-neutral-300 mb-1">
              Status da Matrícula
            </label>
            <select
              value={editAtivo ? 'ativo' : 'inativo'}
              onChange={(e) => setEditAtivo(e.target.value === 'ativo')}
              className="w-full p-2.5 text-sm rounded-xl border border-neutral-700 bg-[#0f0f0f] text-white font-medium outline-none"
            >
              <option value="ativo">Ativo (Frequenta o dojo)</option>
              <option value="inativo">Inativo / Trancado</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-neutral-300 mb-1">
              Observações
            </label>
            <textarea
              rows={3}
              value={editObs}
              onChange={(e) => setEditObs(e.target.value)}
              className="w-full p-2.5 text-sm rounded-xl border border-neutral-700 bg-[#0f0f0f] text-white outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
            <button
              type="button"
              onClick={() => setModalEditar(false)}
              className="px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs cursor-pointer"
            >
              {isUpdating ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export const AdminAlunoDetalhes: React.FC = () => {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return <Navigate to="/aluno" replace />;
  }

  return <AdminAlunoDetalhesView />;
};

export default AdminAlunoDetalhes;
