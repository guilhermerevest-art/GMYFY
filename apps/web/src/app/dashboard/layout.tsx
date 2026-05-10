'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/dashboard/alunos', label: 'Alunos', icon: '👥' },
  { href: '/dashboard/alertas', label: 'Alertas de Churn', icon: '⚠️' },
  { href: '/dashboard/desafios', label: 'Desafios', icon: '🏆' },
  { href: '/dashboard/premios', label: 'Prêmios', icon: '🎁' },
  { href: '/dashboard/relatorios', label: 'Relatórios', icon: '📈' },
  { href: '/dashboard/configuracoes', label: 'Configurações', icon: '⚙️' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-white p-4 flex flex-col">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-green-700">Gymfy</h1>
          <p className="text-xs text-gray-500">Painel da Academia</p>
        </div>
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
                pathname === item.href
                  ? 'bg-green-50 text-green-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              )}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <button
          onClick={() => { localStorage.removeItem('gymfy_token'); window.location.href = '/login'; }}
          className="mt-4 text-sm text-gray-500 hover:text-red-600 transition"
        >
          Sair
        </button>
      </aside>
      <main className="flex-1 bg-gray-50 p-8">{children}</main>
    </div>
  );
}
