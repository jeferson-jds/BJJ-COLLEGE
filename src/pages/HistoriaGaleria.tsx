import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ACERVO_HISTORICO, FotoAcervo } from '../data/acervoHistorico';
import { useConfiguracoes } from '../hooks/useConfiguracoes';
import {
  History,
  Camera,
  Award,
  ShieldCheck,
  Calendar,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Flame,
  Users,
  Compass,
  ArrowRight,
  Phone,
  Heart,
  Quote,
} from 'lucide-react';

type CategoriaFiltro = 'todas' | 'primeiros_alunos' | 'treinos_raiz' | 'graduacoes' | 'competicoes' | 'mestre';

export const HistoriaGaleria: React.FC = () => {
  const { data: config } = useConfiguracoes();
  const [categoriaAtiva, setCategoriaAtiva] = useState<CategoriaFiltro>('todas');
  const [fotoSelecionada, setFotoSelecionada] = useState<FotoAcervo | null>(null);

  const fotosFiltradas = ACERVO_HISTORICO.filter((foto) => {
    if (categoriaAtiva === 'todas') return true;
    return foto.categoria === categoriaAtiva;
  });

  // Navegação no Lightbox
  const handleNextPhoto = () => {
    if (!fotoSelecionada) return;
    const currentIndex = fotosFiltradas.findIndex((f) => f.id === fotoSelecionada.id);
    const nextIndex = (currentIndex + 1) % fotosFiltradas.length;
    setFotoSelecionada(fotosFiltradas[nextIndex]);
  };

  const handlePrevPhoto = () => {
    if (!fotoSelecionada) return;
    const currentIndex = fotosFiltradas.findIndex((f) => f.id === fotoSelecionada.id);
    const prevIndex = (currentIndex - 1 + fotosFiltradas.length) % fotosFiltradas.length;
    setFotoSelecionada(fotosFiltradas[prevIndex]);
  };

  // Suporte a teclado no lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!fotoSelecionada) return;
      if (e.key === 'Escape') setFotoSelecionada(null);
      if (e.key === 'ArrowRight') handleNextPhoto();
      if (e.key === 'ArrowLeft') handlePrevPhoto();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fotoSelecionada, fotosFiltradas]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 pb-24 md:pb-12">
      {/* 1. HERO BANNER: HISTÓRIA & ACERVO */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#180a0a] via-[#101010] to-[#0a0a0a] border border-red-900/50 shadow-2xl p-6 sm:p-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-red-950/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 justify-between">
          <div className="space-y-4 max-w-2xl text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-800/80 text-red-400 text-xs font-bold tracking-widest uppercase font-['Oswald',sans-serif]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Memória Viva • Família Gorillaz BJJ</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold uppercase font-['Oswald',sans-serif] tracking-wider text-white leading-tight">
              História, Tradição & <span className="text-red-600">Acervo dos Primeiros Alunos</span>
            </h1>

            <p className="text-neutral-300 text-sm sm:text-base leading-relaxed">
              O Jiu-Jitsu não é construído em um dia. Cada faixa neste tatame carrega o suor,
              a lealdade e a dedicação das primeiras turmas que desbravaram o caminho.
              Conheça a trajetória do Mestre Rogério e o arquivo fotográfico que documenta a fundação da Família Gorillaz.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href="#mestre"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider font-['Oswald',sans-serif] shadow-red-glow transition-all"
              >
                <span>Conhecer o Mestre</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href="#galeria"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 hover:text-white border border-neutral-700 font-bold text-xs uppercase tracking-wider font-['Oswald',sans-serif] transition-all"
              >
                <Camera className="w-4 h-4 text-red-500" />
                <span>Explorar Galeria ({ACERVO_HISTORICO.length} Fotos)</span>
              </a>
            </div>
          </div>

          {/* Destaque com o Brasão e Foto do Mestre */}
          <div className="relative shrink-0 w-full sm:w-auto flex justify-center">
            <div className="relative group">
              <div className="w-56 h-72 sm:w-64 sm:h-80 rounded-2xl overflow-hidden border-2 border-red-600 shadow-2xl relative bg-black">
                <img
                  src="/images/professor.jpg"
                  alt="Mestre Rogério • Gorillaz BJJ"
                  className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/images/logo-gorillaz.jpg';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 text-left">
                  <span className="text-[10px] font-black uppercase text-red-500 tracking-widest block font-['Oswald',sans-serif]">
                    Liderança & Fundador
                  </span>
                  <h3 className="text-lg font-bold text-white uppercase font-['Oswald',sans-serif] leading-tight">
                    Prof. {config?.nome_professor || 'Rogério'}
                  </h3>
                  <p className="text-[11px] text-neutral-300 font-medium">
                    Faixa Preta 4º Grau • Família Gorillaz
                  </p>
                </div>
              </div>

              {/* Selo circular de tradição */}
              <div className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full bg-red-600 border-4 border-[#0a0a0a] flex flex-col items-center justify-center text-white shadow-xl text-center">
                <Flame className="w-5 h-5" />
                <span className="text-[9px] font-black tracking-tighter uppercase font-['Oswald',sans-serif]">
                  OSS!
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SEÇÃO: PERFIL & TRAJETÓRIA DO MESTRE */}
      <section id="mestre" className="space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b border-neutral-800">
          <Award className="w-6 h-6 text-red-500" />
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold font-['Oswald',sans-serif] uppercase tracking-wide text-white">
              Perfil do Mestre • Liderança do Tatame
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400">
              A filosofia marcial, raízes técnicas e compromisso com o desenvolvimento humano de cada aluno.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Card Biografia & Filosofia */}
          <div className="lg:col-span-8 bg-[#141414] rounded-3xl p-6 sm:p-8 border border-neutral-800 shadow-xl space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-950/60 border border-red-800/40 flex items-center justify-center text-red-500">
                  <Quote className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white uppercase font-['Oswald',sans-serif]">
                    "O tatame é a escola da vida: quem aprende a cair, nunca teme se levantar."
                  </h3>
                  <p className="text-xs text-red-500 font-mono font-semibold">
                    — Mestre Rogério, Fundador da Gorillaz
                  </p>
                </div>
              </div>

              <div className="text-neutral-300 text-sm leading-relaxed space-y-3 font-sans">
                <p>
                  Com décadas dedicadas integralmente ao aprendizado e ensino da Arte Suave, o{' '}
                  <strong className="text-white">Prof. Rogério</strong> construiu a{' '}
                  <strong className="text-white">Família Gorillaz Jiu-Jitsu</strong> com base em três pilares
                  inegociáveis: <em>humildade, disciplina técnica e irmandade</em>.
                </p>
                <p>
                  Desde os primeiros treinos em condições modestas até a consolidação da academia como referência
                  de técnica e formação de caráter, sua missão permanece a mesma: proporcionar a cada aluno — da criança
                  ao adulto, do iniciante ao competidor — um ambiente seguro, acolhedor e com o mais alto rigor técnico.
                </p>
                <p>
                  A graduação na Gorillaz não é um presente comercial; é a conquista honesta e reconhecida de cada etapa
                  da escalada marcial, pautada nos tempos mínimos e na sabedoria da linhagem clássica da IBJJF.
                </p>
              </div>
            </div>

            {/* Pilares da Academia */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-neutral-800/80">
              <div className="bg-[#0e0e0e] p-3.5 rounded-2xl border border-neutral-800">
                <ShieldCheck className="w-5 h-5 text-red-500 mb-2" />
                <h4 className="text-xs font-bold text-white uppercase font-['Oswald',sans-serif]">
                  Tradição & Raiz
                </h4>
                <p className="text-[11px] text-neutral-400 mt-1">
                  Respeito absoluto à linhagem do Jiu-Jitsu clássico e à integridade física do atleta.
                </p>
              </div>

              <div className="bg-[#0e0e0e] p-3.5 rounded-2xl border border-neutral-800">
                <Users className="w-5 h-5 text-amber-500 mb-2" />
                <h4 className="text-xs font-bold text-white uppercase font-['Oswald',sans-serif]">
                  Espírito de Família
                </h4>
                <p className="text-[11px] text-neutral-400 mt-1">
                  O tatame como extensão do lar, onde cada vitória é celebrada em equipe.
                </p>
              </div>

              <div className="bg-[#0e0e0e] p-3.5 rounded-2xl border border-neutral-800">
                <Compass className="w-5 h-5 text-emerald-500 mb-2" />
                <h4 className="text-xs font-bold text-white uppercase font-['Oswald',sans-serif]">
                  Evolução Contínua
                </h4>
                <p className="text-[11px] text-neutral-400 mt-1">
                  Metodologia moderna de treinos voltada para defesa pessoal e competição de alto nível.
                </p>
              </div>
            </div>
          </div>

          {/* Card Contato & Informações Oficiais */}
          <div className="lg:col-span-4 bg-[#141414] rounded-3xl p-6 sm:p-8 border border-neutral-800 shadow-xl space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-full h-48 rounded-2xl overflow-hidden border border-neutral-800 relative bg-black">
                <img
                  src="/images/logo-gorillaz.jpg"
                  alt="Gorillaz Logo Oficial"
                  className="w-full h-full object-contain p-4"
                />
              </div>

              <div>
                <h3 className="text-base font-bold text-white uppercase font-['Oswald',sans-serif]">
                  Atendimento Oficial & Matrículas
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Fale diretamente com o Mestre Rogério para dúvidas sobre treinos, horários e graduações.
                </p>
              </div>

              <div className="space-y-2.5 pt-2">
                <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-emerald-500" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                        WhatsApp Oficial
                      </span>
                      <span className="text-xs font-bold text-white font-mono">
                        (21) 99154-5136
                      </span>
                    </div>
                  </div>
                  <a
                    href="https://wa.me/5521991545136"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold font-['Oswald',sans-serif] uppercase tracking-wider transition-colors"
                  >
                    Chamar
                  </a>
                </div>

                <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                    Chave PIX da Academia
                  </span>
                  <span className="text-xs font-bold text-white font-mono block mt-0.5">
                    21991545136 (Telefone)
                  </span>
                  <span className="text-[10px] text-neutral-500">
                    Titular: Rogério • Família Gorillaz BJJ
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-800">
              <Link
                to="/aluno"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 text-xs font-bold uppercase tracking-wider font-['Oswald',sans-serif] transition-all"
              >
                <Compass className="w-4 h-4 text-red-500" />
                <span>Voltar para Área do Aluno</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SEÇÃO: GALERIA & ACERVO HISTÓRICO */}
      <section id="galeria" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <Camera className="w-6 h-6 text-red-500" />
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold font-['Oswald',sans-serif] uppercase tracking-wide text-white">
                Acervo Fotográfico • Os Primeiros Guerreiros
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400">
                Registros históricos preservados da caminhada, primeiras graduações e encontros no tatame.
              </p>
            </div>
          </div>

          <span className="text-xs font-bold text-neutral-400 font-mono bg-neutral-900 px-3 py-1.5 rounded-xl border border-neutral-800 self-start sm:self-auto">
            {fotosFiltradas.length} {fotosFiltradas.length === 1 ? 'foto exibida' : 'fotos registradas'}
          </span>
        </div>

        {/* Filtros de Categoria */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'todas', label: 'Todas as Fotos', count: ACERVO_HISTORICO.length },
            {
              id: 'primeiros_alunos',
              label: 'Primeiros Alunos',
              count: ACERVO_HISTORICO.filter((f) => f.categoria === 'primeiros_alunos').length,
            },
            {
              id: 'treinos_raiz',
              label: 'Treinos Raiz',
              count: ACERVO_HISTORICO.filter((f) => f.categoria === 'treinos_raiz').length,
            },
            {
              id: 'graduacoes',
              label: 'Graduações',
              count: ACERVO_HISTORICO.filter((f) => f.categoria === 'graduacoes').length,
            },
            {
              id: 'competicoes',
              label: 'Competições',
              count: ACERVO_HISTORICO.filter((f) => f.categoria === 'competicoes').length,
            },
            {
              id: 'mestre',
              label: 'O Mestre',
              count: ACERVO_HISTORICO.filter((f) => f.categoria === 'mestre').length,
            },
          ].map((filtro) => {
            const isActive = categoriaAtiva === filtro.id;
            return (
              <button
                key={filtro.id}
                type="button"
                onClick={() => setCategoriaAtiva(filtro.id as CategoriaFiltro)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider font-['Oswald',sans-serif] transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-red-600 text-white shadow-red-glow'
                    : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800'
                }`}
              >
                <span>{filtro.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-red-950 text-white' : 'bg-neutral-800 text-neutral-400'
                  }`}
                >
                  {filtro.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Grid Elegante de Fotografias */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {fotosFiltradas.map((foto) => (
            <div
              key={foto.id}
              onClick={() => setFotoSelecionada(foto)}
              className="group bg-[#141414] rounded-2xl border border-neutral-800 hover:border-red-600/60 transition-all duration-300 overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl flex flex-col justify-between"
            >
              {/* Moldura da Imagem */}
              <div className="relative aspect-[4/3] bg-black overflow-hidden">
                <img
                  src={foto.src}
                  alt={foto.titulo}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                  <span className="text-[11px] font-bold text-white uppercase tracking-wider font-['Oswald',sans-serif] flex items-center gap-1.5 bg-red-600/90 px-2 py-0.5 rounded-lg shadow-sm">
                    <Maximize2 className="w-3 h-3" />
                    <span>Expandir Foto</span>
                  </span>
                </div>

                {foto.destaque && (
                  <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-red-600 text-white text-[9px] font-black uppercase tracking-widest shadow-md">
                    Destaque
                  </span>
                )}
              </div>

              {/* Informações da Foto */}
              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono mb-1">
                    <span className="uppercase text-red-500 font-bold">
                      {foto.categoria.replace('_', ' ')}
                    </span>
                    <span>{foto.anoAproximado || 'Acervo Histórico'}</span>
                  </div>

                  <h3 className="text-sm font-bold text-white uppercase font-['Oswald',sans-serif] group-hover:text-red-500 transition-colors leading-snug">
                    {foto.titulo}
                  </h3>

                  <p className="text-xs text-neutral-400 line-clamp-2 mt-1 leading-relaxed">
                    {foto.descricao}
                  </p>
                </div>

                <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-red-500" />
                    <span>Memória BJJ</span>
                  </span>
                  <span className="group-hover:text-red-400 font-semibold transition-colors">
                    Ver detalhes ➔
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. MODAL / LIGHTBOX DE FOTO EM ALTA RESOLUÇÃO */}
      {fotoSelecionada && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-fade-in">
          <div className="relative max-w-5xl w-full bg-[#121212] border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
            {/* Header do Lightbox */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-800 bg-[#0e0e0e]">
              <div className="flex items-center gap-2.5">
                <Camera className="w-4 h-4 text-red-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-300 font-['Oswald',sans-serif]">
                  Acervo Histórico • {fotoSelecionada.titulo}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-neutral-400 font-mono hidden sm:inline">
                  Pressione ESC para fechar
                </span>
                <button
                  type="button"
                  onClick={() => setFotoSelecionada(null)}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                  title="Fechar"
                >
                  <X className="w-5 h-5 text-red-500" />
                </button>
              </div>
            </div>

            {/* Imagem Ampliada */}
            <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[350px]">
              <img
                src={fotoSelecionada.src}
                alt={fotoSelecionada.titulo}
                className="max-h-[65vh] w-auto max-w-full object-contain mx-auto select-none"
              />

              {/* Botões de Navegação Anterior / Próximo */}
              <button
                type="button"
                onClick={handlePrevPhoto}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-red-600 text-white transition-all cursor-pointer backdrop-blur-sm border border-white/10"
                title="Foto Anterior (Seta Esquerda)"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                type="button"
                onClick={handleNextPhoto}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-red-600 text-white transition-all cursor-pointer backdrop-blur-sm border border-white/10"
                title="Próxima Foto (Seta Direita)"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Rodapé com Detalhes */}
            <div className="p-5 bg-[#0e0e0e] border-t border-neutral-800 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white uppercase font-['Oswald',sans-serif]">
                    {fotoSelecionada.titulo}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-neutral-400 font-mono mt-0.5">
                    <span className="text-red-500 font-semibold">
                      Categoria: {fotoSelecionada.categoria.replace('_', ' ').toUpperCase()}
                    </span>
                    <span>•</span>
                    <span>{fotoSelecionada.anoAproximado || 'Acervo Família Gorillaz'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-400 font-mono">
                    Use as setas ◀ ▶ do teclado
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                {fotoSelecionada.descricao}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoriaGaleria;