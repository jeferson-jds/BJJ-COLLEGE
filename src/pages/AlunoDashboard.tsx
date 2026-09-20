import React, { useState, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useAlunos } from '../hooks/useAlunos';
import { usePagamentos } from '../hooks/usePagamentos';
import { useAvisos } from '../hooks/useAvisos';
import { useConfiguracoes } from '../hooks/useConfiguracoes';
import { useCheckInsDoAluno } from '../hooks/useCheckIn';
import { FaixaBadge } from '../components/FaixaBadge';
import { StatusIndicator } from '../components/StatusIndicator';
import { SkeletonList } from '../components/SkeletonLoader';
import { formatCurrencyBRL, formatDateBR } from '../lib/utils';
import { FaixaBJJ } from '../types/database';
import {
  ShieldCheck,
  CreditCard,
  QrCode,
  Copy,
  Check,
  Megaphone,
  Award,
  Calendar,
  AlertTriangle,
  Flame,
  BookOpen,
  History,
  TrendingUp,
  Clock,
  Sparkles,
  Lock,
  CheckCircle2,
  AlertCircle,
  Activity,
} from 'lucide-react';
import { toast } from 'sonner';

const PROXIMA_FAIXA: Record<string, string> = {
  branca: 'Faixa Azul',
  azul: 'Faixa Roxa',
  roxa: 'Faixa Marrom',
  marrom: 'Faixa Preta',
  preta: 'Novo Grau na Preta',
};

const FAIXA_NOMES: Record<string, string> = {
  branca: 'Faixa Branca',
  azul: 'Faixa Azul',
  roxa: 'Faixa Roxa',
  marrom: 'Faixa Marrom',
  preta: 'Faixa Preta',
};

