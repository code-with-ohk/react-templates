# Architecture — create-react-template

Structural and rule-based reference for this generator. Read before modifying.

## Tech Stack

- **Runtime:** Node.js ESM (CLI tool), published to npm.
- **CLI deps:** `@clack/prompts`, `chalk`, `ejs`, `fs-extra`.
- **Generated projects:** Vite + React 19 + TypeScript.
- **Templating:** EJS `.ejs` files rendered at scaffold time (composition-based).
- **Publishing:** GitHub Actions workflow on release → `npm publish` (OIDC provenance).

## Core Directory Boundaries

```
app/                 CLI tool core (Node ESM)
  index.js           Entry point (bin `crt`), delegates to cli.js
  cli.js             Interactive prompts; collects name, add-ons, router, forms, auth
  constants.js       ADDONS, ROUTERS lists + computeQueries(addons) -> queries booleans
  scaffold.js        copyBaseTemplate, applyAddon (file copy + package.json dep merge), installDependencies
  template.js        processEjsTemplates: recursive .ejs render, delete empty rendered files, prune empty dirs
  scripts/           sync-template-deps.js (check/write template dep versions)

templates/
  base/              Vite + React 19 + TS foundation (EJS conditionals)
  addons/            Optional overlays: tailwind, shadcn, tanstack-query,
                     react-router, react-router-framework, tanstack-router, tanstack-start,
                     forms-rhf-zod, forms-tanstack, auth-clerk, auth-supabase,
                     i18n, code-quality

docs/                Human guides (adding-addon-guide, local-testing-guide, npm-publish-guide)
local/               Local scratch/test projects + release notes. NOT published.
.github/             Workflows + instructions + this architecture reference
```

## Directory Responsibility Rules

- `app/`: owns the generator runtime only. Never put generated-project code here.
- `templates/base/`: shared foundation. Feature code lives in addons, imported conditionally — do not duplicate feature code into base.
- `templates/addons/<name>/`: self-contained feature overlay. Files are copied into the target project as-is (except `package.json`, see merge rules).
- `local/`: throwaway test projects and release notes. Safe to regenerate/delete.

## Add-on Composition Model

- Addons overlay the base; each addon may emit files into router-specific locations:
    - React Router SPA → `src/pages/*.tsx`
    - React Router Framework → `app/routes/*.tsx` + registration in `app/routes.ts.ejs`
    - TanStack Router / Start → `src/routes/*.tsx` with `createFileRoute`
    - Shared helpers → `src/auth/`, `src/lib/`, `src/components/`
- `package.json` is never copied blindly from an addon. Dependencies/devDependencies/peerDependencies and scripts are merged via safe-merge (existing versions win).
- `.ejs` files may render to empty string; the renderer deletes them and prunes leftover empty dirs.

## Invariable Rules

- **EJS guards:** use top-level file guards; keep EJS out of JSX attributes. Prefer `<% if (queries.X) { %> ... <% } %>` over inline logic in JSX.
- **Central queries object:** all template conditionals use `queries.*` booleans from `computeQueries(addons)`. Never gate on raw `addons.includes` inside templates.
- **Composition over duplication:** use base + addon conditionals instead of nearly-identical static templates.
- **Auth pattern:** provider wrapper (`src/auth/`) + `useAuth` hook + `RequireAuth` + per-router `/login` & `/protected` routes. Auth home nav must live in each router's home/index template.
- **Supabase auth:** OAuth-only providers (`google`, `github`). Client env: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
- **Supported matrices:**
    - Routers: react-router, react-router-framework, tanstack-router, tanstack-start
    - Forms: forms-rhf-zod, forms-tanstack
    - Auth: auth-clerk, auth-supabase (no JWT option)
    - Other: i18n, code-quality
- Every addon must work in isolation and combined with others; test with and without tailwind/shadcn/query and across router families.

## Boundary Rules / Do Not Touch

- `package.json` (root): version, name, bin, publishConfig. Do not edit casually; version bumps follow release flow.
- `templates/base/package.json`: dependency baseline — bump only via `app/scripts/sync-template-deps.js`, never by hand.
- `app/constants.js`: source of truth for addon/router lists and `queries` flags. Addons must be registered here + in `cli.js` + `scaffold.js` merge path.
- `.github/workflows/release.yml`: publish pipeline; changes require explicit user instruction.
- `templates/addons/**/package.json`: addon dependency manifests — merge semantics are non-overwrite.
- Generated projects under `local/`: regenerable, but may embed template bugs — validate before treating as source of truth.

## Change Flow (safe path)

1. Modify addon template files in `templates/addons/<name>/` or base conditionals.
2. Register/update addon in `app/constants.js` and `app/cli.js` if CLI-facing.
3. Confirm `package.json` merge path in `app/scaffold.js` covers the addon.
4. Render a test project into `local/<name>` via the CLI flow.
5. Run compile/type checks (`get_errors`) across generated files.
6. Update `docs/` guide and release notes under `local/` when behavior changes.
