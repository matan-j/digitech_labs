'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { CourseBrief, PipelineEvent, PipelineStep, PIPELINE_STEPS } from '@/lib/types';

interface Props {
  brief: CourseBrief;
}

function initSteps(): PipelineStep[] {
  return PIPELINE_STEPS.map(s => ({ ...s, status: 'pending', files: [] }));
}

const STEP_ICONS: Record<number, string> = {
  1:  '📁',
  2:  '🔍',
  3:  '📚',
  4:  '🎨',
  5:  '🎮',
  6:  '📣',
  7:  '✅',
  8:  '🌐',
  9:  '📸',
  10: '🕹️',
  11: '🎙️',
};

export default function PipelineProgress({ brief }: Props) {
  const router = useRouter();
  const [steps, setSteps] = useState<PipelineStep[]>(initSteps());
  const [status, setStatus] = useState<'idle' | 'running' | 'awaiting_approval' | 'done' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [currentStepId, setCurrentStepId] = useState(0);
  const [courseSummary, setCourseSummary] = useState('');
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const abort = new AbortController();
    abortRef.current = abort;
    startPipeline(abort);
    return () => abort.abort();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startPipeline(abort: AbortController) {
    if (abort.signal.aborted) return;
    setStatus('running');

    try {
      const response = await fetch('/api/pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(brief),
        signal: abort.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const event: PipelineEvent = JSON.parse(line.slice(6));
            handleEvent(event);
          } catch {
            // ignore parse errors
          }
        }
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      setStatus('error');
      setErrorMessage((err as Error).message);
    }
  }

  function handleEvent(event: PipelineEvent) {
    switch (event.type) {
      case 'step_start':
        setCurrentStepId(event.stepId || 0);
        setSteps(prev => prev.map(s =>
          s.id === event.stepId ? { ...s, status: 'running' } : s
        ));
        break;

      case 'step_done':
        setSteps(prev => prev.map(s =>
          s.id === event.stepId ? { ...s, status: 'done' } : s
        ));
        break;

      case 'step_error':
        setSteps(prev => prev.map(s =>
          s.id === event.stepId ? { ...s, status: 'error', error: event.error } : s
        ));
        setStatus('error');
        setErrorMessage(event.error || 'שגיאה לא ידועה');
        break;

      case 'file_created':
        setSteps(prev => prev.map(s =>
          s.id === event.stepId ? { ...s, files: [...s.files, event.file || ''] } : s
        ));
        break;

      case 'approval_required':
        setStatus('awaiting_approval');
        setCourseSummary(event.courseSummary || '');
        break;

      case 'pipeline_done':
        setStatus('done');
        break;

      case 'pipeline_error':
        setStatus('error');
        setErrorMessage(event.error || 'שגיאה לא ידועה');
        break;
    }
  }

  async function handleApproval(decision: 'approve' | 'reject') {
    await fetch(`/api/pipeline/approve?slug=${encodeURIComponent(brief.slug)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision }),
    });
    if (decision === 'approve') {
      setStatus('running');
    } else {
      setStatus('error');
      setErrorMessage('הקורס נדחה');
    }
  }

  const completedCount = steps.filter(s => s.status === 'done').length;
  const totalSteps = steps.length;
  const progress = Math.round((completedCount / totalSteps) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{brief.title}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{brief.targetAudience} · {brief.duration}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            status === 'done'             ? 'bg-green-100 text-green-700' :
            status === 'error'            ? 'bg-red-100 text-red-700' :
            status === 'awaiting_approval'? 'bg-yellow-100 text-yellow-700' :
            status === 'running'          ? 'bg-blue-100 text-blue-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {status === 'done'              ? '✓ הושלם' :
             status === 'error'             ? '✗ שגיאה' :
             status === 'awaiting_approval' ? '⏳ ממתין לאישור' :
             status === 'running'           ? `שלב ${currentStepId}/${totalSteps}` :
             'ממתין'}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-100 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full transition-all duration-500 ${
              status === 'error'             ? 'bg-red-500' :
              status === 'done'              ? 'bg-green-500' :
              status === 'awaiting_approval' ? 'bg-yellow-400' :
              'bg-blue-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">{completedCount} מתוך {totalSteps} שלבים</p>
      </div>

      {/* Approval panel */}
      {status === 'awaiting_approval' && (
        <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-6">
          <h3 className="font-bold text-yellow-900 text-lg mb-1">⏳ נדרש אישורך להמשיך</h3>
          <p className="text-sm text-yellow-800 mb-4">
            שלבי התכנון הושלמו. בדוק את תקציר הקורס ואשר כדי להמשיך ליצירת תכנים ויזואליים.
          </p>

          {courseSummary && (
            <div className="bg-white border border-yellow-200 rounded-lg p-4 mb-4 max-h-64 overflow-y-auto text-sm prose prose-sm max-w-none">
              <ReactMarkdown>{courseSummary}</ReactMarkdown>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => handleApproval('approve')}
              className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-2.5 rounded-lg transition-colors"
            >
              ✓ אשר והמשך
            </button>
            <button
              onClick={() => handleApproval('reject')}
              className="bg-red-100 hover:bg-red-200 text-red-700 font-medium px-6 py-2.5 rounded-lg transition-colors"
            >
              ✗ דחה קורס
            </button>
          </div>
        </div>
      )}

      {/* Steps */}
      <div className="space-y-3">
        {steps.map(step => (
          <div
            key={step.id}
            className={`bg-white rounded-xl border transition-all duration-300 ${
              step.status === 'running' ? 'border-blue-300 shadow-sm shadow-blue-100' :
              step.status === 'done'    ? 'border-green-200' :
              step.status === 'error'   ? 'border-red-200' :
              'border-gray-100'
            }`}
          >
            <div className="flex items-center gap-4 p-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-lg ${
                step.status === 'done'    ? 'bg-green-100' :
                step.status === 'running' ? 'bg-blue-100' :
                step.status === 'error'   ? 'bg-red-100' :
                'bg-gray-100'
              }`}>
                {step.status === 'running' ? (
                  <span className="animate-spin text-base">⟳</span>
                ) : step.status === 'done' ? (
                  '✓'
                ) : step.status === 'error' ? (
                  '✗'
                ) : (
                  STEP_ICONS[step.id]
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-gray-400">{step.id}/{totalSteps}</span>
                  <span className="font-semibold text-gray-800">{step.label}</span>
                  <span className="text-xs text-gray-400">{step.name}</span>
                </div>

                {step.status === 'running' && (
                  <p className="text-xs text-blue-600 mt-0.5 animate-pulse">מעבד...</p>
                )}
                {step.status === 'error' && step.error && (
                  <p className="text-xs text-red-500 mt-0.5 truncate">{step.error}</p>
                )}
                {step.files.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {step.files.map(f => (
                      <span key={f} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono">
                        {f.split('/').pop()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Error */}
      {status === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          <p className="font-semibold">שגיאה בהרצת ה-pipeline</p>
          <p className="text-sm mt-1">{errorMessage}</p>
        </div>
      )}

      {/* Done CTA */}
      {status === 'done' && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
          <p className="text-2xl mb-2">🎉</p>
          <p className="font-bold text-green-800 text-lg">הקורס נוצר בהצלחה!</p>
          <p className="text-green-700 text-sm mt-1 mb-4">
            כל הקבצים נכתבו ל: ~/Documents/Digitech-Courses/Course_{brief.slug}/
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.push(`/course/${brief.slug}`)}
              className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-2.5 rounded-lg transition-colors"
            >
              פתח קורס
            </button>
            <button
              onClick={() => router.push('/')}
              className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-medium px-6 py-2.5 rounded-lg transition-colors"
            >
              חזור לדשבורד
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
