# Project Workflow & Performance Rules

## Development Workflow Rules

Do NOT automatically run:
- `npm run build`
- `npx tsc`
- `npx tsc --noEmit`
- `npm test`
- `npm run lint`

after every implementation. These commands are expensive and interrupt development.

Instead:
- Implement the requested feature first.
- Verify affected files through reasoning while coding.
- Only run verification when:
  - The user explicitly asks for it.
  - A major feature milestone is completely finished.
  - A critical change requires validation before continuing.

If verification is needed:
1. Prefer `npx tsc --noEmit` for quick type checking.
2. Only run `npm run build` once at the end of a milestone or before deployment.
3. Never repeatedly run builds after small code changes.

Assume the development server is already running unless explicitly told otherwise.
Do not restart servers unless absolutely necessary.
