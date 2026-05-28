import { CourseBrief } from '../../types';
import { readFile, writeFile } from '../../fileSystem';
import { generateContent } from '../../claude';
import { getHtmlSlidesSystemPrompt, getHtmlSlidesUserPrompt } from '../prompts/html_slides';

export async function runHtmlSlides(brief: CourseBrief): Promise<string[]> {
  const [spec, copy, visualBrief] = await Promise.all([
    readFile(brief.slug, 'Slides/Slide_Deck_Spec.md'),
    readFile(brief.slug, 'Slides/Slide_Copy.md'),
    readFile(brief.slug, 'Slides/Visual_Assets_Brief.md').catch(() => ''),
  ]);

  const html = await generateContent(
    getHtmlSlidesSystemPrompt(),
    getHtmlSlidesUserPrompt(brief, spec, copy, visualBrief),
  );

  const cleaned = html
    .replace(/^```html\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  await writeFile(brief.slug, 'Slides/presentation.html', cleaned);
  return ['Slides/presentation.html'];
}
