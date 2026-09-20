import { z } from 'zod'

export const createProductBodySchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().positive(),
  stock: z.number().int().min(0),
})

export const updateProductBodySchema = createProductBodySchema.partial()

export const productResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  stock: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
