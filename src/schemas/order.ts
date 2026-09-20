import { z } from 'zod'

export const createOrderBodySchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1),
})

export const orderItemResponseSchema = z.object({
  id: z.string().uuid(),
  orderId: z.string().uuid(),
  productId: z.string().uuid(),
  quantity: z.number().int(),
  unitPrice: z.number(),
})

export const orderResponseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  total: z.number(),
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED']),
  createdAt: z.date(),
  updatedAt: z.date(),
  items: z.array(orderItemResponseSchema),
})
