# Dependency Security Review

**Review date:** 2026-11-20  
**Scope:** npm dependency audit for the workspace dependency tree; this is not a full application security assessment.  
**Toolchain:** Node.js 25.6.1, npm 11.9.0

## Current audit result

After the PostCSS remediation below, `npm audit` reports **0 vulnerabilities** (0 critical, 0 high, 0 moderate, 0 low, 0 info) across 503 dependencies (115 production, 350 development, 42 optional). `npm audit --omit=dev` also reports **0 vulnerabilities**, so no unresolved advisory remains on the production dependency tree.

| Dependency path | Classification | Status |
|---|---|---|
| `apps/web` → `next@15.5.29` → `postcss` | Next is a direct production dependency; PostCSS is transitive and on the production tree | **Resolved.** Now resolves to `postcss@8.5.33` (deduplicated at `node_modules/postcss`); the vulnerable nested `postcss@8.4.31` copy has been removed. |
| `apps/web` → `eslint-config-next` → `eslint-import-resolver-typescript` → `tinyglobby` → `fdir@6.5.0` → `picomatch@4.0.7` | Transitive development dependency | Not reported by the current audit. A previous audit reported a ReDoS advisory for picomatch through 4.0.7; the version is unchanged and development-only, so continue monitoring. |
| `apps/web` → `tailwindcss@3.4.19` → `chokidar`/`micromatch` → `picomatch@2.3.2` | Transitive development dependency | Not reported by the current audit. Build-time file matching only; no production path. |

## PostCSS remediation

### Advisories addressed

Next.js 15.5.29 declares an exact dependency on `postcss@8.4.31`, which is affected by:

- GHSA-qx2v-qp2m-jg93: XSS via unescaped `</style>` in stringified CSS (fixed in 8.5.10)
- GHSA-6g55-p6wh-862q: arbitrary file read through an attacker-controlled `sourceMappingURL` (fixed in 8.5.12)
- GHSA-r28c-9q8g-f849: path traversal in previous source-map auto-loading (fixed in 8.5.18)
- GHSA-fxqj-rqcc-2cmp: incomplete fix of GHSA-6g55-p6wh-862q when `from` is unset (fixed in 8.5.23)

### Why an override rather than a Next.js upgrade

- 15.5.29 was the newest 15.x release when checked, and every stable 15.x release (83 checked) pins `postcss@8.4.31`.
- npm's only automated fix is Next.js 16.4.6, a major upgrade, which was out of scope and was not applied.
- `npm audit fix --force` was not used.

### Version selected

`postcss@8.5.33`. It is the current `latest` release and clears every advisory above, whose minimum patched version is 8.5.23. It is also the version `apps/web` already declares directly, so Next shares one deduplicated copy instead of adding another version.

Compatibility review before applying:

- The exported PostCSS API is identical between 8.4.31 and 8.5.33: no keys added or removed.
- Next uses the deprecated `postcss.plugin` API, but Next installs its own shim for it (`next/dist/build/webpack/config/blocks/css/index.js`), so it does not depend on PostCSS's deprecated implementation.
- PostCSS 8.5.33 supports Node `^10 || ^12 || >=14`.

### Changes made

1. **`package.json`** (root). The override is scoped to the installed Next.js version only:
   ```json
   "overrides": { "next@15.5.29": { "postcss": "8.5.33" } }
   ```
2. **`package-lock.json`**: removed the single stale entry `node_modules/next/node_modules/postcss` (8.4.31). This is a controlled exception, explained below. Then ran `npm install --ignore-scripts --no-audit --no-fund`, which reported `removed 1 package`. No other package version in the lockfile changed. The only other change is that `node_modules/postcss` is no longer flagged `"dev": true`, because Next now uses it at production runtime.

### Why a manual lockfile correction was needed

npm commands run against a copy of the project were unable to drop the stale entry:

