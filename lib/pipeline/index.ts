import { CourseBrief, PipelineEvent } from '../types';
import { writeStatus, readStatus, readFile } from '../fileSystem';
import { runInit } from './steps/01_init';
import { runResearch } from './steps/02_research';
import { runCurriculum } from './steps/03_curriculum';
import { runSlides } from './steps/04_slides';
import { runInteractive } from './steps/05_interactive';
import { runMarketing } from './steps/06_marketing';
import { runQA } from './steps/07_qa';
import { runHtmlSlides } from './steps/08_html_slides';
import { runImages } from './steps/09_images';
import { runGameHtml } from './steps/10_game_html';
import { runNotebookLM } from './steps/11_notebooklm';

type EventEmitter = (event: PipelineEvent) => void;

const STEPS = [
  { id: 1,  name: 'INIT',        fn: runInit },
  { id: 2,  name: 'RESEARCH',    fn: runResearch },
  { id: 3,  name: 'CURRICULUM',  fn: runCurriculum },
  { id: 4,  name: 'SLIDES',      fn: runSlides },
  { id: 5,  name: 'INTERACTIVE', fn: runInteractive },
  { id: 6,  name: 'MARKETING',   fn: runMarketing },
  { id: 7,  name: 'QA',          fn: runQA },
  { id: 8,  name: 'HTML_SLIDES', fn: runHtmlSlides },
  { id: 9,  name: 'IMAGES',      fn: runImages },
  { id: 10, name: 'GAME_HTML',   fn: runGameHtml },
  { id: 11, name: 'NOTEBOOKLM',  fn: runNotebookLM },
];

// After step 3 (CURRICULUM), wait for approval before continuing visual production
const APPROVAL_AFTER_STEP = 3;
const APPROVAL_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes
const APPROVAL_POLL_MS = 2000;

async function waitForApproval(brief: CourseBrief, emit: EventEmitter): Promise<boolean> {
  // Read OnePager_Product.md as course summary
  let courseSummary = '';
  try {
    courseSummary = await readFile(brief.slug, 'Curriculum/OnePager_Product.md');
  } catch {
    // fallback: emit without summary
  }

  // Write approval_pending into status.json
  const existing = await readStatus(brief.slug) || {};
  await writeStatus(brief.slug, {
    ...existing,
    approvalStatus: 'pending',
  });

  emit({ type: 'approval_required', slug: brief.slug, courseSummary });

  const deadline = Date.now() + APPROVAL_TIMEOUT_MS;

  while (Date.now() < deadline) {
    await new Promise(r => setTimeout(r, APPROVAL_POLL_MS));

    const status = await readStatus(brief.slug);
    if (!status) continue;

    if (status.approvalStatus === 'approved') return true;
    if (status.approvalStatus === 'rejected') return false;
  }

  return false; // timeout = reject
}

export async function runPipeline(brief: CourseBrief, emit: EventEmitter, startFromStep = 1): Promise<void> {
  for (const step of STEPS) {
    if (step.id < startFromStep) {
      emit({ type: 'step_done', stepId: step.id, stepName: step.name });
      continue;
    }

    // Approval gate: after step 3 completes, before step 4 starts
    if (step.id === APPROVAL_AFTER_STEP + 1 && startFromStep <= APPROVAL_AFTER_STEP + 1) {
      const approved = await waitForApproval(brief, emit);
      if (!approved) {
        emit({ type: 'pipeline_error', error: 'הקורס נדחה על ידי המשתמש' });
        return;
      }
    }

    emit({ type: 'step_start', stepId: step.id, stepName: step.name });

    try {
      const files = await step.fn(brief);

      for (const file of files) {
        emit({ type: 'file_created', stepId: step.id, stepName: step.name, file });
      }

      if (step.id < 11) {
        const existing = await readStatus(brief.slug) || {};
        await writeStatus(brief.slug, {
          ...existing,
          currentStep: step.id,
          pipelineStatus: 'running',
        });
      }

      emit({ type: 'step_done', stepId: step.id, stepName: step.name });
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      emit({ type: 'step_error', stepId: step.id, stepName: step.name, error: errMsg });

      const existing = await readStatus(brief.slug) || {};
      await writeStatus(brief.slug, {
        ...existing,
        pipelineStatus: 'error',
        errorStep: step.id,
        errorMessage: errMsg,
      });

      throw error;
    }
  }

  emit({ type: 'pipeline_done', slug: brief.slug });
}
