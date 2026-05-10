'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function RelatoriosPage() {
  const [mensal, setMensal] = useState<any>(null);
  const [frequencia, setFrequencia] = useState<any[]>([]);
  const [roi, setRoi] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('gymfy_token');
    if (!token) return;
    Promise.all([
      api.relatorios.getMensal(token),
      api.relatorios.getFrequencia(token, 30),
      api.relatorios.getRoi(token),
    ]).then(([m, f, r]) => { setMensal(m); setFrequencia(f); setRoi(r); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="animate-pulse text-gray-400">Carregando...</div>;

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-800">Relatórios</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-xl bg-white p-6 shadow-sm border">
          <p className="text-sm text-gray-500">Check-ins este mês</p>
          <p className="text-3xl font-bold text-green-700">{mensal?.totalCheckins ?? 0}</p>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-sm border">
          <p className="text-sm text-gray-500">Alunos ativos</p>
          <p className="text-3xl font-bold text-green-700">{roi?.alunosAtivos30d ?? 0}</p>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-sm border">
          <p className="text-sm text-gray-500">Estimativa de retenção</p>
          <p className="text-3xl font-bold text-green-700">{roi?.estimativaRetencao ?? '0%'}</p>
        </div>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Frequência — últimos 30 dias</h3>
        {frequencia.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={frequencia}>
              <XAxis dataKey="data" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" fill="#16a34a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-400 text-sm">Nenhum dado disponível</p>
        )}
      </div>
    </div>
  );
}
