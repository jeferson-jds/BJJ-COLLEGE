/**
 * BJJ College - Engine de Persistência Local e Sincronização
 * Permite funcionamento 100% offline/demo imediato no preview e
 * integra perfeitamente com Supabase real quando configurado.
 */

import {
  Aluno,
  Aviso,
  BJJCollegeConfig,
  CheckIn,
  Graduacao,
  Pagamento,
  PagamentoAuditoria,
  Profile,
  UserRole,
} from '../types/database';
import {
  INITIAL_ALUNOS,
  INITIAL_AUDITORIA,
  INITIAL_AVISOS,
  INITIAL_CHECKINS,
  INITIAL_CONFIG,
  INITIAL_GRADUACOES,
  INITIAL_PAGAMENTOS,
  INITIAL_PROFILES,
  INITIAL_USER_ROLES,
} from './mockData';

const STORAGE_KEYS = {
  PROFILES: 'bjj_college_profiles',
  ROLES: 'bjj_college_roles',
  ALUNOS: 'bjj_college_alunos',
  GRADUACOES: 'bjj_college_graduacoes',
  PAGAMENTOS: 'bjj_college_pagamentos',
  AUDITORIA: 'bjj_college_auditoria',
  AVISOS: 'bjj_college_avisos',
  CONFIG: 'bjj_college_config',
  CHECKINS: 'bjj_college_checkins',
};

function getLocal<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(item);
  } catch {
    return fallback;
  }
}

function setLocal<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error('Erro ao salvar no localStorage:', err);
  }
}

