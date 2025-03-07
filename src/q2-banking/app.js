const express = require("express");
const BankingService = require("./services/BankingService");
const InMemoryAccountRepository = require('./repositories/InMemoryAccountRepository');
const InMemoryTransactionRepository = require('./repositories/InMemoryTransactionRepository');
const errorHandler = require("./middleware/errorHandler");
const requestLogger = require("./middleware/logger");

class BankingApp {
  constructor() {
    this.app = express();
    const accountRepository = new InMemoryAccountRepository();
    const transactionRepository = new InMemoryTransactionRepository();
    this.bankingService = new BankingService(
      accountRepository,
      transactionRepository
    );
    
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    this.app.use(requestLogger); 
    this.app.use(express.json());
    this.app.use(errorHandler); 
  }

  setupRoutes() {
    const accountRoutes = require("./routes/accountRoutes")(
      this.bankingService
    );
    this.app.use("/", accountRoutes);
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
