import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { AppError } from '../errors.js'
import { prisma } from '../lib/prisma.js'
import { errorMessageSchema } from '../schemas/common.js'
import { createUserBodySchema, userResponseSchema } from '../schemas/user.js'
import { hashPassword } from '../utils/password.js'

export async function userRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/users',
    {
      schema: {
        tags: ['Users'],
        summary: 'Create user',
        body: createUserBodySchema,
        response: {
          201: userResponseSchema,
          409: errorMessageSchema,
        },
      },
    },
    async (request, reply) => {
      const { name, email, password } = request.body

      const existing = await prisma.user.findUnique({ where: { email } })

      if (existing) {
        throw new AppError(409, 'Email already in use')
      }

      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: await hashPassword(password),
        },
      })

      return reply.code(201).send({
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })
    },
  )
}
