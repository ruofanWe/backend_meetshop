const express = require('express');
const BankingService = require('./services/BankingService');

class BankingApp {
    constructor() {
        this.app = express();
        this.bankingService = new BankingService();
        this.setupMiddleware();
        this.setupRoutes();
    }

    setupMiddleware() {
        this.app.use(express.json());
    }

    setupRoutes() {
        // Create account
        this.app.post('/accounts', (req, res) => {
            try {
                const { name, initialBalance } = req.body;
                const account = this.bankingService.createAccount(name, initialBalance);
                res.status(201).json(account);
            } catch (error) {
                res.status(400).json({ error: error.message });
            }
        });

        // Get account
        this.app.get('/accounts/:id', (req, res) => {
            try {
                const account = this.bankingService.getAccount(req.params.id);
                res.json(account);
            } catch (error) {
                res.status(404).json({ error: error.message });
            }
        });

        // Deposit
        this.app.post('/accounts/:id/deposit', (req, res) => {
            try {
                const { amount } = req.body;
                const account = this.bankingService.deposit(req.params.id, amount);
                res.json(account);
            } catch (error) {
                res.status(400).json({ error: error.message });
            }
        });

        // Withdraw
        this.app.post('/accounts/:id/withdraw', (req, res) => {
            try {
                const { amount } = req.body;
                const account = this.bankingService.withdraw(req.params.id, amount);
                res.json(account);
            } catch (error) {
                res.status(400).json({ error: error.message });
            }
        });

        // Transfer
        this.app.post('/transfer', (req, res) => {
            try {
                const { fromAccountId, toAccountId, amount } = req.body;
                const result = this.bankingService.transfer(fromAccountId, toAccountId, amount);
                res.json(result);
            } catch (error) {
                res.status(400).json({ error: error.message });
            }
        });
    }

    start(port = 3000) {
        return this.app.listen(port, () => {
            console.log(`Banking service running on port ${port}`);
        });
    }

    getApp() {
        return this.app;
    }
}

if (require.main === module) {
    const bankingApp = new BankingApp();
    const PORT = process.env.PORT || 3000;
    bankingApp.start(PORT);
}

module.exports = BankingApp;