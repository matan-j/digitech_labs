import { CourseBrief } from '../../types';
import { writeFile } from '../../fileSystem';
import { generateContent, parseFileBlocks } from '../../claude';
import {
  getSlidesSystemPrompt,
  getSlidesUserPromptPart1,
  getSlidesUserPromptPart2,
} from '../prompts/slides';

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

export async function runSlides(brief: CourseBrief): Promise<string[]> {
  const sys = getSlidesSystemPrompt();

  const [part1, part2] = await Promise.all([
    runPart(sys, getSlidesUserPromptPart1(brief), brief.slug, 'Slides/Slide_Deck_Spec.md'),
    runPart(sys, getSlidesUserPromptPart2(brief), brief.slug, 'Slides/Visual_Assets_Brief.md'),
  ]);

  return [...part1, ...part2];
}
