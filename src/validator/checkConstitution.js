const { TRANSITIONS } = require("./rules");
const fs = require("fs");
const path = require("path");

function assert(condition, msg) {
  if (!condition) throw new Error(msg);
}

function readPolicy(rootDir) {
  const p = path.join(rootDir, "governance", "policy.json");
  const raw = fs.readFileSync(p, "utf8");
  return JSON.parse(raw);
}

function isPlainObject(x) {
  return x && typeof x === "object" && !Array.isArray(x);
}

function validatePolicy(policy) {
  assert(isPlainObject(policy), "policy.json must be an object");
  assert(isPlainObject(policy.roles), "policy.roles must be an object");
  assert(isPlainObject(policy.scopes), "policy.scopes must be an object");
  assert(isPlainObject(policy.defaults), "policy.defaults must be an object");

  const scopeKeys = new Set(Object.keys(policy.scopes));
  assert(scopeKeys.size > 0, "policy.scopes must define at least one scope");

  // defaults.ttlSeconds must align with validateCapability.js constraints
  const ttl = policy.defaults.ttlSeconds;
  assert(typeof ttl === "number", "policy.defaults.ttlSeconds must be a number");
  assert(ttl > 0 && ttl <= 3600, "policy.defaults.ttlSeconds must be within (0, 3600]");

  // Validate scopes schema expected by validateCapability.js
  for (const [scopeName, scopeDef] of Object.entries(policy.scopes)) {
    assert(typeof scopeName === "string" && scopeName.includes(":"), "scope name should look like namespace:action");
    assert(isPlainObject(scopeDef), `policy.scopes['${scopeName}'] must be an object`);

    // For filesystem scopes, validate allowedBaseDirs is present and sane.
    if (scopeName.startsWith("filesystem:")) {
      assert(Array.isArray(scopeDef.allowedBaseDirs), `policy.scopes['${scopeName}'].allowedBaseDirs must be an array`);
      assert(scopeDef.allowedBaseDirs.length > 0, `policy.scopes['${scopeName}'].allowedBaseDirs must not be empty`);
      for (const d of scopeDef.allowedBaseDirs) {
        assert(typeof d === "string" && d.length > 0, `allowedBaseDirs entries must be non-empty strings for scope '${scopeName}'`);
        // Keep the policy relative to repo root (as used by validateCapability.js).
        assert(d.startsWith("./"), `allowedBaseDirs must be relative (start with './') for scope '${scopeName}'`);
      }
    }
  }

  // Validate role references to scopes (no dangling capabilities)
  for (const [roleName, roleDef] of Object.entries(policy.roles)) {
    assert(typeof roleName === "string" && roleName.length > 0, "role name must be a non-empty string");
    assert(isPlainObject(roleDef), `policy.roles['${roleName}'] must be an object`);

    for (const field of ["canExecute", "canGrant"]) {
      if (roleDef[field] === undefined) continue;
      assert(Array.isArray(roleDef[field]), `policy.roles['${roleName}'].${field} must be an array`);
      for (const cap of roleDef[field]) {
        assert(typeof cap === "string", `policy.roles['${roleName}'].${field} entries must be strings`);
        assert(scopeKeys.has(cap), `policy.roles['${roleName}'].${field} references unknown scope '${cap}'`);
      }
    }
  }
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

  // Policy consistency checks (fail fast at check-time instead of runtime)
  const rootDir = process.cwd();
  const policy = readPolicy(rootDir);
  validatePolicy(policy);

  console.log("OK: capability constitution + policy consistency checks passed");
}

if (require.main === module) main();
