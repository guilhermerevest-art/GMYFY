import { createClient } from './supabase';

export async function getRelatorioMensal(academiaId: string) {
  const supabase = createClient();
  const inicio = new Date();
  inicio.setDate(1);
  inicio.setHours(0, 0, 0, 0);

  const { count: totalCheckins } = await supabase
    .from('gymfy_check_ins')
    .select('*', { count: 'exact', head: true })
    .eq('academia_id', academiaId)
    .gte('criado_em', inicio.toISOString());

  const { data: topRaw } = await supabase
    .from('gymfy_check_ins')
    .select('aluno_id, gymfy_usuarios!inner(nome)')
    .eq('academia_id', academiaId)
    .gte('criado_em', inicio.toISOString());

  const counts: Record<string, { nome: string; checkins: number }> = {};
  for (const row of topRaw ?? []) {
    const id = row.aluno_id;
    const nome = (row.gymfy_usuarios as any)?.nome ?? 'Aluno';
    counts[id] = { nome, checkins: (counts[id]?.checkins ?? 0) + 1 };
  }
  const topAlunos = Object.entries(counts)
    .sort((a, b) => b[1].checkins - a[1].checkins)
    .slice(0, 10)
    .map(([, v]) => ({ aluno: { nome: v.nome }, checkins: v.checkins }));

  const alunosAtivos = Object.keys(counts).length;
  const mediaCheckinsPorAluno = alunosAtivos > 0
    ? ((totalCheckins ?? 0) / alunosAtivos).toFixed(1)
    : 0;

  return { totalCheckins: totalCheckins ?? 0, alunosAtivos, mediaCheckinsPorAluno, topAlunos };
}

export async function getAlunos(academiaId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from('gymfy_aluno_academia')
    .select('criado_em, gymfy_usuarios!inner(id, nome, email, telefone)')
    .eq('academia_id', academiaId)
    .eq('ativo', true);
  return (data ?? []).map((r) => ({ aluno: r.gymfy_usuarios, criadoEm: r.criado_em }));
}

export async function createAluno(academiaId: string, data: { nome: string; telefone: string }) {
  const supabase = createClient();
  const { data: usuario, error: userErr } = await supabase
    .from('gymfy_usuarios')
    .insert({
      nome: data.nome,
      telefone: data.telefone,
      tipo: 'ALUNO',
      academia_id: academiaId,
      sistema_id: 'e416ae5e-fad9-43ac-a6a2-00fde07c744a',
      email: `${data.telefone.replace(/\D/g, '')}@aluno.gymfy.app`,
    })
    .select('id, nome, telefone, email')
    .single();
  if (userErr) throw new Error(userErr.message);

  const { error: linkErr } = await supabase
    .from('gymfy_aluno_academia')
    .insert({ aluno_id: usuario.id, academia_id: academiaId });
  if (linkErr) throw new Error(linkErr.message);

  return usuario;
}

export async function getAlertasChurn(academiaId: string, filtro?: string) {
  const supabase = createClient();
  let q = supabase
    .from('gymfy_alertas_churn')
    .select('id, risco, dias_sem_checkin, acao_tomada, aluno_id, gymfy_usuarios!inner(id, nome)')
    .eq('academia_id', academiaId)
    .order('dias_sem_checkin', { ascending: false });
  if (filtro) q = q.eq('risco', filtro);
  const { data } = await q;
  return (data ?? []).map((r) => ({
    id: r.id,
    risco: r.risco,
    diasSemCheckin: r.dias_sem_checkin,
    acaoTomada: r.acao_tomada,
    aluno: r.gymfy_usuarios,
  }));
}

export async function getDesafios(academiaId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from('gymfy_desafios')
    .select('*, gymfy_desafio_participantes(count)')
    .eq('academia_id', academiaId)
    .order('criado_em', { ascending: false });
  return (data ?? []).map((d) => ({
    ...d,
    inicioEm: d.inicio_em,
    fimEm: d.fim_em,
    metaCheckins: d.meta_checkins,
    pontosBonus: d.pontos_bonus,
    _count: { participantes: d.gymfy_desafio_participantes?.[0]?.count ?? 0 },
  }));
}

