'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@/lib/use-session';
import { getRelatorioMensal, getFrequencia30d } from '@/lib/queries';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function RelatoriosPage() {
  const { session } = useSession();
  const [mensal, setMensal] = useState<any>(null);
  const [frequencia, setFrequencia] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.academiaId) return;
    Promise.all([
      getRelatorioMensal(session.academiaId),
      getFrequencia30d(session.academiaId),
    ]).then(([m, f]) => { setMensal(m); setFrequencia(f); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [session]);

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
          <p className="text-3xl font-bold text-green-700">{mensal?.alunosAtivos ?? 0}</p>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-sm border">
          <p className="text-sm text-gray-500">Média check-ins/aluno</p>
          <p className="text-3xl font-bold text-green-700">{mensal?.mediaCheckinsPorAluno ?? 0}</p>
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
