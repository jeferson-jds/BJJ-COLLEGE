import React, { useState, useEffect } from 'react';
import { Aluno, FaixaBJJ } from '../types/database';
import { FaixaBadge } from './FaixaBadge';
import { FAIXAS_BJJ } from '../lib/utils';
import { X, Award, ChevronRight, Calendar, FileText, CheckCircle2, Flame } from 'lucide-react';

interface GraduacaoModalProps {
  aluno: Aluno | null;
  isOpen: boolean;
  onClose: () => void;
  onGraduar: (data: {
    aluno_id: string;
    nova_faixa: FaixaBJJ;
    graus: number;
    tipo: 'grau' | 'faixa';
    data: string;
    observacoes?: string;
  }) => Promise<void>;
  isSubmitting?: boolean;
}

const ORDEM_FAIXAS: FaixaBJJ[] = [
  'branca',
  'azul',
  'roxa',
  'marrom',
  'preta',
];

export const GraduacaoModal: React.FC<GraduacaoModalProps> = ({
  aluno,
  isOpen,
  onClose,
  onGraduar,
  isSubmitting = false,
}) => {
  const [tipoPromocao, setTipoPromocao] = useState<'grau' | 'faixa'>('grau');
  const [faixaSelecionada, setFaixaSelecionada] = useState<FaixaBJJ>('branca');
  const [grauSelecionado, setGrauSelecionado] = useState<number>(1);
  const [dataGraduacao, setDataGraduacao] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [observacoes, setObservacoes] = useState<string>('');

  useEffect(() => {
    if (aluno) {
      const currentGraus = aluno.graus || 0;
      const currentFaixa = aluno.faixa_atual;

      // Se já está com 4 graus, sugere automaticamente mudança de faixa
      if (currentGraus >= 4) {
        setTipoPromocao('faixa');
        const currentIndex = ORDEM_FAIXAS.indexOf(currentFaixa);
        if (currentIndex !== -1 && currentIndex < ORDEM_FAIXAS.length - 1) {
          setFaixaSelecionada(ORDEM_FAIXAS[currentIndex + 1]);
        } else {
          setFaixaSelecionada(currentFaixa);
        }
        setGrauSelecionado(0);
      } else {
        setTipoPromocao('grau');
        setFaixaSelecionada(currentFaixa);
        setGrauSelecionado(Math.min(4, currentGraus + 1));
      }

      setDataGraduacao(new Date().toISOString().split('T')[0]);
      setObservacoes('');
    }
  }, [aluno]);

  if (!isOpen || !aluno) return null;

  const currentFaixa = aluno.faixa_atual;
  const currentGraus = aluno.graus || 0;
  const nomeAluno = aluno.profile?.nome_completo || 'Aluno';
  const totalTreinos = aluno.total_treinos || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onGraduar({
      aluno_id: aluno.id,
      nova_faixa: tipoPromocao === 'faixa' ? faixaSelecionada : currentFaixa,
      graus: tipoPromocao === 'grau' ? grauSelecionado : grauSelecionado,
      tipo: tipoPromocao,
      data: dataGraduacao,
      observacoes: observacoes.trim() || undefined,
    });
    onClose();
  };

  return (
    <div
      id="graduacao-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        id="graduacao-modal-container"
        className="w-full max-w-lg bg-[#141414] border border-[#2a2a2a] rounded-xl shadow-2xl overflow-hidden text-neutral-100 flex flex-col max-h-[90vh]"
      >
        {/* Cabeçalho do Modal */}
        <div className="flex items-center justify-between p-5 border-b border-[#242424] bg-[#1a1a1a]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-red-950/40 text-red-500 border border-red-900/40">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide uppercase">
                Graduar Guerreiro
              </h2>
              <p className="text-xs text-neutral-400">
                Painel do Mestre • Família Gorillaz
              </p>
            </div>
          </div>
          <button
            type="button"
            id="btn-close-graduacao-modal"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5 overflow-y-auto flex-1">
          {/* Card Resumo do Aluno */}
          <div className="p-4 rounded-lg bg-[#1a1a1a] border border-[#2e2e2e] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              {aluno.profile?.foto_url ? (
                <img
                  src={aluno.profile.foto_url}
                  alt={nomeAluno}
                  className="w-12 h-12 rounded-full object-cover border-2 border-[#333]"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center font-bold text-lg text-neutral-300">
                  {nomeAluno.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-white truncate">{nomeAluno}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <FaixaBadge faixa={currentFaixa} graus={currentGraus} size="sm" showGrausText />
                </div>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[11px] text-neutral-400 block uppercase font-medium">Treinos</span>
              <span className="text-sm font-bold text-red-500 inline-flex items-center gap-1">
                <Flame className="w-3.5 h-3.5" />
                {totalTreinos} presenças
              </span>
            </div>
          </div>

          {/* Seletor do Tipo de Promoção */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
              Tipo de Graduação
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                id="btn-tipo-grau"
                onClick={() => {
                  setTipoPromocao('grau');
                  setFaixaSelecionada(currentFaixa);
                  setGrauSelecionado(Math.min(4, currentGraus + 1));
                }}
                className={`py-2.5 px-4 rounded-lg text-xs font-bold uppercase transition-all flex items-center justify-center gap-2 border ${
                  tipoPromocao === 'grau'
                    ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-950/50'
                    : 'bg-[#181818] text-neutral-400 border-[#2a2a2a] hover:bg-[#222] hover:text-white'
                }`}
              >
                <span>Conceder Grau</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-black/30">
                  {Math.min(4, currentGraus + 1)}º Grau
                </span>
              </button>

              <button
                type="button"
                id="btn-tipo-faixa"
                onClick={() => {
                  setTipoPromocao('faixa');
                  const currentIndex = ORDEM_FAIXAS.indexOf(currentFaixa);
                  if (currentIndex !== -1 && currentIndex < ORDEM_FAIXAS.length - 1) {
                    setFaixaSelecionada(ORDEM_FAIXAS[currentIndex + 1]);
                  }
                  setGrauSelecionado(0);
                }}
                className={`py-2.5 px-4 rounded-lg text-xs font-bold uppercase transition-all flex items-center justify-center gap-2 border ${
                  tipoPromocao === 'faixa'
                    ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-950/50'
                    : 'bg-[#181818] text-neutral-400 border-[#2a2a2a] hover:bg-[#222] hover:text-white'
                }`}
              >
                <span>Promover de Faixa</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Opções quando "Conceder Grau" */}
          {tipoPromocao === 'grau' && (
            <div className="space-y-3 p-4 rounded-lg bg-[#181818] border border-[#2a2a2a]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-300">Grau Atual:</span>
                <span className="text-xs font-bold text-neutral-200">{currentGraus}º Grau</span>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-neutral-400">
                  Selecione o Novo Grau na Faixa Atual:
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[0, 1, 2, 3, 4].map((g) => (
                    <button
                      key={g}
                      type="button"
                      id={`btn-select-grau-${g}`}
                      onClick={() => setGrauSelecionado(g)}
                      className={`py-2 text-center rounded-md text-xs font-bold transition-all border ${
                        grauSelecionado === g
                          ? 'bg-white text-black border-white shadow-md'
                          : 'bg-[#222] text-neutral-400 border-[#333] hover:text-white hover:border-[#444]'
                      }`}
                    >
                      {g === 0 ? 'Sem Grau' : `${g}º Grau`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Prévia visual */}
              <div className="pt-2 border-t border-[#262626] flex items-center justify-between">
                <span className="text-xs text-neutral-400">Resultado:</span>
                <FaixaBadge faixa={currentFaixa} graus={grauSelecionado} size="md" showGrausText />
              </div>
            </div>
          )}

          {/* Opções quando "Promover de Faixa" */}
          {tipoPromocao === 'faixa' && (
            <div className="space-y-4 p-4 rounded-lg bg-[#181818] border border-[#2a2a2a]">
              <div className="space-y-2">
                <label className="text-xs font-medium text-neutral-300 block">
                  Selecione a Nova Faixa:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {ORDEM_FAIXAS.map((faixaKey) => {
                    const info = FAIXAS_BJJ[faixaKey];
                    const isSelected = faixaSelecionada === faixaKey;
                    return (
                      <button
                        key={faixaKey}
                        type="button"
                        id={`btn-select-faixa-${faixaKey}`}
                        onClick={() => setFaixaSelecionada(faixaKey)}
                        className={`p-2.5 rounded-lg text-left flex items-center justify-between border transition-all ${
                          isSelected
                            ? 'bg-[#262626] border-red-500 shadow-xs'
                            : 'bg-[#1f1f1f] border-[#2e2e2e] hover:border-[#444]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full shrink-0 border border-white/20"
                            style={{ backgroundColor: info.tipColor === '#000000' && faixaKey === 'branca' ? '#ffffff' : info.bgClass.includes('red') ? '#dc2626' : info.bgClass.includes('blue') ? '#2563eb' : info.bgClass.includes('purple') ? '#9333ea' : info.bgClass.includes('amber') ? '#78350f' : '#ffffff' }}
                          />
                          <span className={`text-xs font-bold uppercase ${isSelected ? 'text-white' : 'text-neutral-300'}`}>
                            {info.label}
                          </span>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-red-500" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Graus iniciais na nova faixa */}
              <div className="space-y-2 pt-2 border-t border-[#262626]">
                <label className="text-xs font-medium text-neutral-400 block">
                  Graus Iniciais na Nova Faixa:
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[0, 1, 2, 3, 4].map((g) => (
                    <button
                      key={g}
                      type="button"
                      id={`btn-select-novafaixa-grau-${g}`}
                      onClick={() => setGrauSelecionado(g)}
                      className={`py-1.5 text-center rounded-md text-xs font-bold transition-all border ${
                        grauSelecionado === g
                          ? 'bg-white text-black border-white'
                          : 'bg-[#222] text-neutral-400 border-[#333] hover:text-white'
                      }`}
                    >
                      {g}º
                    </button>
                  ))}
                </div>
              </div>

              {/* Prévia visual */}
              <div className="pt-2 border-t border-[#262626] flex items-center justify-between">
                <span className="text-xs text-neutral-400">Nova Faixa:</span>
                <FaixaBadge faixa={faixaSelecionada} graus={grauSelecionado} size="md" showGrausText />
              </div>
            </div>
          )}

          {/* Data da Graduação */}
          <div className="space-y-1.5">
            <label
              htmlFor="data_graduacao_input"
              className="text-xs font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5 text-neutral-400" />
              Data da Graduação
            </label>
            <input
              type="date"
              id="data_graduacao_input"
              value={dataGraduacao}
              onChange={(e) => setDataGraduacao(e.target.value)}
              required
              className="w-full bg-[#181818] border border-[#2e2e2e] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>

          {/* Observações do Professor */}
          <div className="space-y-1.5">
            <label
              htmlFor="observacoes_graduacao_input"
              className="text-xs font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-neutral-400" />
              Observações / Parecer Técnico (Opcional)
            </label>
            <textarea
              id="observacoes_graduacao_input"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={2}
              placeholder="Ex: Demonstrou domínio nas técnicas de passagem, guarda e disciplina no tatame. Aprovado pelo Prof. Rogério."
              className="w-full bg-[#181818] border border-[#2e2e2e] rounded-lg p-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-red-500 transition-colors resize-none"
            />
          </div>

          {/* Botões de Ação */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#242424]">
            <button
              type="button"
              id="btn-cancelar-graduacao"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-lg text-xs font-semibold uppercase text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              id="btn-confirmar-graduacao"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-lg text-xs font-bold uppercase bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-950/60 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Award className="w-4 h-4" />
              {isSubmitting ? 'Registrando...' : 'Confirmar Graduação (Oss!)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
