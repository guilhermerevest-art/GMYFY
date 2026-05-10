'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@/lib/use-session';
import { getAcademia, updateConfiguracoes } from '@/lib/queries';

export default function ConfiguracoesPage() {
  const { session } = useSession();
  const [academia, setAcademia] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="animate-pulse text-gray-400">Carregando...</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-2xl font-bold text-gray-800">Configurações</h2>

      <div className="rounded-xl bg-white p-6 shadow-sm border space-y-4">
        <h3 className="font-semibold text-gray-800">Dados da Academia</h3>
        <div>
          <p className="text-sm text-gray-500">Nome</p>
          <p className="font-medium text-gray-800">{academia?.nome}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">E-mail</p>
          <p className="font-medium text-gray-800">{academia?.email}</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="rounded-xl bg-white p-6 shadow-sm border space-y-4">
        <h3 className="font-semibold text-gray-800">Sistema de Pontuação</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Horário de pico — início</label>
            <input type="time" value={form.horarioPicoInicio} onChange={(e) => setForm((p) => ({ ...p, horarioPicoInicio: e.target.value }))}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Horário de pico — fim</label>
            <input type="time" value={form.horarioPicoFim} onChange={(e) => setForm((p) => ({ ...p, horarioPicoFim: e.target.value }))}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Mínimo de check-ins para semana perfeita</label>
          <input type="number" min={1} max={7} value={form.minimoCheckinsSemana}
            onChange={(e) => setForm((p) => ({ ...p, minimoCheckinsSemana: +e.target.value }))}
            className="mt-1 w-32 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none" />
        </div>

        <button type="submit" disabled={saving}
          className="rounded-md bg-green-600 px-4 py-2 text-sm text-white font-medium hover:bg-green-700 disabled:opacity-50 transition">
          {saving ? 'Salvando...' : 'Salvar configurações'}
        </button>
      </form>
    </div>
  );
}
