import { CourseBrief } from '../../types';
import { writeFile } from '../../fileSystem';
import { generateContent, parseFileBlocks } from '../../claude';
import {
  getInteractiveSystemPrompt,
  getInteractiveUserPromptPart1,
  getInteractiveUserPromptPart2,
} from '../prompts/interactive';

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

export async function runInteractive(brief: CourseBrief): Promise<string[]> {
  const sys = getInteractiveSystemPrompt();

  const [part1, part2] = await Promise.all([
    runPart(sys, getInteractiveUserPromptPart1(brief), brief.slug, 'Interactive/Game_Spec.md'),
    runPart(sys, getInteractiveUserPromptPart2(brief), brief.slug, 'Interactive/Build_Instructions.md'),
  ]);

  return [...part1, ...part2];
}
