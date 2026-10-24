/**
 * Zero-dependency native HTTP client for Anthropic Claude API
 * Works in Next.js Turbopack without requiring external SDK installs.
 */
export async function callAnthropic({
  system,
  messages,
  max_tokens = 2000,
}: {
  system: string
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
  max_tokens?: number
}): Promise<string | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey || apiKey.trim().length === 0) {
    return null
  }

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey.trim(),
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens,
        system,
        messages,
      }),
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.warn('Anthropic API returned status:', res.status, errorText)
      return null
    }

    const data = await res.json()
    return data.content?.[0]?.text || null
  } catch (err) {
    console.warn('Failed to connect to Anthropic API:', err)
    return null
  }
}
