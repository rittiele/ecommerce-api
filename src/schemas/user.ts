import { z } from 'zod'

export const createUserBodySchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  password: z.string().min(6),
})

export const userResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.email(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
