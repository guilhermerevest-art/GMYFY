'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getRankingPublico, getAcademiaBySlug } from '@/lib/queries';

interface RankingItem {
  posicao: number;
  nome: string;
  pontos: number;
}

export default function TVPage() {
  const params = useParams();
  const slug = params.academiaSlug as string;
  const [academia, setAcademia] = useState<{ id: string; nome: string; logo_url: string | null } | null>(null);
  const [rankingSemanal, setRankingSemanal] = useState<RankingItem[]>([]);
  const [rankingMensal, setRankingMensal] = useState<RankingItem[]>([]);
  const [periodo, setPeriodo] = useState<'semanal' | 'mensal'>('semanal');

  async function loadData() {
    try {
      const ac = await getAcademiaBySlug(slug);
      if (!ac) return;
      setAcademia(ac);
      const [sem, men] = await Promise.all([
        getRankingPublico(ac.id, 'semanal'),
        getRankingPublico(ac.id, 'mensal'),
      ]);
      setRankingSemanal(sem);
      setRankingMensal(men);
    } catch {}
  }

  useEffect(() => { loadData(); }, [slug]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPeriodo((p) => (p === 'semanal' ? 'mensal' : 'semanal'));
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const refresh = setInterval(loadData, 60000);
    return () => clearInterval(refresh);
  }, [slug]);

  const ranking = periodo === 'semanal' ? rankingSemanal : rankingMensal;

  if (!academia) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <p className="text-gray-400 text-2xl">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8 flex flex-col">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          {academia.logo_url && (
            <img src={academia.logo_url} alt="" className="w-16 h-16 rounded-full object-cover" />
          )}
          <h1 className="text-3xl font-bold text-white">{academia.nome}</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
            periodo === 'semanal' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300'
          }`}>Semanal</span>
          <span className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
            periodo === 'mensal' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300'
          }`}>Mensal</span>
        </div>
      </header>

      <div className="flex-1">
        <h2 className="text-xl font-semibold text-gray-300 mb-6">
          Ranking {periodo === 'semanal' ? 'da Semana' : 'do Mes'}
        </h2>

        <div className="space-y-3">
          {ranking.map((item, idx) => (
            <div key={idx} className={`flex items-center rounded-xl px-6 py-4 transition-all ${
              idx < 3 ? 'bg-gray-800 border border-green-600/30' : 'bg-gray-800/50'
            }`}>
              <div className="w-16 text-center">
                <span className={`text-2xl font-bold ${
                  idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-gray-300' : idx === 2 ? 'text-amber-600' : 'text-gray-500'
                }`}>{item.posicao}</span>
              </div>
              <div className="flex-1 ml-4">
                <span className={`text-lg font-semibold ${idx < 3 ? 'text-white' : 'text-gray-300'}`}>
                  {item.nome}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold text-green-400">{item.pontos}</span>
                <span className="text-sm text-gray-500 ml-1">pts</span>
              </div>
            </div>
          ))}
          {ranking.length === 0 && (
            <p className="text-center text-gray-500 text-xl mt-20">Nenhum dado de ranking disponivel</p>
          )}
        </div>
      </div>

      <footer className="mt-8 text-center">
        <p className="text-gray-600 text-sm">Powered by Gymfy</p>
      </footer>
    </div>
  );
}
