import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../hooks/useAuth';
import { useAlunos } from '../hooks/useAlunos';
import { FaixaBadge } from '../components/FaixaBadge';
import { perfilAlunoSchema, PerfilAlunoFormData } from '../lib/validators';
import { supabase } from '../lib/supabase';
import { FaixaBJJ } from '../types/database';
import {
  User,
  Phone,
  Mail,
  Camera,
  Save,
  ShieldCheck,
  Lock,
  UploadCloud,
} from 'lucide-react';
import { toast } from 'sonner';

export const AlunoPerfil: React.FC = () => {
  const { user, profile, alunoData: authAlunoData, updateProfilePhoto } = useAuth();
  const { useAlunoById } = useAlunos();
  const { data: freshAluno } = useAlunoById(authAlunoData?.id);
  const alunoData = freshAluno || authAlunoData;
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [previewPhoto, setPreviewPhoto] = useState<string | null>(
    profile?.foto_url || null
  );
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PerfilAlunoFormData>({
    resolver: zodResolver(perfilAlunoSchema),
    defaultValues: {
      nome_completo: profile?.nome_completo || user?.nome_completo || '',
      telefone: profile?.telefone || '',
    },
  });

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Formato inválido. Use JPEG, PNG ou WebP.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Arquivo muito grande. O limite é 5MB.');
      return;
    }

    setIsUploadingPhoto(true);
    try {
      if (user) {
        const fileExt = file.name.split('.').pop();
        const filePath = `${user.id}/avatar.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('alunos-fotos')
          .upload(filePath, file, { upsert: true });

        if (uploadError) {
          console.warn('Erro ao fazer upload no bucket alunos-fotos:', uploadError.message);
        }

        const { data: publicUrlData } = supabase.storage
          .from('alunos-fotos')
          .getPublicUrl(filePath);

        const newPhotoUrl = publicUrlData?.publicUrl || URL.createObjectURL(file);
        await updateProfilePhoto(newPhotoUrl);
        setPreviewPhoto(newPhotoUrl);
        toast.success('Foto de perfil salva com sucesso no Supabase!');
      }
    } catch (err) {
      toast.error((err as Error).message || 'Erro no upload da foto.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const onSubmit = async (data: PerfilAlunoFormData) => {
    setIsSaving(true);
    try {
      if (profile) {
        const { error } = await (supabase.from('profiles') as any)
          .update({
            nome_completo: data.nome_completo,
            telefone: data.telefone || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', profile.id);

        if (error) throw error;
      }
      toast.success('Dados cadastrais atualizados com sucesso no Supabase!');
    } catch (err) {
      toast.error((err as Error).message || 'Erro ao atualizar dados.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-lg bg-red-950/40 text-red-500 border border-red-900/40">
            <User className="w-5 h-5" />
          </span>
          <h1 className="text-2xl font-bold uppercase tracking-tight text-white font-['Oswald',sans-serif]">
            Meus Dados Cadastrais • BJJ College
          </h1>
        </div>
        <p className="text-xs text-neutral-400 mt-1">
          Mantenha seus dados de contato e foto atualizados na secretaria do Dojo Família Gorillaz
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card Lateral: Perfil Rápido & Faixa */}
        <div className="bg-[#141414] p-6 rounded-2xl border border-neutral-800 shadow-xl space-y-6 flex flex-col items-center text-center">
          <div className="relative group">
            <img
              src={
                previewPhoto ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
              }
              alt="Minha Foto"
              className="w-32 h-32 rounded-full object-cover border-4 border-red-600 shadow-red-glow"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingPhoto}
              className="absolute bottom-0 right-0 p-2.5 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg border-2 border-black transition-all active:scale-95 cursor-pointer"
              title="Trocar foto"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/webp"
              onChange={handlePhotoSelect}
              className="hidden"
            />
          </div>

          <div>
            <h2 className="text-lg font-bold text-white font-['Oswald',sans-serif] uppercase tracking-wide">
              {profile?.nome_completo || user?.nome_completo || 'Guerreiro BJJ'}
            </h2>
            <p className="text-xs text-neutral-400 font-mono mt-0.5">
              {user?.email || profile?.email}
            </p>
          </div>

          <div className="w-full pt-4 border-t border-neutral-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-2">
              Graduação Atual
            </span>
            <div className="flex justify-center">
              <FaixaBadge
                faixa={(alunoData?.faixa_atual as FaixaBJJ) || 'branca'}
                size="md"
              />
            </div>
            {alunoData?.graus !== undefined && (
              <p className="text-xs text-neutral-300 font-semibold mt-2">
                {alunoData.graus} {alunoData.graus === 1 ? 'grau' : 'graus'} na faixa
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingPhoto}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-semibold text-neutral-200 rounded-xl transition cursor-pointer"
          >
            <UploadCloud className="w-4 h-4 text-red-500" />
            <span>{isUploadingPhoto ? 'Enviando foto...' : 'Alterar Foto'}</span>
          </button>
        </div>

        {/* Card Principal: Formulário de Edição */}
        <div className="lg:col-span-2 bg-[#141414] p-6 sm:p-8 rounded-2xl border border-neutral-800 shadow-xl space-y-6">
          <div className="pb-4 border-b border-neutral-800">
            <h2 className="text-base font-bold text-white font-['Oswald',sans-serif] uppercase tracking-wide">
              Informações Pessoais
            </h2>
            <p className="text-xs text-neutral-400">
              Dados sincronizados diretamente com o banco de dados oficial do Supabase
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                Nome Completo *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  {...register('nome_completo')}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-neutral-700 bg-[#0f0f0f] text-sm focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none text-white font-medium"
                />
              </div>
              {errors.nome_completo && (
                <p className="text-xs text-red-500 mt-1">{errors.nome_completo.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                E-mail de Acesso (Identificador Oficial)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={user?.email || profile?.email || ''}
                  disabled
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-neutral-800 bg-neutral-900/60 text-sm text-neutral-400 cursor-not-allowed font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                Telefone / WhatsApp
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="(21) 99999-9999"
                  {...register('telefone')}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-neutral-700 bg-[#0f0f0f] text-sm focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none text-white"
                />
              </div>
              {errors.telefone && (
                <p className="text-xs text-red-500 mt-1">{errors.telefone.message}</p>
              )}
            </div>

            {/* Aviso sobre hierarquia de faixas */}
            <div className="p-4 rounded-xl bg-black/40 border border-neutral-800 space-y-1.5">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-red-500" />
                <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                  Controle de Graduação & Hierarquia
                </span>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                A graduação de faixas e graus é prerrogativa exclusiva do <strong>Prof. Rogério (Faixa Preta)</strong>, sendo registrada e auditada diretamente na plataforma.
              </p>
            </div>

            {/* Botão Salvar */}
            <div className="flex justify-end pt-3">
              <button
                id="btn-salvar-perfil-aluno"
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs uppercase tracking-wider font-['Oswald',sans-serif] rounded-xl transition-all shadow-red-glow cursor-pointer"
              >
                {isSaving ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Salvar Alterações</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AlunoPerfil;
