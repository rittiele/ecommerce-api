import { Prisma } from '@prisma/client'
import type { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import { ZodError } from 'zod'
import { AppError } from '../errors.js'

async function errorHandlerPluginImpl(app: FastifyInstance) {
  app.setErrorHandler((error, request, reply) => {
    if (error instanceof AppError) {
      return reply.code(error.statusCode).send({ message: error.message })
    }

    if (error instanceof ZodError) {
      return reply.code(400).send({
        message: 'Validation error',
        issues: error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      })
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return reply.code(409).send({ message: 'Resource already exists' })
      }

      if (error.code === 'P2025') {
        return reply.code(404).send({ message: 'Resource not found' })
      }
    }

    request.log.error(error)
    return reply.code(500).send({ message: 'Internal server error' })
  })
}

export const errorHandlerPlugin = fp(errorHandlerPluginImpl)
