# ADR-003 — la revocación es obligatoria

## Decisión
Todo grant debe terminar en `REVOKED` (siempre), incluso en caso de error.

## Consecuencia
Se evita el “capability leak” (permisos que quedan vivos por accidente).

