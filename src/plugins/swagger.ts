import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import type { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import { jsonSchemaTransform } from 'fastify-type-provider-zod'

async function swaggerPluginImpl(app: FastifyInstance) {
  await app.register(swagger, {
    openapi: {
      info: {
        title: 'E-commerce API',
        description: 'API REST de e-commerce para portfólio.',
        version: '0.1.0',
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
    transform: jsonSchemaTransform,
  })

  await app.register(swaggerUi, {
    routePrefix: '/docs',
  })
}

export const swaggerPlugin = fp(swaggerPluginImpl)
