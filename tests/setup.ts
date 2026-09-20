import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const envPath = resolve(process.cwd(), '.env')

try {
  const content = readFileSync(envPath, 'utf8')

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim()

    if (!trimmed || trimmed.startsWith('#')) {
      continue
    }

    const separator = trimmed.indexOf('=')

    if (separator === -1) {
      continue
    }

    const key = trimmed.slice(0, separator).trim()
    const value = trimmed.slice(separator + 1).trim().replace(/^"|"$/g, '')

    if (!process.env[key]) {
      process.env[key] = value
    }
  }
} catch {
  // Tests can still run if JWT_SECRET and DATABASE_URL are provided by the environment.
}

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test-only-secret-not-for-production'
}
