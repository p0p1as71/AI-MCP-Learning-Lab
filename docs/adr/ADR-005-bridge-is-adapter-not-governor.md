# ADR-005 — el bridge es adaptador, no gobernador

## Decisión
`mcp-bridge` solo traduce/orquesta el flujo:

`tool call → REQUESTED → (governor evalúa) → GRANTED/ DENIED → ejecución → COMPLETED → REVOKED`

## No permitido
El bridge **no** evalúa scope, **no** decide grants, **no** incorpora policy.

