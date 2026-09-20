import { buildApp } from './app.js'

const PORT = 3333
const HOST = '127.0.0.1'

const app = await buildApp()

try {
  await app.listen({ port: PORT, host: HOST })
} catch (error) {
  app.log.error(error)
  process.exit(1)
}
