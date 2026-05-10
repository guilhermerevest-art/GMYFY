import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { hash } from 'https://deno.land/x/bcrypt@v0.4.1/mod.ts';

const SISTEMA_ID = 'e416ae5e-fad9-43ac-a6a2-00fde07c744a';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { nome, email, senha } = await req.json();
    if (!nome || !email || !senha) {
      return new Response(JSON.stringify({ message: 'Campos obrigatórios: nome, email, senha' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: existing } = await supabase
      .from('gymfy_usuarios')
      .select('id')
      .eq('email', email)
      .single();

    if (existing) {
      return new Response(JSON.stringify({ message: 'Email já cadastrado' }), {
        status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const senhaHash = await hash(senha);

    const { data: alunoAcademia } = await supabase
      .from('gymfy_aluno_academia')
      .select('academia_id')
      .limit(1)
      .single();

    const academiaId = alunoAcademia?.academia_id ?? null;

    const { data: usuario, error } = await supabase
      .from('gymfy_usuarios')
      .insert({
        sistema_id: SISTEMA_ID,
        academia_id: academiaId,
        nome,
        email,
        senha_hash: senhaHash,
        tipo: 'ALUNO',
      })
      .select('id, nome, email, academia_id')
      .single();

    if (error) {
      return new Response(JSON.stringify({ message: error.message }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      userId: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      academiaId: usuario.academia_id,
    }), {
      status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ message: 'Erro interno' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
