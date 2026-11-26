# URJ Security Review — npm Dependencies

> **Superseded.** The PostCSS finding was resolved on 2026-11-20. See `docs/SECURITY_AUDIT.md` for the current result (0 vulnerabilities).

**Review date:** 2026-11-20  
**Scope:** npm dependency audit only; not a full application security assessment.

## Findings

| # | Severity | Dependency path | Type | Summary |
|---|---|---|---|---|
| 1 | High | `apps/web` → `next@15.5.29` → `node_modules/next/node_modules/postcss@8.4.31` | Next is direct production; PostCSS is transitive production | PostCSS advisories include source-map path traversal/arbitrary `.map` file disclosure and related processing risks. |
| 2 | Moderate | `apps/web/package.json` → `next@15.5.29` | Direct production; audit aggregate via PostCSS | npm reports the Next.js finding through the nested vulnerable PostCSS copy; it is not a separate dependency path. |

The latest fresh `npm audit` reported two entries total: one high and one moderate. It reported no critical findings.

## Override and remediation status

The root `package.json` has a Next-version-scoped PostCSS override to `8.5.33`. However, both the lockfile and installed dependency tree still resolve Next's nested PostCSS to `8.4.31`; the override is not effective in the current resolved tree. Lockfile regeneration was not performed, so this finding remains unresolved.

The compatible Next.js patch `15.5.29` and matching `eslint-config-next@15.5.29` are installed. No forced major upgrade or manual lockfile edit was performed.

Recommended remediation is to retain the scoped override and run a normal `npm install` to regenerate the lockfile and install tree. Verify the nested PostCSS version, rerun `npm audit`, TypeScript checks and production builds. Do not use `npm audit fix --force`.

## Picomatch

The current audit does not report picomatch. Versions `4.0.7` and `2.3.2` remain only in development dependency paths; no production path was found. A prior audit reported ReDoS risk through version `4.0.7`, so this dependency should continue to be monitored and is not described as patched.

## Limitations

This dependency review does not certify the application as secure. Authentication, authorization, business endpoints and production deployment have not yet been implemented or assessed.
