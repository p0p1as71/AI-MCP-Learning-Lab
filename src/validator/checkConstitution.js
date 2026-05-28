const { TRANSITIONS } = require("./rules");

function assert(condition, msg) {
  if (!condition) throw new Error(msg);
}

function main() {
  // Basic checks: terminal states must have no outgoing transitions.
  assert(TRANSITIONS.get("denied").size === 0, "denied must be terminal");
  assert(TRANSITIONS.get("revoked").size === 0, "revoked must be terminal");

  // Happy-path minimum checks
  assert(
    TRANSITIONS.get("requested").has("evaluated"),
    "requested → evaluated must exist"
  );
  assert(
    TRANSITIONS.get("evaluated").has("granted"),
    "evaluated → granted must exist"
  );
  assert(
    TRANSITIONS.get("granted").has("active"),
    "granted → active must exist"
  );
  assert(
    TRANSITIONS.get("active").has("completed"),
    "active → completed must exist"
  );
  assert(
    TRANSITIONS.get("completed").has("revoked"),
    "completed → revoked must exist"
  );

  console.log("OK: capability constitution checks passed");
}

if (require.main === module) main();
