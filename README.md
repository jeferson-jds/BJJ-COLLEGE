# BJJ College - Sistema de Gestão para Academia de Jiu Jitsu 🥋

Sistema completo, moderno e seguro para gestão de academia de Jiu Jitsu sob a liderança do **Professor Gorillaz** (Faixa Preta).

---

## ⚡ Stack Tecnológica

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide React
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Validação**: Zod (em 100% dos formulários e inputs)
- **Roteamento**: React Router v6
- **Estado Assíncrono**: TanStack Query (React Query)
- **Formulários**: React Hook Form com `@hookform/resolvers/zod`
- **Notificações**: Sonner (toasts)
- **Deploy**: Cloud Run / Vercel

---

## 🛡️ Arquitetura de Segurança & RLS (Row Level Security)

1. **RLS Obrigatório em Todas as Tabelas**:
   - `profiles`: Leitura por autenticados, edição apenas do próprio perfil via `auth.uid() = user_id`.
   - `alunos`: Visualização permitida pelo próprio aluno ou admins; criação, graduação e edição exclusiva do Professor Gorillaz.
   - `pagamentos`: Leitura restrita ao próprio aluno e admins; mutações permitidas apenas para admins.
   - `pagamentos_auditoria`: Log imutável protegido contra exclusão ou alteração.
   - `graduacoes`: Inserção exclusiva pelo Professor Gorillaz.
   - `avisos`: Leitura pública para autenticados; criação/edição/deleção restrita a admins.
   - `configuracoes`: Chave PIX, valor da mensalidade e dia de vencimento com gravação restrita a admins.

2. **Hierarquia de Roles (Tabela `user_roles`)**:
   - As permissões **não** são salvas nos metadados JWT editáveis do cliente, mas sim validadas diretamente na tabela `user_roles` via função SQL `is_admin()`.

3. **Storage Seguro com Signed URLs**:
   - O bucket `fotos_alunos` é privado. O acesso às imagens é protegido por URLs assinadas de 1 hora via Edge Function `get-signed-photo-url`.

4. **Service Role Key Protegida**:
   - A `SUPABASE_SERVICE_ROLE_KEY` nunca é exposta no bundle client-side. Convites e operações privilegiadas rodam nas Edge Functions.

5. **Auditoria de Pagamentos**:
   - Cada baixa ou alteração de pagamento dispara um registro na tabela `pagamentos_auditoria` contendo o autor, valor anterior/novo e data.

---

## 🚀 Como Executar o Projeto

### Modo Demonstração Imediato (Sem necessidade de credenciais externas)
A aplicação possui um **modo demo inteligente e persistente** (Local Storage) que permite testar imediatamente todos os fluxos:
- **Professor Gorillaz (Admin)**: Acesso completo ao painel, graduação de faixas, controle de inadimplentes, baixa de pagamentos com 1 clique e mural de avisos.
- **Lucas Gracie (Aluno Faixa Azul - Em dia)**: Visualização da faixa, histórico de graduações e cópia da chave PIX em 1 toque.
- **Beatriz Silva (Aluno - Inadimplente)**: Indicador pulsante em vermelho e dados da chave PIX para acerto.

> Você pode alternar instantaneamente entre os perfis utilizando o banner superior no topo da aplicação.

### Conexão com Supabase Real
1. Crie um projeto no [Supabase](https://supabase.com).
2. Acesse o **SQL Editor** no painel do Supabase e execute o script:
   ```
   supabase/migrations/001_initial_schema.sql
   ```
3. Defina as variáveis de ambiente no arquivo `.env`:
   ```env
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-anon-key
   ```
4. Faça o deploy das Edge Functions:
   ```bash
   supabase functions deploy invite-aluno
   supabase functions deploy get-signed-photo-url
   ```

---

## 🥋 Mapeamento de Rotas

### Públicas
- `/login`: Autenticação com e-mail e senha
- `/primeiro-acesso`: Ativação de conta e criação de senha para novos alunos
- `/recuperar-senha`: Solicitação de link de redefinição

### Professor Gorillaz (Admin)
- `/admin`: Dashboard com os 3 cards principais (Total alunos, Inadimplentes, Graduações próximas)
- `/admin/alunos`: Listagem com filtros por faixa, status e busca
- `/admin/alunos/novo`: Matrícula de aluno e disparo de convite seguro
- `/admin/alunos/:id`: Ficha do aluno, graduação de faixa e lançamento de cobrança
- `/admin/pagamentos`: Gestão financeira, baixa com 1 clique e aba de auditoria
- `/admin/avisos`: Publicação e moderação do mural da academia
- `/admin/configuracoes`: Chave PIX, valor da mensalidade e dia de vencimento

### Aluno
- `/aluno`: Status do pagamento (indicador animado verde/vermelho), chave PIX com cópia em 1 toque e mural
- `/aluno/perfil`: Edição de dados cadastrais e foto de perfil (com faixa bloqueada para edição)

---
*Oss! BJJ College - Disciplina, Técnica e Honra no Tatame.*
