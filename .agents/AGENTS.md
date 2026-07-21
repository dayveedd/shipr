# Project Workflow & Performance Rules

## Development Workflow Rules

Do NOT automatically run:
- `npm run build`
- `npx tsc`
- `npx tsc --noEmit`
- `npm test`
- `npm run lint`

STRICT RULE: Do NOT run `npx tsc`, `npx tsc --noEmit`, `npx tsx`, `npm run build`, or any `npx` / verification commands after code edits.
Verify affected files purely through careful reasoning while coding. Only run verification commands if the user explicitly types a request to run it.

Assume the development server is already running unless explicitly told otherwise.
Do not restart servers unless absolutely necessary.

## Git Commit & Push Rules
- Do NOT automatically run `git add`, `git commit`, or `git push` after code edits or fixes.
- Keep all code changes local in the working directory.
- Only run `git commit` or `git push` when the user explicitly requests it.
