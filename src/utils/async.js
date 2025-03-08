const logger = require("../services/logger");
exports.asyncWrapper = (fn) => {
  return async (req, res, next) => {
    try {
      logger.info(`${req.method} Request to ${req.originalUrl} from ${req.ip}`);
      await fn(req, res, next);
    } catch (err) {
      logger.error(err);
      next(err);
    }
  };
};
