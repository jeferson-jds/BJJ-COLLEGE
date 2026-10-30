import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAlunos } from '../hooks/useAlunos';
import { usePagamentos } from '../hooks/usePagamentos';
import { useAvisos } from '../hooks/useAvisos';
import { useConfiguracoes } from '../hooks/useConfiguracoes';
import { AlunoDashboard } from './AlunoDashboard';
import { FaixaBadge } from '../components/FaixaBadge';
import { StatusIndicator } from '../components/StatusIndicator';
import { SkeletonList } from '../components/SkeletonLoader';
import { GraduacaoModal } from '../components/GraduacaoModal';
import { NovoAlunoModal } from '../components/NovoAlunoModal';
import { CheckInModule } from '../components/CheckInModule';
import { Aluno } from '../types/database';
import { formatCurrencyBRL, formatDateBR } from '../lib/utils';
import {
  Users,
  AlertTriangle,
  Award,
  UserPlus,
  CreditCard,
  Megaphone,
  ArrowRight,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Camera,
} from 'lucide-react';

// Componente interno com todos os hooks exclusivos do Professor/Admin
const AdminDashboardView: React.FC = () => {
  const {
    alunos,
    isLoading: loadingAlunos,
    createAluno,
    isCreating,
    graduarAluno,
    isGraduando,
  } = useAlunos();
  const { pagamentos, isLoading: loadingPagamentos, marcarComoPago } = usePagamentos(undefined, {
    enabled: true,
  });
  const { avisos } = useAvisos();
  const { data: config } = useConfiguracoes();

  const [alunoParaGraduar, setAlunoParaGraduar] = useState<Aluno | null>(null);
  const [modalNovoAluno, setModalNovoAluno] = useState(false);

  // Data formatada em português (ex: "Segunda-feira, 12 de setembro")
  const dataFormatada = useMemo(() => {
    const hoje = new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(new Date());
    return hoje.charAt(0).toUpperCase() + hoje.slice(1);
  }, []);

  const nomeProfessor = config?.nome_professor || 'Rogério';
  const displayTitle = `BEM-VINDO, PROF. ${nomeProfessor.toUpperCase()}`;

  if (loadingAlunos || loadingPagamentos) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SkeletonList count={4} />
      </div>
    );
  }

  // Cálculos dos 3 cards estatísticos
  const totalAlunos = alunos.length;
  const alunosAtivos = alunos.filter((a) => a.ativo).length;

  // Inadimplentes: alunos com pagamentos 'atrasado' ou 'pendente' vencido
  const pagamentosInadimplentes = pagamentos.filter(
    (p) => p.status === 'atrasado' || (p.status === 'pendente' && new Date(p.data_vencimento) < new Date())
  );
  const totalInadimplentes = new Set(pagamentosInadimplentes.map((p) => p.aluno_id)).size;
  const valorTotalAtrasado = pagamentosInadimplentes.reduce((acc, curr) => acc + Number(curr.valor), 0);

  // Graduações próximas (alunos com mais de 12 meses na faixa atual ou faixa branca ativa >= 6 meses)
  const agora = new Date().getTime();
  const graduacoesProximas = alunos
    .filter((a) => {
      if (!a.ativo) return false;
      const dataRef = a.data_graduacao ? new Date(a.data_graduacao).getTime() : new Date(a.data_inicio).getTime();
      const mesesNaFaixa = (agora - dataRef) / (1000 * 60 * 60 * 24 * 30);
      return a.faixa_atual === 'branca' ? mesesNaFaixa >= 6 : mesesNaFaixa >= 12;
    })
    .slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-20 md:pb-6">
      {/* 1. CARD DE BOAS-VINDAS FAMÍLIA GORILLAZ */}
      <div className="relative overflow-hidden bg-gorillaz-gradient p-6 sm:p-8 rounded-2xl text-white shadow-2xl border border-red-900/40">
        {/* Glow de fundo */}
        <div className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full bg-red-600/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Foto circular do professor (80x80) com border-4 border-red-600 e box-shadow vermelho */}
            <div className="relative shrink-0">
              <img
                src="/images/professor.jpg"
                alt={`Prof. ${nomeProfessor}`}
                className="w-20 h-20 rounded-full border-4 border-red-600 object-cover shadow-red-glow"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/images/logo-gorillaz.jpg';
                }}
              />
            </div>

            <div>
              {/* Badge pequena vermelha "LÍDER DA FAMÍLIA GORILLAZ" no topo */}
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-red-600/20 text-red-400 border border-red-500/40 shadow-xs">
                  ★ LÍDER DA FAMÍLIA GORILLAZ ★
                </span>
              </div>

              {/* Título BEM-VINDO, PROF. ROGÉRIO em Oswald 700 */}
              <h1 className="font-['Oswald',sans-serif] font-bold text-2xl sm:text-3xl lg:text-4xl text-white tracking-wide uppercase mt-1 drop-shadow-[0_2px_8px_rgba(220,38,38,0.4)]">
                {displayTitle}
              </h1>

              <p className="text-xs sm:text-sm text-neutral-300 font-medium mt-1">
                📅 {dataFormatada} • Gestão Completa do Tatame BJJ College
              </p>
            </div>
          </div>

          {/* Botões à direita: Matricular Aluno, Acervo Histórico e Mensalidades */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              id="btn-novo-aluno-header"
              onClick={() => setModalNovoAluno(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-bold font-['Oswald',sans-serif] uppercase tracking-wider rounded-xl transition-all shadow-red-glow hover:shadow-red-glow-lg cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Matricular Aluno</span>
            </button>
            <Link
              to="/historia"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-neutral-900/90 hover:bg-neutral-800 text-neutral-200 hover:text-white text-xs font-bold font-['Oswald',sans-serif] uppercase tracking-wider rounded-xl transition-all border border-neutral-700 hover:border-red-600 cursor-pointer"
            >
              <Camera className="w-4 h-4 text-red-500" />
              <span>Acervo Histórico</span>
            </Link>
            <Link
              id="btn-pagamentos-header"
              to="/admin/pagamentos"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-transparent hover:bg-white/10 text-white text-xs font-bold font-['Oswald',sans-serif] uppercase tracking-wider rounded-xl transition-all border border-white/40 hover:border-white cursor-pointer"
            >
              <CreditCard className="w-4 h-4 text-red-400" />
              <span>Mensalidades</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. CARDS DE ESTATÍSTICAS (3 CARDS ELEVADOS) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Total Alunos */}
        <Link
          to="/admin/alunos"
          className="bg-[#1a1a1a] p-5 rounded-2xl border border-[#2a2a2a] shadow-card hover:-translate-y-0.5 hover:shadow-red-glow transition-all duration-200 group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-xl bg-[#242424] flex items-center justify-center text-neutral-300 border border-[#333333] group-hover:bg-red-600 group-hover:text-white transition-colors">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                {alunosAtivos} ativos
              </span>
            </div>
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Total de Alunos
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-['Oswald',sans-serif] text-4xl font-bold text-white tracking-tight">
                {totalAlunos}
              </span>
              <span className="text-xs text-neutral-400">cadastrados no dojo</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#2a2a2a] flex items-center justify-between text-xs text-red-500 font-semibold group-hover:text-red-400">
            <span>Ver listagem completa →</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Card 2: Inadimplentes */}
        <Link
          to="/admin/pagamentos"
          className="bg-[#1a1a1a] p-5 rounded-2xl border border-[#2a2a2a] shadow-card hover:-translate-y-0.5 hover:shadow-red-glow transition-all duration-200 group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-xl bg-red-950/40 flex items-center justify-center text-red-500 border border-red-900/50 group-hover:bg-red-600 group-hover:text-white transition-colors">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-red-400 bg-red-600/20 px-2.5 py-0.5 rounded-full border border-red-500/30">
                Atenção
              </span>
            </div>
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Inadimplentes
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-['Oswald',sans-serif] text-4xl font-bold text-red-500 tracking-tight">
                {totalInadimplentes}
              </span>
              <span className="text-xs text-neutral-400">
                ({formatCurrencyBRL(valorTotalAtrasado)} pendente)
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#2a2a2a] flex items-center justify-between text-xs text-red-500 font-semibold group-hover:text-red-400">
            <span>Cobranças e baixa rápida →</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Card 3: Graduações Próximas */}
        <div className="bg-[#1a1a1a] p-5 rounded-2xl border border-[#2a2a2a] shadow-card hover:-translate-y-0.5 hover:shadow-red-glow transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
                <Award className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                {graduacoesProximas.length} aptos
              </span>
            </div>
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Graduações Próximas
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-['Oswald',sans-serif] text-4xl font-bold text-white tracking-tight">
                {graduacoesProximas.length}
              </span>
              <span className="text-xs text-neutral-400">alunos com tempo de faixa</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#2a2a2a] text-xs text-neutral-400">
            Tempo cumprido para avaliação técnica de graus/faixas
          </div>
        </div>
      </div>

      {/* 2.5. GESTÃO DE FREQUÊNCIA E CHECK-IN LEVE (TATAME DO PROFESSOR) */}
      <CheckInModule alunos={alunos} onOpenGraduar={(aluno) => setAlunoParaGraduar(aluno)} />

      {/* 3. GRID: ALUNOS PRONTOS PARA AVALIAÇÃO & MURAL DE AVISOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LISTA DE ALUNOS (Prontos para Avaliação de Faixa) */}
        <div className="bg-[#1a1a1a] p-5 sm:p-6 rounded-2xl border border-[#2a2a2a] shadow-card">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#2a2a2a]">
            <div className="flex items-center gap-2.5">
              <Award className="w-5 h-5 text-red-500" />
              <h2 className="font-['Oswald',sans-serif] font-semibold text-lg text-white uppercase tracking-wide">
                Alunos Prontos para Avaliação de Faixa
              </h2>
            </div>
            <Link
              to="/admin/alunos"
              className="text-xs text-red-500 hover:text-red-400 font-semibold"
            >
              Ver todos →
            </Link>
          </div>

          {graduacoesProximas.length === 0 ? (
            <div className="p-8 text-center bg-[#141414] rounded-xl border border-[#262626]">
              <Award className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
              <p className="text-xs text-neutral-400 font-medium">
                Nenhum aluno atingiu o tempo mínimo de faixa neste mês.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#262626]">
              {graduacoesProximas.map((aluno) => (
                <div
                  key={aluno.id}
                  className="py-3 px-2 -mx-2 rounded-xl hover:bg-[#222222] transition-colors flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    {/* Foto circular (40x40) com borda vermelha */}
                    <img
                      src={
                        aluno.profile?.foto_url ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                      }
                      alt={aluno.profile?.nome_completo || 'Aluno'}
                      className="w-10 h-10 rounded-full object-cover border-2 border-red-600 shrink-0"
                    />
                    <div>
                      {/* Nome em branco semibold */}
                      <p className="text-sm font-semibold text-white leading-tight">
                        {aluno.profile?.nome_completo || 'Aluno BJJ'}
                      </p>
                      {/* Desde DD/MM/YYYY em cinza pequeno */}
                      <p className="text-xs text-neutral-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-neutral-500" />
                        <span>Desde {formatDateBR(aluno.data_graduacao || aluno.data_inicio)}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {/* Badge da faixa com cor correta e graus */}
                    <FaixaBadge faixa={aluno.faixa_atual} graus={aluno.graus || 0} size="sm" showGrausText />
                    {/* Botão Graduar funcional que abre o modal de graduação */}
                    <button
                      type="button"
                      id={`btn-graduar-card-${aluno.id}`}
                      onClick={() => setAlunoParaGraduar(aluno)}
                      className="px-3 py-1 text-xs font-bold font-['Oswald',sans-serif] uppercase tracking-wider text-white bg-red-600 hover:bg-red-500 rounded-lg shadow-sm shadow-red-950/50 transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>Graduar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MURAL DE AVISOS */}
        <div className="bg-[#1a1a1a] p-5 sm:p-6 rounded-2xl border border-[#2a2a2a] shadow-card">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#2a2a2a]">
            <div className="flex items-center gap-2.5">
              <Megaphone className="w-5 h-5 text-red-500" />
              <h2 className="font-['Oswald',sans-serif] font-semibold text-lg text-white uppercase tracking-wide">
                Mural de Avisos da BJJ College
              </h2>
            </div>
            {/* Botão Gerenciar no topo direito em vermelho */}
            <Link
              to="/admin/avisos"
              className="px-3 py-1 text-xs font-bold font-['Oswald',sans-serif] uppercase tracking-wider bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all shadow-xs"
            >
              Gerenciar
            </Link>
          </div>

          <div className="space-y-3">
            {avisos.slice(0, 3).map((aviso) => (
              <div
                key={aviso.id}
                className="p-3.5 rounded-xl bg-[#141414] border border-[#262626] hover:border-red-900/50 transition-colors space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Megaphone className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    <h3 className="text-xs font-semibold text-white leading-snug">
                      {aviso.titulo}
                    </h3>
                  </div>
                  <span className="text-[10px] text-neutral-400 font-medium shrink-0">
                    {formatDateBR(aviso.created_at)}
                  </span>
                </div>
                <p className="text-xs text-neutral-300 line-clamp-2 leading-relaxed pl-5">
                  {aviso.conteudo}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. ÚLTIMAS MENSALIDADES REGISTRADAS */}
      <div className="bg-[#1a1a1a] p-5 sm:p-6 rounded-2xl border border-[#2a2a2a] shadow-card">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#2a2a2a]">
          <div>
            <h2 className="font-['Oswald',sans-serif] font-semibold text-lg text-white uppercase tracking-wide">
              Últimas Mensalidades Registradas
            </h2>
            <p className="text-xs text-neutral-400">
              1 clique para dar baixa rápida com auditoria automática do Professor
            </p>
          </div>
          <Link
            to="/admin/pagamentos"
            className="text-xs text-red-500 hover:text-red-400 font-semibold"
          >
            Ver todas →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#141414] text-neutral-400 uppercase font-bold border-b border-[#2a2a2a]">
              <tr>
                <th className="py-2.5 px-3">Aluno</th>
                <th className="py-2.5 px-3">Mês Ref.</th>
                <th className="py-2.5 px-3">Valor</th>
                <th className="py-2.5 px-3">Vencimento</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262626]">
              {pagamentos.slice(0, 5).map((pag) => (
                <tr key={pag.id} className="hover:bg-[#222222] transition-colors">
                  <td className="py-3 px-3 font-semibold text-white">
                    {pag.aluno?.profile?.nome_completo || 'Aluno'}
                  </td>
                  <td className="py-3 px-3 text-neutral-300">{pag.mes_referencia}</td>
                  <td className="py-3 px-3 font-bold text-white">
                    {formatCurrencyBRL(pag.valor)}
                  </td>
                  <td className="py-3 px-3 text-neutral-400">
                    {formatDateBR(pag.data_vencimento)}
                  </td>
                  <td className="py-3 px-3">
                    <StatusIndicator status={pag.status} size="sm" />
                  </td>
                  <td className="py-3 px-3 text-right">
                    {pag.status !== 'pago' ? (
                      <button
                        type="button"
                        onClick={() => marcarComoPago({ pagamentoId: pag.id })}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-emerald-300 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 rounded-lg transition-colors cursor-pointer"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Marcar Pago</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-neutral-400 font-medium">Quitado</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE GRADUAÇÃO DO GUERREIRO */}
      <GraduacaoModal
        aluno={alunoParaGraduar}
        isOpen={!!alunoParaGraduar}
        onClose={() => setAlunoParaGraduar(null)}
        onGraduar={async (data) => {
          await graduarAluno(data);
          setAlunoParaGraduar(null);
        }}
        isSubmitting={isGraduando}
      />

      {/* MODAL DE MATRÍCULA DE NOVO ALUNO */}
      <NovoAlunoModal
        isOpen={modalNovoAluno}
        onClose={() => setModalNovoAluno(false)}
        onSubmit={async (data) => {
          await createAluno(data);
          setModalNovoAluno(false);
        }}
        isSubmitting={isCreating}
      />
    </div>
  );
};

// Componente principal exportado: proteção estrita de privacidade em tempo de execução
export const AdminDashboard: React.FC = () => {
  const { isAdmin } = useAuth();

  // Se o usuário logado for Aluno, renderiza imediatamente a visão do Aluno
  // e NENHUM hook ou busca de inadimplência/financeiro do Admin é executado
  if (!isAdmin) {
    return <AlunoDashboard />;
  }

  return <AdminDashboardView />;
};

export default AdminDashboard;
