class Account {
  constructor(name, initialBalance = 0) {
    this.id = uuidv4();
    this.name = name;
    this.balance = initialBalance;
    this.transactions = [];
    this.createdAt = new Date();
  }

  addTransactionReference(transaction) {
    this.transactions.push(transaction);
  }
}

module.exports = Account;
