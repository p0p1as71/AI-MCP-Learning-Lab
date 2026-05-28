# scope-definitions

Definiciones **explícitas** de scope (capabilities) permitidas en este lab.

## Principios

- **capability ≠ autoridad**: tener “acceso” a una tool no autoriza su uso.
- El scope permitido debe ser **mínimo**, **auditable** y **revocable**.
- El sandbox permitido para filesystem en este lab es la carpeta del repo (demo).

## Scopes

### filesystem:read

- Permitido: lectura dentro del repo.

### filesystem:write

- Permitido: escritura **solo** dentro de `AI-MCP-Learning-Lab/experiments/` y `AI-MCP-Learning-Lab/assets/`.
- Denegado: cualquier path fuera del repo o path traversal.

### github:read / github:write

- En esta demo local no se ejecuta GitHub real; el objetivo es el **modelo de governance**.

