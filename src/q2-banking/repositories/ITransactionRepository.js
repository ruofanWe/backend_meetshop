class ITransactionRepository {
    save(transaction) { throw new Error('Not implemented'); }
    findById(id) { throw new Error('Not implemented'); }
    findByAccountId(accountId) { throw new Error('Not implemented'); }
  }
  
  module.exports = ITransactionRepository;