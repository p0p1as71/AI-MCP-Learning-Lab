# capability-policy

Política de governance para solicitudes de capability.

## Reglas (alto nivel)

1. Toda solicitud debe crear evento `REQUESTED` en el ledger.
2. La evaluación produce `EVALUATED` y un veredicto:
   - `GRANTED` (con TTL + provenance) o
   - `DENIED` (con motivo y ruleId).
3. Si se concede:
   - la capability se activa (`ACTIVE`) **solo** durante su ventana TTL;
   - tras ejecutar la acción, debe quedar `COMPLETED`;
   - **siempre** debe ejecutarse `REVOKED` (revocación obligatoria).
4. Un `GRANTED` sin provenance es inválido.

## Roles (demo)

- `capability_governor`: autoriza o deniega (representado por el validador en código).
- `executor-agent`: ejecuta la acción si y solo si recibió un grant válido.

