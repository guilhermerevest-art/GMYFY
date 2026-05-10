import { create } from 'zustand';

const SUPABASE_URL = process.env['EXPO_PUBLIC_SUPABASE_URL'] ?? 'https://baqxljihngymjnasrdtl.supabase.co';

interface Session {
  userId: string;
  academiaId: string;
  nome: string;
  email: string;
}

interface AuthState {
  session: Session | null;
  setSession: (session: Session) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  setSession: (session) => set({ session }),
  logout: () => set({ session: null }),
}));

export async function loginWithEdgeFunction(email: string, senha: string): Promise<Session> {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/auth-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Erro ao fazer login' }));
    throw new Error(err.message ?? 'Erro ao fazer login');
  }
  return res.json();
}

export async function registerWithEdgeFunction(nome: string, email: string, senha: string): Promise<Session> {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/auth-register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, email, senha }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Erro ao cadastrar' }));
    throw new Error(err.message ?? 'Erro ao cadastrar');
  }
  return res.json();
}
