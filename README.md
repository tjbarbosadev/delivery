# delivery

API de delivery de encomendas em **Node.js**, **TypeScript**, **Express**, **Prisma** e **PostgreSQL**.

Abaixo: guia passo a passo para replicar (ou lembrar) a montagem deste boilerplate, alinhado ao histórico do repositório e à estrutura atual.

---

## Visão geral do que foi construído (ordem lógica)

1. Projeto Node com TypeScript, ESM (`"type": "module"`) e script de desenvolvimento com `tsx`.
2. Express com JSON parser, rotas agrupadas em um `Router` e **middleware de erro por último**.
3. Erros de domínio (`AppError`) + erros de validação (Zod) no mesmo handler.
4. Variáveis de ambiente com `.env` (não versionado) e exemplo em `.env-example`.
5. Rotas e controllers (ex.: usuários).
6. Docker Compose só com Postgres (Bitnami), alinhado à `DATABASE_URL`.
7. Prisma 7: schema, migrations, client gerado em pasta custom (`src/generated/prisma`), adapter `pg`.
8. Segurança básica: hash de senha com `bcrypt` antes de persistir.
9. Evolução da API: sessões, mais rotas, etc. (seguir o mesmo padrão router → controller).

---

## Passo 1 — Inicializar o projeto

- Crie a pasta do projeto e `npm init`.
- Defina `"type": "module"` no `package.json` se quiser **ESM** (import/export nativo).
- Instale dependências de runtime e desenvolvimento, por exemplo:
  - **Runtime:** `express`, `express-async-errors`, `zod`, `dotenv` (e depois `bcrypt`, `@prisma/client`, `pg`, `@prisma/adapter-pg` quando for o caso).
  - **Dev:** `typescript`, `tsx`, `@types/node`, `@types/express`, `prisma`.

**Script sugerido (`package.json`):**

```json
"scripts": {
  "dev": "tsx watch --env-file .env src/server.ts"
}
```

- `tsx watch` recarrega ao salvar arquivos.
- `--env-file .env` carrega variáveis sem precisar de `import 'dotenv/config'` no código (opcional; pode combinar com dotenv se preferir).

**Checklist**

- [ ] `node_modules` e `.env` no `.gitignore`.
- [ ] Arquivo de exemplo `.env-example` com chaves sem valores secretos (`PORT`, `DATABASE_URL`).

---

## Passo 2 — TypeScript e paths (`@/`)

- Crie `tsconfig.json` com `strict`, alvo moderno (ex.: `es2022`) e **paths**:

```json
"paths": {
  "@/*": ["./src/*"]
}
```

- O `tsx` costuma respeitar esses paths em dev; em build para produção pode ser necessário outro empacotador ou `tsc` com resolução alinhada.

**Checklist**

- [ ] Pastas sob `src/` organizadas: `controllers`, `routes`, `middlewares`, `utils`, `database`, etc.

---

## Passo 3 — Express: `app` e `server`

- **`src/app.ts`:** cria o `express()`, usa `express.json()`, registra **rotas**, e por último o **middleware de erro** (4 parâmetros).
- **`src/server.ts`:** importa `app`, lê `process.env.PORT`, chama `app.listen`.

**Ordem obrigatória no `app.ts`**

1. `app.use(express.json())`
2. `app.use(routes)` — todas as rotas da API
3. `app.use(errorHandling)` — **sempre depois das rotas**

**Por quê?** No Express, o handler de erro só entra na cadeia quando `next(err)` é chamado (ou erro capturado). Se ele estiver **antes** das rotas, erros das rotas podem não passar pelo seu JSON e virar 500 genérico.

**Checklist**

- [ ] Importar `express-async-errors` **uma vez** no topo do `app.ts` (antes das rotas), para `async` em controllers propagarem erro ao handler.

---

## Passo 4 — Erros: `AppError` + handler central

- **`src/utils/AppError.ts`:** classe simples com `message` e `statusCode` (padrão 400).
- **`src/middlewares/errorHandling.ts`:** função `(err, req, res, next)` que:
  - Se `AppError` → responde com o `statusCode` e corpo JSON coerente.
  - Se erro de validação Zod → **400** e lista de `issues` (ou formato que você padronizar).
  - Caso contrário → **500** e mensagem genérica (não vazar detalhes sensíveis em produção).

**TypeScript + Express**

- Tipar `res` com `Response` e `req` com `Request` importados de **`express`**, não do tipo global do DOM (`Response` do browser tem `status` como número, não método — causa *“not callable”*).

**Zod 4 — armadilha comum**

