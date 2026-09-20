import { z } from 'zod'

export const loginBodySchema = z.object({
  email: z.email(),
  password: z.string().min(1),
})

export const loginResponseSchema = z.object({
  token: z.string(),
})
