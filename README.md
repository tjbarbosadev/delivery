# delivery

API de delivery de encomendas em **Node.js**, **TypeScript**, **Express**, **Prisma 7**, **PostgreSQL** e **JWT** (login via sessão).

---

## Requisitos

- Node.js (ex.: v20+)
- Docker (para Postgres local, opcional se já tiver um banco)
- `npm`

---

## Como rodar

1. **Variáveis de ambiente** — copie o exemplo e preencha:

   ```bash
   cp .env-example .env
   ```

   Chaves usadas pela aplicação (validadas em `src/env.ts` com Zod):

   | Variável        | Descrição |
   |----------------|-----------|
   | `PORT`         | Porta HTTP (número em string, ex.: `3333`) |
   | `DATABASE_URL` | URL do Postgres (Prisma) |
   | `JWT_SECRET`   | Segredo para assinar tokens JWT |

2. **Banco** — suba o Postgres (ex.: Bitnami conforme `docker-compose.yml`):

   ```bash
   docker compose up -d
   ```

3. **Dependências e Prisma**:

   ```bash
   npm install
   npx prisma generate
   npx prisma migrate dev
   ```

4. **Desenvolvimento**:

   ```bash
   npm run dev
   ```

   O script usa `tsx watch --env-file .env` para carregar o `.env` antes do `process.env` usado pelo `envSchema.parse` e pelo Prisma CLI quando aplicável.

---

## Rotas principais

| Método | Caminho      | Descrição |
|--------|--------------|-----------|
| `GET`  | `/users`     | Lista (placeholder) |
| `POST` | `/users`     | Cria usuário (senha com `bcrypt`, sem devolver hash) |
| `POST` | `/sessions`  | Login: valida credenciais, retorna **`token` (JWT)** e **`user`** (sem senha) |

Prefixo: todas as rotas acima estão montadas no `Router` principal em `src/app.ts` (sem `/api` global — ajuste se quiser versionamento).

---

## Stack e pacotes relevantes

- **Express** + **express-async-errors**
- **Zod** — corpo das requisições e **validação de `process.env`** (`src/env.ts`)
- **Prisma 7** + adapter **`pg`** + client gerado em `src/generated/prisma` (gitignored)
- **bcrypt** — hash de senha
- **jsonwebtoken** — em **ESM** use `import jwt from 'jsonwebtoken'` (default export); tipos: `import type { SignOptions } from 'jsonwebtoken'`

---

## Visão geral do que foi construído (ordem lógica)

1. Projeto Node com TypeScript, ESM (`"type": "module"`) e `tsx watch` para dev.
2. Express com `express.json()`, rotas em `Router` e **middleware de erro por último** (`src/app.ts`).
3. **`src/env.ts`** — `PORT`, `DATABASE_URL` e `JWT_SECRET` validados com Zod na subida (falha rápido se faltar algo).
4. Erros de domínio (`AppError`) + Zod (validação de payload) no `errorHandling`.
5. Rotas `/users` e `/sessions`; controllers com Zod + Prisma.
6. **`src/configs/auth.ts`** — `expiresIn` tipado com `SignOptions['expiresIn']`, secret vindo de `env`.
7. Docker Compose (Postgres Bitnami) alinhado à `DATABASE_URL`.
8. Prisma: migrations, `prisma.config.ts`, client gerado localmente após `prisma generate`.
9. Segurança: bcrypt no cadastro; login em `/sessions` com JWT (`role` no payload, `subject` = id do usuário).

---

## Passo 1 — Inicializar o projeto

- `npm init` e `"type": "module"` no `package.json` se quiser ESM.
- Dependências típicas deste repo:
  - **Runtime:** `express`, `express-async-errors`, `zod`, `dotenv`, `bcrypt`, `jsonwebtoken`, `@prisma/client`, `pg`, `@prisma/adapter-pg`
  - **Dev:** `typescript`, `tsx`, `@types/node`, `@types/express`, `@types/bcrypt`, `@types/jsonwebtoken`, `prisma`

**Script (`package.json`):**

```json
"scripts": {
  "dev": "tsx watch --env-file .env src/server.ts"
}
```

**Checklist**

- [ ] `node_modules`, `.env` e `src/generated/prisma` no `.gitignore`.
- [ ] `.env-example` com todas as chaves necessárias (sem segredos reais).

---

## Passo 2 — TypeScript e paths (`@/`)

`tsconfig.json` com `strict`, alvo moderno e:

```json
"paths": {
  "@/*": ["./src/*"]
}
```

**Checklist**

- [ ] Pastas sob `src/`: `controllers`, `routes`, `middlewares`, `utils`, `database`, `configs`, etc.

---

## Passo 3 — Express: `app` e `server`

- **`src/app.ts`:** `express.json()` → **rotas** → **`errorHandling`** (4 argumentos).
- **`src/server.ts`:** importa `env` de `./env`, usa `env.PORT`, chama `app.listen`.

