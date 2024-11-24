const Account = require("../models/Account");
const Transaction = require("../models/transaction");

class BankingService {
  constructor() {
    this.accounts = new Map();
    this.transactions = new Map();
    this.locks = new Map();
  }

  async acquireLock(accountId) {
    while (this.locks.get(accountId)) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    this.locks.set(accountId, true);
  }

  releaseLock(accountId) {
    this.locks.delete(accountId);
  }

  async acquireMultipleLocks(accountIds) {
    const sortedIds = [...new Set(accountIds)].sort();
    for (const id of sortedIds) {
      await this.acquireLock(id);
    }
  }

  releaseMultipleLocks(accountIds) {
    const sortedIds = [...new Set(accountIds)].sort();
    for (const id of sortedIds) {
      this.releaseLock(id);
    }
  }

  createAccount(name, initialBalance = 0) {
    if (initialBalance < 0) {
      throw new Error("Initial balance cannot be negative");
    }
    if (!name) {
      throw new Error("Account name is required");
    }

    const account = new Account(name, initialBalance);
    this.accounts.set(account.id, account);

    // 建立初始交易記錄
    if (initialBalance > 0) {
      const transaction = new Transaction(
        "deposit",
        initialBalance,
        account.id
      );
      transaction.setBalanceChange(account.id, 0, initialBalance);
      transaction.complete();
      this.transactions.set(transaction.id, transaction);
      account.addTransactionReference(transaction);
    }

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
    if (amount <= 0) {
      throw new Error("Deposit amount must be positive");
    }

    try {
      await this.acquireLock(accountId);

      const account = this.getAccount(accountId);
      const transaction = new Transaction("deposit", amount, accountId);
      
      const beforeBalance = account.balance;
      account.balance += amount;
      
      transaction.setBalanceChange(accountId, beforeBalance, account.balance);
      transaction.complete();
      
      this.transactions.set(transaction.id, transaction);
      account.addTransactionReference(transaction);

      return { account, transaction };
    } finally {
      this.releaseLock(accountId);
    }
  }

  async withdraw(accountId, amount) {
    if (amount <= 0) {
      throw new Error("Withdrawal amount must be positive");
    }

    try {
      await this.acquireLock(accountId);

      const account = this.getAccount(accountId);
      if (account.balance < amount) {
        throw new Error("Insufficient funds");
      }

      const transaction = new Transaction("withdraw", amount, accountId);
      
      const beforeBalance = account.balance;
      account.balance -= amount;
      
      transaction.setBalanceChange(accountId, beforeBalance, account.balance);
      transaction.complete();
      
      this.transactions.set(transaction.id, transaction);
      account.addTransactionReference(transaction);

      return { account, transaction };
    } finally {
      this.releaseLock(accountId);
    }
  }

  async transfer(fromAccountId, toAccountId, amount) {
    if (amount <= 0) {
      throw new Error("Transfer amount must be positive");
    }
    if (fromAccountId === toAccountId) {
      throw new Error("Cannot transfer to the same account");
    }

    try {
      await this.acquireMultipleLocks([fromAccountId, toAccountId]);

      const fromAccount = this.getAccount(fromAccountId);
      const toAccount = this.getAccount(toAccountId);

      if (fromAccount.balance < amount) {
        throw new Error("Insufficient funds");
      }

      const transaction = new Transaction(
        "transfer",
        amount,
        fromAccountId,
        toAccountId
      );

      try {
        const fromBeforeBalance = fromAccount.balance;
        fromAccount.balance -= amount;
        transaction.setBalanceChange(
          fromAccountId,
          fromBeforeBalance,
          fromAccount.balance
        );

        const toBeforeBalance = toAccount.balance;
        toAccount.balance += amount;
        transaction.setBalanceChange(
          toAccountId,
          toBeforeBalance,
          toAccount.balance
        );

        transaction.complete();

        this.transactions.set(transaction.id, transaction);
        fromAccount.addTransactionReference(transaction);
        toAccount.addTransactionReference(transaction);

        return {
          transaction,
          fromAccount,
          toAccount
        };
      } catch (error) {
        transaction.fail(error.message);
        this.transactions.set(transaction.id, transaction);
        throw error;
      }
    } finally {
      this.releaseMultipleLocks([fromAccountId, toAccountId]);
    }
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

module.exports = { BankingService };