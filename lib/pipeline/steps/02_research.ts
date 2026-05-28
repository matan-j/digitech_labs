import { CourseBrief } from '../../types';
import { writeFile } from '../../fileSystem';
import { generateContent, parseFileBlocks } from '../../claude';
import {
  getResearchSystemPrompt,
  getResearchUserPromptPart1,
  getResearchUserPromptPart2,
} from '../prompts/research';

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

export async function runResearch(brief: CourseBrief): Promise<string[]> {
  const sys = getResearchSystemPrompt();

  const [part1, part2] = await Promise.all([
    runPart(sys, getResearchUserPromptPart1(brief), brief.slug, 'Research/Research_Brief.md'),
    runPart(sys, getResearchUserPromptPart2(brief), brief.slug, 'Research/Evidence_Snippets.md'),
  ]);

  return [...part1, ...part2];
}
