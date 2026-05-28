export default function LearnLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="flex items-center gap-3 text-neutral-500">
        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
          <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <span className="text-sm">טוען...</span>
      </div>
    </div>
  );
}
