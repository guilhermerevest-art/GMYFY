import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { createServerClient } from '@/lib/supabase-server';
import { createSession, setSessionCookie } from '@/lib/auth';

const SISTEMA_ID = 'e416ae5e-fad9-43ac-a6a2-00fde07c744a';

export async function POST(req: Request) {
  const { nome, email, senha } = await req.json();
  if (!nome || !email || !senha) {
    return NextResponse.json({ message: 'Campos obrigatórios: nome, email, senha' }, { status: 400 });
  }

  const supabase = createServerClient();

  const { data: existing } = await supabase
    .from('gymfy_usuarios')
    .select('id')
    .eq('email', email)
    .single();

  if (existing) {
    return NextResponse.json({ message: 'Email já cadastrado' }, { status: 409 });
  }

  const senhaHash = await bcrypt.hash(senha, 10);
  const slug = email.split('@')[0]!.toLowerCase().replace(/[^a-z0-9]/g, '-');

  const { data: academia, error: errAcademia } = await supabase
    .from('gymfy_academias')
    .insert({ sistema_id: SISTEMA_ID, nome, slug, email })
    .select('id')
    .single();

  if (errAcademia) {
    return NextResponse.json({ message: errAcademia.message }, { status: 500 });
  }

  const { data: usuario, error: errUsuario } = await supabase
    .from('gymfy_usuarios')
    .insert({
      sistema_id: SISTEMA_ID,
      academia_id: academia.id,
      nome,
      email,
      senha_hash: senhaHash,
      tipo: 'ACADEMIA',
    })
    .select('id, tipo')
    .single();

  if (errUsuario) {
    return NextResponse.json({ message: errUsuario.message }, { status: 500 });
  }

  const token = await createSession({
    sub: usuario.id,
    academiaId: academia.id,
    tipo: usuario.tipo,
  });

  setSessionCookie(token);
  return NextResponse.json({ academiaId: academia.id });
}
