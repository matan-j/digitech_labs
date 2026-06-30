'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import AccessForm, { type AccessRequest } from '@/components/auth/AccessForm';

export type { AccessRequest };

type Props = {
  open: boolean;
  request: AccessRequest | null;
  onClose: () => void;
};

/**
 * Branded fast-access modal: dimmed overlay + centered card + close button,
 * wrapping the shared {@link AccessForm} (Google + email-code registration).
 * The card unmounts when closed, so the form resets between opens.
 */
export default function AccessModal({ open, request, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || !request) return null;

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Scrim */}
      <button
        type="button"
        aria-label="סגור"
        onClick={onClose}
        className="absolute inset-0 bg-neutral-950/50"
      />

      {/* Card */}
      <div
        className="relative w-full max-w-md bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 max-h-[92vh] overflow-y-auto"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="סגור"
          className="absolute top-4 left-4 w-8 h-8 rounded-pill flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <AccessForm request={request} />
      </div>
    </div>
  );
}
