const { v4: uuidv4 } = require('uuid');
exports.requestLogger = (req,res,next)=>{
  req.correlationId = uuidv4();
  console.log(`[${req.correlationId}] ${req.method} ${req.originalUrl}`);
  next();
};
