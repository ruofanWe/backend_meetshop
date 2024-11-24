const BankingService = require('../src/q2-banking/services/BankingService');
const Account = require('../src/q2-banking/models/Account');

describe('BankingService Unit Tests', () => {
  let bankingService;

  beforeEach(() => {
    bankingService = new BankingService();
  });

  describe('Account Management', () => {
    test('should create account with valid data', () => {
      const account = bankingService.createAccount('Test Account', 1000);
      
      expect(account).toBeInstanceOf(Account); // Add type checking
      expect(account.name).toBe('Test Account');
      expect(account.balance).toBe(1000);
      expect(account.id).toBeDefined();
      expect(account.transactions).toHaveLength(1);
    });

    test('should throw error for negative initial balance', () => {
      expect(() => {
        bankingService.createAccount('Test Account', -100);
      }).toThrow('Initial balance cannot be negative');
    });

    test('should throw error for empty account name', () => {
      expect(() => {
        bankingService.createAccount('', 100);
      }).toThrow('Account name is required');
    });
  });

  describe('Transaction Operations', () => {
    let account;

    beforeEach(() => {
      account = bankingService.createAccount('Test Account', 1000);
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

    beforeEach(() => {
      account1 = bankingService.createAccount('Account 1', 1000);
      account2 = bankingService.createAccount('Account 2', 500);
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
      
      const finalAccount1 = bankingService.getAccount(account1.id);
      const finalAccount2 = bankingService.getAccount(account2.id);
      
      expect(finalAccount1.balance).toBe(500); // 1000 - (5 * 100)
      expect(finalAccount2.balance).toBe(1000); // 500 + (5 * 100)
    });
  });
});