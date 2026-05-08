# PRISM — AI Agent Rules

Load into Cursor, Copilot, or any MCP-compatible AI agent.

## Token Rules
- NEVER hardcode hex values. Always use: var(--color-action-primary)
- ALWAYS use semantic tokens, not primitives
  ✅ var(--color-action-primary)
  ❌ var(--color-blue-500)
  ❌ #0066CC
- Read each token $description before applying it to confirm intent

## Motion Rules
- ALL animated components MUST include:
  @media (prefers-reduced-motion: reduce) { transition: none; }
- Use motion-duration-fast (200ms) for buttons and toggles
- Use motion-duration-moderate (300ms) for modals and drawers

## Theme Rules
- Apply themes via data-theme on the root element
  <html data-theme="entertainment">
- NEVER duplicate or fork components for different themes
- Only override semantic tokens in theme files — never primitives

## Accessibility
- Text on any background: minimum 4.5:1 contrast ratio (WCAG AA)
- Focus states: always visible — never just outline: none

## Agentic UI Patterns
- Intent preview: use card + badge components together
- Confidence badge colors:
    high   → color-feedback-success
    medium → color-feedback-warning
    low    → color-feedback-danger
- Escalation flows MUST show a visible human handoff option


# PRISM Design System - Complete Master Specification

## Token Primitives (Raw Values)
- color-blue-500: #0066CC
- color-blue-700: #004C99  
- color-red-500: #E50914
- color-amber-500: #F4A300
- color-gray-900: #111111
- color-white: #FFFFFF
- color-black: #0A0A0A

## Semantic Tokens (Intent Layer)
- color-action-primary → color-blue-500
- color-action-destructive → color-red-500
- color-feedback-success → #00AA44
- color-feedback-warning → color-amber-500
- color-feedback-danger → color-red-500
- color-text-primary → color-gray-900
- color-text-inverse → color-white
- color-surface-default → color-white
- color-surface-raised → #F5F5F5

## Theme: BASE (default)
| Token | Value |
|-------|-------|
| --color-action-primary | #0066CC |
| --color-surface-default | #FFFFFF |
| --color-text-primary | #111111 |
| --color-surface-raised | #F5F5F5 |
| --border-radius-default | 6px |  

## Theme: ENTERTAINMENT
| Token | Value |
|-------|-------|
| --color-action-primary | #E50914 |
| --color-surface-default | #0A0A0A |
| --color-text-primary | #FFFFFF |
| --color-surface-raised | #1A1A1A |
| --border-radius-default | 0px |  

## Theme: EDUCATION
| Token | Value |
|-------|-------|
| --color-action-primary | #F4A300 |
| --color-surface-default | #FFFBF2 |
| --color-text-primary | #111111 |
| --color-surface-raised | #F5F5F5 |
| --border-radius-default | 10px |  

## AI Instructions
When generating any design system output:
1. Use these EXACT hex values for each theme
2. Never invent or approximate colors
3. Reference semantic token names in code comments
4. Generate CSS variables as: --token-name: value;


## Component Style Rules (CRITICAL for AI)

### Button Component
- PRIMARY button background: ALWAYS `var(--color-action-primary)`
- PRIMARY button text: ALWAYS `var(--color-text-inverse)` (white)
- NEVER use `var(--color-text-primary)` on a primary button
- If background is dark/colored, text MUST be white (#FFFFFF) for WCAG AA compliance

### Contrast Enforcement
- Any component with `background: var(--color-action-primary)` MUST have `color: var(--color-text-inverse)`
- For base theme: background #0066CC (dark blue) → text white
- For entertainment: background #E50914 (red) → text white
- For education: background #F4A300 (amber) → text dark (#111111) ONLY if background is light enough (WCAG contrast >=4.5:1)

### Theme-Specific Overrides
- Education theme primary button background #F4A300 (amber) is light, so text should be #111111
- All other themes: primary button text = white

### Implementation Example (DO THIS)
```css
.btn-primary {
  background: var(--color-action-primary);
  color: var(--color-text-inverse); /* always white except education */
}

/* Education theme exception */
[data-theme="education"] .btn-primary {
  color: #111111; /* dark text on amber */
}