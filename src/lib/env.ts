export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET

  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required')
  }

  return secret
}

export function getPort(): number {
  return Number(process.env.PORT) || 3333
}

export function getHost(): string {
  return process.env.HOST ?? '127.0.0.1'
}
