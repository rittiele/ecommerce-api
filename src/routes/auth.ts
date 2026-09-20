import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { AppError } from '../errors.js'
import { prisma } from '../lib/prisma.js'
import { errorMessageSchema } from '../schemas/common.js'
import { loginBodySchema, loginResponseSchema } from '../schemas/auth.js'
import { comparePassword } from '../utils/password.js'

export async function authRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/auth/login',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Login',
        body: loginBodySchema,
        response: {
          200: loginResponseSchema,
          401: errorMessageSchema,
        },
      },
    },
    async (request) => {
      const { email, password } = request.body

      const user = await prisma.user.findUnique({ where: { email } })

      if (!user || !(await comparePassword(password, user.password))) {
        throw new AppError(401, 'Invalid credentials')
      }

      const token = app.jwt.sign({
        sub: user.id,
        email: user.email,
      })

      return { token }
    },
  )
}
