const express = require('express');
const router = express.Router();
const { createAccountValidation, amountValidation, transferValidation } = require('../middleware/validation');

module.exports = (bankingService) => {
  router.post("/accounts", createAccountValidation, async (req, res) => {
    try {
      const { name, initialBalance } = req.body;
      const account = await bankingService.createAccount(name, initialBalance);
      res.status(201).json(account);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  router.get("/accounts/:id", async (req, res) => {
    try {
      const account = await bankingService.getAccount(req.params.id);
      res.json(account.toJSON());
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  });

  router.post("/accounts/:id/deposit", amountValidation, async (req, res) => {
    try {
      const result = await bankingService.deposit(req.params.id, req.body.amount);
      res.status(200).json({
        balance: result.account.balance,
        transactions: result.account.transactions
      });
    } catch (error) {
      if (error.message === 'Account not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(400).json({ error: error.message });
      }
    }
  });

  router.post("/accounts/:id/withdraw", amountValidation, async (req, res) => {
    try {
      const result = await bankingService.withdraw(req.params.id, req.body.amount);
      res.status(200).json({
        balance: result.account.balance,
        transactions: [result.transaction]
      });
    } catch (error) {
      if (error.message === 'Account not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(400).json({ error: error.message });
      }
    }
  });

  router.post("/transfer", transferValidation, async (req, res) => {
    try {
      const { fromAccountId, toAccountId, amount } = req.body;
      const result = await bankingService.transfer(fromAccountId, toAccountId, amount);
      res.json({
        fromAccount: { balance: result.fromAccount.balance },
        toAccount: { balance: result.toAccount.balance }
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  router.get("/accounts/:id/transactions", async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const result = await bankingService.getTransactionHistory(req.params.id, parseInt(page), parseInt(limit));
      res.json({
        transactions: result.transactions,
        page: parseInt(page),
        limit: parseInt(limit)
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  return router;
};