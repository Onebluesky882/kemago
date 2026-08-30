import { OpenAPIHono } from '@hono/zod-openapi'
import { Scalar } from '@scalar/hono-api-reference'

// Add documented endpoints here as the API grows, e.g.:
//
// import { z } from '@hono/zod-openapi'
// import { createRoute } from '@hono/zod-openapi'
//
// docs.openapi(
//   createRoute({
//     method: 'get',
//     path: '/example',
//     tags: ['Example'],
//     responses: {
//       200: {
//         description: 'Example response',
//         content: { 'application/json': { schema: z.object({ ok: z.boolean() }) } },
//       },
//     },
//   }),
//   (c) => c.json({ ok: true })
// )

const docs = new OpenAPIHono()

docs.doc('/openapi.json', {
  openapi: '3.1.0',
  info: {
    title: 'Kemago API Docs',
    version: '0.0.1',
  },
})

docs.get('/', Scalar({ url: '/docs/openapi.json' }))

export { docs }
