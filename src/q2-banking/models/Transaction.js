const { v4: uuidv4 } = require("uuid");

class Transaction {
  constructor(type, amount, sourceAccountId, targetAccountId = null) {
    this.id = uuidv4();
    this.type = type;
    this.amount = amount;
    this.sourceAccountId = sourceAccountId;
    this.targetAccountId = targetAccountId;
    this.timestamp = new Date();
    this.status = "pending";
    this.balanceChanges = new Map(); // 紀錄每個帳戶的餘額變更
  }

  setBalanceChange(accountId, beforeBalance, afterBalance) {
    this.balanceChanges.set(accountId, {
      before: beforeBalance,
      after: afterBalance
    });
  }

  complete() {
    this.status = "completed";
    this.completedAt = new Date();
  }

  fail(reason) {
    this.status = "failed";
    this.failureReason = reason;
    this.failedAt = new Date();
  }
}

module.exports = Transaction;