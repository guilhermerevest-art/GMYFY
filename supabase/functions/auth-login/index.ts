import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { compare } from 'https://deno.land/x/bcrypt@v0.4.1/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, senha } = await req.json();
    if (!email || !senha) {
      return new Response(JSON.stringify({ message: 'Email e senha obrigatórios' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: usuario, error } = await supabase
      .from('gymfy_usuarios')
      .select('id, nome, email, senha_hash, academia_id, tipo')
      .eq('email', email)
      .single();

    if (error || !usuario || !usuario.senha_hash) {
      return new Response(JSON.stringify({ message: 'Credenciais inválidas' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const senhaValida = await compare(senha, usuario.senha_hash);
    if (!senhaValida) {
      return new Response(JSON.stringify({ message: 'Credenciais inválidas' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      userId: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      academiaId: usuario.academia_id,
    }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ message: 'Erro interno' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