export const localStore = {
  getProfiles: (): Profile[] => getLocal(STORAGE_KEYS.PROFILES, INITIAL_PROFILES),
  saveProfiles: (data: Profile[]) => setLocal(STORAGE_KEYS.PROFILES, data),

  getRoles: (): UserRole[] => getLocal(STORAGE_KEYS.ROLES, INITIAL_USER_ROLES),
  saveRoles: (data: UserRole[]) => setLocal(STORAGE_KEYS.ROLES, data),

  getAlunos: (): Aluno[] => {
    const alunos = getLocal<Aluno[]>(STORAGE_KEYS.ALUNOS, INITIAL_ALUNOS);
    const profiles = localStore.getProfiles();
    return alunos.map((a) => ({
      ...a,
      profile: profiles.find((p) => p.id === a.profile_id),
    }));
  },
  saveAlunos: (data: Aluno[]) => {
    // Salva sem o objeto de profile aninhado para integridade
    const cleanAlunos = data.map(({ profile, ...rest }) => rest);
    setLocal(STORAGE_KEYS.ALUNOS, cleanAlunos);
  },

  getGraduacoes: (): Graduacao[] => {
    const grads = getLocal<Graduacao[]>(STORAGE_KEYS.GRADUACOES, INITIAL_GRADUACOES);
    const profiles = localStore.getProfiles();
    return grads.map((g) => ({
      ...g,
      professor: profiles.find((p) => p.id === g.professor_id),
    }));
  },
  saveGraduacoes: (data: Graduacao[]) => {
    const clean = data.map(({ professor, ...rest }) => rest);
    setLocal(STORAGE_KEYS.GRADUACOES, clean);
  },

  getPagamentos: (): Pagamento[] => {
    const pags = getLocal<Pagamento[]>(STORAGE_KEYS.PAGAMENTOS, INITIAL_PAGAMENTOS);
    const alunos = localStore.getAlunos();
    return pags.map((p) => ({
      ...p,
      aluno: alunos.find((a) => a.id === p.aluno_id),
    }));
  },
  savePagamentos: (data: Pagamento[]) => {
    const clean = data.map(({ aluno, ...rest }) => rest);
    setLocal(STORAGE_KEYS.PAGAMENTOS, clean);
  },

  getAuditoria: (): PagamentoAuditoria[] => {
    const audits = getLocal<PagamentoAuditoria[]>(STORAGE_KEYS.AUDITORIA, INITIAL_AUDITORIA);
    const profiles = localStore.getProfiles();
    return audits.map((a) => ({
      ...a,
      perfil_autor: profiles.find((p) => p.id === a.alterado_por),
    }));
  },
  addAuditoria: (item: Omit<PagamentoAuditoria, 'id' | 'alterado_em'>) => {
    const audits = getLocal<PagamentoAuditoria[]>(STORAGE_KEYS.AUDITORIA, INITIAL_AUDITORIA);
    const newItem: PagamentoAuditoria = {
      ...item,
      id: `audit-${Date.now()}`,
      alterado_em: new Date().toISOString(),
    };
    audits.unshift(newItem);
    setLocal(STORAGE_KEYS.AUDITORIA, audits);
  },

  getAvisos: (): Aviso[] => {
    const avisos = getLocal<Aviso[]>(STORAGE_KEYS.AVISOS, INITIAL_AVISOS);
    const profiles = localStore.getProfiles();
    return avisos.map((av) => ({
      ...av,
      autor: profiles.find((p) => p.id === av.autor_id),
    }));
  },
  saveAvisos: (data: Aviso[]) => {
    const clean = data.map(({ autor, ...rest }) => rest);
    setLocal(STORAGE_KEYS.AVISOS, clean);
  },

  getConfig: (): BJJCollegeConfig => getLocal(STORAGE_KEYS.CONFIG, INITIAL_CONFIG),
  saveConfig: (data: BJJCollegeConfig) => setLocal(STORAGE_KEYS.CONFIG, data),

  getCheckIns: (dataFiltro?: string): CheckIn[] => {
    const checkins = getLocal<CheckIn[]>(STORAGE_KEYS.CHECKINS, INITIAL_CHECKINS);
    if (!dataFiltro) return checkins;
    return checkins.filter((c) => c.data === dataFiltro);
  },
  saveCheckIns: (data: CheckIn[]) => {
    const clean = data.map(({ aluno, ...rest }) => rest);
    setLocal(STORAGE_KEYS.CHECKINS, clean);
  },
  toggleCheckIn: (alunoId: string, dataTreino?: string): { checkedIn: boolean; totalTreinos: number } => {
    const dataAlvo = dataTreino || new Date().toISOString().split('T')[0];
    const checkins = getLocal<CheckIn[]>(STORAGE_KEYS.CHECKINS, INITIAL_CHECKINS);
    const existingIndex = checkins.findIndex((c) => c.aluno_id === alunoId && c.data === dataAlvo);
    const alunos = localStore.getAlunos();
    const aluno = alunos.find((a) => a.id === alunoId);
    let total = aluno?.total_treinos || 0;
    let isCheckedIn = false;

    if (existingIndex >= 0) {
      // Remover check-in (desmarcar presença)
      checkins.splice(existingIndex, 1);
      total = Math.max(0, total - 1);
      isCheckedIn = false;
    } else {
      // Registrar presença
      checkins.push({
        id: `chk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        aluno_id: alunoId,
        data: dataAlvo,
        created_at: new Date().toISOString(),
      });
      total = total + 1;
      isCheckedIn = true;
    }

    localStore.saveCheckIns(checkins);

    // Atualiza contador no aluno
    if (aluno) {
      aluno.total_treinos = total;
      aluno.updated_at = new Date().toISOString();
      localStore.saveAlunos(alunos);
    }

    return { checkedIn: isCheckedIn, totalTreinos: total };
  },

  // Alternar ou limpar alunos fictícios
  clearDemoAlunos: (): { removidos: number } => {
    const alunos = localStore.getAlunos();
    const demoIds = alunos.filter((a) => a.is_demo).map((a) => a.id);
    const demoProfileIds = alunos.filter((a) => a.is_demo).map((a) => a.profile_id);

    // Filtra alunos, mantendo apenas os reais
    const alunosReais = alunos.filter((a) => !a.is_demo);
    localStore.saveAlunos(alunosReais);

    // Limpa profiles correspondentes aos fictícios
    const profiles = localStore.getProfiles();
    const profilesReais = profiles.filter((p) => !demoProfileIds.includes(p.id));
    localStore.saveProfiles(profilesReais);

    // Limpa check-ins dos fictícios
    const checkins = getLocal<CheckIn[]>(STORAGE_KEYS.CHECKINS, INITIAL_CHECKINS);
    const checkinsReais = checkins.filter((c) => !demoIds.includes(c.aluno_id));
    localStore.saveCheckIns(checkinsReais);

    return { removidos: demoIds.length };
  },

  restoreDemoAlunos: () => {
    localStore.saveAlunos(INITIAL_ALUNOS);
    localStore.saveProfiles(INITIAL_PROFILES);
    localStore.saveCheckIns(INITIAL_CHECKINS);
    localStore.saveGraduacoes(INITIAL_GRADUACOES);
  },

  resetDemoData: () => {
    localStorage.removeItem(STORAGE_KEYS.PROFILES);
    localStorage.removeItem(STORAGE_KEYS.ROLES);
    localStorage.removeItem(STORAGE_KEYS.ALUNOS);
    localStorage.removeItem(STORAGE_KEYS.GRADUACOES);
    localStorage.removeItem(STORAGE_KEYS.PAGAMENTOS);
    localStorage.removeItem(STORAGE_KEYS.AUDITORIA);
    localStorage.removeItem(STORAGE_KEYS.AVISOS);
    localStorage.removeItem(STORAGE_KEYS.CONFIG);
    localStorage.removeItem(STORAGE_KEYS.CHECKINS);
  },
};
