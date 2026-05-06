# 🔷 PRISM Design System

> One token architecture. Every brand context.

A multi-industry design token architecture built for both humans 
and AI code generation tools (Cursor, Copilot, Figma Dev Mode).

---

## Architecture

| Layer | File | Purpose |
|---|---|---|
| Primitives | `tokens/primitives.json` | Raw values. Never applied directly. |
| Semantic | `tokens/semantic.json` | Intent layer. What, why, and when. |
| Themes | `tokens/themes/*.json` | Industry overrides of semantic tokens only. |

## Industry Themes

| Theme | Primary | Covers |
|---|---|---|
| Base (default) | `#0066CC` | SaaS, WorkTech, Healthcare, Hospitality, Luxury |
| Entertainment | `#E50914` | Film, Streaming, Gaming, Media |
| Education | `#F4A300` | EdTech, Arts, Nonprofits, Libraries |

## Key Features
- W3C DTCG token format (`$value`, `$type`, `$description`)
- Intent descriptions on every semantic token — readable by AI agents
- Theme switching via `data-theme` attribute — no component changes needed
- Motion tokens include `prefers-reduced-motion` compliance by default
- AI agent rules documented in `docs/ai-rules.md`

## Figma Library
→ [View in Figma](YOUR_LINK_HERE)

## Stack
Figma · Tokens Studio · Style Dictionary · GitHub · Code Connect