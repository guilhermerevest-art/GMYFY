'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TrendingUp, Trophy, Bell, Users, Zap, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tab = 'login' | 'cadastro';

export default function Home() {
  const [tab, setTab] = useState<Tab>('login');

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LeftPanel />
      <RightPanel tab={tab} setTab={setTab} />
    </div>
  );
}

function LeftPanel() {
  return (
    <div className="lg:w-1/2 bg-gradient-to-br from-green-700 via-green-600 to-emerald-500 flex flex-col justify-center px-8 py-12 lg:px-16 lg:py-0 text-white">
      <div className="max-w-lg mx-auto lg:mx-0">
        <div className="mb-8">
          <span className="text-4xl font-black tracking-tight">Gymfy</span>
          <span className="ml-2 text-green-200 text-sm font-medium uppercase tracking-widest">para academias</span>
        </div>

        <h1 className="text-3xl lg:text-4xl font-bold leading-tight mb-4">
          Transforme frequência em engajamento real
        </h1>
        <p className="text-green-100 text-lg mb-10 leading-relaxed">
          Plataforma de gamificação B2B que reduz o churn de alunos em até 40% e cria um diferencial competitivo exclusivo para sua academia.
        </p>

        <div className="space-y-5 mb-10">
          <Benefit icon={TrendingUp} title="Redução de churn em até 40%">
            Alertas automáticos de risco e campanhas de reativação antes que o aluno cancele.
          </Benefit>
          <Benefit icon={Trophy} title="Rankings e desafios em tempo real">
            Leaderboard ao vivo, missões mensais e badges que mantêm os alunos voltando.
          </Benefit>
          <Benefit icon={Bell} title="Premiações configuráveis">
            Desconto na mensalidade, brindes ou upgrades — você define os prêmios.
          </Benefit>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-8 border-t border-green-500/40">
          <Stat icon={Users} value="34k+" label="Academias no Brasil" />
          <Stat icon={Zap} value="10M+" label="Alunos matriculados" />
          <Stat icon={BarChart3} value="< 6m" label="ROI positivo" />
        </div>
      </div>
    </div>
  );
}

function Benefit({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="font-semibold text-white">{title}</p>
        <p className="text-green-100 text-sm mt-0.5">{children}</p>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, value, label }: { icon: React.ElementType; value: string; label: string }) {
  return (
    <div className="text-center">
      <Icon className="w-5 h-5 text-green-200 mx-auto mb-1" />
      <p className="text-xl font-bold text-white">{value}</p>
      <p className="text-green-200 text-xs">{label}</p>
    </div>
  );
}

function RightPanel({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  return (
    <div className="lg:w-1/2 flex items-center justify-center bg-gray-50 px-6 py-12 lg:px-16">
      <div className="w-full max-w-md">
        <div className="flex rounded-xl bg-white shadow-sm border border-gray-200 p-1 mb-8">
          <TabButton active={tab === 'login'} onClick={() => setTab('login')}>Entrar</TabButton>
          <TabButton active={tab === 'cadastro'} onClick={() => setTab('cadastro')}>Cadastrar academia</TabButton>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          {tab === 'login' ? <LoginForm /> : <RegisterForm />}
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all',
        active
          ? 'bg-green-600 text-white shadow-sm'
          : 'text-gray-500 hover:text-gray-700'
      )}
    >
      {children}
    </button>
  );
}

function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message ?? 'Erro ao fazer login');
      }
      router.push('/dashboard');
    } catch (err: any) {
      setErro(err.message ?? 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Bem-vindo de volta</h2>
        <p className="text-gray-500 text-sm mt-1">Acesse o painel da sua academia</p>
      </div>

      {erro && <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-700">{erro}</div>}

      <Field label="E-mail" htmlFor="login-email">
        <input
          id="login-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input"
          placeholder="voce@academia.com"
        />
      </Field>

      <Field label="Senha" htmlFor="login-senha">
        <input
          id="login-senha"
          type="password"
          required
          autoComplete="current-password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="input"
          placeholder="••••••••"
        />
      </Field>

      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  );
}

function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({ nome: '', email: '', senha: '' });
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message ?? 'Erro ao cadastrar');
      }
      router.push('/dashboard');
    } catch (err: any) {
      setErro(err.message ?? 'Erro ao cadastrar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Comece agora</h2>
        <p className="text-gray-500 text-sm mt-1">Cadastre sua academia gratuitamente</p>
      </div>

      {erro && <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-700">{erro}</div>}

      <Field label="Seu nome" htmlFor="reg-nome">
        <input
          id="reg-nome"
          type="text"
          required
          autoComplete="name"
          value={form.nome}
          onChange={(e) => update('nome', e.target.value)}
          className="input"
          placeholder="João Silva"
        />
      </Field>

      <Field label="E-mail" htmlFor="reg-email">
        <input
          id="reg-email"
          type="email"
          required
          autoComplete="email"
          value={form.email}
          onChange={(e) => update('email', e.target.value)}
          className="input"
          placeholder="voce@academia.com"
        />
      </Field>

      <Field label="Senha" htmlFor="reg-senha">
        <input
          id="reg-senha"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          value={form.senha}
          onChange={(e) => update('senha', e.target.value)}
          className="input"
          placeholder="Mínimo 6 caracteres"
        />
      </Field>

      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? 'Cadastrando...' : 'Criar conta grátis'}
      </button>

      <p className="text-center text-xs text-gray-400">
        Ao cadastrar, você concorda com nossos termos de uso.
      </p>
    </form>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  );
}
