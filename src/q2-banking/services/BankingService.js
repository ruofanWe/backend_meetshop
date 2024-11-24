const Account = require('../models/Account');
const Transaction = require('../models/Transaction');

class BankingService {
  constructor() {
    this.accounts = new Map();
    this.transactions = new Map();
    this.locks = new Map();
  }

  async acquireLock(accountId, maxRetries = 50) {
    let retries = 0;
    while (this.locks.get(accountId)) {
      if (retries >= maxRetries) {
        throw new Error('Lock acquisition timeout');
      }
      await new Promise(resolve => setTimeout(resolve, 50));
      retries++;
    }
    this.locks.set(accountId, true);
    return accountId;
  }

  async releaseLock(accountId) {
    this.locks.delete(accountId);
  }

  async acquireMultipleLocks(accountIds) {
    const sortedIds = [...new Set(accountIds)].sort();
    for (const id of sortedIds) {
      await this.acquireLock(id);
    }
    return sortedIds;
  }

  async releaseMultipleLocks(accountIds) {
    const sortedIds = [...new Set(accountIds)].sort();
    for (const id of sortedIds) {
      await this.releaseLock(id);
    }
  }

  createAccount(name, initialBalance = 0) {
    if (!name) {
      throw new Error('Account name is required');
    }
    if (initialBalance < 0) {
      throw new Error('Initial balance cannot be negative');
    }

    const account = new Account(name, initialBalance);
    this.accounts.set(account.id, account);

    return account;
  }

  getAccount(accountId) {
    const account = this.accounts.get(accountId);
    if (!account) {
      throw new Error("Account not found");
    }
    return account;
  }

  async deposit(accountId, amount) {
    const lock = await this.acquireLock(accountId);
    try {
      const account = this.accounts.get(accountId);
      if (!account) {
        throw new Error('Account not found');
      }

      if (amount <= 0) {
        throw new Error('Deposit amount must be positive');
      }

      account.balance += amount;
      const transaction = new Transaction('deposit', amount, accountId);
      
      this.transactions.set(transaction.id, transaction);
      account.addTransactionReference(transaction);

      return { 
        account: account.toJSON(),
        transaction 
      };
    } finally {
      await this.releaseLock(lock);
    }
  }

  async withdraw(accountId, amount) {
    const lock = await this.acquireLock(accountId);
    try {
      if (amount <= 0) {
        throw new Error("Withdrawal amount must be positive");
      }

      const account = this.accounts.get(accountId);
      if (!account) {
        throw new Error("Account not found");
      }

      if (account.balance < amount) {
        throw new Error("Insufficient funds");
      }

      account.balance -= amount;
      const transaction = new Transaction("withdraw", amount, accountId);
      
      this.transactions.set(transaction.id, transaction);
      account.addTransactionReference(transaction);

      return { 
        account: account.toJSON(),
        transaction 
      };
    } finally {
      await this.releaseLock(lock);
    }
  }

  async transfer(fromAccountId, toAccountId, amount) {
    const locks = await this.acquireMultipleLocks([fromAccountId, toAccountId]);
    try {
      const fromAccount = this.accounts.get(fromAccountId);
      const toAccount = this.accounts.get(toAccountId);

      if (!fromAccount || !toAccount) {
        throw new Error('Account not found');
      }

      if (fromAccount.balance < amount) {
        throw new Error('Insufficient funds');
      }

      const transaction = new Transaction('transfer', amount, fromAccountId, toAccountId);
      
      fromAccount.balance -= amount;
      toAccount.balance += amount;

      this.transactions.set(transaction.id, transaction);
      fromAccount.addTransactionReference(transaction);
      toAccount.addTransactionReference(transaction);

      return {
        fromAccount: fromAccount.toJSON(),
        toAccount: toAccount.toJSON(),
        transaction
      };
    } finally {
      await this.releaseMultipleLocks(locks);
    }
  }

  async getTransactionHistory(accountId, page = 1, limit = 10) {
    const account = this.accounts.get(accountId);
    if (!account) {
      throw new Error('Account not found');
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const transactions = account.transactions.slice(startIndex, endIndex);

    return {
      transactions,
      page,
      limit,
      total: account.transactions.length
    };
  }

  getTransaction(transactionId) {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) {
      throw new Error("Transaction not found");
    }
    return transaction;
  }

  getAccountTransactions(accountId) {
    const account = this.getAccount(accountId);
    return account.transactions;
  }
}

module.exports = BankingService;