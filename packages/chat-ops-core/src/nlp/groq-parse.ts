export interface ParseTextToJSONOptions {
  apiKey: string
  systemPrompt: string
  userText: string
  model?: string
  maxTokens?: number
  temperature?: number
  /** Sent as User-Agent — Groq's edge has been observed 403-ing requests with
   * none, and the Workers `fetch` doesn't send a default one. */
  userAgent?: string
}

/**
 * Send free text to Groq's chat-completions API with a system prompt that
 * asks for a JSON object back, and extract + parse that JSON. Domain-specific
 * validation or defaulting of the parsed shape is the caller's job — this
 * only takes you from "free text" to "some parsed JSON value", nothing more.
 */
export async function parseTextToJSON(opts: ParseTextToJSONOptions): Promise<unknown> {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${opts.apiKey}`,
      'User-Agent': opts.userAgent ?? 'chat-ops-core/1.0',
    },
    body: JSON.stringify({
      model: opts.model ?? 'llama-3.1-8b-instant',
      max_tokens: opts.maxTokens ?? 400,
      temperature: opts.temperature ?? 0.2,
      messages: [
        { role: 'system', content: opts.systemPrompt },
        { role: 'user', content: opts.userText },
      ],
    }),
  })

  if (!res.ok) {
    const errBody = await res.text().catch(() => '')
    throw new Error(`Groq API error: ${res.status} ${errBody.slice(0, 300)}`)
  }

  const data = (await res.json()) as { choices: Array<{ message: { content: string } }> }
  const text = data.choices[0]?.message?.content ?? '{}'
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Groq returned no JSON')
  return JSON.parse(jsonMatch[0])
}
