import type { GuideBlock } from '@/lib/learn/types';
import { renderMarkdownLite } from '@/lib/learn/markdown';

const TONE_CLS: Record<NonNullable<Extract<GuideBlock, { type: 'callout' }>['tone']>, string> = {
  info: 'border-brand-purple-300 bg-brand-purple-50 text-brand-purple-900',
  success: 'border-emerald-300 bg-emerald-50 text-emerald-900',
  warning: 'border-amber-300 bg-amber-50 text-amber-900',
};

function vimeoIdFromInput(input: string): string {
  const match = input.match(/(\d{6,})/);
  return match ? match[1] : input;
}

export default function GuideBlocks({ blocks }: { blocks: GuideBlock[] }) {
  if (!blocks?.length) {
    return <p className="text-neutral-500 italic">מדריך זה עוד ריק.</p>;
  }
  return (
    <div className="space-y-6">
      {blocks.map((b, i) => {
        if (b.type === 'markdown') {
          return (
            <div
              key={i}
              className="prose-learn"
              // markdown is admin-authored; renderer handles escaping
              dangerouslySetInnerHTML={{ __html: renderMarkdownLite(b.content) }}
            />
          );
        }
        if (b.type === 'image') {
          return (
            <figure key={i} className="space-y-2">
              <img src={b.url} alt={b.alt ?? ''} className="w-full rounded-xl border border-neutral-200" />
              {b.caption && <figcaption className="text-sm text-neutral-500 text-center">{b.caption}</figcaption>}
            </figure>
          );
        }
        if (b.type === 'video') {
          const id = b.vimeoId ? vimeoIdFromInput(b.vimeoId) : null;
          return (
            <figure key={i} className="space-y-2">
              <div className="relative w-full pt-[56.25%] rounded-xl overflow-hidden border border-neutral-200 bg-neutral-950">
                {id ? (
                  <iframe
                    src={`https://player.vimeo.com/video/${id}?dnt=1&title=0&byline=0`}
                    className="absolute inset-0 w-full h-full"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-neutral-500 text-sm">וידאו לא הוגדר</div>
                )}
              </div>
              {b.caption && <figcaption className="text-sm text-neutral-500 text-center">{b.caption}</figcaption>}
            </figure>
          );
        }
        if (b.type === 'callout') {
          const tone = b.tone ?? 'info';
          return (
            <div key={i} className={`border-r-4 rounded-md px-4 py-3 ${TONE_CLS[tone]}`}>
              <div
                className="prose-learn"
                dangerouslySetInnerHTML={{ __html: renderMarkdownLite(b.content) }}
              />
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}
