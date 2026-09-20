import React, { useState } from 'react';
import { FaixaBJJ } from '../types/database';
import { FaixaBadge } from './FaixaBadge';
import { FAIXAS_BJJ } from '../lib/utils';
import { X, UserPlus, Calendar, Phone, Mail, User, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

interface NovoAlunoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    nome_completo: string;
    email: string;
    telefone?: string;
    data_inicio: string;
    faixa_atual: FaixaBJJ;
    graus: number;
    observacoes?: string;
  }) => Promise<any>;
  isSubmitting?: boolean;
}

const FAIXAS_DISPONIVEIS: FaixaBJJ[] = [
  'branca',
  'azul',
  'roxa',
  'marrom',
  'preta',
];

export const NovoAlunoModal: React.FC<NovoAlunoModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}) => {
  const hoje = new Date().toISOString().split('T')[0];

  const [nomeCompleto, setNomeCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [dataInicio, setDataInicio] = useState(hoje);
  const [faixaAtual, setFaixaAtual] = useState<FaixaBJJ>('branca');
  const [graus, setGraus] = useState<number>(0);
  const [observacoes, setObservacoes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nomeCompleto.trim() || nomeCompleto.trim().length < 3) {
      toast.error('O nome do aluno deve ter no mínimo 3 caracteres.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      toast.error('Digite um e-mail válido para o aluno.');
      return;
    }

    try {
      await onSubmit({
        nome_completo: nomeCompleto.trim(),
        email: email.trim().toLowerCase(),
        telefone: telefone.trim() || undefined,
        data_inicio: dataInicio,
        faixa_atual: faixaAtual,
        graus,
        observacoes: observacoes.trim() || undefined,
      });

      // Reset form
      setNomeCompleto('');
      setEmail('');
      setTelefone('');
      setDataInicio(hoje);
      setFaixaAtual('branca');
      setGraus(0);
      setObservacoes('');
      onClose();
    } catch (err: any) {
      // toast is already handled in hook, but in case
      console.error('Erro no cadastro:', err);
    }
  };

  return (
    <div
      id="novo-aluno-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        id="novo-aluno-modal-container"
        className="w-full max-w-lg bg-[#141414] border border-[#2a2a2a] rounded-xl shadow-2xl overflow-hidden text-neutral-100 flex flex-col max-h-[92vh]"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#242424] bg-[#1a1a1a]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-red-950/40 text-red-500 border border-red-900/40">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide uppercase">
                Matricular Novo Aluno
              </h2>
              <p className="text-xs text-neutral-400">
                Cadastro Real • BJJ College & Supabase
              </p>
            </div>
          </div>
          <button
            type="button"
            id="btn-close-novo-aluno-modal"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Nome Completo */}
          <div className="space-y-1.5">
            <label
              htmlFor="nome_aluno_input"
              className="text-xs font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5 text-red-500" />
              Nome Completo *
            </label>
            <input
              type="text"
              id="nome_aluno_input"
              required
              value={nomeCompleto}
              onChange={(e) => setNomeCompleto(e.target.value)}
              placeholder="Ex: Carlos Eduardo da Silva"
              className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-lg px-3.5 py-2.5 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>

          {/* E-mail e Telefone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label
                htmlFor="email_aluno_input"
                className="text-xs font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5 text-red-500" />
                E-mail *
              </label>
              <input
                type="email"
                id="email_aluno_input"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="aluno@email.com"
                className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-lg px-3.5 py-2.5 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="telefone_aluno_input"
                className="text-xs font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5 text-neutral-400" />
                Telefone / WhatsApp
              </label>
              <input
                type="tel"
                id="telefone_aluno_input"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="(11) 99999-9999"
                className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-lg px-3.5 py-2.5 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>
          </div>

          {/* Faixa Atual e Graus */}
          <div className="p-4 rounded-lg bg-[#181818] border border-[#2a2a2a] space-y-3">
            <div>
              <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block mb-2">
                Faixa Atual (Graduação) *
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {FAIXAS_DISPONIVEIS.map((fKey) => {
                  const info = FAIXAS_BJJ[fKey];
                  const isSelected = faixaAtual === fKey;
                  return (
                    <button
                      key={fKey}
                      type="button"
                      id={`btn-faixa-${fKey}`}
                      onClick={() => setFaixaAtual(fKey)}
                      className={`py-2 px-2 rounded-lg text-center font-bold text-xs uppercase border transition-all ${
                        isSelected
                          ? 'bg-neutral-800 text-white border-red-500 ring-1 ring-red-500'
                          : 'bg-[#1f1f1f] text-neutral-400 border-[#2e2e2e] hover:text-white'
                      }`}
                    >
                      {info.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Graus 0 a 4 */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-neutral-300">
                  Graus na Faixa Atual (0 a 4 listras):
                </label>
                <span className="text-xs font-bold text-neutral-200">
                  {graus === 0 ? 'Sem grau' : `${graus}º grau`}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {[0, 1, 2, 3, 4].map((g) => (
                  <button
                    key={g}
                    type="button"
                    id={`btn-grau-${g}`}
                    onClick={() => setGraus(g)}
                    className={`py-1.5 rounded-md text-xs font-bold transition-all border ${
                      graus === g
                        ? 'bg-white text-black border-white shadow-xs'
                        : 'bg-[#222] text-neutral-400 border-[#333] hover:text-white'
                    }`}
                  >
                    {g === 0 ? '0' : `${g}º`}
                  </button>
                ))}
              </div>
            </div>

            {/* Prévia da Faixa */}
            <div className="pt-2 border-t border-[#262626] flex items-center justify-between">
              <span className="text-xs text-neutral-400">Prévia visual no Tatame:</span>
              <FaixaBadge faixa={faixaAtual} graus={graus} size="md" showGrausText />
            </div>
          </div>

          {/* Data de Início / Matrícula */}
          <div className="space-y-1.5">
            <label
              htmlFor="data_inicio_input"
              className="text-xs font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5 text-neutral-400" />
              Data de Início / Matrícula *
            </label>
            <input
              type="date"
              id="data_inicio_input"
              required
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>

          {/* Observações */}
          <div className="space-y-1.5">
            <label
              htmlFor="observacoes_aluno_input"
              className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block"
            >
              Observações Médicas / Histórico (Opcional)
            </label>
            <textarea
              id="observacoes_aluno_input"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={2}
              placeholder="Ex: Treinou 2 anos em outra filial, sem restrições médicas."
              className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-lg p-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-red-500 transition-colors resize-none"
            />
          </div>

          <div className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-800 text-[11px] text-neutral-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Este aluno será registrado com a flag de <strong>aluno real</strong> e não será apagado na limpeza de dados de teste.</span>
          </div>

          {/* Ações */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#242424]">
            <button
              type="button"
              id="btn-cancelar-novo-aluno"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-lg text-xs font-semibold uppercase text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              id="btn-salvar-novo-aluno"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-lg text-xs font-bold uppercase bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-950/60 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              {isSubmitting ? 'Cadastrando...' : 'Cadastrar Aluno'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
