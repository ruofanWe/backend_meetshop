const { v4: uuidv4 } = require("uuid");

class Account {
  constructor(name, initialBalance = 0) {
    this.id = uuidv4();
    this.name = name;
    this.balance = initialBalance;
    this.transactions = [];
    this.createdAt = new Date();
  }

  addTransaction(type, amount, relatedAccountId = null) {
    const transaction = {
      id: uuidv4(),
      type,
      amount,
      relatedAccountId,
      balanceAfter: this.balance,
      balanceBefore:
        this.balance - (type.includes("deposit") ? amount : -amount),
      timestamp: new Date(),
      status: "completed",
    };
    this.transactions.push(transaction);
    return transaction;
  }
}

module.exports = Account;
