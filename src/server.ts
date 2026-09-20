import { buildApp } from './app.js'
import { getHost, getPort } from './lib/env.js'

const app = await buildApp()

try {
  await app.listen({ port: getPort(), host: getHost() })
} catch (error) {
  app.log.error(error)
  process.exit(1)
}
