# capability-policy

Governance policy for capability requests.

## Rules (high level)

1. Every request must append a `REQUESTED` event into the ledger.
2. Evaluation produces `EVALUATED` plus a verdict:
   - `GRANTED` (with TTL + provenance) or
   - `DENIED` (with reason and `ruleId`).
3. If granted:
   - the capability becomes `ACTIVE` **only** during its TTL window;
   - after execution it must be `COMPLETED`;
   - it must always end with `REVOKED` (mandatory revocation).
4. A `GRANTED` event without provenance is invalid.

## Roles (demo)

- `capability_governor`: grants/denies (represented by the validator logic).
- `executor-agent`: executes the tool call only if it holds a valid grant.
