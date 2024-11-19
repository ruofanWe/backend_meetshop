const Account = require("../models/Account");

class BankingService {
  constructor() {
    this.accounts = new Map();
    this.locks = new Map();
  }

  async acquireLock(accountId) {
    while (this.locks.get(accountId)) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    this.locks.set(accountId, true);
  }

  releaseLock(accountId) {
    this.locks.delete(accountId);
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
    return account;
  }

  getAccount(accountId) {
    const account = this.accounts.get(accountId);
    if (!account) {
      throw new Error("Account not found");
    }
    return account;
  }

  deposit(accountId, amount) {
    if (amount <= 0) {
      throw new Error("Deposit amount must be positive");
    }

    const account = this.getAccount(accountId);
    account.balance += amount;
    account.addTransaction("deposit", amount);
    return account;
  }

  withdraw(accountId, amount) {
    if (amount <= 0) {
      throw new Error("Withdrawal amount must be positive");
    }

    const account = this.getAccount(accountId);
    if (account.balance < amount) {
      throw new Error("Insufficient funds");
    }

    account.balance -= amount;
    account.addTransaction("withdraw", amount);
    return account;
  }

  async transfer(fromAccountId, toAccountId, amount) {
    try {
      await this.acquireLock(fromAccountId);
      await this.acquireLock(toAccountId);

      if (amount <= 0) {
        throw new Error("Transfer amount must be positive");
      }

      const fromAccount = this.getAccount(fromAccountId);
      const toAccount = this.getAccount(toAccountId);

      if (fromAccount.balance < amount) {
        throw new Error("Insufficient funds");
      }

      fromAccount.balance -= amount;
      toAccount.balance += amount;

      fromAccount.addTransaction("transfer_out", amount, toAccountId);
      toAccount.addTransaction("transfer_in", amount, fromAccountId);

      return { fromAccount, toAccount };
    } catch (error) {
      throw error;
    } finally {
      this.releaseLock(fromAccountId);
      this.releaseLock(toAccountId);
    }
  }
}

module.exports = BankingService;