**Ordem obrigatória no `app.ts`**

1. `app.use(express.json())`
2. `app.use(routes)`
3. `app.use(errorHandling)`

**Checklist**

- [ ] `import 'express-async-errors'` no topo do `app.ts`.

---

## Passo 4 — Erros: `AppError` + handler central

- **`src/utils/AppError.ts`:** `message` + `statusCode`.
- **`src/middlewares/errorHandling.ts`:** `AppError` → status customizado; `ZodError` → **400** + `issues`; demais → **500**.

**TypeScript + Express**

- `Request` e `Response` importados de **`express`** (evita colisão com tipos do DOM).

**Zod 4**

- Se validação cair sempre em **500**, `.parse()` pode lançar instância que não passa só em `instanceof ZodError`; trate também **`ZodRealError`** ou `name === 'ZodError'` + `issues`.

**Checklist**

- [ ] Handler sempre **depois** das rotas.

---

## Passo 5 — Rotas e controllers

- **`src/routes/index.ts`:** `use('/users', …)`, `use('/sessions', …)`.
- Controllers: Zod no body, Prisma no banco, `AppError` para regras de negócio.

**Checklist**

- [ ] `app.use(routes)` no `app.ts`.
- [ ] Handlers `async` propagam erro (com `express-async-errors`).

---

## Passo 6 — Variáveis de ambiente

- **Validação central** em `src/env.ts` com Zod (`PORT`, `DATABASE_URL`, `JWT_SECRET`).
- `.env` local + `.env-example` para documentar.
- Configs (ex.: `src/configs/auth.ts`) leem valores já validados via `env`.

**Checklist**

- [ ] Nunca commitar segredos.
- [ ] Garantir que o processo de dev carrega `.env` (`tsx --env-file .env`) antes de importar módulos que chamam `envSchema.parse(process.env)`.

---

## Passo 7 — Docker (Postgres)

`docker-compose.yml` com Postgres (porta `5432`, usuário/senha/banco alinhados à URL).

```text
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/nome_do_banco?schema=public
```

**Checklist**

- [ ] `docker compose up -d` antes de `prisma migrate`.

---

## Passo 8 — Prisma (schema, migrate, generate)

1. `npx prisma init` (ou equivalente na versão atual).
2. Ajustar `prisma/schema.prisma`.
3. `npx prisma migrate dev --name descricao`
4. `npx prisma generate`

**Neste repositório**

- Output do client: `src/generated/prisma`.
- `prisma.config.ts`: schema, migrations, `datasource.url` com `process.env.DATABASE_URL`.
- `PrismaClient` com `PrismaPg` + `log` nas opções do **client**, não do adapter.

**Checklist**

- [ ] `prisma generate` no CI ou após `npm install` se o client não for versionado.

---

## Passo 9 — Senhas (`bcrypt`)

- Cadastro: validar → checar e-mail → `hash` → `create`.
- Respostas **sem** campo `password`.

---

## Passo 10 — Autenticação (JWT + sessão)

- **`jsonwebtoken` em ESM:** `import jwt from 'jsonwebtoken'`; `jwt.sign(...)`.
- Tipos: `import type { SignOptions } from 'jsonwebtoken'`.
- **POST `/sessions`:** compara senha com `bcrypt.compare`, assina JWT com `secret` e `expiresIn` da config, retorna `token` + dados do usuário sem senha.

---

## Passo 11 — Git (sugestão)

- Branches `feat/...`, `fix/...`.
- Conventional Commits: `feat(users):`, `feat(auth):`, `feat(prisma):`, etc.
- Manter **schema + migrations** coerentes na branch principal.

---

## Checklist final

- [ ] `npm run dev` sobe sem erro (com `.env` completo).
- [ ] `GET /users` ou fluxo mínimo responde.
- [ ] Erro de validação Zod → **400** + `issues`.
- [ ] `AppError` → status esperado.
- [ ] Postgres + migrations + `prisma generate`.
- [ ] Cadastro e login não expõem senha/hash indevidos.

---

## Referência rápida de arquivos

| Área | Arquivos principais |
|------|---------------------|
| Entrada | `src/server.ts`, `src/app.ts` |
| Env | `src/env.ts` |
| Auth / JWT | `src/configs/auth.ts`, `src/controllers/SessionController.ts` |
| Rotas | `src/routes/index.ts`, `src/routes/usersRoutes.ts`, `src/routes/sessionRoutes.ts` |
| Controllers | `src/controllers/UsersController.ts`, `src/controllers/SessionController.ts` |
| Erros | `src/middlewares/errorHandling.ts`, `src/utils/AppError.ts` |
| Banco | `prisma/schema.prisma`, `prisma.config.ts`, `src/database/prisma.ts` |
| Ambiente | `.env`, `.env-example` |
| Docker | `docker-compose.yml` |
