import { create } from 'zustand';

interface AuthState {
  token: string | null;
  usuario: { id: string; email: string; tipo: string } | null;
  academiaId: string | null;
  setToken: (token: string) => void;
  logout: () => void;
}

function parseJwt(token: string) {
  try {
    return JSON.parse(atob(token.split('.')[1]!));
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  usuario: null,
  academiaId: null,
  setToken: (token) => {
    const payload = parseJwt(token);
    set({
      token,
      academiaId: payload?.academiaId ?? null,
      usuario: payload ? { id: payload.sub, email: payload.email, tipo: payload.tipo } : null,
    });
  },
  logout: () => set({ token: null, usuario: null, academiaId: null }),
}));
