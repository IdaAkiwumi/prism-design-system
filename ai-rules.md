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
- Use motion-duration-fast (200ms) for micro‑interactions: button hovers, toggle switches, badge appearance, tooltip entrance.
- Use motion-duration-moderate (300ms) for moderate changes: modal open/close, drawer slide, page transitions, accordion expand.
- **Do not** animate layout properties that trigger expensive reflows (width, height, top/left) – prefer transforms and opacity.

## Theme Rules
- Apply themes via data-theme on the root element
  <html data-theme="entertainment">
- NEVER duplicate or fork components for different themes
- Only override semantic tokens in theme files — never primitives

## Accessibility
- Text on any background: minimum 4.5:1 contrast ratio (WCAG AA) for normal text; 3:1 for large text (≥18px or bold ≥14px).
- Focus states: always visible — never just outline: none. Use 2px solid `--color-action-primary` with 2px offset.
- All interactive controls must have an accessible name (aria-label or visible text).

## Agentic UI Patterns
- Intent preview: use card + badge components together.
- Confidence badge colors:
    high   → color-feedback-success (green)
    medium → color-feedback-warning (amber)
    low    → color-feedback-danger (red)
- Escalation flows MUST show a visible human handoff option (e.g., “Talk to a person” button) when confidence = low.
- For confidence = medium, offer both “Approve” and “Edit” actions. For low, also explain why confidence is low (“Uncertain due to missing data”).


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

- color-action-primary → color-blue-500 | Primary CTAs, interactive links, focused elements. **Use for:** submit buttons, confirm dialogs, primary navigation links, active tab indicators, “Save”, “Confirm”, “Next”. **Do NOT use for:** cards, badges, decorative icons, non‑interactive elements, or secondary actions. This token should appear at most once per major screen section.

- color-action-destructive → color-red-500 | Destructive or irreversible actions: delete, remove, revoke access, permanently discard. **Always** pair with a confirmation dialog that explains consequences. **Never** use for non‑destructive errors (use color-feedback-danger instead). Example text: “Delete account” – use destructive colour.

- color-feedback-success → #00AA44 | Positive confirmations, completed tasks, successful form submissions. **Use for:** toast messages (“Saved”), success badges, progress completion states, “Success” banners. **Never** for decorative green or neutral positive feedback.

- color-feedback-warning → color-amber-500 | Cautionary states requiring attention but not errors. **Examples:** approaching storage limit, soon‑to‑expire subscription, low battery, “Are you sure?” prompts. **Do NOT** use for errors or destructive actions.

- color-feedback-danger → color-red-500 | Errors, failed validations, critical system alerts. **Always** pair with a non‑color indicator: an error icon (⚠️) and clear text explaining the issue. **Never** use for user‑initiated destructive actions (use color-action-destructive). Example: “Password incorrect”, “Network error”.

- color-text-primary → color-gray-900 | Main body copy on light surfaces. **Use for:** paragraphs, list items, form labels, headings (except when inverse is required). **Minimum contrast 4.5:1** with background.

- color-text-inverse → color-white | Text on dark or coloured backgrounds. **Use for:** buttons with coloured backgrounds, dark mode surfaces, hero sections with dark overlays. **Never** use on light backgrounds (contrast will be too low).

- color-surface-default → color-white | Primary page/background surface. **Use for:** overall app background, content areas, any component that sits directly without a container.

- color-surface-raised → #F5F5F5 | Elevated surfaces: cards, modals, dialogs, dropdowns, tooltips. Provides visual hierarchy above default surface. Use for any component that should appear as a distinct container.

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
| --color-surface-raised | #2C2C2C |
| --border-radius-default | 0px |
| --card-border | 1px solid rgba(255,255,255,0.08) |

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
- PRIMARY button text: ALWAYS `var(--color-text-inverse)` (white) EXCEPT for Education theme.
- Education theme: background `#F4A300` (light amber), text `#111111` (dark) for sufficient contrast (4.5:1).
- NEVER use `var(--color-text-primary)` on a primary button unless explicitly overridden for Education theme.

### Contrast Enforcement
- Any component with `background: var(--color-action-primary)` MUST have:
  - For Base & Entertainment themes: `color: var(--color-text-inverse)` (white)
  - For Education theme: `color: #111111`
- Base theme background #0066CC (dark blue) → white text (contrast 4.56:1)
- Entertainment background #E50914 (red) → white text (contrast 4.54:1)
- Education background #F4A300 (amber) → dark text #111111 (contrast 4.5:1 exactly)

### Theme-Specific Overrides – Implementation Example
```css
.btn-primary {
  background: var(--color-action-primary);
  color: var(--color-text-inverse);
}

[data-theme="education"] .btn-primary {
  background: #F4A300;
  color: #111111;
}
```

## Additional Guidelines for AI Code Generation
- When generating a card component, apply `background: var(--color-surface-raised)` and `border-radius: var(--border-radius-default)`.
- For modals, use `--color-surface-raised` for background and `--color-action-primary` for confirm button.
- Always include a `@media (prefers-reduced-motion: reduce)` wrapper around any transition or animation.
- For agentic intent preview cards: structure = card container + confidence badge (matching colour token) + action buttons. Confidence label must be visible text, not just colour.
- For dark themes (Entertainment), cards should use a subtle light border: `border: var(--card-border, none)` to improve separation.

## Nested cards (cards inside cards)
- A card that appears as a direct child of another card MUST use `background: var(--color-surface-default)` instead of `var(--color-surface-raised)`.
- Add a subtle border or box‑shadow to the inner card to ensure clear visual separation.
- Example:
```css
.card .card {
  background: var(--color-surface-default);
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
  border: 1px solid rgba(0,0,0,0.1);
}
```

---
*End of PRISM rules – follow exactly.*