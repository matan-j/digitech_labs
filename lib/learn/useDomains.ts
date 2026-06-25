'use client';

import { useEffect, useState } from 'react';
import { DOMAINS, domainMapOf, type DomainMeta } from './domains';

/**
 * Client hook: the live domain list from /api/domains, seeded with the static
 * fallback (DOMAINS) so dropdowns/filters render instantly and never break if
 * the endpoint is slow or the table isn't there yet. Also returns an id→meta map.
 */
export function useDomains(): { domains: DomainMeta[]; map: Map<string, DomainMeta> } {
  const [domains, setDomains] = useState<DomainMeta[]>([...DOMAINS]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch('/api/domains');
        const data = await res.json();
        if (alive && Array.isArray(data.items) && data.items.length > 0) {
          setDomains(data.items as DomainMeta[]);
        }
      } catch {
        /* keep the fallback */
      }
    })();
    return () => { alive = false; };
  }, []);

  return { domains, map: domainMapOf(domains) };
}
