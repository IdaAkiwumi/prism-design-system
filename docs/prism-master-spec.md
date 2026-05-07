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
| color-action-primary | #0066CC |
| color-surface-default | #FFFFFF |
| color-text-primary | #111111 |

## Theme: ENTERTAINMENT
| Token | Value |
|-------|-------|
| color-action-primary | #E50914 |
| color-surface-default | #0A0A0A |
| color-text-primary | #FFFFFF |
| color-surface-raised | #1A1A1A |

## Theme: EDUCATION
| Token | Value |
|-------|-------|
| color-action-primary | #F4A300 |
| color-surface-default | #FFFBF2 |
| color-text-primary | #111111 |

## AI Instructions
When generating any design system output:
1. Use these EXACT hex values for each theme
2. Never invent or approximate colors
3. Reference semantic token names in code comments
4. Generate CSS variables as: --token-name: value;