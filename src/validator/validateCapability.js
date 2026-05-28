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
 * “Governor” (evaluación) de una solicitud de capability.
 * El bridge NO decide: solo llama a esta función.
 */
function evaluateRequest({ rootDir, request }) {
  const policy = readPolicy(rootDir);

  const capability = request.capability;
  const requestedBy = request.requested_by;

  // 1) ¿Existe la capability?
  const capDef = policy.scopes[capability];
  if (!capDef) {
    return {
      allowed: false,
      ruleId: "CAP-UNKNOWN",
      reason: `Capability no soportada: ${capability}`,
    };
  }

  // 2) ¿Rol autorizado para ejecutar?
  const role = policy.roles[requestedBy];
  if (!role || !role.canExecute?.includes(capability)) {
    return {
      allowed: false,
      ruleId: "CAP-ROLE-DENIED",
      reason: `Rol no autorizado (${requestedBy}) para ${capability}`,
    };
  }

  // 3) Scope (paths) dentro de los límites
  const repoRoot = path.resolve(rootDir);
  const allowedBases = (capDef.allowedBaseDirs || []).map((d) =>
    path.resolve(rootDir, d)
  );
  const pathsToCheck = normalizePaths(request.scope);

  for (const p of pathsToCheck) {
    // Rechazar paths absolutos fuera del repo
    const targetAbs = path.resolve(rootDir, p);
    if (!isSubPath(repoRoot, targetAbs) && targetAbs !== repoRoot) {
      return {
        allowed: false,
        ruleId: "CAP-SCOPE-OUTSIDE-REPO",
        reason: `Scope fuera del repo: ${p}`,
      };
    }

    const okInSomeBase = allowedBases.some(
      (baseAbs) => targetAbs === baseAbs || isSubPath(baseAbs, targetAbs)
    );
    if (!okInSomeBase) {
      return {
        allowed: false,
        ruleId: "CAP-SCOPE-DENIED",
        reason: `Scope no permitido por policy para ${capability}: ${p}`,
      };
    }
  }

  // 4) TTL (opcional) - si no viene, se asigna default
  const ttlSeconds =
    typeof request.ttl_seconds === "number"
      ? request.ttl_seconds
      : policy.defaults.ttlSeconds;

  if (ttlSeconds <= 0 || ttlSeconds > 3600) {
    return {
      allowed: false,
      ruleId: "CAP-TTL-DENIED",
      reason: `TTL inválido: ${ttlSeconds}`,
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

