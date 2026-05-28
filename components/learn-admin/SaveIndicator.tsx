'use client';

export type SaveState = 'idle' | 'dirty' | 'saving' | 'saved' | 'error';

const COPY: Record<SaveState, { text: string; cls: string }> = {
  idle: { text: 'מסונכרן', cls: 'text-gray-500 bg-gray-100' },
  dirty: { text: 'שינויים לא נשמרו', cls: 'text-amber-700 bg-amber-50' },
  saving: { text: 'שומר…', cls: 'text-blue-700 bg-blue-50' },
  saved: { text: '✓ נשמר', cls: 'text-green-700 bg-green-50' },
  error: { text: '⚠ שגיאת שמירה', cls: 'text-red-700 bg-red-50' },
};

export default function SaveIndicator({
  state,
  onForceSave,
}: {
  state: SaveState;
  onForceSave?: () => void;
}) {
  const c = COPY[state];
  const clickable = state === 'error' || state === 'dirty';
  return (
    <button
      type="button"
      onClick={clickable ? onForceSave : undefined}
      disabled={!clickable}
      className={`text-xs font-medium px-2.5 py-1.5 rounded-full ${c.cls} ${clickable ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
      title={clickable ? 'לחיצה תנסה שוב' : ''}
    >
      {c.text}
    </button>
  );
}
