const Account = require('../models/Account');
const Transaction = require('../models/Transaction');

class BankingService {
  constructor(accountRepository, transactionRepository) {
    if (!accountRepository) {
      throw new Error('AccountRepository is required');
    }
    if (!transactionRepository) {
      throw new Error('TransactionRepository is required');
    }
    
    this.accountRepository = accountRepository;
    this.transactionRepository = transactionRepository;
  }

  async acquireLock(accountId, maxRetries = 50) {
    const account = await this.accountRepository.findById(accountId);
    if (!account) {
      throw new Error('Account not found');
    }

    let retries = 0;
    while (!account.acquireLock()) {
      if (retries >= maxRetries) {
        throw new Error('Lock acquisition timeout');
      }
      await new Promise(resolve => setTimeout(resolve, 50));
      retries++;
    }
    return account;
  }

  async releaseLock(account) {
    account.releaseLock();
  }


  /**
   * Acquires locks for multiple accounts in sorted order to prevent deadlocks.
   * Always locks accounts in the same order regardless of input order.
   */
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
      const account = await this.accountRepository.findById(id);
      if (account) {
        account.releaseLock();
      }
    }
  }

  async createAccount(name, initialBalance = 0) {
    if (!name) {
      throw new Error('Account name is required');
    }
    if (initialBalance < 0) {
      throw new Error('Initial balance cannot be negative');
    }
  
    const account = new Account(name, initialBalance);
    await this.accountRepository.save(account);
    
    if (initialBalance > 0) {
      const transaction = new Transaction('deposit', initialBalance, account.id);
      await this.transactionRepository.save(transaction);
      account.addTransactionReference(transaction);
      await this.accountRepository.update(account);
    }
  
    return account;
  }

  async getAccount(accountId) {
    const account = await this.accountRepository.findById(accountId);
    if (!account) {
      throw new Error("Account not found");
    }
    return account;
  }

  async deposit(accountId, amount) {
    const lock = await this.acquireLock(accountId);
    try {
      const account = await this.accountRepository.findById(accountId);
      if (!account) {
        throw new Error('Account not found');
      }
  
      if (amount <= 0) {
        throw new Error('Deposit amount must be positive');
      }
  
      account.balance += amount;
      const transaction = new Transaction('deposit', amount, accountId);
      
      await this.transactionRepository.save(transaction);
      account.addTransactionReference(transaction);
      await this.accountRepository.update(account);
  
      return { 
        account: account,
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
  
      const account = await this.accountRepository.findById(accountId);
      if (!account) {
        throw new Error("Account not found");
      }
  
      if (account.balance < amount) {
        throw new Error("Insufficient funds");
      }
  
      account.balance -= amount;
      const transaction = new Transaction("withdraw", amount, accountId);
      
      await this.transactionRepository.save(transaction);
      account.addTransactionReference(transaction);
      await this.accountRepository.update(account);
  
      return { 
        account,
        transaction 
      };
    } finally {
      await this.releaseLock(lock);
    }
  }

  async transfer(fromAccountId, toAccountId, amount) {
    const locks = await this.acquireMultipleLocks([fromAccountId, toAccountId]);
    try {
      // Add this check first
      if (amount <= 0) {
        throw new Error('Transfer amount must be positive');
      }
  
      const fromAccount = await this.accountRepository.findById(fromAccountId);
      const toAccount = await this.accountRepository.findById(toAccountId);
  
      if (!fromAccount || !toAccount) {
        throw new Error('Account not found');
      }
  
      if (fromAccount.balance < amount) {
        throw new Error('Insufficient funds');
      }
  
      const transaction = new Transaction('transfer', amount, fromAccountId, toAccountId);
      
      fromAccount.balance -= amount;
      toAccount.balance += amount;
  
      await this.transactionRepository.save(transaction);
      fromAccount.addTransactionReference(transaction);
      toAccount.addTransactionReference(transaction);
      
      await this.accountRepository.update(fromAccount);
      await this.accountRepository.update(toAccount);
  
      transaction.complete();
  
      return {
        fromAccount,
        toAccount,
        transaction
      };
    } finally {
      await this.releaseMultipleLocks(locks);
    }
  }

  async getTransactionHistory(accountId, page = 1, limit = 10) {
    const account = await this.accountRepository.findById(accountId);
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

  async getTransaction(transactionId) {
    const transaction = await this.transactionRepository.findById(transactionId);
    if (!transaction) {
      throw new Error("Transaction not found");
    }
    return transaction;
  }

  async getAccountTransactions(accountId) {
    const account = await this.getAccount(accountId);
    return account.transactions;
  }
}

module.exports = BankingService;