const API_URL = process.env['EXPO_PUBLIC_API_URL'] ?? 'http://localhost:3001';

async function request<T>(path: string, options?: RequestInit, token?: string): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Erro' }));
    throw new Error((err as any).message ?? 'Erro na requisição');
  }
  return res.json() as Promise<T>;
}

export const api = {
  auth: {
    login: (email: string, senha: string, token?: string) =>
      request<{ access_token: string }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, senha }) }, token),
    register: (data: object) =>
      request<{ access_token: string }>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  },
  checkins: {
    validar: (qrToken: string, token: string) =>
      request<any>('/checkins', { method: 'POST', body: JSON.stringify({ qrToken }) }, token),
    historico: (token: string) => request<any[]>('/checkins', {}, token),
  },
  ranking: {
    get: (token: string, periodo?: string) =>
      request<any[]>(`/ranking${periodo ? `?periodo=${periodo}` : ''}`, {}, token),
    minha: (token: string) => request<any>('/ranking/me', {}, token),
  },
  alunos: {
    perfil: (token: string) => request<any>('/alunos/me/perfil', {}, token),
    historico: (token: string) => request<any[]>('/alunos/me/historico', {}, token),
  },
  desafios: {
    ativos: (token: string) => request<any[]>('/desafios/ativos', {}, token),
    participar: (id: string, token: string) =>
      request<any>(`/desafios/${id}/participar`, { method: 'POST' }, token),
  },
  premios: {
    vitrine: (token: string) => request<any[]>('/premios', {}, token),
    resgatar: (id: string, token: string) =>
      request<any>(`/premios/${id}/resgatar`, { method: 'POST' }, token),
  },
  feed: {
    get: (token: string, cursor?: string) =>
      request<any>(`/feed${cursor ? `?cursor=${cursor}` : ''}`, {}, token),
    reagir: (postId: string, tipo: string, token: string) =>
      request<any>(`/feed/${postId}/reacoes`, { method: 'POST', body: JSON.stringify({ tipo }) }, token),
  },
  notificacoes: {
    get: (token: string) => request<any[]>('/notificacoes', {}, token),
    marcarLida: (id: string, token: string) =>
      request<any>(`/notificacoes/${id}/lida`, { method: 'PATCH' }, token),
  },
};
