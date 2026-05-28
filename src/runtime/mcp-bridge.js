const { evaluateRequest } = require("../validator/validateCapability");
const { grantCapability } = require("../capability/grant");
const { revokeCapability } = require("../capability/revoke");

function assert(condition, msg) {
  if (!condition) throw new Error(msg);
}

function isExpired(grant) {
  return Date.now() > new Date(grant.expires_at).getTime();
}

/**
 * Adaptador: ejecuta una “tool call” solo si hay grant temporal gobernado.
 *
 * Importante (ADR-005):
 * - Este módulo NO contiene policy. NO decide. Solo orquesta.
 * - La evaluación está en validator/validateCapability.js
 */
async function runGovernedTool({
  rootDir,
  ledger,
  registry,
  call, // {session_id, request_id, requested_by, capability, scope, ttl_seconds?, tool_name, tool_fn, tool_args, provenance_reason}
}) {
  assert(call.session_id, "call.session_id requerido");
  assert(call.request_id, "call.request_id requerido");

  // 1) REQUESTED
  ledger.append({
    request_id: call.request_id,
    session_id: call.session_id,
    role: call.requested_by,
    action: "requested",
    payload: {
      tool_name: call.tool_name,
      capability: call.capability,
      scope: call.scope,
    },
  });

  // 2) EVALUATED (gobernor)
  const evalResult = evaluateRequest({
    rootDir,
    request: {
      request_id: call.request_id,
      requested_by: call.requested_by,
      capability: call.capability,
      scope: call.scope,
      ttl_seconds: call.ttl_seconds,
    },
  });

  ledger.append({
    request_id: call.request_id,
    session_id: call.session_id,
    role: "capability_governor",
    action: "evaluated",
    payload: evalResult,
  });

  if (!evalResult.allowed) {
    ledger.append({
      request_id: call.request_id,
      session_id: call.session_id,
      role: "capability_governor",
      action: "denied",
      payload: {
        ruleId: evalResult.ruleId,
        reason: evalResult.reason,
      },
    });
    return { ok: false, denied: true, ruleId: evalResult.ruleId, reason: evalResult.reason };
  }

  // 3) GRANTED (con provenance)
  const grant = grantCapability({
    ledger,
    registry,
    request_id: call.request_id,
    session_id: call.session_id,
    capability: call.capability,
    scope: call.scope,
    ttl_seconds: evalResult.ttl_seconds,
    granted_to: "executor-agent",
    provenance: {
      reason: call.provenance_reason || "demo",
      approved_by: "capability_governor",
      policy_rule: evalResult.policy_rule,
      scope_origin: evalResult.scope_origin,
      delegation_context: null,
    },
  });

  // 4) ACTIVE
  ledger.append({
    request_id: call.request_id,
    session_id: call.session_id,
    role: "executor-agent",
    action: "active",
    payload: {
      grant_id: grant.grant_id,
      expires_at: grant.expires_at,
    },
  });

  let toolResult = null;
  let toolError = null;

  try {
    if (isExpired(grant)) {
      throw new Error("TTL expirado antes de ejecutar la tool");
    }
    toolResult = await call.tool_fn(call.tool_args || {});

    // 5) COMPLETED
    ledger.append({
      request_id: call.request_id,
      session_id: call.session_id,
      role: "executor-agent",
      action: "completed",
      payload: {
        tool_name: call.tool_name,
        result: toolResult,
      },
    });

    return { ok: true, result: toolResult };
  } catch (err) {
    toolError = err;
    ledger.append({
      request_id: call.request_id,
      session_id: call.session_id,
      role: "executor-agent",
      action: "completed",
      payload: {
        tool_name: call.tool_name,
        error: String(err?.message || err),
      },
    });
    return { ok: false, error: String(err?.message || err) };
  } finally {
    // 6) REVOKED (obligatoria)
    revokeCapability({
      ledger,
      registry,
      request_id: call.request_id,
      session_id: call.session_id,
      grant_id: grant.grant_id,
      reason: toolError ? "mandatory_revocation_after_error" : "mandatory_post_execution_revocation",
    });
  }
}

module.exports = { runGovernedTool };

