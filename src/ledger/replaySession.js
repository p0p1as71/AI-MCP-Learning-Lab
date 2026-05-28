const { replayEvents } = require("./replay");
const { last, groupBy } = require("./query");

function hasProvenance(grantedEvent) {
  const p = grantedEvent?.payload || {};
  return Boolean(p.reason && p.approved_by && p.policy_rule && p.scope_origin);
}

/**
 * Auditoría de una sesión completa de capability governance.
 * - transiciones válidas
 * - todo GRANTED con provenance
 * - revocación obligatoria
 */
function replayCapabilitySession(events) {
  // Una “session” puede contener múltiples request_id.
  // Las transiciones deben validarse por request (no entre requests).
  const byRequest = groupBy(events, (e) => e.request_id || "__no_request__");
  const perRequest = [];

  let allViolations = [];
  let allMissingProvIds = [];
  let revokedOkForCompleted = true;

  for (const [requestId, reqEvents] of byRequest.entries()) {
    const audit = replayEvents(reqEvents);

    const granted = reqEvents.filter((e) => e.action === "granted");
    const missingProv = granted.filter((e) => !hasProvenance(e));

    const revokedCount = reqEvents.filter((e) => e.action === "revoked").length;
    const completedCount = reqEvents.filter((e) => e.action === "completed").length;
    const revokedOccurred = revokedCount >= completedCount && completedCount > 0;

    if (completedCount > 0 && !revokedOccurred) revokedOkForCompleted = false;

    allViolations = allViolations.concat(
      audit.violations.map((v) => ({ request_id: requestId, ...v }))
    );
    allMissingProvIds = allMissingProvIds.concat(missingProv.map((e) => e.id));

    perRequest.push({
      request_id: requestId,
      ok: audit.ok && missingProv.length === 0 && (completedCount === 0 || revokedOccurred),
      summary: {
        events: reqEvents.length,
        last_action: last(reqEvents)?.action || null,
        completed: completedCount,
        revoked: revokedCount,
        granted: granted.length,
        granted_missing_provenance: missingProv.length,
      },
    });
  }

  const lastEvent = last(events);
  const grantedAll = events.filter((e) => e.action === "granted");

  return {
    ok:
      allViolations.length === 0 &&
      allMissingProvIds.length === 0 &&
      revokedOkForCompleted,
    summary: {
      events: events.length,
      last_action: lastEvent?.action || null,
      requests: byRequest.size,
      granted: grantedAll.length,
      granted_missing_provenance: allMissingProvIds.length,
    },
    details: {
      transition_violations: allViolations,
      missing_provenance_event_ids: allMissingProvIds,
      per_request: perRequest,
    },
  };
}

module.exports = { replayCapabilitySession };
