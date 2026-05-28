import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Sonnet: fast enough for structured content generation.
// Keep prompts to 1-2 files per call to stay within default SDK timeout.
const MODEL = 'claude-sonnet-4-6';
const MAX_TOKENS = 16000;

export async function generateContent(
  systemPrompt: string,
  userPrompt: string,
  retries = 3,
): Promise<string> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const message = await client.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      });

      const content = message.content[0];
      if (content.type !== 'text') throw new Error('Unexpected response type from Claude');
      return content.text;
    } catch (err: unknown) {
      const isLast = attempt === retries;
      const msg = err instanceof Error ? err.message : String(err);
      const isRetryable = msg.includes('Connection error') || msg.includes('ECONNRESET') || msg.includes('timeout') || msg.includes('503') || msg.includes('529');
      if (isLast || !isRetryable) throw err;
      const delay = attempt * 5000;
      console.warn(`[Claude] Attempt ${attempt} failed (${msg}). Retrying in ${delay / 1000}s...`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw new Error('generateContent: all retries exhausted');
}

export async function generateMultipleFiles(
  systemPrompt: string,
  userPrompt: string,
  fileParser: (text: string) => Record<string, string>,
): Promise<Record<string, string>> {
  const text = await generateContent(systemPrompt, userPrompt);
  return fileParser(text);
}

// Parse a response that contains multiple files delimited by:
// === FILE: filename.md ===
// content
// === END FILE ===
export function parseFileBlocks(text: string): Record<string, string> {
  const files: Record<string, string> = {};

  // Split on === FILE: markers — tolerates ==="FILE: (Claude sometimes adds a quote)
  const blocks = text.split(/===\s*"?FILE:\s*/);

  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i];
    const newlineIdx = block.indexOf('\n');
    if (newlineIdx === -1) continue;

    // Filename is everything before the first newline, strip trailing === and quotes
    const filename = block.substring(0, newlineIdx).replace(/["'\s]*===\s*$/, '').trim();
    // Content is the rest, strip === END FILE === if present
    const content = block.substring(newlineIdx + 1).replace(/\s*===\s*"?END\s*FILE"?\s*===[\s\S]*$/, '').trim();

    if (filename && content) {
      files[filename] = content;
    }
  }

  // Fallback: if no FILE blocks found, return as single file
  if (Object.keys(files).length === 0) {
    files['output.md'] = text.trim();
  }
  return files;
}
