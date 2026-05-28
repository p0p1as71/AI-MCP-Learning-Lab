/**
 * Capability lifecycle state machine (core of this lab).
 *
 * requested → evaluated → granted → active → completed → revoked
 *                        └──────→ denied (terminal)
 *
 * Note: we allow forced revocation from granted/active (TTL or error),
 * but it must ALWAYS be registered as an explicit action.
 */

const TRANSITIONS = new Map([
  ["requested", new Set(["evaluated"])],
  ["evaluated", new Set(["granted", "denied"])],
  ["granted", new Set(["active", "revoked"])],
  ["active", new Set(["completed", "revoked"])],
  ["completed", new Set(["revoked"])],
  ["denied", new Set([])],
  ["revoked", new Set([])],
]);

function validateTransition(fromAction, toAction) {
  const allowed = TRANSITIONS.get(fromAction);
  if (!allowed) return false;
  return allowed.has(toAction);
}

module.exports = {
  TRANSITIONS,
  validateTransition,
};
