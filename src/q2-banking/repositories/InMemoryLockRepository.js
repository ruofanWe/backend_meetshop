const ILockRepository = require('./ILockRepository');

class InMemoryLockRepository extends ILockRepository {
  constructor() {
    super();
    this.locks = new Map();
  }

  acquire(id) {
    this.locks.set(id, true);
  }

  release(id) {
    this.locks.delete(id);
  }

  isLocked(id) {
    return this.locks.has(id);
  }
}

module.exports = InMemoryLockRepository;