const { body, validationResult } = require("express-validator");

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: errors.array()[0].msg,
    });
  }
  next();
};

const createAccountValidation = [
  body("name").notEmpty().trim(),
  body("initialBalance")
    .optional()
    .isFloat()
    .custom((value) => {
      if (value < 0) {
        throw new Error("Initial balance cannot be negative");
      }
      return true;
    }),
  validateRequest,
];

const amountValidation = [
  body("amount").isFloat({ min: 0.01 }),
  validateRequest,
];

const transferValidation = [
  body("fromAccountId").notEmpty(),
  body("toAccountId").notEmpty(),
  body("amount").isFloat({ min: 0.01 }),
  validateRequest,
];

module.exports = {
  validateRequest,
  createAccountValidation,
  amountValidation,
  transferValidation,
};
