# Report (text version)

The formal report is delivered as a PDF in your local working folder.  
To keep this repository 100% **text-only** (and avoid pushing binaries), this file provides the equivalent written report.

## Summary

This project implements a **capability governance runtime** with:

- append-only ledger (auditable)
- capability lifecycle (requested → evaluated → granted → active → completed → revoked / denied)
- time-bounded grants (TTL)
- **mandatory revocation**
- **provenance** attached to every `GRANTED` event (`reason`, `approved_by`, `policy_rule`, `scope_origin`)
- `mcp-bridge` as an adapter (ADR-005), never as an authority

## How to run

```bash
npm run check
npm run test
npm run demo
```

## Demo artifacts

- `experiments/04-governed-runtime/output.txt`
- `.ledger/events.json`
