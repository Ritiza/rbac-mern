const jwt = require('jsonwebtoken');
const rolesConfig = require('../utils/roles');

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

function authenticate(req,res,next){
  const header = req.headers.authorization;
  if(!header) return res.status(401).json({ error:'no token' });
  const token = header.split(' ')[1];
  try{
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { userId: payload.userId, role: payload.role };
    next();
  }catch(e){ return res.status(401).json({ error:'invalid token' }); }
}

function can(cap){
  return [authenticate, (req,res,next)=>{
    const allowed = rolesConfig[req.user.role] || [];
    if(allowed.includes(cap) || allowed.includes('*')) return next();
    // ownership checks are done in controllers via ownershipFilter
    return res.status(403).json({ error:'forbidden' });
  }];
}

module.exports = { authenticate, can };