- `npm update postcss` made no change.
- `npm update postcss --workspaces --include-workspace-root` made no change.
- `npm install postcss@8.5.33 -w apps/web` made no change.
- `npm dedupe postcss` left the entry in place and changed only an unrelated package (`ignore` 7.0.14 → 7.0.16).

npm keeps an already-locked nested node and does not re-evaluate it against a newly added override. Regenerating the entire lockfile did apply the override, but it also changed 63 unrelated package versions, including some downgrades such as `fast-glob` 3.3.3 → 3.3.1. That broad change was rejected in favour of the single-entry correction.

A backup of the original lockfile (SHA-256 `262a6b29…6252`) was kept outside the repository before editing. Git history also retains the previous version.

### Reproducibility checks

These checks were run on a clean copy using the corrected lockfile and the scoped override:

- `npm ci` completed successfully and installed only `postcss@8.5.33`, with no nested copy under `next`.
- A subsequent `npm install` reported "up to date" and left `package-lock.json` byte-identical. The override is therefore stable and does not reintroduce 8.4.31.

## Verification results

| Check | Result |
|---|---|
| `npm ls postcss` | One copy, `postcss@8.5.33`, shared by Next, autoprefixer and Tailwind. The command exits with `ELSPROBLEMS`; see the limitations section. |
| `npm audit` | 0 vulnerabilities |
| `npm audit --omit=dev` | 0 vulnerabilities |
| Frontend TypeScript check (`npm run check -w apps/web`) | Passed |
| Backend TypeScript check (`npm run check -w apps/server`) | Passed |
| Frontend production build (`next build`, Next.js 15.5.29) | Passed; 4 static pages generated |
| Backend production build (`tsc -p tsconfig.json`) | Passed |
| CSS pipeline (production output) | All 99 distinct Tailwind classes used in `app/` and `components/` are present in the emitted CSS, including custom `brand` colours, arbitrary values and `hover:`/`sm:`/`md:`/`lg:` variants. No unprocessed `@tailwind` directives remain. Preflight and autoprefixer output are present. |
| Development server (`next dev`) | Started and reported "Ready in 8.7s" with no errors or warnings, then stopped |

## Remaining limitations

- **`npm ls postcss` reports `invalid`.** It flags `postcss@8.5.33` as invalid against Next's declared `8.4.31` and exits non-zero (`ELSPROBLEMS`). The same result occurs with every override form tested: version-scoped, unscoped `next`, global `postcss`, and `$postcss` reference. The cause has not been established. Installation is unaffected in testing: `npm ci` installs only 8.5.33, a repeat `npm install` leaves the lockfile unchanged, and `npm audit` is clean. Any CI step that runs `npm ls` without a package filter would fail on this.
- **The override is tied to `next@15.5.29`.** It stops applying if Next.js is changed. Upgrading to a release that ships patched PostCSS (16.x) makes it unnecessary. Any other 15.x change requires re-checking the nested PostCSS version.
- **Next.js has not been tested against PostCSS 8.5.33 by its maintainers.** Compatibility rests on the API review and the successful builds above.
- **Dev-mode CSS was not compiled.** `next dev` compiles CSS only when a page is first requested. HTTP and browser smoke tests were excluded at the user's direction, so this verification shows the dev server starts cleanly, while CSS processing was verified through the production build. No visual or browser check was run.
- **Development-only picomatch 4.0.7 remains** in the lint toolchain. It is not currently reported by `npm audit`.

## Earlier remediation (same review)

- Updated `next` and `eslint-config-next` together from `15.5.28` to `15.5.29`.
- Ran `npm audit fix` without `--force`, which applied compatible transitive updates and reduced 20 findings to 2.
- Updated server Zod to `4.6.7` to resolve an oversized-validation memory exhaustion advisory.
- Did not upgrade Tailwind CSS to v4 or Next.js to v16.

## Scope note

A clean dependency audit does not establish that the application is secure. Authentication, authorization, database migrations, business endpoints and production deployment have not yet been implemented or assessed.
