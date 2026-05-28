const path = require("path");
const { appendEvent, readJson, ensureDir } = require("./store");

function nowIso() {
  return new Date().toISOString();
}

function randomId(prefix = "EVT") {
  return `${prefix}-${Math.random().toString(16).slice(2)}-${Date.now()}`;
}

class Ledger {
  constructor({ rootDir, ledgerDir = ".ledger" } = {}) {
    if (!rootDir) throw new Error("Ledger requires rootDir");
    this.rootDir = rootDir;
    this.ledgerDir = path.join(rootDir, ledgerDir);
    ensureDir(this.ledgerDir);
    this.eventsFile = path.join(this.ledgerDir, "events.json");
  }

  append(event) {
    const normalized = {
      id: event.id || randomId(),
      ts: event.ts || nowIso(),
      ...event,
    };
    return appendEvent(this.eventsFile, normalized);
  }

  list() {
    return readJson(this.eventsFile, []);
  }

  bySession(sessionId) {
    return this.list().filter((e) => e.session_id === sessionId);
  }

  byRequest(requestId) {
    return this.list().filter((e) => e.request_id === requestId);
  }
}

module.exports = { Ledger };