- Em versões recentes do Zod, `.parse()` pode lançar um erro cuja cadeia de `instanceof` não bate só com `ZodError`. Se validação cair sempre em 500, trate também `ZodRealError` (exportado pelo pacote `zod`) ou use checagem por `name === 'ZodError'` + `issues`, conforme a versão.

**Checklist**

- [ ] Handler sempre último no `app.ts`.
- [ ] `AppError` usado nos controllers com `throw new AppError('...', código)`.

---

## Passo 5 — Rotas e controllers

- **`src/routes/index.ts`:** um `Router()` principal que faz `use` dos sub-routers (`/users`, `/sessions`, …).
- **`src/routes/*Routes.ts`:** define métodos HTTP e aponta para métodos do controller.
- **`src/controllers/*Controller.ts`:** regras da requisição; validação com Zod (`schema.parse(req.body)`); chamadas ao banco.

**Checklist**

- [ ] Não esquecer de **montar** o `routes` no `app` (`app.use(routes)`).
- [ ] Para métodos de classe passados como handler (`usersController.create`), use **arrow function** ou `.bind` se precisar de `this` estável (evita bugs raros com `this`).

---

## Passo 6 — Variáveis de ambiente

- `.env` local (gitignored) com `PORT` e `DATABASE_URL`.
- `.env-example` documenta as chaves para quem clonar o repo.

**Checklist**

- [ ] Nunca commitar segredo (senha de banco, JWT secret, etc.).

---

## Passo 7 — Docker (Postgres)

- `docker-compose.yml` com serviço `postgres`, porta `5432`, usuário/senha/banco alinhados à URL da aplicação.

Exemplo de variável (ajuste host se rodar a API fora do Docker):

```text
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/nome_do_banco?schema=public
```

**Checklist**

- [ ] Subir com `docker compose up -d` (ou equivalente) antes de migrar ou rodar a API.

---

## Passo 8 — Prisma (schema, migrate, generate)

1. `npx prisma init` (ou fluxo da versão do Prisma em uso).
2. Ajuste `prisma/schema.prisma`: `generator`, `datasource` (Postgres), modelos.
3. Com `DATABASE_URL` válida: `npx prisma migrate dev --name descricao`.
4. Gere o client: `npx prisma generate`.

**Neste repositório**

- Client gerado em `src/generated/prisma` (definido no `generator` do schema).
- `prisma.config.ts` referencia schema, pasta de migrations e `datasource.url` via `process.env.DATABASE_URL`.
- `.gitignore` inclui `/src/generated/prisma` — cada dev/CI roda `prisma generate` após instalar dependências.

**Uso com driver adapter (Prisma 7)**

- Instância típica: `PrismaPg` com `connectionString` + `new PrismaClient({ adapter, log: [...] })`.
- Opção `log` fica no **`PrismaClient`**, não no construtor do adapter.

**Checklist**

- [ ] Migrations versionadas em `prisma/migrations`.
- [ ] CI ou script `postinstall` com `prisma generate` se o client não for commitado.

---

## Passo 9 — Senhas (`bcrypt`)

- No fluxo de criação de usuário: validar corpo → verificar duplicidade (e-mail, etc.) → `hash(senha, custo)` → `create` no banco.
- Na resposta, **não** devolver o campo `password` (desestruturar e omitir).

**Checklist**

- [ ] Custo do bcrypt documentado (ex.: `10`) e revisado para produção.

---

## Passo 10 — Fluxo de trabalho Git (sugestão)

- Branches por feature: `feat/...`, `fix/...`.
- Commits no estilo Conventional Commits: `feat(users): ...`, `feat(prisma): ...`, `chore: ...`.
- PRs com merge ou squash conforme política do time; o importante é **schema + migrations** sempre coerentes na `main`.

---

## Checklist final antes de chamar de “boilerplate pronto”

- [ ] `npm run dev` sobe sem erro.
- [ ] Rota de health ou rota simples responde 200.
- [ ] Erro Zod → 400 com payload de validação.
- [ ] `AppError` → status esperado (400, 404, …).
- [ ] Postgres sobe; `prisma migrate` aplicado; `prisma generate` executado.
- [ ] Criação de usuário não expõe hash/senha na resposta.

---

## Referência rápida de arquivos

| Área        | Arquivos principais |
|------------|----------------------|
| Entrada    | `src/server.ts`, `src/app.ts` |
| Rotas      | `src/routes/index.ts`, `src/routes/*Routes.ts` |
| Controllers | `src/controllers/*Controller.ts` |
| Erros      | `src/middlewares/errorHandling.ts`, `src/utils/AppError.ts` |
| Banco      | `prisma/schema.prisma`, `prisma.config.ts`, `src/database/prisma.ts` |
| Ambiente   | `.env`, `.env-example` |
| Docker     | `docker-compose.yml` |
