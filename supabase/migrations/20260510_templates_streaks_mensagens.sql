-- Templates de desafios
CREATE TABLE gymfy_desafio_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  tipo TEXT NOT NULL DEFAULT 'INDIVIDUAL' CHECK (tipo IN ('INDIVIDUAL', 'GRUPO', 'TURMA')),
  meta_checkins INT NOT NULL,
  pontos_bonus INT NOT NULL DEFAULT 0,
  duracao_dias INT NOT NULL,
  icone TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO gymfy_desafio_templates (nome, descricao, tipo, meta_checkins, pontos_bonus, duracao_dias, icone) VALUES
  ('Desafio do Mes', 'Treine 16 vezes em 30 dias e ganhe pontos bonus!', 'INDIVIDUAL', 16, 100, 30, '🏅'),
  ('Semana Intensiva', 'Complete 5 treinos em uma semana', 'INDIVIDUAL', 5, 50, 7, '🔥'),
  ('Turma Campea', 'Desafio em grupo: 40 check-ins coletivos em 30 dias', 'GRUPO', 40, 200, 30, '🏆'),
  ('Maratona Fitness', '20 treinos em 14 dias para os mais dedicados', 'INDIVIDUAL', 20, 80, 14, '💪'),
  ('Iniciante Dedicado', 'Perfeito para novos alunos: 8 treinos em 30 dias', 'INDIVIDUAL', 8, 40, 30, '⭐');

-- Streaks de treino
CREATE TABLE gymfy_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID NOT NULL REFERENCES gymfy_usuarios(id),
  academia_id UUID NOT NULL REFERENCES gymfy_academias(id),
  streak_atual INT NOT NULL DEFAULT 0,
  maior_streak INT NOT NULL DEFAULT 0,
  ultima_semana_ativa TEXT,
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(aluno_id, academia_id)
);

-- Mensagens de reativacao
CREATE TABLE gymfy_mensagens_reativacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academia_id UUID NOT NULL REFERENCES gymfy_academias(id),
  aluno_id UUID NOT NULL REFERENCES gymfy_usuarios(id),
  alerta_id UUID REFERENCES gymfy_alertas_churn(id),
  titulo TEXT NOT NULL,
  corpo TEXT NOT NULL,
  enviada BOOLEAN NOT NULL DEFAULT true,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);