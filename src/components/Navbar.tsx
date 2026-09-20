import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Megaphone,
  Settings,
  ShieldCheck,
  User,
  LogOut,
  Flame,
  ChevronDown,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';

export const Navbar: React.FC = () => {
  const { user, profile, isAdmin, isAluno, signOut, isDemoMode, switchMockUser } = useAuth();
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.info('Sessão encerrada com segurança.');
      navigate('/login');
    } catch {
      toast.error('Erro ao sair.');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-neutral-950 text-white border-b border-neutral-800 shadow-md">
      {/* Barra de ambiente demo / rápida troca de perfil de teste */}
      {isDemoMode && (
        <div className="bg-neutral-900 border-b border-neutral-800/80 px-4 py-1.5 text-xs text-neutral-300">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                MODO DEMO / TESTE
              </span>
              <span className="hidden sm:inline text-neutral-400">
                Alternar perfil com 1 clique:
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  switchMockUser('admin');
                  toast.success('Conectado como Prof. Rogério (Admin)');
                  navigate('/admin');
                }}
                className={`px-2.5 py-0.5 rounded text-xs transition-colors font-medium ${
                  isAdmin
                    ? 'bg-red-600 text-white font-bold shadow-xs'
                    : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
                }`}
              >
                🥋 Prof. Rogério (Admin)
              </button>
              <button
                type="button"
                onClick={() => {
                  switchMockUser('aluno1');
                  toast.success('Conectado como Lucas Gracie (Aluno Faixa Azul)');
                  navigate('/aluno');
                }}
                className={`px-2.5 py-0.5 rounded text-xs transition-colors font-medium ${
                  isAluno && user?.email === 'lucas.gracie@email.com'
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
                }`}
              >
                👤 Lucas (Aluno)
              </button>
              <button
                type="button"
                onClick={() => {
                  switchMockUser('aluno2');
                  toast.success('Conectado como Beatriz Silva (Aluno Pendente)');
                  navigate('/aluno');
                }}
                className={`hidden sm:inline-block px-2.5 py-0.5 rounded text-xs transition-colors font-medium ${
                  isAluno && user?.email === 'beatriz.silva@email.com'
                    ? 'bg-amber-600 text-white font-bold shadow-xs'
                    : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
                }`}
              >
                ⚠️ Beatriz (Inadimplente)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barra de Navegação Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Marca */}
          <Link
            to={isAdmin ? '/admin' : '/aluno'}
            className="flex items-center gap-3 group focus:outline-none"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center font-black text-white text-lg tracking-tighter shadow-md border border-red-500/30 group-hover:scale-105 transition-transform">
              BJJ
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-wider text-white uppercase font-sans">
                  BJJ College
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-red-950 text-red-400 border border-red-800">
                  Dojo
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 flex items-center gap-1">
                <span>Prof. Rogério</span>
                <span className="w-1 h-1 rounded-full bg-neutral-600" />
                <span className="text-neutral-500">Faixa Preta</span>
              </p>
            </div>
          </Link>

          {/* Links Desktop */}
          {user && (
            <nav className="hidden md:flex items-center gap-1">
              {isAdmin ? (
                <>
                  <NavLink
                    to="/admin"
                    end
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-red-600/20 text-red-400 border border-red-500/30'
                          : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
                      }`
                    }
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Dashboard</span>
                  </NavLink>
                  <NavLink
                    to="/admin/alunos"
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-red-600/20 text-red-400 border border-red-500/30'
                          : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
                      }`
                    }
                  >
                    <Users className="w-4 h-4" />
                    <span>Alunos</span>
                  </NavLink>
                  <NavLink
                    to="/admin/pagamentos"
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-red-600/20 text-red-400 border border-red-500/30'
                          : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
                      }`
                    }
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Mensalidades</span>
                  </NavLink>
                  <NavLink
                    to="/admin/avisos"
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-red-600/20 text-red-400 border border-red-500/30'
                          : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
                      }`
                    }
                  >
                    <Megaphone className="w-4 h-4" />
                    <span>Mural</span>
                  </NavLink>
                  <NavLink
                    to="/admin/configuracoes"
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-red-600/20 text-red-400 border border-red-500/30'
                          : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
                      }`
                    }
                  >
                    <Settings className="w-4 h-4" />
                    <span>Configurações</span>
                  </NavLink>
                </>
              ) : (
                <>
                  <NavLink
                    to="/aluno"
                    end
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-red-600/20 text-red-400 border border-red-500/30'
                          : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
                      }`
                    }
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Meu Treino & Pagamento</span>
                  </NavLink>
                  <NavLink
                    to="/aluno/perfil"
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-red-600/20 text-red-400 border border-red-500/30'
                          : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
                      }`
                    }
                  >
                    <User className="w-4 h-4" />
                    <span>Meus Dados</span>
                  </NavLink>
                </>
              )}
            </nav>
          )}

          {/* User Menu / Avatar */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  id="btn-user-menu"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2.5 p-1 rounded-full hover:bg-neutral-900 transition-colors focus:outline-none border border-neutral-800"
                >
                  <img
                    src={
                      profile?.foto_url ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                    }
                    alt={user.nome_completo}
                    className="w-8 h-8 rounded-full object-cover border border-neutral-700"
                  />
                  <div className="hidden lg:block text-left pr-1">
                    <p className="text-xs font-semibold text-neutral-200 leading-tight">
                      {user.nome_completo.split(' ')[0]}
                    </p>
                    <p className="text-[10px] text-neutral-400 uppercase tracking-wider">
                      {isAdmin ? 'Prof. Rogério' : 'Aluno'}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                </button>

                {/* Dropdown */}
                {isUserMenuOpen && (
                  <div
                    id="user-dropdown-menu"
                    className="absolute right-0 mt-2 w-56 bg-neutral-900 rounded-xl shadow-xl border border-neutral-800 py-1 z-50 animate-in fade-in zoom-in-95"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-neutral-800">
                      <p className="text-xs font-semibold text-white truncate">{user.nome_completo}</p>
                      <p className="text-[11px] text-neutral-400 truncate">{user.email}</p>
                      <span className="mt-1 inline-block text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-300">
                        {user.role === 'admin' ? 'Administrador' : 'Aluno'}
                      </span>
                    </div>

                    {isAluno && (
                      <Link
                        to="/aluno/perfil"
                        className="flex items-center gap-2 px-4 py-2 text-xs text-neutral-300 hover:bg-neutral-800 hover:text-white"
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>Editar Meu Perfil</span>
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-400 hover:bg-red-950/40 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Encerrar Sessão</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs transition-colors"
              >
                <span>Acessar Dojo</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
