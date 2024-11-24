const ITransactionRepository = require('./ITransactionRepository');

class InMemoryTransactionRepository extends ITransactionRepository {
  constructor() {
    super();
    this.transactions = new Map();
  }

  save(transaction) {
    this.transactions.set(transaction.id, transaction);
    return transaction;
  }

  findById(id) {
    return this.transactions.get(id);
  }
}

module.exports = InMemoryTransactionRepository;