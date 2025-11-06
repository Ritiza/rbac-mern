const User = require('../models/User');

exports.listUsers = async (req,res)=>{
  const users = await User.find().select('-password');
  res.json(users);
};

exports.changeRole = async (req,res)=>{
  const { id } = req.params;
  const { role } = req.body;
  if(!['admin','editor','viewer'].includes(role)) return res.status(400).json({ error:'invalid role' });
  const u = await User.findByIdAndUpdate(id, { role }, { new:true }).select('-password');
  res.json(u);
};
