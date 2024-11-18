const Account = require('../models/Account');

class BankingService {
    constructor() {
        this.accounts = new Map();
    }

    createAccount(name, initialBalance = 0) {
        if (initialBalance < 0) {
            throw new Error('Initial balance cannot be negative');
        }
        if (!name) {
            throw new Error('Account name is required');
        }

        const account = new Account(name, initialBalance);
        this.accounts.set(account.id, account);
        return account;
    }

    getAccount(accountId) {
        const account = this.accounts.get(accountId);
        if (!account) {
            throw new Error('Account not found');
        }
        return account;
    }

    deposit(accountId, amount) {
        if (amount <= 0) {
            throw new Error('Deposit amount must be positive');
        }

        const account = this.getAccount(accountId);
        account.balance += amount;
        account.addTransaction('deposit', amount);
        return account;
    }

    withdraw(accountId, amount) {
        if (amount <= 0) {
            throw new Error('Withdrawal amount must be positive');
        }

        const account = this.getAccount(accountId);
        if (account.balance < amount) {
            throw new Error('Insufficient funds');
        }

        account.balance -= amount;
        account.addTransaction('withdraw', amount);
        return account;
    }

    transfer(fromAccountId, toAccountId, amount) {
        if (amount <= 0) {
            throw new Error('Transfer amount must be positive');
        }

        const fromAccount = this.getAccount(fromAccountId);
        const toAccount = this.getAccount(toAccountId);

        if (fromAccount.balance < amount) {
            throw new Error('Insufficient funds');
        }

        try {
            fromAccount.balance -= amount;
            toAccount.balance += amount;
            
            fromAccount.addTransaction('transfer_out', amount, toAccountId);
            toAccount.addTransaction('transfer_in', amount, fromAccountId);
            
            return { fromAccount, toAccount };
        } catch (error) {
            fromAccount.balance += amount;
            toAccount.balance -= amount;
            throw error;
        }
    }
}

module.exports = BankingService;