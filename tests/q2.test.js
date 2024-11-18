const request = require('supertest');
const BankingApp = require('../src/q2-banking/app');

describe('Banking System API', () => {
    let app;
    let account1;
    let account2;

    beforeEach(async () => {
        const bankingApp = new BankingApp();
        app = bankingApp.getApp();

        const res1 = await request(app)
            .post('/accounts')
            .send({ name: 'Test Account 1', initialBalance: 1000 });
        account1 = res1.body;

        const res2 = await request(app)
            .post('/accounts')
            .send({ name: 'Test Account 2', initialBalance: 500 });
        account2 = res2.body;
    });

    describe('Account Management', () => {
        test('should create new account', async () => {
            const res = await request(app)
                .post('/accounts')
                .send({ name: 'New Account', initialBalance: 100 });
            
            expect(res.status).toBe(201);
            expect(res.body.name).toBe('New Account');
            expect(res.body.balance).toBe(100);
        });

        test('should not create account with negative balance', async () => {
            const res = await request(app)
                .post('/accounts')
                .send({ name: 'Invalid Account', initialBalance: -100 });
            
            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Initial balance cannot be negative');
        });
    });

    describe('Transactions', () => {
        test('should deposit money', async () => {
            const res = await request(app)
                .post(`/accounts/${account1.id}/deposit`)
                .send({ amount: 500 });
            
            expect(res.status).toBe(200);
            expect(res.body.balance).toBe(1500);
            expect(res.body.transactions).toHaveLength(1);
            expect(res.body.transactions[0].type).toBe('deposit');
        });

        test('should withdraw money', async () => {
            const res = await request(app)
                .post(`/accounts/${account1.id}/withdraw`)
                .send({ amount: 300 });
            
            expect(res.status).toBe(200);
            expect(res.body.balance).toBe(700);
            expect(res.body.transactions).toHaveLength(1);
            expect(res.body.transactions[0].type).toBe('withdraw');
        });

        test('should transfer money between accounts', async () => {
            const res = await request(app)
                .post('/transfer')
                .send({
                    fromAccountId: account1.id,
                    toAccountId: account2.id,
                    amount: 300
                });
            
            expect(res.status).toBe(200);
            expect(res.body.fromAccount.balance).toBe(700);
            expect(res.body.toAccount.balance).toBe(800);
        });

        test('should not allow transfer with insufficient funds', async () => {
            const res = await request(app)
                .post('/transfer')
                .send({
                    fromAccountId: account1.id,
                    toAccountId: account2.id,
                    amount: 2000
                });
            
            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Insufficient funds');
        });
    });
});