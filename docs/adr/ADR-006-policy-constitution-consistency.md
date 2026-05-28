# ADR-006 — Policy/Constitution Consistency Check

## Decision
Add a **check-time** validation that ensures `governance/policy.json` is consistent with what the runtime expects.

Specifically, `npm run check` must fail if:

- `policy.json` is malformed (missing `roles`, `scopes`, or `defaults`),
- `roles.*.canExecute` / `roles.*.canGrant` reference unknown scopes,
- `defaults.ttlSeconds` is outside the allowed range,
- filesystem scopes are missing `allowedBaseDirs` or use non-relative paths.

## Consequence
Misconfigurations are caught **before execution** (check-time), instead of failing at runtime.
