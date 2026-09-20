import { z } from 'zod'

export const errorMessageSchema = z.object({
  message: z.string(),
})

export const idParamSchema = z.object({
  id: z.string().uuid(),
})
