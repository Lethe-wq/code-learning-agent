# Code Mentor Frontend Design Spec

## Product Positioning

Code Mentor is a code knowledge explanation assistant. The MVP focuses on helping users understand programming knowledge points in Python, C++, SQL, and algorithms.

The first version prioritizes structured explanation, examples, comparison, and follow-up questions. It is not a quiz-first or exercise-first product.

## Visual Direction

The interface uses a warm iOS liquid glass style.

- Main colors: warm white, soft beige, gentle gray.
- Components should blend into the background instead of using strong borders.
- Visual separation should rely on translucency, inner highlights, soft shadows, and depth.
- The interface should feel quiet, minimal, and reading-first.
- Code blocks should use a warm graphite tone instead of a strong cold dark theme.
- Avoid high-saturation colors and heavy card borders.

## Home Dashboard

The home page uses a ChatGPT-style dashboard.

Core structure:

- Top area: logo, history, notes, and settings entry.
- Center area: large headline and central natural-language input.
- The input is the primary entry point for learning intent.
- Example input: "Explain Python decorators clearly and compare them with closures."
- Below the input: language/topic chips for Python, C++, SQL, and algorithms.
- Lower area: recent learning, weak points, and recommended knowledge points.

Design intent:

- The home page should not feel like a course catalog.
- It should feel like a natural-language learning entry point.
- Users should be able to start by typing what they want to understand.

## Lesson Page

The lesson page uses a single-column reading layout.

Core structure:

- Top search entry remains available.
- Main explanation content is centered and dominates the page.
- No persistent right sidebar.
- No floating action buttons that cover the reading content.
- Lesson actions are placed beside the title area.

Title area actions:

- Rephrase
- Give example
- Compare
- Save
- Review
- Ask AI

Content blocks:

- One-sentence understanding
- Core explanation
- Code example
- Prerequisites
- Common use cases
- Common misconceptions
- Summary or review points

## Interaction Principles

- AI is an assistant, not the main visual focus.
- The reading flow should not be interrupted by sidebars, drawers, or floating panels by default.
- Follow-up actions should be visible but lightweight.
- Asking AI, rephrasing, giving examples, and comparison should be contextual to the current knowledge point.
- Notes and review should support learning retention without turning the MVP into a full course platform.

## Routes

- `/`: home dashboard.
- `/lesson/:id`: knowledge explanation page.
- `/history`: learning history. This can be implemented as a light page or modal in the MVP.
- `/notes`: learning notes. This can be implemented as a light page or modal in the MVP.

## Confirmed Decisions

- The home page uses a ChatGPT-style dashboard.
- The lesson page uses a single-column reading layout.
- Quick actions are placed beside the lesson title, not as floating buttons.
- The visual style is warm, low-border iOS liquid glass.
- The MVP prioritizes desktop Web first.
- The MVP focuses on knowledge explanation rather than exercises.
- Backend design will be discussed separately and should respect these frontend constraints.
