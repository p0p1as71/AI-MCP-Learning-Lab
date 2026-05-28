/**
 * Capability lifecycle state machine (core del lab).
 *
 * requested → evaluated → granted → active → completed → revoked
 *                        └──────→ denied (terminal)
 *
 * Nota: permitimos revocación forzosa desde granted/active (por TTL o error),
 * pero SIEMPRE debe registrarse como acción explícita.
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

