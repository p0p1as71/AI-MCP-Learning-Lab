# ADR-004 — capability provenance

## Decisión
Todo evento `GRANTED` debe incluir provenance verificable:

- `reason`
- `approved_by`
- `policy_rule`
- `scope_origin`

## Consecuencia
Un grant sin provenance se considera **arbitrario** y por tanto inválido para auditoría.

