'use client';

import { useState } from 'react';
import { CourseBrief } from '@/lib/types';

interface Props {
  onSubmit: (brief: CourseBrief) => void;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\s\u0590-\u05FF]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    || `course-${Date.now()}`;
}

const FIELD_LABELS: Record<keyof CourseBrief, string> = {
  title: 'שם הקורס',
  slug: 'מזהה (Slug)',
  targetAudience: 'קהל יעד',
  ageGroup: 'גיל / רמה',
  duration: 'משך הקורס',
  goal: 'מטרת הקורס',
  prerequisites: 'ידע קודם נדרש',
  format: 'פורמט',
  tools: 'כלים / טכנולוגיות',
  tone: 'טון וסגנון',
  additionalNotes: 'הערות נוספות',
};

export default function CourseBriefForm({ onSubmit }: Props) {
  const [form, setForm] = useState<CourseBrief>({
    title: '',
    slug: '',
    targetAudience: '',
    ageGroup: '',
    duration: '',
    goal: '',
    prerequisites: '',
    format: 'קורס',
    tools: '',
    tone: 'מעשי, ברור, מעורר השראה',
    additionalNotes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(field: keyof CourseBrief, value: string) {
    setForm(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'title') {
        updated.slug = slugify(value);
      }
      return updated;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setIsSubmitting(true);
    onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          {FIELD_LABELS.title} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={form.title}
          onChange={e => handleChange('title', e.target.value)}
          placeholder="לדוגמה: AI לעסקים קטנים"
          required
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Slug (readonly) */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          {FIELD_LABELS.slug}
          <span className="text-gray-400 font-normal ms-2">(נוצר אוטומטית)</span>
        </label>
        <input
          type="text"
          value={form.slug}
          onChange={e => handleChange('slug', e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-500 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          dir="ltr"
        />
      </div>

      {/* 2-column grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            {FIELD_LABELS.targetAudience} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.targetAudience}
            onChange={e => handleChange('targetAudience', e.target.value)}
            placeholder="לדוגמה: מנהלים, יזמים, מורים"
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            {FIELD_LABELS.ageGroup} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.ageGroup}
            onChange={e => handleChange('ageGroup', e.target.value)}
            placeholder="לדוגמה: 25-45, תלמידי תיכון, מבוגרים"
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            {FIELD_LABELS.duration} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.duration}
            onChange={e => handleChange('duration', e.target.value)}
            placeholder="לדוגמה: 8 מפגשים × 90 דקות"
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            {FIELD_LABELS.format}
          </label>
          <select
            value={form.format}
            onChange={e => handleChange('format', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option>קורס</option>
            <option>וורקשופ</option>
            <option>בוטקאמפ</option>
            <option>הרצאה</option>
            <option>סדנה</option>
            <option>תוכנית הכשרה</option>
          </select>
        </div>
      </div>

      {/* Goal */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          {FIELD_LABELS.goal} <span className="text-red-500">*</span>
        </label>
        <textarea
          value={form.goal}
          onChange={e => handleChange('goal', e.target.value)}
          placeholder="מה התלמיד יוכל לעשות בסוף הקורס? מה ישתנה בחייו/עסקו?"
          required
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {/* Tools */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          {FIELD_LABELS.tools}
        </label>
        <input
          type="text"
          value={form.tools}
          onChange={e => handleChange('tools', e.target.value)}
          placeholder="לדוגמה: ChatGPT, Canva, Google Slides, Notion"
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* 2-column: tone + prerequisites */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            {FIELD_LABELS.tone}
          </label>
          <input
            type="text"
            value={form.tone}
            onChange={e => handleChange('tone', e.target.value)}
            placeholder="לדוגמה: מעשי, שכבות-כבות, מעורר השראה"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            {FIELD_LABELS.prerequisites}
          </label>
          <input
            type="text"
            value={form.prerequisites}
            onChange={e => handleChange('prerequisites', e.target.value)}
            placeholder="לדוגמה: אין / שימוש בסמארטפון בסיסי"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          {FIELD_LABELS.additionalNotes}
        </label>
        <textarea
          value={form.additionalNotes}
          onChange={e => handleChange('additionalNotes', e.target.value)}
          placeholder="כל מידע נוסף שיעזור ל-AI לייצר תוצרים מדויקים יותר..."
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !form.title.trim()}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors text-lg"
      >
        {isSubmitting ? 'מעבד...' : '🚀 הרץ Pipeline'}
      </button>
    </form>
  );
}
