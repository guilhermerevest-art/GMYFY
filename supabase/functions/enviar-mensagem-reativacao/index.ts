import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { academiaId, alunoId, alertaId, titulo, corpo } = await req.json();
    if (!academiaId || !alunoId || !titulo || !corpo) {
      return new Response(JSON.stringify({ message: 'Dados incompletos' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { error: msgError } = await supabase
      .from('gymfy_mensagens_reativacao')
      .insert({
        academia_id: academiaId,
        aluno_id: alunoId,
        alerta_id: alertaId || null,
        titulo,
        corpo,
        enviada: true,
      });

    if (msgError) {
      return new Response(JSON.stringify({ message: msgError.message }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    await supabase.from('gymfy_notificacoes').insert({
      usuario_id: alunoId,
      titulo,
      corpo,
    });

    if (alertaId) {
      await supabase
        .from('gymfy_alertas_churn')
        .update({ acao_tomada: true })
        .eq('id', alertaId);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ message: 'Erro interno' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
