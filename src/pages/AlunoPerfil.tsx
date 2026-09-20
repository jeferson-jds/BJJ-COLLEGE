import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../hooks/useAuth';
import { useAlunos } from '../hooks/useAlunos';
import { FaixaBadge } from '../components/FaixaBadge';
import { perfilAlunoSchema, PerfilAlunoFormData } from '../lib/validators';
import { isRealSupabaseConfigured, supabase } from '../lib/supabase';
import { localStore } from '../lib/store';
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
  CheckCircle,
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

    // Validação de tipo e tamanho
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
      if (isRealSupabaseConfigured && user) {
        const fileExt = file.name.split('.').pop();
        const filePath = `${user.id}/avatar.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('fotos_alunos')
          .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: edgeData, error: edgeError } = await supabase.functions.invoke(
          'get-signed-photo-url',
          { body: { path: filePath } }
        );

        const newPhotoUrl =
          !edgeError && edgeData?.signedUrl
            ? edgeData.signedUrl
            : supabase.storage.from('fotos_alunos').getPublicUrl(filePath).data.publicUrl;

        await updateProfilePhoto(newPhotoUrl);
        setPreviewPhoto(newPhotoUrl);
      } else {
        // Modo local
        const reader = new FileReader();
        reader.onload = async (event) => {
          const base64 = event.target?.result as string;
          setPreviewPhoto(base64);
          await updateProfilePhoto(base64);
          toast.success('Foto atualizada com sucesso!');
        };
        reader.readAsDataURL(file);
      }
      toast.success('Foto de perfil salva com sucesso!');
    } catch (err) {
      toast.error((err as Error).message || 'Erro no upload da foto.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const onSubmit = async (data: PerfilAlunoFormData) => {
    setIsSaving(true);
    try {
      if (isRealSupabaseConfigured && profile) {
        const { error } = await (supabase.from('profiles') as any)
          .update({
            nome_completo: data.nome_completo,
            telefone: data.telefone || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', profile.id);

        if (error) throw error;
      } else if (profile) {
        const profiles = localStore.getProfiles();
        const idx = profiles.findIndex((p) => p.id === profile.id);
        if (idx >= 0) {
          profiles[idx].nome_completo = data.nome_completo;
          profiles[idx].telefone = data.telefone || null;
          localStore.saveProfiles(profiles);
        }
      }
      toast.success('Dados pessoais atualizados com sucesso!');
    } catch (err) {
      toast.error((err as Error).message || 'Erro ao atualizar dados.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-20 md:pb-6">
      <div>
        <h1 className="text-2xl font-black uppercase tracking-tight text-neutral-900 font-sans">
          Meus Dados no BJJ College
        </h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Mantenha seus dados de contato e foto atualizados para a secretaria do Dojo
        </p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200/80 shadow-xs space-y-6">
        {/* Upload de Foto Circular */}
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-neutral-100">
          <div className="relative group">
            <img
              src={
                previewPhoto ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
              }
              alt="Minha Foto"
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-neutral-100 shadow-md"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingPhoto}
              className="absolute bottom-0 right-0 p-2 bg-neutral-950 hover:bg-neutral-800 text-white rounded-full shadow-lg border-2 border-white transition-all active:scale-95"
              title="Trocar foto"
            >
              <Camera className="w-4 h-4 text-red-500" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/webp"
              onChange={handlePhotoSelect}
              className="hidden"
            />
          </div>

          <div className="text-center sm:text-left space-y-1">
            <h2 className="text-base font-bold text-neutral-900">
              Foto de Perfil do Guerreiro
            </h2>
            <p className="text-xs text-neutral-500">
              Formatos aceitos: JPG, PNG ou WebP (Máximo 5MB).
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingPhoto}
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700"
            >
              <UploadCloud className="w-4 h-4" />
              <span>{isUploadingPhoto ? 'Enviando foto...' : 'Escolher nova foto'}</span>
            </button>
          </div>
        </div>

        {/* Formulário de Dados */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
              Nome Completo *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
              <input
                type="text"
                {...register('nome_completo')}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-300 text-sm focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none text-neutral-900 font-medium"
              />
            </div>
            {errors.nome_completo && (
              <p className="text-xs text-red-600 mt-1">{errors.nome_completo.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
              E-mail de Acesso (Não editável)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
              <input
                type="email"
                value={user?.email || profile?.email || ''}
                disabled
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-200 bg-neutral-100 text-sm text-neutral-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
              Telefone / WhatsApp
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="(11) 99999-9999"
                {...register('telefone')}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-300 text-sm focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none text-neutral-900"
              />
            </div>
            {errors.telefone && (
              <p className="text-xs text-red-600 mt-1">{errors.telefone.message}</p>
            )}
          </div>

          {/* Faixa Atual (Somente Leitura para o Aluno) */}
          <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-neutral-400" />
                <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                  Faixa Atual de Jiu Jitsu
                </span>
              </div>
              <FaixaBadge
                faixa={(alunoData?.faixa_atual as FaixaBJJ) || 'branca'}
                size="sm"
              />
            </div>
            <p className="text-[11px] text-neutral-500 leading-relaxed">
              Por razões de hierarquia e integridade técnica do Jiu Jitsu, apenas o <strong>Prof. Rogério</strong> tem autorização para graduar e alterar faixas de alunos no sistema.
            </p>
          </div>

          {/* Botão Salvar */}
          <div className="flex justify-end pt-3">
            <button
              id="btn-salvar-perfil-aluno"
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-neutral-950 hover:bg-neutral-900 active:scale-95 text-white font-bold text-xs rounded-xl transition-all shadow-md"
            >
              {isSaving ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4 text-red-500" />
                  <span>Salvar Meus Dados</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
