class CapabilityRegistry {
  constructor() {
    this.grantsById = new Map();
  }

  add(grant) {
    this.grantsById.set(grant.grant_id, grant);
    return grant;
  }

  get(grantId) {
    return this.grantsById.get(grantId) || null;
  }

  remove(grantId) {
    const g = this.get(grantId);
    this.grantsById.delete(grantId);
    return g;
  }

  listActive() {
    return Array.from(this.grantsById.values());
  }
}

module.exports = { CapabilityRegistry };

