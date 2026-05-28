# ADR-004 — Capability Provenance

## Decision
Every `GRANTED` event must include verifiable provenance:

- `reason`
- `approved_by`
- `policy_rule`
- `scope_origin`

## Consequence
A grant without provenance is considered **arbitrary**, therefore invalid for audit.
