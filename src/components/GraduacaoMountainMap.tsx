import React, { useState } from 'react';
import { FaixaBJJ } from '../types/database';
import { FaixaBadge } from './FaixaBadge';
import {
  Mountain,
  Maximize2,
  X,
  Award,
  CheckCircle2,
  Compass,
  Sparkles,
  ChevronRight,
  Info,
  Clock,
  ShieldAlert,
} from 'lucide-react';

interface GraduacaoMountainMapProps {
  faixaAtual?: FaixaBJJ;
  graus?: number;
  dataInicio?: string;
  totalTreinos?: number;
}

interface EtapaMontanha {
  id: string;
  faixa: FaixaBJJ;
  titulo: string;
  subtitulo: string;
  tempoMinimo: string;
  focoPrincipal: string;
  descricao: string;
  altitudeSimbolica: string;
}

const ETAPAS_MONTANHA: EtapaMontanha[] = [
  {
    id: 'branca',
    faixa: 'branca',
    titulo: 'Faixa Branca • A Base da Montanha',
    subtitulo: 'A Sobrevivência & Humildade',
    tempoMinimo: '12 a 24 meses (4 graus)',
    focoPrincipal: 'Defesa, postura, base, escapes e controle respiratório.',
    descricao:
      'O primeiro passo na montanha. O praticante aprende a lidar com a pressão, dominar o próprio ego e absorver os fundamentos essenciais da arte suave.',
    altitudeSimbolica: '0m — Base do Tatame',
  },
  {
    id: 'azul',
    faixa: 'azul',
    titulo: 'Faixa Azul • A Grande Escala Técnica',
    subtitulo: 'O Mar de Conhecimento',
    tempoMinimo: '24 meses (4 graus)',
    focoPrincipal: 'Construção de repertório, ataques da guarda e passagens dinâmicas.',
    descricao:
      'O momento onde o praticante conhece uma vasta gama de técnicas. É a fase onde a maioria desiste; perseverar aqui consolida a paixão pelo Jiu-Jitsu.',
    altitudeSimbolica: '1.500m — Encosta Técnica',
  },
  {
    id: 'roxa',
    faixa: 'roxa',
    titulo: 'Faixa Roxa • O Refinamento & Identidade',
    subtitulo: 'A Maestria do Próprio Jogo',
    tempoMinimo: '18 a 24 meses (4 graus)',
    focoPrincipal: 'Combinações em cadeia, antecipação e desenvolvimento do jogo próprio.',
    descricao:
      'O atleta já não pensa mais para agir: suas reações são intuitivas. O praticante passa a ditar o ritmo da luta e a antecipar as reações do adversário.',
    altitudeSimbolica: '3.000m — Planalto dos Ajustes',
  },
  {
    id: 'marrom',
    faixa: 'marrom',
    titulo: 'Faixa Marrom • A Lapidação Final',
    subtitulo: 'O Quase-Mestre',
    tempoMinimo: '12 meses (4 graus)',
    focoPrincipal: 'Ataques de pernas, precisão cirúrgica de finalizações e liderança.',
    descricao:
      'Uma faixa de autoridade e transição. Todas as posições são conhecidas; o objetivo é eliminar qualquer brecha técnica antes de alcançar a tão sonhada faixa preta.',
    altitudeSimbolica: '4.500m — A Crista do Cume',
  },
  {
    id: 'preta',
    faixa: 'preta',
    titulo: 'Faixa Preta • O Cume Técnico',
    subtitulo: 'O Verdadeiro Começo',
    tempoMinimo: '31 anos de dedicação (1º ao 6º grau)',
    focoPrincipal: 'Maestria, transmissão da arte, liderança e sabedoria marcial.',
    descricao:
      'Alcançar o topo da montanha técnica revela que a jornada está apenas começando. A faixa preta simboliza a transformação do homem em mestre e líder da família.',
    altitudeSimbolica: '6.000m — Cume da Maestria',
  },
  {
    id: 'vermelha',
    faixa: 'vermelha',
    titulo: 'Faixas Especiais • O Legado Imortal',
    subtitulo: 'Coral & Vermelha (Grão-Mestres)',
    tempoMinimo: '7º Grau Coral (Vermelha e Preta), 8º Grau Coral (Vermelha e Branca), 9º e 10º Graus (Vermelha)',
    focoPrincipal: 'Patrimônio histórico, honra e dedicação vitalícia ao Jiu-Jitsu.',
    descricao:
      'Reservada aos ícones da arte suave que dedicaram mais de meio século de vida aos tatames, mantendo a chama sagrada do Jiu-Jitsu acesa para as próximas gerações.',
    altitudeSimbolica: '8.848m — O Olimpo dos Mestres',
  },
];

