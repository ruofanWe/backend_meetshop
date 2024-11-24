const { v4: uuidv4 } = require('uuid');
const Transaction = require('./Transaction');

class Account {
  constructor(name, initialBalance = 0) {
    this.id = uuidv4();
    this.name = name;
    this.balance = initialBalance;
    this.transactions = [];
    this.createdAt = new Date().toISOString();
    
    if (initialBalance > 0) {
      const initialTransaction = new Transaction('deposit', initialBalance, this.id);
      this.addTransactionReference(initialTransaction);
    }
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
        timestamp: t.timestamp.toISOString()
      }))
    };
  }
}

module.exports = Account;