/**
 * Pre-flight check for service dependencies.
 * Called before taking payment to ensure we can actually deliver.
 */

import Anthropic from '@anthropic-ai/sdk';

/**
 * Verify the Anthropic API key is valid and has credits.
 * Sends a minimal 1-token request to check connectivity.
 * Returns { ok: true } or { ok: false, reason: string }
 */
export async function checkAnthropicHealth(): Promise<{ ok: boolean; reason?: string }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { ok: false, reason: 'AI service not configured. Please contact support.' };
  }

  try {
    const client = new Anthropic({ apiKey });
    await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1,
      messages: [{ role: 'user', content: 'hi' }],
    });
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (message.includes('credit balance is too low') || message.includes('billing')) {
      return { ok: false, reason: 'Our AI service is temporarily unavailable. Please try again later or contact support.' };
    }
    if (message.includes('authentication') || message.includes('api_key')) {
      return { ok: false, reason: 'AI service configuration error. Please contact support.' };
    }
    if (message.includes('overloaded') || message.includes('rate_limit')) {
      return { ok: false, reason: 'Our AI service is experiencing high demand. Please try again in a few minutes.' };
    }

    console.error('Anthropic health check failed:', message);
    return { ok: false, reason: 'Service temporarily unavailable. Please try again shortly.' };
  }
}
