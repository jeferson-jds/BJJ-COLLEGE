import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAlunos } from '../hooks/useAlunos';
import { usePagamentos } from '../hooks/usePagamentos';
import { useAvisos } from '../hooks/useAvisos';
import { useConfiguracoes } from '../hooks/useConfiguracoes';
import { useCheckInsDoAluno } from '../hooks/useCheckIn';
import { FaixaBadge } from '../components/FaixaBadge';
import { StatusIndicator } from '../components/StatusIndicator';
import { SkeletonList } from '../components/SkeletonLoader';
import { GraduacaoMountainMap } from '../components/GraduacaoMountainMap';
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
  Phone,
  Pin,
  Camera,
  Mountain,
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

  // Localiza com segurança o cadastro deste aluno específico
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

  const treinosExibidos =
    treinosEsteMes > 0
      ? treinosEsteMes
      : currentAluno?.total_treinos
      ? Math.min(currentAluno.total_treinos, 12)
      : 0;
  const metaMensal = 12; // 3x por semana sugeridos
  const percMeta = Math.min(100, Math.round((treinosExibidos / metaMensal) * 100));
  const totalTreinosAcumulado =
    currentAluno?.total_treinos || (checkIns.length > 0 ? checkIns.length : treinosExibidos);

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

  // 3. MÉTRICA: Status da Sua Mensalidade
  const ultimaMensalidade = pagamentos.length > 0 ? pagamentos[0] : null;
  const statusAtual = ultimaMensalidade ? ultimaMensalidade.status : 'pago';
  const isEmDia = statusAtual === 'pago';
  const valorIndividual = ultimaMensalidade?.valor || config.valor_mensalidade || 180;
  const dataVencimentoIndividual =
    ultimaMensalidade?.data_vencimento ||
    new Date(new Date().getFullYear(), new Date().getMonth(), 10).toISOString().split('T')[0];

  // Chave PIX Oficial: (21) 99154-5136 | Limpo: 21991545136
  const chavePixOficialLimpa = '21991545136';
  const chavePixOficialFormatada = '(21) 99154-5136';

  const handleCopyPix = () => {
    // Copia o valor limpo 21991545136
    const cleanPix = config.chave_pix
      ? config.chave_pix.replace(/\D/g, '') || config.chave_pix
      : chavePixOficialLimpa;
    navigator.clipboard.writeText(cleanPix);
    setCopiedPix(true);
    toast.success(`Chave PIX (${cleanPix}) copiada! Abra o app do banco para pagar.`);
    setTimeout(() => setCopiedPix(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24 md:pb-8">
      {/* 1. CARD PRINCIPAL DO ALUNO: IDENTIDADE FAMÍLIA GORILLAZ */}
      <div className="bg-[#141414] text-white p-6 sm:p-8 rounded-3xl shadow-2xl border border-red-900/40 relative overflow-hidden">
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
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#141414] ${
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

              <h1 className="font-['Oswald',sans-serif] font-bold text-2xl sm:text-3xl uppercase tracking-wide text-white mt-1">
                {profile?.nome_completo || user?.nome_completo || 'Atleta BJJ'}
              </h1>

              <div className="flex flex-wrap items-center gap-3 mt-2">
                <FaixaBadge faixa={faixaAtual} graus={grausAtuais} size="md" showGrausText />
                <span className="text-xs text-neutral-400">
                  Professor Responsável: <strong className="text-white">Prof. {config.nome_professor || 'Rogério'}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Selo de Acesso Privado e Link para História */}
          <div className="flex flex-wrap items-center gap-2 shrink-0 sm:self-center">
            <Link
              to="/historia"
              className="px-3.5 py-2.5 rounded-2xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 hover:border-red-600/60 transition-all flex items-center gap-2 text-neutral-200 hover:text-white"
              title="Acessar Galeria Histórica e Conhecer o Mestre"
            >
              <Camera className="w-4 h-4 text-red-500" />
              <span className="text-xs font-bold font-['Oswald',sans-serif] uppercase tracking-wider">
                Acervo Histórico
              </span>
            </Link>

            <div className="bg-[#0f0f0f] border border-neutral-800 p-2.5 rounded-2xl flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-red-950/60 border border-red-800/40 flex items-center justify-center text-red-500">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-white uppercase tracking-wider font-['Oswald',sans-serif]">
                  Área do Aluno
                </p>
                <p className="text-[9px] text-neutral-400">
                  Gorillaz BJJ
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. OS 3 CARDS DE MÉTRICAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Presença e Frequência */}
        <div className="bg-[#141414] p-5 rounded-2xl border border-neutral-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-950/40 text-red-500 flex items-center justify-center border border-red-900/30">
                <Flame className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold font-['Oswald',sans-serif] uppercase tracking-wider text-neutral-300">
                Seus Treinos no Mês
              </span>
            </div>
            <span className="text-xs font-bold text-red-500 font-mono">
              {treinosExibidos}/{metaMensal} treinos
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-['Oswald',sans-serif] text-white">
              {treinosExibidos}
            </span>
            <span className="text-xs text-neutral-400">treinos confirmados</span>
          </div>

          <div className="space-y-1">
            <div className="w-full bg-neutral-900 rounded-full h-2 overflow-hidden border border-neutral-800">
              <div
                className="bg-gradient-to-r from-red-700 to-red-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${percMeta}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-neutral-400 font-mono">
              <span>{percMeta}% da meta mensal</span>
              <span>Total no Tatame: {totalTreinosAcumulado}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Próxima Graduação */}
        <div className="bg-[#141414] p-5 rounded-2xl border border-neutral-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-950/40 text-amber-500 flex items-center justify-center border border-amber-900/30">
                <Award className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold font-['Oswald',sans-serif] uppercase tracking-wider text-neutral-300">
                Próximo Passo
              </span>
            </div>
            <span className="text-xs font-bold text-amber-500 font-mono">
              {proximoPasso.tipo === 'grau' ? 'Grau no Tatame' : 'Exame'}
            </span>
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black font-['Oswald',sans-serif] text-white">
                {proximoPasso.titulo}
              </span>
              <span className="text-xs text-neutral-400">({proximoPasso.alvo})</span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              {proximoPasso.detalhe}
            </p>
          </div>

          <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-neutral-500" />
              <span>{mesesNaFaixa} {mesesNaFaixa === 1 ? 'mês' : 'meses'} na faixa atual</span>
            </span>
            <span className="text-neutral-500">•</span>
            <span className="font-semibold text-neutral-300">{grausAtuais} de 4 graus</span>
          </div>
        </div>

        {/* Card 3: Mensalidade Pessoal */}
        <div
          className={`p-5 rounded-2xl border shadow-xl space-y-3 transition-all ${
            isEmDia
              ? 'bg-[#141414] border-neutral-800'
              : 'bg-red-950/30 border-red-800/60 ring-1 ring-red-600/30 animate-pulse-red'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                  isEmDia
                    ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30'
                    : 'bg-red-950/60 text-red-500 border-red-800/50'
                }`}
              >
                <CreditCard className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold font-['Oswald',sans-serif] uppercase tracking-wider text-neutral-300">
                Sua Mensalidade
              </span>
            </div>

            <StatusIndicator status={statusAtual} size="sm" />
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black font-['Oswald',sans-serif] text-white">
                {formatCurrencyBRL(valorIndividual)}
              </span>
              <span className="text-xs text-neutral-400">/ mês</span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              {isEmDia
                ? 'Sua mensalidade está em dia! Bons treinos.'
                : `Venceu em ${formatDateBR(dataVencimentoIndividual)}. Regularize via PIX.`}
            </p>
          </div>

          <div className="pt-2 border-t border-neutral-800 flex items-center justify-between">
            <span className="text-xs text-neutral-400">
              Vencimento: dia {config.dia_vencimento || '10'}
            </span>
            <button
              type="button"
              onClick={handleCopyPix}
              className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition ${
                copiedPix ? 'text-emerald-400' : 'text-red-400 hover:text-red-300'
              }`}
            >
              {copiedPix ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedPix ? 'Chave Copiada' : 'Copiar PIX'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. CAMINHO DA GRADUAÇÃO: INFOGRÁFICO INTERATIVO DA MONTANHA */}
      <GraduacaoMountainMap
        faixaAtual={faixaAtual}
        graus={grausAtuais}
        dataInicio={currentAluno?.data_inicio}
        totalTreinos={totalTreinosAcumulado}
      />

      {/* 4. BLOCO PIX DE PAGAMENTO OFICIAL */}
      <div className="bg-[#141414] p-6 rounded-2xl border border-red-900/30 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-950/50 text-red-500 flex items-center justify-center border border-red-900/40">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold font-['Oswald',sans-serif] uppercase text-white tracking-wide">
                Pagamento via PIX • Chave Comercial Oficial
              </h2>
              <p className="text-xs text-neutral-400">
                Pague sua mensalidade diretamente com o Mestre Rogério e mantenha seu ritmo no tatame
              </p>
            </div>
          </div>

          <span className="text-xs font-bold text-white bg-black/60 border border-neutral-800 px-3.5 py-1.5 rounded-xl self-start sm:self-auto font-mono">
            {formatCurrencyBRL(valorIndividual)}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-black/50 border border-neutral-800 space-y-1">
              <span className="text-[11px] uppercase font-bold text-neutral-400 tracking-wider">
                Chave PIX Cadastrada (Telefone do Professor)
              </span>
              <div className="flex items-center justify-between pt-1">
                <span className="text-base sm:text-lg font-bold font-mono text-white select-all">
                  {config.chave_pix || chavePixOficialFormatada}
                </span>
                <span className="text-[10px] uppercase font-bold text-red-400 bg-red-950/80 px-2 py-0.5 rounded border border-red-900/50">
                  {config.tipo_chave_pix || 'Telefone'}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Favorecido: <strong className="text-neutral-200">Prof. {config.nome_professor || 'Rogério'}</strong>
              </p>
            </div>

            <button
              type="button"
              onClick={handleCopyPix}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-['Oswald',sans-serif] uppercase tracking-wider font-bold text-sm bg-red-600 hover:bg-red-700 text-white shadow-red-glow transition-all cursor-pointer active:scale-95"
            >
              {copiedPix ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Chave PIX Copiada com Sucesso!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar Chave PIX (21991545136)</span>
                </>
              )}
            </button>
          </div>

          <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800 text-xs text-neutral-300 space-y-2">
            <div className="flex items-center gap-2 font-bold text-white uppercase font-['Oswald',sans-serif]">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Instruções Rápidas de Pagamento</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-neutral-400">
              <li>Clique no botão acima para copiar a chave comercial.</li>
              <li>Abra o aplicativo do seu banco na opção <strong>PIX ➔ Transferir</strong>.</li>
              <li>Cole a chave e confirme o nome do <strong>Prof. Rogério</strong>.</li>
              <li>Após o pagamento, envie o comprovante no WhatsApp do professor.</li>
            </ol>
          </div>
        </div>
      </div>

      {/* 5. ESTRUTURA DO PERFIL & MURAL OFICIAL DO MESTRE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card de Honra ao Mestre Rogério com Foto Oficial */}
        <div className="bg-[#141414] p-6 rounded-2xl border border-neutral-800 shadow-xl space-y-4 flex flex-col items-center text-center justify-between">
          <div className="space-y-3 flex flex-col items-center">
            <div className="relative group">
              <img
                src="/images/professor.jpg"
                alt="Mestre Rogério Gorillaz"
                className="w-28 h-28 rounded-2xl border-4 border-red-600 object-cover shadow-red-glow transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/images/logo-gorillaz.jpg';
                }}
              />
              <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-red-600 text-white font-black text-[9px] uppercase tracking-wider shadow-md">
                LÍDER • PRETA 4º GRAU
              </span>
            </div>

            <div>
              <h3 className="font-['Oswald',sans-serif] font-bold text-lg text-white uppercase tracking-wide">
                Mestre Rogério Gorillaz
              </h3>
              <p className="text-xs text-red-500 font-bold uppercase tracking-wider mt-0.5">
                Faixa Preta 4º Grau • IBJJF
              </p>
              <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                Fundador da Família Gorillaz Jiu-Jitsu. Disciplina, técnica refinada e lealdade dentro e fora dos tatames.
              </p>
            </div>
          </div>

          <div className="w-full space-y-2 pt-3 border-t border-neutral-800">
            <div className="flex items-center justify-center gap-2 text-xs text-neutral-300 font-mono">
              <Phone className="w-3.5 h-3.5 text-red-500" />
              <span>(21) 99154-5136</span>
            </div>

            <Link
              to="/historia"
              className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 hover:text-white border border-neutral-700 hover:border-red-600/60 text-xs font-bold uppercase tracking-wider font-['Oswald',sans-serif] transition-all cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5 text-red-500" />
              <span>Conhecer Acervo & Primeiros Alunos</span>
            </Link>
          </div>
        </div>

        {/* Mural de Comunicados do Mestre */}
        <div className="lg:col-span-2 bg-[#141414] p-6 rounded-2xl border border-neutral-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-neutral-800">
            <Megaphone className="w-5 h-5 text-red-500" />
            <div>
              <h2 className="text-base font-bold font-['Oswald',sans-serif] uppercase text-white tracking-wide">
                Mural de Comunicados do Mestre Rogério
              </h2>
              <p className="text-xs text-neutral-400">
                Avisos oficiais, eventos, graduações e diretrizes da Família Gorillaz
              </p>
            </div>
          </div>

          {avisos.filter((a) => a.ativo).length === 0 ? (
            <div className="p-8 text-center bg-black/40 rounded-xl border border-neutral-800">
              <Pin className="w-6 h-6 text-neutral-600 mx-auto mb-2" />
              <p className="text-xs font-medium text-neutral-400">
                Nenhum comunicado no momento. Mantenha o foco e a disciplina nos treinos!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {avisos
                .filter((a) => a.ativo)
                .map((aviso) => (
                  <div
                    key={aviso.id}
                    className="p-4 rounded-xl bg-black/40 border border-neutral-800 space-y-2 hover:border-red-900/40 transition"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src="/images/professor.jpg"
                          alt="Mestre Rogério"
                          className="w-8 h-8 rounded-full border border-red-600 object-cover shrink-0"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = '/images/logo-gorillaz.jpg';
                          }}
                        />
                        <div>
                          <h3 className="text-sm font-bold text-white font-['Oswald',sans-serif] uppercase tracking-wide">
                            {aviso.titulo}
                          </h3>
                          <p className="text-[10px] text-neutral-400">
                            Mestre Rogério Gorillaz
                          </p>
                        </div>
                      </div>
                      <span className="text-[11px] text-neutral-400 font-mono shrink-0">
                        {formatDateBR(aviso.created_at)}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-300 whitespace-pre-line leading-relaxed pl-10.5">
                      {aviso.conteudo}
                    </p>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* 6. HISTÓRICOS: JORNADA DE FAIXAS & MENSALIDADES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Minha Jornada de Faixas */}
        <div className="bg-[#141414] p-6 rounded-2xl border border-neutral-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-neutral-800">
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
                  <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-red-600 border-2 border-[#141414] ring-2 ring-red-900" />
                  <div className="flex items-center justify-between">
                    <FaixaBadge faixa={g.faixa} graus={g.graus || 0} size="sm" showGrausText />
                    <span className="text-xs text-neutral-400 font-mono">
                      {formatDateBR(g.data)}
                    </span>
                  </div>
                  {g.observacoes && (
                    <p className="text-xs text-neutral-300 mt-1 italic">"{g.observacoes}"</p>
                  )}
                  <p className="text-[10px] text-neutral-500 mt-0.5">
                    Professor: {g.professor?.nome_completo || 'Mestre Rogério'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Histórico Individual de Mensalidades */}
        <div className="bg-[#141414] p-6 rounded-2xl border border-neutral-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
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
            <div className="divide-y divide-neutral-800/80">
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

      {/* 7. CÓDIGO DE HONRA DA FAMÍLIA GORILLAZ */}
      <div className="bg-[#0c0c0c] text-neutral-300 p-5 rounded-2xl border border-red-900/30 text-xs space-y-2">
        <div className="flex items-center gap-2 text-white font-bold text-sm font-['Oswald',sans-serif] uppercase tracking-wide">
          <BookOpen className="w-4 h-4 text-red-500" />
          <span>Código de Honra • Família Gorillaz BJJ</span>
        </div>
        <p className="leading-relaxed text-neutral-400">
          1. Respeite os companheiros de treino e a hierarquia do tatame. Cumprimente o mestre com "Oss" ao entrar e sair.
          2. Mantenha seu kimono limpo e unhas aparadas para a segurança de todos.
          3. O Jiu-Jitsu ensina disciplina, humildade e resiliência. A técnica sempre supera a força.
        </p>
      </div>
    </div>
  );
};

export default AlunoDashboard;
