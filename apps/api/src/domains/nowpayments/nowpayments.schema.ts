import { z } from 'zod'

export const createInvoiceSchema = z.object({
  priceAmount: z.number().positive(),
  priceCurrency: z.string().min(1),
  payCurrency: z.string().optional(),
  orderId: z.string().optional(),
  orderDescription: z.string().optional(),
  ipnCallbackUrl: z.string().url(),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
})

export const statusParamSchema = z.object({
  paymentId: z.string().min(1),
})
