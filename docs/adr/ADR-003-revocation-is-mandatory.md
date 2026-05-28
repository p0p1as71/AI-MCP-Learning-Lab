# ADR-003 — Revocation is Mandatory

## Decision
Every grant must end in `REVOKED` (always), even in case of failure.

## Consequence
This prevents “capability leaks” (permissions accidentally left alive).
