# copilot.md

## Project Overview
Gametrove2025 is a React + TypeScript web application for managing and viewing game collections. It integrates with IGDB and PriceCharting APIs, supports user authentication via Auth0, and uses Vite for development/build.

## Tech Stack
- **Frontend:** React (TypeScript)
- **Build Tool:** Vite
- **Styling:** Tailwind CSS, PostCSS
- **Auth:** Auth0
- **API Integration:** IGDB, PriceCharting
- **Testing:** (add details if present)
- **Linting/Formatting:** ESLint, Prettier

## Directory Structure
- `src/` — Main application code
  - `application/` — Contexts, global state
  - `domain/` — Entities, models, interfaces
  - `infrastructure/` — API and auth services
  - `presentation/` — Components, hooks, layouts, pages, styles, utils
  - `shared/` — Shared types
- `public/` — Static assets
- `reference/` — Design docs, workflows, images

## Coding Conventions
- **TypeScript:** Use strict types, avoid `any`, prefer interfaces for props/models.
- **React:** Functional components only, hooks for state/effects, context for global state.
- **Naming:**
  - Components: PascalCase
  - Files: camelCase or PascalCase as appropriate
  - Types/Interfaces: PascalCase
- **Exports:** Prefer named exports; default exports for pages/components only if necessary.

## Patterns & Practices
- **State:** Local state via hooks, global/context for auth/profile.
- **API:** Centralize API calls in `infrastructure/api/`, return typed data.
- **Error Handling:** Normalize errors, use boundary components for UI fallback.
- **Styling:** Use Tailwind classes, keep custom styles in `presentation/styles/`.
- **Testing:** (Add details if present)
- **Linting:** Run `npm run lint` before commits.

## Environment & Security
- Use `.env` for secrets/config (never commit secrets).
- Validate all external inputs.
- Keep dependencies updated.

## Release Checklist
- All TODOs resolved or tracked
- No TypeScript errors
- Tests pass
- Lint passes

## Useful npm Scripts
- `dev` — Start dev server
- `build` — Production build
- `lint` — Run ESLint

## References
- See `reference/` for design docs and workflows.
- See `README.md` for setup instructions.

---
_Keep this file updated as project conventions or structure change._

