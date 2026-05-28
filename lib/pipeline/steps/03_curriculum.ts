import { CourseBrief } from '../../types';
import { writeFile } from '../../fileSystem';
import { generateContent, parseFileBlocks } from '../../claude';
import {
  getCurriculumSystemPrompt,
  getCurriculumUserPromptPart1,
  getCurriculumUserPromptPart2,
  getCurriculumUserPromptPart3,
  getCurriculumUserPromptPart4,
  getCurriculumUserPromptPart5,
} from '../prompts/curriculum';

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

export async function runCurriculum(brief: CourseBrief): Promise<string[]> {
  const sys = getCurriculumSystemPrompt();

  // All parts run in parallel — cuts time from sum to max(single part)
  const [part1, part2, part3, part4, part5] = await Promise.all([
    runPart(sys, getCurriculumUserPromptPart1(brief), brief.slug, 'Curriculum/OnePager_Product.md'),
    runPart(sys, getCurriculumUserPromptPart2(brief), brief.slug, 'Curriculum/Lesson_Plans.md'),
    runPart(sys, getCurriculumUserPromptPart3(brief), brief.slug, 'Curriculum/Lesson_Plans_Part2.md'),
    runPart(sys, getCurriculumUserPromptPart4(brief), brief.slug, 'Curriculum/Lesson_Plans_Part3.md'),
    runPart(sys, getCurriculumUserPromptPart5(brief), brief.slug, 'Curriculum/Worksheets.md'),
  ]);

  return [...part1, ...part2, ...part3, ...part4, ...part5];
}
