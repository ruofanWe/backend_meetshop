const { v4: uuidv4 } = require('uuid');

class Account {
  constructor(name, initialBalance = 0) {
    this.id = uuidv4();
    this.name = name;
    this.balance = initialBalance;
    this.transactions = [];
    this.createdAt = new Date().toISOString();
    this.locked = false;
    this.lockTimeout = null;
  }

  acquireLock(timeoutMs = 5000) {
    if (this.locked) {
      return false;
    }
    this.locked = true;
    
    // Set automatic lock release timeout
    this.lockTimeout = setTimeout(() => {
      this.releaseLock();
    }, timeoutMs);
    
    return true;
  }

  releaseLock() {
    if (this.lockTimeout) {
      clearTimeout(this.lockTimeout);
      this.lockTimeout = null;
    }
    this.locked = false;
  }

  isLocked() {
    return this.locked;
  }

  addTransactionReference(transaction) {
    this.transactions.push({
      id: transaction.id,
      type: transaction.type,
      amount: transaction.amount,
      timestamp: transaction.timestamp
    });
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      balance: this.balance,
      transactions: this.transactions.map(t => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        timestamp: t.timestamp
      }))
    };
  }
}

module.exports = Account;