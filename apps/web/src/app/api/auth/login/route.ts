import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { createServerClient } from '@/lib/supabase-server';
import { createSession, setSessionCookie } from '@/lib/auth';

export async function POST(req: Request) {
  const { email, senha } = await req.json();
  if (!email || !senha) {
    return NextResponse.json({ message: 'Email e senha obrigatórios' }, { status: 400 });
  }

  const supabase = createServerClient();
  const { data: usuario } = await supabase
    .from('gymfy_usuarios')
    .select('id, senha_hash, academia_id, tipo')
    .eq('email', email)
    .single();

  if (!usuario || !usuario.senha_hash) {
    return NextResponse.json({ message: 'Credenciais inválidas' }, { status: 401 });
  }

  const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
  if (!senhaValida) {
    return NextResponse.json({ message: 'Credenciais inválidas' }, { status: 401 });
  }

  const token = await createSession({
    sub: usuario.id,
    academiaId: usuario.academia_id ?? '',
    tipo: usuario.tipo,
  });

  setSessionCookie(token);
  return NextResponse.json({ academiaId: usuario.academia_id, tipo: usuario.tipo });
}
