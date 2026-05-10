'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@/lib/use-session';
import { getAcademia, updateConfiguracoes } from '@/lib/queries';
import { useTheme } from '@/lib/theme-provider';
import { themes } from '@/lib/themes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function ConfiguracoesPage() {
  const { session } = useSession();
  const { theme, setTheme } = useTheme();
  const [academia, setAcademia] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ horarioPicoInicio: '', horarioPicoFim: '', minimoCheckinsSemana: 3 });

  useEffect(() => {
    if (!session?.academiaId) return;
    getAcademia(session.academiaId).then((a) => {
      setAcademia(a);
      if (a?.configuracoes) {
        setForm({
          horarioPicoInicio: a.configuracoes.horarioPicoInicio ?? '',
          horarioPicoFim: a.configuracoes.horarioPicoFim ?? '',
          minimoCheckinsSemana: a.configuracoes.minimoCheckinsSemana ?? 3,
        });
      }
    }).catch(console.error).finally(() => setLoading(false));
  }, [session]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.academiaId) return;
    setSaving(true);
    try {
      await updateConfiguracoes(session.academiaId, form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="animate-pulse text-muted-foreground">Carregando...</div>;

  return (
    <div className="space-y-8 max-w-3xl">
      <h2 className="text-2xl font-bold text-foreground">Configurações</h2>

      {/* Dados da Academia */}
      <Card>
        <CardHeader>
          <CardTitle>Dados da Academia</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Nome</p>
            <p className="font-medium text-foreground">{academia?.nome}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">E-mail</p>
            <p className="font-medium text-foreground">{academia?.email}</p>
          </div>
        </CardContent>
      </Card>

      {/* Seletor de Tema */}
      <Card>
        <CardHeader>
          <CardTitle>Tema do Portal</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-5">
            Escolha as cores que representam a identidade da sua academia. A mudança é aplicada em tempo real.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={cn(
                  'group relative flex flex-col items-center gap-2 rounded-xl border-2 p-3 transition-all hover:shadow-md',
                  theme === t.id
                    ? 'border-primary shadow-md'
                    : 'border-border hover:border-primary/40'
                )}
              >
                {/* Swatch */}
                <div className="flex gap-1.5">
                  <span
                    className="w-6 h-6 rounded-full shadow-sm ring-1 ring-black/10"
                    style={{ backgroundColor: t.primary }}
                  />
                  <span
                    className="w-6 h-6 rounded-full shadow-sm ring-1 ring-black/10"
                    style={{ backgroundColor: t.accent }}
                  />
                </div>
                <span className="text-xs font-medium text-foreground text-center leading-tight">{t.label}</span>
                <span className="text-[10px] text-muted-foreground">{t.description}</span>
                {theme === t.id && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Preview dos componentes */}
          <div className="mt-6 rounded-xl border border-border bg-secondary/30 p-4 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Preview</p>
            <div className="flex flex-wrap gap-2">
              <button className="btn-primary px-4 py-2 text-sm rounded-lg">Botão primário</button>
              <button className="btn-outline px-4 py-2 text-sm rounded-lg">Outline</button>
              <button className="btn-ghost px-4 py-2 text-sm rounded-lg">Ghost</button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="default">Padrão</Badge>
              <Badge variant="success">Sucesso</Badge>
              <Badge variant="warning">Atenção</Badge>
              <Badge variant="danger">Risco</Badge>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {['Check-ins', 'Alunos', 'Média'].map((label, i) => (
                <div key={label} className="rounded-lg border border-border bg-card p-3">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-xl font-bold text-primary">{[128, 47, '2.7'][i]}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sistema de Pontuação */}
      <Card>
        <CardHeader>
          <CardTitle>Sistema de Pontuação</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Horário de pico — início"
                type="time"
                value={form.horarioPicoInicio}
                onChange={(e) => setForm((p) => ({ ...p, horarioPicoInicio: e.target.value }))}
              />
              <Input
                label="Horário de pico — fim"
                type="time"
                value={form.horarioPicoFim}
                onChange={(e) => setForm((p) => ({ ...p, horarioPicoFim: e.target.value }))}
              />
            </div>
            <Input
              label="Mínimo de check-ins para semana perfeita"
              type="number"
              min={1}
              max={7}
              value={form.minimoCheckinsSemana}
              onChange={(e) => setForm((p) => ({ ...p, minimoCheckinsSemana: +e.target.value }))}
              className="w-32"
            />
            <div className="flex items-center gap-3">
              <Button type="submit" disabled={saving} size="md">
                {saving ? 'Salvando...' : 'Salvar configurações'}
              </Button>
              {saved && <span className="text-sm text-emerald-600 font-medium">Salvo!</span>}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
