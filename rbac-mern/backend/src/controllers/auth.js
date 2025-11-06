const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const ACCESS_TTL = process.env.ACCESS_TOKEN_EXPIRES_IN || '15m';

function sign(user){
  return jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: ACCESS_TTL });
}

exports.register = async (req,res)=>{
  try{
    const { name,email,password,role } = req.body;
    const user = new User({ name, email, password, role });
    await user.save();
    res.json({ ok:true });
  }catch(e){ res.status(400).json({ error: e.message }); }
};

exports.login = async (req,res)=>{
  try{
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if(!user || !user.comparePassword(password)) return res.status(401).json({ error:'invalid credentials' });
    const token = sign(user);
    res.json({ accessToken: token, user: { id: user._id, email: user.email, role: user.role } });
  }catch(e){ res.status(500).json({ error: e.message }); }
};

exports.refresh = async (req,res)=>{
  res.status(501).json({ error: 'Not implemented in starter' });
};
