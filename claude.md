# GYMFY — Contexto do Projeto para Claude Code

> Este arquivo é lido automaticamente pelo Claude Code ao abrir o projeto no VS Code.
> Ele contém o plano completo do produto (PR), a arquitetura técnica, as regras de
> negócio e as convenções de código. Mantenha-o atualizado conforme o projeto evolui.

---

## Índice

1. [Visão Geral do Produto](#1-visão-geral-do-produto)
2. [Mercado e Oportunidade](#2-mercado-e-oportunidade)
3. [Funcionalidades](#3-funcionalidades)
4. [Modelo de Negócio](#4-modelo-de-negócio)
5. [Experiência do Usuário](#5-experiência-do-usuário)
6. [Stack Técnica](#6-stack-técnica)
7. [Estrutura de Pastas](#7-estrutura-de-pastas)
8. [Módulos da API](#8-módulos-da-api)
9. [Convenções de Código](#9-convenções-de-código)
10. [Regras de Negócio Críticas](#10-regras-de-negócio-críticas)
11. [Variáveis de Ambiente](#11-variáveis-de-ambiente)
12. [Como Rodar Localmente](#12-como-rodar-localmente)
13. [Roadmap de Produto](#13-roadmap-de-produto)
14. [Roadmap Técnico](#14-roadmap-técnico)
15. [Métricas de Sucesso](#15-métricas-de-sucesso)
16. [Riscos e Mitigações](#16-riscos-e-mitigações)
17. [Decisões de Arquitetura (ADRs)](#17-decisões-de-arquitetura-adrs)
18. [Checklist de Segurança](#18-checklist-de-segurança)
19. [Setup do Claude Code no VS Code](#19-setup-do-claude-code-no-vs-code)
20. [Exemplos de Prompts para o Claude Code](#20-exemplos-de-prompts-para-o-claude-code)

---

## 1. Visão Geral do Produto

### O Problema

Academias e estúdios de Pilates enfrentam dois desafios críticos e diretamente ligados:
alta taxa de abandono de alunos (churn) e dificuldade em criar diferencial competitivo.

Dados do setor apontam que até **50% dos alunos** abandonam a prática nos primeiros
3 meses após a matrícula. Esse churn silencioso consome receita recorrente, aumenta o
custo de aquisição de novos clientes e deixa o gestor sem ferramentas para agir antes
de perder o aluno.

O problema não é falta de motivação inicial — é a ausência de mecanismos que sustentem
o engajamento ao longo do tempo. Rotina repetitiva, ausência de progresso visível e
falta de senso de comunidade são os principais fatores de evasão.

### A Solução — Gymfy

Gymfy é uma plataforma de **gamificação B2B2C**: a academia assina o SaaS e ativa a
experiência para seus alunos. O produto opera em duas camadas simultâneas:

- **Para a academia:** painel de gestão com dados de assiduidade, criação de desafios
  e campanhas, alertas de risco de churn e relatórios de ROI.
- **Para o aluno:** app mobile com rankings, missões, streaks de presença, conquistas
  e premiações reais gerenciadas pela própria academia.

> **Proposta de valor em uma frase:** Gymfy transforma a frequência na academia em uma
> experiência competitiva e recompensadora, aumentando a retenção de alunos em até 40%
> e gerando um diferencial de marketing exclusivo para o estabelecimento.

### Diferenciais Frente ao Mercado

O principal concorrente de referência é o **Gym Rats** (EUA), app de desafios fitness
com forte engajamento social — porém exclusivamente B2C, sem nenhuma ferramenta para
o gestor. Gymfy ocupa exatamente esse espaço:

| Gym Rats | Gymfy |
|----------|-------|
| Desafios entre amigos (grupo livre) | Desafios gerenciados pela academia (turmas, planos) |
| Pontuação autodeclarada (sem verificação) | Check-in integrado ao sistema da academia (QR Code) |
| Sem painel para gestores | Dashboard completo: assiduidade, risco de churn, campanhas |
| Sem premiação real | Premiação configurável: crédito em mensalidade, brindes, upgrades |
| Modelo B2C (consumidor paga) | Modelo B2B2C (academia paga, aluno usa grátis) |
| Sem alerta de inatividade | Alerta automático quando aluno fica X dias sem treinar |

---

## 2. Mercado e Oportunidade

### Tamanho de Mercado (Brasil)

| Segmento | Números |
|----------|---------|
| Academias ativas | ~34.000 estabelecimentos |
| Estúdios de Pilates | ~15.000 estúdios |
| Alunos matriculados | ~10 milhões de pessoas |
| Ticket médio SaaS por academia (estimado) | R$ 299 – R$ 799 / mês |
| TAM estimado (apenas academias) | R$ 120 milhões / ano |

O Brasil é o 2º maior mercado de academias do mundo, com crescimento médio de 7% ao
ano pós-pandemia. O mercado de SaaS para fitness ainda é concentrado em sistemas de
gestão (ERP/CRM) — não há player focado exclusivamente em engajamento e gamificação B2B.

### Público-Alvo

**Cliente pagante (B2B):**
- Academias de pequeno e médio porte (200–2.000 alunos)
- Estúdios de Pilates com turmas fixas e alto relacionamento com alunos
- Box de CrossFit com forte cultura de competição interna
- Redes de academias buscando diferencial de retenção escalável

**Usuário final (B2C via academia):**
- Alunos de 20–45 anos habituados a apps mobile
- Pessoas que precisam de motivação externa para manter a rotina
- Alunos competitivos que gostam de reconhecimento e ranking

### O Custo do Churn para uma Academia

```
Academia com 500 alunos  |  Mensalidade média: R$ 120
Taxa de churn mensal sem gamificação: ~5% = 25 alunos / mês perdidos
Perda mensal de receita: R$ 3.000  |  Perda anual: R$ 36.000
Custo de aquisição de novo aluno: R$ 80–R$ 200 (marketing + promoção)

Com Gymfy reduzindo o churn em 30%: economia de R$ 10.800 / ano
Gymfy custa R$ 399 / mês = R$ 4.788 / ano  →  ROI positivo em < 6 meses
```

---

## 3. Funcionalidades

### 3.1 App do Aluno (Mobile — iOS e Android)

#### Check-in e Presença
- Check-in via QR Code na entrada da academia (integrado ao sistema de acesso ou ERP)
- Validação automática da presença — sem autodeclaração, sem fraude
- Histórico de treinos com frequência semanal e mensal
- Notificação de "está na hora de treinar" configurável pelo aluno

#### Gamificação e Rankings
- Pontos por presença: cada treino válido gera pontos (fórmula configurável pela academia)
- Pontuação bônus: primeiro treino da semana, semana perfeita, horário fora do pico
- Ranking geral, por turma, por plano e por período (mensal / semestral / anual)
- Conquistas (badges): 10 treinos, 50 treinos, 6 meses consecutivos, campeão do mês
- Streaks: sequência de semanas com ao menos X treinos — exibida no perfil

#### Desafios e Missões
- Desafios mensais criados pela academia: "Treine 16x em janeiro", "Venha 3x/semana"
- Missões individuais: completar treinos em horários específicos, experimentar modalidades
- Desafios em grupo: turmas ou equipes competindo entre si
- Desafios de rede: academias parceiras competindo entre si (fase futura)

#### Feed Social
- Feed com atividade dos colegas: check-ins, conquistas e recordes
- Reações e comentários nos treinos (coragem, fogo, troféu)
- Fotos opcionais no check-in — "selfie do treino" com filtro da academia
- Ranking público da semana exibido no lobby da academia (TV ou painel digital)

#### Premiação
- Vitrine de prêmios configurada pela academia: desconto na mensalidade, produto, sessão extra
- Aluno resgata pontos por prêmios automaticamente pelo app
- Prêmios por classificação: 1º, 2º, 3º lugar no ranking mensal
- Notificação de resgate e confirmação pela academia

### 3.2 Painel da Academia (Web — SaaS)

#### Dashboard de Assiduidade
- Visão geral: frequência média, alunos em risco, alunos destaque
- Gráfico de presença diária e semanal (últimos 30 / 90 dias)
- Comparativo de período: este mês vs. mês anterior
- Segmentação por turma, modalidade, faixa etária e plano

#### Alerta de Churn
- Score de risco calculado automaticamente por aluno (ausência + histórico + comportamento)
- Lista de "alunos em risco": quem não treina há 7, 14 ou 21 dias
- Ação rápida: enviar mensagem personalizada ou oferta de reativação direto pelo painel
- Histórico de ações de retenção e resultado (aluno voltou ou cancelou)

#### Gestão de Campanhas e Desafios
- Criação de desafio em poucos cliques: nome, período, regras de pontuação, prêmio
- Templates prontos: Desafio do Mês, Ranking Anual, Turma Campeã
- Agendamento de campanhas com envio automático de notificação push
- Painel de resultados em tempo real durante a campanha

#### Relatórios e ROI
- Relatório mensal: engajamento, top alunos, impacto estimado na retenção
- Cálculo de ROI: prêmios investidos vs. churn evitado
- Exportação CSV / PDF para apresentação a sócios

---

## 4. Modelo de Negócio

### Planos SaaS

| Plano | Público | Preço / mês |
|-------|---------|-------------|
| Starter | Até 150 alunos ativos | R$ 199 |
| Pro | Até 500 alunos ativos | R$ 399 |
| Business | Até 2.000 alunos ativos | R$ 799 |
| Enterprise | Redes / franquias | Sob consulta |

### Comparativo de Features por Plano

| Feature | Starter | Pro | Business |
|---------|---------|-----|----------|
| App do aluno (iOS + Android) | ✓ | ✓ | ✓ |
| Check-in por QR Code | ✓ | ✓ | ✓ |
| Ranking e badges | ✓ | ✓ | ✓ |
| Criação de desafios mensais | 2 por mês | Ilimitado | Ilimitado |
| Alerta de churn | — | ✓ | ✓ |
| Dashboard de assiduidade | Básico | Completo | Completo + segmentado |
| Vitrine de prêmios | — | ✓ | ✓ |
| Feed social e fotos | — | ✓ | ✓ |
| Relatórios exportáveis | — | ✓ | ✓ |
| API / integração com ERP | — | — | ✓ |
| Suporte | Chat | Chat + vídeo | Chat + vídeo + SLA 24h |

### Go-to-Market

**Fase 1 — Validação local (meses 1–3)**
- Lançamento em Uberlândia com 5–10 academias parceiras piloto
- Plano gratuito por 60 dias para as primeiras academias (em troca de feedback)
- Presença em feiras locais de fitness e contato direto com donos de academia

**Fase 2 — Tração regional (meses 4–8)**
- Expansão para Triângulo Mineiro e interior de SP
- Marketing de conteúdo: cases de retenção com dados reais das academias piloto
- Parceria com associações estaduais de academias (ACAD MG)
- Programa de indicação: academia indica outra e ganha 1 mês grátis

**Fase 3 — Escala nacional (meses 9–18)**
- Time comercial focado em redes e franquias
- Integrações com ERPs líderes do setor (Tecnofit, Evofit, GymManager)
- Produto Enterprise para redes com múltiplas unidades

---

## 5. Experiência do Usuário

### Jornada do Aluno

| Etapa | Experiência |
|-------|-------------|
| 1. Onboarding | Academia envia link de convite. Aluno instala o app e cria perfil em 2 minutos. |
| 2. Primeiro check-in | Aluno lê QR Code na recepção. Recebe: "+10 pontos! Você está no ranking!" |
| 3. Descoberta | No feed vê colegas treinando. Confere o ranking e está em 8º lugar. |
| 4. Missão ativa | Notificação: "Venha mais 2x essa semana e complete a missão Semana Perfeita!" |
| 5. Conquista | Fecha a semana com 3 treinos. Recebe badge e sobe para 4º lugar. |
| 6. Resgate | No fim do mês fica em 2º lugar. Resgata desconto de R$ 30 na próxima mensalidade. |
| 7. Retenção | Quando fica 8 dias sem ir, recebe: "Sentimos sua falta! Sua sequência está em risco." |

### Jornada do Gestor da Academia

| Etapa | Experiência |
|-------|-------------|
| 1. Setup | Cadastro em 10 min: logo, cores, planos e sistema de pontos padrão. |
| 2. Convite | Importa lista de alunos (CSV ou integra com ERP). App envia convites automaticamente. |
| 3. Lançamento | Cria desafio do mês em 3 cliques. Notificação push para todos os alunos. |
| 4. Monitoramento | Dashboard mostra quem está engajado e quem está sumindo. Alertas de risco aparecem. |
| 5. Ação | Vê que Maria não vai há 12 dias. Clica em "Enviar mensagem" e manda oferta. |
| 6. Resultado | Ao fim do mês: relatório mostra +18% de frequência média vs. mês anterior. |

### Princípios de Design
- **Rapidez:** check-in em menos de 10 segundos
- **Recompensa imediata:** pontos e feedback visual aparecem instantaneamente
- **Transparência:** aluno sempre sabe quantos pontos faltam para o próximo prêmio
- **Leveza:** sem gamificação excessiva — estética clean, adulta e motivacional
- **Acessibilidade:** leitores de tela, texto ajustável, contraste alto

---

## 6. Stack Técnica

| Camada | Tecnologia | Responsabilidade |
|--------|-----------|-----------------|
| App mobile | React Native + Expo | Tela do aluno: check-in, ranking, missões, prêmios |
| Painel web | Next.js 14 + Tailwind | Dashboard da academia: frequência, alertas, campanhas |
| API / backend | NestJS + Prisma | Lógica de negócio, pontuação, ranking, notificações |
| Banco de dados | PostgreSQL + Redis | Persistência relacional + cache do ranking em tempo real |
| Autenticação | JWT + OAuth | Google e Apple login |
| Notificações push | Firebase Cloud Messaging | Push para iOS e Android |
| Testes | Jest + Supertest + Testing Library | Backend, web e mobile |
| CI/CD | GitHub Actions | Lint, testes e deploy automático |
| Infra (MVP) | Railway + Vercel | Deploy rápido para validação com academias piloto |
| Infra (produção) | AWS ECS + RDS + S3 + CloudFront | Escala e disponibilidade após validação |

---

## 7. Estrutura de Pastas

```
gymfy/
├── apps/
│   ├── mobile/              # React Native (Expo) — app do aluno
│   │   └── src/
│   │       ├── screens/     # auth, home, checkin, ranking, perfil, premios
│   │       ├── components/  # componentes reutilizáveis
│   │       ├── hooks/       # useCheckin, useRanking, usePerfil...
│   │       ├── store/       # Zustand — estado global
│   │       └── services/    # chamadas à API
│   ├── web/                 # Next.js — painel da academia
│   │   └── src/
│   │       ├── app/         # (auth)/, dashboard/, alunos/, desafios/, premios/, relatorios/
│   │       └── components/  # tabelas, gráficos, modais
│   └── api/                 # NestJS — backend unificado
│       └── src/             # módulos: ver seção 8
├── packages/
│   ├── shared/              # tipos TypeScript, utils e constantes compartilhados
│   ├── ui/                  # design system reutilizável
│   └── config/              # ESLint, Prettier e TypeScript base
├── infra/                   # IaC (Terraform ou Railway config)
├── docs/
│   ├── adr/                 # Architecture Decision Records
│   └── GYMFY_PR_v1.1.docx   # Product Requirements Document completo
├── CLAUDE.md                # este arquivo
├── docker-compose.yml       # PostgreSQL + Redis para desenvolvimento local
├── package.json             # workspaces (monorepo com pnpm)
└── turbo.json               # Turborepo para builds e cache
```

---

## 8. Módulos da API

```
apps/api/src/
├── auth/           # registro, login, refresh token, OAuth (Google, Apple)
├── academias/      # CRUD de academias (tenant), planos, configurações
├── alunos/         # perfil, vinculação à academia, histórico
├── checkins/       # registro de presença via QR Code, validação, anti-fraude
├── pontos/         # cálculo e histórico de pontuação por aluno
├── ranking/        # leaderboard em tempo real (WebSocket + Redis Sorted Set)
├── desafios/       # CRUD de campanhas mensais, missões individuais e em grupo
├── premios/        # vitrine, resgate pelo aluno, confirmação pela academia
├── notificacoes/   # FCM push: check-in confirmado, streak em risco, novos desafios
├── alertas/        # churn score automático, lista de alunos em risco
└── relatorios/     # agregação de dados, exportação PDF/CSV, cálculo de ROI
```

### Rotas Principais

```
POST   /auth/register          # criar conta (academia ou aluno)
POST   /auth/login             # login com email + senha
POST   /auth/oauth/:provider   # login com Google ou Apple
GET    /academias/:id          # dados da academia (tenant)
POST   /checkins               # registrar check-in via QR Code
GET    /checkins?aluno_id=     # histórico de check-ins
GET    /ranking?periodo=mensal # leaderboard da academia
POST   /desafios               # criar desafio (academia)
GET    /premios                # vitrine de prêmios
POST   /premios/:id/resgatar   # resgatar prêmio (aluno)
GET    /alertas/churn          # lista de alunos em risco (academia)
GET    /relatorios/mensal      # relatório mensal (academia)
```

### Estrutura padrão de módulo NestJS

```
modulo/
├── modulo.module.ts
├── modulo.controller.ts
├── modulo.service.ts
├── modulo.repository.ts
├── dto/
│   ├── create-modulo.dto.ts
│   └── update-modulo.dto.ts
└── modulo.service.spec.ts    # testes unitários sempre junto do service
```

---

## 9. Convenções de Código

### Nomenclatura
- **Arquivos:** `kebab-case` → `checkin.service.ts`, `ranking.controller.ts`
- **Classes e tipos:** `PascalCase` → `CheckinService`, `AlunoDto`
- **Variáveis e funções:** `camelCase` → `calcularPontos()`, `rankingAtual`
- **Constantes globais:** `UPPER_SNAKE_CASE` → `MAX_PONTOS_DIA`
- **Tabelas do banco:** `snake_case` plural → `check_ins`, `desafios_mensais`

### TypeScript
- `strict: true` em todos os módulos
- Sem `any` — use `unknown` e faça type guard explícito
- DTOs com validação via `class-validator` (backend) ou `zod` (frontend)
- Tipos compartilhados ficam em `packages/shared/types/`

### API REST
- Rotas no plural: `GET /academias`, `POST /checkins`
- Versionamento no header: `API-Version: 1`
- Respostas de erro seguem RFC 7807 (Problem Details):
  ```json
  { "type": "...", "title": "...", "status": 400, "detail": "..." }
  ```

### Commits — Conventional Commits
```
feat(checkin): adicionar validação de QR Code expirado
fix(ranking): corrigir ordenação quando há empate de pontos
docs(api): atualizar swagger do módulo de prêmios
test(alertas): adicionar testes para cálculo de churn score
chore(deps): atualizar NestJS para 10.4
```

---

## 10. Regras de Negócio Críticas

### Pontuação
- Cada check-in válido = **10 pontos base**
- Primeiro treino da semana (seg–dom) = **+5 pontos bônus**
- Semana perfeita (≥ 3 treinos na semana) = **+15 pontos bônus**
- Treino em horário fora do pico (configurável pela academia) = **+3 pontos bônus**
- **Máximo de 1 check-in por dia** por aluno na mesma academia (duplicatas ignoradas)
- QR Code expira em **60 segundos** após geração — usar JWT assinado com `exp`

### Ranking
- Calculado em tempo real via **Redis Sorted Set** (`ZADD` a cada check-in)
- Período padrão: **mensal** — reseta no dia 1 de cada mês às 00:00 BRT (cron job)
- Histórico preservado em PostgreSQL (tabela `rankings_historico`)
- Empate: desempate por check-in **mais recente**

### Churn Score
- Aluno sem check-in há **7 dias** → `RISCO_BAIXO` (sem alerta)
- Aluno sem check-in há **14 dias** → `RISCO_MEDIO` → aparece no painel
- Aluno sem check-in há **21 dias** → `RISCO_ALTO` → push automático para o aluno

### Multi-tenancy
- Cada academia é um **tenant isolado** com `academia_id` próprio
- **Todo SELECT deve filtrar por `academia_id`** — nunca omitir esse filtro
- Aluno pode estar vinculado a mais de uma academia (tabela `aluno_academia` N:M)
- Token JWT do aluno contém `academia_id` do contexto ativo

### QR Code anti-fraude
- Gerado pelo servidor — aluno apenas escaneia, nunca gera
- Payload: `{ academia_id, gerado_em, exp: now + 60s }` assinado com `JWT_QR_SECRET`
- Totem/tablet na recepção atualiza o QR Code a cada 60 segundos (polling)

---

## 11. Variáveis de Ambiente

### API — `apps/api/.env`
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/gymfy
REDIS_URL=redis://localhost:6379
JWT_SECRET=<gerar: openssl rand -base64 64>
JWT_EXPIRES_IN=7d
JWT_QR_SECRET=<gerar separado do JWT_SECRET>
FCM_SERVER_KEY=<chave do Firebase>
GOOGLE_CLIENT_ID=<OAuth Google>
GOOGLE_CLIENT_SECRET=<OAuth Google>
APPLE_CLIENT_ID=<OAuth Apple>
APP_URL=http://localhost:3000
PORT=3001
```

### Web — `apps/web/.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXTAUTH_SECRET=<gerar: openssl rand -base64 32>
NEXTAUTH_URL=http://localhost:3000
```

### Mobile — `apps/mobile/.env`
```env
EXPO_PUBLIC_API_URL=http://localhost:3001
EXPO_PUBLIC_FCM_SENDER_ID=<Firebase Sender ID>
```

> **Nunca comite arquivos `.env`** — use `.env.example` com os nomes sem valores
> e adicione `.env` ao `.gitignore`.

---

## 12. Como Rodar Localmente

**Pré-requisitos:** Node 20+, pnpm 9+, Docker Desktop

```bash
# 1. Clonar e instalar dependências
git clone https://github.com/seu-org/gymfy
cd gymfy
pnpm install

# 2. Subir banco de dados e Redis
docker compose up -d

# 3. Copiar e preencher variáveis de ambiente
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
cp apps/mobile/.env.example apps/mobile/.env

# 4. Rodar migrations e seed
pnpm --filter api prisma migrate dev
pnpm --filter api prisma db seed

# 5. Rodar todos os apps em paralelo
pnpm dev

# Rodar individualmente
pnpm --filter api dev        # API → http://localhost:3001
pnpm --filter web dev        # Painel → http://localhost:3000
pnpm --filter mobile start   # App via Expo Go (QR Code no terminal)

# Swagger da API
open http://localhost:3001/docs
```

---

## 13. Roadmap de Produto

### Fase 1 — MVP (meses 1–3)

**Meta:** check-in funcionando, ranking ao vivo e painel básico para a academia.

| Entrega | Descrição |
|---------|-----------|
| Check-in por QR Code | Anti-fraude com JWT de 60s |
| Ranking de pontos | Semanal e mensal, tempo real |
| Badges de conquistas | 10, 25 e 50 treinos |
| Painel web básico | Frequência por aluno e ranking |
| Notificações push | Check-in confirmado e streak em risco |
| Onboarding da academia | Setup em menos de 30 minutos |

**Definition of Done:**
- [ ] Check-in em menos de 10 segundos
- [ ] Ranking atualiza em tempo real no app
- [ ] Academia vê frequência dos alunos no painel
- [ ] 80% de cobertura de testes nos módulos de checkin e ranking
- [ ] Zero vulnerabilidades críticas (npm audit)

### Fase 2 — Engajamento (meses 4–8)

**Meta:** desafios, feed social, premiações e alertas de churn.

| Módulo | Descrição |
|--------|-----------|
| Desafios mensais | CRUD customizável, notificação de início/fim |
| Feed social | Timeline de check-ins, reações, fotos opcionais |
| Vitrine de prêmios | Configuração pela academia, resgate e confirmação |
| Alertas de churn | Score automático, lista no painel, mensagem de reativação |
| Relatórios | PDF/CSV com frequência, engajamento e ROI estimado |
| Integrações ERP | Webhooks para Tecnofit e Evofit |

### Fase 3 — Escala (meses 9–18)

**Meta:** produto estável para redes, previsão de churn com IA e expansão.

| Módulo | Descrição |
|--------|-----------|
| Wearables | Apple HealthKit e Google Fit |
| Ranking entre academias | Campeonatos externos entre parceiras |
| Enterprise / multi-unidade | Tenant hierárquico para redes e franquias |
| API pública | OpenAPI + SDK + webhooks |
| Churn preditivo (IA) | Modelo ML com histórico de frequência |
| Painel de TV | Ranking ao vivo no lobby da academia |

---

## 14. Roadmap Técnico

### Fase 1 — MVP (semanas 1–12)

| Semana | Entrega técnica |
|--------|----------------|
| 1–2 | Setup monorepo (Turborepo + pnpm), CI/CD GitHub Actions, PostgreSQL + Redis, auth JWT |
| 3–4 | Módulo `academias`: cadastro de tenant, configuração de pontuação, convite de alunos |
| 5–6 | Módulo `checkins`: geração de QR Code (JWT 60s), validação, cálculo de pontos |
| 7–8 | Módulo `ranking`: Redis Sorted Set + WebSocket para atualização ao vivo |
| 9–10 | App mobile: login, home com feed, scanner QR Code, tela de ranking |
| 11–12 | Painel web: dashboard de frequência, lista de alunos, KPIs básicos |

### Fase 2 — Engajamento (meses 4–8)

| Módulo | Entrega técnica |
|--------|----------------|
| Desafios | CRUD com templates, agendamento de campanhas, notificações automáticas |
| Feed social | Timeline paginada, upload de fotos (S3), sistema de reações |
| Prêmios | Vitrine configurável, fluxo de resgate com aprovação, notificações |
| Alertas churn | Cron job diário calculando score, webhooks de reativação |
| Relatórios | Agregação mensal no PostgreSQL, exportação PDF (Puppeteer) e CSV |
| ERP | Webhooks bidirecionais com Tecnofit e Evofit, sync de alunos ativos |

### Fase 3 — Escala (meses 9–18)

| Módulo | Entrega técnica |
|--------|----------------|
| Wearables | Apple HealthKit + Google Fit SDK, pontuação por métricas |
| Ranking externo | Campeonatos entre academias parceiras na mesma região |
| Enterprise | Tenant hierárquico, dashboards consolidados por rede/franquia |
| API pública | OpenAPI 3.0, SDK JavaScript, webhooks com retry e assinatura |
| Churn IA | Pipeline Python + scikit-learn, modelo treinado com histórico |
| Painel TV | Server-Sent Events (SSE) para ranking ao vivo em TV no lobby |

---

## 15. Métricas de Sucesso

### KPIs do Produto

| Métrica | Meta 6 meses | Meta 12 meses |
|---------|-------------|--------------|
| Academias ativas (pagantes) | 30 | 150 |
| Alunos com app instalado | 3.000 | 20.000 |
| DAU / MAU (engajamento) | > 40% | > 50% |
| Check-ins por aluno / semana | > 2,5x | > 3,0x |
| Churn de academias (SaaS) | < 5% / mês | < 3% / mês |
| NPS da academia | > 50 | > 65 |
| MRR (receita recorrente mensal) | R$ 12.000 | R$ 60.000 |

### Indicadores de Retenção de Alunos
- Frequência média mensal antes e depois da ativação do app
- Taxa de churn de alunos comparada ao histórico pré-Gymfy
- Tempo médio de permanência do aluno após adoção
- Taxa de reativação de alunos abordados pelo alerta de risco

---

## 16. Riscos e Mitigações

| Risco | Probabilidade | Mitigação |
|-------|--------------|-----------|
| Academia não engaja alunos no onboarding | Média | Kit de ativação: banner, script e convite automático |
| Alunos não instalam o app | Média | Bônus de 50 pontos só por instalar e fazer o 1º check-in |
| Integração com ERP demora ou falha | Alta no início | MVP funciona com QR Code standalone sem ERP |
| Academia cancela após trial | Média | Relatório de ROI enviado na semana 3 do trial |
| Concorrente grande copia o produto | Baixa (curto prazo) | Foco em SMB que grandes players ignoram |
| Dificuldade de aquisição de academias | Média | Parceria com distribuidores de equipamentos fitness |

---

## 17. Decisões de Arquitetura (ADRs)

### ADR-001 — Monorepo com Turborepo + pnpm workspaces
**Decisão:** monorepo para compartilhar tipos, componentes e configs entre mobile, web e API.  
**Consequência:** build mais complexo inicialmente; elimina divergências de tipos entre camadas.

### ADR-002 — Redis para ranking em tempo real
**Decisão:** ranking ativo em Redis Sorted Set (`ZADD` / `ZRANGE`) em vez de query PostgreSQL.  
**Consequência:** ranking sub-100ms. Custo: sync Redis ↔ PostgreSQL a cada check-in (write-through).

### ADR-003 — QR Code com JWT expirando em 60 segundos
**Decisão:** QR Codes são JWTs assinados com chave separada e `exp` de 60s.  
**Consequência:** elimina fraude de screenshot. Aluno precisa estar presente para escanear.

### ADR-004 — Multi-tenancy via `academia_id` em todas as tabelas
**Decisão:** isolamento por coluna (row-level) em vez de schemas PostgreSQL separados.  
**Consequência:** simples de implementar. **Todo SELECT deve filtrar por `academia_id`.**

### ADR-005 — Railway para MVP, AWS para produção
**Decisão:** Railway elimina fricção no início. Migrar para AWS após validação com clientes.  
**Consequência:** possível trabalho de migração futuro; evita custo e complexidade prematuros.

---

## 18. Checklist de Segurança

Antes de fazer deploy em produção:

- [ ] Rate limiting em todas as rotas públicas (ex: 5 req/s por IP no `/auth`)
- [ ] Validação de `academia_id` em todas as queries — nunca confiar apenas no token
- [ ] QR Code assinado com `JWT_QR_SECRET` (separado do `JWT_SECRET`)
- [ ] Logs de auditoria para check-ins e resgates (quem, quando, qual academia)
- [ ] LGPD: rota `DELETE /alunos/me` para exportação e deleção de dados
- [ ] Secrets jamais comitados — `.env` local + GitHub Actions Secrets em CI
- [ ] HTTPS obrigatório (sem fallback HTTP em produção)
- [ ] Headers: `HSTS`, `CSP`, `X-Frame-Options`, `X-Content-Type-Options`
- [ ] `npm audit` sem vulnerabilidades críticas antes de cada release
- [ ] Dados pessoais criptografados em repouso (AES-256 via RDS)

---

## 19. Setup do Claude Code no VS Code

### Pré-requisitos
- VS Code **1.98.0** ou superior
- Node.js **18+**
- Conta Anthropic com plano **Pro, Max, Team ou Enterprise**

---

## 20. Exemplos de Prompts para o Claude Code

Com o `CLAUDE.md` na raiz, o Claude Code entende o contexto completo do Gymfy.

### Implementar módulo completo

```
Implemente o módulo de check-in da API seguindo a estrutura padrão do projeto:

- CheckinController: POST /checkins (autenticado, aluno)
- CheckinService:
  - Validar QR Code (JWT com JWT_QR_SECRET, expira em 60s)
  - Verificar academia_id do aluno vs. academia_id do QR Code
  - Garantir máximo 1 check-in por aluno por dia na mesma academia
  - Calcular pontos (base + bônus conforme regras na seção 10)
  - Atualizar Redis Sorted Set do ranking
- DTOs com class-validator
- Testes unitários com 80% de cobertura

Siga as convenções de nomenclatura e estrutura de módulo da seção 9.
```

### Criar tela no app mobile

```
Crie a tela de Ranking no app mobile (React Native / Expo):

- Buscar dados de GET /ranking?periodo=mensal via hook useRanking
- Exibir top 10 com: posição, avatar, nome e pontos
- Destacar visualmente o aluno logado (mesmo fora do top 10)
- Atualizar em tempo real via WebSocket (namespace /ranking)
- Skeleton loading enquanto carrega
- Pull to refresh para atualização manual

Salvar em apps/mobile/src/screens/ranking/.
```

### Criar página no painel web

```
Crie a página de Alertas de Churn no painel web (Next.js):

- Rota: /alunos/risco
- Buscar GET /alertas/churn (autenticado como academia)
- Tabela: nome, dias sem treinar, score de risco, último check-in, botão de ação
- Filtro por score (chips: Todos / Médio / Alto)
- Botão "Enviar mensagem" abre modal com texto pré-preenchido
- Badge colorido: amarelo = RISCO_MEDIO, vermelho = RISCO_ALTO

Usar Tailwind CSS e componentes de apps/web/src/components/.
```

### Corrigir bug

```
O ranking não está desempatando corretamente. Quando dois alunos têm os mesmos
pontos, a ordenação está aleatória em vez de usar o check-in mais recente.

Verifique @apps/api/src/ranking/ranking.service.ts, corrija o método de
desempate e adicione um teste unitário para o cenário de empate.
```

### Revisar segurança

```
Faça revisão de segurança no módulo de check-in:
@apps/api/src/checkins/checkin.controller.ts
@apps/api/src/checkins/checkin.service.ts

Verificar:
- O filtro academia_id está em todas as queries?
- O QR Code usa JWT_QR_SECRET (não JWT_SECRET)?
- Rate limiting está configurado na rota POST /checkins?
- Há validação do payload além da assinatura?

Apontar problemas e sugerir correções.
```

### Escrever testes

```
Escreva testes unitários para o ChurnService:
@apps/api/src/alertas/churn.service.ts

Cenários obrigatórios:
- 6 dias sem check-in → sem risco
- 7 dias → RISCO_BAIXO
- 14 dias → RISCO_MEDIO
- 21 dias → RISCO_ALTO
- Aluno que voltou a treinar → score reseta
- Aluno novo (sem check-ins) → não aparece nos alertas

Usar Jest com mock do Prisma.
```

---

*Gymfy — Gamificação para Academias e Estúdios de Pilates  
Versão 1.1 — Maio 2025*
