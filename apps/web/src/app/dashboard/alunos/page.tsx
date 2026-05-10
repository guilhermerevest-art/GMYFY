'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';

export default function AlunosPage() {
  const [alunos, setAlunos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('gymfy_token');
    if (!token) return;
    const payload = JSON.parse(atob(token.split('.')[1]!));
    api.academias.getAlunos(payload.academiaId, token)
      .then(setAlunos)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtrados = alunos.filter((a) =>
    a.aluno?.nome?.toLowerCase().includes(busca.toLowerCase()) ||
    a.aluno?.email?.toLowerCase().includes(busca.toLowerCase())
  );

  if (loading) return <div className="animate-pulse text-gray-400">Carregando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Alunos</h2>
        <span className="text-sm text-gray-500">{alunos.length} alunos ativos</span>
      </div>

      <input
        type="text"
        placeholder="Buscar por nome ou e-mail..."
        value={busca}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBusca(e.target.value)}
        className="w-full max-w-md rounded-md border border-gray-300 px-4 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
      />

      <div className="rounded-xl bg-white shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Nome</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">E-mail</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Desde</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtrados.map((item) => (
              <tr key={item.aluno?.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{item.aluno?.nome}</td>
                <td className="px-4 py-3 text-gray-600">{item.aluno?.email}</td>
                <td className="px-4 py-3 text-gray-500">{formatDate(item.criadoEm)}</td>
              </tr>
            ))}
            {filtrados.length === 0 && (
              <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-400">Nenhum aluno encontrado</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
