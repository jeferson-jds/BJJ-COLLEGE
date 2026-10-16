-- ==============================================================================
-- BJJ College - Sistema de Gestão de Academia de Jiu Jitsu
-- Professor Responsável: Gorillaz
-- Arquivo: 001_initial_schema.sql
-- Descrição: Criação de tabelas, índices, triggers, storage e políticas RLS
-- ==============================================================================

-- 1. EXTENSÕES NECESSÁRIAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABELA DE PERFIS (USUÁRIOS)
-- Armazena dados cadastrais complementares associados ao auth.users do Supabase
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  nome_completo text NOT NULL,
  telefone text,
  foto_url text,
  status_convite text DEFAULT 'pendente' CHECK (status_convite IN ('pendente', 'aceito', 'expirado')),
  invited_by uuid REFERENCES profiles(id),
  invited_at timestamptz DEFAULT now(),
  accepted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. TABELA DE ROLES / PERMISSÕES (SEPARADA PARA PREVENIR PRIVILEGE ESCALATION)
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  role text NOT NULL CHECK (role IN ('aluno', 'admin')),
  created_at timestamptz DEFAULT now()
);

-- 4. TABELA DE ALUNOS
-- Vinculada diretamente ao profile do usuário
CREATE TABLE IF NOT EXISTS alunos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  data_inicio date NOT NULL,
  faixa_atual text NOT NULL DEFAULT 'branca' CHECK (faixa_atual IN (
    'branca','cinza','amarela','laranja','verde','azul','roxa','marrom','preta','coral','vermelha_branca','vermelha'
  )),
  data_graduacao date,
  ativo boolean DEFAULT true,
  observacoes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 5. TABELA DE GRADUAÇÕES (HISTÓRICO DE FAIXAS)
CREATE TABLE IF NOT EXISTS graduacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id uuid REFERENCES alunos(id) ON DELETE CASCADE NOT NULL,
  faixa text NOT NULL CHECK (faixa IN (
    'branca','cinza','amarela','laranja','verde','azul','roxa','marrom','preta','coral','vermelha_branca','vermelha'
  )),
  data date NOT NULL,
  professor_id uuid REFERENCES profiles(id),
  observacoes text,
  created_at timestamptz DEFAULT now()
);

-- 6. TABELA DE PAGAMENTOS
CREATE TABLE IF NOT EXISTS pagamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id uuid REFERENCES alunos(id) ON DELETE CASCADE NOT NULL,
  mes_referencia text NOT NULL, -- formato YYYY-MM
  valor numeric(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'pendente' CHECK (status IN ('pago','pendente','atrasado')),
  data_vencimento date NOT NULL,
  data_pagamento date,
  metodo text CHECK (metodo IN ('pix','dinheiro','cartao','transferencia')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(aluno_id, mes_referencia)
);

-- 7. AUDITORIA DE PAGAMENTOS (LOG DE ALTERAÇÕES)
CREATE TABLE IF NOT EXISTS pagamentos_auditoria (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pagamento_id uuid REFERENCES pagamentos(id) ON DELETE CASCADE NOT NULL,
  alterado_por uuid REFERENCES profiles(id),
  status_anterior text,
  status_novo text,
  valor_anterior numeric(10,2),
  valor_novo numeric(10,2),
  alterado_em timestamptz DEFAULT now()
);

-- 8. TABELA DE AVISOS DO MURAL
CREATE TABLE IF NOT EXISTS avisos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  conteudo text NOT NULL,
  autor_id uuid REFERENCES profiles(id),
  ativo boolean DEFAULT true,
  expira_em timestamptz,
  created_at timestamptz DEFAULT now()
);

-- 9. CONFIGURAÇÕES DO SISTEMA (ACADEMIA BJJ COLLEGE)
CREATE TABLE IF NOT EXISTS configuracoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chave text UNIQUE NOT NULL,
  valor text,
  updated_at timestamptz DEFAULT now()
);

-- Inserir configurações padrão da BJJ College
INSERT INTO configuracoes (chave, valor) VALUES
  ('chave_pix', '21991545136'),
  ('valor_mensalidade', '180.00'),
  ('dia_vencimento', '10'),
  ('nome_academia', 'BJJ College'),
  ('nome_professor', 'Rogério')
ON CONFLICT (chave) DO NOTHING;

