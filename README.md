# 🔷 PRISM Design System

> One token architecture. Every brand context.  
> Built for humans, AI agents, and multi‑industry product teams.

PRISM is a **machine‑readable design infrastructure** that proves a single token system can power radically different brand experiences — from enterprise SaaS to cinematic entertainment to warm education — without changing a single line of component code.

---

## Architecture

| Layer | File | Purpose |
|-------|------|---------|
| **Primitives** | `tokens/primitives.json` | Raw values (colors, spacing, motion). Never applied directly. |
| **Semantic** | `tokens/semantic.json` | Intent layer: `color‑action‑primary`, `color‑feedback‑success`, etc. with full descriptions. |
| **Themes** | `tokens/themes/*.json` | Overrides only for Base, Entertainment, Education. |
| **AI Rules** | `ai-rules.md` | Single source of truth. Load into Cursor, Copilot, or any MCP agent. |
| **Parser** | `parse-spec.js` | Converts markdown → JSON tokens + CSS variables. |
| **Playground** | `playground.html` + `app.js` | Live preview, theme switching, note‑based tweaks (`cinematic`, `soft`, `uppercase`). |
| **Figma Plugin** | `figma‑plugin/` | Generates button & notification card components from token JSON. |

---

## Industry themes

| Theme | Primary color | Personality | Targets |
|-------|--------------|-------------|---------|
| **Base** | `#0066CC` | Trusted, professional | SaaS, Healthcare, WorkTech, Hospitality, Luxury |
| **Entertainment** | `#E50914` | Cinematic, bold | Film, Gaming, Streaming, Media |
| **Education** | `#F4A300` | Warm, approachable | EdTech, Arts, Nonprofits, Libraries |

All components (buttons, cards, badges, inputs) automatically adapt when the theme changes – no component duplicates, only token overrides.

---

## Live demo

🔗 [PRISM Design System Playground](https://idaakiwumi.github.io/prism-design-system/)  
- Theme switcher (Base / Entertainment / Education)  
- Button variants (primary, ghost, success) + states (default, hover, active, disabled)  
- Card with title, body, badge, action buttons  
- Note‑based style tweaks: `bolder`, `cinematic`, `soft`, `quiet`, `uppercase`  
- Generated JSON spec – copy / download  
- Embedded public Figma file for visual reference

---

## How the pipeline works

```bash
# 1. Edit the single source of truth
vi ai-rules.md

# 2. Run the parser
npm run sync

# 3. Outputs generated automatically:
#    - tokens/primitives.json, semantic.json, themes/*.json
#    - generated/ai-rules.json, prism-variables.css, spec-summary.json
```

This design system is not a static Figma file – it's infrastructure that feeds both humans and AI tools.

## Technology stack

- Source format – Markdown (human + AI readable)
- Token format – W3C DTCG JSON
- Parser – Node.js (vanilla)
- Frontend demo – HTML/CSS/JS, no framework dependencies
- Figma – Plugin API, local development
- Hosting – GitHub Pages

## Why this matter

> "This is not a traditional design system librarian role. You are building machine‑readable design infrastructure that enables Product Builders, engineers, and AI tools to ship production‑quality UI faster than any of them could alone."

PRISM exactly matches that philosophy:

    ✅ One source of truth (ai-rules.md)
    ✅ Tokens carry intent descriptions for AI agents
    ✅ Theme switching without forking components
    ✅ Agentic UI patterns documented
    ✅ Parser bridges design → code → CSS
    ✅ Playground proves it works in a browser

---

## Built By

**Ida Akiwumi**  
Creative Technologist · AI Frontend Engineer · Design Engineer
