# Local CLI Testing Guide

Test CLI locally before publishing to NPM.

## 1. Direct Node Execution

Run entry script inside repo (/local).

```bash
node app/index.js my-test-app
cd my-test-app
npm install
npm run dev
```

_Good for quick EJS template testing._

## 2. Check Template Dependencies

Use the repo scripts to compare and update the package files under `templates/` without installing the generated app first.

```bash
npm run deps:check
npm run deps:update
```

_This checks the template manifests against npm and writes newer versions back into the template `package.json` files._

## 3. Validation Checklist

After scaffolding, verify:

- [ ] `npm install` works (no missing dependency errors).
- [ ] `npm run dev` starts Vite/React Router.
- [ ] `package.json` deep-merged correctly.
- [ ] Empty `.ejs` files properly deleted.
- [ ] Selected Addons (Tailwind, Shadcn) apply styles.
