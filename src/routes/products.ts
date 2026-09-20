import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { AppError } from '../errors.js'
import { prisma } from '../lib/prisma.js'
import { toNumber } from '../lib/serialize.js'
import { errorMessageSchema, idParamSchema } from '../schemas/common.js'
import {
  createProductBodySchema,
  productResponseSchema,
  updateProductBodySchema,
} from '../schemas/product.js'

function serializeProduct(product: {
  id: string
  name: string
  description: string
  price: { toString(): string } | number
  stock: number
  createdAt: Date
  updatedAt: Date
}) {
  return {
    ...product,
    price: toNumber(product.price),
  }
}

export async function productRoutes(app: FastifyInstance) {
  const typed = app.withTypeProvider<ZodTypeProvider>()

  typed.get(
    '/products',
    {
      schema: {
        tags: ['Products'],
        summary: 'List products',
        response: {
          200: z.array(productResponseSchema),
        },
      },
    },
    async () => {
      const products = await prisma.product.findMany({
        orderBy: { createdAt: 'desc' },
      })

      return products.map(serializeProduct)
    },
  )

  typed.get(
    '/products/:id',
    {
      schema: {
        tags: ['Products'],
        summary: 'Get product',
        params: idParamSchema,
        response: {
          200: productResponseSchema,
          404: errorMessageSchema,
        },
      },
    },
    async (request) => {
      const product = await prisma.product.findUnique({
        where: { id: request.params.id },
      })

      if (!product) {
        throw new AppError(404, 'Product not found')
      }

      return serializeProduct(product)
    },
  )

  typed.post(
    '/products',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['Products'],
        summary: 'Create product',
        security: [{ bearerAuth: [] }],
        body: createProductBodySchema,
        response: {
          201: productResponseSchema,
          401: errorMessageSchema,
        },
      },
    },
    async (request, reply) => {
      const product = await prisma.product.create({
        data: request.body,
      })

      return reply.code(201).send(serializeProduct(product))
    },
  )

  typed.put(
    '/products/:id',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['Products'],
        summary: 'Update product',
        security: [{ bearerAuth: [] }],
        params: idParamSchema,
        body: updateProductBodySchema,
        response: {
          200: productResponseSchema,
          401: errorMessageSchema,
          404: errorMessageSchema,
        },
      },
    },
    async (request) => {
      const existing = await prisma.product.findUnique({
        where: { id: request.params.id },
      })

      if (!existing) {
        throw new AppError(404, 'Product not found')
      }

      const product = await prisma.product.update({
        where: { id: request.params.id },
        data: request.body,
      })

      return serializeProduct(product)
    },
  )

  typed.delete(
    '/products/:id',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['Products'],
        summary: 'Delete product',
        security: [{ bearerAuth: [] }],
        params: idParamSchema,
        response: {
          204: z.null(),
          401: errorMessageSchema,
          404: errorMessageSchema,
        },
      },
    },
    async (request, reply) => {
      const existing = await prisma.product.findUnique({
        where: { id: request.params.id },
      })

      if (!existing) {
        throw new AppError(404, 'Product not found')
      }

      await prisma.product.delete({
        where: { id: request.params.id },
      })

      return reply.code(204).send(null)
    },
  )
}
