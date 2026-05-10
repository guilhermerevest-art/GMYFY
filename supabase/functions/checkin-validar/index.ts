import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { verify } from 'https://deno.land/x/djwt@v3.0.1/mod.ts';

const PONTOS_BASE = 10;
const PONTOS_BONUS_PRIMEIRO_SEMANA = 5;
const PONTOS_BONUS_SEMANA_PERFEITA = 15;
const PONTOS_BONUS_FORA_PICO = 3;
const PONTOS_BONUS_STREAK = 10;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function getISOWeek(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  const weekNum = 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

function getPrevISOWeek(weekStr: string): string {
  const [year, wStr] = weekStr.split('-W');
  const week = parseInt(wStr);
  if (week === 1) return `${parseInt(year) - 1}-W52`;
  return `${year}-W${String(week - 1).padStart(2, '0')}`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { qrToken, userId, academiaId } = await req.json();
    if (!qrToken || !userId || !academiaId) {
      return new Response(JSON.stringify({ message: 'Dados incompletos' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const qrSecret = Deno.env.get('JWT_QR_SECRET');
    if (!qrSecret) {
      return new Response(JSON.stringify({ message: 'Configuracao invalida' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let payload: any;
    try {
      const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(qrSecret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign', 'verify'],
      );
      payload = await verify(qrToken, key);
    } catch {
      return new Response(JSON.stringify({ message: 'QR Code invalido ou expirado' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (payload.academiaId !== academiaId) {
      return new Response(JSON.stringify({ message: 'QR Code nao pertence a esta academia' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const { count } = await supabase
      .from('gymfy_check_ins')
      .select('*', { count: 'exact', head: true })
      .eq('aluno_id', userId)
      .eq('academia_id', academiaId)
      .gte('criado_em', hoje.toISOString());

    if ((count ?? 0) > 0) {
      return new Response(JSON.stringify({ message: 'Voce ja fez check-in hoje nesta academia' }), {
        status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let pontosGanhos = PONTOS_BASE;
    const descricoes: string[] = ['Check-in: +10 pts'];

    const seg = new Date(hoje);
    seg.setDate(seg.getDate() - seg.getDay() + 1);
    const { count: checkinsSemana } = await supabase
      .from('gymfy_check_ins')
      .select('*', { count: 'exact', head: true })
      .eq('aluno_id', userId)
      .eq('academia_id', academiaId)
      .gte('criado_em', seg.toISOString());

    if ((checkinsSemana ?? 0) === 0) {
      pontosGanhos += PONTOS_BONUS_PRIMEIRO_SEMANA;
      descricoes.push('Primeiro da semana: +5 pts');
    }

    const { data: config } = await supabase
      .from('gymfy_configuracoes_academia')
      .select('horario_pico_inicio, horario_pico_fim, minimo_checkins_semana')
      .eq('academia_id', academiaId)
      .single();

    if (config?.horario_pico_inicio && config?.horario_pico_fim) {
      const agora = new Date();
      const horaAtual = `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`;
      if (horaAtual < config.horario_pico_inicio || horaAtual > config.horario_pico_fim) {
        pontosGanhos += PONTOS_BONUS_FORA_PICO;
        descricoes.push('Fora do pico: +3 pts');
      }
    }

    const minCheckins = config?.minimo_checkins_semana ?? 3;
    if ((checkinsSemana ?? 0) + 1 >= minCheckins) {
      pontosGanhos += PONTOS_BONUS_SEMANA_PERFEITA;
      descricoes.push('Semana perfeita: +15 pts');
    }

    // Atualizar streak
    const semanaAtual = getISOWeek(new Date());
    const { data: streakData } = await supabase
      .from('gymfy_streaks')
      .select('*')
      .eq('aluno_id', userId)
      .eq('academia_id', academiaId)
      .single();

    let novoStreak = 1;
    let maiorStreak = 1;

    if (streakData) {
      const semanaAnterior = getPrevISOWeek(semanaAtual);
      if (streakData.ultima_semana_ativa === semanaAnterior) {
        novoStreak = streakData.streak_atual + 1;
      } else if (streakData.ultima_semana_ativa === semanaAtual) {
        novoStreak = streakData.streak_atual;
      }
      maiorStreak = Math.max(novoStreak, streakData.maior_streak);

      if (novoStreak > 0 && novoStreak % 4 === 0) {
        pontosGanhos += PONTOS_BONUS_STREAK;
        descricoes.push(`Streak ${novoStreak} semanas: +10 pts`);
      }

      await supabase.from('gymfy_streaks').update({
        streak_atual: novoStreak,
        maior_streak: maiorStreak,
        ultima_semana_ativa: semanaAtual,
        atualizado_em: new Date().toISOString(),
      }).eq('id', streakData.id);
    } else {
      await supabase.from('gymfy_streaks').insert({
        aluno_id: userId,
        academia_id: academiaId,
        streak_atual: 1,
        maior_streak: 1,
        ultima_semana_ativa: semanaAtual,
      });
    }

    await supabase.from('gymfy_check_ins').insert({
      aluno_id: userId,
      academia_id: academiaId,
      pontos_ganhos: pontosGanhos,
    });

    await supabase.from('gymfy_pontos').insert({
      aluno_id: userId,
      academia_id: academiaId,
      quantidade: pontosGanhos,
      descricao: descricoes.join(', '),
    });

    return new Response(JSON.stringify({ pontosGanhos, descricoes, streakAtual: novoStreak }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ message: 'Erro interno' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
