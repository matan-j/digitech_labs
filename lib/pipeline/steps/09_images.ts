import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { CourseBrief } from '../../types';
import { readFile, writeFile, writeFileBinary, getCourseDir } from '../../fileSystem';
import fs from 'fs/promises';

interface SlidePrompt {
  slideNum: number;
  prompt: string;
}

function parseImagePrompts(md: string): SlidePrompt[] {
  const results: SlidePrompt[] = [];
  // Match "### SLIDE N" blocks and extract the "Image prompt:" line
  const blockRegex = /###\s+SLIDE\s+(\d+)[^\n]*\n([\s\S]*?)(?=###\s+SLIDE\s+\d+|$)/gi;
  let match;
  while ((match = blockRegex.exec(md)) !== null) {
    const slideNum = parseInt(match[1], 10);
    const block = match[2];
    const promptMatch = block.match(/\*\*Image\s+prompt:\*\*\s*\n([^\n*]+(?:\n[^\n*#]+)*)/i);
    if (promptMatch) {
      const prompt = promptMatch[1].trim().replace(/\n/g, ' ');
      if (prompt) results.push({ slideNum, prompt });
    }
  }
  return results;
}

export async function runImages(brief: CourseBrief): Promise<string[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('[Images] GEMINI_API_KEY not set — skipping image generation');
    return [];
  }

  const ai = new GoogleGenAI({ apiKey });

  const [promptsMd, presentationHtml] = await Promise.all([
    readFile(brief.slug, 'Slides/Image_Prompts.md'),
    readFile(brief.slug, 'Slides/presentation.html'),
  ]);

  const slides = parseImagePrompts(promptsMd);
  if (slides.length === 0) return [];

  // Ensure images dir
  const imagesDir = path.join(getCourseDir(brief.slug), 'Slides', 'images');
  await fs.mkdir(imagesDir, { recursive: true });

  const written: string[] = [];

  await Promise.all(
    slides.map(async ({ slideNum, prompt }) => {
      try {
        const response = await ai.models.generateImages({
          model: 'imagen-3.0-generate-001',
          prompt,
          config: { numberOfImages: 1, aspectRatio: '16:9' },
        });

        const imageData = response.generatedImages?.[0]?.image?.imageBytes;
        if (!imageData) return;

        const relativePath = `Slides/images/slide-${slideNum}.png`;
        const buffer = Buffer.from(imageData, 'base64');
        await writeFileBinary(brief.slug, relativePath, buffer);
        written.push(relativePath);
      } catch (err) {
        console.warn(`[Images] Slide ${slideNum} failed:`, err instanceof Error ? err.message : err);
      }
    })
  );

  // Inject <img> tags into presentation.html
  if (written.length > 0) {
    let html = presentationHtml;
    for (const { slideNum } of slides) {
      const imgTag = `<img src="images/slide-${slideNum}.png" alt="Slide ${slideNum}" class="r-stretch" style="object-fit:cover;width:100%;height:100%;" />`;
      html = html.replace(`<!-- IMAGE_SLIDE_${slideNum} -->`, imgTag);
    }
    await writeFile(brief.slug, 'Slides/presentation.html', html);
  }

  return written;
}
