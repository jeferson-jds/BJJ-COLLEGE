import React, { useState } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { Logo } from './Logo';
import {
  LogOut,
  LayoutDashboard,
  Users,
  CreditCard,
  Megaphone,
  Settings,
  ShieldCheck,
  User,
  Menu,
  X,
  Camera,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useConfiguracoes } from '../hooks/useConfiguracoes';
import { FaixaBadge } from './FaixaBadge';
import { FaixaBJJ } from '../types/database';
import { toast } from 'sonner';

interface AppHeaderProps {
  userName?: string;
  userFaixa?: string;
  isAdmin?: boolean;
}

export function AppHeader({ userName, userFaixa, isAdmin }: AppHeaderProps) {
  const { signOut } = useAuth();
  const { data: config } = useConfiguracoes();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const nomeProfessor = config?.nome_professor || 'Rogério';
  const displayProfessorTitle = `Prof. ${nomeProfessor}`;

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
    <header className="sticky top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-md border-b-2 border-red-600 shadow-2xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3">
        {/* Logo + Marca */}
        <Link
          to={isAdmin ? '/admin' : '/aluno'}
          className="flex items-center gap-3 group focus:outline-none"
        >
          <Logo size="sm" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-['Oswald',sans-serif] font-bold text-white text-lg sm:text-xl leading-tight uppercase tracking-wider group-hover:text-red-500 transition-colors">
                BJJ College
              </h1>
              <span className="text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-red-950/80 text-red-400 border border-red-800/80">
                Gorillaz
              </span>
            </div>
            {isAdmin ? (
              <p className="text-xs text-neutral-400 font-medium tracking-tight">
                {displayProfessorTitle} • Faixa Preta
              </p>
            ) : (
              <p className="text-xs text-neutral-400 font-medium tracking-tight">
                {userName || 'Aluno'}
              </p>
            )}
          </div>
        </Link>

        {/* Navegação Central Desktop (Professor) */}
        {isAdmin && (
          <nav className="hidden md:flex items-center gap-1.5">
            <NavLink
              to="/admin"
              end
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-['Oswald',sans-serif] uppercase tracking-wider transition-all ${
                  isActive
                    ? 'bg-red-600 text-white shadow-red-glow font-semibold'
                    : 'text-neutral-300 hover:text-white hover:bg-neutral-900 font-medium'
                }`
              }
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Painel</span>
            </NavLink>
            <NavLink
              to="/admin/alunos"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-['Oswald',sans-serif] uppercase tracking-wider transition-all ${
                  isActive
                    ? 'bg-red-600 text-white shadow-red-glow font-semibold'
                    : 'text-neutral-300 hover:text-white hover:bg-neutral-900 font-medium'
                }`
              }
            >
              <Users className="w-3.5 h-3.5" />
              <span>Alunos</span>
            </NavLink>
            <NavLink
              to="/admin/pagamentos"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-['Oswald',sans-serif] uppercase tracking-wider transition-all ${
                  isActive
                    ? 'bg-red-600 text-white shadow-red-glow font-semibold'
                    : 'text-neutral-300 hover:text-white hover:bg-neutral-900 font-medium'
                }`
              }
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Mensalidades</span>
            </NavLink>
            <NavLink
              to="/admin/avisos"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-['Oswald',sans-serif] uppercase tracking-wider transition-all ${
                  isActive
                    ? 'bg-red-600 text-white shadow-red-glow font-semibold'
                    : 'text-neutral-300 hover:text-white hover:bg-neutral-900 font-medium'
                }`
              }
            >
              <Megaphone className="w-3.5 h-3.5" />
              <span>Mural</span>
            </NavLink>
            <NavLink
              to="/historia"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-['Oswald',sans-serif] uppercase tracking-wider transition-all ${
                  isActive
                    ? 'bg-red-600 text-white shadow-red-glow font-semibold'
                    : 'text-neutral-300 hover:text-white hover:bg-neutral-900 font-medium'
                }`
              }
            >
              <Camera className="w-3.5 h-3.5" />
              <span>História & Acervo</span>
            </NavLink>
            <NavLink
              to="/admin/configuracoes"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-['Oswald',sans-serif] uppercase tracking-wider transition-all ${
                  isActive
                    ? 'bg-red-600 text-white shadow-red-glow font-semibold'
                    : 'text-neutral-300 hover:text-white hover:bg-neutral-900 font-medium'
                }`
              }
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Config</span>
            </NavLink>
          </nav>
        )}

        {/* Navegação Central Desktop (Aluno) */}
        {!isAdmin && (
          <nav className="hidden md:flex items-center gap-2">
            <NavLink
              to="/aluno"
              end
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-['Oswald',sans-serif] uppercase tracking-wider transition-all ${
                  isActive
                    ? 'bg-red-600 text-white shadow-red-glow font-semibold'
                    : 'text-neutral-300 hover:text-white hover:bg-neutral-900 font-medium'
                }`
              }
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Meu Treino & PIX</span>
            </NavLink>
            <NavLink
              to="/historia"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-['Oswald',sans-serif] uppercase tracking-wider transition-all ${
                  isActive
                    ? 'bg-red-600 text-white shadow-red-glow font-semibold'
                    : 'text-neutral-300 hover:text-white hover:bg-neutral-900 font-medium'
                }`
              }
            >
              <Camera className="w-3.5 h-3.5" />
              <span>História & Galeria</span>
            </NavLink>
            <NavLink
              to="/aluno/perfil"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-['Oswald',sans-serif] uppercase tracking-wider transition-all ${
                  isActive
                    ? 'bg-red-600 text-white shadow-red-glow font-semibold'
                    : 'text-neutral-300 hover:text-white hover:bg-neutral-900 font-medium'
                }`
              }
            >
              <User className="w-3.5 h-3.5" />
              <span>Meus Dados</span>
            </NavLink>
            {userFaixa && (
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#141414] border border-neutral-800 ml-2">
                <FaixaBadge faixa={userFaixa as FaixaBJJ} size="sm" />
              </div>
            )}
          </nav>
        )}

        {/* À direita: Avatar circular com identificador e botão Sair */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {isAdmin ? (
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#141414] border border-neutral-800">
              <img
                src="/images/professor.jpg"
                alt={displayProfessorTitle}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-red-600 object-cover shadow-sm"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/images/logo-gorillaz.jpg';
                }}
              />
              <div className="hidden sm:flex flex-col text-left pr-1.5">
                <span className="text-xs font-bold text-white leading-tight">
                  {displayProfessorTitle}
                </span>
                <span className="text-[9px] font-black text-red-500 uppercase tracking-widest leading-none">
                  MESTRE • ADMIN
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#141414] border border-neutral-800">
              <div className="w-7 h-7 rounded-full bg-red-600/20 border border-red-500 flex items-center justify-center text-white text-xs font-bold">
                {userName ? userName.charAt(0).toUpperCase() : 'A'}
              </div>
              <span className="hidden sm:inline text-xs font-semibold text-neutral-200 pr-1">
                {userName || 'Aluno'}
              </span>
            </div>
          )}

          {/* Botão Sair */}
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-1.5 text-neutral-400 hover:text-white px-2.5 py-1.5 rounded-xl bg-neutral-900/80 hover:bg-red-600/20 border border-neutral-800 hover:border-red-600 transition-all cursor-pointer active:scale-95 text-xs font-semibold"
            title="Encerrar sessão"
          >
            <LogOut className="w-4 h-4 text-red-500" />
            <span className="hidden sm:inline">Sair</span>
          </button>

          {/* Menu hamburguer no mobile */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-900 cursor-pointer"
            aria-label="Abrir menu de navegação"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-red-500" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Menu Dropdown Mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0f0f0f] border-t border-neutral-800 px-4 py-3 space-y-2 animate-fade-in">
          {isAdmin ? (
            <>
              <NavLink
                to="/admin"
                end
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-neutral-200 hover:bg-red-600/20 hover:text-white font-medium"
              >
                <LayoutDashboard className="w-4 h-4 text-red-500" />
                <span>Painel do Professor</span>
              </NavLink>
              <NavLink
                to="/admin/alunos"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-neutral-200 hover:bg-red-600/20 hover:text-white font-medium"
              >
                <Users className="w-4 h-4 text-red-500" />
                <span>Gerenciar Alunos</span>
              </NavLink>
              <NavLink
                to="/admin/pagamentos"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-neutral-200 hover:bg-red-600/20 hover:text-white font-medium"
              >
                <CreditCard className="w-4 h-4 text-red-500" />
                <span>Mensalidades & PIX</span>
              </NavLink>
              <NavLink
                to="/admin/avisos"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-neutral-200 hover:bg-red-600/20 hover:text-white font-medium"
              >
                <Megaphone className="w-4 h-4 text-red-500" />
                <span>Mural do Mestre</span>
              </NavLink>
              <NavLink
                to="/historia"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-neutral-200 hover:bg-red-600/20 hover:text-white font-medium"
              >
                <Camera className="w-4 h-4 text-red-500" />
                <span>História do Mestre & Acervo</span>
              </NavLink>
              <NavLink
                to="/admin/configuracoes"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-neutral-200 hover:bg-red-600/20 hover:text-white font-medium"
              >
                <Settings className="w-4 h-4 text-red-500" />
                <span>Configurações & Perfil do Mestre</span>
              </NavLink>
            </>
          ) : (
            <>
              <NavLink
                to="/aluno"
                end
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-neutral-200 hover:bg-red-600/20 hover:text-white font-medium"
              >
                <ShieldCheck className="w-4 h-4 text-red-500" />
                <span>Meu Treino & PIX</span>
              </NavLink>
              <NavLink
                to="/historia"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-neutral-200 hover:bg-red-600/20 hover:text-white font-medium"
              >
                <Camera className="w-4 h-4 text-red-500" />
                <span>História do Mestre & Acervo</span>
              </NavLink>
              <NavLink
                to="/aluno/perfil"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-neutral-200 hover:bg-red-600/20 hover:text-white font-medium"
              >
                <User className="w-4 h-4 text-red-500" />
                <span>Meus Dados Cadastrais</span>
              </NavLink>
            </>
          )}
        </div>
      )}
    </header>
  );
}

export default AppHeader;
