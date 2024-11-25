const BankingService = require('../src/q2-banking/services/BankingService');
const InMemoryAccountRepository = require('../src/q2-banking/repositories/InMemoryAccountRepository');
const InMemoryTransactionRepository = require('../src/q2-banking/repositories/InMemoryTransactionRepository');
const Account = require('../src/q2-banking/models/Account');

describe('BankingService Unit Tests', () => {
  let bankingService;

  beforeEach(() => {
    const accountRepository = new InMemoryAccountRepository();
    const transactionRepository = new InMemoryTransactionRepository();
    bankingService = new BankingService(accountRepository, transactionRepository);
  });

  describe('Account Management', () => {
    test('should create account with valid data', async () => {
      const account = await bankingService.createAccount('Test Account', 1000);
      
      expect(account).toBeInstanceOf(Account);
      expect(account.name).toBe('Test Account');
      expect(account.balance).toBe(1000);
      expect(account.id).toBeDefined();
      expect(account.transactions).toHaveLength(1);
    });

    test('should throw error for negative initial balance', async () => {
      await expect(bankingService.createAccount('Test Account', -100))
        .rejects
        .toThrow('Initial balance cannot be negative');
    });

    test('should throw error for empty account name', async () => {
      await expect(bankingService.createAccount('', 100))
        .rejects
        .toThrow('Account name is required');
    });
  });

  describe('Transaction Operations', () => {
    let account;

    beforeEach(async () => { 
      account = await bankingService.createAccount('Test Account', 1000);
    });

    test('should deposit money successfully', async () => {
      const result = await bankingService.deposit(account.id, 500);
      
      expect(result.account.balance).toBe(1500);
      expect(result.transaction.type).toBe('deposit');
      expect(result.transaction.amount).toBe(500);
    });

    test('should throw error for negative deposit', async () => {
      await expect(bankingService.deposit(account.id, -100))
        .rejects
        .toThrow('Deposit amount must be positive');
    });

    test('should withdraw money successfully', async () => {
      const result = await bankingService.withdraw(account.id, 300);
      
      expect(result.account.balance).toBe(700);
      expect(result.transaction.type).toBe('withdraw');
      expect(result.transaction.amount).toBe(300);
    });

    test('should throw error for insufficient funds', async () => {
      await expect(bankingService.withdraw(account.id, 2000))
        .rejects
        .toThrow('Insufficient funds');
    });
  });

  describe('Transfer Operations', () => {
    let account1, account2;

    beforeEach(async () => {
      account1 = await bankingService.createAccount('Account 1', 1000);
      account2 = await bankingService.createAccount('Account 2', 500);
    });

    test('should transfer money between accounts', async () => {
      const result = await bankingService.transfer(account1.id, account2.id, 300);
      
      expect(result.fromAccount.balance).toBe(700);
      expect(result.toAccount.balance).toBe(800);
      expect(result.transaction.type).toBe('transfer');
    });

    test('should handle concurrent transfers correctly', async () => {
      const transfers = Array(5).fill().map(() => 
        bankingService.transfer(account1.id, account2.id, 100)
      );
    
      await Promise.all(transfers);
      
      const finalAccount1 = await bankingService.getAccount(account1.id);
      const finalAccount2 = await bankingService.getAccount(account2.id);
      
      expect(finalAccount1.balance).toBe(500);
      expect(finalAccount2.balance).toBe(1000);
    });

    test('should not modify balances when transfer fails due to insufficient funds', async () => {
      const initialBalance1 = account1.balance;
      const initialBalance2 = account2.balance;
      
      await expect(bankingService.transfer(account1.id, account2.id, 2000))
        .rejects
        .toThrow('Insufficient funds');

      const finalAccount1 = await bankingService.getAccount(account1.id);
      const finalAccount2 = await bankingService.getAccount(account2.id);

      expect(finalAccount1.balance).toBe(initialBalance1);
      expect(finalAccount2.balance).toBe(initialBalance2);
    });

    test('should not modify balances when transfer fails due to invalid account', async () => {
      const initialBalance1 = account1.balance;
      
      await expect(bankingService.transfer(account1.id, 'invalid-account-id', 500))
        .rejects
        .toThrow('Account not found');

      const finalAccount1 = await bankingService.getAccount(account1.id);

      expect(finalAccount1.balance).toBe(initialBalance1);
    });

    test('should not modify balances when transfer fails due to negative amount', async () => {
      const initialBalance1 = account1.balance;
      const initialBalance2 = account2.balance;
      
      await expect(bankingService.transfer(account1.id, account2.id, -100))
        .rejects
        .toThrow('Transfer amount must be positive');

      const finalAccount1 = await bankingService.getAccount(account1.id);
      const finalAccount2 = await bankingService.getAccount(account2.id);

      expect(finalAccount1.balance).toBe(initialBalance1);
      expect(finalAccount2.balance).toBe(initialBalance2);
    });
  });
});