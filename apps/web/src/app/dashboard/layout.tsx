'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from '@/lib/use-session';
import { getAcademia } from '@/lib/queries';
import { cn } from '@/lib/utils';
import { Users, AlertTriangle, Trophy, Gift, FileText, Settings, LogOut, LayoutDashboard, Tv } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/alunos', label: 'Alunos', icon: Users },
  { href: '/dashboard/alertas', label: 'Alertas de Churn', icon: AlertTriangle },
  { href: '/dashboard/desafios', label: 'Desafios', icon: Trophy },
  { href: '/dashboard/premios', label: 'Prêmios', icon: Gift },
  { href: '/dashboard/relatorios', label: 'Relatórios', icon: FileText },
  { href: '/dashboard/configuracoes', label: 'Configurações', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { session } = useSession();
  const [academiaSlug, setAcademiaSlug] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.academiaId) return;
    getAcademia(session.academiaId).then((ac) => {
      if (ac?.slug) setAcademiaSlug(ac.slug);
    }).catch(() => {});
  }, [session]);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r border-border bg-card p-4 flex flex-col">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-primary">Gymfy</h1>
          <p className="text-xs text-muted-foreground">Painel da Academia</p>
        </div>
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
                  pathname === item.href
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
          {academiaSlug && (
            <a
              href={`/tv/${academiaSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <Tv className="w-4 h-4" />
              Painel TV
            </a>
          )}
        </nav>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:text-destructive transition mt-4"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </aside>
      <main className="flex-1 bg-background p-8">{children}</main>
    </div>
  );
}
