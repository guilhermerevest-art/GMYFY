import { supabase } from './supabase';

const SUPABASE_URL = process.env['EXPO_PUBLIC_SUPABASE_URL'] ?? 'https://baqxljihngymjnasrdtl.supabase.co';

export const api = {
  checkins: {
    validar: async (qrToken: string, userId: string, academiaId: string) => {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/checkin-validar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrToken, userId, academiaId }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Erro no check-in' }));
        throw new Error(err.message ?? 'Erro no check-in');
      }
      return res.json();
    },
    historico: async (userId: string) => {
      const { data } = await supabase
        .from('gymfy_check_ins')
        .select('id, pontos_ganhos, criado_em')
        .eq('aluno_id', userId)
        .order('criado_em', { ascending: false })
        .limit(30);
      return data ?? [];
    },
  },

  ranking: {
    get: async (academiaId: string) => {
      const inicio = new Date();
      inicio.setDate(1);
      inicio.setHours(0, 0, 0, 0);

      const { data } = await supabase
        .from('gymfy_pontos')
        .select('aluno_id, quantidade, gymfy_usuarios!inner(nome)')
        .eq('academia_id', academiaId)
        .gte('criado_em', inicio.toISOString());

      const totais: Record<string, { nome: string; pontos: number }> = {};
      for (const row of data ?? []) {
        const id = row.aluno_id;
        const nome = (row.gymfy_usuarios as any)?.nome ?? 'Aluno';
        totais[id] = { nome, pontos: (totais[id]?.pontos ?? 0) + row.quantidade };
      }

      return Object.entries(totais)
        .sort((a, b) => b[1].pontos - a[1].pontos)
        .map(([alunoId, v], idx) => ({ alunoId, posicao: idx + 1, pontos: v.pontos, aluno: { nome: v.nome } }));
    },

    minha: async (academiaId: string, userId: string) => {
      const ranking = await api.ranking.get(academiaId);
      const entry = ranking.find((r) => r.alunoId === userId);
      return entry ?? { posicao: null, pontos: 0 };
    },
  },

  alunos: {
    perfil: async (userId: string) => {
      const [{ data: usuario }, { count: totalCheckins }, { data: pontosData }, { data: conquistas }] =
        await Promise.all([
          supabase.from('gymfy_usuarios').select('id, nome, email').eq('id', userId).single(),
          supabase.from('gymfy_check_ins').select('*', { count: 'exact', head: true }).eq('aluno_id', userId),
          supabase.from('gymfy_pontos').select('quantidade').eq('aluno_id', userId),
          supabase.from('gymfy_conquistas_aluno').select('id, gymfy_conquistas(nome, descricao, icone)').eq('aluno_id', userId),
        ]);

      const totalPontos = (pontosData ?? []).reduce((acc, p) => acc + p.quantidade, 0);
      return {
        ...usuario,
        totalCheckins: totalCheckins ?? 0,
        totalPontos,
        conquistas: (conquistas ?? []).map((c) => ({ id: c.id, conquista: c.gymfy_conquistas })),
      };
    },
  },

  desafios: {
    ativos: async (academiaId: string) => {
      const { data } = await supabase
        .from('gymfy_desafios')
        .select('*, gymfy_desafio_participantes(count)')
        .eq('academia_id', academiaId)
        .eq('status', 'ATIVO')
        .order('criado_em', { ascending: false });
      return (data ?? []).map((d) => ({
        ...d,
        metaCheckins: d.meta_checkins,
        _count: { participantes: d.gymfy_desafio_participantes?.[0]?.count ?? 0 },
      }));
    },

    participar: async (desafioId: string, userId: string) => {
      const { error } = await supabase
        .from('gymfy_desafio_participantes')
        .insert({ desafio_id: desafioId, aluno_id: userId });
      if (error) throw new Error(error.message);
    },
  },

  premios: {
    vitrine: async (academiaId: string) => {
      const { data } = await supabase
        .from('gymfy_premios')
        .select('*')
        .eq('academia_id', academiaId)
        .eq('ativo', true)
        .order('criado_em', { ascending: false });
      return (data ?? []).map((p) => ({ ...p, pontosNecessarios: p.pontos_necessarios }));
    },

    resgatar: async (premioId: string, userId: string) => {
      const { error } = await supabase
        .from('gymfy_resgates')
        .insert({ premio_id: premioId, aluno_id: userId });
      if (error) throw new Error(error.message);
    },
  },

  feed: {
    get: async (academiaId: string) => {
      const { data } = await supabase
        .from('gymfy_feed_posts')
        .select('id, conteudo, criado_em, gymfy_usuarios!inner(nome), gymfy_feed_reacoes(count)')
        .eq('academia_id', academiaId)
        .order('criado_em', { ascending: false })
        .limit(30);
      return (data ?? []).map((p) => ({
        id: p.id,
        conteudo: p.conteudo,
        criadoEm: p.criado_em,
        autor: p.gymfy_usuarios,
        _count: { reacoes: p.gymfy_feed_reacoes?.[0]?.count ?? 0 },
      }));
    },
  },

  pontuacao: {
    resumo: async (userId: string, academiaId: string) => {
      const [{ data: pontosData }, { data: streakData }] = await Promise.all([
        supabase.from('gymfy_pontos').select('quantidade').eq('aluno_id', userId).eq('academia_id', academiaId),
        supabase.from('gymfy_streaks').select('streak_atual, maior_streak').eq('aluno_id', userId).eq('academia_id', academiaId).single(),
      ]);
      const totalPontos = (pontosData ?? []).reduce((acc, p) => acc + p.quantidade, 0);
      return {
        totalPontos,
        streakAtual: streakData?.streak_atual ?? 0,
        maiorStreak: streakData?.maior_streak ?? 0,
      };
    },

    historico: async (userId: string) => {
      const { data } = await supabase
        .from('gymfy_pontos')
        .select('id, quantidade, descricao, criado_em')
        .eq('aluno_id', userId)
        .order('criado_em', { ascending: false })
        .limit(50);
      return data ?? [];
    },
  },

  notificacoes: {
    get: async (userId: string) => {
      const { data } = await supabase
        .from('gymfy_notificacoes')
        .select('*')
        .eq('usuario_id', userId)
        .order('criado_em', { ascending: false })
        .limit(20);
      return data ?? [];
    },

    marcarLida: async (id: string) => {
      await supabase.from('gymfy_notificacoes').update({ lida: true }).eq('id', id);
    },
  },
};
