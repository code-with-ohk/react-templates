# Version Control & NPM Publish Guide

This guide explains how to release new updates for `create-react-template`.

## 1. Commit Changes

Make sure code is clean and tested.

```bash
git add .
git commit -m "feat: your new feature"
```

## 2. Bump Version

Use npm to safely increment `package.json` version.

```bash
npm version patch # For bug fixes (1.0.1)
npm version minor # For new features (1.1.0)
npm version major # For breaking changes (2.0.0)
```

_Note: This automatically creates a git tag._

## 3. Push to GitHub

Push commits and new version tags to `main` branch.

```bash
git push origin main --tags
```

## 4. Trigger Auto-Publish

Your repo has a GitHub Action (`.github/workflows/release.yml`) that auto-publishes to NPM.

To trigger it:

1. Go to your GitHub Repository -> **Releases**.
2. Click **Draft a new release**.
3. Choose the tag you just pushed (e.g., `v1.0.1`).
4. Add release notes.
5. Click **Publish release**.

GitHub Actions will automatically run `npm ci` and `npm publish`. No manual NPM login needed.
