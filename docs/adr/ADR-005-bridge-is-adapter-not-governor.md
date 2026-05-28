# ADR-005 — The Bridge is an Adapter, Not a Governor

## Decision
`mcp-bridge` only translates/orchestrates the flow:

`tool call → REQUESTED → (governor evaluates) → GRANTED/ DENIED → execution → COMPLETED → REVOKED`

## Not allowed
The bridge **must not** evaluate scope, **must not** decide grants, and **must not** embed policy.