-- 10. ÍNDICES PARA ALTA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_alunos_profile_id ON alunos(profile_id);
CREATE INDEX IF NOT EXISTS idx_alunos_ativo ON alunos(ativo);
CREATE INDEX IF NOT EXISTS idx_pagamentos_aluno_id ON pagamentos(aluno_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_status ON pagamentos(status);
CREATE INDEX IF NOT EXISTS idx_pagamentos_mes ON pagamentos(mes_referencia);
CREATE INDEX IF NOT EXISTS idx_graduacoes_aluno_id ON graduacoes(aluno_id);
CREATE INDEX IF NOT EXISTS idx_avisos_ativo ON avisos(ativo, expira_em);

-- ==============================================================================
-- POLÍTICAS DE ROW LEVEL SECURITY (RLS)
-- ==============================================================================

-- Função helper para verificar se o usuário autenticado é admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = (select auth.uid()) AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Habilitar RLS em todas as tabelas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE alunos ENABLE ROW LEVEL SECURITY;
ALTER TABLE graduacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagamentos_auditoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE avisos ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS: PROFILES
DROP POLICY IF EXISTS "Usuario ve seu proprio perfil" ON profiles;
CREATE POLICY "Usuario ve seu proprio perfil" ON profiles
  FOR SELECT USING ((select auth.uid()) = user_id OR is_admin());

DROP POLICY IF EXISTS "Admin gerencia todos perfis" ON profiles;
CREATE POLICY "Admin gerencia todos perfis" ON profiles
  FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "Usuario atualiza seu proprio perfil" ON profiles;
CREATE POLICY "Usuario atualiza seu proprio perfil" ON profiles
  FOR UPDATE USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- POLÍTICAS: USER_ROLES (Crítico para segurança contra Privilege Escalation)
DROP POLICY IF EXISTS "Usuario ve seu proprio role" ON user_roles;
CREATE POLICY "Usuario ve seu proprio role" ON user_roles
  FOR SELECT USING ((select auth.uid()) = user_id OR is_admin());

DROP POLICY IF EXISTS "Apenas admin gerencia roles" ON user_roles;
CREATE POLICY "Apenas admin gerencia roles" ON user_roles
  FOR ALL USING (is_admin());

-- POLÍTICAS: ALUNOS
DROP POLICY IF EXISTS "Aluno ve seu proprio cadastro" ON alunos;
CREATE POLICY "Aluno ve seu proprio cadastro" ON alunos
  FOR SELECT USING (
    profile_id IN (SELECT id FROM profiles WHERE user_id = (select auth.uid()))
    OR is_admin()
  );

DROP POLICY IF EXISTS "Apenas admin gerencia alunos" ON alunos;
CREATE POLICY "Apenas admin gerencia alunos" ON alunos
  FOR ALL USING (is_admin());

-- POLÍTICAS: GRADUACOES
DROP POLICY IF EXISTS "Aluno ve suas graduacoes" ON graduacoes;
CREATE POLICY "Aluno ve suas graduacoes" ON graduacoes
  FOR SELECT USING (
    aluno_id IN (
      SELECT a.id FROM alunos a
      JOIN profiles p ON p.id = a.profile_id
      WHERE p.user_id = (select auth.uid())
    )
    OR is_admin()
  );

DROP POLICY IF EXISTS "Apenas admin gerencia graduacoes" ON graduacoes;
CREATE POLICY "Apenas admin gerencia graduacoes" ON graduacoes
  FOR ALL USING (is_admin());

-- POLÍTICAS: PAGAMENTOS
DROP POLICY IF EXISTS "Aluno ve seus pagamentos" ON pagamentos;
CREATE POLICY "Aluno ve seus pagamentos" ON pagamentos
  FOR SELECT USING (
    aluno_id IN (
      SELECT a.id FROM alunos a
      JOIN profiles p ON p.id = a.profile_id
      WHERE p.user_id = (select auth.uid())
    )
    OR is_admin()
  );

DROP POLICY IF EXISTS "Apenas admin gerencia pagamentos" ON pagamentos;
CREATE POLICY "Apenas admin gerencia pagamentos" ON pagamentos
  FOR ALL USING (is_admin());

-- POLÍTICAS: AUDITORIA
DROP POLICY IF EXISTS "Apenas admin ve auditoria" ON pagamentos_auditoria;
CREATE POLICY "Apenas admin ve auditoria" ON pagamentos_auditoria
  FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Sistema insere auditoria" ON pagamentos_auditoria;
CREATE POLICY "Sistema insere auditoria" ON pagamentos_auditoria
  FOR INSERT WITH CHECK (true);

-- POLÍTICAS: AVISOS
DROP POLICY IF EXISTS "Alunos ativos veem avisos ativos" ON avisos;
CREATE POLICY "Alunos ativos veem avisos ativos" ON avisos
  FOR SELECT USING (
    (ativo = true AND (expira_em IS NULL OR expira_em > now()))
    OR is_admin()
  );

DROP POLICY IF EXISTS "Apenas admin gerencia avisos" ON avisos;
CREATE POLICY "Apenas admin gerencia avisos" ON avisos
  FOR ALL USING (is_admin());

-- POLÍTICAS: CONFIGURACOES
DROP POLICY IF EXISTS "Todos autenticados leem configuracoes" ON configuracoes;
CREATE POLICY "Todos autenticados leem configuracoes" ON configuracoes
  FOR SELECT USING ((select auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "Apenas admin gerencia configuracoes" ON configuracoes;
CREATE POLICY "Apenas admin gerencia configuracoes" ON configuracoes
  FOR ALL USING (is_admin());

-- ==============================================================================
-- TRIGGERS AUTOMÁTICOS
-- ==============================================================================

-- 1. Vincular cadastro quando aluno cria login
CREATE OR REPLACE FUNCTION vincular_cadastro()
RETURNS trigger AS $$
BEGIN
  UPDATE profiles
  SET user_id = NEW.id,
      status_convite = 'aceito',
      accepted_at = now()
  WHERE email = NEW.email AND user_id IS NULL;
  
  -- Se não existia, criar profile novo como aluno
  IF NOT FOUND THEN
    INSERT INTO profiles (user_id, email, nome_completo, status_convite, accepted_at)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'nome_completo', NEW.email), 'aceito', now());
    
    INSERT INTO user_roles (user_id, role)
    VALUES (NEW.id, 'aluno');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION vincular_cadastro();

-- 2. Auditoria de pagamentos
CREATE OR REPLACE FUNCTION auditar_pagamento()
RETURNS trigger AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status OR OLD.valor IS DISTINCT FROM NEW.valor THEN
    INSERT INTO pagamentos_auditoria (
      pagamento_id, alterado_por, status_anterior, status_novo, valor_anterior, valor_novo
    ) VALUES (
      NEW.id,
      (select auth.uid()),
      OLD.status,
      NEW.status,
      OLD.valor,
      NEW.valor
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_pagamento_update ON pagamentos;
CREATE TRIGGER on_pagamento_update
  AFTER UPDATE ON pagamentos
  FOR EACH ROW EXECUTE FUNCTION auditar_pagamento();

-- 3. Atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_alunos_updated_at ON alunos;
CREATE TRIGGER update_alunos_updated_at BEFORE UPDATE ON alunos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_pagamentos_updated_at ON pagamentos;
CREATE TRIGGER update_pagamentos_updated_at BEFORE UPDATE ON pagamentos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ==============================================================================
-- STORAGE — FOTOS PRIVADAS COM POLÍTICAS RLS
-- ==============================================================================

-- Criar bucket privado 'alunos-fotos'
INSERT INTO storage.buckets (id, name, public)
VALUES ('alunos-fotos', 'alunos-fotos', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Políticas de Storage
DROP POLICY IF EXISTS "Aluno ve propria foto" ON storage.objects;
CREATE POLICY "Aluno ve propria foto" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'alunos-fotos'
    AND (
      (storage.foldername(name))[1] IN (
        SELECT p.id::text FROM profiles p WHERE p.user_id = (select auth.uid())
      )
      OR is_admin()
    )
  );

DROP POLICY IF EXISTS "Aluno faz upload da propria foto" ON storage.objects;
CREATE POLICY "Aluno faz upload da propria foto" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'alunos-fotos'
    AND (
      (storage.foldername(name))[1] IN (
        SELECT p.id::text FROM profiles p WHERE p.user_id = (select auth.uid())
      )
      OR is_admin()
    )
  );

DROP POLICY IF EXISTS "Aluno atualiza propria foto" ON storage.objects;
CREATE POLICY "Aluno atualiza propria foto" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'alunos-fotos'
    AND (
      (storage.foldername(name))[1] IN (
        SELECT p.id::text FROM profiles p WHERE p.user_id = (select auth.uid())
      )
      OR is_admin()
    )
  );

DROP POLICY IF EXISTS "Apenas admin deleta fotos" ON storage.objects;
CREATE POLICY "Apenas admin deleta fotos" ON storage.objects
  FOR DELETE USING (bucket_id = 'alunos-fotos' AND is_admin());