export const AlunoDashboard: React.FC = () => {
  const { user, profile, alunoData: authAlunoData } = useAuth();
  const { useGraduacoesByAluno, useAlunoById } = useAlunos();
  const { data: freshAluno } = useAlunoById(authAlunoData?.id);
  const { config } = useConfiguracoes();
  const { avisos } = useAvisos();
  const [copiedPix, setCopiedPix] = useState(false);

  // Localiza com segurança e privacidade o cadastro deste aluno específico
  const currentAluno = useMemo(() => {
    return freshAluno || authAlunoData || null;
  }, [freshAluno, authAlunoData]);

  const { data: graduacoes = [] } = useGraduacoesByAluno(currentAluno?.id);
  const { usePagamentosByAlunoId } = usePagamentos();
  const { data: pagamentos = [], isLoading: loadingPagamentos } = usePagamentosByAlunoId(
    currentAluno?.id
  );
  const { data: checkIns = [] } = useCheckInsDoAluno(currentAluno?.id);

  // 1. MÉTRICA: Seus Treinos no Mês
  const mesAtualFormat = useMemo(() => new Date().toISOString().slice(0, 7), []);
  const treinosEsteMes = useMemo(() => {
    return checkIns.filter((c) => c.data && c.data.startsWith(mesAtualFormat)).length;
  }, [checkIns, mesAtualFormat]);

  const treinosExibidos = treinosEsteMes > 0 ? treinosEsteMes : (currentAluno?.total_treinos ? Math.min(currentAluno.total_treinos, 12) : 0);
  const metaMensal = 12; // 3x por semana sugeridos
  const percMeta = Math.min(100, Math.round((treinosExibidos / metaMensal) * 100));
  const totalTreinosAcumulado = currentAluno?.total_treinos || (checkIns.length > 0 ? checkIns.length : treinosExibidos);

  // 2. MÉTRICA: Sua Próxima Graduação
  const grausAtuais = currentAluno?.graus || 0;
  const faixaAtual = (currentAluno?.faixa_atual as FaixaBJJ) || 'branca';

  const dataInicioOuGrad = currentAluno?.data_graduacao || currentAluno?.data_inicio;
  const mesesNaFaixa = useMemo(() => {
    if (!dataInicioOuGrad) return 1;
    const data = new Date(dataInicioOuGrad);
    const diffTime = Math.abs(new Date().getTime() - data.getTime());
    const diffMonths = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30.44));
    return Math.max(1, diffMonths);
  }, [dataInicioOuGrad]);

  const proximoPasso = useMemo(() => {
    if (grausAtuais < 4) {
      return {
        tipo: 'grau' as const,
        titulo: `${grausAtuais + 1}º Grau`,
        alvo: FAIXA_NOMES[faixaAtual] || 'Faixa Atual',
        detalhe: `Faltam ${4 - grausAtuais} ${4 - grausAtuais === 1 ? 'grau' : 'graus'} para a próxima faixa`,
      };
    } else {
      return {
        tipo: 'faixa' as const,
        titulo: 'Exame de Faixa',
        alvo: PROXIMA_FAIXA[faixaAtual] || 'Próxima Faixa',
        detalhe: '4 graus completos! Apto para avaliação técnica com o mestre',
      };
    }
  }, [grausAtuais, faixaAtual]);

  // 3. MÉTRICA: Status da Sua Mensalidade (Estritamente Pessoal)
  const ultimaMensalidade = pagamentos.length > 0 ? pagamentos[0] : null;
  const statusAtual = ultimaMensalidade ? ultimaMensalidade.status : 'pago';
  const isEmDia = statusAtual === 'pago';
  const valorIndividual = ultimaMensalidade?.valor || config.valor_mensalidade || 180;
  const dataVencimentoIndividual =
    ultimaMensalidade?.data_vencimento ||
    new Date(new Date().getFullYear(), new Date().getMonth(), 10).toISOString().split('T')[0];

  const handleCopyPix = () => {
    if (!config.chave_pix) return;
    navigator.clipboard.writeText(config.chave_pix);
    setCopiedPix(true);
    toast.success('Chave PIX copiada! Abra o aplicativo do seu banco para transferir.');
    setTimeout(() => setCopiedPix(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-24 md:pb-8">
      {/* 1. CARD PRINCIPAL DO ALUNO: IDENTIDADE FAMÍLIA GORILLAZ */}
      <div className="bg-[#0c0c0c] text-white p-6 sm:p-8 rounded-3xl shadow-2xl border border-red-900/40 relative overflow-hidden">
        {/* Glow de fundo */}
        <div
          className={`absolute -right-16 -bottom-16 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none ${
            isEmDia ? 'bg-emerald-500' : 'bg-red-600'
          }`}
        />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="relative shrink-0">
              <img
                src={
                  profile?.foto_url ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80'
                }
                alt={profile?.nome_completo || 'Aluno BJJ'}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-red-600 shadow-md"
              />
              <div
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#0c0c0c] ${
                  currentAluno?.ativo ? 'bg-emerald-500' : 'bg-neutral-600'
                }`}
                title={currentAluno?.ativo ? 'Matrícula Ativa' : 'Matrícula Inativa'}
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] uppercase font-bold tracking-widest text-red-500 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Família Gorillaz Jiu-Jitsu
                </span>
                <span
                  className={`text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full border ${
                    currentAluno?.ativo
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                  }`}
                >
                  {currentAluno?.ativo ? 'Matrícula Ativa' : 'Matrícula Inativa'}
                </span>
              </div>

              <h1 className="font-['Oswald',sans-serif] font-semibold text-2xl sm:text-3xl uppercase tracking-wide text-white mt-1">
                {profile?.nome_completo || user?.nome_completo || 'Atleta BJJ'}
              </h1>

              <div className="flex flex-wrap items-center gap-3 mt-2">
                <FaixaBadge faixa={faixaAtual} size="md" />
                <span className="text-xs text-neutral-400">
                  Professor Responsável: <strong className="text-white">Prof. {config.nome_professor || 'Rogério'}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Selo de Acesso Privado e Seguro */}
          <div className="bg-neutral-900/90 border border-neutral-800/80 p-3.5 rounded-2xl flex items-center gap-3 shrink-0 sm:self-center">
            <div className="w-9 h-9 rounded-xl bg-red-950/60 border border-red-800/40 flex items-center justify-center text-red-500">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-white uppercase tracking-wider font-['Oswald',sans-serif]">
                Painel do Aluno
              </p>
              <p className="text-[10px] text-neutral-400">
                Acesso individual e confidencial
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. OS 3 BLOCOS EXCLUSIVOS DO ALUNO (SUBSTITUINDO RESUMO FINANCEIRO & INADIMPLENTES DA ACADEMIA) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* CARD 1: SEUS TREINOS NO MÊS */}
        <div
          id="card-seus-treinos-mes"
          className="bg-[#111111] p-5 sm:p-6 rounded-2xl border border-neutral-800/80 shadow-lg hover:border-red-900/50 transition-all space-y-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-bold tracking-wider text-neutral-400 font-['Oswald',sans-serif]">
              Seus Treinos no Mês
            </span>
            <div className="w-8 h-8 rounded-xl bg-red-950/50 text-red-500 flex items-center justify-center border border-red-900/40">
              <Flame className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-['Oswald',sans-serif] font-bold text-3xl sm:text-4xl text-white tracking-tight">
                {treinosExibidos}
              </span>
              <span className="text-xs font-semibold text-neutral-400 uppercase">
                {treinosExibidos === 1 ? 'Presença' : 'Presenças no tatame'}
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Meta recomendada: <strong className="text-neutral-200">{metaMensal} treinos</strong> ({percMeta}%)
            </p>
          </div>

          {/* Barra de Progresso Mensal */}
          <div className="space-y-1.5">
            <div className="w-full bg-neutral-900 h-2.5 rounded-full overflow-hidden border border-neutral-800">
              <div
                className="bg-gradient-to-r from-red-700 to-red-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${percMeta}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-neutral-400 font-medium">
              <span>Ritmo: {treinosExibidos >= 10 ? '🔥 Excelente' : treinosExibidos >= 6 ? '🥋 Regular' : '⚡ Em evolução'}</span>
              <span>Total histórico: {totalTreinosAcumulado}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400">
            <span className="flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-red-500" />
              Check-in com 1 toque no dojo
            </span>
            <span className="text-neutral-300 font-medium">Oss!</span>
          </div>
        </div>

        {/* CARD 2: SUA PRÓXIMA GRADUAÇÃO */}
        <div
          id="card-sua-proxima-graduacao"
          className="bg-[#111111] p-5 sm:p-6 rounded-2xl border border-neutral-800/80 shadow-lg hover:border-amber-900/50 transition-all space-y-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-bold tracking-wider text-neutral-400 font-['Oswald',sans-serif]">
              Sua Próxima Graduação
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-950/40 text-amber-500 flex items-center justify-center border border-amber-900/40">
              <Award className="w-4 h-4" />
            </div>
          </div>

          <div>
            <span className="text-[11px] uppercase font-bold text-amber-400 tracking-wider block">
              Próximo Marco
            </span>
            <h3 className="font-['Oswald',sans-serif] font-bold text-2xl sm:text-3xl text-white tracking-tight">
              {proximoPasso.titulo}
            </h3>
            <p className="text-xs text-neutral-300 mt-1 font-medium">
              {proximoPasso.alvo}
            </p>
          </div>

          {/* Visual dos 4 Graus (Tarja Preta BJJ) */}
          <div className="bg-black/60 p-2.5 rounded-xl border border-neutral-800 flex items-center justify-between gap-2">
            <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
              Graus: {grausAtuais} de 4
            </span>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4].map((index) => {
                const conquistado = index <= grausAtuais;
                const isNext = index === grausAtuais + 1;
                return (
                  <div
                    key={index}
                    title={`${index}º Grau ${conquistado ? 'Conquistado' : isNext ? 'Próximo alvo' : 'Pendente'}`}
                    className={`h-5 w-2 rounded-xs transition-all ${
                      conquistado
                        ? 'bg-white shadow-[0_0_6px_rgba(255,255,255,0.7)]'
                        : isNext
                        ? 'bg-amber-500/40 border border-amber-500 border-dashed animate-pulse'
                        : 'bg-neutral-800'
                    }`}
                  />
                );
              })}
            </div>
          </div>

          <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              {mesesNaFaixa} {mesesNaFaixa === 1 ? 'mês' : 'meses'} na faixa
            </span>
            <span className="text-neutral-300 font-medium">Avaliado pelo Mestre</span>
          </div>
        </div>

        {/* CARD 3: STATUS DA SUA MENSALIDADE */}
        <div
          id="card-status-sua-mensalidade"
          className="bg-[#111111] p-5 sm:p-6 rounded-2xl border border-neutral-800/80 shadow-lg hover:border-neutral-700 transition-all space-y-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-bold tracking-wider text-neutral-400 font-['Oswald',sans-serif]">
              Status da Sua Mensalidade
            </span>
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
                isEmDia
                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
                  : 'bg-red-950/40 text-red-500 border-red-800/40'
              }`}
            >
              <CreditCard className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <span className="font-['Oswald',sans-serif] font-bold text-2xl sm:text-3xl text-white tracking-tight">
                {formatCurrencyBRL(valorIndividual)}
              </span>
              <StatusIndicator status={statusAtual} size="md" />
            </div>

            <p className="text-xs text-neutral-400 mt-1">
              {isEmDia ? (
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Mensalidade regularizada no tatame
                </span>
              ) : (
                <span className="text-red-400 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Venceu em {formatDateBR(dataVencimentoIndividual)}
                </span>
              )}
            </p>
          </div>

          {/* Botão de Cópia Rápida PIX Integrado */}
          <button
            type="button"
            onClick={handleCopyPix}
            className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold font-['Oswald',sans-serif] uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
              copiedPix
                ? 'bg-emerald-600 text-white'
                : 'bg-neutral-800 hover:bg-red-600 text-white border border-neutral-700 hover:border-red-600'
            }`}
          >
            {copiedPix ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Chave PIX Copiada</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Chave PIX</span>
              </>
            )}
          </button>

          <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[10px] text-neutral-500">
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-500" />
              100% privado e seguro
            </span>
            <span>Exclusivo do seu login</span>
          </div>
        </div>
      </div>

      {/* 3. BLOCO PIX DE PAGAMENTO RÁPIDO */}
      <div className="bg-[#111111] p-6 rounded-2xl border border-neutral-800 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-950/50 text-red-500 flex items-center justify-center border border-red-900/40">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold font-['Oswald',sans-serif] uppercase text-white tracking-wide">
                Pagamento via PIX • BJJ College
              </h2>
              <p className="text-xs text-neutral-400">
                Pague sua mensalidade e mantenha seu ritmo ativo de treinos com o Prof. {config.nome_professor || 'Rogério'}
              </p>
            </div>
          </div>

          <span className="text-xs font-bold text-white bg-neutral-900 border border-neutral-800 px-3.5 py-1.5 rounded-xl self-start sm:self-auto font-mono">
            {formatCurrencyBRL(valorIndividual)} / mês
          </span>
        </div>

        {/* Chave PIX com botão Copiar */}
        <div className="bg-black/50 p-4 rounded-xl border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
              Chave PIX Oficial (BJJ College • Prof. {config.nome_professor || 'Rogério'})
            </span>
            <span className="font-mono text-xs sm:text-sm font-bold text-red-400 break-all select-all">
              {config.chave_pix || 'contato@bjjcollege.com'}
            </span>
          </div>

          <button
            id="btn-copiar-pix-aluno"
            type="button"
            onClick={handleCopyPix}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-bold font-['Oswald',sans-serif] uppercase tracking-wider rounded-xl transition-all shadow-md shrink-0 cursor-pointer"
          >
            {copiedPix ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Chave Copiada!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-white" />
                <span>Copiar Chave PIX</span>
              </>
            )}
          </button>
        </div>

        <p className="text-[11px] text-neutral-400 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Após a transferência via PIX, o Prof. {config.nome_professor || 'Rogério'} confirma a baixa no sistema com recibo digital auditado.</span>
        </p>
      </div>

      {/* 4. RECADOS DO PROFESSOR */}
      <div className="bg-[#111111] p-6 rounded-2xl border border-neutral-800 shadow-md space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-neutral-800/80">
          <Megaphone className="w-5 h-5 text-red-500" />
          <div>
            <h2 className="text-base font-bold font-['Oswald',sans-serif] uppercase text-white tracking-wide">
              Mural do Prof. {config.nome_professor || 'Rogério'}
            </h2>
            <p className="text-xs text-neutral-400">
              Comunicados e avisos oficiais da Família Gorillaz
            </p>
          </div>
        </div>

        {avisos.filter((a) => a.ativo).length === 0 ? (
          <div className="p-8 text-center bg-black/30 rounded-xl border border-neutral-800">
            <img
              src="/images/professor.jpg"
              alt={`Prof. ${config.nome_professor || 'Rogério'}`}
              className="w-12 h-12 rounded-full border-2 border-red-600 object-cover mx-auto mb-2 opacity-80"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80';
              }}
            />
            <p className="text-xs font-medium text-neutral-400">
              Nenhum recado no momento. Mantenha o foco nos treinos!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {avisos
              .filter((a) => a.ativo)
              .map((aviso) => (
                <div
                  key={aviso.id}
                  className="p-4 rounded-xl bg-black/40 border border-neutral-800/90 space-y-2"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src="/images/professor.jpg"
                        alt={`Prof. ${config.nome_professor || 'Rogério'}`}
                        className="w-9 h-9 rounded-full border border-red-600 object-cover shrink-0"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80';
                        }}
                      />
                      <div>
                        <h3 className="text-sm font-bold text-white leading-tight">
                          {aviso.titulo}
                        </h3>
                        <p className="text-[11px] text-neutral-400">
                          Prof. {config.nome_professor || 'Rogério'}
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] text-neutral-400 font-medium shrink-0">
                      {formatDateBR(aviso.created_at)}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-300 whitespace-pre-line leading-relaxed pl-11">
                    {aviso.conteudo}
                  </p>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* 5. GRID: MINHA JORNADA DE FAIXAS & HISTÓRICO DE MENSALIDADES (ESTRITAMENTE PESSOAIS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Minha Jornada de Faixas */}
        <div className="bg-[#111111] p-6 rounded-2xl border border-neutral-800 shadow-md space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-neutral-800/80">
            <Award className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold font-['Oswald',sans-serif] uppercase text-white tracking-wide">
              Minha Jornada de Faixas
            </h2>
          </div>

          {graduacoes.length === 0 ? (
            <div className="p-6 text-center bg-black/30 rounded-xl border border-neutral-800">
              <p className="text-xs text-neutral-400">
                Você está na sua faixa inicial. Mantenha a disciplina no tatame para sua primeira promoção!
              </p>
            </div>
          ) : (
            <div className="relative pl-6 border-l-2 border-neutral-800 space-y-5 my-2">
              {graduacoes.map((g) => (
                <div key={g.id} className="relative">
                  <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-red-600 border-2 border-[#111111] ring-2 ring-red-900" />
                  <div className="flex items-center justify-between">
                    <FaixaBadge faixa={g.faixa} size="sm" />
                    <span className="text-xs text-neutral-400 font-medium font-mono">
                      {formatDateBR(g.data)}
                    </span>
                  </div>
                  {g.observacoes && (
                    <p className="text-xs text-neutral-300 mt-1 italic">"{g.observacoes}"</p>
                  )}
                  <p className="text-[10px] text-neutral-400 mt-0.5">
                    Professor: {g.professor?.nome_completo || `Prof. ${config.nome_professor || 'Rogério'}`}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Histórico Individual de Mensalidades */}
        <div className="bg-[#111111] p-6 rounded-2xl border border-neutral-800 shadow-md space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-800/80">
            <div className="flex items-center gap-2.5">
              <History className="w-5 h-5 text-neutral-300" />
              <h2 className="text-base font-bold font-['Oswald',sans-serif] uppercase text-white tracking-wide">
                Histórico de Mensalidades
              </h2>
            </div>
            <span className="text-[10px] uppercase font-bold text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
              Seus Pagamentos
            </span>
          </div>

          {loadingPagamentos ? (
            <SkeletonList count={2} />
          ) : pagamentos.length === 0 ? (
            <div className="p-6 text-center bg-black/30 rounded-xl border border-neutral-800">
              <p className="text-xs text-neutral-400">
                Nenhuma mensalidade lançada para seu cadastro ainda.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-800">
              {pagamentos.map((p) => (
                <div key={p.id} className="py-3 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block font-mono">
                      Ref: {p.mes_referencia}
                    </span>
                    <span className="text-[11px] text-neutral-400">
                      Venc: {formatDateBR(p.data_vencimento)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-white block font-mono">
                      {formatCurrencyBRL(p.valor)}
                    </span>
                    <StatusIndicator status={p.status} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 6. CÓDIGO DE HONRA DA FAMÍLIA GORILLAZ */}
      <div className="bg-[#0c0c0c] text-neutral-300 p-5 rounded-2xl border border-red-900/30 text-xs space-y-2">
        <div className="flex items-center gap-2 text-white font-bold text-sm font-['Oswald',sans-serif] uppercase tracking-wide">
          <BookOpen className="w-4 h-4 text-red-500" />
          <span>Código de Honra do BJJ College • Família Gorillaz</span>
        </div>
        <p className="leading-relaxed text-neutral-400">
          1. Respeite os companheiros de treino e a hierarquia do tatame. Cumprimente o mestre com "Oss" ao entrar e sair.
          2. Mantenha seu kimono limpo e unhas aparadas para segurança de todos.
          3. O Jiu-Jitsu ensina disciplina, humildade e resiliência. A técnica supera a força bruta.
        </p>
      </div>
    </div>
  );
};
