import { CourseBrief } from '../../types';
import { writeFile } from '../../fileSystem';
import { generateContent, parseFileBlocks } from '../../claude';
import {
  getMarketingSystemPrompt,
  getMarketingUserPromptPart1,
  getMarketingUserPromptPart2,
} from '../prompts/marketing';

async function runPart(
  systemPrompt: string,
  userPrompt: string,
  slug: string,
  fallbackFile: string,
): Promise<string[]> {
  const text = await generateContent(systemPrompt, userPrompt);
  const files = parseFileBlocks(text);
  const written: string[] = [];

  for (const [filename, content] of Object.entries(files)) {
    await writeFile(slug, filename, content);
    written.push(filename);
  }

  if (written.length === 0) {
    await writeFile(slug, fallbackFile, text);
    written.push(fallbackFile);
  }

  return written;
}

export async function runMarketing(brief: CourseBrief): Promise<string[]> {
  const sys = getMarketingSystemPrompt();

  const [part1, part2] = await Promise.all([
    runPart(sys, getMarketingUserPromptPart1(brief), brief.slug, 'Marketing/Marketing_OnePager.md'),
    runPart(sys, getMarketingUserPromptPart2(brief), brief.slug, 'Marketing/Video_Script.md'),
  ]);

  return [...part1, ...part2];
}
