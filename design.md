# Code Mentor Design System

This document is the visual source of truth for Code Mentor. Before creating or changing a page, component, or state, read this file and preserve these tokens and rules.

## Design Direction

Code Mentor is a local-first code knowledge workbench, not a general chat interface. The visual language adapts Zaro's cloud/umber system: warm off-white surfaces, deep umber contrast, compact technical metadata, pixel-like signals, asymmetric layouts, and generous whitespace.

Use the Zaro reference as a visual direction only. Do not copy Zaro's logo, illustrations, marketing copy, analytics shell, or decorative assets.

The reading experience has priority over decoration. Every visual element must help the user start, scan, understand, revisit, or retain a Lesson.

## Color Tokens

### Light theme

| Token | Value | Usage |
| --- | --- | --- |
| `--background` | `#ECEBE5` | Page background and browser surface |
| `--surface` | `#FAFAF8` | Raised panels, inputs, active reading surfaces |
| `--surface-muted` | `#DAD8CE` | Skeletons, muted controls, code-adjacent surfaces |
| `--surface-deep` | `#292521` | Code blocks and dark feature surfaces |
| `--text` | `#201613` | Headings, primary body copy, primary buttons |
| `--text-soft` | `#60574C` | Secondary copy, metadata, helper text |
| `--text-faint` | `#8F827A` | Timestamps, inactive metadata, disabled copy |
| `--line` | `rgba(32, 22, 19, 0.14)` | Dividers and low-emphasis outlines |
| `--line-strong` | `rgba(32, 22, 19, 0.24)` | Input focus-adjacent borders and active outlines |
| `--accent` | `#A3D7DE` | Primary technical signal and selected states |
| `--accent-strong` | `#3990A1` | Accent text on light surfaces |
| `--accent-wash` | `#DCEFF1` | Accent background, selected tags, inline feedback |
| `--accent-secondary` | `#BDB4F8` | Optional secondary context marker, never a gradient |
| `--error` | `#9A4335` | Errors and destructive feedback |
| `--success` | `#3F694B` | Save and completion feedback |

### Dark theme

| Token | Value | Usage |
| --- | --- | --- |
| `--background` | `#201613` | Page background |
| `--surface` | `#292521` | Panels and inputs |
| `--surface-muted` | `#3B2D28` | Muted controls and separators |
| `--surface-deep` | `#130D0B` | Code blocks and deepest surfaces |
| `--text` | `#FAFAF8` | Headings and primary body copy |
| `--text-soft` | `#C2BFAF` | Secondary copy and metadata |
| `--text-faint` | `#988F77` | Inactive metadata and helper text |
| `--line` | `rgba(250, 250, 248, 0.16)` | Dividers and low-emphasis outlines |
| `--line-strong` | `rgba(250, 250, 248, 0.28)` | Active outlines |
| `--accent` | `#A3D7DE` | Primary technical signal |
| `--accent-strong` | `#8BCBD5` | Accent text and active controls |
| `--accent-wash` | `#2E4A4D` | Accent background and inline feedback |
| `--accent-secondary` | `#BDB4F8` | Optional secondary context marker |
| `--error` | `#F09D8D` | Errors and destructive feedback |
| `--success` | `#9DCCAA` | Save and completion feedback |

Rules:

- Use one primary accent per surface. Cyan is the default Code Mentor accent.
- Lilac may mark a secondary context only; never use purple AI gradients or glow effects.
- Use `#ECEBE5` and `#201613` as the recognizable Code Mentor foundation.
- Never use pure black or pure white as a page background.
- Text contrast must meet WCAG AA. Body text targets 4.5:1 or better.
- Shadows, if needed, must be warm/tinted and diffuse. Prefer tonal surfaces and dividers over shadows.

## Typography

### Font families

- Display and UI: `Saans`, then `ui-sans-serif`, `system-ui`, sans-serif.
- Code and technical metadata: `JetBrains Mono`, then `SFMono-Regular`, `ui-monospace`, monospace.
- Do not introduce Inter, Roboto, Arial, or a decorative serif as defaults.
- If a font asset is added, self-host it and use `font-display: swap`.

### Type scale

| Role | Size | Weight | Line height | Tracking |
| --- | --- | --- | --- | --- |
| Page display | `clamp(44px, 7vw, 88px)` | 500-600 | `0.94` | `-0.06em` |
| Page heading | `clamp(40px, 6vw, 72px)` | 500-600 | `0.96` | `-0.05em` |
| Lesson title | `clamp(36px, 5vw, 64px)` | 500-600 | `0.98` | `-0.045em` |
| Section heading | `20px` | 600 | `1.25` | `-0.025em` |
| Body reading | `16px` | 400 | `1.72` | normal |
| Large lead | `20px-24px` | 500 | `1.45` | `-0.02em` |
| UI label | `12px-14px` | 500-600 | `1.35` | `0.01em` |
| Mono metadata | `10px-12px` | 500 | `1.4` | `0.08em` |
| Code | `13px-14px` | 400-500 | `1.7` | normal |

