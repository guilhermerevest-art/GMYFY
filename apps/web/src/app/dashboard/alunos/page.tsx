'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@/lib/use-session';
import { getAlunos, createAluno } from '@/lib/queries';
import { formatDate } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { UserPlus, X, Search } from 'lucide-react';

interface NovoAluno {
  nome: string;
  telefone: string;
}

export default function AlunosPage() {
  const { session } = useSession();
  const [alunos, setAlunos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [form, setForm] = useState<NovoAluno>({ nome: '', telefone: '' });
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  function carregarAlunos() {
    if (!session?.academiaId) return;
    getAlunos(session.academiaId)
      .then(setAlunos)
      .catch(console.error)
      .finally(() => setLoading(false));
  }

  useEffect(() => { carregarAlunos(); }, [session]);

  const filtrados = alunos.filter((a) =>
    (a.aluno as any)?.nome?.toLowerCase().includes(busca.toLowerCase()) ||
    (a.aluno as any)?.telefone?.includes(busca)
  );

  async function handleCriar(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.academiaId) return;
    setErro('');
    setSalvando(true);
    try {
      await createAluno(session.academiaId, form);
      setModalAberto(false);
      setForm({ nome: '', telefone: '' });
      setLoading(true);
      carregarAlunos();
    } catch (err: any) {
      setErro(err.message ?? 'Erro ao criar aluno');
    } finally {
      setSalvando(false);
    }
  }

  if (loading) return <div className="animate-pulse text-muted-foreground">Carregando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Alunos</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{alunos.length} alunos ativos</p>
        </div>
        <Button onClick={() => setModalAberto(true)} size="md">
          <UserPlus className="w-4 h-4 mr-2" />
          Novo aluno
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar por nome ou telefone..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="input pl-9"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-secondary border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nome</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Telefone</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Desde</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtrados.map((item) => (
                <tr key={(item.aluno as any)?.id} className="hover:bg-secondary/50 transition">
                  <td className="px-4 py-3 font-medium text-foreground">{(item.aluno as any)?.nome}</td>
                  <td className="px-4 py-3 text-muted-foreground">{(item.aluno as any)?.telefone ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(item.criadoEm)}</td>
                  <td className="px-4 py-3"><Badge variant="success">Ativo</Badge></td>
                </tr>
              ))}
              {filtrados.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">
                    {busca ? 'Nenhum aluno encontrado para essa busca' : 'Nenhum aluno cadastrado ainda'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Modal novo aluno */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-card border border-border shadow-xl p-6 mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">Novo aluno</h3>
              <button onClick={() => { setModalAberto(false); setErro(''); }} className="text-muted-foreground hover:text-foreground transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCriar} className="space-y-4">
              {erro && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">{erro}</div>
              )}

              <Input
                label="Nome completo"
                type="text"
                required
                autoFocus
                placeholder="João Silva"
                value={form.nome}
                onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))}
              />

              <Input
                label="Telefone"
                type="tel"
                required
                placeholder="(34) 99999-9999"
                value={form.telefone}
                onChange={(e) => setForm((p) => ({ ...p, telefone: e.target.value }))}
              />

              <p className="text-xs text-muted-foreground">
                O aluno poderá acessar o app usando o número de telefone como identificador.
              </p>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" size="md" className="flex-1"
                  onClick={() => { setModalAberto(false); setErro(''); }}>
                  Cancelar
                </Button>
                <Button type="submit" size="md" className="flex-1" disabled={salvando}>
                  {salvando ? 'Salvando...' : 'Criar aluno'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
