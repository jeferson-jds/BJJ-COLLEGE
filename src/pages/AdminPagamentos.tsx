import React, { useState, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { usePagamentos } from '../hooks/usePagamentos';
import { useAlunos } from '../hooks/useAlunos';
import { StatusIndicator } from '../components/StatusIndicator';
import { Modal } from '../components/Modal';
import { SkeletonList } from '../components/SkeletonLoader';
import { EmptyState } from '../components/EmptyState';
import { MetodoPagamento, StatusPagamento } from '../types/database';
import { formatCurrencyBRL, formatDateBR, formatMonthYearBR } from '../lib/utils';
import {
  CreditCard,
  Plus,
  CheckCircle2,
  Calendar,
  Filter,
  History,
  ShieldCheck,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';

const AdminPagamentosView: React.FC = () => {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [mesFiltro, setMesFiltro] = useState<string>(currentMonth);
  const [statusFiltro, setStatusFiltro] = useState<string>('todos');
  const [abaAuditoria, setAbaAuditoria] = useState(false);

  const {
    pagamentos,
    isLoading,
    marcarComoPago,
    isMarcandoPago,
    auditoria,
    registrarPagamento,
    isRegistrando,
  } = usePagamentos(mesFiltro || undefined);

  const { alunos } = useAlunos();

  // Modal Novo Pagamento
  const [modalNovo, setModalNovo] = useState(false);
  const [novoAlunoId, setNovoAlunoId] = useState('');
  const [novoMesRef, setNovoMesRef] = useState(currentMonth);
  const [novoValor, setNovoValor] = useState('180.00');
  const [novoStatus, setNovoStatus] = useState<StatusPagamento>('pendente');
  const [novoMetodo, setNovoMetodo] = useState<MetodoPagamento>('pix');
  const [novoVencimento, setNovoVencimento] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 10).toISOString().split('T')[0]
  );

  const pagamentosFiltrados = useMemo(() => {
    return pagamentos.filter((p) => {
      if (statusFiltro === 'todos') return true;
      return p.status === statusFiltro;
    });
  }, [pagamentos, statusFiltro]);

  // Cálculos financeiros do mês
  const totalRecebido = pagamentos
    .filter((p) => p.status === 'pago')
    .reduce((sum, p) => sum + Number(p.valor), 0);

  const totalPendente = pagamentos
    .filter((p) => p.status !== 'pago')
    .reduce((sum, p) => sum + Number(p.valor), 0);

  const taxaAdimplencia =
    pagamentos.length > 0
      ? Math.round((pagamentos.filter((p) => p.status === 'pago').length / pagamentos.length) * 100)
      : 0;

  const handleCreatePagamento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoAlunoId) {
      toast.error('Selecione um aluno.');
      return;
    }
    try {
      await registrarPagamento({
        aluno_id: novoAlunoId,
        mes_referencia: novoMesRef,
        valor: parseFloat(novoValor) || 180,
        status: novoStatus,
        data_vencimento: novoVencimento,
        data_pagamento: novoStatus === 'pago' ? new Date().toISOString().split('T')[0] : null,
        metodo: novoStatus === 'pago' ? novoMetodo : null,
      });
      setModalNovo(false);
    } catch {
      // Toast no hook
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-red-600" />
            <h1 className="text-2xl font-black uppercase tracking-tight text-neutral-900 font-sans">
              Gestão Financeira & Mensalidades
            </h1>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Controle de fluxo de caixa da BJJ College com registro de auditoria imutável
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAbaAuditoria(!abaAuditoria)}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all ${
              abaAuditoria
                ? 'bg-neutral-900 text-white border-neutral-900'
                : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'
            }`}
          >
            <History className="w-4 h-4" />
            <span>{abaAuditoria ? 'Ver Pagamentos' : 'Log de Auditoria'}</span>
          </button>

          <button
            id="btn-lancar-cobranca"
            type="button"
            onClick={() => {
              if (alunos.length > 0) setNovoAlunoId(alunos[0].id);
              setModalNovo(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs rounded-xl transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Lançar Cobrança</span>
          </button>
        </div>
      </div>

      {/* Cards de Resumo Financeiro */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold uppercase">
            <span>Recebido no Mês</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            {formatCurrencyBRL(totalRecebido)}
          </p>
          <span className="text-[11px] text-neutral-400">
            {pagamentos.filter((p) => p.status === 'pago').length} mensalidades quitadas
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold uppercase">
            <span>Pendente / Atrasado</span>
            <AlertCircle className="w-4 h-4 text-red-600" />
          </div>
          <p className="text-2xl font-black text-red-600 mt-1">
            {formatCurrencyBRL(totalPendente)}
          </p>
          <span className="text-[11px] text-neutral-400">
            {pagamentos.filter((p) => p.status !== 'pago').length} mensalidades em aberto
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold uppercase">
            <span>Taxa de Adimplência</span>
            <ShieldCheck className="w-4 h-4 text-neutral-900" />
          </div>
          <p className="text-2xl font-black text-neutral-900 mt-1">{taxaAdimplencia}%</p>
          <span className="text-[11px] text-neutral-400">
            Meta do Dojo: 95% de pontualidade
          </span>
        </div>
      </div>

      {/* Se a aba de auditoria estiver ativa, exibe o log de auditoria */}
      {abaAuditoria ? (
        <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-neutral-900">
                Histórico de Auditoria de Pagamentos (pagamentos_auditoria)
              </h2>
              <p className="text-xs text-neutral-500">
                Log imutável de todas as alterações de status e valores conforme requisito de segurança
              </p>
            </div>
            <span className="text-xs text-neutral-400 font-semibold">
              {auditoria.length} registros
            </span>
          </div>

          {auditoria.length === 0 ? (
            <p className="text-xs text-neutral-500 py-6 text-center">
              Nenhuma alteração registrada até o momento.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 text-neutral-600 uppercase font-bold border-b border-neutral-200">
                  <tr>
                    <th className="py-2.5 px-3">Data / Hora</th>
                    <th className="py-2.5 px-3">Alterado Por</th>
                    <th className="py-2.5 px-3">Status Anterior</th>
                    <th className="py-2.5 px-3">Status Novo</th>
                    <th className="py-2.5 px-3">Valor Anterior</th>
                    <th className="py-2.5 px-3">Valor Novo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {auditoria.map((item) => (
                    <tr key={item.id} className="hover:bg-neutral-50/70">
                      <td className="py-2.5 px-3 text-neutral-500 font-mono">
                        {new Date(item.alterado_em).toLocaleString('pt-BR')}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-neutral-900">
                        {item.perfil_autor?.nome_completo || 'Prof. Rogério'}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="capitalize text-neutral-500">
                          {item.status_anterior || '-'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="capitalize font-bold text-neutral-900">
                          {item.status_novo || '-'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-neutral-500">
                        {item.valor_anterior ? formatCurrencyBRL(item.valor_anterior) : '-'}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-neutral-900">
                        {item.valor_novo ? formatCurrencyBRL(item.valor_novo) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Lista Normal de Mensalidades */
        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-4">
          {/* Barra de Filtros */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-0.5">
                  Mês de Referência
                </label>
                <input
                  type="month"
                  value={mesFiltro}
                  onChange={(e) => setMesFiltro(e.target.value)}
                  className="py-1.5 px-2.5 text-xs font-semibold rounded-xl border border-neutral-300 outline-none text-neutral-800"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-0.5">
                  Status
                </label>
                <select
                  value={statusFiltro}
                  onChange={(e) => setStatusFiltro(e.target.value)}
                  className="py-1.5 px-2.5 text-xs font-semibold rounded-xl border border-neutral-300 outline-none bg-white text-neutral-800"
                >
                  <option value="todos">Todos</option>
                  <option value="pago">Apenas Pagos</option>
                  <option value="pendente">Apenas Pendentes</option>
                  <option value="atrasado">Apenas Atrasados</option>
                </select>
              </div>
            </div>

            <div className="text-xs text-neutral-500">
              Exibindo <span className="font-bold text-neutral-900">{pagamentosFiltrados.length}</span> registros de {formatMonthYearBR(mesFiltro)}
            </div>
          </div>

          {/* Tabela de Pagamentos */}
          {isLoading ? (
            <SkeletonList count={4} />
          ) : pagamentosFiltrados.length === 0 ? (
            <EmptyState
              icon={CreditCard}
              title="Nenhuma mensalidade neste mês"
              description="Não encontramos registros de cobrança para o filtro informado. Lance uma mensalidade para seus alunos."
              actionLabel="Lançar Cobrança"
              onAction={() => setModalNovo(true)}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 text-neutral-600 uppercase font-bold border-b border-neutral-200">
                  <tr>
                    <th className="py-3 px-3">Guerreiro / Aluno</th>
                    <th className="py-3 px-3">Referência</th>
                    <th className="py-3 px-3">Valor</th>
                    <th className="py-3 px-3">Vencimento</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Método</th>
                    <th className="py-3 px-3 text-right">Ação Rápida</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {pagamentosFiltrados.map((pag) => (
                    <tr key={pag.id} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={
                              pag.aluno?.profile?.foto_url ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80'
                            }
                            alt=""
                            className="w-8 h-8 rounded-full object-cover border border-neutral-200"
                          />
                          <div>
                            <span className="font-bold text-neutral-900 block line-clamp-1">
                              {pag.aluno?.profile?.nome_completo || 'Aluno'}
                            </span>
                            <span className="text-[11px] text-neutral-400">
                              {pag.aluno?.profile?.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-neutral-700">
                        {pag.mes_referencia}
                      </td>
                      <td className="py-3.5 px-3 font-black text-neutral-900 text-sm">
                        {formatCurrencyBRL(pag.valor)}
                      </td>
                      <td className="py-3.5 px-3 text-neutral-500">
                        {formatDateBR(pag.data_vencimento)}
                      </td>
                      <td className="py-3.5 px-3">
                        <StatusIndicator status={pag.status} size="sm" />
                      </td>
                      <td className="py-3.5 px-3 text-neutral-600 uppercase font-medium">
                        {pag.metodo || '-'}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        {pag.status !== 'pago' ? (
                          <button
                            type="button"
                            onClick={() => marcarComoPago({ pagamentoId: pag.id })}
                            disabled={isMarcandoPago}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-lg transition-all shadow-xs"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Marcar como Pago</span>
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-emerald-700 text-xs font-bold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Quitado</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODAL: LANÇAR NOVA COBRANÇA */}
      <Modal
        isOpen={modalNovo}
        onClose={() => setModalNovo(false)}
        title="Lançar Cobrança de Mensalidade"
        description="Selecione o aluno e o mês de competência para gerar a cobrança no sistema."
      >
        <form onSubmit={handleCreatePagamento} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-neutral-700 mb-1">
              Aluno da BJJ College *
            </label>
            <select
              value={novoAlunoId}
              onChange={(e) => setNovoAlunoId(e.target.value)}
              className="w-full p-2.5 text-sm rounded-xl border border-neutral-300 bg-white font-medium outline-none focus:ring-2 focus:ring-red-600"
              required
            >
              <option value="">Selecione um aluno...</option>
              {alunos.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.profile?.nome_completo} ({a.profile?.email})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-neutral-700 mb-1">
                Mês Competência *
              </label>
              <input
                type="month"
                value={novoMesRef}
                onChange={(e) => setNovoMesRef(e.target.value)}
                className="w-full p-2.5 text-sm rounded-xl border border-neutral-300 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-neutral-700 mb-1">
                Valor (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                value={novoValor}
                onChange={(e) => setNovoValor(e.target.value)}
                className="w-full p-2.5 text-sm rounded-xl border border-neutral-300 outline-none font-bold"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-neutral-700 mb-1">
                Data Vencimento *
              </label>
              <input
                type="date"
                value={novoVencimento}
                onChange={(e) => setNovoVencimento(e.target.value)}
                className="w-full p-2.5 text-sm rounded-xl border border-neutral-300 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-neutral-700 mb-1">
                Status *
              </label>
              <select
                value={novoStatus}
                onChange={(e) => setNovoStatus(e.target.value as StatusPagamento)}
                className="w-full p-2.5 text-sm rounded-xl border border-neutral-300 bg-white font-medium outline-none"
              >
                <option value="pendente">Pendente</option>
                <option value="pago">Pago</option>
                <option value="atrasado">Atrasado</option>
              </select>
            </div>
          </div>

          {novoStatus === 'pago' && (
            <div>
              <label className="block text-xs font-bold uppercase text-neutral-700 mb-1">
                Método de Pagamento
              </label>
              <select
                value={novoMetodo}
                onChange={(e) => setNovoMetodo(e.target.value as MetodoPagamento)}
                className="w-full p-2.5 text-sm rounded-xl border border-neutral-300 bg-white font-medium outline-none"
              >
                <option value="pix">PIX</option>
                <option value="dinheiro">Dinheiro</option>
                <option value="cartao">Cartão</option>
                <option value="transferencia">Transferência</option>
              </select>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
            <button
              type="button"
              onClick={() => setModalNovo(false)}
              className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isRegistrando}
              className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs"
            >
              {isRegistrando ? 'Salvando...' : 'Lançar Pagamento'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export const AdminPagamentos: React.FC = () => {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return <Navigate to="/aluno" replace />;
  }

  return <AdminPagamentosView />;
};

export default AdminPagamentos;
