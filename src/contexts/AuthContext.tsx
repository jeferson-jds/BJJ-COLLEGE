import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { Aluno, Profile, RoleUsuario } from '../types/database';
import { supabase } from '../lib/supabase';

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
  isDemoMode?: boolean;
  switchMockUser?: (target: any) => void;
  signIn: (email: string, senha: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  updateProfilePhoto: (photoUrl: string) => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<RoleUsuario | null>(null);
  const [alunoData, setAlunoData] = useState<Aluno | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Inicializa sessão real via Supabase
  const initSession = async () => {
    setIsLoading(true);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.warn('Sessão Supabase não ativa:', sessionError.message);
      }

      if (session?.user) {
        const authUser = session.user;

        // Buscar profile na tabela profiles
        const { data: profileRow } = await (supabase.from('profiles') as any)
          .select('*')
          .eq('user_id', authUser.id)
          .maybeSingle();

        // Buscar papel do usuário na tabela user_roles
        const { data: roleRow } = await (supabase.from('user_roles') as any)
          .select('role')
          .eq('user_id', authUser.id)
          .maybeSingle();

        const userRole = ((roleRow as any)?.role as RoleUsuario) || 'aluno';

        setUser({
          id: authUser.id,
          email: authUser.email || '',
          nome_completo: (profileRow as any)?.nome_completo || authUser.email || 'Usuário',
          role: userRole,
        });
        setProfile((profileRow as any) || null);
        setRole(userRole);

        // Se for aluno, carrega os dados específicos da tabela alunos
        if (profileRow) {
          const { data: alunoRow } = await (supabase.from('alunos') as any)
            .select('*')
            .eq('profile_id', (profileRow as any).id)
            .maybeSingle();
          setAlunoData(alunoRow || null);
        } else {
          setAlunoData(null);
        }
      } else {
        setUser(null);
        setProfile(null);
        setRole(null);
        setAlunoData(null);
      }
    } catch (err) {
      console.error('Erro ao inicializar sessão de autenticação com Supabase:', err);
      setUser(null);
      setProfile(null);
      setRole(null);
      setAlunoData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initSession();

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
  }, []);

  const signIn = async (email: string, senha: string): Promise<{ error?: string }> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: senha,
      });

      if (error) {
        return { error: error.message };
      }

      if (data.session) {
        await initSession();
      }

      return {};
    } catch (err) {
      return { error: (err as Error).message || 'Falha na autenticação.' };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setRole(null);
      setAlunoData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfilePhoto = async (photoUrl: string) => {
    if (!profile) return;
    try {
      const { error } = await (supabase.from('profiles') as any)
        .update({ foto_url: photoUrl, updated_at: new Date().toISOString() })
        .eq('id', profile.id);

      if (error) throw error;

      setProfile((prev) => (prev ? { ...prev, foto_url: photoUrl } : null));
    } catch (err) {
      console.error('Erro ao atualizar foto no Supabase:', err);
      throw err;
    }
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
      signIn,
      signOut,
      updateProfilePhoto,
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
