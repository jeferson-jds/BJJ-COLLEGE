import React, { useState, useEffect, useRef } from 'react';
import { useConfiguracoes } from '../hooks/useConfiguracoes';
import { supabase } from '../lib/supabase';
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
  Phone,
} from 'lucide-react';
import { toast } from 'sonner';

export const AdminConfiguracoes: React.FC = () => {
  const { config, updateConfig, isUpdating } = useConfiguracoes();

  // Estados gerais
  const [chavePix, setChavePix] = useState(config.chave_pix || '21991545136');
  const [valorMensalidade, setValorMensalidade] = useState(config.valor_mensalidade || '180.00');
  const [diaVencimento, setDiaVencimento] = useState(config.dia_vencimento || '10');
  const [nomeAcademia, setNomeAcademia] = useState(config.nome_academia || 'BJJ College');
  const [nomeProfessor, setNomeProfessor] = useState(config.nome_professor || 'Rogério');
  const [copied, setCopied] = useState(false);

  // Estados Perfil do Prof. Rogério
  const [professorFoto, setProfessorFoto] = useState<string>(() => {
    return localStorage.getItem('bjj_professor_foto') || '/images/professor.jpg';
  });
  const [professorTitulo, setProfessorTitulo] = useState<string>(() => {
    return localStorage.getItem('bjj_professor_titulo') || 'Faixa Preta 4º Grau • Líder da Família Gorillaz';
  });
  const [professorTelefone, setProfessorTelefone] = useState<string>(() => {
    return localStorage.getItem('bjj_professor_telefone') || '(21) 99154-5136';
  });
  const [professorBio, setProfessorBio] = useState<string>(() => {
    return (
      localStorage.getItem('bjj_professor_bio') ||
      'Faixa Preta 4º Grau, líder e fundador da Família Gorillaz Jiu-Jitsu. Mais de 20 anos dedicados a forjar campeões nos tatames e líderes para a vida.'
    );
  });
  const [selectedFotoFile, setSelectedFotoFile] = useState<File | null>(null);
  const [isUploadingFoto, setIsUploadingFoto] = useState(false);
  const [showSqlBucket, setShowSqlBucket] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (config) {
      setChavePix(config.chave_pix || '21991545136');
      setValorMensalidade(config.valor_mensalidade || '180.00');
      setDiaVencimento(config.dia_vencimento || '10');
      setNomeAcademia(config.nome_academia || 'BJJ College');
      setNomeProfessor(config.nome_professor || 'Rogério');
    }
  }, [config]);

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Formato inválido. Use JPG, PNG ou WebP.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Limite de 5MB.');
      return;
    }

    setSelectedFotoFile(file);
    const localPreview = URL.createObjectURL(file);
    setProfessorFoto(localPreview);
  };

  const handleSalvarPerfilProfessor = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploadingFoto(true);

    try {
      let finalFotoUrl = professorFoto;

      if (selectedFotoFile) {
        const fileExt = selectedFotoFile.name.split('.').pop();
        const filePath = `professor/perfil_${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('alunos-fotos')
          .upload(filePath, selectedFotoFile, { upsert: true });

        if (!uploadError) {
          const { data: publicData } = supabase.storage
            .from('alunos-fotos')
            .getPublicUrl(filePath);
          if (publicData?.publicUrl) {
            finalFotoUrl = publicData.publicUrl;
            setProfessorFoto(finalFotoUrl);
          }
        }
      }

      localStorage.setItem('bjj_professor_foto', finalFotoUrl);
      localStorage.setItem('bjj_professor_titulo', professorTitulo);
      localStorage.setItem('bjj_professor_telefone', professorTelefone);
      localStorage.setItem('bjj_professor_bio', professorBio);

      // Atualiza também nas configurações do Supabase
      await updateConfig({
        nome_professor: nomeProfessor,
      });

      toast.success('Perfil Oficial do Mestre Rogério atualizado com sucesso!');
    } catch (err) {
      toast.error((err as Error).message || 'Erro ao salvar perfil.');
    } finally {
      setIsUploadingFoto(false);
    }
  };

  const handleSubmitGeral = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const cleanPix = chavePix.trim();
      await updateConfig({
        chave_pix: cleanPix,
        valor_mensalidade: valorMensalidade,
        dia_vencimento: diaVencimento,
        nome_academia: nomeAcademia,
        nome_professor: nomeProfessor,
      });
      toast.success('Parâmetros da BJJ College salvos no Supabase com sucesso!');
    } catch (err) {
      toast.error((err as Error).message || 'Erro ao salvar configurações.');
    }
  };

  const handleCopyPix = () => {
    // Copia o valor limpo ou formatado
    const valorParaCopiar = chavePix.replace(/\D/g, '') || chavePix;
    navigator.clipboard.writeText(valorParaCopiar);
    setCopied(true);
    toast.success(`Chave PIX (${valorParaCopiar}) copiada para a área de transferência!`);
    setTimeout(() => setCopied(false), 2000);
  };

  const sqlStorageScript = `-- Script de Configuração do Bucket Privado de Fotos no Supabase
INSERT INTO storage.buckets (id, name, public)
VALUES ('alunos-fotos', 'alunos-fotos', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de Leitura e Gravação RLS
CREATE POLICY "Leitura de fotos autenticados" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'alunos-fotos');

CREATE POLICY "Admin upload fotos" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'alunos-fotos' AND
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlStorageScript);
    setCopiedSql(true);
    toast.success('Script SQL copiado com sucesso!');
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-lg bg-red-950/40 text-red-500 border border-red-900/40">
            <Settings className="w-5 h-5" />
          </span>
          <h1 className="text-2xl font-bold uppercase tracking-tight text-white font-['Oswald',sans-serif]">
            Configurações do Dojo • Família Gorillaz
          </h1>
        </div>
        <p className="text-xs text-neutral-400 mt-1">
          Gestão da identidade oficial do Mestre, chave PIX comercial e parâmetros operacionais
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. SEÇÃO: PERFIL OFICIAL DO MESTRE */}
        <div className="bg-[#141414] p-6 sm:p-8 rounded-2xl border border-neutral-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
            <div className="flex items-center gap-2.5">
              <User className="w-5 h-5 text-red-500" />
              <div>
                <h2 className="text-base font-bold text-white font-['Oswald',sans-serif] uppercase tracking-wide">
                  Perfil Oficial do Mestre
                </h2>
                <p className="text-xs text-neutral-400">
                  Identidade do líder exibida aos alunos no app e no mural oficial
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowSqlBucket(!showSqlBucket)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-neutral-400 bg-neutral-900 hover:bg-neutral-800 rounded-lg border border-neutral-700 transition cursor-pointer"
            >
              <Database className="w-3.5 h-3.5 text-neutral-400" />
              <span>{showSqlBucket ? 'Ocultar SQL' : 'SQL Storage'}</span>
            </button>
          </div>

          {/* Script colapsável */}
          {showSqlBucket && (
            <div className="p-4 bg-black/60 rounded-xl space-y-2 border border-neutral-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-red-400 flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5" />
                  Script SQL Storage
                </span>
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-xs rounded text-neutral-300 flex items-center gap-1 cursor-pointer"
                >
                  {copiedSql ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSql ? 'Copiado!' : 'Copiar'}</span>
                </button>
              </div>
              <pre className="text-[11px] font-mono overflow-x-auto p-3 bg-neutral-950 rounded border border-neutral-800 text-neutral-300">
                {sqlStorageScript}
              </pre>
            </div>
          )}

          <form onSubmit={handleSalvarPerfilProfessor} className="space-y-5">
            <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-[#0f0f0f] border border-neutral-800">
              {/* Foto com borda vermelha e glow */}
              <div className="relative group shrink-0">
                <img
                  src={professorFoto}
                  alt="Prof. Rogério"
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-red-600 object-cover shadow-red-glow"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/60 text-white rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <Camera className="w-5 h-5 mb-1 text-red-500" />
                  <span className="text-[10px] font-bold uppercase">Trocar</span>
                </button>
              </div>

              <div className="flex-1 text-center sm:text-left space-y-1.5">
                <h3 className="text-sm font-bold text-white font-['Oswald',sans-serif] uppercase tracking-wide">
                  Foto do Mestre
                </h3>
                <p className="text-xs text-neutral-400">
                  Exibida no cabeçalho, no mural de comunicados e na honra ao mestre do aluno.
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFotoChange}
                  className="hidden"
                />

                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer transition"
                  >
                    <Camera className="w-3.5 h-3.5 text-red-500" />
                    <span>Escolher Nova Foto</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-neutral-300 mb-1">
                  Nome do Mestre
                </label>
                <input
                  type="text"
                  value={nomeProfessor}
                  onChange={(e) => setNomeProfessor(e.target.value)}
                  className="w-full p-2.5 text-sm rounded-xl border border-neutral-700 bg-[#0f0f0f] outline-none focus:ring-2 focus:ring-red-600 font-semibold text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-neutral-300 mb-1">
                  Graduação / Título
                </label>
                <input
                  type="text"
                  value={professorTitulo}
                  onChange={(e) => setProfessorTitulo(e.target.value)}
                  className="w-full p-2.5 text-sm rounded-xl border border-neutral-700 bg-[#0f0f0f] outline-none focus:ring-2 focus:ring-red-600 font-medium text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-neutral-300 mb-1">
                Telefone Comercial Oficial do Mestre
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={professorTelefone}
                  onChange={(e) => setProfessorTelefone(e.target.value)}
                  placeholder="(21) 99154-5136"
                  className="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-neutral-700 bg-[#0f0f0f] outline-none focus:ring-2 focus:ring-red-600 font-mono text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-neutral-300 mb-1">
                Biografia Oficial & Linhagem
              </label>
              <textarea
                rows={3}
                value={professorBio}
                onChange={(e) => setProfessorBio(e.target.value)}
                className="w-full p-2.5 text-sm rounded-xl border border-neutral-700 bg-[#0f0f0f] outline-none focus:ring-2 focus:ring-red-600 text-white leading-relaxed"
                placeholder="Histórico, títulos e valores ensinados na Família Gorillaz..."
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isUploadingFoto}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs uppercase tracking-wider font-['Oswald',sans-serif] rounded-xl transition-all shadow-red-glow cursor-pointer"
              >
                {isUploadingFoto ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Salvar Perfil do Mestre</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* 2. CONFIGURAÇÕES FINANCEIRAS & CHAVE PIX OFICIAL */}
        <div className="bg-[#141414] p-6 sm:p-8 rounded-2xl border border-neutral-800 shadow-xl">
          <form onSubmit={handleSubmitGeral} className="space-y-6">
            {/* Identificação do Dojo */}
            <div className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 pb-2 border-b border-neutral-800 flex items-center gap-2 font-['Oswald',sans-serif]">
                <Building2 className="w-4 h-4 text-red-500" />
                <span>Identificação do Dojo</span>
              </h2>

              <div>
                <label className="block text-xs font-bold uppercase text-neutral-300 mb-1">
                  Nome Oficial da Academia
                </label>
                <input
                  type="text"
                  value={nomeAcademia}
                  onChange={(e) => setNomeAcademia(e.target.value)}
                  className="w-full p-2.5 text-sm rounded-xl border border-neutral-700 bg-[#0f0f0f] outline-none focus:ring-2 focus:ring-red-600 font-semibold text-white"
                  required
                />
              </div>
            </div>

            {/* Cobrança & Chave PIX Oficial */}
            <div className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 pb-2 border-b border-neutral-800 flex items-center gap-2 font-['Oswald',sans-serif]">
                <QrCode className="w-4 h-4 text-red-500" />
                <span>Chave PIX Oficial do Professor</span>
              </h2>

              <div>
                <label className="block text-xs font-bold uppercase text-neutral-300 mb-1">
                  Número Comercial / Chave PIX Oficial (21991545136)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={chavePix}
                    onChange={(e) => setChavePix(e.target.value)}
                    placeholder="21991545136"
                    className="w-full p-2.5 pr-24 text-sm rounded-xl border border-neutral-700 bg-[#0f0f0f] outline-none focus:ring-2 focus:ring-red-600 font-mono text-red-400 font-bold"
                    required
                  />
                  <button
                    type="button"
                    onClick={handleCopyPix}
                    className="absolute right-2 top-2 px-3 py-1 text-xs font-bold text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-neutral-400 mt-1">
                  Número comercial oficial do Mestre Rogério: <strong>(21) 99154-5136</strong> (valor limpo copiado: <strong>21991545136</strong>).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-neutral-300 mb-1">
                    Valor Padrão da Mensalidade (R$)
                  </label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={valorMensalidade}
                      onChange={(e) => setValorMensalidade(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-neutral-700 bg-[#0f0f0f] outline-none focus:ring-2 focus:ring-red-600 font-bold text-white font-mono"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-neutral-300 mb-1">
                    Dia de Vencimento Mensal
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={diaVencimento}
                      onChange={(e) => setDiaVencimento(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-neutral-700 bg-[#0f0f0f] outline-none focus:ring-2 focus:ring-red-600 font-bold text-white font-mono"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Aviso de Segurança RLS */}
            <div className="p-4 rounded-xl bg-black/40 border border-neutral-800 text-xs text-neutral-400 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white uppercase font-['Oswald',sans-serif] tracking-wide">
                  Segurança Row Level Security (RLS)
                </p>
                <p className="mt-0.5 text-neutral-400">
                  Os parâmetros da academia são gravados diretamente na tabela `configuracoes` do Supabase e protegidos contra mutações não autorizadas.
                </p>
              </div>
            </div>

            {/* Botão Salvar Geral */}
            <div className="flex justify-end pt-3 border-t border-neutral-800">
              <button
                id="btn-salvar-config"
                type="submit"
                disabled={isUpdating}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs uppercase tracking-wider font-['Oswald',sans-serif] rounded-xl transition-all shadow-red-glow cursor-pointer"
              >
                {isUpdating ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Salvar Configurações no Supabase</span>
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

export default AdminConfiguracoes;
