import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  Users,
  CreditCard,
  Megaphone,
  Settings,
  ShieldCheck,
  User,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const BottomNavigation: React.FC = () => {
  const { user, isAdmin } = useAuth();

  if (!user) return null;

  const adminLinks = [
    { to: '/admin', label: 'Início', icon: Home, end: true },
    { to: '/admin/alunos', label: 'Alunos', icon: Users, end: false },
    { to: '/admin/pagamentos', label: 'Mensalidades', icon: CreditCard, end: false },
    { to: '/admin/avisos', label: 'Mural', icon: Megaphone, end: false },
    { to: '/admin/configuracoes', label: 'Config', icon: Settings, end: false },
  ];

  const alunoLinks = [
    { to: '/aluno', label: 'Início', icon: ShieldCheck, end: true },
    { to: '/aluno/perfil', label: 'Meu Perfil', icon: User, end: false },
  ];

  const links = isAdmin ? adminLinks : alunoLinks;

  return (
    <nav
      id="bottom-navigation-bar"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0a0a0a] border-t-2 border-red-600 px-1 py-1.5 shadow-2xl"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'text-red-500 font-bold scale-105 drop-shadow-[0_0_8px_rgba(220,38,38,0.7)]'
                    : 'text-neutral-400 hover:text-neutral-200 font-medium'
                }`
              }
            >
              <Icon className="w-5 h-5 mb-0.5 transition-transform" />
              <span className="text-[10px] tracking-tight whitespace-nowrap font-['Inter',sans-serif]">
                {link.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
