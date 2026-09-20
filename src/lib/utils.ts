import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { FaixaBJJ } from '../types/database';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrencyBRL(val: number | string | null | undefined): string {
  const num = typeof val === 'string' ? parseFloat(val) : (val || 0);
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(num);
}

export function formatDateBR(dateString?: string | null): string {
  if (!dateString) return '-';
  try {
    const [year, month, day] = dateString.split('T')[0].split('-');
    if (!year || !month || !day) return dateString;
    return `${day}/${month}/${year}`;
  } catch {
    return dateString;
  }
}

export function formatMonthYearBR(mesReferencia?: string | null): string {
  if (!mesReferencia) return '-';
  const [year, month] = mesReferencia.split('-');
  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const idx = parseInt(month, 10) - 1;
  if (idx >= 0 && idx < 12) {
    return `${meses[idx]} de ${year}`;
  }
  return mesReferencia;
}

// Configuração visual de faixas de Jiu Jitsu com as cores do Design System
export interface FaixaInfo {
  label: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  hex: string;
  tipColor: string; // ponteira preta ou vermelha
}

export const FAIXAS_BJJ: Record<FaixaBJJ, FaixaInfo> = {
  branca: {
    label: 'Branca',
    bgClass: 'bg-white',
    textClass: 'text-neutral-900 font-bold',
    borderClass: 'border-2 border-neutral-900',
    hex: '#ffffff',
    tipColor: '#000000',
  },
  cinza: {
    label: 'Cinza',
    bgClass: 'bg-neutral-400',
    textClass: 'text-neutral-900 font-bold',
    borderClass: 'border border-neutral-500',
    hex: '#9ca3af',
    tipColor: '#000000',
  },
  amarela: {
    label: 'Amarela',
    bgClass: 'bg-amber-400',
    textClass: 'text-neutral-900 font-bold',
    borderClass: 'border border-amber-500',
    hex: '#fbbf24',
    tipColor: '#000000',
  },
  laranja: {
    label: 'Laranja',
    bgClass: 'bg-orange-500',
    textClass: 'text-white font-bold',
    borderClass: 'border border-orange-600',
    hex: '#f97316',
    tipColor: '#000000',
  },
  verde: {
    label: 'Verde',
    bgClass: 'bg-emerald-600',
    textClass: 'text-white font-bold',
    borderClass: 'border border-emerald-700',
    hex: '#16a34a',
    tipColor: '#000000',
  },
  azul: {
    label: 'Azul',
    bgClass: 'bg-blue-600',
    textClass: 'text-white font-bold',
    borderClass: 'border border-blue-700',
    hex: '#2563eb',
    tipColor: '#000000',
  },
  roxa: {
    label: 'Roxa',
    bgClass: 'bg-purple-700',
    textClass: 'text-white font-bold',
    borderClass: 'border border-purple-800',
    hex: '#7c3aed',
    tipColor: '#000000',
  },
  marrom: {
    label: 'Marrom',
    bgClass: 'bg-amber-950',
    textClass: 'text-amber-100 font-bold',
    borderClass: 'border border-amber-900',
    hex: '#78350f',
    tipColor: '#000000',
  },
  preta: {
    label: 'Preta',
    bgClass: 'bg-neutral-950',
    textClass: 'text-white font-bold',
    borderClass: 'border border-neutral-800',
    hex: '#000000',
    tipColor: '#dc2626', // ponteira vermelha clássica de faixa preta
  },
  coral: {
    label: 'Coral (Vermelha e Preta)',
    bgClass: 'bg-gradient-to-r from-red-600 via-neutral-900 to-red-600',
    textClass: 'text-white font-bold',
    borderClass: 'border border-red-700',
    hex: '#fb7185',
    tipColor: '#ffffff',
  },
  vermelha_branca: {
    label: 'Vermelha e Branca',
    bgClass: 'bg-gradient-to-r from-red-600 via-white to-red-600',
    textClass: 'text-neutral-900 font-bold',
    borderClass: 'border border-red-600',
    hex: '#dc2626',
    tipColor: '#000000',
  },
  vermelha: {
    label: 'Vermelha (Grande Mestre)',
    bgClass: 'bg-red-600',
    textClass: 'text-white font-bold',
    borderClass: 'border border-red-700',
    hex: '#dc2626',
    tipColor: '#ffffff',
  },
};
