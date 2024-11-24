class ILockRepository {
    acquire(id) { throw new Error('Not implemented'); }
    release(id) { throw new Error('Not implemented'); }
    isLocked(id) { throw new Error('Not implemented'); }
  }
  
  module.exports = ILockRepository;