Rules:

- Use sentence case for headings and controls.
- Eyebrows are rare and contextual, not a mandatory heading prefix.
- Keep reading paragraphs between 60 and 75 characters where possible.
- Use `text-wrap: balance` on display headings and `text-wrap: pretty` on long prose.
- Numbers, dates, statuses, and categories may use JetBrains Mono.

## Spacing

Use a 4px base scale:

| Token | Value | Typical usage |
| --- | --- | --- |
| `space-1` | `4px` | Icon and label micro-gap |
| `space-2` | `8px` | Inline control gap |
| `space-3` | `12px` | Compact field and row gap |
| `space-4` | `16px` | Standard component padding |
| `space-5` | `20px` | Reading block gap |
| `space-6` | `24px` | Panel padding and control groups |
| `space-8` | `32px` | Page subsection separation |
| `space-10` | `40px` | Major content separation |
| `space-12` | `48px` | Page heading to content |
| `space-16` | `64px` | Desktop section separation |
| `space-24` | `96px` | Home hero breathing room |

Layout rules:

- Desktop page container: `1040px` to `1320px`, centered.
- Lesson reading column: `720px` to `780px` maximum.
- Desktop page side padding: `32px` to `48px`.
- Mobile page side padding: `16px`.
- Home uses an asymmetric two-column composition above `768px`.
- All multi-column layouts become one column below `768px`.
- Lesson content sections use vertical rhythm and dividers instead of repeated cards.

## Components

### Buttons

- Primary button: deep umber background in light theme, light cloud background in dark theme, `#A3D7DE` only for selected or signal states.
- Height: `40px` to `48px`.
- Horizontal padding: `16px` to `20px`.
- Radius: `8px` to `10px`.
- Weight: `600`.
- Hover: move `2px` or shift surface color with `220ms cubic-bezier(0.16, 1, 0.3, 1)`.
- Active: `scale(0.98)` or `translateY(1px)`.
- Disabled: reduce opacity, preserve readable text, do not remove focusability semantics.
- Button labels must fit on one line on desktop.

### Inputs

- Labels sit above fields and remain visible.
- Height: `42px` to `48px` for single-line fields.
- Padding: `12px`.
- Radius: `8px`.
- Background: `--surface`.
- Border: `1px solid --line`; focus uses `--accent-strong` and a visible outline.
- Placeholder uses `--text-faint`, never a light gray that fails contrast.
- Textareas may grow vertically and must not create horizontal overflow.

### Cards and panels

- Use a panel only when it communicates a real boundary or hierarchy.
- Radius: `10px` to `16px`; pills are reserved for tags and compact statuses.
- Prefer a tonal surface plus one subtle divider over a border-and-shadow stack.
- Avoid nested cards and equal-height card walls.
- Code blocks use `--surface-deep`, `12px` radius, and `16px` to `20px` padding.
- Interaction feedback uses `--accent-wash` and remains in document flow.

### Navigation

- Header height: `56px` to `64px`.
- Maximum width: `1440px`.
- Use a compact rounded shell with `10px` to `12px` radius, subtle translucent surface, and a single soft shadow or divider.
- Navigation remains one line on desktop.
- Active links use text contrast plus `--accent` signal, not a large filled pill.
- The header must never cover Lesson content or become a full-screen overlay for simple navigation.

### Status and metadata

- Use JetBrains Mono at `10px` to `12px`.
- Use uppercase sparingly for technical labels.
- Status pills use `6px` to `999px` radius depending on size, with no heavy shadow.
- Do not invent metrics or progress percentages.

## Motion and States

- Motion communicates hierarchy, feedback, or state change.
- Use opacity and transform for transitions; avoid scroll event listeners.
- Use skeletons shaped like the final content for loading.
- Errors are inline, specific, and include a recovery action.
- Empty states explain what will populate the surface and provide a next action.
- Respect `prefers-reduced-motion` by disabling automatic reveals and infinite movement.
- No fixed panel may obscure Lesson content.

## Responsive Rules

- Desktop breakpoint: `1024px` for navigation and large layout changes.
- Mobile layout breakpoint: `768px`.
- At mobile widths, asymmetric grids become a single column with `16px` side padding.
- Preserve horizontal scrolling only for code and compact filter rows.
- Never use `100vh` for full-height content; use `100dvh` when viewport height is required.
- Test at `1440x900`, `1280x800`, `768x1024`, and `390x844`.

## Product Boundaries

- Keep React, Vite, TypeScript, FastAPI, and SQLite.
- Keep local-first, single-user MVP behavior.
- Do not add authentication, RAG, document upload, or code execution.
- Lesson reading remains the primary surface.
- Future pages must read this file before implementation and reuse these tokens rather than creating page-specific color systems.
