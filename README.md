# 🔷 PRISM Design System

> One token architecture. Every brand context.

PRISM is a multi-industry, token-driven design system prototype built for both human designers and AI-assisted workflows. It combines structured design tokens, semantic naming, theme overrides, browser-based UI previews, and a Figma plugin proof-of-concept.

---

## What PRISM Does

PRISM demonstrates how one token architecture can support multiple visual contexts without changing the underlying component logic.

It includes:

- token architecture in W3C-style DTCG format
- semantic tokens with usage intent and descriptions
- industry theme overrides
- a live browser playground for generating and previewing components
- an embedded public Figma file showing the design system visually
- a local Figma plugin that can generate token-driven buttons and notification card components from structured JSON

---

## Architecture

| Layer | File | Purpose |
|---|---|---|
| Primitives | `tokens/primitives.json` | Raw values such as core colors, spacing, and motion tokens. Never applied directly. |
| Semantic | `tokens/semantic.json` | Meaning layer. Defines what a token is for and when it should be used. |
| Themes | `tokens/themes/*.json` | Theme-specific overrides of semantic tokens only. |
| Recipes | `recipes/button.json` | Component assembly logic for token-driven generation. |
| AI Rules | `docs/ai-rules.md` | Rules for AI tools and code generation workflows. |

---

## Industry Themes

| Theme | Primary | Covers |
|---|---|---|
| Base (default) | `#0066CC` | SaaS, WorkTech, Healthcare, Hospitality, Luxury |
| Entertainment | `#E50914` | Film, Streaming, Gaming, Media |
| Education | `#F4A300` | EdTech, Arts, Nonprofits, Libraries |

---

## Playground Features

The public GitHub Pages playground includes:

- theme switching
- button variant switching
- button state switching
- card title and body content controls
- status badge controls
- note-based visual tweaks such as:
  - `bolder`
  - `cinematic`
  - `soft`
  - `quiet`
  - `uppercase`
- generated JSON output
- downloadable JSON spec
- browser-rendered live preview
- embedded public Figma file for comparison

---

## Figma Plugin Proof of Concept

The local Figma plugin can take structured JSON and generate:

- token-driven button components
- notification card components with:
  - title
  - body text
  - badge
  - primary action button

This demonstrates a lightweight bridge between token logic, structured design intent, and component generation inside Figma.

---

## Why This Project Matters

PRISM is designed to show:

- system thinking over one-off mockups
- separation between primitives, semantics, and themes
- how AI-friendly descriptions improve token usability
- how one component model can adapt across industries and themes
- how structured JSON can bridge browser-based tooling and design tools like Figma

---

## Live Demo

- **GitHub Pages Playground:** `ADD_YOUR_GITHUB_PAGES_LINK_HERE`


---

## Stack

Figma · GitHub Pages · GitHub · JSON Design Tokens · Tokens Studio concepts · Figma Plugin API

---

## Built By

**Ida Akiwumi**  
Creative Technologist · AI Frontend Engineer · Design Engineer
