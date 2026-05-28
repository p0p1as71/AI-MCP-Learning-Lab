const fs = require("fs");
const path = require("path");

function readPolicy(rootDir) {
  const p = path.join(rootDir, "governance", "policy.json");
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function isSubPath(baseDirAbs, targetAbs) {
  const rel = path.relative(baseDirAbs, targetAbs);
  return rel && !rel.startsWith("..") && !path.isAbsolute(rel);
}

function normalizePaths(scope) {
  if (!scope) return [];
  if (Array.isArray(scope.paths)) return scope.paths;
  if (typeof scope.path === "string") return [scope.path];
  return [];
}

/**
 * “Governor” evaluation for a capability request.
 * The bridge does NOT decide: it only calls this function.
 */
function evaluateRequest({ rootDir, request }) {
  const policy = readPolicy(rootDir);

  const capability = request.capability;
  const requestedBy = request.requested_by;

  // 1) Capability supported?
  const capDef = policy.scopes[capability];
  if (!capDef) {
    return {
      allowed: false,
      ruleId: "CAP-UNKNOWN",
      reason: `Unsupported capability: ${capability}`,
    };
  }

  // 2) Role authorized to execute?
  const role = policy.roles[requestedBy];
  if (!role || !role.canExecute?.includes(capability)) {
    return {
      allowed: false,
      ruleId: "CAP-ROLE-DENIED",
      reason: `Unauthorized role (${requestedBy}) for ${capability}`,
    };
  }

  // 3) Scope (paths) within boundaries
  const repoRoot = path.resolve(rootDir);
  const allowedBases = (capDef.allowedBaseDirs || []).map((d) =>
    path.resolve(rootDir, d)
  );
  const pathsToCheck = normalizePaths(request.scope);

  for (const p of pathsToCheck) {
    // Reject paths outside repo
    const targetAbs = path.resolve(rootDir, p);
    if (!isSubPath(repoRoot, targetAbs) && targetAbs !== repoRoot) {
      return {
        allowed: false,
        ruleId: "CAP-SCOPE-OUTSIDE-REPO",
        reason: `Scope outside repo: ${p}`,
      };
    }

    const okInSomeBase = allowedBases.some(
      (baseAbs) => targetAbs === baseAbs || isSubPath(baseAbs, targetAbs)
    );
    if (!okInSomeBase) {
      return {
        allowed: false,
        ruleId: "CAP-SCOPE-DENIED",
        reason: `Scope not allowed by policy for ${capability}: ${p}`,
      };
    }
  }

  // 4) TTL (optional) - fallback to policy default
  const ttlSeconds =
    typeof request.ttl_seconds === "number"
      ? request.ttl_seconds
      : policy.defaults.ttlSeconds;

  if (ttlSeconds <= 0 || ttlSeconds > 3600) {
    return {
      allowed: false,
      ruleId: "CAP-TTL-DENIED",
      reason: `Invalid TTL: ${ttlSeconds}`,
    };
  }

  // OK
  const scopeOrigin = `scope-definitions/${capability}`;
  return {
    allowed: true,
    policy_rule: "CAP-POLICY-001",
    scope_origin: scopeOrigin,
    ttl_seconds: ttlSeconds,
  };
}

module.exports = { evaluateRequest };
