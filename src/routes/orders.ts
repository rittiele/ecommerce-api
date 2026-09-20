import type { Prisma } from '@prisma/client'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { AppError } from '../errors.js'
import { prisma } from '../lib/prisma.js'
import { toNumber } from '../lib/serialize.js'
import { errorMessageSchema, idParamSchema } from '../schemas/common.js'
import { createOrderBodySchema, orderResponseSchema } from '../schemas/order.js'

function serializeOrder(order: {
  id: string
  userId: string
  total: { toString(): string } | number
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED'
  createdAt: Date
  updatedAt: Date
  items: Array<{
    id: string
    orderId: string
    productId: string
    quantity: number
    unitPrice: { toString(): string } | number
  }>
}) {
  return {
    ...order,
    total: toNumber(order.total),
    items: order.items.map((item) => ({
      ...item,
      unitPrice: toNumber(item.unitPrice),
    })),
  }
}

export async function orderRoutes(app: FastifyInstance) {
  const typed = app.withTypeProvider<ZodTypeProvider>()

  typed.post(
    '/orders',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['Orders'],
        summary: 'Create order',
        security: [{ bearerAuth: [] }],
        body: createOrderBodySchema,
        response: {
          201: orderResponseSchema,
          400: errorMessageSchema,
          401: errorMessageSchema,
        },
      },
    },
    async (request, reply) => {
      const userId = request.user.sub
      const { items } = request.body
      const productIds = items.map((item) => item.productId)

      const order = await prisma.$transaction(async (tx) => {
        const products = await tx.product.findMany({
          where: { id: { in: productIds } },
        })

        if (products.length !== new Set(productIds).size) {
          throw new AppError(400, 'One or more products were not found')
        }

        const lines: Prisma.OrderItemCreateWithoutOrderInput[] = []
        let total = 0

        for (const item of items) {
          const product = products.find((entry) => entry.id === item.productId)

          if (!product) {
            throw new AppError(400, 'One or more products were not found')
          }

          if (product.stock < item.quantity) {
            throw new AppError(400, 'Insufficient stock')
          }

          const unitPrice = toNumber(product.price)
          total += unitPrice * item.quantity
          lines.push({
            product: { connect: { id: item.productId } },
            quantity: item.quantity,
            unitPrice,
          })
        }

        const created = await tx.order.create({
          data: {
            userId,
            total,
            items: { create: lines },
          },
          include: { items: true },
        })

        for (const item of items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          })
        }

        return created
      })

      return reply.code(201).send(serializeOrder(order))
    },
  )

  typed.get(
    '/orders',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['Orders'],
        summary: 'List my orders',
        security: [{ bearerAuth: [] }],
        response: {
          200: z.array(orderResponseSchema),
          401: errorMessageSchema,
        },
      },
    },
    async (request) => {
      const orders = await prisma.order.findMany({
        where: { userId: request.user.sub },
        include: { items: true },
        orderBy: { createdAt: 'desc' },
      })

      return orders.map(serializeOrder)
    },
  )

  typed.get(
    '/orders/:id',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['Orders'],
        summary: 'Get my order',
        security: [{ bearerAuth: [] }],
        params: idParamSchema,
        response: {
          200: orderResponseSchema,
          401: errorMessageSchema,
          404: errorMessageSchema,
        },
      },
    },
    async (request) => {
      const order = await prisma.order.findFirst({
        where: {
          id: request.params.id,
          userId: request.user.sub,
        },
        include: { items: true },
      })

      if (!order) {
        throw new AppError(404, 'Order not found')
      }

      return serializeOrder(order)
    },
  )
}
