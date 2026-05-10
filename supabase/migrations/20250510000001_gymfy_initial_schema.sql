-- Gymfy Initial Schema
-- Todas as tabelas com prefixo gymfy_
-- FK para tabela sistemas com sistema_id = e416ae5e-fad9-43ac-a6a2-00fde07c744a

CREATE TYPE gymfy_tipo_usuario AS ENUM ('ADMIN', 'ACADEMIA', 'ALUNO');
CREATE TYPE gymfy_tipo_desafio AS ENUM ('INDIVIDUAL', 'GRUPO', 'TURMA');
CREATE TYPE gymfy_status_desafio AS ENUM ('RASCUNHO', 'ATIVO', 'FINALIZADO', 'CANCELADO');
CREATE TYPE gymfy_status_resgate AS ENUM ('PENDENTE', 'APROVADO', 'REJEITADO', 'ENTREGUE');
CREATE TYPE gymfy_risco_churn AS ENUM ('SEM_RISCO', 'RISCO_BAIXO', 'RISCO_MEDIO', 'RISCO_ALTO');
CREATE TYPE gymfy_tipo_reacao AS ENUM ('CORAGEM', 'FOGO', 'TROFEU');

CREATE TABLE gymfy_academias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sistema_id UUID NOT NULL REFERENCES sistemas(id),
  nome TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  telefone TEXT,
  endereco TEXT,
  logo_url TEXT,
  cor_primaria TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE gymfy_usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sistema_id UUID NOT NULL REFERENCES sistemas(id),
  academia_id UUID REFERENCES gymfy_academias(id),
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  senha_hash TEXT,
  tipo gymfy_tipo_usuario NOT NULL DEFAULT 'ALUNO',
  avatar_url TEXT,
  fcm_token TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE gymfy_aluno_academia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID NOT NULL REFERENCES gymfy_usuarios(id),
  academia_id UUID NOT NULL REFERENCES gymfy_academias(id),
  ativo BOOLEAN NOT NULL DEFAULT true,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(aluno_id, academia_id)
);

CREATE TABLE gymfy_check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID NOT NULL REFERENCES gymfy_usuarios(id),
  academia_id UUID NOT NULL REFERENCES gymfy_academias(id),
  pontos_ganhos INT NOT NULL DEFAULT 0,
  fora_horario_pico BOOLEAN NOT NULL DEFAULT false,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE gymfy_pontos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID NOT NULL REFERENCES gymfy_usuarios(id),
  academia_id UUID NOT NULL,
  check_in_id UUID REFERENCES gymfy_check_ins(id),
  quantidade INT NOT NULL,
  descricao TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE gymfy_rankings_historico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID NOT NULL,
  academia_id UUID NOT NULL,
  periodo TEXT NOT NULL,
  posicao INT NOT NULL,
  pontos INT NOT NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE gymfy_conquistas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT NOT NULL,
  icone TEXT,
  criterio TEXT NOT NULL,
  valor INT NOT NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE gymfy_conquistas_aluno (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID NOT NULL REFERENCES gymfy_usuarios(id),
  conquista_id UUID NOT NULL REFERENCES gymfy_conquistas(id),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(aluno_id, conquista_id)
);

CREATE TABLE gymfy_desafios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academia_id UUID NOT NULL REFERENCES gymfy_academias(id),
  nome TEXT NOT NULL,
  descricao TEXT,
  tipo gymfy_tipo_desafio NOT NULL DEFAULT 'INDIVIDUAL',
  status gymfy_status_desafio NOT NULL DEFAULT 'RASCUNHO',
  meta_checkins INT,
  pontos_bonus INT NOT NULL DEFAULT 0,
  inicio_em TIMESTAMPTZ NOT NULL,
  fim_em TIMESTAMPTZ NOT NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE gymfy_desafio_participantes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  desafio_id UUID NOT NULL REFERENCES gymfy_desafios(id),
  aluno_id UUID NOT NULL REFERENCES gymfy_usuarios(id),
  progresso INT NOT NULL DEFAULT 0,
  concluido BOOLEAN NOT NULL DEFAULT false,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(desafio_id, aluno_id)
);

CREATE TABLE gymfy_premios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academia_id UUID NOT NULL REFERENCES gymfy_academias(id),
  nome TEXT NOT NULL,
  descricao TEXT,
  imagem_url TEXT,
  pontos_necessarios INT NOT NULL,
  estoque INT NOT NULL DEFAULT -1,
  ativo BOOLEAN NOT NULL DEFAULT true,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE gymfy_resgates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID NOT NULL REFERENCES gymfy_usuarios(id),
  premio_id UUID NOT NULL REFERENCES gymfy_premios(id),
  status gymfy_status_resgate NOT NULL DEFAULT 'PENDENTE',
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE gymfy_notificacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES gymfy_usuarios(id),
  titulo TEXT NOT NULL,
  corpo TEXT NOT NULL,
  lida BOOLEAN NOT NULL DEFAULT false,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE gymfy_alertas_churn (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID NOT NULL REFERENCES gymfy_usuarios(id),
  academia_id UUID NOT NULL,
  risco gymfy_risco_churn NOT NULL,
  dias_sem_checkin INT NOT NULL,
  acao_tomada BOOLEAN NOT NULL DEFAULT false,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE gymfy_feed_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  autor_id UUID NOT NULL REFERENCES gymfy_usuarios(id),
  academia_id UUID NOT NULL REFERENCES gymfy_academias(id),
  conteudo TEXT,
  imagem_url TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE gymfy_feed_reacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES gymfy_feed_posts(id),
  autor_id UUID NOT NULL REFERENCES gymfy_usuarios(id),
  tipo gymfy_tipo_reacao NOT NULL,
  UNIQUE(post_id, autor_id)
);

CREATE TABLE gymfy_configuracoes_academia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academia_id UUID NOT NULL UNIQUE REFERENCES gymfy_academias(id),
  horario_pico_inicio TEXT,
  horario_pico_fim TEXT,
  minimo_checkins_semana INT NOT NULL DEFAULT 3,
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO gymfy_conquistas (nome, descricao, icone, criterio, valor) VALUES
  ('Iniciante', 'Completou 10 treinos', '🥉', 'checkins', 10),
  ('Dedicado', 'Completou 25 treinos', '🥈', 'checkins', 25),
  ('Campeão', 'Completou 50 treinos', '🥇', 'checkins', 50),
  ('Lendário', 'Completou 100 treinos', '🏆', 'checkins', 100);
