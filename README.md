# ecommerce-api

API REST de e-commerce em construção, com foco em aprendizado de back-end e portfólio.

**Etapa atual:** Fastify com `GET /health` e Prisma configurado para PostgreSQL (ainda sem models de negócio).

## Stack planejada

- Node.js
- TypeScript
- Fastify
- PostgreSQL
- Prisma
- JWT
- Swagger/OpenAPI
- Vitest
- Docker

## Como executar

Requer Node.js 20 ou superior.

1. Copie `.env.example` para `.env`.
2. Ajuste `DATABASE_URL` com o usuário, a senha e o banco do seu PostgreSQL local.
3. Instale as dependências e suba o servidor:

```bash
npm install
npm run prisma:generate
npm run dev
```

Em outro terminal:

```bash
curl http://127.0.0.1:3333/health
```

A resposta esperada é:

```json
{
  "status": "ok"
}
```
