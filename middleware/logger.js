const logger = require('../logger');


module.exports = (req, res, next) => {
    req.logger = logger;
    const start = Date.now();

    req.logger.info(`Início da requisição ${req.method} ${req.url}`);
  
    res.on('finish', () => {
      const duration = Date.now() - start;
      req.logger.info(`Fim da requisição ${req.method} ${req.url} - Status: ${res.statusCode} - Tempo: ${duration}ms`);
    });

    next();
};

