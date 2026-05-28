'use client';

import { useState } from 'react';
import CourseBriefForm from '@/components/CourseBriefForm';
import PipelineProgress from '@/components/PipelineProgress';
import { CourseBrief } from '@/lib/types';

export default function NewCoursePage() {
  const [brief, setBrief] = useState<CourseBrief | null>(null);

  if (brief) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">מריץ Pipeline</h1>
          <p className="text-gray-500 mt-1">ה-AI בונה את הקורס שלך — זה ייקח כמה דקות</p>
        </div>
        <PipelineProgress brief={brief} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">קורס חדש</h1>
        <p className="text-gray-500 mt-1">
          מלא את הפרטים — ה-AI ייצור את כל חומרי הקורס אוטומטית ב-7 שלבים
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
        <p className="text-sm font-semibold text-blue-800 mb-2">מה ייצור ה-AI:</p>
        <div className="grid grid-cols-2 gap-1 text-xs text-blue-700">
          <span>📁 אתחול פרויקט</span>
          <span>🔍 מחקר ומקורות</span>
          <span>📚 תכנית לימודים מלאה</span>
          <span>🎨 תוכן מצגות</span>
          <span>🎮 פעילויות אינטראקטיביות</span>
          <span>📣 חומרי שיווק</span>
          <span>✅ בקרת איכות</span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <CourseBriefForm onSubmit={setBrief} />
      </div>
    </div>
  );
}
