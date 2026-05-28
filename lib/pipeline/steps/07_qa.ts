import { CourseBrief } from '../../types';
import { writeFile, writeStatus, readStatus } from '../../fileSystem';
import { generateContent, parseFileBlocks } from '../../claude';
import {
  getQASystemPrompt,
  getQAUserPromptPart1,
  getQAUserPromptPart2,
} from '../prompts/qa';

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

export async function runQA(brief: CourseBrief): Promise<string[]> {
  const sys = getQASystemPrompt();

  const [part1, part2] = await Promise.all([
    runPart(sys, getQAUserPromptPart1(brief), brief.slug, 'QA/QA_Checklist.md'),
    runPart(sys, getQAUserPromptPart2(brief), brief.slug, 'QA/Final_Checklist.md'),
  ]);

  // Update status based on QA result
  const existing = await readStatus(brief.slug) || {};
  await writeStatus(brief.slug, {
    ...existing,
    pipelineStatus: 'READY_FOR_PILOT',
    completedAt: new Date().toISOString(),
    currentStep: 7,
  });

  return [...part1, ...part2];
}
