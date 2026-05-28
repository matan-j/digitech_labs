import { CourseBrief } from '../../types';
import { readFile, writeFile } from '../../fileSystem';
import { generateContent } from '../../claude';
import { getGameHtmlSystemPrompt, getGameHtmlUserPrompt } from '../prompts/game_html';

export async function runGameHtml(brief: CourseBrief): Promise<string[]> {
  const gameSpec = await readFile(brief.slug, 'Interactive/Game_Spec.md');

  const html = await generateContent(
    getGameHtmlSystemPrompt(),
    getGameHtmlUserPrompt(brief, gameSpec),
  );

  const cleaned = html
    .replace(/^```html\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  await writeFile(brief.slug, 'Interactive/game.html', cleaned);
  return ['Interactive/game.html'];
}
