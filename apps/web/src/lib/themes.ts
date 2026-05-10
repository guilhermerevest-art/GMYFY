export interface Theme {
  id: string;
  label: string;
  primary: string;
  accent: string;
  description: string;
}

export const themes: Theme[] = [
  { id: 'emerald-charcoal', label: 'Esmeralda & Carvão', primary: '#059669', accent: '#1f2937', description: 'Clássico fitness' },
  { id: 'blue-gold', label: 'Azul & Dourado', primary: '#2563eb', accent: '#d97706', description: 'Premium' },
  { id: 'purple-orange', label: 'Roxo & Laranja', primary: '#9333ea', accent: '#ea580c', description: 'Energético' },
  { id: 'red-graphite', label: 'Vermelho & Grafite', primary: '#dc2626', accent: '#334155', description: 'Intenso' },
  { id: 'cyan-pink', label: 'Ciano & Rosa', primary: '#06b6d4', accent: '#ec4899', description: 'Moderno' },
  { id: 'indigo-lime', label: 'Índigo & Lima', primary: '#4f46e5', accent: '#84cc16', description: 'Tech' },
  { id: 'dark-neon', label: 'Preto & Neon', primary: '#111827', accent: '#4ade80', description: 'Dark mode' },
  { id: 'navy-white', label: 'Azul Marinho & Branco', primary: '#1e3a5f', accent: '#f8fafc', description: 'Minimalista' },
  { id: 'coral-teal', label: 'Coral & Turquesa', primary: '#f43f5e', accent: '#14b8a6', description: 'Tropical' },
  { id: 'violet-amber', label: 'Violeta & Âmbar', primary: '#7c3aed', accent: '#f59e0b', description: 'Vibrante' },
];

export const DEFAULT_THEME = 'emerald-charcoal';