export async function createDesafio(academiaId: string, data: {
  nome: string; descricao?: string; metaCheckins: number;
  pontosBonus: number; inicioEm: string; fimEm: string;
}) {
  const supabase = createClient();
  const { data: novo, error } = await supabase
    .from('gymfy_desafios')
    .insert({
      academia_id: academiaId,
      nome: data.nome,
      descricao: data.descricao,
      meta_checkins: data.metaCheckins,
      pontos_bonus: data.pontosBonus,
      inicio_em: data.inicioEm,
      fim_em: data.fimEm,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return novo;
}

export async function getPremios(academiaId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from('gymfy_premios')
    .select('*')
    .eq('academia_id', academiaId)
    .eq('ativo', true)
    .order('criado_em', { ascending: false });
  return (data ?? []).map((p) => ({ ...p, pontosNecessarios: p.pontos_necessarios }));
}

export async function createPremio(academiaId: string, data: {
  nome: string; descricao?: string; pontosNecessarios: number; estoque: number;
}) {
  const supabase = createClient();
  const { data: novo, error } = await supabase
    .from('gymfy_premios')
    .insert({
      academia_id: academiaId,
      nome: data.nome,
      descricao: data.descricao,
      pontos_necessarios: data.pontosNecessarios,
      estoque: data.estoque,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return { ...novo, pontosNecessarios: novo.pontos_necessarios };
}

export async function getResgates(academiaId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from('gymfy_resgates')
    .select('id, status, gymfy_usuarios!inner(nome), gymfy_premios!inner(nome, academia_id)')
    .eq('gymfy_premios.academia_id', academiaId);
  return (data ?? []).map((r) => ({
    id: r.id,
    status: r.status,
    aluno: r.gymfy_usuarios,
    premio: r.gymfy_premios,
  }));
}

export async function getAcademia(academiaId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from('gymfy_academias')
    .select('*, gymfy_configuracoes_academia(*)')
    .eq('id', academiaId)
    .single();
  if (!data) return null;
  return {
    ...data,
    configuracoes: data.gymfy_configuracoes_academia
      ? {
          horarioPicoInicio: data.gymfy_configuracoes_academia.horario_pico_inicio,
          horarioPicoFim: data.gymfy_configuracoes_academia.horario_pico_fim,
          minimoCheckinsSemana: data.gymfy_configuracoes_academia.minimo_checkins_semana,
        }
      : null,
  };
}

export async function updateConfiguracoes(academiaId: string, data: {
  horarioPicoInicio: string; horarioPicoFim: string; minimoCheckinsSemana: number;
}) {
  const supabase = createClient();
  const { error } = await supabase
    .from('gymfy_configuracoes_academia')
    .upsert({
      academia_id: academiaId,
      horario_pico_inicio: data.horarioPicoInicio,
      horario_pico_fim: data.horarioPicoFim,
      minimo_checkins_semana: data.minimoCheckinsSemana,
    }, { onConflict: 'academia_id' });
  if (error) throw new Error(error.message);
}

export async function getFrequencia30d(academiaId: string) {
  const supabase = createClient();
  const desde = new Date();
  desde.setDate(desde.getDate() - 30);
  const { data } = await supabase
    .from('gymfy_check_ins')
    .select('criado_em')
    .eq('academia_id', academiaId)
    .gte('criado_em', desde.toISOString());

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    const d = row.criado_em.slice(0, 10);
    counts[d] = (counts[d] ?? 0) + 1;
  }
  return Object.entries(counts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([data, total]) => ({ data, total }));
}

export async function getDesafioTemplates() {
  const supabase = createClient();
  const { data } = await supabase
    .from('gymfy_desafio_templates')
    .select('*')
    .order('criado_em', { ascending: true });
  return (data ?? []).map((t) => ({
    ...t,
    metaCheckins: t.meta_checkins,
    pontosBonus: t.pontos_bonus,
    duracaoDias: t.duracao_dias,
  }));
}

export async function getAcademiaBySlug(slug: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from('gymfy_academias')
    .select('id, nome, logo_url')
    .eq('slug', slug)
    .single();
  return data;
}

export async function getRankingPublico(academiaId: string, periodo: 'semanal' | 'mensal') {
  const supabase = createClient();
  const inicio = new Date();
  if (periodo === 'mensal') {
    inicio.setDate(1);
  } else {
    const day = inicio.getDay();
    inicio.setDate(inicio.getDate() - day + 1);
  }
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
    .slice(0, 10)
    .map(([, v], idx) => ({ posicao: idx + 1, nome: v.nome, pontos: v.pontos }));
}

export async function enviarMensagemReativacao(
  academiaId: string, alunoId: string, alertaId: string | null, titulo: string, corpo: string,
) {
  const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL']!;
  const res = await fetch(`${supabaseUrl}/functions/v1/enviar-mensagem-reativacao`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ academiaId, alunoId, alertaId, titulo, corpo }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Erro ao enviar mensagem' }));
    throw new Error(err.message ?? 'Erro ao enviar mensagem');
  }
  return res.json();
}
