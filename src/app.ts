import Fastify from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { errorHandlerPlugin } from './plugins/error-handler.js'
import { jwtPlugin } from './plugins/jwt.js'
import { swaggerPlugin } from './plugins/swagger.js'
import { authRoutes } from './routes/auth.js'
import { healthRoutes } from './routes/health.js'
import { orderRoutes } from './routes/orders.js'
import { productRoutes } from './routes/products.js'
import { userRoutes } from './routes/users.js'

type BuildAppOptions = {
  logger?: boolean
}

export async function buildApp(options: BuildAppOptions = {}) {
  const app = Fastify({
    logger: options.logger ?? true,
  }).withTypeProvider<ZodTypeProvider>()

  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)

  await app.register(errorHandlerPlugin)
  await app.register(jwtPlugin)
  await app.register(swaggerPlugin)
  await app.register(healthRoutes)
  await app.register(userRoutes)
  await app.register(authRoutes)
  await app.register(productRoutes)
  await app.register(orderRoutes)

  return app
}
