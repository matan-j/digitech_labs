export interface CourseBrief {
  title: string;
  slug: string;
  targetAudience: string;
  ageGroup: string;
  duration: string; // e.g. "10 sessions x 90 min"
  goal: string;
  prerequisites: string;
  format: string; // e.g. "workshop", "course", "bootcamp"
  tools: string; // e.g. "ChatGPT, Canva, Google Slides"
  tone: string; // e.g. "practical, hands-on, engaging"
  additionalNotes: string;
}

export type PipelineStatus = 'idle' | 'running' | 'done' | 'error';

export type StepStatus = 'pending' | 'running' | 'done' | 'error';

export interface PipelineStep {
  id: number;
  name: string;
  label: string;
  status: StepStatus;
  files: string[];
  error?: string;
}

export interface PipelineEvent {
  type: 'step_start' | 'step_done' | 'step_error' | 'file_created' | 'pipeline_done' | 'pipeline_error' | 'approval_required';
  stepId?: number;
  stepName?: string;
  file?: string;
  error?: string;
  slug?: string;
  courseSummary?: string;
}

export interface CourseFolder {
  slug: string;
  title: string;
  status: string;
  createdAt: string;
  files: string[];
}

export const PIPELINE_STEPS: Omit<PipelineStep, 'status' | 'files'>[] = [
  { id: 1,  name: 'INIT',        label: 'אתחול פרויקט' },
  { id: 2,  name: 'RESEARCH',    label: 'מחקר ומקורות' },
  { id: 3,  name: 'CURRICULUM',  label: 'תכנית לימודים' },
  { id: 4,  name: 'SLIDES',      label: 'מצגות ותוכן' },
  { id: 5,  name: 'INTERACTIVE', label: 'פעילויות אינטראקטיביות' },
  { id: 6,  name: 'MARKETING',   label: 'חומרי שיווק' },
  { id: 7,  name: 'QA',          label: 'בקרת איכות' },
  { id: 8,  name: 'HTML_SLIDES', label: 'מצגת HTML' },
  { id: 9,  name: 'IMAGES',      label: 'תמונות AI' },
  { id: 10, name: 'GAME_HTML',   label: 'משחק HTML' },
  { id: 11, name: 'NOTEBOOKLM',  label: 'NotebookLM' },
];
