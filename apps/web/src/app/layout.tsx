import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Gymfy — Gamificação para Academias | Reduza o churn em até 40%',
  description: 'Plataforma de gamificação B2B que transforma a frequência na academia em uma experiência competitiva e recompensadora. Rankings, desafios e premiações para reter alunos.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
