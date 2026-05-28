import { CourseBrief } from '../../types';
import { ensureCourseDir, writeBrief, writeStatus } from '../../fileSystem';

export async function runInit(brief: CourseBrief): Promise<string[]> {
  await ensureCourseDir(brief.slug);
  await writeBrief(brief.slug, brief);
  await writeStatus(brief.slug, {
    title: brief.title,
    slug: brief.slug,
    pipelineStatus: 'running',
    currentStep: 1,
    createdAt: new Date().toISOString(),
    brief,
  });

  return ['Course_Brief.md', 'status.json'];
}
