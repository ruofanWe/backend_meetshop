const request = require('supertest');
const BankingApp = require('../src/q2-banking/app');

describe('Banking System API Integration Tests', () => {
  let app;
  let account1;
  let account2;

  beforeEach(async () => {
    const bankingApp = new BankingApp();
    app = bankingApp.getApp();

    // Create test accounts
    const res1 = await request(app)
      .post('/accounts')
      .send({ name: 'Test Account 1', initialBalance: 1000 });
    account1 = res1.body;

    const res2 = await request(app)
      .post('/accounts')
      .send({ name: 'Test Account 2', initialBalance: 500 });
    account2 = res2.body;
  });

  describe('Account Management API', () => {
    test('should create and retrieve account', async () => {
      const createRes = await request(app)
        .post('/accounts')
        .send({ name: 'New Account', initialBalance: 100 });

      expect(createRes.status).toBe(201);
      expect(createRes.body.name).toBe('New Account');
      expect(createRes.body.balance).toBe(100);

      const getRes = await request(app)
        .get(`/accounts/${createRes.body.id}`);

      expect(getRes.status).toBe(200);
      expect(getRes.body).toEqual(createRes.body);
    });

    test('should handle validation errors', async () => {
      const res = await request(app)
        .post('/accounts')
        .send({ name: '', initialBalance: -100 });

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });
  });

  describe('Transaction API', () => {
    test('should handle complete transaction flow', async () => {
      // Deposit
      const depositRes = await request(app)
        .post(`/accounts/${account1.id}/deposit`)
        .send({ amount: 500 });

      expect(depositRes.status).toBe(200);
      expect(depositRes.body.balance).toBe(1500);

      // Withdraw
      const withdrawRes = await request(app)
        .post(`/accounts/${account1.id}/withdraw`)
        .send({ amount: 300 });

      expect(withdrawRes.status).toBe(200);
      expect(withdrawRes.body.balance).toBe(1200);

      // Transfer
      const transferRes = await request(app)
        .post('/transfer')
        .send({
          fromAccountId: account1.id,
          toAccountId: account2.id,
          amount: 200
        });

      expect(transferRes.status).toBe(200);
      expect(transferRes.body.fromAccount.balance).toBe(1000);
      expect(transferRes.body.toAccount.balance).toBe(700);
    });

    test('should handle transaction history pagination', async () => {
      // Create multiple transactions
      await request(app)
        .post(`/accounts/${account1.id}/deposit`)
        .send({ amount: 100 });

      await request(app)
        .post(`/accounts/${account1.id}/deposit`)
        .send({ amount: 200 });

      const historyRes = await request(app)
        .get(`/accounts/${account1.id}/transactions`)
        .query({ page: 1, limit: 2 });

      expect(historyRes.status).toBe(200);
      expect(historyRes.body.transactions).toHaveLength(2);
      expect(historyRes.body.page).toBe(1);
      expect(historyRes.body.limit).toBe(2);
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid account IDs', async () => {
      const res = await request(app)
        .post('/accounts/invalid-id/deposit')
        .send({ amount: 100 });

      expect(res.status).toBe(404);
      expect(res.body.error).toBeDefined();
    });

    test('should handle malformed requests', async () => {
      const res = await request(app)
        .post('/accounts')
        .send('{"invalid":json}');

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    test('should handle concurrent operations', async () => {
      const deposits = Array(5).fill().map(() =>
        request(app)
          .post(`/accounts/${account1.id}/deposit`)
          .send({ amount: 100 })
      );

      await Promise.all(deposits);

      const finalAccount = await request(app)
        .get(`/accounts/${account1.id}`);

      expect(finalAccount.body.balance).toBe(1500); // 1000 + (5 * 100)
    });
  });
});