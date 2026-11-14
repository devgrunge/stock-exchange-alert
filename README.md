# Stock Exchange Alert

Monitora cotações da B3 (**PETR4**, **TAEE4**, **BBSE3**) e dispara notificações **Web Push**
quando as condições de alerta são atingidas:

- **Queda de 10%**: preço atual ≤ 90% do preço de compra.
- **Próximo do alvo**: preço atual ≥ 98% do preço-alvo.

## Arquitetura

Monorepo (pnpm workspaces + Turborepo):

```
apps/
  api/   # Fastify (Node.js) — consulta a brapi.dev, aplica regras e envia Web Push
  web/   # React 19 + Vite (PWA) — cards, configuração e assinatura de push
packages/
  shared/ # tipos, tickers e constantes compartilhados
  config/ # tsconfig e ESLint compartilhados
```

## Pré-requisitos

- Node.js ≥ 20
- pnpm 9 (`corepack enable` já disponibiliza)

## Desenvolvimento local

```bash
pnpm install
pnpm generate:icons        # gera os PNGs do PWA (só na primeira vez)
pnpm dev                   # sobe api (:3001) e web (:5173) juntos
```

O Vite faz proxy de `/api` para `http://localhost:3001`, então não é preciso configurar CORS.

Para subir só um deles:

```bash
pnpm --filter @repo/api dev
pnpm --filter @repo/web dev
```

## Configuração da API

Copie `apps/api/.env.example` para `apps/api/.env` e preencha:

| Variável | Obrigatória | Descrição |
| :--- | :--- | :--- |
| `BRAPI_TOKEN` | sim | Token gratuito da [brapi.dev](https://brapi.dev) — sem ele a API retorna HTTP 401 |
| `VAPID_PUBLIC_KEY` | sim (para push) | Chave pública VAPID |
| `VAPID_PRIVATE_KEY` | sim (para push) | Chave privada VAPID |
| `VAPID_SUBJECT` | não | `mailto:` ou URL do administrador |

> Crie o token da brapi.dev em <https://brapi.dev/dashboard> (grátis) e copie para `BRAPI_TOKEN`.

Gerar as chaves VAPID:

```bash
pnpm dlx web-push generate-vapid-keys --json
```

Sem as chaves VAPID o servidor sobe normalmente, mas as notificações ficam desativadas
(a API responde `configured: false` em `/api/push/public-key`).

## Deploy no CapRover

Os dois apps usam Dockerfiles cujo **contexto de build é a raiz do repositório**.

1. Na interface do CapRover, crie dois apps: `api` e `web`.
2. Para cada app, configure o **Dockerfile path**:
   - `api` → `apps/api/Dockerfile`
   - `web` → `apps/web/Dockerfile`
3. Envie com `caprover deploy` a partir da raiz do repo, ou use o "Deploy from GitHub".
4. Defina as variáveis de ambiente do app `api` (listadas acima).
5. Monte um volume persistente no app `api` em `/repo/apps/api/data` (banco SQLite).

O `nginx.conf` do app `web` faz proxy de `/api` para o serviço `srv-captain--api:3001`
(rede interna do CapRover). O frontend usa URLs relativas, então não é preciso definir
`VITE_API_URL` em produção.

## Verificação

```bash
pnpm typecheck
pnpm lint
pnpm build
```

## Endpoints principais

| Método | Rota | Descrição |
| :--- | :--- | :--- |
| `GET` | `/api/quotes` | Cotações em cache (`?refresh=true` força nova consulta) |
| `GET` | `/api/config` | Configuração atual |
| `PUT` | `/api/config/:ticker` | Atualiza configuração de um ticker |
| `GET` | `/api/push/public-key` | Chave pública VAPID |
| `POST` | `/api/push/subscribe` | Registra assinatura de push |
| `DELETE` | `/api/push/subscribe` | Remove assinatura |
| `POST` | `/api/push/test` | Envia notificação de teste |
| `GET` | `/api/health` | Health check |
