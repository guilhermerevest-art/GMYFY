'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@/lib/use-session';
import { getAlertasChurn } from '@/lib/queries';
import { cn } from '@/lib/utils';

const riscoLabels: Record<string, { label: string; color: string }> = {
  RISCO_BAIXO: { label: 'Baixo', color: 'bg-yellow-100 text-yellow-800' },
  RISCO_MEDIO: { label: 'Médio', color: 'bg-orange-100 text-orange-800' },
  RISCO_ALTO: { label: 'Alto', color: 'bg-red-100 text-red-800' },
};

export default function AlertasPage() {
  const { session } = useSession();
  const [alertas, setAlertas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('');

  useEffect(() => {
    if (!session?.academiaId) return;
    setLoading(true);
    getAlertasChurn(session.academiaId, filtro || undefined)
      .then(setAlertas)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [session, filtro]);

  if (loading) return <div className="animate-pulse text-gray-400">Carregando...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Alertas de Churn</h2>

      <div className="flex gap-2">
        {['', 'RISCO_MEDIO', 'RISCO_ALTO'].map((r) => (
          <button key={r} onClick={() => setFiltro(r)}
            className={cn('rounded-full px-4 py-1.5 text-sm font-medium transition',
              filtro === r ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
            {r === '' ? 'Todos' : riscoLabels[r]?.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl bg-white shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Aluno</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Dias sem treinar</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Risco</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {alertas.map((alerta) => (
              <tr key={alerta.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{(alerta.aluno as any)?.nome}</td>
                <td className="px-4 py-3 text-gray-600">{alerta.diasSemCheckin} dias</td>
                <td className="px-4 py-3">
                  <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', riscoLabels[alerta.risco]?.color)}>
                    {riscoLabels[alerta.risco]?.label}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button className="text-green-600 hover:underline text-sm font-medium">Enviar mensagem</button>
                </td>
              </tr>
            ))}
            {alertas.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">Nenhum aluno em risco</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
