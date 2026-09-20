import React, { useState, useEffect, useRef } from 'react';
import { useConfiguracoes } from '../hooks/useConfiguracoes';
import { isRealSupabaseConfigured, supabase } from '../lib/supabase';
import {
  Settings,
  QrCode,
  DollarSign,
  Calendar,
  Save,
  ShieldCheck,
  Building2,
  Copy,
  Check,
  Camera,
  User,
  Database,
  Code2,
} from 'lucide-react';
import { toast } from 'sonner';

export const AdminConfiguracoes: React.FC = () => {
  const { config, updateConfig, isUpdating } = useConfiguracoes();

  // Estados gerais
  const [chavePix, setChavePix] = useState(config.chave_pix);
  const [valorMensalidade, setValorMensalidade] = useState(config.valor_mensalidade);
  const [diaVencimento, setDiaVencimento] = useState(config.dia_vencimento);
  const [nomeAcademia, setNomeAcademia] = useState(config.nome_academia);
  const [nomeProfessor, setNomeProfessor] = useState(config.nome_professor);
  const [copied, setCopied] = useState(false);

  // Estados Perfil do Prof. Rogério
  const [professorFoto, setProfessorFoto] = useState<string>(() => {
    return localStorage.getItem('bjj_professor_foto') || '/images/professor.jpg';
  });
  const [professorBio, setProfessorBio] = useState<string>(() => {
    return (
      localStorage.getItem('bjj_professor_bio') ||
      'Faixa Preta 3º Grau, líder e fundador da Família Gorillaz Jiu-Jitsu. Dedicado a forjar guerreiros no tatame e cidadãos na vida.'
    );
  });
  const [selectedFotoFile, setSelectedFotoFile] = useState<File | null>(null);
  const [isUploadingFoto, setIsUploadingFoto] = useState(false);
  const [showSqlBucket, setShowSqlBucket] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (config) {
      setChavePix(config.chave_pix);
      setValorMensalidade(config.valor_mensalidade);
      setDiaVencimento(config.dia_vencimento);
      setNomeAcademia(config.nome_academia);
      setNomeProfessor(config.nome_professor);
    }
  }, [config]);

  // Manipula seleção de nova foto pelo usuário
  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione um arquivo de imagem válido (JPG ou PNG).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('A foto deve ter no máximo 5MB.');
      return;
    }

    setSelectedFotoFile(file);
    const previewUrl = URL.createObjectURL(file);
    setProfessorFoto(previewUrl);
    toast.info('Foto selecionada para pré-visualização. Clique em "Salvar Perfil do Professor".');
  };

  // Salvar perfil do professor com upload para Supabase Storage se configurado
  const handleSalvarPerfilProfessor = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploadingFoto(true);

    try {
      let finalFotoUrl = professorFoto;

      if (selectedFotoFile) {
        if (isRealSupabaseConfigured) {
          const fileExt = selectedFotoFile.name.split('.').pop() || 'jpg';
          const fileName = `professor_${Date.now()}.${fileExt}`;

          // Upload para o bucket privado 'professor-fotos'
          const { error: uploadError } = await supabase.storage
            .from('professor-fotos')
            .upload(fileName, selectedFotoFile, { upsert: true });

          if (uploadError) {
            console.warn('Erro ao enviar para Supabase Storage:', uploadError);
            throw new Error(`Falha no bucket: ${uploadError.message}`);
          }

          // Conforme especificação: bucket privado, usar createSignedUrl de 1h (3600 segundos)
          const { data: signedData, error: signError } = await supabase.storage
            .from('professor-fotos')
            .createSignedUrl(fileName, 3600);

          if (signError || !signedData?.signedUrl) {
            throw new Error('Falha ao gerar URL assinada da foto.');
          }

          finalFotoUrl = signedData.signedUrl;
        } else {
          // Fallback para persistência local
          const reader = new FileReader();
          await new Promise<void>((resolve) => {
            reader.onloadend = () => {
              if (reader.result) {
                finalFotoUrl = reader.result as string;
              }
              resolve();
            };
            reader.readAsDataURL(selectedFotoFile);
          });
        }
      }

      // Persistir no storage local
      localStorage.setItem('bjj_professor_foto', finalFotoUrl);
      localStorage.setItem('bjj_professor_bio', professorBio);
      setProfessorFoto(finalFotoUrl);
      setSelectedFotoFile(null);

      // Também sincroniza nome do professor nas configurações gerais
      await updateConfig({
        chave_pix: chavePix,
        valor_mensalidade: valorMensalidade,
        dia_vencimento: diaVencimento,
        nome_academia: nomeAcademia,
        nome_professor: nomeProfessor,
      });

      toast.success('Foto do professor atualizada com sucesso!');
    } catch (err) {
      console.error(err);
      toast.error((err as Error).message || 'Erro ao atualizar foto do professor.');
    } finally {
      setIsUploadingFoto(false);
    }
  };

  const handleSubmitGeral = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateConfig({
      chave_pix: chavePix,
      valor_mensalidade: valorMensalidade,
      dia_vencimento: diaVencimento,
      nome_academia: nomeAcademia,
      nome_professor: nomeProfessor,
    });
    toast.success('Configurações do Dojo salvas com sucesso!');
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(chavePix);
    setCopied(true);
    toast.success('Chave PIX copiada para a área de transferência!');
    setTimeout(() => setCopied(false), 2000);
  };

  const sqlStorageScript = `-- Bucket para fotos do professor e alunos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('professor-fotos', 'professor-fotos', false)
ON CONFLICT (id) DO NOTHING;

-- Política: qualquer autenticado pode ver a foto do professor
CREATE POLICY "Fotos do professor são visíveis para autenticados"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'professor-fotos');

-- Política: apenas admin pode fazer upload/update da foto do professor
CREATE POLICY "Apenas admin pode alterar foto do professor"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'professor-fotos' 
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Apenas admin pode atualizar foto do professor"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'professor-fotos' 
  AND public.has_role(auth.uid(), 'admin')
);`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlStorageScript);
    setCopiedSql(true);
    toast.success('Script SQL copiado com sucesso!');
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-red-600" />
          <h1 className="text-2xl font-black uppercase tracking-tight text-neutral-900 font-sans">
            Configurações da BJJ College
          </h1>
        </div>
        <p className="text-xs text-neutral-500 mt-0.5">
          Gestão da identidade do Prof. Rogério, parâmetros de cobrança e segurança
        </p>
      </div>

      {/* 1. SEÇÃO: PERFIL DO PROFESSOR (SOLICITADO) */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200/80 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-red-600" />
            <div>
              <h2 className="text-base font-bold text-neutral-900">
                Perfil do Professor
              </h2>
              <p className="text-xs text-neutral-500">
                Identidade visual e bio do mestre exibida aos alunos e no painel
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowSqlBucket(!showSqlBucket)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition cursor-pointer"
          >
            <Database className="w-3.5 h-3.5 text-neutral-500" />
            <span>{showSqlBucket ? 'Ocultar SQL Storage' : 'SQL do Bucket'}</span>
          </button>
        </div>

        {/* Bloco colapsável com o SQL oficial do bucket Supabase */}
        {showSqlBucket && (
          <div className="p-4 bg-neutral-950 text-neutral-200 rounded-xl space-y-2 border border-neutral-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-red-400 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5" />
                Script SQL: professor-fotos (Bucket Privado)
              </span>
              <button
                type="button"
                onClick={handleCopySql}
                className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-xs rounded text-neutral-300 flex items-center gap-1 cursor-pointer"
              >
                {copiedSql ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedSql ? 'Copiado!' : 'Copiar SQL'}</span>
              </button>
            </div>
            <pre className="text-[11px] font-mono overflow-x-auto p-3 bg-neutral-900 rounded border border-neutral-800 text-neutral-300">
              {sqlStorageScript}
            </pre>
            <p className="text-[10px] text-neutral-400">
              * Conforme especificação: bucket privado, com leitura para autenticados e gravação restrita a admin.
            </p>
          </div>
        )}

        <form onSubmit={handleSalvarPerfilProfessor} className="space-y-5">
          <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-neutral-50 border border-neutral-200/70">
            {/* Preview da foto atual com borda vermelha */}
            <div className="relative group">
              <img
                src={professorFoto}
                alt="Prof. Rogério"
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-red-600 object-cover shadow-lg"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/50 text-white rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <Camera className="w-6 h-6 mb-1" />
                <span className="text-[10px] font-bold uppercase">Trocar</span>
              </button>
            </div>

            <div className="flex-1 text-center sm:text-left space-y-2">
              <h3 className="text-sm font-bold text-neutral-900">
                Foto do Prof. Rogério
              </h3>
              <p className="text-xs text-neutral-500 max-w-sm">
                Esta foto será exibida no cabeçalho, no card de boas-vindas do painel e no mural de avisos da Família Gorillaz.
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFotoChange}
                className="hidden"
              />

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer transition"
                >
                  <Camera className="w-3.5 h-3.5 text-red-500" />
                  <span>Escolher Nova Foto</span>
                </button>
                {selectedFotoFile && (
                  <span className="text-xs text-emerald-600 font-medium">
                    ✓ {selectedFotoFile.name}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-neutral-700 mb-1">
                Nome do Mestre
              </label>
              <input
                type="text"
                value={nomeProfessor}
                onChange={(e) => setNomeProfessor(e.target.value)}
                className="w-full p-2.5 text-sm rounded-xl border border-neutral-300 outline-none focus:ring-2 focus:ring-red-600 font-semibold text-neutral-900"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-neutral-700 mb-1">
                Graduação / Título
              </label>
              <input
                type="text"
                defaultValue="Faixa Preta 3º Grau • Líder da Família Gorillaz"
                className="w-full p-2.5 text-sm rounded-xl border border-neutral-300 outline-none focus:ring-2 focus:ring-red-600 font-medium text-neutral-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-neutral-700 mb-1">
              Bio / Descrição do Professor
            </label>
            <textarea
              rows={3}
              value={professorBio}
              onChange={(e) => setProfessorBio(e.target.value)}
              className="w-full p-2.5 text-sm rounded-xl border border-neutral-300 outline-none focus:ring-2 focus:ring-red-600 text-neutral-900 leading-relaxed"
              placeholder="Ex: Faixa Preta 3º Grau, líder da Família Gorillaz..."
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isUploadingFoto}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer"
            >
              {isUploadingFoto ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Salvar Perfil do Professor</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 2. CONFIGURAÇÕES FINANCEIRAS & DOJO */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200/80 shadow-xs">
        <form onSubmit={handleSubmitGeral} className="space-y-6">
          {/* Identificação do Dojo */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500 pb-2 border-b border-neutral-100 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-neutral-400" />
              <span>Identificação do Dojo</span>
            </h2>

            <div>
              <label className="block text-xs font-bold uppercase text-neutral-700 mb-1">
                Nome da Academia
              </label>
              <input
                type="text"
                value={nomeAcademia}
                onChange={(e) => setNomeAcademia(e.target.value)}
                className="w-full p-2.5 text-sm rounded-xl border border-neutral-300 outline-none focus:ring-2 focus:ring-red-600 font-semibold"
                required
              />
            </div>
          </div>

          {/* Dados Financeiros e PIX */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500 pb-2 border-b border-neutral-100 flex items-center gap-2">
              <QrCode className="w-4 h-4 text-red-600" />
              <span>Cobrança & PIX</span>
            </h2>

            <div>
              <label className="block text-xs font-bold uppercase text-neutral-700 mb-1">
                Chave PIX do Dojo (Exibida para o aluno pagar com 1 toque)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={chavePix}
                  onChange={(e) => setChavePix(e.target.value)}
                  placeholder="Ex: pix@bjjcollege.com.br ou CNPJ"
                  className="w-full p-2.5 pr-20 text-sm rounded-xl border border-neutral-300 outline-none focus:ring-2 focus:ring-red-600 font-mono text-neutral-900"
                  required
                />
                <button
                  type="button"
                  onClick={handleCopyPix}
                  className="absolute right-2 top-2 px-2.5 py-1 text-xs font-bold text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>
              <p className="text-[11px] text-neutral-500 mt-1">
                Esta chave é apresentada com segurança na tela do aluno junto com o botão de cópia com 1 toque.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-neutral-700 mb-1">
                  Valor Padrão da Mensalidade (R$)
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={valorMensalidade}
                    onChange={(e) => setValorMensalidade(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-neutral-300 outline-none focus:ring-2 focus:ring-red-600 font-bold text-neutral-900"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-neutral-700 mb-1">
                  Dia de Vencimento Mensal
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={diaVencimento}
                    onChange={(e) => setDiaVencimento(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-neutral-300 outline-none focus:ring-2 focus:ring-red-600 font-bold text-neutral-900"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Segurança RLS */}
          <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-600 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-neutral-900">Proteção de Nível Administrador (RLS)</p>
              <p className="mt-0.5">
                Acesso de edição restrito ao Prof. Rogério. Todas as alterações em configurações e fotos são auditadas.
              </p>
            </div>
          </div>

          {/* Salvar Geral */}
          <div className="flex justify-end pt-3 border-t border-neutral-100">
            <button
              id="btn-salvar-config"
              type="submit"
              disabled={isUpdating}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-neutral-950 hover:bg-neutral-900 active:scale-95 text-white font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer"
            >
              {isUpdating ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4 text-red-500" />
                  <span>Salvar Parâmetros Financeiros</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminConfiguracoes;
