/**
 * BJJ College - Tipos do Banco de Dados Supabase & Aplicação
 * Prof. Rogério
 */

export type RoleUsuario = 'aluno' | 'admin';

export type StatusConvite = 'pendente' | 'aceito' | 'expirado';

export type FaixaBJJ =
  | 'branca'
  | 'cinza'
  | 'amarela'
  | 'laranja'
  | 'verde'
  | 'azul'
  | 'roxa'
  | 'marrom'
  | 'preta'
  | 'coral'
  | 'vermelha_branca'
  | 'vermelha';

export type StatusPagamento = 'pago' | 'pendente' | 'atrasado';

export type MetodoPagamento = 'pix' | 'dinheiro' | 'cartao' | 'transferencia';

export interface Profile {
  id: string;
  user_id?: string | null;
  email: string;
  nome_completo: string;
  telefone?: string | null;
  foto_url?: string | null;
  status_convite: StatusConvite;
  invited_by?: string | null;
  invited_at: string;
  accepted_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: RoleUsuario;
  created_at: string;
}

export interface Aluno {
  id: string;
  profile_id: string;
  data_inicio: string;
  faixa_atual: FaixaBJJ;
  graus?: number; // 0 a 4 graus
  data_graduacao?: string | null;
  ativo: boolean;
  total_treinos?: number; // Total de treinos / presenças confirmadas
  is_demo?: boolean; // Flag para diferenciar alunos fictícios de reais
  observacoes?: string | null;
  created_at: string;
  updated_at: string;
  // Campos populados em joins
  profile?: Profile;
}

export interface Graduacao {
  id: string;
  aluno_id: string;
  faixa: FaixaBJJ;
  graus?: number; // 0 a 4 graus concedidos
  tipo?: 'grau' | 'faixa'; // Tipo de promoção
  data: string;
  professor_id?: string | null;
  observacoes?: string | null;
  created_at: string;
  // Campos populados em joins
  professor?: Profile;
}

export interface CheckIn {
  id: string;
  aluno_id: string;
  data: string; // Formato YYYY-MM-DD
  created_at: string;
  // Joins
  aluno?: Aluno;
}

export interface Pagamento {
  id: string;
  aluno_id: string;
  mes_referencia: string; // formato YYYY-MM
  valor: number;
  status: StatusPagamento;
  data_vencimento: string;
  data_pagamento?: string | null;
  metodo?: MetodoPagamento | null;
  created_at: string;
  updated_at: string;
  // Campos populados em joins
  aluno?: Aluno & { profile?: Profile };
}

export interface PagamentoAuditoria {
  id: string;
  pagamento_id: string;
  alterado_por?: string | null;
  status_anterior?: string | null;
  status_novo?: string | null;
  valor_anterior?: number | null;
  valor_novo?: number | null;
  alterado_em: string;
  // Joins
  perfil_autor?: Profile;
}

export interface Aviso {
  id: string;
  titulo: string;
  conteudo: string;
  autor_id?: string | null;
  ativo: boolean;
  expira_em?: string | null;
  created_at: string;
  // Joins
  autor?: Profile;
}

export interface Configuracao {
  id: string;
  chave: string;
  valor: string | null;
  updated_at: string;
}

// Configurações chave do sistema
export interface BJJCollegeConfig {
  chave_pix: string;
  valor_mensalidade: string;
  dia_vencimento: string;
  nome_academia: string;
  nome_professor: string;
}

export const DEFAULT_CONFIG: BJJCollegeConfig = {
  chave_pix: '21991545136',
  valor_mensalidade: '180.00',
  dia_vencimento: '10',
  nome_academia: 'BJJ College',
  nome_professor: 'Rogério',
};

export interface SupabaseDatabase {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { email: string; nome_completo: string };
        Update: Partial<Profile>;
      };
      user_roles: {
        Row: UserRole;
        Insert: { user_id: string; role: RoleUsuario };
        Update: Partial<UserRole>;
      };
      alunos: {
        Row: Aluno;
        Insert: {
          profile_id: string;
          data_inicio: string;
          faixa_atual?: FaixaBJJ;
          graus?: number;
          data_graduacao?: string | null;
          ativo?: boolean;
          total_treinos?: number;
          is_demo?: boolean;
          observacoes?: string | null;
        };
        Update: Partial<Aluno>;
      };
      graduacoes: {
        Row: Graduacao;
        Insert: {
          aluno_id: string;
          faixa: FaixaBJJ;
          graus?: number;
          tipo?: 'grau' | 'faixa';
          data: string;
          professor_id?: string | null;
          observacoes?: string | null;
        };
        Update: Partial<Graduacao>;
      };
      checkins: {
        Row: CheckIn;
        Insert: {
          aluno_id: string;
          data: string;
        };
        Update: Partial<CheckIn>;
      };
      pagamentos: {
        Row: Pagamento;
        Insert: {
          aluno_id: string;
          mes_referencia: string;
          valor: number;
          status?: StatusPagamento;
          data_vencimento: string;
          data_pagamento?: string | null;
          metodo?: MetodoPagamento | null;
        };
        Update: Partial<Pagamento>;
      };
      pagamentos_auditoria: {
        Row: PagamentoAuditoria;
        Insert: Omit<PagamentoAuditoria, 'id' | 'alterado_em'>;
        Update: Partial<PagamentoAuditoria>;
      };
      avisos: {
        Row: Aviso;
        Insert: {
          titulo: string;
          conteudo: string;
          autor_id?: string | null;
          ativo?: boolean;
          expira_em?: string | null;
        };
        Update: Partial<Aviso>;
      };
      configuracoes: {
        Row: Configuracao;
        Insert: { chave: string; valor?: string | null };
        Update: Partial<Configuracao>;
      };
    };
  };
}
