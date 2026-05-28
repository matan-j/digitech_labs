# Handwritten Style — HTML Infographic Template

Use this template when `--style handwritten` is requested.
Warm cream paper feel, dark ink, sketch-style aesthetic.

---

## Style Specifications

```css
Background: #fef9f0 (warm cream)
Primary text: #1a1a2e (near-black ink)
Accent red: #c0392b (red ink highlights, underlines)
Accent blue: #1a3a5c (dark blue ink for headers)
Secondary: #5d4e37 (brown ink for notes)
Border: #8b7355 (aged paper edge tone)
Font heading: "Caveat", "Patrick Hand", cursive
Font body: "Lato", "Georgia", serif
Lines: slightly imperfect, 1-2px, rgba(0,0,0,0.15)
Elements: hand-drawn circles, wavy underlines, star bullets ★
```

---

## HTML Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{TITLE}} — Research Notes</title>
  <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&family=Lato:wght@300;400;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --cream: #fef9f0;
      --cream-dark: #f5edd8;
      --ink: #1a1a2e;
      --ink-light: #4a4a5a;
      --red: #c0392b;
      --blue: #1a3a5c;
      --brown: #5d4e37;
      --border: #c8b99a;
      --line: rgba(0,0,0,0.1);
    }

    body {
      background: var(--cream);
      color: var(--ink);
      font-family: 'Lato', serif;
      /* ruled paper lines */
      background-image: repeating-linear-gradient(
        transparent, transparent 27px,
        rgba(180,160,120,0.2) 27px, rgba(180,160,120,0.2) 28px
      );
      background-size: 100% 28px;
      padding: 48px 32px;
    }

    .page {
      max-width: 1100px;
      margin: 0 auto;
      background: var(--cream);
      border: 1px solid var(--border);
      box-shadow: 3px 3px 12px rgba(0,0,0,0.08), -1px -1px 4px rgba(0,0,0,0.04);
      padding: 56px 64px;
    }

    /* ── HEADER ── */
    .header { margin-bottom: 48px; border-bottom: 2px solid var(--ink); padding-bottom: 24px; }
    .h-label {
      font-family: 'Caveat', cursive; font-size: 13px;
      color: var(--red); letter-spacing: 2px; text-transform: uppercase;
      margin-bottom: 8px;
    }
    .h-title {
      font-family: 'Caveat', cursive;
      font-size: clamp(32px, 5vw, 52px); font-weight: 700;
      color: var(--blue); line-height: 1.15; margin-bottom: 12px;
    }
    .h-title .underline {
      text-decoration: underline; text-decoration-color: var(--red);
      text-decoration-thickness: 3px;
    }
    .h-meta {
      font-family: 'Caveat', cursive; font-size: 15px;
      color: var(--brown); display: flex; gap: 28px; flex-wrap: wrap;
    }
    .h-meta span::before { content: '★ '; color: var(--red); }

    /* ── SECTION TITLE ── */
    .sec-title {
      font-family: 'Caveat', cursive; font-size: 22px; font-weight: 700;
      color: var(--blue); margin-bottom: 16px;
      border-bottom: 1.5px solid var(--border); padding-bottom: 6px;
      display: flex; align-items: center; gap: 8px;
    }

    /* ── GRID ── */
    .g2 { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 32px; }
    .full { grid-column: 1 / -1; }
    @media (max-width: 800px) { .g2 { grid-template-columns: 1fr; } }

    /* ── INSIGHT CARDS ── */
    .insight {
      display: flex; gap: 12px; align-items: flex-start;
      padding: 12px 0; border-bottom: 1px dashed var(--border);
    }
    .insight:last-child { border-bottom: none; }
    .in-num {
      font-family: 'Caveat', cursive; font-size: 28px; font-weight: 700;
      color: var(--red); min-width: 32px; line-height: 1;
    }
    .in-text { font-size: 14px; line-height: 1.65; color: var(--ink); }
    .in-src { font-family: 'Caveat', cursive; font-size: 12px; color: var(--brown); margin-top: 4px; }

    /* ── SKILL ROWS ── */
    .skill-row {
      display: flex; align-items: center; gap: 12px; margin-bottom: 12px;
      padding-bottom: 12px; border-bottom: 1px dashed var(--border);
    }
    .skill-row:last-child { border-bottom: none; }
    .s-rank { font-family: 'Caveat', cursive; font-size: 20px; color: var(--red); min-width: 24px; }
    .s-name { font-family: 'Caveat', cursive; font-size: 15px; color: var(--ink); min-width: 160px; }
    .s-track { flex: 1; height: 10px; background: var(--cream-dark); border: 1px solid var(--border); }
    .s-fill { height: 100%; background: var(--blue); }
    .s-stat { font-family: 'Caveat', cursive; font-size: 14px; color: var(--red); min-width: 80px; text-align: right; }

    /* ── THEMES ── */
    .themes-wrap { display: flex; flex-wrap: wrap; gap: 10px; }
    .tbubble {
      border: 2px solid var(--ink); padding: 8px 14px;
      font-family: 'Caveat', cursive; font-size: 14px;
      background: var(--cream-dark); transform: rotate(-1deg);
    }
    .tbubble:nth-child(even) { transform: rotate(1deg); }
    .tc { font-size: 20px; font-weight: 700; color: var(--red); display: block; }

    /* ── GAPS ── */
    .gap-item {
      display: flex; gap: 10px; padding: 8px 0;
      border-bottom: 1px dashed var(--border); font-size: 14px; line-height: 1.55;
    }
    .gap-item:last-child { border-bottom: none; }
    .gi { color: var(--red); font-family: 'Caveat', cursive; font-size: 18px; }

    /* ── QUOTE ── */
    .quote-box {
      border-left: 4px solid var(--red); padding: 20px 24px;
      background: var(--cream-dark); margin-top: 8px;
      position: relative;
    }
    .qmark {
      font-family: 'Caveat', cursive; font-size: 72px;
      color: var(--red); opacity: 0.2;
      position: absolute; top: 4px; left: 12px; line-height: 1;
    }
    .qtext { font-style: italic; font-size: 15px; line-height: 1.7; padding-left: 20px; }
    .qsrc { font-family: 'Caveat', cursive; font-size: 13px; color: var(--brown); padding-left: 20px; margin-top: 10px; }

    /* ── FOOTER ── */
    .footer {
      margin-top: 48px; padding-top: 20px; border-top: 2px solid var(--ink);
      display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;
    }
    .fl { font-family: 'Caveat', cursive; font-size: 13px; color: var(--brown); }
    .stamp {
      border: 3px solid var(--blue); color: var(--blue);
      font-family: 'Caveat', cursive; font-size: 14px; font-weight: 700;
      padding: 6px 14px; transform: rotate(-3deg); display: inline-block;
    }
  </style>
