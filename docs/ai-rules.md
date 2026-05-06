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