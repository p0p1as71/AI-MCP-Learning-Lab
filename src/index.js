const fs = require("fs");
const path = require("path");

const { Ledger } = require("./ledger/ledger");
const { CapabilityRegistry } = require("./capability/registry");
const { runGovernedTool } = require("./runtime/mcp-bridge");
const { replayCapabilitySession } = require("./ledger/replaySession");

async function main() {
  const rootDir = process.cwd();
  const ledger = new Ledger({ rootDir });
  const registry = new CapabilityRegistry();

  const session_id = `SESSION-${Date.now()}`;

  // Tool demo: escribir un archivo dentro de experiments/04-governed-runtime/
  const writeFileTool = async ({ relPath, content }) => {
    const abs = path.resolve(rootDir, relPath);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, content, "utf8");
    return { wrote: relPath, bytes: Buffer.byteLength(content, "utf8") };
  };

  console.log("\n--- DEMO 1: happy path (filesystem:write dentro del sandbox) ---");
  await runGovernedTool({
    rootDir,
    ledger,
    registry,
    call: {
      session_id,
      request_id: "CAP-2001",
      requested_by: "executor-agent",
      tool_name: "writeFile",
      capability: "filesystem:write",
      scope: { paths: ["./experiments/04-governed-runtime/"] },
      ttl_seconds: 120,
      tool_fn: writeFileTool,
      tool_args: {
        relPath: "./experiments/04-governed-runtime/output.txt",
        content: `Hola. Este archivo fue creado mediante un grant temporal.\nSession: ${session_id}\n`,
      },
      provenance_reason: "output de experiment-04",
    },
  });

  console.log("\n--- DEMO 2: denegado (scope fuera de sandbox permitido) ---");
  const denied = await runGovernedTool({
    rootDir,
    ledger,
    registry,
    call: {
      session_id,
      request_id: "CAP-2002",
      requested_by: "executor-agent",
      tool_name: "writeFile",
      capability: "filesystem:write",
      scope: { paths: ["./"] }, // no permitido para write (solo experiments/ y assets/)
      ttl_seconds: 120,
      tool_fn: writeFileTool,
      tool_args: {
        relPath: "./output-should-not-exist.txt",
        content: "Esto no debería escribirse.\n",
      },
      provenance_reason: "intento fuera de sandbox",
    },
  });
  if (!denied.ok) console.log("DENIED:", denied.ruleId, "-", denied.reason);

  // Auditoría
  const events = ledger.bySession(session_id);
  const audit = replayCapabilitySession(events);

  console.log("\n--- AUDITORÍA (replayCapabilitySession) ---");
  console.log(JSON.stringify(audit, null, 2));

  console.log("\n--- EVENTOS (session) ---");
  for (const e of events) {
    console.log(`${e.ts} :: ${e.action} :: ${e.role} :: ${e.request_id}`);
  }

  console.log("\nListo. Revisa:");
  console.log("- experiments/04-governed-runtime/output.txt");
  console.log("- .ledger/events.json");
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
}

