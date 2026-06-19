import { Mail } from 'lucide-react';
import {
  InstagramIcon, LinkedinIcon, YoutubeIcon, TiktokIcon, WebsiteIcon,
} from '@/components/icons/social';

export type CreatorSocials = {
  website?: string | null;
  linkedin?: string | null;
  instagram?: string | null;
  youtube?: string | null;
  tiktok?: string | null;
  email?: string | null;
};

type SocialKey = keyof CreatorSocials;

const ORDER: SocialKey[] = ['website', 'linkedin', 'instagram', 'youtube', 'tiktok', 'email'];

const ICONS: Record<SocialKey, React.ComponentType<{ className?: string }>> = {
  website: WebsiteIcon,
  linkedin: LinkedinIcon,
  instagram: InstagramIcon,
  youtube: YoutubeIcon,
  tiktok: TiktokIcon,
  email: Mail,
};

const LABELS: Record<SocialKey, string> = {
  website: 'אתר',
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  email: 'אימייל',
};

function normalize(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

function hrefFor(key: SocialKey, value: string): string {
  return key === 'email' ? `mailto:${value}` : normalize(value);
}

/**
 * Social icon row for creators. `tone="light"` for use on the dark hero,
 * `tone="default"` (light chips) for cards.
 */
export default function SocialLinks({
  socials,
  tone = 'default',
  size = 'md',
  className = '',
}: {
  socials: CreatorSocials;
  tone?: 'light' | 'default';
  size?: 'sm' | 'md';
  className?: string;
}) {
  const active = ORDER.filter((k) => Boolean(socials[k]));
  if (active.length === 0) return null;

  const dim = size === 'sm' ? 'w-7 h-7' : 'w-9 h-9';
  const icon = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  const chip =
    tone === 'light'
      ? 'text-white/70 hover:text-white bg-white/10 hover:bg-white/20'
      : 'text-neutral-500 hover:text-brand-purple-700 bg-neutral-100 hover:bg-brand-purple-50';

  return (
    <div className={['flex items-center gap-1.5', className].join(' ')}>
      {active.map((k) => {
        const Icon = ICONS[k];
        return (
          <a
            key={k}
            href={hrefFor(k, socials[k] as string)}
            target={k === 'email' ? undefined : '_blank'}
            rel="noopener noreferrer"
            aria-label={LABELS[k]}
            title={LABELS[k]}
            className={['rounded-pill flex items-center justify-center transition-colors', dim, chip].join(' ')}
          >
            <Icon className={icon} />
          </a>
        );
      })}
    </div>
  );
}
