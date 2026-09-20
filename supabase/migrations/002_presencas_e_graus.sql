-- ==============================================================================
-- BJJ College - Migração 002: Graus, Total de Treinos e Gestão de Presença (Check-ins)
-- Professor: Rogério - Família Gorillaz
-- ==============================================================================

-- 1. ADICIONA COLUNAS DE GRAUS, TREINOS E FLAG DEMO EM ALUNOS
ALTER TABLE alunos
  ADD COLUMN IF NOT EXISTS graus integer DEFAULT 0 CHECK (graus >= 0 AND graus <= 4),
  ADD COLUMN IF NOT EXISTS total_treinos integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_demo boolean DEFAULT false;

-- 2. ATUALIZA TABELA DE GRADUAÇÕES PARA REGISTRAR GRAUS E TIPO
ALTER TABLE graduacoes
  ADD COLUMN IF NOT EXISTS graus integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tipo text DEFAULT 'faixa' CHECK (tipo IN ('grau', 'faixa'));

-- 3. TABELA DE CHECK-INS / PRESENÇA DIÁRIA
CREATE TABLE IF NOT EXISTS checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id uuid REFERENCES alunos(id) ON DELETE CASCADE NOT NULL,
  data date NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(aluno_id, data)
);

-- Índices de alta performance
CREATE INDEX IF NOT EXISTS idx_checkins_data ON checkins(data);
CREATE INDEX IF NOT EXISTS idx_checkins_aluno_id ON checkins(aluno_id);
CREATE INDEX IF NOT EXISTS idx_alunos_is_demo ON alunos(is_demo);

-- 4. POLÍTICAS RLS PARA CHECK-INS
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;

-- Leitura: Alunos autenticados podem ver suas próprias presenças e administradores podem ver todas
CREATE POLICY "Leitura de checkins" ON checkins
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
    OR
    EXISTS (
      SELECT 1 FROM alunos
      JOIN profiles ON profiles.id = alunos.profile_id
      WHERE alunos.id = checkins.aluno_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Escrita: Apenas administradores (Prof. Rogério) podem criar e remover check-ins
CREATE POLICY "Admin gerencia checkins" ON checkins
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );
