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
import { Megaphone, Plus, Trash2, Edit3, Pin, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

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
    if (window.confirm(`Tem certeza que deseja remover o aviso "${titulo}"?`)) {
      await deleteAviso(id);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-red-600" />
            <h1 className="text-2xl font-black uppercase tracking-tight text-neutral-900 font-sans">
              Mural de Avisos da BJJ College
            </h1>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Comunique seminários, horários especiais, graduações e avisos do Prof. {nomeProfessor}
          </p>
        </div>

        <button
          id="btn-novo-aviso"
          type="button"
          onClick={() => setModalNovo(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-neutral-950 hover:bg-neutral-900 text-white font-bold text-xs rounded-xl transition-all shadow-md active:scale-95"
        >
          <Plus className="w-4 h-4 text-red-500" />
          <span>Publicar Novo Aviso</span>
        </button>
      </div>

      {/* Lista de Avisos */}
      {isLoading ? (
        <SkeletonList count={3} />
      ) : avisos.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="Nenhum aviso publicado"
          description="Publique seu primeiro comunicado oficial para que todos os alunos visualizem em tempo real no app."
          actionLabel="Publicar Aviso"
          onAction={() => setModalNovo(true)}
        />
      ) : (
        <div className="space-y-4">
          {avisos.map((aviso) => (
            <div
              key={aviso.id}
              className={`bg-white p-5 rounded-2xl border transition-all ${
                aviso.ativo
                  ? 'border-neutral-200/80 shadow-xs'
                  : 'border-neutral-200/40 opacity-60 bg-neutral-50/50'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        aviso.ativo
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-neutral-100 text-neutral-500'
                      }`}
                    >
                      {aviso.ativo ? 'Publicado' : 'Oculto'}
                    </span>
                    <span className="text-xs text-neutral-400">
                      {formatDateBR(aviso.created_at)}
                    </span>
                    <span className="text-xs text-neutral-400">• Autor: Prof. {nomeProfessor}</span>
                  </div>
                  <h3 className="text-base font-bold text-neutral-900">{aviso.titulo}</h3>
                  <p className="text-xs sm:text-sm text-neutral-600 whitespace-pre-line leading-relaxed">
                    {aviso.conteudo}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
                  <button
                    type="button"
                    onClick={() => toggleAtivoAviso({ id: aviso.id, ativo: !aviso.ativo })}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                      aviso.ativo
                        ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border-neutral-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {aviso.ativo ? 'Ocultar' : 'Publicar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(aviso.id, aviso.titulo)}
                    disabled={isDeleting}
                    className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

      {/* MODAL: NOVO AVISO */}
      <Modal
        isOpen={modalNovo}
        onClose={() => setModalNovo(false)}
        title="Publicar Comunicado no Mural"
        description="O aviso ficará visível instantaneamente para todos os alunos no topo do dashboard do aluno."
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-neutral-700 mb-1">
              Título do Comunicado *
            </label>
            <input
              type="text"
              placeholder="Ex: Treino de Kimono Especial de Sábado com o Mestre"
              {...register('titulo')}
              className="w-full p-2.5 text-sm rounded-xl border border-neutral-300 outline-none focus:ring-2 focus:ring-red-600"
            />
            {errors.titulo && (
              <p className="text-xs text-red-600 mt-1">{errors.titulo.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-neutral-700 mb-1">
              Conteúdo do Comunicado *
            </label>
            <textarea
              rows={5}
              placeholder="Escreva os detalhes, datas, horários e orientações para os alunos..."
              {...register('conteudo')}
              className="w-full p-2.5 text-sm rounded-xl border border-neutral-300 outline-none focus:ring-2 focus:ring-red-600"
            />
            {errors.conteudo && (
              <p className="text-xs text-red-600 mt-1">{errors.conteudo.message}</p>
            )}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="check-ativo"
              {...register('ativo')}
              className="w-4 h-4 text-red-600 rounded border-neutral-300 focus:ring-red-500"
            />
            <label htmlFor="check-ativo" className="text-xs text-neutral-700 font-semibold cursor-pointer">
              Publicar imediatamente no mural de todos os alunos
            </label>
          </div>

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
              disabled={isCreating}
              className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs"
            >
              {isCreating ? 'Publicando...' : 'Publicar no Mural'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
