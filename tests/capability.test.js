const assert = require("assert");
const fs = require("fs");
const path = require("path");

const { Ledger } = require("../src/ledger/ledger");
const { CapabilityRegistry } = require("../src/capability/registry");
const { runGovernedTool } = require("../src/runtime/mcp-bridge");

async function run() {
  const rootDir = process.cwd();
  const ledgerDir = `.ledger-test-${Date.now()}`;
  const ledger = new Ledger({ rootDir, ledgerDir });
  const registry = new CapabilityRegistry();

  const session_id = `TEST-${Date.now()}`;

  const writeFileTool = async ({ relPath, content }) => {
    const abs = path.resolve(rootDir, relPath);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, content, "utf8");
    return { wrote: relPath };
  };

  try {
    // 1) Happy path
    const r1 = await runGovernedTool({
      rootDir,
      ledger,
      registry,
      call: {
        session_id,
        request_id: "T-1",
        requested_by: "executor-agent",
        tool_name: "writeFile",
        capability: "filesystem:write",
        scope: { paths: ["./experiments/"] },
        ttl_seconds: 60,
        tool_fn: writeFileTool,
        tool_args: { relPath: "./experiments/01-filesystem/test.txt", content: "ok\n" },
        provenance_reason: "test_happy_path",
      },
    });
    assert.equal(r1.ok, true);
    assert.equal(fs.existsSync(path.join(rootDir, "experiments/01-filesystem/test.txt")), true);

    const eventsT1 = ledger.byRequest("T-1");
    assert.equal(eventsT1.some((e) => e.action === "granted"), true);
    assert.equal(eventsT1.some((e) => e.action === "revoked"), true);

    const granted = eventsT1.find((e) => e.action === "granted");
    assert.ok(granted.payload.reason);
    assert.ok(granted.payload.approved_by);
    assert.ok(granted.payload.policy_rule);
    assert.ok(granted.payload.scope_origin);

    // 2) Bypass / scope not allowed
    const r2 = await runGovernedTool({
      rootDir,
      ledger,
      registry,
      call: {
        session_id,
        request_id: "T-2",
        requested_by: "executor-agent",
        tool_name: "writeFile",
        capability: "filesystem:write",
        scope: { paths: ["./"] },
        tool_fn: writeFileTool,
        tool_args: { relPath: "./should-not-exist.txt", content: "no\n" },
        provenance_reason: "test_scope_denied",
      },
    });
    assert.equal(r2.ok, false);
    assert.equal(r2.denied, true);
    assert.equal(fs.existsSync(path.join(rootDir, "should-not-exist.txt")), false);

    // 3) Unauthorized role
    const r3 = await runGovernedTool({
      rootDir,
      ledger,
      registry,
      call: {
        session_id,
        request_id: "T-3",
        requested_by: "intruder-agent",
        tool_name: "writeFile",
        capability: "filesystem:write",
        scope: { paths: ["./experiments/"] },
        tool_fn: writeFileTool,
        tool_args: { relPath: "./experiments/01-filesystem/intruder.txt", content: "no\n" },
        provenance_reason: "test_role_denied",
      },
    });
    assert.equal(r3.ok, false);
    assert.equal(r3.denied, true);
    assert.equal(fs.existsSync(path.join(rootDir, "experiments/01-filesystem/intruder.txt")), false);

    // 4) Scope outside repo (path traversal)
    const r4 = await runGovernedTool({
      rootDir,
      ledger,
      registry,
      call: {
        session_id,
        request_id: "T-4",
        requested_by: "executor-agent",
        tool_name: "writeFile",
        capability: "filesystem:write",
        scope: { paths: ["../"] },
        tool_fn: writeFileTool,
        tool_args: { relPath: "../escape.txt", content: "no\n" },
        provenance_reason: "test_outside_repo",
      },
    });
    assert.equal(r4.ok, false);
    assert.equal(r4.denied, true);
  } finally {
    // Cleanup test ledger
    fs.rmSync(path.join(rootDir, ledgerDir), { recursive: true, force: true });
  }

  console.log("OK: tests/capability.test.js — 4 scenarios passed");
}

run().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
