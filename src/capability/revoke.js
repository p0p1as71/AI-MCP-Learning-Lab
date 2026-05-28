function revokeCapability({ ledger, registry, request_id, session_id, grant_id, reason }) {
  const removed = registry.remove(grant_id);

  ledger.append({
    request_id,
    session_id,
    role: "capability_governor",
    action: "revoked",
    payload: {
      grant_id,
      capability: removed?.capability ?? null,
      revoked_reason: reason || "mandatory_post_execution_revocation",
    },
  });

  return removed;
}

module.exports = { revokeCapability };

