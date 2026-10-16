import React, { useState, useMemo } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAlunos } from '../hooks/useAlunos';
import { FaixaBadge } from '../components/FaixaBadge';
import { SkeletonList } from '../components/SkeletonLoader';
import { GraduacaoModal } from '../components/GraduacaoModal';
import { NovoAlunoModal } from '../components/NovoAlunoModal';
import { Aluno, FaixaBJJ } from '../types/database';
import { formatDateBR } from '../lib/utils';
import {
  Search,
  UserPlus,
  Users,
  Calendar,
  Phone,
  Mail,
  ChevronRight,
  Award,
  Flame,
} from 'lucide-react';

const TODAS_FAIXAS: { value: string; label: string }[] = [
  { value: 'todas', label: 'Todas as Faixas' },
  { value: 'branca', label: 'Faixa Branca' },
  { value: 'cinza', label: 'Faixa Cinza' },
  { value: 'amarela', label: 'Faixa Amarela' },
  { value: 'laranja', label: 'Faixa Laranja' },
  { value: 'verde', label: 'Faixa Verde' },
  { value: 'azul', label: 'Faixa Azul' },
  { value: 'roxa', label: 'Faixa Roxa' },
  { value: 'marrom', label: 'Faixa Marrom' },
  { value: 'preta', label: 'Faixa Preta' },
];

