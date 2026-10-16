import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAvisos } from '../hooks/useAvisos';
import { useConfiguracoes } from '../hooks/useConfiguracoes';
import { Modal } from '../components/Modal';
import { EmptyState } from '../components/EmptyState';
import { SkeletonList } from '../components/SkeletonLoader';
import { novoAvisoSchema, NovoAvisoFormData } from '../lib/validators';
import { formatDateBR } from '../lib/utils';
import { Megaphone, Plus, Trash2, ShieldCheck, Calendar, Pin } from 'lucide-react';

export const AdminAvisos: React.FC = () => {
  const { data: config } = useConfiguracoes();
  const nomeProfessor = config?.nome_professor || 'Rogério';

  const {
    avisos,
    isLoading,
    createAviso,
    isCreating,
    deleteAviso,
    isDeleting,
    toggleAtivoAviso,
  } = useAvisos();

  const [modalNovo, setModalNovo] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NovoAvisoFormData>({
    resolver: zodResolver(novoAvisoSchema),
    defaultValues: {
      titulo: '',
      conteudo: '',
      ativo: true,
    },
  });

  const onSubmit = async (data: NovoAvisoFormData) => {
    try {
      await createAviso(data);
      reset();
      setModalNovo(false);
    } catch {
      // Toast no hook
    }
  };

  const handleDelete = async (id: string, titulo: string) => {
    if (window.confirm(`Tem certeza que deseja remover o comunicado "${titulo}" do mural?`)) {
      await deleteAviso(id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-20 md:pb-6">
      {/* 1. ESTRUTURA DO PERFIL OFICIAL DO MESTRE & MURAL */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0a0a0a] via-[#141414] to-red-950/40 p-6 sm:p-8 rounded-3xl border border-red-900/40 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Foto Oficial do Mestre */}
            <div className="relative shrink-0">
              <img
                src="/images/professor.jpg"
                alt={`Prof. ${nomeProfessor}`}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-red-600 object-cover shadow-red-glow"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';
                }}
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-red-600/20 text-red-400 border border-red-500/40">
                  ★ MURAL DO MESTRE ★
                </span>
                <span className="text-xs text-neutral-400 font-mono">Família Gorillaz BJJ</span>
              </div>

              <h1 className="font-['Oswald',sans-serif] font-bold text-2xl sm:text-3xl lg:text-4xl text-white tracking-wide uppercase mt-1">
                Prof. {nomeProfessor} • Faixa Preta 4º Grau
              </h1>

              <p className="text-xs sm:text-sm text-neutral-300 font-medium mt-1">
                Canal oficial de comunicados, diretrizes do dojo, avisos de graduação e recados aos alunos.
              </p>
            </div>
          </div>

          <button
            id="btn-novo-aviso"
            type="button"
            onClick={() => setModalNovo(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs uppercase tracking-wider font-['Oswald',sans-serif] rounded-xl transition-all shadow-red-glow cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Publicar Comunicado Oficial</span>
          </button>
        </div>
      </div>

      {/* 2. LISTA DE COMUNICADOS DO MURAL */}
      {isLoading ? (
        <SkeletonList count={3} />
      ) : avisos.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="Nenhum comunicado publicado no mural"
          description="Publique seu primeiro comunicado oficial para que todos os alunos visualizem em tempo real no aplicativo."
          actionLabel="Publicar Primeiro Comunicado"
          onAction={() => setModalNovo(true)}
        />
      ) : (
        <div className="space-y-4">
          {avisos.map((aviso) => (
            <div
              key={aviso.id}
              className={`p-6 rounded-2xl border transition-all ${
                aviso.ativo
                  ? 'bg-[#141414] border-neutral-800 shadow-xl hover:border-red-900/50'
                  : 'bg-[#101010] border-neutral-800/40 opacity-60'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full ${
                        aviso.ativo
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                          : 'bg-neutral-800 text-neutral-400'
                      }`}
                    >
                      {aviso.ativo ? 'No Ar para Todos os Alunos' : 'Oculto'}
                    </span>
                    <span className="text-xs text-neutral-400 flex items-center gap-1 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                      {formatDateBR(aviso.created_at)}
                    </span>
                    <span className="text-xs text-red-400 font-semibold flex items-center gap-1">
                      <Pin className="w-3.5 h-3.5" />
                      Mestre {nomeProfessor}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white font-['Oswald',sans-serif] tracking-wide uppercase">
                    {aviso.titulo}
                  </h3>

                  <p className="text-sm text-neutral-300 whitespace-pre-line leading-relaxed">
                    {aviso.conteudo}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
                  <button
                    type="button"
                    onClick={() => toggleAtivoAviso({ id: aviso.id, ativo: !aviso.ativo })}
                    className={`px-3 py-1.5 text-xs font-bold uppercase rounded-lg border transition-colors cursor-pointer ${
                      aviso.ativo
                        ? 'bg-[#1a1a1a] hover:bg-[#252525] text-neutral-300 border-neutral-700'
                        : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                    }`}
                  >
                    {aviso.ativo ? 'Ocultar' : 'Publicar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(aviso.id, aviso.titulo)}
                    disabled={isDeleting}
                    className="p-2 text-neutral-500 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                    title="Excluir comunicado"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: NOVO AVISO OFICIAL */}
      <Modal
        isOpen={modalNovo}
        onClose={() => setModalNovo(false)}
        title="Publicar Comunicado Oficial no Mural"
        description="O aviso será exibido com destaque oficial no dashboard de todos os alunos do BJJ College."
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1">
              Título do Comunicado *
            </label>
            <input
              type="text"
              placeholder="Ex: Seminário Especial de Raspagens e Defesa Pessoal"
              {...register('titulo')}
              className="w-full p-2.5 text-sm rounded-xl border border-neutral-700 bg-[#0f0f0f] text-white outline-none focus:ring-2 focus:ring-red-600 placeholder:text-neutral-500"
            />
            {errors.titulo && (
              <p className="text-xs text-red-500 mt-1">{errors.titulo.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1">
              Mensagem do Mestre *
            </label>
            <textarea
              rows={5}
              placeholder="Descreva as instruções oficiais, horários, vestimenta (kimono/no-gi) e avisos gerais..."
              {...register('conteudo')}
              className="w-full p-2.5 text-sm rounded-xl border border-neutral-700 bg-[#0f0f0f] text-white outline-none focus:ring-2 focus:ring-red-600 placeholder:text-neutral-500 leading-relaxed"
            />
            {errors.conteudo && (
              <p className="text-xs text-red-500 mt-1">{errors.conteudo.message}</p>
            )}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="check-ativo"
              {...register('ativo')}
              className="w-4 h-4 text-red-600 rounded border-neutral-700 bg-neutral-900 focus:ring-red-500"
            />
            <label htmlFor="check-ativo" className="text-xs text-neutral-300 font-semibold cursor-pointer">
              Disponibilizar imediatamente para todos os alunos
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
            <button
              type="button"
              onClick={() => setModalNovo(false)}
              className="px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider font-['Oswald',sans-serif] text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-red-glow cursor-pointer"
            >
              {isCreating ? 'Publicando...' : 'Publicar no Mural'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminAvisos;