const ORDEM_PESO: Record<string, number> = {
  branca: 1,
  cinza: 1.2,
  amarela: 1.4,
  laranja: 1.6,
  verde: 1.8,
  azul: 2,
  roxa: 3,
  marrom: 4,
  preta: 5,
  coral: 6,
  vermelha_branca: 6.5,
  vermelha: 7,
};

export const GraduacaoMountainMap: React.FC<GraduacaoMountainMapProps> = ({
  faixaAtual = 'branca',
  graus = 0,
}) => {
  const [modalFullscreen, setModalFullscreen] = useState(false);
  const [etapaSelecionada, setEtapaSelecionada] = useState<EtapaMontanha>(() => {
    const found = ETAPAS_MONTANHA.find((e) => e.faixa === faixaAtual);
    return found || ETAPAS_MONTANHA[0];
  });

  const pesoAtual = ORDEM_PESO[faixaAtual] || 1;

  // Imagem oficial da montanha com fallback
  const mountainSrc = '/images/montanha-graduacao.jpg';

  return (
    <div className="bg-[#141414] rounded-3xl border border-neutral-800 shadow-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
      {/* Glow de fundo */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Cabeçalho do Componente */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800/80 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center text-white shadow-red-glow shrink-0 border border-red-500/30">
            <Mountain className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-950/60 border border-red-800/40 px-2 py-0.5 rounded-full">
                MAPA TÉCNICO INTERATIVO
              </span>
              <span className="text-xs text-neutral-400 font-mono">BJJ College</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-['Oswald',sans-serif] uppercase tracking-wide text-white mt-1">
              A Montanha da Graduação • Seu Caminho no Tatame
            </h2>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setModalFullscreen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 hover:text-white rounded-xl border border-neutral-700 text-xs font-bold uppercase tracking-wider font-['Oswald',sans-serif] transition-all cursor-pointer self-start sm:self-auto shadow-sm"
          title="Ampliar infográfico em alta resolução"
        >
          <Maximize2 className="w-4 h-4 text-red-500" />
          <span>Ver Infográfico em Tela Cheia</span>
        </button>
      </div>

      {/* Grid Principal: Infográfico Visual + Interação da Trilha */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch relative z-10">
        {/* Lado Esquerdo: O Infográfico da Montanha com Overlay do Aluno */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-black/60 rounded-2xl p-4 border border-neutral-800 relative group">
          <div className="relative overflow-hidden rounded-xl bg-neutral-950 flex items-center justify-center min-h-[320px]">
            <img
              src={mountainSrc}
              alt="A Montanha da Graduação no Jiu-Jitsu"
              className="w-full h-auto max-h-[460px] object-contain rounded-xl transition-transform duration-500 group-hover:scale-105 cursor-pointer"
              onClick={() => setModalFullscreen(true)}
              onError={(e) => {
                // Fallback para montanha-graduacao.png.jpg caso necessário
                const target = e.currentTarget as HTMLImageElement;
                if (!target.src.includes('montanha-graduacao.png.jpg')) {
                  target.src = '/montanha-graduacao.png.jpg';
                }
              }}
            />

            {/* Badge de clique para zoom */}
            <div
              onClick={() => setModalFullscreen(true)}
              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer backdrop-blur-[2px]"
            >
              <div className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold text-xs uppercase tracking-wider font-['Oswald',sans-serif] shadow-red-glow flex items-center gap-2">
                <Maximize2 className="w-4 h-4" />
                <span>Clique para Expandir Mapa</span>
              </div>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-between text-[11px] text-neutral-400">
            <span className="flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-red-500" />
              <span>Infográfico Oficial • Tradição IBJJF</span>
            </span>
            <span className="font-semibold text-neutral-300">Base Branca ➔ Topo Vermelho</span>
          </div>
        </div>

        {/* Lado Direito: A Trilha Interativa das Faixas */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          {/* Seletor de Etapas da Montanha */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-['Oswald',sans-serif]">
                Estágios da Escalada (Clique para explorar)
              </span>
              <span className="text-xs text-red-500 font-bold font-mono">
                Sua Faixa: {faixaAtual.toUpperCase()} ({graus} {graus === 1 ? 'grau' : 'graus'})
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ETAPAS_MONTANHA.map((etapa) => {
                const pesoEtapa = ORDEM_PESO[etapa.faixa] || 1;
                const isFaixaAtual = etapa.faixa === faixaAtual;
                const isConquistada = pesoAtual > pesoEtapa;
                const isSelected = etapaSelecionada.id === etapa.id;

                return (
                  <button
                    key={etapa.id}
                    type="button"
                    onClick={() => setEtapaSelecionada(etapa)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-red-950/40 border-red-600 ring-2 ring-red-600/40 shadow-red-glow'
                        : isFaixaAtual
                        ? 'bg-neutral-900 border-red-500/60'
                        : isConquistada
                        ? 'bg-[#101010] border-neutral-800 hover:border-neutral-700'
                        : 'bg-[#0c0c0c] border-neutral-900 hover:border-neutral-800 opacity-80'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <FaixaBadge faixa={etapa.faixa} size="sm" />
                      {isFaixaAtual && (
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-red-600 text-white tracking-widest animate-pulse">
                          VOCÊ
                        </span>
                      )}
                      {isConquistada && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      )}
                    </div>
                    <span className="text-xs font-bold text-white block truncate font-['Oswald',sans-serif] uppercase tracking-wide">
                      {etapa.titulo.split('•')[0].trim()}
                    </span>
                    <span className="text-[10px] text-neutral-400 block font-mono">
                      {etapa.altitudeSimbolica.split('—')[0].trim()}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card Detalhado da Etapa Selecionada */}
          <div className="bg-[#0f0f0f] p-5 sm:p-6 rounded-2xl border border-neutral-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-3">
                <FaixaBadge faixa={etapaSelecionada.faixa} size="md" />
                <div>
                  <h3 className="text-base font-bold text-white uppercase font-['Oswald',sans-serif] tracking-wide">
                    {etapaSelecionada.titulo}
                  </h3>
                  <p className="text-xs text-red-500 font-semibold">
                    {etapaSelecionada.subtitulo}
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block">
                  Tempo Médio / Exigência
                </span>
                <span className="text-xs font-semibold text-neutral-200 font-mono flex items-center gap-1 sm:justify-end">
                  <Clock className="w-3.5 h-3.5 text-neutral-400" />
                  {etapaSelecionada.tempoMinimo}
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-bold text-neutral-300 uppercase tracking-wider block text-[11px] mb-1">
                  🎯 Foco Técnico & Mental da Fase:
                </span>
                <p className="text-neutral-300 leading-relaxed bg-black/40 p-3 rounded-xl border border-neutral-800/80">
                  {etapaSelecionada.focoPrincipal}
                </p>
              </div>

              <div>
                <span className="font-bold text-neutral-300 uppercase tracking-wider block text-[11px] mb-1">
                  📖 Filosofia no Caminho da Montanha:
                </span>
                <p className="text-neutral-400 leading-relaxed">
                  {etapaSelecionada.descricao}
                </p>
              </div>
            </div>
          </div>

          {/* Frase Inspiradora do Mestre */}
          <div className="bg-red-950/20 border border-red-900/40 p-4 rounded-2xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-red-600/20 text-red-500 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed italic">
              "A faixa preta é simplesmente uma faixa branca que nunca desistiu da escalada. Mantenha a presença diária no tatame e o cume chegará naturalmente."
              <strong className="block text-white not-italic mt-0.5 text-[11px]">
                — Mestre Rogério • Família Gorillaz BJJ
              </strong>
            </p>
          </div>
        </div>
      </div>

      {/* Modal Lightbox / Tela Cheia do Infográfico */}
      {modalFullscreen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col p-4 sm:p-6 overflow-y-auto animate-fade-in"
          onClick={() => setModalFullscreen(false)}
        >
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800 max-w-5xl w-full mx-auto">
            <div className="flex items-center gap-2">
              <Mountain className="w-5 h-5 text-red-500" />
              <h3 className="text-lg font-bold font-['Oswald',sans-serif] uppercase text-white tracking-wide">
                A Montanha da Graduação • Infográfico Oficial em Alta Definição
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setModalFullscreen(false)}
              className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition cursor-pointer"
              title="Fechar tela cheia"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div
            className="flex-1 flex items-center justify-center my-auto p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={mountainSrc}
              alt="A Montanha da Graduação Completa"
              className="max-h-[85vh] max-w-full w-auto object-contain rounded-2xl border-2 border-red-900/50 shadow-2xl"
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                if (!target.src.includes('montanha-graduacao.png.jpg')) {
                  target.src = '/montanha-graduacao.png.jpg';
                }
              }}
            />
          </div>

          <div className="text-center pt-2 max-w-md mx-auto text-xs text-neutral-400">
            Pressione <kbd className="px-2 py-0.5 rounded bg-neutral-800 text-white font-mono text-[10px]">ESC</kbd> ou clique fora da imagem para voltar ao painel.
          </div>
        </div>
      )}
    </div>
  );
};

export default GraduacaoMountainMap;