</head>
<body>
<div class="page">

  <div class="header">
    <div class="h-label">✏ Research Notes — NotebookLM Synthesis</div>
    <h1 class="h-title">{{TITLE_LINE_1}} <span class="underline">{{TITLE_ACCENT}}</span></h1>
    <div class="h-meta">
      <span>Sources: {{SOURCE_COUNT}}</span>
      <span>Date: {{DATE}}</span>
      <span>Insights: {{INSIGHT_COUNT}}</span>
    </div>
  </div>

  <div class="g2">
    <div>
      <div class="sec-title">✏ Top Insights</div>
      <!-- REPEAT per insight -->
      <div class="insight">
        <div class="in-num">1.</div>
        <div>
          <div class="in-text">{{INSIGHT_1}}</div>
          <div class="in-src">↳ {{INSIGHT_1_SOURCE}}</div>
        </div>
      </div>
      <!-- ...repeat -->
    </div>

    <div>
      <div class="sec-title">✏ Theme Map</div>
      <div class="themes-wrap">
        <div class="tbubble"><span class="tc">{{THEME_1_COUNT}}x</span>{{THEME_1_NAME}}</div>
        <!-- ...repeat -->
      </div>
    </div>
  </div>

  <div class="full" style="margin-bottom: 32px;">
    <div class="sec-title">✏ Top Skills Ranking</div>
    <!-- REPEAT per skill -->
    <div class="skill-row">
      <span class="s-rank">#1</span>
      <span class="s-name">{{SKILL_NAME}}</span>
      <div class="s-track"><div class="s-fill" style="width:{{SKILL_BAR_PCT}}%"></div></div>
      <span class="s-stat">{{SKILL_STAT}}</span>
    </div>
    <!-- ...repeat -->
  </div>

  <div class="g2">
    <div>
      <div class="sec-title">✏ Knowledge Gaps</div>
      <div class="gap-item"><span class="gi">?</span><span>{{GAP_1}}</span></div>
      <!-- ...repeat -->
    </div>
    <div>
      <div class="sec-title">✏ Key Signal</div>
      <div class="quote-box">
        <div class="qmark">"</div>
        <div class="qtext">{{KEY_QUOTE}}</div>
        <div class="qsrc">— {{QUOTE_SOURCE}}</div>
      </div>
    </div>
  </div>

  <div class="footer">
    <div class="fl">Generated: {{DATE}} | notebooklm skill | Digitech Labs</div>
    <div class="stamp">NOTES COMPLETE ✓</div>
  </div>

</div>
</body>
</html>
```

---

## Placeholder Reference

Same as blueprint.md — all `{{VARIABLE}}` placeholders apply identically.
