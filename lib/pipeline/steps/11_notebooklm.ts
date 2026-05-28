import path from 'path';
import fs from 'fs/promises';
import os from 'os';
import { CourseBrief } from '../../types';
import { writeFile, getCourseDir } from '../../fileSystem';
import { NotebookLMClient } from 'notebooklm-sdk';

export async function runNotebookLM(brief: CourseBrief): Promise<string[]> {
  // Auth: prefer NOTEBOOKLM_COOKIES env var (CI/server), fall back to session file
  const cookies = process.env.NOTEBOOKLM_COOKIES;
  const sessionFile = path.join(os.homedir(), '.notebooklm', 'session.json');

  let sessionExists = false;
  if (!cookies) {
    try {
      await fs.access(sessionFile);
      sessionExists = true;
    } catch {
      // no session file
    }
  }

  if (!cookies && !sessionExists) {
    console.warn('[NotebookLM] No auth found. Run: npx notebooklm-sdk login — skipping');
    return [];
  }

  const researchDir = path.join(getCourseDir(brief.slug), 'Research');

  let entries: string[] = [];
  try {
    entries = await fs.readdir(researchDir);
  } catch {
    console.warn('[NotebookLM] Research dir not found — skipping');
    return [];
  }

  const mdFiles = entries.filter(f => f.endsWith('.md'));
  if (mdFiles.length === 0) return [];

  const sources = await Promise.all(
    mdFiles.map(async f => ({
      title: f.replace('.md', ''),
      text: await fs.readFile(path.join(researchDir, f), 'utf-8'),
    }))
  );

  const connectOpts = cookies ? { cookies } : { cookiesFile: sessionFile };
  const client = await NotebookLMClient.connect(connectOpts);

  const notebook = await client.notebooks.create(brief.title);

  // Add all Research .md files as text sources (sequentially — API rate limit)
  for (const { title, text } of sources) {
    await client.sources.addText(notebook.id, text, title, { waitUntilReady: false });
  }

  // Make notebook public and get share URL
  const { url } = await client.notebooks.share(notebook.id, true);
  const shareUrl = url || client.notebooks.getShareUrl(notebook.id);

  if (shareUrl) {
    await writeFile(brief.slug, 'Research/notebooklm_url.txt', shareUrl);
    return ['Research/notebooklm_url.txt'];
  }

  return [];
}
