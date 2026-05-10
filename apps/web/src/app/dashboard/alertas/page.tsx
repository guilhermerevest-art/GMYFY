'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@/lib/use-session';
import { getAlertasChurn, enviarMensagemReativacao } from '@/lib/queries';
import { cn } from '@/lib/utils';

const riscoLabels: Record<string, { label: string; color: string }> = {
  RISCO_BAIXO: { label: 'Baixo', color: 'bg-yellow-100 text-yellow-800' },
  RISCO_MEDIO: { label: 'Medio', color: 'bg-orange-100 text-orange-800' },
  RISCO_ALTO: { label: 'Alto', color: 'bg-red-100 text-red-800' },
};

const TEMPLATES_MENSAGEM = [
  { titulo: 'Sentimos sua falta!', corpo: 'Oi! Notamos que faz alguns dias que voce nao aparece por aqui. Que tal retomar seus treinos hoje? Estamos te esperando!' },
  { titulo: 'Oferta especial para voce', corpo: 'Como valorizamos sua presenca, temos uma oferta especial esperando por voce. Venha treinar e descubra!' },
  { titulo: 'Sua sequencia esta em risco', corpo: 'Voce construiu uma otima sequencia de treinos! Nao deixe ela quebrar. Venha hoje e mantenha seu progresso!' },
  { titulo: 'Novidades na academia', corpo: 'Temos novidades incriveis esperando por voce! Venha conferir e aproveite para treinar.' },
];

interface ModalState {
  aberto: boolean;
  alertaId: string;
  alunoId: string;
  nomeAluno: string;
  titulo: string;
  corpo: string;
}

export default function AlertasPage() {
  const { session } = useSession();
  const [alertas, setAlertas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [modal, setModal] = useState<ModalState>({
    aberto: false, alertaId: '', alunoId: '', nomeAluno: '', titulo: '', corpo: '',
  });

  useEffect(() => {
    if (!session?.academiaId) return;
    setLoading(true);
    getAlertasChurn(session.academiaId, filtro || undefined)
      .then(setAlertas)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [session, filtro]);

  function abrirModal(alerta: any) {
    setModal({
      aberto: true,
      alertaId: alerta.id,
      alunoId: (alerta.aluno as any)?.id ?? '',
      nomeAluno: (alerta.aluno as any)?.nome ?? 'Aluno',
      titulo: TEMPLATES_MENSAGEM[0]!.titulo,
      corpo: TEMPLATES_MENSAGEM[0]!.corpo,
    });
  }

  async function handleEnviar() {
    if (!session?.academiaId || !modal.alunoId) return;
    setEnviando(true);
    try {
      await enviarMensagemReativacao(session.academiaId, modal.alunoId, modal.alertaId, modal.titulo, modal.corpo);
      setAlertas((prev) => prev.map((a) => a.id === modal.alertaId ? { ...a, acaoTomada: true } : a));
      setModal((m) => ({ ...m, aberto: false }));
    } catch (err: any) {
      alert(err.message ?? 'Erro ao enviar mensagem');
    } finally {
      setEnviando(false);
    }
  }

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
              <th className="px-4 py-3 text-left font-medium text-gray-600">Acao</th>
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
                  {alerta.acaoTomada ? (
                    <span className="text-xs text-gray-400 font-medium">Mensagem enviada</span>
                  ) : (
                    <button onClick={() => abrirModal(alerta)} className="text-green-600 hover:underline text-sm font-medium">
                      Enviar mensagem
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {alertas.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">Nenhum aluno em risco</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modal.aberto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg space-y-4 p-6">
            <h3 className="text-lg font-semibold text-gray-800">Enviar mensagem para {modal.nomeAluno}</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Templates rapidos</label>
              <div className="grid grid-cols-2 gap-2">
                {TEMPLATES_MENSAGEM.map((t, i) => (
                  <button key={i} onClick={() => setModal((m) => ({ ...m, titulo: t.titulo, corpo: t.corpo }))}
                    className={cn('text-left rounded-lg border p-2 text-xs transition',
                      modal.titulo === t.titulo ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600 hover:border-gray-300')}>
                    {t.titulo}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Titulo</label>
              <input value={modal.titulo} onChange={(e) => setModal((m) => ({ ...m, titulo: e.target.value }))}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Mensagem</label>
              <textarea rows={4} value={modal.corpo} onChange={(e) => setModal((m) => ({ ...m, corpo: e.target.value }))}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none resize-none" />
            </div>

            <div className="flex gap-3 justify-end">
              <button onClick={() => setModal((m) => ({ ...m, aberto: false }))}
                className="rounded-md border px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
                Cancelar
              </button>
              <button onClick={handleEnviar} disabled={enviando || !modal.titulo || !modal.corpo}
                className="rounded-md bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700 disabled:opacity-50">
                {enviando ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
