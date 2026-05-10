'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Relatorio {
  totalCheckins: number;
  alunosAtivos: number;
  mediaCheckinsPorAluno: string | number;
  topAlunos: Array<{ aluno: { nome: string } | null; checkins: number }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<Relatorio | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('gymfy_token');
    if (!token) { window.location.href = '/login'; return; }
    api.relatorios.getMensal(token).then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="animate-pulse text-gray-400">Carregando...</div>;

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-xl bg-white p-6 shadow-sm border">
          <p className="text-sm text-gray-500">Check-ins este mês</p>
          <p className="text-3xl font-bold text-green-700">{data?.totalCheckins ?? 0}</p>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-sm border">
          <p className="text-sm text-gray-500">Alunos ativos</p>
          <p className="text-3xl font-bold text-green-700">{data?.alunosAtivos ?? 0}</p>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-sm border">
          <p className="text-sm text-gray-500">Média check-ins/aluno</p>
          <p className="text-3xl font-bold text-green-700">{data?.mediaCheckinsPorAluno ?? 0}</p>
        </div>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Alunos do Mês</h3>
        <div className="space-y-3">
          {data?.topAlunos?.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-gray-400 w-6">{idx + 1}</span>
                <span className="font-medium text-gray-700">{item.aluno?.nome ?? 'Aluno'}</span>
              </div>
              <span className="text-sm font-semibold text-green-600">{item.checkins} check-ins</span>
            </div>
          ))}
          {(!data?.topAlunos || data.topAlunos.length === 0) && (
            <p className="text-gray-400 text-sm">Nenhum check-in registrado este mês</p>
          )}
        </div>
      </div>
    </div>
  );
}
