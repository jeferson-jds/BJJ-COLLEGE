import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { Aluno, Profile, RoleUsuario } from '../types/database';
import { isRealSupabaseConfigured, supabase } from '../lib/supabase';
import { localStore } from '../lib/store';
import { MOCK_USERS } from '../lib/mockData';

export interface AuthUser {
  id: string;
  email: string;
  nome_completo: string;
  role: RoleUsuario;
}

interface AuthContextType {
  user: AuthUser | null;
  profile: Profile | null;
  role: RoleUsuario | null;
  isAdmin: boolean;
  isAluno: boolean;
  alunoData: Aluno | null;
  isLoading: boolean;
  isDemoMode: boolean;
  signIn: (email: string, senha: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  switchMockUser: (target: 'admin' | 'aluno1' | 'aluno2') => void;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<RoleUsuario | null>(null);
  const [alunoData, setAlunoData] = useState<Aluno | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Inicializa sessão
  const initSession = async () => {
    setIsLoading(true);
    try {
      if (isRealSupabaseConfigured) {
        // Obter sessão real do Supabase
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const authUser = session.user;
          // Buscar profile e role
          const { data: profileRow } = await (supabase.from('profiles') as any)
            .select('*')
            .eq('user_id', authUser.id)
            .maybeSingle();

          const { data: roleRow } = await (supabase.from('user_roles') as any)
            .select('role')
            .eq('user_id', authUser.id)
            .maybeSingle();

          const userRole = ((roleRow as any)?.role as RoleUsuario) || 'aluno';

          setUser({
            id: authUser.id,
            email: authUser.email || '',
            nome_completo: (profileRow as any)?.nome_completo || authUser.email || '',
            role: userRole,
          });
          setProfile((profileRow as any) || null);
          setRole(userRole);

          if (userRole === 'aluno' && profileRow) {
            const { data: alunoRow } = await (supabase.from('alunos') as any)
              .select('*')
              .eq('profile_id', (profileRow as any).id)
              .maybeSingle();
            setAlunoData(alunoRow || null);
          }
        } else {
          setUser(null);
          setProfile(null);
          setRole(null);
          setAlunoData(null);
        }
      } else {
        // Modo Local/Demo: carrega usuário salvo em localStorage ou padrão Prof. Rogério
        const savedUserId = localStorage.getItem('bjj_current_mock_user_id') || MOCK_USERS.admin.user_id;
        loadMockUserById(savedUserId);
      }
    } catch (err) {
      console.error('Erro ao inicializar sessão de autenticação:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMockUserById = (userId: string) => {
    const profiles = localStore.getProfiles();
    const roles = localStore.getRoles();
    const userRoleItem = roles.find((r) => r.user_id === userId);
    const prof = profiles.find((p) => p.user_id === userId);

    if (prof && userRoleItem) {
      setUser({
        id: prof.user_id || userId,
        email: prof.email,
        nome_completo: prof.nome_completo,
        role: userRoleItem.role,
      });
      setProfile(prof);
      setRole(userRoleItem.role);

      if (userRoleItem.role === 'aluno') {
        const alunos = localStore.getAlunos();
        const foundAluno = alunos.find((a) => a.profile_id === prof.id);
        setAlunoData(foundAluno || null);
      } else {
        setAlunoData(null);
      }
    } else {
      // Fallback para admin
      const adminProf = profiles.find((p) => p.user_id === MOCK_USERS.admin.user_id)!;
      setUser({
        id: adminProf.user_id!,
        email: adminProf.email,
        nome_completo: adminProf.nome_completo,
        role: 'admin',
      });
      setProfile(adminProf);
      setRole('admin');
      setAlunoData(null);
    }
  };

  useEffect(() => {
    initSession();

    if (isRealSupabaseConfigured) {
      const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          initSession();
        } else {
          setUser(null);
          setProfile(null);
          setRole(null);
          setAlunoData(null);
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    }
  }, []);

  const signIn = async (email: string, senha: string): Promise<{ error?: string }> => {
    setIsLoading(true);
    try {
      if (isRealSupabaseConfigured) {
        const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
        if (error) {
          return { error: error.message };
        }
        await initSession();
        return {};
      } else {
        // Autenticação mock por email
        const profiles = localStore.getProfiles();
        const found = profiles.find((p) => p.email.toLowerCase() === email.toLowerCase());
        if (!found) {
          return { error: 'Usuário não encontrado. Verifique o e-mail ou use as contas demo.' };
        }
        if (senha.length < 4) {
          return { error: 'Senha incorreta.' };
        }
        if (found.user_id) {
          localStorage.setItem('bjj_current_mock_user_id', found.user_id);
          loadMockUserById(found.user_id);
          return {};
        } else {
          return { error: 'Conta ainda não ativada. Use o link de primeiro acesso.' };
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      if (isRealSupabaseConfigured) {
        await supabase.auth.signOut();
      }
      setUser(null);
      setProfile(null);
      setRole(null);
      setAlunoData(null);
      localStorage.removeItem('bjj_current_mock_user_id');
    } finally {
      setIsLoading(false);
    }
  };

  const switchMockUser = (target: 'admin' | 'aluno1' | 'aluno2') => {
    const targetUser = MOCK_USERS[target];
    if (!targetUser) return;
    localStorage.setItem('bjj_current_mock_user_id', targetUser.user_id);
    loadMockUserById(targetUser.user_id);
  };

  const refreshUserData = async () => {
    await initSession();
  };

  const value = useMemo(
    () => ({
      user,
      profile,
      role,
      isAdmin: role === 'admin',
      isAluno: role === 'aluno',
      alunoData,
      isLoading,
      isDemoMode: !isRealSupabaseConfigured,
      signIn,
      signOut,
      switchMockUser,
      refreshUserData,
    }),
    [user, profile, role, alunoData, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
}