const AdminAlunosListView: React.FC = () => {
  const {
    alunos,
    isLoading,
    createAluno,
    isCreating,
    graduarAluno,
    isGraduando,
  } = useAlunos();

  const [busca, setBusca] = useState('');
  const [faixaFiltro, setFaixaFiltro] = useState<string>('todas');
  const [statusFiltro, setStatusFiltro] = useState<'todos' | 'ativos' | 'inativos'>('todos');

  // Modais
  const [modalNovoAluno, setModalNovoAluno] = useState(false);
  const [alunoParaGraduar, setAlunoParaGraduar] = useState<Aluno | null>(null);

  const alunosFiltrados = useMemo(() => {
    return alunos.filter((aluno) => {
      const nome = aluno.profile?.nome_completo?.toLowerCase() || '';
      const email = aluno.profile?.email?.toLowerCase() || '';
      const telefone = aluno.profile?.telefone?.toLowerCase() || '';
      const term = busca.toLowerCase().trim();

      const bateBusca = !term || nome.includes(term) || email.includes(term) || telefone.includes(term);
      const bateFaixa = faixaFiltro === 'todas' || aluno.faixa_atual === faixaFiltro;
      const bateStatus =
        statusFiltro === 'todos' ||
        (statusFiltro === 'ativos' && aluno.ativo) ||
        (statusFiltro === 'inativos' && !aluno.ativo);

      return bateBusca && bateFaixa && bateStatus;
    });
  }, [alunos, busca, faixaFiltro, statusFiltro]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <SkeletonList count={5} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-20 md:pb-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-red-950/40 text-red-500 border border-red-900/40">
              <Users className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold uppercase tracking-tight text-white font-['Oswald',sans-serif]">
              Quadro de Alunos • Família Gorillaz
            </h1>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Total de <strong className="text-white">{alunos.length}</strong> alunos matriculados no Supabase
          </p>
        </div>

        {/* Botão Matricular Novo Aluno */}
        <button
          type="button"
          id="btn-novo-aluno"
          onClick={() => setModalNovoAluno(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs font-['Oswald',sans-serif] uppercase tracking-wider rounded-xl transition-all shadow-md shadow-red-950/60 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Matricular Novo Aluno</span>
        </button>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="bg-[#141414] p-4 rounded-2xl border border-neutral-800 shadow-xl space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Busca textual */}
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nome, e-mail ou telefone..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-xs rounded-xl border border-neutral-700 bg-[#0f0f0f] focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none text-white placeholder:text-neutral-500"
            />
          </div>

          {/* Filtro por Faixa BJJ */}
          <div className="relative">
            <select
              value={faixaFiltro}
              onChange={(e) => setFaixaFiltro(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-xl border border-neutral-700 focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none text-white bg-[#0f0f0f] font-medium"
            >
              {TODAS_FAIXAS.map((f) => (
                <option key={f.value} value={f.value} className="bg-[#141414] text-white">
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Status */}
          <div className="flex items-center gap-1 bg-[#0f0f0f] p-1 rounded-xl border border-neutral-700">
            <button
              type="button"
              onClick={() => setStatusFiltro('todos')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                statusFiltro === 'todos'
                  ? 'bg-neutral-800 text-white shadow-xs'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Todos ({alunos.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFiltro('ativos')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                statusFiltro === 'ativos'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60 shadow-xs'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Ativos ({alunos.filter((a) => a.ativo).length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFiltro('inativos')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                statusFiltro === 'inativos'
                  ? 'bg-red-950 text-red-300 border border-red-800/60 shadow-xs'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Inativos ({alunos.filter((a) => !a.ativo).length})
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Alunos em Cards */}
      {alunosFiltrados.length === 0 ? (
        <div className="bg-[#141414] p-12 rounded-2xl border border-neutral-800 text-center space-y-3">
          <Users className="w-12 h-12 text-neutral-600 mx-auto" />
          <h3 className="text-base font-bold text-white uppercase font-['Oswald',sans-serif]">
            Nenhum aluno encontrado
          </h3>
          <p className="text-xs text-neutral-400 max-w-md mx-auto">
            Não há alunos cadastrados correspondentes aos filtros selecionados.
          </p>
          <button
            type="button"
            onClick={() => setModalNovoAluno(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase rounded-xl transition-all shadow-md cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Matricular Aluno Agora</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {alunosFiltrados.map((aluno) => {
            const profile = aluno.profile;
            const nome = profile?.nome_completo || 'Aluno Sem Nome';
            const totalTreinos = aluno.total_treinos || 0;

            return (
              <div
                key={aluno.id}
                id={`card-aluno-${aluno.id}`}
                className="bg-[#141414] p-5 rounded-2xl border border-neutral-800 shadow-xl hover:border-neutral-700 transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Topo do card */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={
                          profile?.foto_url ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
                        }
                        alt={nome}
                        className="w-12 h-12 rounded-full object-cover border-2 border-red-600/60 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-white group-hover:text-red-400 transition-colors truncate">
                          {nome}
                        </h3>
                        <p className="text-xs text-neutral-400 truncate flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 shrink-0" />
                          <span>{profile?.email}</span>
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        aluno.ativo
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                          : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                      }`}
                    >
                      {aluno.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>

                  {/* Faixa com Graus e Contadores */}
                  <div className="my-3 flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#0f0f0f] border border-neutral-800">
                    <FaixaBadge
                      faixa={aluno.faixa_atual as FaixaBJJ}
                      graus={aluno.graus || 0}
                      size="sm"
                      showGrausText
                    />
                    <div className="text-[11px] text-neutral-400 flex items-center gap-1 font-medium">
                      <Flame className="w-3.5 h-3.5 text-red-500" />
                      <span className="text-white font-bold">{totalTreinos}</span> treinos
                    </div>
                  </div>

                  <div className="space-y-1.5 mb-3 text-xs text-neutral-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-neutral-500" />
                      <span>Matrícula: {formatDateBR(aluno.data_inicio)}</span>
                    </div>

                    {profile?.telefone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-neutral-500" />
                        <span>{profile.telefone}</span>
                      </div>
                    )}
                  </div>

                  {aluno.observacoes && (
                    <p className="text-xs text-neutral-400 bg-black/40 p-2.5 rounded-lg line-clamp-2 italic mb-3 border border-neutral-800">
                      "{aluno.observacoes}"
                    </p>
                  )}
                </div>

                {/* Footer do Card com Botão Graduar e Link de Detalhes */}
                <div className="pt-3 border-t border-neutral-800 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    id={`btn-graduar-lista-${aluno.id}`}
                    onClick={() => setAlunoParaGraduar(aluno)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-red-600 hover:bg-red-500 text-white shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Graduar</span>
                  </button>

                  <Link
                    to={`/admin/alunos/${aluno.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-300 hover:text-white transition-colors"
                  >
                    <span>Ficha Completa</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Graduação do Guerreiro */}
      <GraduacaoModal
        aluno={alunoParaGraduar}
        isOpen={!!alunoParaGraduar}
        onClose={() => setAlunoParaGraduar(null)}
        onGraduar={async (data) => {
          await graduarAluno(data);
          setAlunoParaGraduar(null);
        }}
        isSubmitting={isGraduando}
      />

      {/* Modal de Matrícula de Novo Aluno */}
      <NovoAlunoModal
        isOpen={modalNovoAluno}
        onClose={() => setModalNovoAluno(false)}
        onSubmit={async (data) => {
          await createAluno(data);
          setModalNovoAluno(false);
        }}
        isSubmitting={isCreating}
      />
    </div>
  );
};

export const AdminAlunosList: React.FC = () => {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return <Navigate to="/aluno" replace />;
  }

  return <AdminAlunosListView />;
};

export default AdminAlunosList;
