# Gymfy

Plataforma de gamificação B2B2C para academias e estúdios de Pilates.

## Estrutura

```
gymfy/
├── apps/
│   ├── api/        # NestJS + Prisma — backend
│   ├── web/        # Next.js 14 — painel da academia
│   └── mobile/     # React Native + Expo — app do aluno
├── packages/
│   ├── shared/     # tipos, constantes, enums
│   ├── config/     # ESLint, Prettier, TSConfig
│   └── ui/         # design system
├── scripts/        # utilitários (migration)
├── docker-compose.yml  # Redis
└── CLAUDE.md
```

## Como rodar

### Pré-requisitos
- Node.js 20+
- pnpm 9+
- Docker Desktop (para Redis)

### Setup

```bash
# 1. Instalar dependências
pnpm install

# 2. Subir Redis
docker compose up -d

# 3. Configurar variáveis de ambiente
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
# Editar os arquivos .env com suas credenciais

# 4. Aplicar schema no Supabase
# Abrir o Supabase SQL Editor e executar:
# apps/api/prisma/migrations/001_gymfy_initial_schema.sql

# 5. Gerar Prisma client
cd apps/api && npx prisma generate

# 6. Rodar todos os apps
pnpm dev
```

### Apps individuais

```bash
pnpm --filter api dev        # API → http://localhost:3001/docs
pnpm --filter web dev        # Painel → http://localhost:3000
pnpm --filter mobile start   # App via Expo Go
```

## Banco de dados

- **Supabase:** `https://baqxljihngymjnasrdtl.supabase.co`
- **Prefixo de tabelas:** `gymfy_`
- **FK sistemas:** `sistema_id = e416ae5e-fad9-43ac-a6a2-00fde07c744a`

## Variáveis de ambiente necessárias

### API (`apps/api/.env`)
```
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
REDIS_URL=redis://localhost:6379
JWT_SECRET=<gerar com openssl rand -base64 64>
JWT_QR_SECRET=<gerar separado>
```

### Web (`apps/web/.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Mobile (`apps/mobile/.env`)
```
EXPO_PUBLIC_API_URL=http://localhost:3001
```
