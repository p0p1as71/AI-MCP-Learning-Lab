# AI-MCP-Learning-Lab

Demo project to study **MCP as a governance object** (capability ≠ authority), implementing:

- **Append-only event ledger** (auditable source of truth)
- **Capability lifecycle** (requested → evaluated → granted → active → completed → revoked / denied)
- **Time-bounded grants (TTL)** + **mandatory revocation**
- **Provenance** on every `GRANTED` event (`reason`, `policy_rule`, `scope_origin`, `approved_by`)
- **Session replay** for post-hoc audit
- **mcp-bridge** as an adapter (does not decide governance; it only orchestrates)

## Requirements

- Node.js 18+ (recommended)

## Run demo and tests

From repo root:

```bash
npm run demo
npm run test
npm run check
```

## Structure

- `governance/` → policy + scope definitions
- `docs/adr/` → ADRs (architecture decisions)
- `src/` → implementation (capability / validator / ledger / runtime)
- `tests/` → scenarios (happy path, bypass, unauthorized role, sandbox escape)
