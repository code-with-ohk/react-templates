# Adding a New Add-on — Integration Guide

Purpose: concise checklist and rules for adding a new addon to this generator so it composes cleanly with routers, query, forms, styling, and auth.

Quick checklist

- Add template folder: `templates/addons/<addon-name>/`
- Add addon `package.json` (dependencies only)
- Add EJS template files for every integration point (see below)
- Update `app/constants.js` and `app/cli.js` to expose addon and CLI prompts
- Update `app/scaffold.js` to copy files and merge `package.json`
- Ensure `app/template.js` rendering receives needed flags
- Validate generated project with `get_errors` and manual run

Detailed steps

1. Plan addon scope

- Which existing features it touches: routing, forms, query, shadcn/tailwind, auth providers.
- Decide whether addon needs per-router files (React Router pages/, React Router Framework app/routes/, TanStack routes/).

2. File layout

- Create `templates/addons/<addon-name>/package.json` with only the runtime dependencies.
- Add `templates/addons/<addon-name>/src/` with folders matching the base template expectations:
    - `src/pages/` (React Router SPA)
    - `app/routes/` (React Router Framework)
    - `src/routes/` (TanStack Router / Start)
    - `src/components/` for reusable UI components
    - `src/auth/` for provider wrappers if auth-related
- Use `.ejs` everywhere so renderer prunes unused files.

3. EJS templates and conditionals

- Always use top-level file guards; avoid placing EJS inside JSX attributes.
    - Good: `<% if (queries.authClerk) { %> ... whole file ... <% } %>`
    - Bad: `className={"<%- queries.tailwind ? '...' : '' %>"}` inside JSX expression mixing logic.
- Guard imports at top of file to avoid unused import errors.
  -- Prefer checking `queries.<nameBoolean>` in templates. Generate `queries` in the CLI with `computeQueries(addons)` and pass it into the template renderer (see step 5).

4. Router differences

- React Router SPA: emit `src/pages/<name>.tsx` (default export) and link via `react-router-dom` `Link`.
- React Router Framework (file-based app): emit `app/routes/<name>.tsx` and update `app/routes.ts.ejs` to register routes.
- TanStack Router / Start: emit `src/routes/<name>.tsx` and export `export const Route = createFileRoute('/path')({ component: Page })`.
  -- Always ensure home pages conditionally show navigation only when the auth addon is selected (e.g. `queries.authClerk` or `queries.authSupabase`) and a router is selected (e.g. `queries.reactRouter`).

5. CLI + constants

- Add entry to `app/constants.js` `ADDONS` array (label + value). If addon has sub-options (router/forms/auth), add corresponding constants arrays.
- Update `app/cli.js` to: prompt for addon, handle any sub-prompts (router family, forms stack, auth provider), and replace placeholder tokens in `addons` array (e.g. replacing `router` with `tanstack-router`).
- When calling `processEjsTemplates(targetDir, data)`, provide a helpful `data` object: e.g.

```js
const queries = computeQueries(addons);
await processEjsTemplates(targetDir, { addons, name: projectName, queries });
```

This makes template guards clearer when you need a single boolean across templates.

6. Scaffold behavior

- `app/scaffold.js` must copy the addon folder into the generated project. Keep file copy semantics simple (fs-extra copy).
- Merge `package.json` dependencies with `lodash.merge` or a small merge routine; prefer only adding `dependencies` and `devDependencies` keys.
- If addon requires additional setup steps (postinstall, script changes), document them in the addon `README.md` and optionally prompt the user in the CLI to run installers.

7. Base template integration

- Avoid duplicating feature code in `templates/base`; instead let addons provide optional components and the base import them conditionally.
- `templates/base/src/main.tsx.ejs`: provider wiring (AuthProvider, QueryClientProvider) should be conditional based on addons.
- `templates/base/src/App.tsx.ejs`: for "no-router" projects show a single `LoginOrProtectedPanel` for auth addons; do not emit router links in this mode.

8. Environment variables

- Use `import.meta.env` (Vite) for build-time envs (e.g. `VITE_CLERK_PUBLISHABLE_KEY`). Add `.env.example` to addon folder when needed.

9. E2E / QA checklist for each addon

- Render templates into `local/<test-name>` using the CLI flow.
- Run `get_errors` (TypeScript/compile checks) across the generated files.
- Install and run dev server locally with a sample env for provider-based addons.
- Test combos: with and without `tailwind`, with `shadcn`, with `tanstack-query`, and across router families.

10. PR checklist

- Add `docs/<addon-name>.md` describing the addon if non-trivial.
- Update `CHANGELOG.md` if present.
- Ensure tests or basic `get_errors` pass.
- Add a short `local-testing-guide.md` entry for how to generate a test project.

Notes / Best Practices

- Keep EJS logic at file level; treat templates as composition rather than branching JSX inside components.
- Avoid emitting both `pages/` and `routes/` for the same router family — guard files carefully.
- Prefer small, focused addons: if a feature touches many subsystems, split into helper addons (e.g., `auth-core` + `auth-clerk`).
- Document any non-standard runtime needs (server callbacks, admin keys) in the addon's `.env.example`.

Example: Adding `auth-clerk`

- Add `templates/addons/auth-clerk/package.json` with `@clerk/react` dep.
- Add `src/auth/context.tsx`, `src/auth/provider.tsx.ejs`, `src/auth/require-auth.tsx`, `src/auth/login-panel.tsx.ejs`.
- Add router-specific pages/routes for `/login` and `/protected` guarded by router checks.
- Update `app/constants.js` to list `auth` and `AUTHENTICATION_PROVIDERS` options.
- Update `app/cli.js` to prompt for auth provider when `auth` selected.
- Ensure `templates/base/src/main.tsx.ejs` conditionally wraps `AuthProvider`.
