import jwt from '@fastify/jwt'
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import fp from 'fastify-plugin'
import { getJwtSecret } from '../lib/env.js'

async function jwtPluginImpl(app: FastifyInstance) {
  await app.register(jwt, {
    secret: getJwtSecret(),
  })

  app.decorate(
    'authenticate',
    async function authenticate(request: FastifyRequest, reply: FastifyReply) {
      try {
        await request.jwtVerify()
      } catch {
        return reply.code(401).send({ message: 'Unauthorized' })
      }
    },
  )
}

export const jwtPlugin = fp(jwtPluginImpl)
