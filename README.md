# ecommerce-api

API REST de e-commerce construída para estudo de back-end e portfólio.

Permite cadastrar usuários, autenticar com JWT, gerenciar produtos e criar pedidos com controle de estoque.

## Objetivo

Demonstrar, em um projeto real, o fluxo completo de uma API: modelagem com Prisma, autenticação, validação, documentação OpenAPI, testes e execução com Docker.

## Stack

- Node.js
- TypeScript
- Fastify
- PostgreSQL
- Prisma 6
- bcrypt
- JWT
- Zod
- Swagger/OpenAPI
- Vitest
- Docker

## Arquitetura

```text
Cliente HTTP / Swagger
        │
        ▼
   server.ts          sobe o processo
        │
        ▼
   app.ts             Fastify, plugins e rotas
        │
        ├── routes/   health, users, auth, products, orders
        ├── plugins/  JWT, Swagger, erros
        ├── schemas/  validação Zod
        └── lib/      Prisma e helpers
```

## Funcionalidades

- Cadastro de usuário com senha em hash (bcrypt)
- Login com JWT
- CRUD de produtos (escrita autenticada)
- Pedidos autenticados, com estoque e total calculados no backend
- Documentação interativa no Swagger
- Testes de integração dos fluxos principais

## Endpoints

| Método | Rota | Auth |
| --- | --- | --- |
| GET | `/health` | pública |
| POST | `/users` | pública |
| POST | `/auth/login` | pública |
| GET | `/products` | pública |
| GET | `/products/:id` | pública |
| POST | `/products` | JWT |
| PUT | `/products/:id` | JWT |
| DELETE | `/products/:id` | JWT |
| POST | `/orders` | JWT |
| GET | `/orders` | JWT (somente os seus) |
| GET | `/orders/:id` | JWT (somente os seus) |

Swagger UI: `http://127.0.0.1:3333/docs`

## Autenticação

1. `POST /users` para cadastrar.
2. `POST /auth/login` para receber `{ "token": "..." }`.
3. Nas rotas privadas, envie `Authorization: Bearer <token>`.

No Swagger, use **Authorize** e cole o token.

## Banco e Prisma

- PostgreSQL 17
- Models: `User`, `Product`, `Order`, `OrderItem`
- Migrations em `prisma/migrations`
- Senha nunca é retornada nas respostas; o banco guarda apenas o hash

## Como executar localmente

Requer Node.js 20+ e PostgreSQL com o banco `ecommerce_api`.

```bash
npm install
cp .env.example .env
```

No Windows, copie `.env.example` para `.env` e edite.

Configure:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/ecommerce_api?schema=public"
JWT_SECRET="uma-string-local-qualquer"
PORT=3333
HOST=127.0.0.1
```

Não commite o `.env`. Não use senha real em arquivos versionados.

```bash
npx prisma generate
npx prisma migrate deploy
npm run dev
```

Health check:

```bash
curl http://127.0.0.1:3333/health
```

## Testes

```bash
npm test
```

## Docker

Sobe a API e um PostgreSQL isolado. A porta `5433` no host evita conflito com um Postgres local na `5432`.

```bash
docker compose up --build
```

API: `http://127.0.0.1:3333`  
Swagger: `http://127.0.0.1:3333/docs`

## Exemplo de uso

```bash
curl -X POST http://127.0.0.1:3333/users \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Ritti\",\"email\":\"ritti@email.com\",\"password\":\"senha123\"}"

curl -X POST http://127.0.0.1:3333/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"ritti@email.com\",\"password\":\"senha123\"}"
```

Use o `token` retornado nas rotas de produtos e pedidos.

## Licença

Uso pessoal / portfólio.
