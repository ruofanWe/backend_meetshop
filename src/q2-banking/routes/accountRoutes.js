const express = require("express");
const router = express.Router();
const {
  createAccountValidation,
  amountValidation,
  transferValidation,
} = require("../middleware/validation");

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

  router.post("/accounts/:id/withdraw", amountValidation, async (req, res) => {
    try {
      const { amount } = req.body;
      const account = await bankingService.withdraw(req.params.id, amount);
      res.json(account);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  router.post("/accounts/:id/deposit", amountValidation, async (req, res) => {
    try {
      const { amount } = req.body;
      const account = await bankingService.deposit(req.params.id, amount);
      res.json(account);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  router.post("/transfer", transferValidation, async (req, res) => {
    try {
      const { fromAccountId, toAccountId, amount } = req.body;
      const result = await bankingService.transfer(
        fromAccountId,
        toAccountId,
        amount
      );
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  router.get("/accounts/:id/transactions", async (req, res) => {
    try {
      const account = await bankingService.getAccount(req.params.id);
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const start = (page - 1) * limit;
      const transactions = account.transactions.slice(start, start + limit);

      res.json({
        transactions,
        page,
        limit,
        total: account.transactions.length,
      });
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  });

  return router;
};
