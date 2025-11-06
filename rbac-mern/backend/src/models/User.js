const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: String,
  email: {type:String, unique:true},
  password: String,
  role: {type:String, default: 'viewer'},
  createdAt: {type:Date, default: Date.now}
});

userSchema.methods.comparePassword = function(pw){
  return bcrypt.compareSync(pw, this.password);
};

userSchema.pre('save', function(next){
  if(!this.isModified('password')) return next();
  this.password = require('bcryptjs').hashSync(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
