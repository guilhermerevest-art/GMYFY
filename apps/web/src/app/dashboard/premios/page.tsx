'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function PremiosPage() {
  const [premios, setPremios] = useState<any[]>([]);
  const [resgates, setResgates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nome: '', descricao: '', pontosNecessarios: 100, estoque: -1 });
  const [aba, setAba] = useState<'vitrine' | 'resgates'>('vitrine');

  useEffect(() => {
    const token = localStorage.getItem('gymfy_token');
    if (!token) return;
    const payload = JSON.parse(atob(token.split('.')[1]!));
    Promise.all([
      api.premios.getAll(payload.academiaId, token),
      api.premios.getResgates(token),
    ]).then(([p, r]) => { setPremios(p); setResgates(r); }).catch(console.error).finally(() => setLoading(false));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const token = localStorage.getItem('gymfy_token');
    if (!token) return;
    const novo = await api.premios.create(form, token);
    setPremios((prev) => [novo, ...prev]);
    setShowForm(false);
  }

  if (loading) return <div className="animate-pulse text-gray-400">Carregando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Prêmios</h2>
        {aba === 'vitrine' && (
          <button onClick={() => setShowForm(!showForm)}
            className="rounded-md bg-green-600 px-4 py-2 text-sm text-white font-medium hover:bg-green-700 transition">
            + Novo Prêmio
          </button>
        )}
      </div>

      <div className="flex gap-2 border-b">
        {(['vitrine', 'resgates'] as const).map((a) => (
          <button key={a} onClick={() => setAba(a)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition ${aba === a ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {a === 'vitrine' ? 'Vitrine' : `Resgates (${resgates.length})`}
          </button>
        ))}
      </div>

      {aba === 'vitrine' && (
        <>
          {showForm && (
            <form onSubmit={handleCreate} className="rounded-xl bg-white p-6 shadow-sm border space-y-4">
              <h3 className="font-semibold text-gray-800">Criar Prêmio</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nome</label>
                  <input required value={form.nome} onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Pontos necessários</label>
                  <input type="number" value={form.pontosNecessarios} onChange={(e) => setForm((p) => ({ ...p, pontosNecessarios: +e.target.value }))}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none" />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="rounded-md bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700">Criar</button>
                <button type="button" onClick={() => setShowForm(false)} className="rounded-md border px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
              </div>
            </form>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {premios.map((p) => (
              <div key={p.id} className="rounded-xl bg-white p-5 shadow-sm border">
                <h3 className="font-semibold text-gray-800">{p.nome}</h3>
                <p className="text-sm text-gray-500 mt-1">{p.descricao}</p>
                <p className="mt-3 text-lg font-bold text-green-700">{p.pontosNecessarios} pts</p>
                <p className="text-xs text-gray-400">{p.estoque === -1 ? 'Estoque ilimitado' : `${p.estoque} disponíveis`}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {aba === 'resgates' && (
        <div className="rounded-xl bg-white shadow-sm border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Aluno</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Prêmio</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {resgates.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{r.aluno?.nome}</td>
                  <td className="px-4 py-3 text-gray-600">{r.premio?.nome}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-yellow-100 text-yellow-800 px-2 py-0.5 text-xs font-medium">{r.status}</span>
                  </td>
                </tr>
              ))}
              {resgates.length === 0 && (
                <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-400">Nenhum resgate ainda</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
