/**
 * Native HTTP client for Google Gemma 4 models via OpenRouter
 * Default model: google/gemma-4-31b-it:free
 * Provides zero-dependency AI calls that work reliably in Next.js Turbopack / App Router.
 */

export interface AIMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  reasoning_details?: any
}

export interface CallGemmaOptions {
  system?: string
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
  max_tokens?: number
  temperature?: number
  model?: string
  enableReasoning?: boolean
}

/**
 * Robust JSON extractor for Gemma output.
 * Handles markdown code fences (```json ... ```), reasoning tags (<think>...</think>), and preamble/postscript text.
 */
export function extractJson<T = any>(rawText: string): T {
  if (!rawText) throw new Error('Empty response from AI')

  let cleaned = rawText.trim()

  // Remove reasoning / thinking tags if model outputs them
  cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/gi, '').trim()
  cleaned = cleaned.replace(/<thought>[\s\S]*?<\/thought>/gi, '').trim()

  // Strip markdown code fences if present
  if (cleaned.includes('```')) {
    const match = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)
    if (match && match[1]) {
      cleaned = match[1].trim()
    } else {
      cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
    }
  }

  // Try direct parse
  try {
    return JSON.parse(cleaned) as T
  } catch (err) {
    // Find outermost { ... }
    const firstBrace = cleaned.indexOf('{')
    const lastBrace = cleaned.lastIndexOf('}')
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const jsonCandidate = cleaned.substring(firstBrace, lastBrace + 1)
      return JSON.parse(jsonCandidate) as T
    }
    throw err
  }
}

/**
 * Call Google Gemma 4 via OpenRouter API
 */
export async function callGemma({
  system,
  messages,
  max_tokens = 2500,
  temperature = 0.2,
  model,
  enableReasoning = false,
}: CallGemmaOptions): Promise<string | null> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey || apiKey.trim().length === 0) {
    console.warn('[Gemma 4] OPENROUTER_API_KEY is not set or empty in .env.local! Falling back to demo generator.')
    return null
  }

  // Default to Google Gemma 4 (31B instruction-tuned free tier)
  const chosenModel = model || process.env.GEMMA_MODEL || 'google/gemma-4-31b-it:free'

  const formattedMessages: Array<{ role: string; content: string }> = []
  if (system && system.trim().length > 0) {
    formattedMessages.push({ role: 'system', content: system })
  }
  formattedMessages.push(...messages)

  const requestBody: Record<string, any> = {
    model: chosenModel,
    messages: formattedMessages,
    temperature,
    max_tokens,
  }

  if (enableReasoning) {
    requestBody.reasoning = { enabled: true }
  }

  try {
    console.log(`[Gemma 4] Calling OpenRouter model: ${chosenModel}...`)
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey.trim()}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'CafeStake Community Investing',
      },
      body: JSON.stringify(requestBody),
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.warn(`[Gemma 4] OpenRouter returned status ${res.status}:`, errorText)

      // If free tier model rate-limits or is busy, attempt automatic fallback
      if (chosenModel.includes(':free')) {
        const fallbackModel = chosenModel.replace(':free', '')
        console.log(`[Gemma 4] Retrying with non-free model: ${fallbackModel}...`)
        const retryRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey.trim()}`,
            'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
            'X-Title': 'CafeStake Community Investing',
          },
          body: JSON.stringify({
            ...requestBody,
            model: fallbackModel,
          }),
        })

        if (retryRes.ok) {
          const retryData = await retryRes.json()
          const retryContent = retryData.choices?.[0]?.message?.content
          return typeof retryContent === 'string' ? retryContent.trim() : null
        }
      }

      return null
    }

    const data = await res.json()
    const content = data.choices?.[0]?.message?.content
    if (typeof content === 'string' && content.trim().length > 0) {
      console.log(`[Gemma 4] Response received successfully (${content.length} characters)`)
      return content.trim()
    }

    if (data.choices?.[0]?.message?.reasoning) {
      return data.choices[0].message.reasoning.trim()
    }

    return null
  } catch (err) {
    console.warn('[Gemma 4] Failed to connect to OpenRouter:', err)
    return null
  }
}

// Backwards-compatible aliases
export const callAnthropic = callGemma
export const callAI = callGemma
