const { validateTransition } = require("../validator/rules");

/**
 * Replays a sequence of events and validates there are no invalid transitions.
 * Returns an audit object (ok + violations).
 */
function replayEvents(events) {
  const violations = [];

  for (let i = 1; i < events.length; i++) {
    const prev = events[i - 1];
    const next = events[i];
    const ok = validateTransition(prev.action, next.action);
    if (!ok) {
      violations.push({
        type: "INVALID_TRANSITION",
        at: i,
        prev: prev.action,
        next: next.action,
        prev_event_id: prev.id,
        next_event_id: next.id,
      });
    }
  }

  return {
    ok: violations.length === 0,
    violations,
  };
}

module.exports = { replayEvents };
