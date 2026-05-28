# Reporte (texto)

El reporte formal está entregado como PDF en tu carpeta local de trabajo.  
Para mantener el repositorio 100% “text-only” (y evitar problemas de pushing de binarios), aquí dejo el resumen equivalente.

## Resumen

Este proyecto implementa un runtime de **capability governance** con:

- ledger append-only (auditable)
- lifecycle de capabilities (requested → evaluated → granted → active → completed → revoked / denied)
- grants temporales con TTL
- **revocación obligatoria**
- **provenance** en cada `GRANTED` (reason, approved_by, policy_rule, scope_origin)
- `mcp-bridge` como adaptador (ADR-005), nunca como autoridad

## Cómo ejecutar

```bash
npm run check
npm run test
npm run demo
```

## Artefactos que genera la demo

- `experiments/04-governed-runtime/output.txt`
- `.ledger/events.json`

