# Blueprint Style — HTML Infographic Template

Use this template structure when generating the blueprint-style infographic.
Replace all `{{VARIABLE}}` placeholders with actual research data.

---

## HTML Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{TITLE}} — Research Blueprint</title>
  <link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@400;700;900&family=Exo+2:wght@300;400;600&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --navy: #0a1628;
      --navy-mid: #0d1f3c;
      --navy-light: #112447;
      --cyan: #4fc3f7;
      --cyan-dim: rgba(79, 195, 247, 0.4);
      --cyan-faint: rgba(79, 195, 247, 0.12);
      --amber: #ffd54f;
      --mint: #81c784;
      --coral: #ef9a9a;
      --text: #e8f4fd;
      --text-dim: #8fb8d4;
      --grid-color: rgba(100, 149, 237, 0.08);
    }

    body {
      background: var(--navy);
      color: var(--text);
      font-family: 'Exo 2', sans-serif;
      min-height: 100vh;
      background-image:
        linear-gradient(var(--grid-color) 1px, transparent 1px),
        linear-gradient(90deg, var(--grid-color) 1px, transparent 1px);
      background-size: 40px 40px;
    }

    .blueprint-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 20px;
    }

    /* ── HEADER ── */
    .header {
      border: 2px solid var(--cyan-dim);
      padding: 32px;
      margin-bottom: 32px;
      position: relative;
      background: var(--navy-mid);
      animation: fadeIn 0.5s ease;
    }
    .header::before, .header::after,
    .header .corner-tr, .header .corner-bl {
      content: '';
      position: absolute;
      width: 20px; height: 20px;
      border-color: var(--cyan);
      border-style: solid;
    }
    .header::before { top: -2px; left: -2px; border-width: 3px 0 0 3px; }
    .header::after  { top: -2px; right: -2px; border-width: 3px 3px 0 0; }
    .header .corner-bl { bottom: -2px; left: -2px; border-width: 0 0 3px 3px; }
    .header .corner-tr { bottom: -2px; right: -2px; border-width: 0 3px 3px 0; }

    .header-label {
      font-family: 'Share Tech Mono', monospace;
      font-size: 11px;
      color: var(--cyan);
      letter-spacing: 4px;
      text-transform: uppercase;
      margin-bottom: 12px;
      opacity: 0.8;
    }
    .header h1 {
      font-family: 'Orbitron', sans-serif;
      font-size: clamp(24px, 4vw, 42px);
      font-weight: 900;
      color: var(--text);
      letter-spacing: 2px;
      line-height: 1.2;
      margin-bottom: 12px;
    }
    .header h1 span { color: var(--cyan); }
    .header-meta {
      font-family: 'Share Tech Mono', monospace;
      font-size: 12px;
      color: var(--text-dim);
      display: flex; gap: 24px; flex-wrap: wrap;
    }
    .header-meta span::before { content: '▸ '; color: var(--cyan); }

    /* ── GRID LAYOUT ── */
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
    .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 24px; margin-bottom: 24px; }
    @media (max-width: 768px) {
      .grid-2, .grid-3 { grid-template-columns: 1fr; }
    }

    /* ── PANEL ── */
    .panel {
      border: 1px solid var(--cyan-dim);
      background: var(--navy-mid);
      padding: 24px;
      position: relative;
      animation: fadeIn 0.5s ease;
    }
    .panel-full { grid-column: 1 / -1; }
    .panel-title {
      font-family: 'Share Tech Mono', monospace;
      font-size: 11px;
      color: var(--cyan);
      letter-spacing: 3px;
      text-transform: uppercase;
      margin-bottom: 20px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--cyan-faint);
    }
    .panel-title .icon { margin-right: 8px; }

    /* ── INSIGHT CARDS ── */
    .insight-card {
      display: flex; gap: 16px; align-items: flex-start;
      padding: 14px;
      background: var(--cyan-faint);
      border-left: 3px solid var(--cyan);
      margin-bottom: 12px;
    }
    .insight-number {
      font-family: 'Orbitron', sans-serif;
      font-size: 20px;
      font-weight: 900;
      color: var(--cyan);
      min-width: 32px;
      line-height: 1;
    }
    .insight-text { font-size: 14px; line-height: 1.6; color: var(--text); }
    .insight-source {
      font-family: 'Share Tech Mono', monospace;
      font-size: 10px;
      color: var(--text-dim);
      margin-top: 4px;
    }

    /* ── SKILL BARS ── */
    .skill-row {
      display: flex; align-items: center; gap: 12px;
      margin-bottom: 14px;
    }
    .skill-name {
      font-family: 'Share Tech Mono', monospace;
      font-size: 12px;
      color: var(--text);
      min-width: 160px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .skill-bar-track {
      flex: 1;
      height: 8px;
      background: rgba(255,255,255,0.06);
      border: 1px solid var(--cyan-dim);
      position: relative;
      overflow: hidden;
    }
    .skill-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--cyan), var(--mint));
      transition: width 1s ease;
    }
    .skill-bar-fill.amber { background: linear-gradient(90deg, var(--amber), #ff8f00); }
    .skill-bar-fill.coral { background: linear-gradient(90deg, var(--coral), #e53935); }
    .skill-stat {
      font-family: 'Share Tech Mono', monospace;
      font-size: 11px;
      color: var(--cyan);
      min-width: 80px;
      text-align: right;
    }
    .skill-badge {
      font-size: 9px;
      padding: 2px 6px;
      border: 1px solid;
      font-family: 'Share Tech Mono', monospace;
      letter-spacing: 1px;
    }
    .badge-official { border-color: var(--mint); color: var(--mint); }
    .badge-community { border-color: var(--amber); color: var(--amber); }
    .badge-trending { border-color: var(--coral); color: var(--coral); }

    /* ── THEME BUBBLES ── */
    .themes-grid {
      display: flex; flex-wrap: wrap; gap: 12px;
      align-items: center; justify-content: flex-start;
    }
    .theme-bubble {
      border: 1px solid var(--cyan-dim);
      padding: 10px 16px;
      font-size: 13px;
      font-family: 'Share Tech Mono', monospace;
      color: var(--text);
      background: var(--cyan-faint);
      position: relative;
      transition: all 0.2s;
    }
    .theme-bubble:hover { background: rgba(79,195,247,0.2); border-color: var(--cyan); }
    .theme-count {
      display: block;
      font-size: 18px;
      font-family: 'Orbitron', sans-serif;
      font-weight: 700;
      color: var(--cyan);
      margin-bottom: 4px;
    }

    /* ── STATS ROW ── */
    .stats-row {
      display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 24px;
    }
    .stat-box {
      flex: 1; min-width: 140px;
      border: 1px solid var(--cyan-dim);
      background: var(--navy-mid);
      padding: 20px;
      text-align: center;
      animation: fadeIn 0.5s ease;
    }
    .stat-value {
      font-family: 'Orbitron', sans-serif;
      font-size: 28px;
      font-weight: 900;
      color: var(--amber);
      display: block;
    }
    .stat-label {
      font-family: 'Share Tech Mono', monospace;
      font-size: 10px;
      color: var(--text-dim);
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-top: 4px;
    }

    /* ── GAPS & QUOTES ── */
    .gap-item {
      display: flex; align-items: flex-start; gap: 12px;
      padding: 10px 0;
      border-bottom: 1px solid var(--navy-light);
      font-size: 13px; line-height: 1.5;
    }
    .gap-item:last-child { border-bottom: none; }
    .gap-icon { color: var(--amber); font-size: 16px; min-width: 20px; }
    .key-quote {
      border: 1px solid var(--amber);
      padding: 24px;
      background: rgba(255, 213, 79, 0.06);
      font-style: italic;
      font-size: 16px;
      line-height: 1.7;
      color: var(--text);
      position: relative;
    }
    .key-quote::before {
      content: '"';
      font-family: 'Orbitron', sans-serif;
      font-size: 60px;
      color: var(--amber);
      opacity: 0.3;
      position: absolute;
      top: 10px; left: 16px;
      line-height: 1;
    }
    .quote-text { padding-left: 20px; }
    .quote-source {
      font-family: 'Share Tech Mono', monospace;
      font-size: 11px;
      color: var(--amber);
      margin-top: 12px;
      padding-left: 20px;
    }

    /* ── FOOTER ── */
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid var(--cyan-dim);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
    }
    .footer-label {
      font-family: 'Share Tech Mono', monospace;
      font-size: 10px;
      color: var(--text-dim);
      letter-spacing: 2px;
    }
    .stamp {
      border: 2px solid var(--mint);
      color: var(--mint);
      font-family: 'Orbitron', sans-serif;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 3px;
      padding: 6px 12px;
      transform: rotate(-3deg);
      display: inline-block;
    }

    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
  </style>
</head>
<body>
  <div class="blueprint-container">

    <!-- HEADER -->
    <div class="header">
      <div class="corner-tr"></div>
      <div class="corner-bl"></div>
      <div class="header-label">⬡ RESEARCH BLUEPRINT — NOTEBOOKLM SYNTHESIS</div>
      <h1>{{TITLE_LINE_1}} <span>{{TITLE_ACCENT}}</span></h1>
      <div class="header-meta">
        <span>Sources: {{SOURCE_COUNT}}</span>
        <span>Date: {{DATE}}</span>
        <span>Insights: {{INSIGHT_COUNT}}</span>
        <span>Generated by: NotebookLM Skill</span>
      </div>
    </div>

    <!-- STATS ROW -->
    <div class="stats-row">
      <div class="stat-box"><span class="stat-value">{{STAT_1_VALUE}}</span><span class="stat-label">{{STAT_1_LABEL}}</span></div>
      <div class="stat-box"><span class="stat-value">{{STAT_2_VALUE}}</span><span class="stat-label">{{STAT_2_LABEL}}</span></div>
      <div class="stat-box"><span class="stat-value">{{STAT_3_VALUE}}</span><span class="stat-label">{{STAT_3_LABEL}}</span></div>
      <div class="stat-box"><span class="stat-value">{{STAT_4_VALUE}}</span><span class="stat-label">{{STAT_4_LABEL}}</span></div>
    </div>

    <!-- TOP INSIGHTS + THEMES -->
    <div class="grid-2">
      <div class="panel">
        <div class="panel-title"><span class="icon">◈</span> TOP INSIGHTS</div>
        <!-- REPEAT FOR EACH INSIGHT: -->
        <div class="insight-card">
          <div class="insight-number">01</div>
          <div>
            <div class="insight-text">{{INSIGHT_1}}</div>
            <div class="insight-source">▸ {{INSIGHT_1_SOURCE}}</div>
          </div>
        </div>
        <!-- ...repeat up to 5 -->
      </div>

      <div class="panel">
        <div class="panel-title"><span class="icon">◈</span> THEME MAP</div>
        <div class="themes-grid">
          <!-- REPEAT FOR EACH THEME: -->
          <div class="theme-bubble">
            <span class="theme-count">{{THEME_1_COUNT}}x</span>
            {{THEME_1_NAME}}
          </div>
          <!-- ...repeat for all themes -->
        </div>
      </div>
    </div>

    <!-- TOP SKILLS RANKING -->
    <div class="panel panel-full" style="margin-bottom: 24px;">
      <div class="panel-title"><span class="icon">◈</span> TOP SKILLS RANKING — INSTALL COUNT & MOMENTUM</div>
      <!-- REPEAT FOR EACH SKILL: -->
      <div class="skill-row">
        <span class="skill-name">{{SKILL_NAME}}</span>
        <div class="skill-bar-track">
          <div class="skill-bar-fill" style="width: {{SKILL_BAR_PCT}}%"></div>
        </div>
        <span class="skill-stat">{{SKILL_STAT}}</span>
        <span class="skill-badge badge-official">{{SKILL_BADGE}}</span>
      </div>
      <!-- ...repeat -->
    </div>

    <!-- GAPS + KEY QUOTE -->
    <div class="grid-2">
      <div class="panel">
        <div class="panel-title"><span class="icon">◈</span> KNOWLEDGE GAPS</div>
        <!-- REPEAT FOR EACH GAP: -->
        <div class="gap-item">
          <span class="gap-icon">⚠</span>
          <span>{{GAP_1}}</span>
        </div>
        <!-- ...repeat -->
      </div>

      <div class="panel">
        <div class="panel-title"><span class="icon">◈</span> KEY SIGNAL</div>
        <div class="key-quote">
          <div class="quote-text">{{KEY_QUOTE}}</div>
          <div class="quote-source">— {{QUOTE_SOURCE}}</div>
        </div>
      </div>
    </div>

    <!-- FOOTER -->
    <div class="footer">
      <div class="footer-label">GENERATED: {{DATE}} | SKILL: NOTEBOOKLM | PROJECT: DIGITECH LABS</div>
      <div class="stamp">ANALYSIS COMPLETE</div>
    </div>

  </div>
</body>
</html>
```

---

## Placeholder Reference

| Placeholder | What to put there |
|---|---|
| `{{TITLE_LINE_1}}` | Main topic (e.g., "Claude Code") |
| `{{TITLE_ACCENT}}` | Subtitle word (e.g., "Skills 2026") |
| `{{SOURCE_COUNT}}` | Number of sources analyzed |
| `{{DATE}}` | Today's date |
| `{{INSIGHT_COUNT}}` | Number of key insights |
| `{{STAT_X_VALUE}}` | A big number (133K, 85K+, etc.) |
| `{{STAT_X_LABEL}}` | Label for the stat |
| `{{INSIGHT_X}}` | The insight text |
| `{{INSIGHT_X_SOURCE}}` | Where it came from |
| `{{THEME_X_COUNT}}` | How many sources mention this theme |
| `{{THEME_X_NAME}}` | Theme name |
| `{{SKILL_NAME}}` | Skill or tool name |
| `{{SKILL_BAR_PCT}}` | Bar fill % (0-100) |
| `{{SKILL_STAT}}` | Install count / star count |
| `{{SKILL_BADGE}}` | OFFICIAL / COMMUNITY / TRENDING |
| `{{GAP_X}}` | Knowledge gap description |
| `{{KEY_QUOTE}}` | Most powerful quote or stat |
| `{{QUOTE_SOURCE}}` | Attribution |
