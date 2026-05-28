// Lightweight markdown renderer for lesson bodies.
// Supports: ## h2, ### h3, **bold**, paragraphs, ordered/unordered lists,
// and passthrough of <span class="timestamp">…</span> tags so editors can
// embed clickable timestamps.
// Used by both the consumer-side lesson page and the admin editor's live
// preview, so what the author sees matches what the student sees.

export function renderMarkdownLite(src: string): string {
  const placeholders: string[] = [];
  const TS_RX = /<span class="timestamp">([^<]+)<\/span>/g;
  // Marker survives .trim() and the escape() pass; unlikely to appear in
  // normal lesson copy.
  const withPh = src.replace(TS_RX, (_, t) => {
    placeholders.push(`<span class="timestamp">${escape(t)}</span>`);
    return `@@TS${placeholders.length - 1}TS@@`;
  });

  const escaped = escape(withPh);

  const lines = escaped.split(/\r?\n/);
  const out: string[] = [];
  let inUl = false;
  let inOl = false;
  let buf: string[] = [];

  const flushPara = () => {
    if (buf.length === 0) return;
    out.push(`<p>${inlineFmt(buf.join(' '))}</p>`);
    buf = [];
  };
  const closeLists = () => {
    if (inUl) {
      out.push('</ul>');
      inUl = false;
    }
    if (inOl) {
      out.push('</ol>');
      inOl = false;
    }
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushPara();
      closeLists();
      continue;
    }
    if (/^### /.test(line)) {
      flushPara();
      closeLists();
      out.push(`<h3>${inlineFmt(line.replace(/^### /, ''))}</h3>`);
      continue;
    }
    if (/^## /.test(line)) {
      flushPara();
      closeLists();
      out.push(`<h2>${inlineFmt(line.replace(/^## /, ''))}</h2>`);
      continue;
    }
    if (/^[-*] /.test(line)) {
      flushPara();
      if (!inUl) {
        closeLists();
        out.push('<ul>');
        inUl = true;
      }
      out.push(`<li>${inlineFmt(line.replace(/^[-*] /, ''))}</li>`);
      continue;
    }
    if (/^\d+\.\s+/.test(line)) {
      flushPara();
      if (!inOl) {
        closeLists();
        out.push('<ol>');
        inOl = true;
      }
      out.push(`<li>${inlineFmt(line.replace(/^\d+\.\s+/, ''))}</li>`);
      continue;
    }
    buf.push(line);
  }
  flushPara();
  closeLists();

  let html = out.join('\n');
  html = html.replace(/@@TS(\d+)TS@@/g, (_, i) => placeholders[Number(i)] || '');
  return html;
}

function escape(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function inlineFmt(s: string) {
  return s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}
