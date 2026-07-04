import { z } from 'zod'

export const notifySchema = z.object({
  channelId: z.string().min(1),
  content: z.string().min(1),
})
