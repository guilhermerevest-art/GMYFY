const API_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001';

async function request<T>(path: string, options?: RequestInit, token?: string): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Erro desconhecido' }));
    throw new Error((err as any).message ?? 'Erro na requisição');
  }
  return res.json() as Promise<T>;
}

export const api = {
  auth: {
    login: (email: string, senha: string) =>
      request<{ access_token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, senha }),
      }),
    register: (data: object) =>
      request<{ access_token: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },
  academias: {
    get: (id: string, token: string) => request<any>(`/academias/${id}`, {}, token),
    update: (id: string, data: object, token: string) =>
      request<any>(`/academias/${id}`, { method: 'PATCH', body: JSON.stringify(data) }, token),
    getAlunos: (id: string, token: string) => request<any[]>(`/academias/${id}/alunos`, {}, token),
  },
  ranking: {
    get: (academiaId: string, token: string, periodo?: string) =>
      request<any[]>(`/ranking?academia_id=${academiaId}${periodo ? `&periodo=${periodo}` : ''}`, {}, token),
  },
  checkins: {
    getHistorico: (academiaId: string, token: string) =>
      request<any[]>(`/checkins?academia_id=${academiaId}`, {}, token),
  },
  alertas: {
    getChurn: (token: string, risco?: string) =>
      request<any[]>(`/alertas/churn${risco ? `?risco=${risco}` : ''}`, {}, token),
  },
  desafios: {
    getAll: (academiaId: string, token: string) =>
      request<any[]>(`/desafios?academia_id=${academiaId}`, {}, token),
    create: (data: object, token: string) =>
      request<any>('/desafios', { method: 'POST', body: JSON.stringify(data) }, token),
    ativar: (id: string, token: string) =>
      request<any>(`/desafios/${id}/ativar`, { method: 'PATCH' }, token),
  },
  premios: {
    getAll: (academiaId: string, token: string) =>
      request<any[]>(`/premios?academia_id=${academiaId}`, {}, token),
    create: (data: object, token: string) =>
      request<any>('/premios', { method: 'POST', body: JSON.stringify(data) }, token),
    getResgates: (token: string) => request<any[]>('/premios/resgates', {}, token),
  },
  relatorios: {
    getMensal: (token: string) => request<any>('/relatorios/mensal', {}, token),
    getFrequencia: (token: string, dias?: number) =>
      request<any[]>(`/relatorios/frequencia${dias ? `?dias=${dias}` : ''}`, {}, token),
    getRoi: (token: string) => request<any>('/relatorios/roi', {}, token),
  },
  feed: {
    get: (academiaId: string, token: string) =>
      request<any>(`/feed?academia_id=${academiaId}`, {}, token),
  },
};
