const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 400;
    res.status(statusCode).json({
      error: err.message
    });
  };
  
  module.exports = errorHandler;