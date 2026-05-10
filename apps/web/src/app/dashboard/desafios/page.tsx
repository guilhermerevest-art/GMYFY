'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@/lib/use-session';
import { getDesafios, createDesafio } from '@/lib/queries';
import { formatDate } from '@/lib/utils';

export default function DesafiosPage() {
  const { session } = useSession();
  const [desafios, setDesafios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nome: '', descricao: '', metaCheckins: 12, pontosBonus: 50, inicioEm: '', fimEm: '' });

  useEffect(() => {
    if (!session?.academiaId) return;
    getDesafios(session.academiaId).then(setDesafios).catch(console.error).finally(() => setLoading(false));
  }, [session]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.academiaId) return;
    const novo = await createDesafio(session.academiaId, form);
    setDesafios((prev) => [{ ...novo, inicioEm: novo.inicio_em, fimEm: novo.fim_em, metaCheckins: novo.meta_checkins, _count: { participantes: 0 } }, ...prev]);
    setShowForm(false);
  }

  const statusColor: Record<string, string> = {
    RASCUNHO: 'bg-gray-100 text-gray-700',
    ATIVO: 'bg-green-100 text-green-700',
    FINALIZADO: 'bg-blue-100 text-blue-700',
    CANCELADO: 'bg-red-100 text-red-700',
  };

  if (loading) return <div className="animate-pulse text-gray-400">Carregando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Desafios</h2>
        <button onClick={() => setShowForm(!showForm)}
          className="rounded-md bg-green-600 px-4 py-2 text-sm text-white font-medium hover:bg-green-700 transition">
          + Novo Desafio
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="rounded-xl bg-white p-6 shadow-sm border space-y-4">
          <h3 className="font-semibold text-gray-800">Criar Desafio</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nome</label>
              <input required value={form.nome} onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Meta (check-ins)</label>
              <input type="number" value={form.metaCheckins} onChange={(e) => setForm((p) => ({ ...p, metaCheckins: +e.target.value }))}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Início</label>
              <input type="date" required value={form.inicioEm} onChange={(e) => setForm((p) => ({ ...p, inicioEm: e.target.value }))}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Fim</label>
              <input type="date" required value={form.fimEm} onChange={(e) => setForm((p) => ({ ...p, fimEm: e.target.value }))}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none" />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="rounded-md bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700">Criar</button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-md border px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
          </div>
        </form>
      )}

      <div className="grid gap-4">
        {desafios.map((d) => (
          <div key={d.id} className="rounded-xl bg-white p-5 shadow-sm border flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-800">{d.nome}</h3>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[d.status] ?? ''}`}>{d.status}</span>
              </div>
              <p className="text-sm text-gray-500">{formatDate(d.inicioEm)} → {formatDate(d.fimEm)} · Meta: {d.metaCheckins} check-ins</p>
            </div>
            <span className="text-sm text-gray-500">{d._count?.participantes ?? 0} participantes</span>
          </div>
        ))}
        {desafios.length === 0 && <p className="text-gray-400 text-sm">Nenhum desafio criado ainda</p>}
      </div>
    </div>
  );
}
