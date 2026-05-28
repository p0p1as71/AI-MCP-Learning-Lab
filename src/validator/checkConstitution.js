const { TRANSITIONS } = require("./rules");

function assert(condition, msg) {
  if (!condition) throw new Error(msg);
}

function main() {
  // Checks simples: estados terminales no deben tener salidas.
  assert(TRANSITIONS.get("denied").size === 0, "denied debe ser terminal");
  assert(TRANSITIONS.get("revoked").size === 0, "revoked debe ser terminal");

  // Checks de ruta feliz mínima
  assert(
    TRANSITIONS.get("requested").has("evaluated"),
    "requested → evaluated debe existir"
  );
  assert(
    TRANSITIONS.get("evaluated").has("granted"),
    "evaluated → granted debe existir"
  );
  assert(
    TRANSITIONS.get("granted").has("active"),
    "granted → active debe existir"
  );
  assert(
    TRANSITIONS.get("active").has("completed"),
    "active → completed debe existir"
  );
  assert(
    TRANSITIONS.get("completed").has("revoked"),
    "completed → revoked debe existir"
  );

  console.log("OK: capability constitution checks passed");
}

if (require.main === module) main();

