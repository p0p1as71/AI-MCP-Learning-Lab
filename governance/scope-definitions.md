# scope-definitions

**Explicit** scope (capability) definitions allowed in this lab.

## Principles

- **capability ≠ authority**: being connected to a tool does not authorize its use.
- Allowed scope must be **minimal**, **auditable**, and **revocable**.
- Filesystem sandbox for this lab is the repository folder (demo).

## Scopes

### filesystem:read

- Allowed: reading within the repo.

### filesystem:write

- Allowed: writing **only** within `AI-MCP-Learning-Lab/experiments/` and `AI-MCP-Learning-Lab/assets/`.
- Denied: any path outside the repo or any path traversal attempt.

### github:read / github:write

- This local demo does not execute real GitHub calls; the goal is the **governance model**.
