const IAccountRepository = require('./IAccountRepository');

class InMemoryAccountRepository extends IAccountRepository {
  constructor() {
    super();
    this.accounts = new Map();
  }

  save(account) {
    this.accounts.set(account.id, account);
    return account;
  }

  findById(id) {
    return this.accounts.get(id);
  }

  update(account) {
    this.accounts.set(account.id, account);
    return account;
  }

  delete(id) {
    return this.accounts.delete(id);
  }
}

module.exports = InMemoryAccountRepository;