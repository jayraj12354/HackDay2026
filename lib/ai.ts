/**
 * Native HTTP client for Google Gemma 4 models via OpenRouter
 * Default model: google/gemma-4-31b-it:free, with automatic paid Gemma 4 fallback
 */

export interface CallGemmaOptions {
  system?: string
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
  max_tokens?: number
  temperature?: number
  model?: string
  json?: boolean
}

export class GemmaError extends Error {
  status: number
  constructor(message: string, status = 502) {
    super(message)
    this.name = 'GemmaError'
    this.status = status
  }
}

function openRouterHeaders(apiKey: string) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    'X-Title': 'GrowFund Community Investing',
  }
}

function assistantText(message: unknown): string | null {
  if (!message || typeof message !== 'object') return null
  const msg = message as Record<string, unknown>

  if (typeof msg.content === 'string' && msg.content.trim().length > 0) {
    return msg.content.trim()
  }

  if (Array.isArray(msg.content)) {
    const joined = msg.content
      .map((part) => {
        if (typeof part === 'string') return part
        if (part && typeof part === 'object' && 'text' in part) {
          return String((part as { text: unknown }).text ?? '')
        }
        return ''
      })
      .join('')
      .trim()
    if (joined.length > 0) return joined
  }

  if (typeof msg.reasoning === 'string' && msg.reasoning.trim().length > 0) {
    const reasoning = msg.reasoning.trim()
    if (reasoning.includes('{') || reasoning.length < 4000) return reasoning
  }

  return null
}

/**
 * Robust JSON extractor for Gemma output.
 * Handles markdown code fences, reasoning tags, and preamble/postscript text.
 */
export function extractJson<T = unknown>(rawText: string): T {
  if (!rawText) throw new Error('Empty response from AI')

  let cleaned = rawText.trim()
  cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/gi, '').trim()
  cleaned = cleaned.replace(/<thought>[\s\S]*?<\/thought>/gi, '').trim()

  if (cleaned.includes('```')) {
    const match = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)
    if (match?.[1]) {
      cleaned = match[1].trim()
    } else {
      cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
    }
  }

  const tryParse = (value: string) => JSON.parse(value.replace(/,\s*([}\]])/g, '$1')) as T

  try {
    return tryParse(cleaned)
  } catch (err) {
    const firstBrace = cleaned.indexOf('{')
    const lastBrace = cleaned.lastIndexOf('}')
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      return tryParse(cleaned.substring(firstBrace, lastBrace + 1))
    }
    throw err
  }
}

async function postChat(
  apiKey: string,
  body: Record<string, unknown>,
  attempt = 0
): Promise<{ status: number; data: Record<string, unknown> }> {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: openRouterHeaders(apiKey),
    body: JSON.stringify(body),
  })

  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>
  const error = data.error as { message?: string; code?: number } | undefined

  if (res.status === 429 && attempt < 2) {
    await new Promise((resolve) => setTimeout(resolve, 1200 * (attempt + 1)))
    return postChat(apiKey, body, attempt + 1)
  }

  return { status: res.status, data: { ...data, _errorMessage: error?.message } }
}

function modelChain(preferred?: string): string[] {
  const primary = preferred || process.env.GEMMA_MODEL || 'google/gemma-4-31b-it:free'
  const paid = primary.replace(/:free$/, '')
  const chain = [primary]
  if (paid !== primary) chain.push(paid)
  if (!chain.includes('google/gemma-4-31b-it')) chain.push('google/gemma-4-31b-it')
  return [...new Set(chain)]
}

function buildMessages(system: string | undefined, messages: CallGemmaOptions['messages']) {
  // Gemma ignores a dedicated system role on some providers; fold instructions into the first user turn.
  if (system && system.trim().length > 0) {
    const [first, ...rest] = messages
    const prefixed =
      first?.role === 'user'
        ? [{ role: 'user' as const, content: `${system.trim()}\n\n---\n\n${first.content}` }, ...rest]
        : [{ role: 'user' as const, content: system.trim() }, ...messages]
    return prefixed
  }
  return messages
}

/**
 * Call Google Gemma 4 via OpenRouter. Throws GemmaError after retries instead of returning null.
 */
export async function callGemma({
  system,
  messages,
  max_tokens = 2500,
  temperature = 0.4,
  model,
  json = false,
}: CallGemmaOptions): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim()
  if (!apiKey) {
    throw new GemmaError(
      'OPENROUTER_API_KEY is missing. Add it to .env.local and restart the dev server.',
      500
    )
  }

  const models = modelChain(model)
  const formattedMessages = buildMessages(system, messages)
  let lastError = 'Gemma did not return a response.'

  for (const chosenModel of models) {
    const requestBody: Record<string, unknown> = {
      model: chosenModel,
      messages: formattedMessages,
      temperature,
      max_tokens,
      reasoning: { effort: 'none' },
    }
    if (json) {
      requestBody.response_format = { type: 'json_object' }
    }

    try {
      console.log(`[Gemma 4] Calling OpenRouter model: ${chosenModel}...`)
      const { status, data } = await postChat(apiKey, requestBody)
      if (status >= 400) {
        lastError = String(data._errorMessage || `OpenRouter returned ${status}`)
        console.warn(`[Gemma 4] ${chosenModel} failed (${status}):`, lastError)
        continue
      }

      const choice = Array.isArray(data.choices) ? (data.choices[0] as Record<string, unknown>) : null
      const content = assistantText(choice?.message)
      if (content) {
        console.log(`[Gemma 4] Response received (${content.length} chars) from ${chosenModel}`)
        return content
      }

      lastError = `Empty completion from ${chosenModel} (finish_reason=${String(choice?.finish_reason || 'unknown')})`
      console.warn(`[Gemma 4] ${lastError}`)
    } catch (err) {
      lastError = err instanceof Error ? err.message : 'Failed to connect to OpenRouter'
      console.warn('[Gemma 4] Request failed:', lastError)
    }
  }

  throw new GemmaError(
    `Could not reach Gemma right now (${lastError}). The free pool is often busy — wait a few seconds and try again.`,
    502
  )
}

export async function callGemmaJson<T>(
  schema: { parse: (value: unknown) => T },
  options: CallGemmaOptions
): Promise<T> {
  const first = await callGemma({ ...options, json: true })
  try {
    return schema.parse(extractJson(first))
  } catch (parseErr) {
    console.warn('[Gemma 4] First JSON parse failed, retrying once:', parseErr)
    const retry = await callGemma({
      ...options,
      json: true,
      temperature: 0.1,
      messages: [
        ...options.messages,
        {
          role: 'user',
          content: `Your previous output was not valid JSON for the required schema. Validation error: ${
            parseErr instanceof Error ? parseErr.message : 'parse failed'
          }\nReturn ONLY a valid JSON object. No markdown.`,
        },
      ],
    })
    return schema.parse(extractJson(retry))
  }
}

export const callAnthropic = callGemma
export const callAI = callGemma
