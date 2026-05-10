'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@/lib/use-session';
import { getRelatorioMensal } from '@/lib/queries';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Grid, StatCard } from '@/components/ui/grid';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Users, TrendingUp } from 'lucide-react';

interface Relatorio {
  totalCheckins: number;
  alunosAtivos: number;
  mediaCheckinsPorAluno: string | number;
  topAlunos: Array<{ aluno: { nome: string } | null; checkins: number }>;
}

export default function DashboardPage() {
  const { session, loading: sessionLoading } = useSession();
  const [data, setData] = useState<Relatorio | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.academiaId) return;
    getRelatorioMensal(session.academiaId)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [session]);

  if (sessionLoading || loading) {
    return (
      <div className="space-y-8">
        <div className="h-8 w-48 rounded-lg bg-muted animate-pulse" />
        <Grid cols={3}>
          {[1, 2, 3].map((i) => <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />)}
        </Grid>
      </div>
    );
  }

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>

      <Grid cols={3}>
        <StatCard
          label="Check-ins este mês"
          value={data?.totalCheckins ?? 0}
          icon={<BarChart3 className="w-5 h-5" />}
          trend="Mês atual"
        />
        <StatCard
          label="Alunos ativos"
          value={data?.alunosAtivos ?? 0}
          icon={<Users className="w-5 h-5" />}
          trend="Com check-in no mês"
        />
        <StatCard
          label="Média check-ins/aluno"
          value={data?.mediaCheckinsPorAluno ?? 0}
          icon={<TrendingUp className="w-5 h-5" />}
          trend="Este mês"
        />
      </Grid>

      <Card>
        <CardHeader>
          <CardTitle>Top Alunos do Mês</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data?.topAlunos?.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-lg w-7 text-center">{medals[idx] ?? <span className="text-sm font-bold text-muted-foreground">{idx + 1}</span>}</span>
                  <span className="font-medium text-foreground">{item.aluno?.nome ?? 'Aluno'}</span>
                </div>
                <Badge variant="default">{item.checkins} check-ins</Badge>
              </div>
            ))}
            {(!data?.topAlunos || data.topAlunos.length === 0) && (
              <p className="text-muted-foreground text-sm py-4 text-center">Nenhum check-in registrado este mês</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
