/**
 * Vimeo iframe with brand defaults: dnt=1, lazy load, 16:9, brand-purple poster.
 * Server component — no JS needed.
 */
export default function VimeoPlayer({
  vimeoId,
  title,
}: {
  vimeoId: string;
  title?: string;
}) {
  const src = `https://player.vimeo.com/video/${vimeoId}?title=0&byline=0&portrait=0&dnt=1&quality=auto`;
  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-brand-purple-950">
      <iframe
        src={src}
        title={title || 'שיעור וידאו'}
        loading="lazy"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 w-full h-full border-0"
      />
    </div>
  );
}
