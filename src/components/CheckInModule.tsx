import React, { useState, useMemo } from 'react';
import { Aluno } from '../types/database';
import { FaixaBadge } from './FaixaBadge';
import { useCheckIn } from '../hooks/useCheckIn';
import {
  Calendar,
  CheckCircle2,
  Circle,
  Search,
  Users,
  Flame,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface CheckInModuleProps {
  alunos: Aluno[];
  onOpenGraduar?: (aluno: Aluno) => void;
  compact?: boolean;
}

export const CheckInModule: React.FC<CheckInModuleProps> = ({
  alunos,
  onOpenGraduar,
  compact = false,
}) => {
  const [dataSelecionada, setDataSelecionada] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [busca, setBusca] = useState('');
  const [filtroPresenca, setFiltroPresenca] = useState<'todos' | 'presentes' | 'ausentes'>('todos');

  const {
    checkIns,
    isLoading,
    totalPresentes,
    toggleCheckIn,
    isToggling,
    isAlunoPresente,
    hoje,
  } = useCheckIn(dataSelecionada);

  // Filtra apenas alunos ativos
  const alunosAtivos = useMemo(() => {
    return alunos.filter((a) => a.ativo);
  }, [alunos]);

  // Alunos filtrados por busca e status de presença
  const alunosFiltrados = useMemo(() => {
    return alunosAtivos.filter((aluno) => {
      const nome = aluno.profile?.nome_completo?.toLowerCase() || '';
      const email = aluno.profile?.email?.toLowerCase() || '';
      const termo = busca.toLowerCase();
      const matchTexto = nome.includes(termo) || email.includes(termo);

      if (!matchTexto) return false;

      const presente = isAlunoPresente(aluno.id);
      if (filtroPresenca === 'presentes') return presente;
      if (filtroPresenca === 'ausentes') return !presente;
      return true;
    });
  }, [alunosAtivos, busca, filtroPresenca, checkIns]);

  const handleMudarDia = (offset: number) => {
    const d = new Date(dataSelecionada + 'T12:00:00');
    d.setDate(d.getDate() + offset);
    setDataSelecionada(d.toISOString().split('T')[0]);
  };

  const isDataHoje = dataSelecionada === hoje;

  // Formatador de data amigável
  const dataFormatada = useMemo(() => {
    const d = new Date(dataSelecionada + 'T12:00:00');
    return new Intl.DateTimeFormat('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(d);
  }, [dataSelecionada]);

  return (
    <div
      id="modulo-checkin-tatame"
      className="bg-[#141414] border border-[#242424] rounded-xl overflow-hidden shadow-xl"
    >
      {/* Header do Módulo */}
      <div className="p-4 sm:p-5 border-b border-[#242424] bg-[#1a1a1a] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-md bg-red-950/50 text-red-500 border border-red-900/40">
              <Flame className="w-4 h-4" />
            </span>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-wide uppercase">
              Presença no Tatame • Check-in Diário
            </h2>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Marque com 1 clique. Cada presença soma automaticamente ao histórico para graduação.
          </p>
        </div>

        {/* Seletor de Data Rápido */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-[#111] p-1 rounded-lg border border-[#2e2e2e]">
          <button
            type="button"
            id="btn-dia-anterior"
            onClick={() => handleMudarDia(-1)}
            title="Dia anterior"
            className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-[#222] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 px-2">
            <Calendar className="w-3.5 h-3.5 text-red-500" />
            <input
              type="date"
              id="input-data-checkin"
              value={dataSelecionada}
              onChange={(e) => setDataSelecionada(e.target.value)}
              className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
            />
            {isDataHoje && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-sm bg-red-900/40 text-red-400 border border-red-800/40">
                Hoje
              </span>
            )}
          </div>

          <button
            type="button"
            id="btn-proximo-dia"
            onClick={() => handleMudarDia(1)}
            title="Próximo dia"
            className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-[#222] transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Barra de Status e Contadores */}
      <div className="px-4 py-3 bg-[#171717] border-b border-[#242424] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4">
          <span className="text-neutral-400">
            Data: <strong className="text-neutral-200 capitalize">{dataFormatada}</strong>
          </span>
          <span className="inline-flex items-center gap-1.5 text-emerald-400 font-bold bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-900/40">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {totalPresentes} presente{totalPresentes !== 1 ? 's' : ''} no tatame
          </span>
        </div>

        {/* Filtro Rápido */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setFiltroPresenca('todos')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase transition-all ${
              filtroPresenca === 'todos'
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Todos ({alunosAtivos.length})
          </button>
          <button
            type="button"
            onClick={() => setFiltroPresenca('presentes')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase transition-all ${
              filtroPresenca === 'presentes'
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/50'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Presentes ({totalPresentes})
          </button>
          <button
            type="button"
            onClick={() => setFiltroPresenca('ausentes')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase transition-all ${
              filtroPresenca === 'ausentes'
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Ausentes ({Math.max(0, alunosAtivos.length - totalPresentes)})
          </button>
        </div>
      </div>

      {/* Barra de Busca Rápida */}
      <div className="p-4 border-b border-[#242424] bg-[#141414]">
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            id="busca-aluno-checkin"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar guerreiro por nome para registrar presença..."
            className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-red-500 transition-colors"
          />
        </div>
      </div>

      {/* Lista de Alunos para Check-in com 1 Clique */}
      <div className={`divide-y divide-[#222] overflow-y-auto ${compact ? 'max-h-80' : 'max-h-96'}`}>
        {isLoading ? (
          <div className="p-8 text-center text-neutral-400 text-xs flex items-center justify-center gap-2">
            <Clock className="w-4 h-4 animate-spin text-red-500" />
            Carregando lista de presença...
          </div>
        ) : alunosFiltrados.length === 0 ? (
          <div className="p-8 text-center text-neutral-400 text-sm">
            Nenhum guerreiro encontrado com os filtros atuais.
          </div>
        ) : (
          alunosFiltrados.map((aluno) => {
            const presente = isAlunoPresente(aluno.id);
            const nome = aluno.profile?.nome_completo || 'Aluno';
            const treinosTotal = aluno.total_treinos || 0;

            return (
              <div
                key={aluno.id}
                id={`checkin-row-${aluno.id}`}
                className={`p-3.5 sm:px-5 flex items-center justify-between gap-3 transition-colors ${
                  presente
                    ? 'bg-emerald-950/15 hover:bg-emerald-950/25'
                    : 'hover:bg-[#181818]'
                }`}
              >
                {/* Informações do Aluno */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {aluno.profile?.foto_url ? (
                    <img
                      src={aluno.profile.foto_url}
                      alt={nome}
                      className="w-10 h-10 rounded-full object-cover border border-[#333] shrink-0"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center font-bold text-sm text-neutral-300 shrink-0">
                      {nome.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-white truncate">{nome}</span>
                      {aluno.is_demo && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-xs bg-neutral-800 text-neutral-400 border border-neutral-700 uppercase font-mono">
                          Demo
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <FaixaBadge
                        faixa={aluno.faixa_atual}
                        graus={aluno.graus || 0}
                        size="sm"
                        showGrausText
                      />
                      <span className="text-[11px] text-neutral-400 font-medium inline-flex items-center gap-1">
                        <Flame className="w-3 h-3 text-red-500" />
                        {treinosTotal} treinos
                      </span>
                    </div>
                  </div>
                </div>

                {/* Ações: 1-Clique Check-in + Atalho Graduar */}
                <div className="flex items-center gap-2 shrink-0">
                  {onOpenGraduar && (
                    <button
                      type="button"
                      id={`btn-graduar-shortcut-${aluno.id}`}
                      onClick={() => onOpenGraduar(aluno)}
                      title="Graduar guerreiro"
                      className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold uppercase bg-[#202020] hover:bg-[#282828] text-neutral-300 hover:text-white border border-[#333] transition-all"
                    >
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      Graduar
                    </button>
                  )}

                  {/* Botão de Presença 1-Clique */}
                  <button
                    type="button"
                    id={`btn-toggle-checkin-${aluno.id}`}
                    disabled={isToggling}
                    onClick={() =>
                      toggleCheckIn({
                        aluno_id: aluno.id,
                        dataTreino: dataSelecionada,
                      })
                    }
                    className={`px-3.5 py-2 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-2 border select-none ${
                      presente
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-sm shadow-emerald-950/60'
                        : 'bg-[#1e1e1e] hover:bg-[#282828] text-neutral-400 hover:text-white border-[#2e2e2e]'
                    }`}
                  >
                    {presente ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-white" />
                        <span>Presente</span>
                      </>
                    ) : (
                      <>
                        <Circle className="w-4 h-4 text-neutral-500" />
                        <span>Confirmar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Rodapé informativo */}
      <div className="p-3 bg-[#111] border-t border-[#242424] text-center text-[11px] text-neutral-400">
        Família Gorillaz BJJ • Total de alunos matriculados: <strong className="text-white">{alunosAtivos.length}</strong>
      </div>
    </div>
  );
};
