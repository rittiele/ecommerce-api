import type { FastifyInstance } from 'fastify'
import { prisma } from '../src/lib/prisma.js'

export function uniqueEmail(prefix = 'user') {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}@test.com`
}

export async function registerUser(
  app: FastifyInstance,
  data: { name?: string; email?: string; password?: string } = {},
) {
  const payload = {
    name: data.name ?? 'Test User',
    email: data.email ?? uniqueEmail(),
    password: data.password ?? 'senha123',
  }

  const response = await app.inject({
    method: 'POST',
    url: '/users',
    payload,
  })

  return {
    payload,
    response,
    body: response.json(),
  }
}

export async function loginUser(
  app: FastifyInstance,
  credentials: { email: string; password: string },
) {
  const response = await app.inject({
    method: 'POST',
    url: '/auth/login',
    payload: credentials,
  })

  return {
    response,
    body: response.json() as { token?: string; message?: string },
  }
}

export async function authHeader(app: FastifyInstance, email: string, password: string) {
  const { body } = await loginUser(app, { email, password })
  return { authorization: `Bearer ${body.token}` }
}

export async function cleanupTestData(ids: {
  userIds?: string[]
  productIds?: string[]
  orderIds?: string[]
}) {
  if (ids.orderIds?.length) {
    await prisma.orderItem.deleteMany({ where: { orderId: { in: ids.orderIds } } })
    await prisma.order.deleteMany({ where: { id: { in: ids.orderIds } } })
  }

  if (ids.productIds?.length) {
    await prisma.product.deleteMany({ where: { id: { in: ids.productIds } } })
  }

  if (ids.userIds?.length) {
    await prisma.user.deleteMany({ where: { id: { in: ids.userIds } } })
  }
}

export async function closePrisma() {
  await prisma.$disconnect()
}
