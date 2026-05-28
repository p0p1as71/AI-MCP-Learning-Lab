function nowIso() {
  return new Date().toISOString();
}

function addSeconds(date, seconds) {
  return new Date(date.getTime() + seconds * 1000);
}

function grantCapability({
  ledger,
  registry,
  request_id,
  session_id,
  capability,
  scope,
  ttl_seconds,
  granted_to,
  provenance, // {reason, approved_by, policy_rule, scope_origin, delegation_context}
}) {
  const grant_id = `GRANT-${Math.random().toString(16).slice(2)}-${Date.now()}`;
  const createdAt = new Date();
  const expiresAt = addSeconds(createdAt, ttl_seconds);

  const grant = {
    grant_id,
    request_id,
    session_id,
    capability,
    scope,
    ttl_seconds,
    expires_at: expiresAt.toISOString(),
    granted_to,
    created_at: createdAt.toISOString(),
    provenance,
  };

  registry.add(grant);

  ledger.append({
    request_id,
    session_id,
    role: "capability_governor",
    action: "granted",
    payload: {
      capability,
      scope,
      ttl_seconds,
      expires_at: grant.expires_at,
      granted_to,
      reason: provenance?.reason,
      approved_by: provenance?.approved_by,
      policy_rule: provenance?.policy_rule,
      scope_origin: provenance?.scope_origin,
      delegation_context: provenance?.delegation_context ?? null,
    },
  });

  return grant;
}

module.exports = { grantCapability };

