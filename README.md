# AI-MCP-Learning-Lab

Proyecto demo para estudiar **MCP como objeto de governance** (capability ≠ autoridad), implementando:

- **Ledger append-only** de eventos (verdad auditable)
- **Capability lifecycle** (requested → evaluated → granted → active → completed → revoked / denied)
- **Grants temporales con TTL** + **revocación obligatoria**
- **Provenance** en cada evento `GRANTED` (reason, policy_rule, scope_origin, approved_by)
- **Replay de sesión** para auditoría post-hoc
- **mcp-bridge** como adaptador (no decide governance; solo traduce y orquesta)

## Requisitos

- Node.js 18+ (recomendado)

## Ejecutar demo y tests

En la raíz del repo:

```bash
npm run demo
npm run test
npm run check
```

## Estructura

La estructura sigue el directorio del lab:

- `governance/` → policy + definiciones de scope
- `docs/adr/` → ADRs (resumen de decisiones)
- `src/` → implementación (capability / validator / ledger / runtime)
- `tests/` → escenarios (happy path, bypass, rol no autorizado, scope fuera de sandbox)

