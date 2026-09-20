# ecommerce-api

API REST de e-commerce em construção, com foco em aprendizado de back-end e portfólio.

**Etapa atual:** configuração inicial do Node.js, TypeScript e Fastify, com um endpoint `GET /health`.

A explicação desta etapa (conceitos, arquitetura e o que cada arquivo faz) está em [docs/etapa-01.md](docs/etapa-01.md).

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

```bash
npm install
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
