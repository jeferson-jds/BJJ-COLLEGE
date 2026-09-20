import { z } from 'zod';

/**
 * Validadores Zod com mensagens em português para BJJ College
 */

export const emailSchema = z
  .string()
  .min(1, 'O e-mail é obrigatório.')
  .email('Digite um e-mail válido.');

export const nomeSchema = z
  .string()
  .min(3, 'O nome deve ter no mínimo 3 caracteres.')
  .max(100, 'O nome deve ter no máximo 100 caracteres.');

export const telefoneSchema = z
  .string()
  .regex(/^\+?[0-9\s()-]{10,20}$/, 'Telefone inválido. Ex: (11) 99999-9999 ou +5511999999999')
  .optional()
  .or(z.literal(''));

export const senhaSchema = z
  .string()
  .min(8, 'A senha deve ter pelo menos 8 caracteres.')
  .regex(/[A-Z]/, 'A senha deve conter ao menos uma letra maiúscula.')
  .regex(/[0-9]/, 'A senha deve conter ao menos um número.');

export const valorSchema = z
  .number()
  .positive('O valor deve ser maior que zero.');

export const dataSchema = z
  .string()
  .min(1, 'A data é obrigatória.')
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de data inválido (AAAA-MM-DD)');

// Esquema de Login
export const loginSchema = z.object({
  email: emailSchema,
  senha: z.string().min(1, 'A senha é obrigatória.'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Esquema de Primeiro Acesso (Definir Senha)
export const primeiroAcessoSchema = z
  .object({
    email: emailSchema,
    novaSenha: senhaSchema,
    confirmarSenha: z.string().min(1, 'Confirmação de senha é obrigatória.'),
  })
  .refine((data) => data.novaSenha === data.confirmarSenha, {
    message: 'As senhas não coincidem.',
    path: ['confirmarSenha'],
  });

export type PrimeiroAcessoFormData = z.infer<typeof primeiroAcessoSchema>;

// Esquema de Recuperação de Senha
export const recuperarSenhaSchema = z.object({
  email: emailSchema,
});

export type RecuperarSenhaFormData = z.infer<typeof recuperarSenhaSchema>;

// Esquema de Novo Aluno (Área do Professor)
export const novoAlunoSchema = z.object({
  nome_completo: nomeSchema,
  email: emailSchema,
  telefone: telefoneSchema,
  data_inicio: dataSchema,
  faixa_atual: z.enum([
    'branca',
    'azul',
    'roxa',
    'marrom',
    'preta',
    'cinza',
    'amarela',
    'laranja',
    'verde',
    'coral',
    'vermelha_branca',
    'vermelha',
  ]),
  graus: z.number().min(0, 'Mínimo 0 graus').max(4, 'Máximo 4 graus'),
  observacoes: z.string().max(500, 'Máximo 500 caracteres').optional(),
});

export type NovoAlunoFormData = z.infer<typeof novoAlunoSchema>;

// Esquema de Graduação de Aluno
export const graduacaoSchema = z.object({
  faixa: z.enum([
    'branca',
    'azul',
    'roxa',
    'marrom',
    'preta',
    'cinza',
    'amarela',
    'laranja',
    'verde',
    'coral',
    'vermelha_branca',
    'vermelha',
  ]),
  graus: z.number().min(0, 'Mínimo 0 graus').max(4, 'Máximo 4 graus'),
  tipo: z.enum(['grau', 'faixa']),
  data: dataSchema,
  observacoes: z.string().max(500, 'Máximo 500 caracteres').optional(),
});

export type GraduacaoFormData = z.infer<typeof graduacaoSchema>;

// Esquema de Registro de Pagamento
export const pagamentoSchema = z.object({
  mes_referencia: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Formato de mês deve ser AAAA-MM (Ex: 2026-09)'),
  valor: valorSchema,
  status: z.enum(['pago', 'pendente', 'atrasado']),
  data_vencimento: dataSchema,
  data_pagamento: z.string().optional().nullable(),
  metodo: z.enum(['pix', 'dinheiro', 'cartao', 'transferencia']).optional().nullable(),
});

export type PagamentoFormData = z.infer<typeof pagamentoSchema>;

// Esquema de Aviso do Mural
export const avisoSchema = z.object({
  titulo: z.string().min(3, 'O título deve ter no mínimo 3 caracteres.').max(120),
  conteudo: z.string().min(5, 'O conteúdo do aviso deve ter no mínimo 5 caracteres.'),
  ativo: z.boolean(),
  expira_em: z.string().optional().nullable(),
});

export type AvisoFormData = z.infer<typeof avisoSchema>;
export const novoAvisoSchema = avisoSchema;
export type NovoAvisoFormData = AvisoFormData;

// Esquema de Perfil do Aluno (Edição própria)
export const perfilAlunoSchema = z.object({
  nome_completo: nomeSchema,
  telefone: telefoneSchema,
});

export type PerfilAlunoFormData = z.infer<typeof perfilAlunoSchema>;

// Esquema de Configurações
export const configuracoesSchema = z.object({
  chave_pix: z.string().min(3, 'Chave PIX obrigatória'),
  valor_mensalidade: z.string().min(1, 'Valor obrigatório'),
  dia_vencimento: z.string().regex(/^([1-9]|[12]\d|3[01])$/, 'Dia entre 1 e 31'),
  nome_academia: z.string().min(2, 'Nome da academia'),
  nome_professor: z.string().min(2, 'Nome do professor'),
});

export type ConfiguracoesFormData = z.infer<typeof configuracoesSchema>;
